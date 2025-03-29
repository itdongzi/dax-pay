import { defHttp } from '@/utils/http/axios'
import { Result } from '#/axios'
import { MchEntity } from '#/web'

/**
 * 获取收银台配置
 */
export function getConfig(appId) {
  return defHttp.get<Result<CheckoutConfig>>({
    url: '/checkout/config/get',
    params: {
      appId,
    },
  })
}

/**
 * 保存收银台配置
 */
export function saveConfig(data: CheckoutConfig) {
  return defHttp.post<Result<CheckoutConfig>>({
    url: '/checkout/config/save',
    data,
  })
}

/**
 * 更新收银台配置
 */
export function updateConfig(data: CheckoutConfig) {
  return defHttp.post<Result<CheckoutConfig>>({
    url: '/checkout/config/update',
    data,
  })
}

/**
 * 获取分组配置列表
 */
export function getGroupConfigs(appId, checkoutType) {
  return defHttp.get<Result<CheckoutGroupConfig[]>>({
    url: '/checkout/config/group/list',
    params: {
      appId,
      checkoutType,
    },
  })
}

/**
 * 获取分组配置列表
 */
export function getGroupConfig(id) {
  return defHttp.get<Result<CheckoutGroupConfig>>({
    url: '/checkout/config/group/get',
    params: { id },
  })
}

/**
 * 保存分组配置
 */
export function saveGroupConfig(data: CheckoutGroupConfig) {
  return defHttp.post<Result<CheckoutGroupConfig>>({
    url: '/checkout/config/group/save',
    data,
  })
}

/**
 * 更新分组配置
 */
export function updateGroupConfig(data: CheckoutGroupConfig) {
  return defHttp.post<Result<CheckoutGroupConfig>>({
    url: '/checkout/config/group/update',
    data,
  })
}

/**
 * 删除分组配置
 */
export function delGroupConfig(id) {
  return defHttp.post({
    url: '/checkout/config/group/delete',
    params: { id },
  })
}

/**
 * 获取配置项配置
 */
export function getItemConfigs(groupId) {
  return defHttp.get<Result<CheckoutItemConfig[]>>({
    url: '/checkout/config/item/list',
    params: {
      groupId,
    },
  })
}
/**
 * 获取配置项配置
 */
export function getItemConfig(id) {
  return defHttp.get<Result<CheckoutItemConfig>>({
    url: '/checkout/config/item/get',
    params: {
      id,
    },
  })
}

/**
 * 保存配置项配置
 */
export function saveItemConfig(data: CheckoutItemConfig) {
  return defHttp.post<Result<CheckoutItemConfig>>({
    url: '/checkout/config/item/save',
    data,
  })
}

/**
 * 更新配置项配置
 */
export function updateItemConfig(data: CheckoutItemConfig) {
  return defHttp.post<Result<CheckoutItemConfig>>({
    url: '/checkout/config/item/update',
    data,
  })
}

/**
 * 删除配置项配置
 */
export function delItemConfig(id) {
  return defHttp.post({
    url: '/checkout/config/item/delete',
    params: { id },
  })
}

/**
 * 获取聚合支付配置
 */
export function getAggregateConfigs(appId) {
  return defHttp.get<Result<CheckoutAggregateConfig[]>>({
    url: '/checkout/config/aggregate/list',
    params: {
      appId,
    },
  })
}

/**
 * 获取聚合支付配置
 */
export function getAggregateConfig(id) {
  return defHttp.get<Result<CheckoutAggregateConfig>>({
    url: '/checkout/config/aggregate/get',
    params: {
      id,
    },
  })
}

/**
 * 聚合支付配置是否存在
 */
export function existsAggregateConfig(appId, type) {
  return defHttp.get<Result<boolean>>({
    url: '/checkout/config/aggregate/exists',
    params: {
      appId,
      type
    },
  })
}

/**
 * 聚合支付配置是否存在(不包含自身)
 */
export function existsAggregateConfigNotId(appId, type, id) {
  return defHttp.get<Result<boolean>>({
    url: '/checkout/config/aggregate/existsNotId',
    params: {
      appId,
      type,
      id,
    },
  })
}

/**
 * 保存聚合支付配置
 */
export function saveAggregateConfig(data: CheckoutAggregateConfig) {
  return defHttp.post<Result<CheckoutAggregateConfig>>({
    url: '/checkout/config/aggregate/save',
    data,
  })
}

/**
 * 更新聚合支付配置
 */
export function updateAggregateConfig(data: CheckoutAggregateConfig) {
  return defHttp.post<Result<CheckoutAggregateConfig>>({
    url: '/checkout/config/aggregate/update',
    data,
  })
}

/**
 * 删除聚合支付配置
 */
export function delAggregateConfig(id) {
  return defHttp.post({
    url: '/checkout/config/aggregate/delete',
    params: { id },
  })
}

/**
 * 收银台配置
 */
export interface CheckoutConfig extends MchEntity {
  /** 收银台名称 */
  name?: string
  /** PC收银台是否同时显示聚合收银码 */
  aggregateShow?: boolean
  /** h5收银台自动升级聚合支付 */
  h5AutoUpgrade?: boolean
}
/**
 * 收银台类目配置
 */
export interface CheckoutGroupConfig extends MchEntity {
  /** 类型 web/h5/小程序 */
  type?: string
  /** 名称 */
  name?: string
  /** 图标 */
  icon?: string
  /** 排序 */
  sortNo?: number
}
/**
 * 收银台配置项
 */
export interface CheckoutItemConfig extends MchEntity {
  /** 类目配置Id */
  groupId?: string
  /** 名称 */
  name?: string
  /** 图标 */
  icon?: string
  /** 排序 */
  sortNo?: number
  /** 发起调用的类型 */
  callType?: string
  /** 支付通道 */
  channel?: string
  /** 支付方式 */
  payMethod?: string
}
/**
 * 收银台聚合扫码支付配置
 */
export interface CheckoutAggregateConfig extends MchEntity {
  /** 支付类型 */
  type?: string
  /** 通道 */
  channel?: string
  /** 支付方式 */
  payMethod?: string
  /** 自动拉起支付 */
  autoLaunch?: boolean
}
