<template>
  <basic-drawer
    v-bind="$attrs"
    width="70%"
    title="码牌类型配置"
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
      <vxe-column field="type" title="码牌类型" :min-width="150">
        <template #default="{ row }">
          {{ dictConvert('cashier_code_type', row.type) }}
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
      <vxe-column field="allocation" title="开启分账" :min-width="150">
        <template #default="{ row }">
          <a-tag color="green" v-if="row.allocation">开启</a-tag>
          <a-tag v-else>关闭</a-tag>
        </template>
      </vxe-column>
      <vxe-column field="remark" title="备注" :min-width="170" />
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
    <CashierCodeTypeConfigEdit ref="cashierCodeTypeConfigEdit" @ok="queryPage" />
  </basic-drawer>
</template>
<script setup lang="ts">
  import { BasicDrawer } from '@/components/Drawer'
  import { ref } from 'vue'
  import {
    deleteType,
    findTypeByCodeId,
    CashierCodeConfig,
    CashierCodeTypeConfig,
  } from './CashierCodeConfig.api'
  import CashierCodeTypeConfigEdit from './CashierCodeTypeConfigEdit.vue'
  import { FormEditType } from '@/enums/formTypeEnum'
  import { useMessage } from '@/hooks/web/useMessage'
  import { useDict } from '@/hooks/bootx/useDict'

  const { createConfirm, createMessage } = useMessage()
  const { dictConvert } = useDict()

  const loading = ref(false)
  const visible = ref(false)
  const records = ref<CashierCodeTypeConfig[]>([])
  const codeConfig = ref<CashierCodeConfig>({})

  const cashierCodeTypeConfigEdit = ref<any>()
  /**
   * 初始化并展示
   */
  async function init(config: CashierCodeConfig) {
    visible.value = true
    loading.value = false
    codeConfig.value = config
    queryPage()
  }

  /**
   * 查询
   */
  function queryPage() {
    // 列表信息
    loading.value = true
    findTypeByCodeId(codeConfig.value.id).then(({ data }) => {
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
    cashierCodeTypeConfigEdit.value.init(null, FormEditType.Add, codeConfig.value.id)
  }
  /**
   * 编辑
   */
  function edit(record) {
    cashierCodeTypeConfigEdit.value.init(record.id, FormEditType.Edit, codeConfig.value.id)
  }
  /**
   * 查看
   */
  function show(record) {
    cashierCodeTypeConfigEdit.value.init(record.id, FormEditType.Show, codeConfig.value.id)
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
        deleteType(record.id).then(() => {
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
