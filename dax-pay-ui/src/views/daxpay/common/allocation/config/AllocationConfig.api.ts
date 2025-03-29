import { defHttp } from '@/utils/http/axios'
import { Result } from '#/axios'
import { MchEntity } from '#/web'

/**
 * 保存
 */
export function saveConfig(data: AllocConfig) {
  return defHttp.post<Result<void>>({ url: '/allocation/config/save', data })
}

/**
 * 更新
 */
export function updateConfig(data: AllocConfig) {
  return defHttp.post<Result<void>>({ url: '/allocation/config/update', data })
}

/**
 * 根据应用ID查询
 */
export function getConfig(appId) {
  return defHttp.get<Result<AllocConfig>>({
    url: '/allocation/config/findByAppId',
    params: { appId },
  })
}

/**
 * 分账配置参数
 */
export interface AllocConfig extends MchEntity {
  /** 是否自动分账 */
  autoAlloc?: boolean
  /** 自动完结 */
  autoFinish?: boolean
  /** 大于多少开启分账 */
  minAmount?: number
  /** 分账延迟时长(分钟) */
  delayTime?: number
}
