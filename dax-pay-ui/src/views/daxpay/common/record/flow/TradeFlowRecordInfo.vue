<template>
  <basic-modal
    title="查看交易流水"
    v-bind="$attrs"
    :loading="confirmLoading"
    :width="1200"
    :open="visible"
    :mask-closable="showable"
    @cancel="handleCancel"
  >
    <a-spin :spinning="confirmLoading">
      <a-descriptions :column="{ lg: 2, md: 1 }" title="" bordered>
        <a-descriptions-item label="标题" :span="2">
          {{ record.title }}
        </a-descriptions-item>
        <a-descriptions-item label="流水类型">
          <a-tag>{{ dictConvert('trade_type', record.type) || '无' }}</a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="交易金额(元)">
          {{ record.amount || '无' }}
        </a-descriptions-item>
        <a-descriptions-item label="平台交易号" :span="2">
          {{ record.tradeNo }}
        </a-descriptions-item>
        <a-descriptions-item label="商户交易号" :span="2">
          {{ record.bizTradeNo }}
        </a-descriptions-item>
        <a-descriptions-item label="通道交易号" :span="2">
          {{ record.outTradeNo || '无' }}
        </a-descriptions-item>
        <a-descriptions-item label="交易通道">
          <a-tag> {{ dictConvert('channel', record.channel) }}</a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="创建时间">
          {{ record.createTime }}
        </a-descriptions-item>
        <a-descriptions-item label="应用AppId">
          {{ record.appId }}
        </a-descriptions-item>
      </a-descriptions>
    </a-spin>
    <template #footer>
      <a-button key="cancel" @click="handleCancel">取消</a-button>
    </template>
  </basic-modal>
</template>

<script lang="ts" setup>
  import useFormEdit from '@/hooks/bootx/useFormEdit'
  import { get, TradeFlowRecord } from './TradeFlowRecord.api'
  import { BasicModal } from '@/components/Modal'
  import { useDict } from '@/hooks/bootx/useDict'
  import { ref } from 'vue'

  const { handleCancel, confirmLoading, visible, showable } = useFormEdit()
  const { dictConvert } = useDict()

  // 表单
  let record = ref<TradeFlowRecord>({})
  // 入口
  function init(id) {
    visible.value = true
    confirmLoading.value = true
    get(id).then(({ data }) => {
      record.value = data
      confirmLoading.value = false
    })
  }

  defineExpose({
    init,
  })
</script>

<style lang="less" scoped>
  :deep(.ant-descriptions-item-label) {
    width: 170px;
  }
</style>
