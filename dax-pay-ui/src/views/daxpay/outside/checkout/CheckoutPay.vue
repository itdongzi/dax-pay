<template>
  <div>
    <!--  云闪付表单方式专用  -->
    <div v-html="payForm"></div>
    <div class="page pay">
      <div class="blog-container" id="container">
        <a-spin :spinning="loading">
          <div class="content" style="padding-top: 70px">
            <div style="width: 100%">
              <div class="pay-type-content" style="display: flex; height: 300px">
                <div style="width: 50%">
                  <div class="pay-type-name">支付信息</div>
                  <a-form>
                    <div class="pay-form-item">
                      <label>标题：</label>
                      <span>
                        {{ orderAndConfig.order.title }}
                      </span>
                    </div>
                    <div class="pay-form-item">
                      <label>商户订单号：</label>
                      <span>
                        {{ orderAndConfig.order.bizOrderNo }}
                      </span>
                    </div>
                    <div class="pay-form-item">
                      <label>订单号：</label>
                      <span>
                        {{ orderAndConfig.order.orderNo }}
                      </span>
                    </div>
                    <div class="pay-form-item">
                      <label>描述：</label>
                      <span>
                        {{ orderAndConfig.order.description }}
                      </span>
                    </div>
                  </a-form>
                </div>
                <div
                  style="width: 50%; display: flex; flex-direction: column; align-items: center"
                  v-if="aggregateUrl"
                >
                  <a-alert
                    message="请使用支付宝、微信等应用扫码支付"
                    type="info"
                    style="width: 250px; margin-bottom: 10px"
                  />
                  <a-qrcode :value="aggregateUrl" :size="200" />
                  <a-button style="margin-top: 10px" @click="barPayShow(true)"
                    >付款码支付(聚合)</a-button
                  >
                </div>
              </div>
              <div class="pay-type-content" style="height: 350px">
                <a-tabs v-model:activeKey="activeKey" type="card">
                  <a-tab-pane
                    v-for="group in orderAndConfig.groupConfigs"
                    :key="group.id"
                    :tab="group.name"
                  >
                    <div class="pay-type-body">
                      <div
                        @click="() => (currentItem = config)"
                        v-for="config in group.items"
                        :key="config.id"
                      >
                        <div :class="config.id === currentItem.id ? 'colorChange' : 'payType'">
                          <span class="color-change">{{ config.name }}</span>
                        </div>
                      </div>
                    </div>
                  </a-tab-pane>
                </a-tabs>
              </div>
              <div style="margin-top: 20px; text-align: right">
                <span style="color: #fd482c; font-size: 18px; padding-right: 10px"
                  >{{ '¥ ' + orderAndConfig.order.amount }} 元</span
                >
                <a-button type="primary" :disabled="!currentItem" @click="pay">立即支付</a-button>
              </div>
            </div>
          </div>
        </a-spin>
      </div>
      <checkout-bar-code ref="cashierBarCode" @ok="barPay" />
      <checkout-qr-code ref="cashierQrCode" />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useRoute } from 'vue-router'
  import { nextTick, onMounted, ref } from 'vue'
  import {
    aggregateBarPay,
    AggregateBarPayParam,
    CheckoutItemConfigResult,
    CheckoutOrderAndConfigResult,
    checkoutPay,
    CheckoutPayParam,
    findStatusByOrderNo,
    getCheckoutUrl,
    getOrderAndConfig,
  } from './CheckoutPay.api'
  import { CheckoutCallTypeEnum, CheckoutTypeEnum } from '@/enums/daxpay/channelEnum'
  import { useMessage } from '@/hooks/web/useMessage'
  import { PayResult } from '@/views/daxpay/common/develop/trade/DevelopTrade.api'
  import { useIntervalFn } from '@vueuse/shared'
  import CheckoutBarCode from './CheckoutBarCode.vue'
  import CheckoutQrCode from './CheckoutQrCode.vue'

  const route = useRoute()

  const { orderNo } = route.params
  const activeKey = ref<string>()
  const { createMessage } = useMessage()

  let payForm = ref<string>()
  const aggregateUrl = ref('')

  const cashierQrCode = ref<any>()
  const cashierBarCode = ref<any>()

  // 当前选择支付渠道和方式
  let currentItem = ref<CheckoutItemConfigResult>({})

  const loading = ref(false)
  const orderAndConfig = ref<CheckoutOrderAndConfigResult>({
    order: {},
    config: {},
    groupConfigs: [],
  })

  // 检查支付状态
  const { pause, resume } = useIntervalFn(
    () => {
      findStatusByOrderNo(orderNo as string)
        .then((res) => {
          // 成功
          if (res.data) {
            createMessage.success('支付成功')
            handleCancel()
          }
        })
        .catch(() => {
          // 失败
          handleCancel()
        })
    },
    1000 * 3,
    { immediate: false },
  )

  /**
   * 初始化
   */
  onMounted(() => {
    resume()
    initData()
  })

  /**
   * 初始化数据
   */
  async function initData() {
    // 获取收银台配置
    await getOrderAndConfig(orderNo, CheckoutTypeEnum.PC).then(({ data }) => {
      orderAndConfig.value = data
      activeKey.value = orderAndConfig.value.groupConfigs?.[0].id
      currentItem.value = orderAndConfig.value.groupConfigs?.[0]
        .items?.[0] as CheckoutItemConfigResult
    })
    // 是否同时显示聚合支付码
    if (orderAndConfig.value.config.aggregateShow) {
      getCheckoutUrl(orderNo, CheckoutTypeEnum.AGGREGATE).then(({ data }) => {
        aggregateUrl.value = data
      })
    }
  }

  /**
   * 条码支付框显示
   */
  function barPayShow(aggregate) {
    cashierBarCode.value.init(aggregate)
  }

  /**
   * 发起支付
   */
  function pay() {
    // 条码支付
    if (CheckoutCallTypeEnum.BAR_CODE === currentItem.value.callType) {
      barPayShow(false)
      return
    }

    loading.value = true
    const from = {
      orderNo,
      itemId: currentItem.value.id,
    } as CheckoutPayParam
    checkoutPay(from).then(({ data }) => {
      loading.value = false
      payCall(data)
    })
  }

  /**
   * 支付调起操作
   */
  function payCall(data: PayResult) {
    // 支付调起类型
    switch (currentItem.value.callType) {
      // 跳转到支付页面
      case CheckoutCallTypeEnum.LINK: {
        window.location.href = data.payBody as string
        break
      }
      // 本地提交提交支付表单
      case CheckoutCallTypeEnum.FROM: {
        payForm.value = data.payBody
        nextTick(() => {
          console.log(document.forms[0])
          document.forms[0].submit()
        })
        break
      }
      // 扫码支付
      case CheckoutCallTypeEnum.QR_CODE: {
        cashierQrCode.value.init(data.payBody)
        break
      }
      default: {
        createMessage.warning('暂不支持该支付方式')
      }
    }
  }

  /**
   * 条码支付
   */
  function barPay(barCode: string, aggregate: boolean) {
    if (aggregate) {
      const param = {
        orderNo,
        barCode,
      } as AggregateBarPayParam
      aggregateBarPay(param).then(() => {
        cashierBarCode.value.handleClose()
      })
    } else {
      const param = {
        orderNo,
        itemId: currentItem.value,
        barCode,
      } as CheckoutPayParam
      checkoutPay(param).then(() => {
        cashierBarCode.value.handleClose()
      })
    }
  }

  /**
   * 关闭
   */
  function handleCancel() {
    cashierQrCode.value.handleClose()
    cashierBarCode.value.handleClose()
    loading.value = false
    pause()
  }
</script>

<style scoped lang="less">
  @import 'style.less';
</style>
