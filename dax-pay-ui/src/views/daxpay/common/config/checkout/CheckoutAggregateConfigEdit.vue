<template>
  <basic-modal
    title="聚合支付配置"
    v-bind="$attrs"
    :loading="confirmLoading"
    :width="750"
    :open="visible"
    :mask-closable="showable"
    @cancel="handleCancel"
  >
    <a-spin :spinning="confirmLoading">
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
        <a-form-item label="聚合支付类型" validate-first name="type">
          <a-select
            style="width: 300px"
            v-model:value="form.type"
            :disabled="showable"
            :options="aggregateTypeList"
            allow-clear
            placeholder="请选择聚合支付类型"
          />
        </a-form-item>
        <a-form-item label="支付通道" name="channel">
          <a-select
            style="width: 300px"
            v-model:value="form.channel"
            :disabled="showable"
            :options="channelList"
            allow-clear
            placeholder="请选择支付通道"
          />
        </a-form-item>
        <a-form-item label="支付方式" name="payMethod">
          <a-select
            style="width: 300px"
            v-model:value="form.payMethod"
            :disabled="showable"
            :options="methodList"
            allow-clear
            placeholder="请选择支付方式"
          />
        </a-form-item>
        <a-form-item label="自动拉起支付" name="allocation">
          <a-switch
            checked-children="是"
            un-checked-children="否"
            v-model:checked="form.autoLaunch"
            :disabled="showable"
          />
        </a-form-item>
      </a-form>
    </a-spin>
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

<script setup lang="ts">
  import { BasicModal } from '@/components/Modal'
  import useFormEdit from '@/hooks/bootx/useFormEdit'
  import { FormEditType } from '@/enums/formTypeEnum'
  import {
    saveAggregateConfig,
    updateAggregateConfig,
    CheckoutAggregateConfig,
    getAggregateConfig,
    existsAggregateConfig,
    existsAggregateConfigNotId,
  } from './CheckoutConfig.api'
  import { nextTick, ref, unref } from 'vue'
  import { FormInstance, Rule } from 'ant-design-vue/lib/form'
  import { LabeledValue } from 'ant-design-vue/lib/select'
  import { useDict } from '@/hooks/bootx/useDict'

  const props = defineProps({
    appId: String,
  })

  const { dictDropDown } = useDict()

  const {
    handleCancel,
    initFormEditType,
    formEditType,
    confirmLoading,
    visible,
    showable,
    labelCol,
    wrapperCol,
  } = useFormEdit()

  const aggregateTypeList = ref<LabeledValue[]>([])
  const channelList = ref<LabeledValue[]>([])
  const methodList = ref<LabeledValue[]>([])

  const formRef = ref<FormInstance>()

  let form = ref<CheckoutAggregateConfig>({
    autoLaunch: true,
  })
  // 校验
  const rules = {
    type: [
      { required: true, message: '请选择聚合支付类型' },
      { validator: validateCode, trigger: 'blur' },
    ],
    channel: [{ required: true, message: '请选择支付通道类型' }],
    payMethod: [{ required: true, message: '请选择支付方式' }],
    autoLaunch: [{ required: true, message: '' }],
  } as Record<string, Rule[]>

  // 事件
  const emits = defineEmits(['ok'])

  /**
   * 入口
   */
  function init(id, editType: FormEditType) {
    initFormEditType(editType)
    resetForm()
    getInfo(id, editType)
    form.value.appId = props.appId
    initData()
  }

  /**
   * 初始化数据
   */
  async function initData() {
    aggregateTypeList.value = await dictDropDown('checkout_aggregate')
    channelList.value = await dictDropDown('channel')
    methodList.value = await dictDropDown('pay_method')
  }

  /**
   * 获取信息
   */
  function getInfo(id, editType: FormEditType) {
    if ([FormEditType.Edit, FormEditType.Show].includes(editType)) {
      confirmLoading.value = true
      getAggregateConfig(id).then(({ data }) => {
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
      if (formEditType.value === FormEditType.Add) {
        await saveAggregateConfig(unref(form)).finally(() => (confirmLoading.value = false))
      } else if (formEditType.value === FormEditType.Edit) {
        await updateAggregateConfig(unref(form)).finally(() => (confirmLoading.value = false))
      }
      handleCancel()
      emits('ok')
    })
  }

  /**
   * 校验编码重复
   */
  async function validateCode() {
    const { appId, type, id } = form.value
    if (id) {
      const res = await existsAggregateConfigNotId(appId, type, id)
      return res.data ? Promise.reject('该聚合支付类型已存在') : Promise.resolve()
    } else {
      const res = await existsAggregateConfig(appId, type)
      return res.data ? Promise.reject('该聚合支付类型已存在') : Promise.resolve()
    }
  }

  // 重置表单的校验
  function resetForm() {
    nextTick(() => {
      formRef.value?.resetFields()
    })
  }
  defineExpose({ init })
</script>

<style scoped lang="less"></style>
