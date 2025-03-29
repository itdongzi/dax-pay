<template>
  <a-modal :open="visible" title="条码支付" :width="350" @cancel="handleClose">
    <a-spin :spinning="loading">
      <div>
        <div
          style="margin-bottom: 10px; display: flex; flex-direction: row; justify-content: start"
        >
        </div>
        <div style="display: flex; flex-direction: row; justify-content: space-between">
          <a-input allowClear v-model:value="authCode" placeholder="请输入付款条码" />
        </div>
      </div>
    </a-spin>
    <template #footer>
      <a-button key="cancel" @click="handleClose">取消</a-button>
      <a-button key="forward" :loading="loading" type="primary" @click="handleOk">确定</a-button>
    </template>
  </a-modal>
</template>

<script lang="ts" setup>
  import { ref } from 'vue'

  let visible = ref(false)
  let aggregate = ref(false)
  let loading = ref(false)
  let authCode = ref('')

  const emits = defineEmits(['ok', 'cancel'])

  /**
   * 初始化
   */
  function init(isAggregate: boolean) {
    visible.value = true
    loading.value = false
    aggregate.value = isAggregate
    authCode.value = ''
  }

  /**
   * 回调
   */
  function handleOk() {
    if (authCode.value) {
      loading.value = true
      emits('ok', authCode.value, aggregate.value)
    } else {
      handleClose()
    }
  }

  /**
   * 关闭
   */
  function handleClose() {
    visible.value = false
  }
  defineExpose({ init, handleClose })
</script>

<style scoped></style>
