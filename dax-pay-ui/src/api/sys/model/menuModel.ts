/**
 * 权限菜单
 */
export interface PermMenu {
  parentId: number | null
  title: string
  name: string
  effect: boolean
  icon: string
  hidden: boolean
  hideChildrenMenu: boolean
  component: string
  path: string
  iframeUrl: string
  redirect: string
  sortNo: number
  keepAlive: boolean
  targetOutside: boolean
  fullScreen: boolean
  children: Array<PermMenu>
}
