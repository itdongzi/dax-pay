import type { AppRouteRecordRaw, Menu } from '@/router/types'

import { defineStore } from 'pinia'
import { store } from '@/store'
import { transformObjToRoute, flatMultiLevelRoutes } from '@/router/helper/routeHelper'
import { transformRouteToMenu } from '@/router/helper/menuHelper'

import { PAGE_NOT_FOUND_ROUTE } from '@/router/routes/basic'

import { filter } from '@/utils/helper/treeHelper'

import { getPermCodes, menuTree } from '@/api/sys/permission'

import { useMessage } from '@/hooks/web/useMessage'
import { PageEnum } from '@/enums/pageEnum'
import Dashboard from '@/router/routes/modules/dashboard'
import { PROJECT_BASE } from '@/router/routes/project'
import { PermMenu } from '@/api/sys/model/menuModel'
import { getAppEnvConfig } from '@/utils/env'

interface PermissionState {
  // 权限代码列表
  permCodeList: string[] | number[]
  // 路由是否动态添加
  isDynamicAddedRoute: boolean
  // 触发菜单更新
  lastBuildMenuTime: number
  // 后台菜单列表
  backMenuList: Menu[]
}

export const usePermissionStore = defineStore({
  id: 'app-permission',
  state: (): PermissionState => ({
    // 权限代码列表
    permCodeList: [],
    // 路由是否加载完成
    isDynamicAddedRoute: false,
    // 触发菜单更新
    lastBuildMenuTime: 0,
    // 后台菜单列表
    backMenuList: [],
  }),
  getters: {
    getPermCodeList(): string[] | number[] {
      return this.permCodeList
    },
    getBackMenuList(): Menu[] {
      return this.backMenuList
    },
    getLastBuildMenuTime(): number {
      return this.lastBuildMenuTime
    },
    getIsDynamicAddedRoute(): boolean {
      return this.isDynamicAddedRoute
    },
  },
  actions: {
    setPermCodeList(codeList: string[]) {
      this.permCodeList = codeList
    },
    setBackMenuList(list: Menu[]) {
      this.backMenuList = list
      list?.length > 0 && this.setLastBuildMenuTime()
    },

    setLastBuildMenuTime() {
      this.lastBuildMenuTime = new Date().getTime()
    },

    setDynamicAddedRoute(added: boolean) {
      this.isDynamicAddedRoute = added
    },
    resetState(): void {
      this.isDynamicAddedRoute = false
      this.permCodeList = []
      this.backMenuList = []
      this.lastBuildMenuTime = 0
    },
    /**
     * 权限码和菜单更新, 更新权限码并返回菜单信息
     */
    async changeMenuAndPermCode(): Promise<PermMenu[]> {
      const { VITE_GLOB_APP_CLIENT } = getAppEnvConfig()
      // 菜单
      const { data: menus } = await menuTree(VITE_GLOB_APP_CLIENT)
      // 权限码
      const { data: permCode } = await getPermCodes()
      this.setPermCodeList(permCode)
      return menus
    },

    /**
     * 转换路由为系统中的菜单
     */
    convertMenus(permMenus: PermMenu[]): AppRouteRecordRaw[] {
      return (
        permMenus?.map((o) => {
          return {
            name: o.name,
            path: o.path,
            component: o.component,
            targetOutside: o.targetOutside,
            iframeUrl: o.iframeUrl,
            redirect: o.redirect,
            fullScreen: o.fullScreen,
            meta: {
              orderNo: o.sortNo,
              title: o.title,
              icon: o.icon,
              hideMenu: o.hidden,
              hideChildrenMenu: o.hideChildrenMenu,
              ignoreKeepAlive: !o.keepAlive,
            },
            children: this.convertMenus(o.children),
          } as AppRouteRecordRaw
        }) || []
      )
    },

    /**
     * 构建路由  后端控制
     */
    async buildRoutesAction(): Promise<AppRouteRecordRaw[]> {
      // 路由
      let routes: AppRouteRecordRaw[] = []
      const routeRemoveIgnoreFilter = (route: AppRouteRecordRaw) => {
        const { meta } = route
        // ignoreRoute 为true 则路由仅用于菜单生成，不会在实际的路由表中出现
        const { ignoreRoute } = meta || {}
        // arr.filter 返回 true 表示该元素通过测试
        return !ignoreRoute
      }

      /**
       * 根据设置的首页path，修正routes中的affix标记（固定首页）
       * */
      const patchHomeAffix = (routes: AppRouteRecordRaw[]) => {
        if (!routes || routes.length === 0) return
        // 主页路径
        let homePath: string = PageEnum.BASE_HOME

        function patcher(routes: AppRouteRecordRaw[], parentPath = '') {
          if (parentPath) parentPath = parentPath + '/'
          routes.forEach((route: AppRouteRecordRaw) => {
            const { path, children, redirect } = route
            const currentPath = path.startsWith('/') ? path : parentPath + path
            if (currentPath === homePath) {
              if (redirect) {
                homePath = route.redirect! as string
              } else {
                route.meta = Object.assign({}, route.meta, { affix: true })
                throw new Error('end')
              }
            }
            children && children.length > 0 && patcher(children, currentPath)
          })
        }

        try {
          patcher(routes)
        } catch (e) {
          // 已处理完毕跳出循环
        }
        return
      }

      const { createMessage } = useMessage()

      createMessage.loading({
        content: '菜单加载中...',
        duration: 1,
      })

      let routeList: AppRouteRecordRaw[] = []

      // 获取后台的菜单和更新权限码
      try {
        const permMenus = await this.changeMenuAndPermCode()
        // 将 后端获取的菜单转换为系统中的菜单格式
        routeList = this.convertMenus(permMenus)
      } catch (error) {
        console.error(error)
      }
      // 后端获取的菜单如果为空, 不进行处理
      if (routeList) {
        // 将后端对象变成路由对象
        routeList = transformObjToRoute(routeList)
        //  后台路由到菜单结构
        const backMenuList = transformRouteToMenu(routeList)
        this.setBackMenuList(backMenuList)
        // 删除 meta.ignoreRoute 项
        routeList = filter(routeList, routeRemoveIgnoreFilter)
        routeList = routeList.filter(routeRemoveIgnoreFilter)

        routeList = flatMultiLevelRoutes(routeList)
      }

      routes = [PAGE_NOT_FOUND_ROUTE, ...routeList]

      // 添加更多配置的路由菜单
      routes.push(Dashboard)
      routes.push(...PROJECT_BASE)
      patchHomeAffix(routes)
      return routes
    },
  },
})

// Need to be used outside the setup
// 需要在设置之外使用
export function usePermissionStoreWithOut() {
  return usePermissionStore(store)
}
