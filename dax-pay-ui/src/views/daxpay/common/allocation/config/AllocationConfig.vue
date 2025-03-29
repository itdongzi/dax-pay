<template>
  <a-spin :spinning="confirmLoading">
    <a-form
      class="small-from-item"
      :model="form"
      ref="formRef"
      :validate-trigger="['blur', 'change']"
      :rules="rules"
      :label-col="labelCol"
      :wrapper-col="wrapperCol"
    >
      <a-form-item label="主键" name="id" :hidden="true">
        <a-input v-model:value="form.id" :disabled="showable" />
      </a-form-item>
      <a-form-item name="autoAlloc">
        <template #label>
          <basic-title
            helpMessage="开启自动分账后，如果创建订单时设置为了自动分账，将会对订单自动分账"
          >
            自动分账
          </basic-title>
        </template>
        <a-radio-group v-model:value="form.autoAlloc" :disabled="!edit" button-style="solid">
          <a-radio-button :value="false">关闭</a-radio-button>
          <a-radio-button :value="true">开启</a-radio-button>
        </a-radio-group>
      </a-form-item>
      <a-form-item name="autoFinish" v-if="form.autoAlloc">
        <template #label>
          <basic-title
            helpMessage="开启自动完结后，分账完成后，会自动对分账单进行完结，解冻剩余的资金"
          >
            自动完结
          </basic-title>
        </template>
        <a-radio-group v-model:value="form.autoFinish" :disabled="!edit" button-style="solid">
          <a-radio-button :value="false">关闭</a-radio-button>
          <a-radio-button :value="true">开启</a-radio-button>
        </a-radio-group>
      </a-form-item>

      <a-form-item name="minAmount" v-if="form.autoAlloc">
        <template #label>
          <basic-title helpMessage="只有大于或等于其金额的订单才会进行分账">
            自动分账起始金额(元)
          </basic-title>
        </template>
        <a-input-number
          v-model:value="form.minAmount"
          class="w-300px"
          :min="0.1"
          :precision="1"
          :max="9999999"
          :disabled="!edit"
          placeholder="请输自动分账起始金额(元)"
        />
      </a-form-item>
      <a-form-item name="delayTime" v-if="form.autoAlloc">
        <template #label>
          <basic-title helpMessage="支付订单完成后多久进行分账操作">
            分账延迟时间(分钟)
          </basic-title>
        </template>
        <a-input-number
          v-model:value="form.delayTime"
          class="w-300px"
          :min="0"
          :precision="0"
          :max="99999"
          :disabled="!edit"
          placeholder="请输自动分账延迟时间(分钟)"
        />
      </a-form-item>
    </a-form>
    <a-space :size="55" class="flex justify-center">
      <a-button v-if="edit" @click="initData">取消</a-button>
      <a-button v-if="edit" type="primary" @click="update">{{
        form.id ? '更新' : '保存'
      }}</a-button>
      <a-button v-if="!edit" @click="edit = true">编辑信息</a-button>
    </a-space>
  </a-spin>
</template>

<script setup lang="ts">
  import useFormEdit from '@/hooks/bootx/useFormEdit'
  import { computed, onMounted, ref } from 'vue'
  import { FormInstance, Rule } from 'ant-design-vue/lib/form'
  import { saveConfig, getConfig, updateConfig, AllocConfig } from './AllocationConfig.api'
  import { useMessage } from '@/hooks/web/useMessage'
  import BasicTitle from '@/components/Basic/src/BasicTitle.vue'

  const { labelCol, wrapperCol, confirmLoading, showable } = useFormEdit()
  const { createMessage } = useMessage()

  const edit = ref<boolean>(false)

  const props = defineProps({
    appId: String,
  })

  onMounted(() => {
    initData()
  })
  // 表单
  const formRef = ref<FormInstance>()
  const form = ref<AllocConfig>({
    autoAlloc: false,
    minAmount: 1.0,
    autoFinish: false,
    delayTime: 1440,
  })

  const rules = computed(() => {
    return {
      autoAlloc: [{ required: true, message: '' }],
      minAmount: [{ required: form.value.autoAlloc, message: '请输自动分账起始金额(元)' }],
      autoFinish: [{ required: form.value.autoAlloc, message: '' }],
      delayTime: [
        {
          required: form.value.autoAlloc,
          message: '请输订单完成后多久进行自动分账(分钟)',
        },
      ],
    } as Record<string, Rule[]>
  })

  /**
   * 重置信息
   */
  function initData() {
    confirmLoading.value = true
    edit.value = false
    getConfig(props.appId).then(({ data }) => {
      form.value = data
      confirmLoading.value = false
      form.value.appId = props.appId
    })
  }

  /**
   * 更新配置
   */
  function update() {
    formRef.value?.validate().then(async () => {
      confirmLoading.value = true
      if (form.value.id) {
        updateConfig(form.value)
          .then(() => {
            edit.value = false
            createMessage.success('更新成功')
          })
          .finally(() => (confirmLoading.value = false))
      } else {
        saveConfig(form.value)
          .then(() => {
            createMessage.success('保存成功')
            initData()
          })
          .finally(() => (confirmLoading.value = false))
      }
    })
  }
</script>

<style scoped lang="less"></style>
