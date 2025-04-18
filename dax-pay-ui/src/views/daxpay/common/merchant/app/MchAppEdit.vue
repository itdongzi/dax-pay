<template>
  <basic-drawer
    showFooter
    v-bind="$attrs"
    width="50%"
    :title="title"
    :mask-closable="showable"
    :open="visible"
    @close="handleCancel"
  >
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
        <a-form-item label="应用号" name="appId" v-if="!addable">
          <a-tag> {{ form.appId }}</a-tag>
        </a-form-item>
        <a-form-item label="应用名称" name="appName">
          <a-input v-model:value="form.appName" :disabled="showable" placeholder="请输入应用名称" />
        </a-form-item>
        <a-form-item label="应用状态" name="status">
          <a-radio-group v-model:value="form.status" :disabled="showable" button-style="solid">
            <a-radio-button value="disabled">禁用</a-radio-button>
            <a-radio-button value="enable">启用</a-radio-button>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="支付限额(元)" name="limitAmount">
          <a-input-number
            v-model:value="form.limitAmount"
            :min="0.01"
            :precision="2"
            :disabled="showable"
            placeholder="请输入支付限额(元)"
          />
        </a-form-item>
        <a-form-item label="订单超时时间(分钟)" name="orderTimeout">
          <a-input-number
            v-model:value="form.orderTimeout"
            :min="5"
            :precision="0"
            :disabled="showable"
            placeholder="请输入订单默认超时时间(分钟)"
          />
        </a-form-item>
        <a-form-item label="请求验签" name="reqSign">
          <a-switch
            :disabled="showable"
            v-model:checked="form.reqSign"
            checked-children="启用"
            un-checked-children="停用"
          />
        </a-form-item>
        <a-form-item label="签名方式" name="signType">
          <a-radio-group v-model:value="form.signType" :disabled="showable" button-style="solid">
            <a-radio-button v-for="item in signTypes" :key="item.value" :value="item.value">{{
              item.label
            }}</a-radio-button>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="签名秘钥" name="signSecret">
          <a-textarea
            v-model:value="form.signSecret"
            :disabled="showable"
            placeholder="请输入公钥"
          />
          <a-button v-if="addable" type="link" @click="genSignSecret">生成秘钥</a-button>
        </a-form-item>
        <a-form-item label="通知方式" name="notifyType">
          <a-radio-group v-model:value="form.notifyType" :disabled="showable" button-style="solid">
            <a-radio-button
              v-for="item in merchantNotifyTypes"
              :key="item.value"
              :value="item.value"
              >{{ item.label }}</a-radio-button
            >
          </a-radio-group>
        </a-form-item>
        <a-form-item label="通知地址" name="notifyUrl" v-show="form.notifyType !== 'none'">
          <a-input
            v-model:value="form.notifyUrl"
            :disabled="showable"
            placeholder="请输入通知地址"
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
  </basic-drawer>
</template>

<script lang="ts" setup>
  import { nextTick, reactive, ref, unref } from 'vue'
  import useFormEdit from '@/hooks/bootx/useFormEdit'
  import { add, get, MchApp, update } from './MchApp.api'
  import { FormInstance, Rule } from 'ant-design-vue/lib/form'
  import { FormEditType } from '@/enums/formTypeEnum'
  import { BasicDrawer } from '@/components/Drawer'
  import { buildUUID } from '@/utils/uuid'
  import { LabeledValue } from 'ant-design-vue/lib/select'
  import { useDict } from '@/hooks/bootx/useDict'

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
  const { dictDropDown } = useDict()

  // 表单
  const formRef = ref<FormInstance>()
  const form = ref<MchApp>({
    notifyType: 'none',
    signType: 'hmac_sha256',
    limitAmount: 200.0,
    orderTimeout: 30,
    signSecret: '',
    reqSign: true,
  })
  const signTypes = ref<LabeledValue[]>([])
  const merchantNotifyTypes = ref<LabeledValue[]>([])

  // 校验
  const rules = reactive({
    appName: [{ required: true, message: '请输入应用名称' }],
    signType: [{ required: true, message: '请选择签名方式' }],
    status: [{ required: true, message: '请选择应用状态' }],
    signSecret: [{ required: true, message: '请输入签名秘钥' }],
    reqSign: [{ required: true, message: '请选择是否验签' }],
    limitAmount: [{ required: true, message: '请输入支付限额(元)' }],
    orderTimeout: [{ required: true, message: '请输入订单默认超时时间(分钟)' }],
    notifyType: [{ required: true, message: '请选择消息通知方式' }],
  } as Record<string, Rule[]>)
  // 事件
  const emits = defineEmits(['ok'])

  /**
   * 入口
   */
  async function init(id, editType: FormEditType) {
    initData()
    initFormEditType(editType)
    await resetForm()
    getInfo(id, editType)
  }

  /**
   * 初始化商户列表信息
   */
  function initData() {
    // 签名方式
    dictDropDown('sign_type').then((data) => {
      signTypes.value = data
    })
    // 商户通知方式
    dictDropDown('merchant_notify_type').then((data) => {
      merchantNotifyTypes.value = data
    })
  }

  /**
   * 获取信息
   */
  function getInfo(id, editType: FormEditType) {
    if ([FormEditType.Edit, FormEditType.Show].includes(editType)) {
      confirmLoading.value = true
      get(id).then(({ data }) => {
        form.value = data
        confirmLoading.value = false
      })
    } else if (editType === FormEditType.Add) {
      genSignSecret()
      confirmLoading.value = false
    }
  }
  // 保存
  function handleOk() {
    formRef.value?.validate().then(async () => {
      confirmLoading.value = true
      if (formEditType.value === FormEditType.Add) {
        await add(unref(form)).finally(() => (confirmLoading.value = false))
      } else if (formEditType.value === FormEditType.Edit) {
        await update(unref(form)).finally(() => (confirmLoading.value = false))
      }
      handleCancel()
      emits('ok')
    })
  }

  /**
   * 生成秘钥
   */
  function genSignSecret() {
    console.log(form.value.signSecret)
    form.value.signSecret = buildUUID() + buildUUID()
    console.log(form.value.signSecret)
  }
  /**
   * 重置表单的校验
   */
  async function resetForm() {
    await nextTick(() => {
      formRef.value?.resetFields()
      console.log(form.value)
    })
  }
  defineExpose({
    init,
  })
</script>

<style lang="less" scoped></style>
