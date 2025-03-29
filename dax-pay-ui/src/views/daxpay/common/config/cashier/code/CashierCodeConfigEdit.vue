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
        <a-form-item label="码牌编码" name="code" v-if="form.code">
          <a-input v-model:value="form.code" disabled />
        </a-form-item>
        <a-form-item label="码牌名称" name="name">
          <a-input v-model:value="form.name" :disabled="showable" placeholder="请输入码牌名称" />
        </a-form-item>
        <a-form-item label="是否启用" name="enable">
          <a-switch
            checked-children="启用"
            un-checked-children="停用"
            v-model:checked="form.enable"
            :disabled="showable"
          />
        </a-form-item>
        <a-form-item label="备注" name="remark">
          <a-textarea v-model:value="form.remark" :disabled="showable" placeholder="请输入备注" />
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

<script lang="ts" setup>
  import { nextTick, onMounted, reactive, ref, unref } from 'vue'
  import useFormEdit from '@/hooks/bootx/useFormEdit'
  import { FormInstance, Rule } from 'ant-design-vue/lib/form'
  import { FormEditType } from '@/enums/formTypeEnum'
  import { BasicModal } from '@/components/Modal'
  import { LabeledValue } from 'ant-design-vue/lib/select'
  import { findById, save, update, CashierCodeConfig } from './CashierCodeConfig.api'
  import { useDict } from '@/hooks/bootx/useDict'

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

  const cashierTypeList = ref<LabeledValue[]>([])
  const channelList = ref<LabeledValue[]>([])
  const methodList = ref<LabeledValue[]>([])

  let form = ref<CashierCodeConfig>({
    enable: true,
  })
  // 校验
  const rules = reactive({
    code: [{ required: true, message: '' }],
    name: [{ required: true, message: '请输入码牌名称' }],
    enable: [{ required: true, message: '是否启用' }],
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
    cashierTypeList.value = await dictDropDown('cashier_type')
    channelList.value = await dictDropDown('channel')
    methodList.value = await dictDropDown('pay_method')
  }

  /**
   * 入口
   */
  function init(id, editType: FormEditType, appId: string) {
    initFormEditType(editType)
    resetForm()
    form.value.appId = unref(appId)
    getInfo(id, editType)
  }
  /**
   * 获取信息
   */
  function getInfo(id, editType: FormEditType) {
    if ([FormEditType.Edit, FormEditType.Show].includes(editType)) {
      confirmLoading.value = true
      findById(id).then(({ data }) => {
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
        await save(form.value).finally(() => (confirmLoading.value = false))
      } else if (formEditType.value === FormEditType.Edit) {
        await update(form.value).finally(() => (confirmLoading.value = false))
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
