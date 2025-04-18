import type { AppRouteRecordRaw, AppRouteModule } from '@/router/types'

import { PAGE_NOT_FOUND_ROUTE, REDIRECT_ROUTE } from '@/router/routes/basic'

import { PageEnum } from '@/enums/pageEnum'

// import.meta.glob() 直接引入所有的模块 Vite 独有的功能
const modules = import.meta.glob('./modules/**/*.ts', { eager: true })
const routeModuleList: AppRouteModule[] = []

// 加入到路由集合中
Object.keys(modules).forEach((key) => {
  const mod = (modules as Recordable)[key].default || {}
  const modList = Array.isArray(mod) ? [...mod] : [mod]
  routeModuleList.push(...modList)
})

export const asyncRoutes = [PAGE_NOT_FOUND_ROUTE, ...routeModuleList]

// 根路由
export const RootRoute: AppRouteRecordRaw = {
  path: '/',
  name: 'Root',
  redirect: PageEnum.BASE_HOME,
  meta: {
    title: 'Root',
  },
}

export const LoginRoute: AppRouteRecordRaw = {
  path: '/login',
  name: 'Login',
  component: () => import('@/views/sys/login/Login.vue'),
  meta: {
    title: '登录',
  },
}

/**
 * 外部页面, 不需要登陆
 */
export const OUTSIDE: AppRouteModule = {
  path: '/not/login/outside/',
  name: 'NOT_LOGIN_OUTSIDE',
  meta: { title: '' },
  children: [
    {
      path: '/checkout/:orderNo',
      name: 'CheckoutPay',
      component: () => import('@/views/daxpay/outside/checkout/CheckoutPay.vue'),
      meta: { title: '收银台', ignoreAuth: true },
    },
  ],
}

// 未经许可的基本路由
export const basicRoutes = [LoginRoute, RootRoute, REDIRECT_ROUTE, PAGE_NOT_FOUND_ROUTE,OUTSIDE]
