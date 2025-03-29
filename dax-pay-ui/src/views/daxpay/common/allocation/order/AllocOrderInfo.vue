<template>
  <basic-modal
    title="查看分账单信息"
    v-bind="$attrs"
    :loading="confirmLoading"
    :width="1000"
    :open="visible"
    :mask-closable="showable"
    @cancel="handleCancel"
  >
    <a-spin :spinning="confirmLoading">
      <a-descriptions title="" bordered :column="{ md: 2, sm: 1, xs: 1 }">
        <a-descriptions-item label="分账单号">
          {{ order.allocNo }}
        </a-descriptions-item>
        <a-descriptions-item label="支付订单号">
          {{ order.orderNo }}
        </a-descriptions-item>
        <a-descriptions-item label="商户分账单号">
          {{ order.bizAllocNo }}
        </a-descriptions-item>
        <a-descriptions-item label="商户支付订单号">
          {{ order.bizOrderNo }}
        </a-descriptions-item>
        <a-descriptions-item label="通道分账号">
          {{ order.outOrderNo }}
        </a-descriptions-item>
        <a-descriptions-item label="通道支付订单号">
          {{ order.outOrderNo }}
        </a-descriptions-item>
        <a-descriptions-item label="分账通道">
          <a-tag>{{ dictConvert('channel', order.channel) }}</a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="分账金额(元)"> {{ order.amount }} </a-descriptions-item>
        <a-descriptions-item label="分账状态">
          <a-tag>{{ dictConvert('allocation_status', order.status) }}</a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="分账结果">
          <a-tag>{{ dictConvert('allocation_result', order.result) }}</a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="完成时间">
          {{ order.finishTime }}
        </a-descriptions-item>
        <a-descriptions-item label="错误码" v-if="order.errorCode">
          {{ order.errorCode }}
        </a-descriptions-item>
        <a-descriptions-item label="错误原因" v-if="order.errorMsg">
          {{ order.errorMsg }}
        </a-descriptions-item>
      </a-descriptions>
    </a-spin>
    <template #footer>
      <a-space>
        <a-button key="cancel" @click="handleCancel">取消</a-button>
      </a-space>
    </template>
  </basic-modal>
</template>

<script lang="ts" setup>
  import useFormEdit from '@/hooks/bootx/useFormEdit'
  import {AllocOrder, get} from './AllocationOrder.api'
  import { BasicModal } from '@/components/Modal'
  import { useDict } from '@/hooks/bootx/useDict'
  import { ref } from 'vue'

  const { handleCancel, confirmLoading, visible, showable } = useFormEdit()
  const { dictConvert } = useDict()

  let order = ref<AllocOrder>({})
  // 入口
  async function init(record: AllocOrder) {
    visible.value = true
    order.value = record
    confirmLoading.value = true
    await get(record.id).then(({ data }) => {
      order.value = data
    })
    confirmLoading.value = false
  }
  // 获取信息
  defineExpose({
    init,
  })
</script>

<style lang="less" scoped></style>
