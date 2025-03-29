<template>
  <basic-drawer
    forceRender
    v-bind="$attrs"
    title="分账订单明细"
    width="60%"
    :open="visible"
    @close="visible = false"
  >
    <vxe-toolbar ref="xToolbar" custom :refresh="{ queryMethod: queryPage }" />
    <div class="h-80vh">
      <vxe-table
        keyField="id"
        height="auto"
        ref="xTable"
        :data="records"
        :loading="loading"
        :cell-style="cellStyle"
      >
        <vxe-column type="seq" width="60" />
        <vxe-column field="receiverNo" title="接收方编号" :min-width="120" />
        <vxe-column field="name" title="接收方名称" :min-width="120" />
        <vxe-column field="receiverName" title="接收方姓名" :min-width="100" />
        <vxe-column field="receiverType" title="接收方类型" :min-width="100">
          <template #default="{ row }">
            {{ dictConvert('alloc_receiver_type', row.receiverType) }}
          </template>
        </vxe-column>
        <vxe-column field="rate" title="分账比例" :min-width="100">
          <template #default="{ row }"> {{ row.rate }}% </template>
        </vxe-column>
        <vxe-column field="amount" title="分账金额" :min-width="100">
          <template #default="{ row }"> {{ row.amount }} 元 </template>
        </vxe-column>
        <vxe-column field="result" title="分账结果" :min-width="130">
          <template #default="{ row }">
            {{ dictConvert('alloc_detail_result', row.result) }}
          </template>
        </vxe-column>
        <vxe-column field="errorMsg" title="错误原因" :min-width="160">
          <template #default="{ row }"> {{ row.errorMsg }} </template>
        </vxe-column>
        <vxe-column field="finishTime" title="完成时间" :min-width="160">
          <template #default="{ row }"> {{ row.finishTime }} </template>
        </vxe-column>
        <vxe-column fixed="right" :min-width="60" :showOverflow="false" title="操作">
          <template #default="{ row }">
            <span>
              <a href="javascript:" @click="show(row)">查看</a>
            </span>
          </template>
        </vxe-column>
      </vxe-table>
    </div>
    <AllocDetailInfo ref="allocDetailInfo" />
  </basic-drawer>
</template>

<script setup lang="ts">
  import { nextTick, ref } from 'vue'
  import useTablePage from '@/hooks/bootx/useTablePage'
  import { VxeTableInstance, VxeToolbarInstance } from 'vxe-table'
  import BasicDrawer from '@/components/Drawer/src/BasicDrawer.vue'
  import { useDict } from '@/hooks/bootx/useDict'
  import { AllocOrder, AllocDetail, detailList } from './AllocationOrder.api'
  import AllocDetailInfo from './AllocDetailInfo.vue'
  // 使用hooks
  const { loading } = useTablePage(queryPage)
  const { dictConvert } = useDict()

  let visible = ref(false)
  let order = ref<AllocOrder>({})
  let records = ref<AllocDetail[]>([])
  const xTable = ref<VxeTableInstance>()
  const xToolbar = ref<VxeToolbarInstance>()
  const allocDetailInfo = ref<any>()

  nextTick(() => {
    xTable.value?.connect(xToolbar.value as VxeToolbarInstance)
  })

  /**
   * 入口
   * @param record
   */
  function init(record) {
    visible.value = true
    order.value = record
    queryPage()
  }

  /**
   * 分页查询
   */
  function queryPage() {
    loading.value = true
    detailList(order.value.id).then(({ data }) => {
      records.value = data
      loading.value = false
    })
  }
  /**
   * 查看
   */
  function show(record) {
    allocDetailInfo.value.init(record)
  }

  function cellStyle({ row, column }) {
    if (column.field == 'status') {
      if (row.status == 'success') {
        return { color: 'green' }
      }
      if (row.status == 'fail') {
        return { color: 'red' }
      }
      if (row.status == 'progress') {
        return { color: 'orange' }
      }
      if (row.status == 'close') {
        return { color: 'gray' }
      }
      return { color: 'red' }
    }
    if (column.field == 'asyncPay') {
      if (row.asyncPay) {
        return { color: 'green' }
      } else {
        return { color: 'gray' }
      }
    }
    if (column.field == 'combinationPay') {
      if (row.combinationPay) {
        return { color: 'green' }
      } else {
        return { color: 'gray' }
      }
    }
  }
  defineExpose({
    init,
  })
</script>

<style scoped lang="less"></style>
