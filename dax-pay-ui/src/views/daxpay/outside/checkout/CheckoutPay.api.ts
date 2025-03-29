import { defHttp } from '@/utils/http/axios'
import { Result } from '#/axios'
import { PayResult } from '@/views/daxpay/common/develop/trade/DevelopTrade.api'

/**
 * 获取收银台订单和配置信息
 */
export function getOrderAndConfig(orderNo, checkoutType) {
  return defHttp.get({
    url: '/unipay/checkout/getOrderAndConfig',
    params: {
      orderNo,
      checkoutType,
    },
  })
}
/**
 * 发起普通支付
 */
export function getCheckoutUrl(orderNo, checkoutType) {
  return defHttp.get<Result<string>>({
    url: '/unipay/checkout/getCheckoutUrl',
    params: { orderNo, checkoutType },
  })
}
/**
 * 发起普通支付
 */
export function checkoutPay(param: CheckoutPayParam) {
  return defHttp.post<Result<PayResult>>({
    url: '/unipay/checkout/pay',
    data: param,
  })
}

/**
 * 聚合条码支付
 */
export function aggregateBarPay(param: AggregateBarPayParam) {
  return defHttp.post<Result<PayResult>>({
    url: '/unipay/checkout/aggregateBarPay',
    data: param,
  })
}

/**
 * 查询订单状态
 */
export function findStatusByOrderNo(orderNo) {
  return defHttp.get<Result<boolean>>({
    url: '/unipay/checkout/findStatusByOrderNo',
    params: { orderNo },
  })
}

/**
 * 收银台支付参数
 */
export interface CheckoutPayParam {
  /** 订单号 */
  orderNo?: string
  /** 支付配置项ID */
  itemId?: string
  /** 唯一标识 */
  openId?: string
  /** 付款码 */
  barCode?: string
}

/**
 * 聚合条码支付参数
 */
export interface AggregateBarPayParam {
  /** 订单号 */
  orderNo?: string
  /** 付款码 */
  barCode?: string
}
/**
 * 收银台配置
 */
export interface CheckoutOrderAndConfigResult {
  /** 订单信息 */
  order: CheckoutOrderResult
  /** 收银台配置信息 */
  config: CheckoutConfigResult
  /** 收银台分类配置信息 */
  groupConfigs: CheckoutGroupConfigResult[]
}

/**
 * 订单信息
 */
export interface CheckoutOrderResult {
  /** 商户订单号 */
  bizOrderNo?: string
  /** 订单号 */
  orderNo?: string
  /** 标题 */
  title?: string
  /** 描述 */
  description?: string
  /** 金额(元) */
  amount?: string
}
/**
 * 收银台配置信息
 */
export interface CheckoutConfigResult {
  /** 收银台名称 */
  name?: string
  /** PC收银台是否同时显示聚合收银码 */
  aggregateShow?: boolean
  /** h5收银台自动升级聚合支付 */
  h5AutoUpgrade?: boolean
}

/**
 * 收银台分类配置
 */
export interface CheckoutGroupConfigResult {
  /** 主键 */
  id?: string
  /** 类型 */
  type?: string
  /** 名称 */
  name?: string
  /** 配置项列表 */
  items?: CheckoutItemConfigResult[]
}

/**
 * 收银台配置项
 */
export interface CheckoutItemConfigResult {
  /** 主键 */
  id?: string
  /** 发起调用的类型 */
  callType?: string
  /** 名称 */
  name?: string
  /** 支付通道 */
  channel?: string
  /** 支付方式 */
  payMethod?: string
}
