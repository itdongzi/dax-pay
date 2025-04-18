<template>
  <div>
    <div class="m-3 p-3 pt-5 bg-white">
      <b-query
        :query-params="model.queryParam"
        :fields="fields"
        :default-item-count="3"
        @query="queryPage"
        @reset="resetQueryParams"
      />
    </div>
    <div class="m-3 p-3 bg-white">
      <vxe-toolbar ref="xToolbar" custom :refresh="{ queryMethod: queryPage }">
        <template #buttons>
          <a-space>
            <a-button type="primary" pre-icon="ant-design:plus-outlined" @click="add"
              >新建</a-button
            >
          </a-space>
        </template>
      </vxe-toolbar>
      <div class="h-65vh">
        <vxe-table
          height="auto"
          ref="xTable"
          key-field="id"
          :data="pagination.records"
          :loading="loading"
        >
          <vxe-column type="seq" width="60" />
          <vxe-column field="appId" title="应用号" :min-width="100">
            <template #default="{ row }">
              <a-link @click="show(row)">{{ row.appId }}</a-link>
            </template>
          </vxe-column>
          <vxe-column field="appName" title="应用名称" :min-width="100" />
          <vxe-column field="signType" title="签名方式" :min-width="150">
            <template #default="{ row }">
              <a-tag>{{ dictConvert('sign_type', row.signType) || '空' }}</a-tag>
            </template>
          </vxe-column>
          <vxe-column field="notifyType" title="通知类型" :min-width="100">
            <template #default="{ row }">
              <a-tag>{{ dictConvert('merchant_notify_type', row.notifyType) || '空' }}</a-tag>
            </template>
          </vxe-column>
          <vxe-column field="status" title="应用状态" :min-width="100">
            <template #default="{ row }">
              <a-tag>{{ dictConvert('mch_app_status', row.status) || '空' }}</a-tag>
            </template>
          </vxe-column>
          <vxe-column field="notifyUrl" title="通知地址" :min-width="220" />
          <vxe-column field="createTime" title="创建时间" :min-width="120" />
          <vxe-column fixed="right" :width="220" :showOverflow="false" title="操作">
            <template #default="{ row }">
              <a-link @click="edit(row)">编辑</a-link>
              <a-divider type="vertical" />
              <a-link @click="showChannelSetup(row)">通道配置</a-link>
              <a-divider type="vertical" />
              <a-dropdown>
                <a style="color: red">
                  其他配置 <Icon icon="ant-design:down-outlined" :size="12" />
                </a>
                <template #overlay>
                  <a-menu>
                    <a-menu-item>
                      <a-link @click="showNotifyConfig(row)">订阅配置</a-link>
                    </a-menu-item>
                    <a-menu-item>
                      <a-link @click="showAllocConfig(row)">分账配置</a-link>
                    </a-menu-item>
                    <a-menu-item>
                      <a-link @click="showCheckoutConfig(row)">收银台配置</a-link>
                    </a-menu-item>
                    <a-menu-item>
                      <a-link @click="showCashierCode(row)">码牌配置</a-link>
                    </a-menu-item>
                    <a-menu-item>
                      <a-link danger @click="remove(row)">删除应用</a-link>
                    </a-menu-item>
                  </a-menu>
                </template>
              </a-dropdown>
            </template>
          </vxe-column>
        </vxe-table>
      </div>
      <vxe-pager
        size="medium"
        :loading="loading"
        :current-page="pagination.current"
        :page-size="pagination.size"
        :total="pagination.total"
        @page-change="handleTableChange"
      />
      <mch-app-edit ref="mchApp" @ok="queryPage" />
      <channel-config-list ref="channelSetup" />
      <MerchantNotifyConfigList ref="merchantNotifyConfigList" />
      <CashierCodeConfigList ref="cashierCodeConfigList" />
      <CheckoutConfigModel ref="checkoutConfigModel" />
      <AllocationConfigModel ref="allocationConfigModel" />
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { computed, onMounted, ref } from 'vue'
  import { del, page } from './MchApp.api'
  import useTablePage from '@/hooks/bootx/useTablePage'
  import MchAppEdit from './MchAppEdit.vue'
  import BQuery from '@/components/Bootx/Query/BQuery.vue'
  import { QueryField, STRING } from '@/components/Bootx/Query/Query'
  import { FormEditType } from '@/enums/formTypeEnum'
  import { useMessage } from '@/hooks/web/useMessage'
  import { VxeTableInstance, VxeToolbarInstance } from 'vxe-table'
  import ALink from '@/components/Link/Link.vue'
  import { useDict } from '@/hooks/bootx/useDict'
  import ChannelConfigList from '@/views/daxpay/common/merchant/channel/ChannelConfigList.vue'
  import MerchantNotifyConfigList from '@/views/daxpay/common/merchant/notify/MerchantNotifyConfigList.vue'
  import Icon from '@/components/Icon/Icon.vue'
  import CashierCodeConfigList from '@/views/daxpay/common/config/cashier/code/CashierCodeConfigList.vue'
  import CheckoutConfigModel from '@/views/daxpay/common/config/checkout/CheckoutConfigModel.vue'
  import AllocationConfigModel from '@/views/daxpay/common/allocation/AllocationConfigModel.vue'

  // 使用hooks
  const {
    handleTableChange,
    pageQueryResHandel,
    resetQueryParams,
    pagination,
    pages,
    model,
    loading,
  } = useTablePage(queryPage)
  const { createMessage, createConfirm } = useMessage()
  const { dictConvert } = useDict()
  // 查询条件
  const fields = computed(() => {
    return [
      { field: 'appId', type: STRING, name: '应用号', placeholder: '请输入应用号' },
      { field: 'appName', type: STRING, name: '应用名称', placeholder: '请输入应用名称' },
    ] as QueryField[]
  })

  const xTable = ref<VxeTableInstance>()
  const xToolbar = ref<VxeToolbarInstance>()
  const mchApp = ref<any>()
  const channelSetup = ref<any>()
  const merchantNotifyConfigList = ref<any>()
  const cashierCodeConfigList = ref<any>()
  const checkoutConfigModel = ref<any>()
  const allocationConfigModel = ref<any>()

  onMounted(() => {
    vxeBind()
    queryPage()
  })

  function vxeBind() {
    xTable.value?.connect(xToolbar.value as VxeToolbarInstance)
  }

  // 分页查询
  function queryPage() {
    loading.value = true
    page({
      ...model.queryParam,
      ...pages,
    }).then(({ data }) => {
      pageQueryResHandel(data)
    })
    return Promise.resolve()
  }
  /**
   * 新增
   */
  function add() {
    mchApp.value.init(null, FormEditType.Add)
  }
  /**
   * 编辑
   */
  function edit(record) {
    mchApp.value.init(record.id, FormEditType.Edit)
  }
  /**
   * 查看
   */
  function show(record) {
    mchApp.value.init(record.id, FormEditType.Show)
  }

  /**
   * 通道配置
   */
  function showChannelSetup(record) {
    channelSetup.value.init(record.appId)
  }
  /**
   * 通知配置
   */
  function showNotifyConfig(record) {
    merchantNotifyConfigList.value.init(record.appId)
  }
  /**
   * 收银台配置
   */
  function showCheckoutConfig(record) {
    checkoutConfigModel.value.init(record.appId)
  }
  /**
   * 收银码牌配置
   */
  function showCashierCode(record) {
    cashierCodeConfigList.value.init(record.appId)
  }
  /**
   * 分账配置
   */
  function showAllocConfig(record) {
    allocationConfigModel.value.init(record.appId)
  }
  /**
   * 删除
   */
  function remove(record) {
    createConfirm({
      iconType: 'warning',
      title: '警告',
      content: '是否删除该条数据',
      onOk: () => {
        del(record.id).then(() => {
          createMessage.success('删除成功')
          queryPage()
        })
      },
    })
  }
</script>

<style lang="less" scoped></style>
