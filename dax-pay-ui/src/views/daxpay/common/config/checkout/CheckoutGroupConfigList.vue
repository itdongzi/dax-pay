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

      <vxe-column field="name" title="分组名称" :min-width="150">
        <template #default="{ row }">
          <a href="javascript:" @click="show(row)">{{ row.name }}</a>
        </template>
      </vxe-column>
      <vxe-column field="sortNo" title="排序" :min-width="150" />
      <vxe-column field="createTime" title="创建时间" :min-width="170" />
      <vxe-column fixed="right" :width="180" :showOverflow="false" title="操作">
        <template #default="{ row }">
          <a href="javascript:" @click="edit(row)">编辑</a>
          <a-divider type="vertical" />
          <a href="javascript:" @click="list(row)">配置项</a>
          <a-divider type="vertical" />
          <a href="javascript:" style="color: red" @click="del(row)">删除</a>
        </template>
      </vxe-column>
    </vxe-table>
    <CheckoutItemConfigList ref="checkoutItemConfigList" :appId="appId" :type="type" />
    <CheckoutGroupConfigEdit
      ref="checkoutGroupConfigEdit"
      :appId="appId"
      :type="type"
      @ok="queryPage"
    />
  </div>
</template>

<script setup lang="ts">
  import { onMounted, ref } from 'vue'
  import { CheckoutGroupConfig, delGroupConfig, getGroupConfigs } from './CheckoutConfig.api'
  import { useMessage } from '@/hooks/web/useMessage'
  import CheckoutItemConfigList from './CheckoutItemConfigList.vue'
  import CheckoutGroupConfigEdit from '@/views/daxpay/common/config/checkout/CheckoutGroupConfigEdit.vue'
  import { FormEditType } from '@/enums/formTypeEnum'

  const { createMessage, createConfirm } = useMessage()

  const loading = ref(false)
  const records = ref<CheckoutGroupConfig[]>([])

  const checkoutItemConfigList = ref<any>()
  const checkoutGroupConfigEdit = ref<any>()

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
    getGroupConfigs(props.appId, props.type).then(({ data }) => {
      records.value = data
      loading.value = false
    })
  }

  /**
   * 新增
   */
  function add() {
    checkoutGroupConfigEdit.value.init(null, FormEditType.Add)
  }

  /**
   * 编辑
   */
  function edit(record) {
    checkoutGroupConfigEdit.value.init(record.id, FormEditType.Edit)
  }
  /**
   * 查看
   */
  function show(record) {
    checkoutGroupConfigEdit.value.init(record.id, FormEditType.Show)
  }
  /**
   * 配置项列表
   */
  function list(record) {
    checkoutItemConfigList.value.init(record.id)
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
        delGroupConfig(record.id).then(() => {
          createMessage.success('删除成功')
          queryPage()
        })
      },
    })
  }
</script>

<style scoped lang="less"></style>
