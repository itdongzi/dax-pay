<template>
  <Tooltip :title="getTitle" placement="bottom" :mouseEnterDelay="0.5">
    <span @click="toggle">
      <FullscreenOutlined v-if="!isFullscreen" />
      <FullscreenExitOutlined v-else />
    </span>
  </Tooltip>
</template>
<script lang="ts" setup>
  import { computed, unref } from 'vue'
  import { Tooltip } from 'ant-design-vue'
  import { useFullscreen } from '@vueuse/core'

  import { FullscreenExitOutlined, FullscreenOutlined } from '@ant-design/icons-vue'

  defineOptions({ name: 'FullScreen' })

  const { toggle, isFullscreen } = useFullscreen()
  // 重新检查全屏状态
  isFullscreen.value = !!(
    document.fullscreenElement ||
    document.webkitFullscreenElement ||
    document.mozFullScreenElement ||
    document.msFullscreenElement
  )

  const getTitle = computed(() => {
    return unref(isFullscreen) ? '退出全屏' : '全屏'
  })
</script>
