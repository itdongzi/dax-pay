<template>
  <span :class="`${prefixCls}__extra-redo`" @click="handleRedo">
    <RedoOutlined :spin="loading" />
  </span>
</template>
<script lang="ts" setup>
  import { ref } from 'vue'
  import { RedoOutlined } from '@ant-design/icons-vue'
  import { useDesign } from '@/hooks/web/useDesign'
  import { useTabs } from '@/hooks/web/useTabs'

  defineOptions({ name: 'TabRedo' })

  const loading = ref(false)

  const { prefixCls } = useDesign('multiple-tabs-content')
  const { refreshPage } = useTabs()

  async function handleRedo() {
    loading.value = true
    await refreshPage()
    setTimeout(() => {
      loading.value = false
      // Animation execution time
    }, 1200)
  }
</script>
<style lang="less" scoped>
  span.anticon-redo {
    vertical-align: baseline !important;
  }
</style>
