import { watch, unref } from 'vue'
import { useTitle as usePageTitle } from '@vueuse/core'
import { useGlobSetting } from '@/hooks/setting'
import { useRouter } from 'vue-router'
import { useLocaleStore } from '@/store/modules/locale'
import { REDIRECT_NAME } from '@/router/constant'

/**
 * Listening to page changes and dynamically changing site titles
 */
export function useTitle() {
  const { title } = useGlobSetting()
  const { currentRoute } = useRouter()
  const localeStore = useLocaleStore()

  const pageTitle = usePageTitle()

  watch(
    [() => currentRoute.value.path, () => localeStore.getLocale],
    () => {
      const route = unref(currentRoute)

      if (route.name === REDIRECT_NAME) {
        return
      }

      const tTitle = route?.meta?.title as string
      pageTitle.value = tTitle ? ` ${tTitle} - ${title} ` : `${title}`
    },
    { immediate: true },
  )
}
