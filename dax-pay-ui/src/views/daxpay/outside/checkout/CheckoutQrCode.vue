<template>
  <a-modal :open="visible" title="扫码支付" @cancel="handleCancel" :footer="null" :width="250">
    <div style="display: flex; flex-direction: column; align-items: center; padding-top: 15px">
      <qr-code :options="{ margin: 0 }" :width="180" :value="qrUrl" />
      <div
        class="mt-15px mb-15px"
        style="display: flex; flex-direction: row; align-items: center; justify-content: center"
      >
      </div>
    </div>
  </a-modal>
</template>

<script lang="ts" setup>
  import QrCode from '/@/components/Qrcode/src/Qrcode.vue'
  import { ref } from 'vue'

  let visible = ref(false)
  let qrUrl = ref('')

  const emits = defineEmits(['cancel'])
  function init(url:string) {
    visible.value = true
    qrUrl.value = url
  }
  function handleCancel() {
    handleClose()
    emits('cancel')
  }
  function handleClose() {
    visible.value = false
  }
  defineExpose({ init, handleClose })
</script>

<style scoped></style>
