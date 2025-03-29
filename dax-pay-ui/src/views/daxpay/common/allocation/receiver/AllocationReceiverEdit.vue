<template>
  <basic-modal
    v-bind="$attrs"
    :loading="confirmLoading"
    :width="900"
    :title="title"
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
        <a-form-item v-if="showable" label="接收方编号" name="receiverNo">
          <a-input v-model:value="form.receiverNo" disabled/>
        </a-form-item>
        <a-form-item label="名称" name="name">
          <a-input v-model:value="form.name" :disabled="!addable" placeholder="请输入名称" />
        </a-form-item>
        <a-form-item label="所属通道" name="channel">
          <a-select
            style="width: 100%"
            v-model:value="form.channel"
            :disabled="!addable"
            :options="payChannelList"
            placeholder="请选择所属通道"
            @change="channelChange"
          />
        </a-form-item>
        <a-form-item v-if="form.channel" label="接收方类型" name="receiverType">
          <a-select
            style="width: 100%"
            v-model:value="form.receiverType"
            :disabled="!addable"
            :options="receiverTypeList"
            placeholder="请选择接收方类型"
          />
        </a-form-item>
        <a-form-item label="接收方账号" name="receiverAccount">
          <a-input
            v-model:value="form.receiverAccount"
            :disabled="!addable"
            placeholder="请输入接收方账号"
          >
            <template v-if="['open_id'].includes(form.receiverType as string) && addable" #suffix>
              <icon icon="ant-design:qrcode-outlined" @click="showQrCode" />
            </template>
          </a-input>
        </a-form-item>
        <a-form-item label="接收方姓名" name="receiverName">
          <a-input
            v-model:value="form.receiverName"
            :disabled="!addable"
            placeholder="请输入接收方姓名"
          />
        </a-form-item>
        <a-form-item label="分账关系类型" name="relationType">
          <a-select
            style="width: 100%"
            v-model:value="form.relationType"
            :disabled="!addable"
            :options="relationTypeList"
            placeholder="请选择分账关系类型"
          />
        </a-form-item>
        <a-form-item
          v-if="form.relationType === 'custom'"
          label="接收者关系名称"
          name="relationName"
        >
          <a-input
            v-model:value="form.relationName"
            :disabled="!addable"
            placeholder="请输入接收者关系名称"
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
    <OpenIdQrCode ref="openIdQrCode" @close="pauseFun" />
  </basic-modal>
</template>

<script setup lang="ts">
  import useFormEdit from '@/hooks/bootx/useFormEdit'
  import { useMessage } from '@/hooks/web/useMessage'
  import { computed, nextTick, ref, unref } from 'vue'
  import { FormInstance, Rule } from 'ant-design-vue/lib/form'
  import {
    add,
    get,
    AllocReceiver,
    findChannels,
    findReceiverTypeByChannel,
  } from './AllocationReceiver.api'
  import { FormEditType } from '@/enums/formTypeEnum'
  import { BasicModal } from '@/components/Modal'
  import { useDict } from '@/hooks/bootx/useDict'
  import { LabeledValue } from 'ant-design-vue/lib/select'
  import { Icon } from '@/components/Icon'
  import OpenIdQrCode from './OpenIdQrCode.vue'
  import XEUtils from 'xe-utils'

  const {
    initFormEditType,
    handleCancel,
    labelCol,
    wrapperCol,
    title,
    confirmLoading,
    visible,
    addable,
    showable,
    formEditType,
  } = useFormEdit()
  const { createMessage } = useMessage()
  const { dictDropDown } = useDict()

  let pauseFun = () => {}
  // 表单
  const formRef = ref<FormInstance>()
  const form = ref<AllocReceiver>({})
  const rawForm = ref<AllocReceiver>({})
  const payChannelList = ref<LabeledValue[]>([])
  const receiverTypeList = ref<LabeledValue[]>([])
  const relationTypeList = ref<LabeledValue[]>([])

  const openIdQrCode = ref<any>()

  // 校验
  const rules = computed(() => {
    return {
      channel: [{ required: true, message: '请选择所属通道' }],
      receiverType: [{ required: true, message: '请选择分账接收方类型' }],
      receiverAccount: [{ required: true, message: '请输入接收方账号' }],
      relationType: [{ required: true, message: '请选择分账关系类型' }],
      relationName: [
        { required: form.value.relationType === 'custom', message: '请输入类型关系名称' },
      ],
    } as Record<string, Rule[]>
  })

  const emits = defineEmits(['ok'])

  /**
   * 入口
   */
  function init(record, editType: FormEditType, appId) {
    initFormEditType(editType)
    resetForm()
    form.value.appId = unref(appId)
    initData()
    getInfo(record, editType)
  }

  /**
   * 初始化数据
   */
  async function initData() {
    findChannels().then(({ data }) => (payChannelList.value = data))
    relationTypeList.value = await dictDropDown('alloc_relation_type')
  }

  /**
   * 获取信息
   */
  async function getInfo(record, editType: FormEditType) {
    if ([FormEditType.Edit, FormEditType.Show].includes(editType)) {
      confirmLoading.value = true
      await get(record.id).then(({ data }) => {
        form.value = data
        rawForm.value = { ...form.value }
      })
      confirmLoading.value = false
      findReceiverTypeByChannel(form.value.channel).then(
        ({ data }) => (receiverTypeList.value = data),
      )
    } else {
      confirmLoading.value = false
    }
  }

  /**
   * 通道变动
   */
  function channelChange() {
    findReceiverTypeByChannel(form.value.channel).then(
      ({ data }) => (receiverTypeList.value = data),
    )
    form.value.receiverType = undefined
  }

  /**
   * 保存
   */
  function handleOk() {
    formRef.value?.validate().then(async () => {
      confirmLoading.value = true
      try {
        form.value.receiverNo = 'none'
        form.value.reqTime = XEUtils.toDateString(new Date(), 'yyyy-MM-dd HH:mm:ss')
        if (formEditType.value === FormEditType.Add) {
          await add(form.value)
          createMessage.success('新增成功')
        }
      } finally {
        confirmLoading.value = false
      }
      emits('ok')
      handleCancel()
    })
  }

  /**
   * 显示扫码窗口
   */
  function showQrCode() {}

  /**
   * 重置表单
   */
  function resetForm() {
    nextTick(() => {
      formRef.value?.resetFields()
    })
  }
  defineExpose({
    init,
  })
</script>

<style scoped lang="less"></style>
