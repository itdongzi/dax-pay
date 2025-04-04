<template>
  <basic-modal
    title="新建对账订单"
    v-bind="$attrs"
    :loading="confirmLoading"
    :width="modalWidth"
    :open="visible"
    :mask-closable="showable"
    @cancel="handleCancel"
  >
    <a-form
      class="small-from-item"
      ref="formRef"
      :model="form"
      :rules="rules"
      :label-col="labelCol"
      :wrapper-col="wrapperCol"
    >
      <a-form-item label="标题" name="title">
        <a-input v-model:value="form.title" placeholder="请输入对账名称" />
      </a-form-item>
      <a-form-item label="商户应用" name="appId">
        <a-select
          :filter-option="search"
          :options="mchAppList"
          v-model:value="form.appId"
          placeholder="请选择商户应用"
        />
      </a-form-item>
      <a-form-item label="对账日期" name="date">
        <a-date-picker
          style="width: 100%"
          valueFormat="YYYY-MM-DD"
          placeholder="请选择对账日期"
          v-model:value="form.date"
          :defaultPickerValue="form.date"
          :disabled-date="disabledDate"
          :show-today="false"
        />
      </a-form-item>
      <a-form-item label="对账通道" name="channel">
        <a-select
          style="width: 100%"
          v-model:value="form.channel"
          :options="channels"
          placeholder="请选择对账通道"
        />
      </a-form-item>
    </a-form>
    <template #footer>
      <a-button key="cancel" @click="handleCancel">取消</a-button>
      <a-button key="forward" :loading="confirmLoading" type="primary" @click="handleOk"
        >提交</a-button
      >
    </template>
  </basic-modal>
</template>
<script setup lang="ts">
  import { BasicModal } from '@/components/Modal'
  import { nextTick, onMounted, reactive, ref } from 'vue'
  import useFormEdit from '@/hooks/bootx/useFormEdit'
  import { useMessage } from '@/hooks/web/useMessage'
  import { FormInstance, Rule } from 'ant-design-vue/lib/form'
  import { LabeledValue } from 'ant-design-vue/lib/select'
  import { useDict } from '@/hooks/bootx/useDict'
  import dayjs, { Dayjs } from 'dayjs'
  import XEUtils from 'xe-utils'
  import { create, ReconcileCreatParam } from './ReconcileStatement.api'
  import { mchAppDropdown } from '@/views/daxpay/common/merchant/app/MchApp.api'

  const {
    handleCancel,
    search,
    labelCol,
    wrapperCol,
    modalWidth,
    confirmLoading,
    visible,
    showable,
  } = useFormEdit()
  const { createMessage } = useMessage()
  const { dictDropDown } = useDict()

  const form = reactive<ReconcileCreatParam>({})

  const rules = {
    title: [{ required: true, message: '请输入对账标题' }],
    date: [{ required: true, message: '请选择对账日期' }],
    channel: [{ required: true, message: '请选择对账通道' }],
    appId: [{ required: true, message: '请选择商户应用' }],
  } as Record<string, Rule[]>

  const channels = ref<LabeledValue[]>([])
  const mchAppList = ref<LabeledValue[]>([])

  const formRef = ref<FormInstance>()

  const emits = defineEmits(['ok'])

  onMounted(() => {
    initData()
  })

  /**
   * 初始化数据
   */
  async function initData() {
    // 通道
    channels.value = await dictDropDown('channel')
    initMchApp()
  }

  /**
   * 商户变动时刷新应用列表
   */
  function initMchApp() {
    mchAppDropdown().then(({ data }) => {
      mchAppList.value = data
    })
  }

  /**
   * 入口
   */
  function init() {
    visible.value = true
    resetForm()
    const date = XEUtils.getWhatDay(new Date(), -1)
    form.date = XEUtils.toDateString(date, 'yyyy-MM-dd')
    confirmLoading.value = false
  }

  /**
   * 提交
   */
  async function handleOk() {
    formRef.value?.validate().then(async () => {
      confirmLoading.value = true
      await create(form)
      visible.value = false
      confirmLoading.value = false
      createMessage.success('提交成功')
      emits('ok')
    })
  }

  /**
   * 禁用今天及以后的日期
   */
  function disabledDate(current: Dayjs) {
    return current && current >= dayjs().startOf('day')
  }
  /**
   * 重置表单
   */
  function resetForm() {
    nextTick(() => {
      formRef.value?.resetFields()
    })
  }
  defineExpose({ init })
</script>

<style scoped lang="less"></style>
