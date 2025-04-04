<template>
  <basic-drawer
    showFooter
    title="用户信息修改"
    v-bind="$attrs"
    :width="modalWidth"
    :open="visible"
    :mask-closable="false"
    @ok="handleOk"
    @close="handleCancel"
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
        <a-form-item label="用户账号" validate-first name="account">
          <a-input v-model:value="form.account" placeholder="请输入用户账号" />
        </a-form-item>
        <a-form-item label="用户名称" name="name">
          <a-input v-model:value="form.name" placeholder="请输入用户名称" />
        </a-form-item>
        <a-form-item label="手机号" validate-first name="phone">
          <a-input v-model:value="form.phone" placeholder="请输入用户手机号" />
        </a-form-item>
        <a-form-item label="邮箱" validate-first name="email">
          <a-input v-model:value="form.email" placeholder="请输入用户邮箱" />
        </a-form-item>
      </a-form>
    </a-spin>
  </basic-drawer>
</template>

<script lang="ts" setup>
  import { BasicDrawer } from '@/components/Drawer'
  import useFormEdit from '@/hooks/bootx/useFormEdit'
  import { FormInstance, Rule } from 'ant-design-vue/lib/form'
  import { computed, nextTick, ref } from 'vue'
  import { get, update, UserInfo } from './User.api'
  import { existsEmailNotId, existsPhoneNotId, existsAccountNotId } from '@/api/sys/userAssist'
  import { validateEmail, validateMobile } from '@/utils/validate'
  import { useMessage } from '@/hooks/web/useMessage'

  const { handleCancel, diffForm, labelCol, wrapperCol, modalWidth, confirmLoading, visible } =
    useFormEdit()
  const { createMessage } = useMessage()

  const formRef = ref<FormInstance>()
  let form = ref<UserInfo>({
    id: null,
    name: '',
    account: '',
    phone: '',
    email: '',
  })
  let rawForm: any = {}

  // 校验
  const rules = computed(() => {
    return {
      name: [{ required: true, message: '请输入名称' }],
      account: [
        { required: true, message: '请输入账号' },
        { validator: checkAccount, trigger: 'blur' },
      ],
      phone:
        rawForm.phone !== form.value.phone
          ? [{ validator: validatePhone }, { validator: validateBindPhone, trigger: 'blur' }]
          : [],
      email:
        rawForm.email !== form.value.email
          ? [{ validator: validateEmailRule }, { validator: validateBindEmail, trigger: 'blur' }]
          : [],
    } as Record<string, Rule[]>
  })
  // 事件
  const emits = defineEmits(['ok'])

  /**
   * 入口
   */
  function init(id) {
    visible.value = true
    confirmLoading.value = true
    nextTick(() => {
      formRef.value?.resetFields()
    })
    get(id).then(({ data }) => {
      rawForm = { ...data }
      form.value = data
      confirmLoading.value = false
    })
  }

  /**
   * 更新
   */
  function handleOk() {
    formRef.value?.validate().then(async () => {
      confirmLoading.value = true
      await update({
        ...form.value,
        ...diffForm(form.value, rawForm, 'password'),
      }).finally(() => (confirmLoading.value = false))
      createMessage.success('用户更改成功')
      confirmLoading.value = false
      emits('ok')
      handleCancel()
    })
  }

  /**
   * 用户名检查
   */
  async function checkAccount() {
    const { data } = await existsAccountNotId(form.value.account, form.value.id)
    return data ? Promise.reject('用户名已存在!') : Promise.resolve()
  }

  /**
   * 校验邮箱号
   */
  function validateEmailRule() {
    const { email } = form.value
    if (!email) {
      return Promise.resolve()
    }
    const { msg, result } = validateEmail(email)
    return result ? Promise.resolve() : Promise.reject(msg)
  }
  /**
   * 后台校验邮箱号是否被使用
   */
  async function validateBindEmail() {
    const { email, id } = form.value
    if (rawForm.email === email) {
      return Promise.resolve()
    }
    const { data } = await existsEmailNotId(email, id)
    return data ? Promise.reject('邮箱已被使用') : Promise.resolve()
  }
  /**
   * 校验手机号
   */
  function validatePhone() {
    const { phone } = form.value
    if (!phone) {
      return Promise.resolve()
    }
    const { msg, result } = validateMobile(phone)
    return result ? Promise.resolve() : Promise.reject(msg)
  }
  /**
   * 后台校验手机号是否被使用
   */
  async function validateBindPhone() {
    const { phone, id } = form.value
    const { data } = await existsPhoneNotId(phone, id)
    return data ? Promise.reject('手机号已被使用') : Promise.resolve()
  }
  defineExpose({ init })
</script>

<style scoped></style>
