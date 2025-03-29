<template>
  <basic-drawer
    v-bind="$attrs"
    width="70%"
    title="码牌配置"
    :mask-closable="true"
    :open="visible"
    @close="handleCancel"
  >
    <vxe-toolbar ref="xToolbar" custom :refresh="{ queryMethod: queryPage }">
      <template #buttons>
        <a-space>
          <a-button type="primary" pre-icon="ant-design:plus-outlined" @click="add">新建</a-button>
        </a-space>
      </template>
    </vxe-toolbar>
    <vxe-table ey-field="id" ref="xTable" :data="records" :loading="loading">
      <vxe-column type="seq" width="60" />
      <vxe-column field="name" title="码牌名称" :min-width="150">
        <template #default="{ row }">
          <a href="javascript:" @click="show(row)">{{ row.name }}</a>
        </template>
      </vxe-column>
      <vxe-column field="code" title="码牌编号" :min-width="220" />
      <vxe-column field="enable" title="是否启用" :min-width="150">
        <template #default="{ row }">
          <a-tag v-if="row.enable" color="green">开启</a-tag>
          <a-tag v-else color="red">关闭</a-tag>
        </template>
      </vxe-column>
      <vxe-column field="remark" title="备注" :min-width="170" />
      <vxe-column field="createTime" title="创建时间" :min-width="170" />
      <vxe-column fixed="right" :width="240" :showOverflow="false" title="操作">
        <template #default="{ row }">
          <a href="javascript:" @click="edit(row)">编辑</a>
          <a-divider type="vertical" />
          <a href="javascript:" @click="typeList(row)">类型配置</a>
          <a-divider type="vertical" />
          <a href="javascript:" @click="getUrl(row)">获取码牌</a>
          <a-divider type="vertical" />
          <a href="javascript:" style="color: red" @click="del(row)">删除</a>
        </template>
      </vxe-column>
    </vxe-table>
    <a-modal
      title="商户收款码牌"
      :loading="modelLoading"
      :width="500"
      :open="modelVisible"
      :mask-closable="false"
      :footer="null"
      @cancel="() => (modelVisible = false)"
    >
      <div class="flex justify-center" style="padding: 30px 0">
        <a-qrcode
          ref="qrcodeCanvasRef"
          :status="modelLoading ? 'loading' : 'active'"
          :size="350"
          :value="qrUrl"
          :error-level="'Q'"
          color="black"
          bg-color="white"
        />
      </div>
      <div class="flex justify-center" style="margin-bottom: 20px">
        <a-button type="primary" @click="download">保存码牌</a-button>
        <a-button style="margin-left: 25px" @click="copy">复制地址</a-button>
      </div>
    </a-modal>

    <CashierCodeConfigEdit ref="cashierCodeConfigEdit" @ok="queryPage" />
    <CashierCodeTypeConfigList ref="cashierCodeTypeConfigList" />
  </basic-drawer>
</template>
<script setup lang="ts">
  import { BasicDrawer } from '@/components/Drawer'
  import { ref } from 'vue'
  import {
    findAllByAppId,
    remove,
    CashierCodeConfig,
    getCashierCodeUrl,
  } from './CashierCodeConfig.api'
  import CashierCodeTypeConfigList from './CashierCodeTypeConfigList.vue'
  import CashierCodeConfigEdit from './CashierCodeConfigEdit.vue'
  import { FormEditType } from '@/enums/formTypeEnum'
  import { useMessage } from '@/hooks/web/useMessage'
  import { copyText } from '@/utils/copyTextToClipboard'

  const { createConfirm, createMessage } = useMessage()

  const currentAppId = ref<string>()

  const loading = ref(false)
  const visible = ref(false)
  const records = ref<CashierCodeConfig[]>([])

  const modelLoading = ref(false)
  const modelVisible = ref(false)
  const qrUrl = ref<string>('')

  const cashierCodeTypeConfigList = ref<any>()
  const cashierCodeConfigEdit = ref<any>()
  const qrcodeCanvasRef = ref<any>()
  /**
   * 初始化并展示
   */
  async function init(appId: string) {
    visible.value = true
    loading.value = false
    currentAppId.value = appId
    queryPage()
  }

  /**
   * 查询
   */
  function queryPage() {
    // 列表信息
    loading.value = true
    findAllByAppId(currentAppId.value).then(({ data }) => {
      records.value = data
      loading.value = false
    })
  }

  /**
   * 关闭页面
   */
  function handleCancel() {
    visible.value = false
  }

  /**
   * 新增
   */
  function add() {
    cashierCodeConfigEdit.value.init(null, FormEditType.Add, currentAppId.value)
  }
  /**
   * 编辑
   */
  function edit(record) {
    cashierCodeConfigEdit.value.init(record.id, FormEditType.Edit, currentAppId.value)
  }
  /**
   * 查看
   */
  function show(record) {
    cashierCodeConfigEdit.value.init(record.id, FormEditType.Show, currentAppId.value)
  }

  /**
   * 类型配置列表
   */
  function typeList(record) {
    cashierCodeTypeConfigList.value.init(record)
  }

  /**
   * 获取码牌地址
   */
  function getUrl(record) {
    modelVisible.value = true
    modelLoading.value = true
    getCashierCodeUrl(record.id)
      .then(({ data }) => {
        qrUrl.value = data
        modelLoading.value = false
      })
      .catch(() => {
        createMessage.error('获取码牌地址失败')
      })
  }

  /**
   * 复制
   */
  function copy() {
    copyText(qrUrl.value)
  }

  /**
   * 下载
   */
  async function download() {
    const url = qrcodeCanvasRef.value.toDataURL()
    const a = document.createElement('a')
    a.download = 'QRCode.png'
    a.href = url
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  /**
   * 删除
   */
  function del(record) {
    createConfirm({
      iconType: 'warning',
      title: '删除',
      content: '是否删除该数据',
      onOk: () => {
        loading.value = true
        remove(record.id).then(() => {
          createMessage.success('删除成功')
          queryPage()
        })
      },
    })
  }
  defineExpose({
    init,
  })
</script>
<style scoped lang="less"></style>
