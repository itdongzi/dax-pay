<template>
  <basic-drawer
    destroyOnClose
    v-bind="$attrs"
    width="70%"
    title="分账配置"
    :mask-closable="true"
    :open="visible"
    @close="visible = false"
  >
    <a-tabs v-model:activeKey="activeKey" type="card">
      <a-tab-pane :key="1" tab="分账配置">
        <AllocationConfig :appId="appId" />
      </a-tab-pane>
      <a-tab-pane :key="2" tab="分账接收方">
        <AllocationReceiverList :appId="appId" />
      </a-tab-pane>
      <a-tab-pane :key="3" tab="分账组">
        <AllocationGroupList :appId="appId" />
      </a-tab-pane>
    </a-tabs>
  </basic-drawer>
</template>

<script setup lang="ts">
  import AllocationReceiverList from '@/views/daxpay/common/allocation/receiver/AllocationReceiverList.vue'
  import AllocationGroupList from '@/views/daxpay/common/allocation/group/AllocationGroupList.vue'
  import { ref } from 'vue'
  import { BasicDrawer } from '@/components/Drawer'
  import AllocationConfig from '@/views/daxpay/common/allocation/config/AllocationConfig.vue'

  const visible = ref(false)
  const activeKey = ref(1)
  const appId = ref('')

  /**
   * 入口
   * @param appid
   */
  function init(appid: string) {
    activeKey.value = 1
    visible.value = true
    appId.value = appid
  }

  defineExpose({ init })
</script>

<style scoped lang="less"></style>
