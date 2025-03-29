import { defHttp } from '@/utils/http/axios'
import { Result } from '#/axios'
import { MchEntity } from '#/web'

/**
 * 根据AppId查询码牌列表
 */
export const findAllByAppId = (appId) =>
  defHttp.get<Result<CashierCodeConfig[]>>({
    url: '/cashier/code/config/findAllByAppId',
    params: { appId },
  })

/**
 * 根据id查询码牌信息
 */
export const findById = (id) =>
  defHttp.get<Result<CashierCodeConfig>>({ url: '/cashier/code/config/findById', params: { id } })

/**
 * 码牌配置保存
 */
export const save = (param: CashierCodeConfig) =>
  defHttp.post({ url: '/cashier/code/config/save', data: param })

/**
 * 码牌配置更新
 */
export const update = (param: CashierCodeConfig) =>
  defHttp.post({ url: '/cashier/code/config/update', data: param })

/**
 * 码牌配置删除
 */
export const remove = (id) => defHttp.post({ url: '/cashier/code/config/delete', params: { id } })

/**
 * 获取码牌地址
 */
export const getCashierCodeUrl = (id) =>
  defHttp.get<Result<string>>({ url: '/cashier/code/config/getCashierCodeUrl', params: { id } })
/**
 * 获取码牌各类型配置列表
 */
export const findTypeByCodeId = (cashierCodeId) =>
  defHttp.get<Result<CashierCodeTypeConfig[]>>({
    url: '/cashier/code/config/type/findAll',
    params: { cashierCodeId },
  })
/**
 * 获取码牌类型配置详情
 */
export const findTypeById = (id) =>
  defHttp.get<Result<CashierCodeTypeConfig>>({ url: '/cashier/code/config/type/findById', params: { id } })
/**
 * 码牌类型配置保存
 */
export const saveType = (param: CashierCodeTypeConfig) =>
  defHttp.post({ url: '/cashier/code/config/type/save', data: param })
/**
 * 码牌类型配置更新
 */
export const updateType = (param: CashierCodeTypeConfig) =>
  defHttp.post({ url: '/cashier/code/config/type/update', data: param })
/**
 * 码牌类型配置删除
 */
export const deleteType = (id) => defHttp.post({ url: '/cashier/code/config/type/delete', params: { id } })

/**
 * 码牌类型是否存在
 */
export const existsByType = (type, cashierCodeId) =>
  defHttp.get<Result<boolean>>({
    url: '/cashier/code/config/type/exists',
    params: { type, cashierCodeId },
  })

/**
 * 码牌类型是否存在(不包括自身)
 */
export const existsByTypeNotId = (type, cashierCodeId, id) =>
  defHttp.get<Result<boolean>>({
    url: '/cashier/code/config/type/existsNotId',
    params: { type, cashierCodeId, id },
  })

/**
 * 收银台码牌配置
 */
export interface CashierCodeConfig extends MchEntity {
  /** 码牌名称 */
  name?: string
  /** 码牌code */
  code?: string
  /** 模板编号 */
  templateCode?: string
  /** 是否启用 */
  enable?: boolean
  /** 备注 */
  remark?: string
}

/**
 * 特定类型码牌配置
 */
export interface CashierCodeTypeConfig extends MchEntity {
  /** 码牌ID */
  cashierCodeId?: string

  /**
   * 码牌类型
   */
  type?: string

  /**
   * 支付通道
   */
  channel?: string

  /**
   * 支付方式
   */
  payMethod?: string

  /** 是否开启分账 */
  allocation?: boolean

  /** 自动分账 */
  autoAllocation?: boolean

  /** 备注 */
  remark?: string
}
