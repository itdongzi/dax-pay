<template>
  <alipay-config-edit ref="alipay" @ok="ok" />
  <wechat-pay-config-edit ref="wechat" @ok="ok" />
  <union-pay-config-edit ref="union" @ok="ok" />
</template>
<script setup lang="ts">
  import { ref } from 'vue'
  import { useMessage } from '@/hooks/web/useMessage'
  import { ChannelEnum } from '@/enums/daxpay/channelEnum'
  import { ChannelConfig } from './ChannelConfig.api'
  import AlipayConfigEdit from '@/views/daxpay/common/channel/alipay/config/AlipayConfigEdit.vue'
  import WechatPayConfigEdit from '@/views/daxpay/common/channel/wechat/config/WechatPayConfigEdit.vue'
  import UnionPayConfigEdit from '@/views/daxpay/common/channel/union/config/UnionPayConfigEdit.vue'

  const { createMessage } = useMessage()

  let alipay = ref<any>()
  let wechat = ref<any>()
  let union = ref<any>()
  // 事件
  const emits = defineEmits(['ok'])
  /**
   * 打开
   */
  function show(record: ChannelConfig) {
    switch (record.channel) {
      case ChannelEnum.ALI: {
        alipay.value.init(record, false)
        break
      }
      case ChannelEnum.ALI_ISV: {
        alipay.value.init(record, true)
        break
      }
      case ChannelEnum.UNION_PAY: {
        union.value.init(record)
        break
      }
      case ChannelEnum.WECHAT: {
        wechat.value.init(record)
        break
      }
      case ChannelEnum.WECHAT_ISV: {
        wechat.value.init(record, true)
        break
      }
      default: {
        createMessage.info('暂未支持, 请期待...')
      }
    }
  }

  /**
   * 操作完成回调
   */
  function ok() {
    emits('ok')
  }

  defineExpose({ show })
</script>

<style scoped lang="less"></style>
