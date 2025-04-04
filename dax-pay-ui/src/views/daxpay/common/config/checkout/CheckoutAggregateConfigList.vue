<template>
  <div>
    <vxe-toolbar ref="xToolbar" custom :refresh="{ queryMethod: queryPage }">
      <template #buttons>
        <a-space>
          <a-button type="primary" pre-icon="ant-design:plus-outlined" @click="add">新建</a-button>
        </a-space>
      </template>
    </vxe-toolbar>
    <vxe-table ey-field="id" ref="xTable" :data="records" :loading="loading">
      <vxe-column type="seq" width="60" />

      <vxe-column field="type" title="类型" :min-width="150">
        <template #default="{ row }">
          <a href="javascript:" @click="show(row)">{{
            dictConvert('checkout_aggregate', row.type)
          }}</a>
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
      <vxe-column field="autoLaunch" title="自动拉起支付" :min-width="150">
        <template #default="{ row }">
          <a-tag color="green" v-if="row.autoLaunch">是</a-tag>
          <a-tag color="red" v-else>否</a-tag>
        </template>
      </vxe-column>
      <vxe-column field="createTime" title="创建时间" :min-width="170" />
      <vxe-column fixed="right" :width="180" :showOverflow="false" title="操作">
        <template #default="{ row }">
          <a href="javascript:" @click="edit(row)">编辑</a>
          <a-divider type="vertical" />
          <a href="javascript:" style="color: red" @click="del(row)">删除</a>
        </template>
      </vxe-column>
    </vxe-table>
    <CheckoutAggregateConfigEdit ref="checkoutAggregateConfigEdit" :appId="appId" @ok="queryPage" />
  </div>
</template>

<script setup lang="ts">
  import { onMounted, ref } from 'vue'
  import {
    CheckoutAggregateConfig,
    delAggregateConfig,
    getAggregateConfigs,
  } from './CheckoutConfig.api'
  import { useMessage } from '@/hooks/web/useMessage'
  import CheckoutAggregateConfigEdit from './CheckoutAggregateConfigEdit.vue'
  import { FormEditType } from '@/enums/formTypeEnum'
  import { useDict } from '@/hooks/bootx/useDict'

  const { createMessage, createConfirm } = useMessage()
  const { dictConvert } = useDict()

  const loading = ref(false)
  const records = ref<CheckoutAggregateConfig[]>([])

  const checkoutAggregateConfigEdit = ref<any>()

  const props = defineProps({
    appId: String,
    type: String,
  })

  onMounted(() => queryPage())

  /**
   * 查询列表
   */
  function queryPage() {
    loading.value = true
    getAggregateConfigs(props.appId).then(({ data }) => {
      records.value = data
      loading.value = false
    })
  }

  /**
   * 新增
   */
  function add() {
    checkoutAggregateConfigEdit.value.init(null, FormEditType.Add)
  }

  /**
   * 编辑
   */
  function edit(record) {
    checkoutAggregateConfigEdit.value.init(record.id, FormEditType.Edit)
  }
  /**
   * 查看
   */
  function show(record) {
    checkoutAggregateConfigEdit.value.init(record.id, FormEditType.Show)
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
        delAggregateConfig(record.id).then(() => {
          createMessage.success('删除成功')
          queryPage()
        })
      },
    })
  }
</script>

<style scoped lang="less"></style>
