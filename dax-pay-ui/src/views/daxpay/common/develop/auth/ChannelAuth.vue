<template>
  <div
    style="
      display: flex;
      margin: 20px;
      flex-direction: column;
      align-items: center;
      background: white;
      padding: 15px;
    "
  >
    <a-alert style="width: 400px" message="请选择参数后生成授权链接进行扫码" type="info" />
    <a-form class="small-from-item mt-15px mb-15px" ref="formRef" :model="form">
      <a-form-item label="商户应用" name="appId">
        <a-select
          style="width: 320px"
          :filter-option="search"
          :options="mchAppList"
          v-model:value="form.appId"
          placeholder="请选择商户应用"
        />
      </a-form-item>
      <a-form-item label="对账通道" name="channel" v-show="form.appId">
        <a-input-group compact>
          <a-select
            style="width: calc(100% - 60px)"
            v-model:value="form.channel"
            :options="channels"
            placeholder="请选择对账通道"
          />
          <a-button
            :loading="loading"
            :disabled="!form.channel"
            style="margin-top: 15px"
            type="primary"
            @click="getUrl"
            >生成链接</a-button
          >
        </a-input-group>
      </a-form-item>
    </a-form>
    <qr-code
      style="margin-bottom: 20px"
      :options="{ margin: 0 }"
      :width="250"
      :value="authUrl.authUrl"
      v-show="authUrl.authUrl"
    />
    <a-form>
      <a-form-item label="OpenId" v-show="authResult.openId">
        <a-input v-model:value="authResult.openId" disabled style="width: 300px" />
        <a-button type="primary" :disabled="!authResult.openId" @click="copy(authResult.openId)"
          >复制</a-button
        >
      </a-form-item>
      <a-form-item label="用户ID" v-show="authResult.userId">
        <a-input v-model:value="authResult.userId" disabled style="width: 300px" />
        <a-button type="primary" @click="copy(authResult.userId)">复制</a-button>
      </a-form-item>
      <a-form-item label="AccessToken" v-show="authResult.accessToken">
        <a-input v-model:value="authResult.accessToken" disabled style="width: 300px" />
        <a-button type="primary" @click="copy(authResult.accessToken)">复制</a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup lang="ts">
  import { onMounted, ref } from 'vue'
  import { useIntervalFn } from '@vueuse/shared'
  import { FormInstance } from 'ant-design-vue/lib/form'
  import { LabeledValue } from 'ant-design-vue/lib/select'
  import QrCode from '@/components/Qrcode/src/Qrcode.vue'
  import { copyText } from '@/utils/copyTextToClipboard'
  import { useMessage } from '@/hooks/web/useMessage'
  import {
    AuthResult,
    AuthUrlResult,
    generateAuthUrl,
    GenerateAuthUrlParam,
    queryAuthResult,
  } from './ChannelAuth.api'
  import useFormEdit from '@/hooks/bootx/useFormEdit'
  import { mchAppDropdown } from '@/views/daxpay/common/merchant/app/MchApp.api'
  import { useDict } from '@/hooks/bootx/useDict'
  import { ChannelAuthStatusEnum } from '@/enums/daxpay/channelEnum'

  const { createMessage } = useMessage()
  const { dictDropDown } = useDict()
  const { search } = useFormEdit()

  const channels = ref<LabeledValue[]>([])
  const mchAppList = ref<LabeledValue[]>([])

  const formRef = ref<FormInstance>()
  const form = ref<GenerateAuthUrlParam>({})
  const authResult = ref<AuthResult>({})
  const authUrl = ref<AuthUrlResult>({ authUrl: '' })
  let loading = ref(false)
  let pause: any = () => {}

  onMounted(() => {
    initData()
  })

  /**
   * 初始化数据
   */
  async function initData() {
    // 通道
    channels.value = await dictDropDown('channel')
    initMchApp()
  }

  /**
   * 商户变动时刷新应用列表
   */
  function initMchApp() {
    mchAppDropdown().then(({ data }) => {
      mchAppList.value = data
    })
  }

  /**
   * 复制
   */
  function copy(value) {
    copyText(value)
  }

  /**
   * 扫码授权链接
   */
  function getUrl() {
    pause()
    authResult.value = {}
    loading.value = true
    authUrl.value = {}
    generateAuthUrl(form.value)
      .then((res) => {
        authUrl.value = res.data
        query()
      })
      .finally(() => {
        loading.value = false
      })
  }

  /**
   * 查询
   */
  function query() {
    pause()
    let intervalFn = useIntervalFn(
      () => {
        queryAuthResult(authUrl.value.queryCode)
          .then((res) => {
            authResult.value = res.data
            // 成功
            if (authResult.value.status === ChannelAuthStatusEnum.SUCCESS) {
              createMessage.success('获取授权结果成功')
              pause()
            }
            if (authResult.value.status === ChannelAuthStatusEnum.NOT_EXIST) {
              createMessage.error('获取授权结果失败')
              pause()
            }
          })
          .catch((err) => {
            // 失败
            createMessage.error(err.message)
            pause()
          })
      },
      1000 * 3,
      { immediate: false },
    )
    pause = intervalFn.pause
    intervalFn.resume()
  }
</script>
<style scoped lang="less"></style>
