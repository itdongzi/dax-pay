<template>
  <basic-modal
    v-bind="$attrs"
    :loading="confirmLoading"
    :width="modalWidth"
    :title="title"
    :open="visible"
    :mask-closable="showable"
    @cancel="handleCancel"
  >
    <a-form
      class="small-from-item"
      ref="formRef"
      :model="form"
      :rules="rules"
      :validate-trigger="['blur', 'change']"
      :label-col="labelCol"
      :wrapper-col="wrapperCol"
    >
      <a-form-item label="主键" name="id" :hidden="true">
        <a-input v-model:value="form.id" :disabled="showable" />
      </a-form-item>
      <a-form-item label="名称" name="name">
        <a-input v-model:value="form.name" :disabled="showable" placeholder="请输入配置项名称" />
      </a-form-item>
      <a-form-item label="调用方式" validate-first name="callType">
        <a-select
          v-model:value="form.callType"
          :disabled="showable"
          :options="callTypeTypeList"
          allow-clear
          placeholder="请选择收银台类型"
        />
      </a-form-item>
      <a-form-item label="支付通道" name="channel">
        <a-select
          v-model:value="form.channel"
          :disabled="showable"
          :options="channelList"
          allow-clear
          placeholder="请选择支付通道"
        />
      </a-form-item>
      <a-form-item label="支付方式" name="payMethod">
        <a-select
          v-model:value="form.payMethod"
          :disabled="showable"
          :options="methodList"
          allow-clear
          placeholder="请选择支付方式"
        />
      </a-form-item>
      <a-form-item label="排序" name="sort">
        <a-input-number v-model:value="form.sortNo" :disabled="showable" placeholder="请输入排序" />
      </a-form-item>
    </a-form>
    <template #footer>
      <a-space>
        <a-button key="cancel" @click="handleCancel">取消</a-button>
        <a-button
          v-if="!showable"
          key="forward"
          :loading="confirmLoading"
          type="primary"
          @click="handleOk"
          >保存</a-button
        >
      </a-space>
    </template>
  </basic-modal>
</template>

<script lang="ts" setup>
  import { nextTick, onMounted, reactive, ref, unref } from 'vue'
  import useFormEdit from '@/hooks/bootx/useFormEdit'
  import { FormInstance, Rule } from 'ant-design-vue/lib/form'
  import { FormEditType } from '@/enums/formTypeEnum'
  import { BasicModal } from '@/components/Modal'
  import { LabeledValue } from 'ant-design-vue/lib/select'
  import {
    getItemConfig,
    saveItemConfig,
    updateItemConfig,
    CheckoutItemConfig,
  } from './CheckoutConfig.api'
  import { useDict } from '@/hooks/bootx/useDict'

  const props = defineProps({
    appId: String,
  })
  const {
    initFormEditType,
    handleCancel,
    labelCol,
    wrapperCol,
    modalWidth,
    title,
    confirmLoading,
    visible,
    showable,
    formEditType,
  } = useFormEdit()

  const { dictDropDown } = useDict()

  // 表单
  const formRef = ref<FormInstance>()

  const callTypeTypeList = ref<LabeledValue[]>([])
  const channelList = ref<LabeledValue[]>([])
  const methodList = ref<LabeledValue[]>([])

  let form = ref<CheckoutItemConfig>({})
  // 校验
  const rules = reactive({
    name: [{ required: true, message: '请输入配置项名称' }],
    callType: [{ required: true, message: '请选择支付通道' }],
    channel: [{ required: true, message: '请选择支付通道' }],
    payMethod: [{ required: true, message: '请选择支付方式' }],
  } as Record<string, Rule[]>)

  // 事件
  const emits = defineEmits(['ok'])

  onMounted(() => {
    initData()
  })

  /**
   * 初始化数据
   */
  async function initData() {
    callTypeTypeList.value = await dictDropDown('checkout_call_type')
    channelList.value = await dictDropDown('channel')
    methodList.value = await dictDropDown('pay_method')
  }

  /**
   * 入口
   */
  function init(id, editType: FormEditType, groupId: string) {
    console.log(props.appId)
    initFormEditType(editType)
    resetForm()
    form.value.groupId = unref(groupId)
    getInfo(id, editType)
  }

  /**
   * 获取信息
   */
  function getInfo(id, editType: FormEditType) {
    if ([FormEditType.Edit, FormEditType.Show].includes(editType)) {
      confirmLoading.value = true
      getItemConfig(id).then(({ data }) => {
        form.value = data
        confirmLoading.value = false
      })
    } else {
      confirmLoading.value = false
    }
  }
  /**
   * 保存
   */
  function handleOk() {
    formRef.value?.validate().then(async () => {
      confirmLoading.value = true
      form.value.appId = props.appId
      if (formEditType.value === FormEditType.Add) {
        await saveItemConfig(form.value).finally(() => (confirmLoading.value = false))
      } else if (formEditType.value === FormEditType.Edit) {
        await updateItemConfig(form.value).finally(() => (confirmLoading.value = false))
      }
      handleCancel()
      emits('ok')
    })
  }

  // 重置表单的校验
  function resetForm() {
    nextTick(() => {
      formRef.value?.resetFields()
    })
  }
  defineExpose({
    init,
  })
</script>

<style lang="less" scoped></style>
