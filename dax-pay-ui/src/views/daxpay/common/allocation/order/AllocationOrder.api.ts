import { defHttp } from '@/utils/http/axios'
import { PageResult, Result } from '#/axios'
import { MchEntity } from '#/web'

/**
 * 分页
 */
export function page(params) {
  return defHttp.get<Result<PageResult<AllocOrder>>>({
    url: '/allocation/order/page',
    params,
  })
}

/**
 * 查询详情
 */
export function get(id) {
  return defHttp.get<Result<AllocOrder>>({
    url: '/allocation/order/findById',
    params: { id },
  })
}

/**
 * 明细列表
 */
export function detailList(orderId) {
  return defHttp.get<Result<AllocDetail[]>>({
    url: '/allocation/order/detail/findAll',
    params: { orderId },
  })
}

/**
 * 明细详情
 */
export function detail(id) {
  return defHttp.get<Result<AllocDetail>>({
    url: '/allocation/order/detail/findById',
    params: { id },
  })
}

/**
 * 分账完结
 */
export function finish(id) {
  return defHttp.post<Result<AllocOrder>>({
    url: '/allocation/order/finish',
    params: { id },
  })
}

/**
 * 分账重试
 */
export function retry(id) {
  return defHttp.post<Result<AllocOrder>>({
    url: '/allocation/order/retry',
    params: { id },
  })
}

/**
 * 同步分账结果
 */
export function sync(id) {
  return defHttp.post<Result<AllocOrder>>({
    url: '/allocation/order/sync',
    params: { id },
  })
}

/**
 * 分账订单
 */
export interface AllocOrder extends MchEntity {
  // 分账单号
  allocNo?: string
  // 商户分账单号
  bizAllocNo?: string
  // 通道分账号
  outAllocNo?: string
  // 支付订单ID
  orderId?: string
  // 支付订单号
  orderNo?: string
  // 商户支付订单号
  bizOrderNo?: string
  // 外部系统支付订单号
  outOrderNo?: string
  // 支付订单标题
  title?: string
  // 所属通道
  channel?: string
  // 总分账金额
  amount?: number
  // 分账描述
  description?: string
  // 状态
  status?: string
  // 处理结果
  result?: string
  // 完成时间
  finishTime?: string
  // 异步通知地址
  notifyUrl?: string
  // 商户扩展参数
  attach?: string
  // 附加参数
  extraParam?: string
  // 请求时间
  reqTime?: string
  // 支付终端ip
  clientIp?: string
  // 错误码
  errorCode?: string
  // 错误原因
  errorMsg?: string
}

/**
 * 分账订单明细
 */
export interface AllocDetail extends MchEntity {
  // 分账订单ID
  allocationId?: string
  // 比例
  rate?: number
  // 金额
  amount?: number
  // 分账接收方类型
  receiverType?: string
  // 分账接收方Id
  receiverId?: string
  // 分账接收方名称
  name?: string
  // 接收方账号
  receiverAccount?: string
  // 接收方姓名
  receiverName?: string
  // 接收方编号
  receiverNo?: string
  // 分账结果
  result?: string
  // 错误代码
  errorCode?: string
  // 错误原因
  errorMsg?: string
  // 完成时间
  finishTime?: string
}
