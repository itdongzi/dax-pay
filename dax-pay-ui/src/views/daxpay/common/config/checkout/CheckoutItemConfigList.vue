<template>
  <basic-drawer
    v-bind="$attrs"
    width="70%"
    title="收银台配置项管理"
    :mask-closable="true"
    :open="visible"
    @close="handleCancel"
  >
    <vxe-toolbar ref="xToolbar" custom :refresh="{ queryMethod: queryPage }">
      <template #buttons>
        <a-space>
          <a-button type="primary" pre-icon="ant-design:plus-outlined" @click="add">新建</a-button>
        </a-space>
      </template>
    </vxe-toolbar>
    <vxe-table ey-field="id" ref="xTable" :data="records" :loading="loading">
      <vxe-column type="seq" width="60" />
      <vxe-column field="name" title="名称" :min-width="150" />
      <vxe-column field="callType" title="调用方式" :min-width="150">
        <template #default="{ row }">
          {{ dictConvert('checkout_call_type', row.callType) }}
        </template>
      </vxe-column>
      <vxe-column field="channel" title="支付通道" :min-width="150">
        <template #default="{ row }">
          {{ dictConvert('channel', row.channel) }}
        </template>
      </vxe-column>
      <vxe-column field="payMethod" title="支付方式" :min-width="150">
        <template #default="{ row }">
          {{ dictConvert('pay_method', row.payMethod) }}
        </template>
      </vxe-column>
      <vxe-column field="sortNo" title="排序" :min-width="50" />
      <vxe-column field="createTime" title="创建时间" :min-width="170" />
      <vxe-column fixed="right" :width="150" :showOverflow="false" title="操作">
        <template #default="{ row }">
          <a href="javascript:" @click="show(row)">查看</a>
          <a-divider type="vertical" />
          <a href="javascript:" @click="edit(row)">编辑</a>
          <a-divider type="vertical" />
          <a href="javascript:" style="color: red" @click="del(row)">删除</a>
        </template>
      </vxe-column>
    </vxe-table>
    <CheckoutItemConfigEdit ref="checkoutItemConfigEdit" @ok="queryPage" :appId="appId" />
  </basic-drawer>
</template>
<script setup lang="ts">
  import { BasicDrawer } from '@/components/Drawer'
  import { ref } from 'vue'
  import { delItemConfig, getItemConfigs, CheckoutItemConfig } from './CheckoutConfig.api'
  import { FormEditType } from '@/enums/formTypeEnum'
  import { useMessage } from '@/hooks/web/useMessage'
  import { useDict } from '@/hooks/bootx/useDict'
  import CheckoutItemConfigEdit from './CheckoutItemConfigEdit.vue'

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const props = defineProps({
    appId: String,
  })

  const { createConfirm, createMessage } = useMessage()
  const { dictConvert } = useDict()

  const currentGroupId = ref<string>('')
  const loading = ref(false)
  const visible = ref(false)
  const records = ref<CheckoutItemConfig[]>([])

  const checkoutItemConfigEdit = ref<any>()
  /**
   * 初始化并展示
   */
  async function init(groupId) {
    visible.value = true
    loading.value = false
    currentGroupId.value = groupId
    queryPage()
  }

  /**
   * 查询
   */
  function queryPage() {
    // 列表信息
    loading.value = true
    getItemConfigs(currentGroupId.value).then(({ data }) => {
      records.value = data
      loading.value = false
    })
  }

  /**
   * 关闭页面
   */
  function handleCancel() {
    visible.value = false
  }

  /**
   * 新增
   */
  function add() {
    checkoutItemConfigEdit.value.init(null, FormEditType.Add, currentGroupId.value)
  }
  /**
   * 编辑
   */
  function edit(record) {
    checkoutItemConfigEdit.value.init(record.id, FormEditType.Edit, currentGroupId.value)
  }
  /**
   * 查看
   */
  function show(record) {
    checkoutItemConfigEdit.value.init(record.id, FormEditType.Show, currentGroupId.value)
  }

  /**
   * 删除
   */
  function del(record) {
    createConfirm({
      iconType: 'warning',
      title: '删除',
      content: '是否删除该数据',
      onOk: () => {
        loading.value = true
        delItemConfig(record.id).then(() => {
          createMessage.success('删除成功')
          queryPage()
        })
      },
    })
  }
  defineExpose({
    init,
  })
</script>
<style scoped lang="less"></style>
