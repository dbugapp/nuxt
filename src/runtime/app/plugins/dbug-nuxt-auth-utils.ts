import type { NuxtApp } from 'nuxt/app'
import type { ModuleOptions } from '../../../module'
// @ts-expect-error userUserSession is supplied by nuxt-auth-utils
import { useDbug, defineNuxtPlugin, useRuntimeConfig, useUserSession } from '#imports'

export default defineNuxtPlugin((nuxtApp: NuxtApp) => {
  const config = useRuntimeConfig().public.dbug as Required<ModuleOptions>
  if (import.meta.client || window)
    window.addEventListener('unhandledrejection', (event) => {
      const { user } = useUserSession()
      useDbug().setUser(user)
      useDbug().report('window:unhandledrejection', event.reason, config)
    })
  nuxtApp.hook('vue:error', (error: unknown, _instance, _info) => {
    const { user } = useUserSession()
    useDbug().setUser(user)
    useDbug().report('vue:error', error, config)
  })
  nuxtApp.hook('app:error', (error: unknown) => {
    const { user } = useUserSession()
    useDbug().setUser(user)
    useDbug().report('app:error', error, config)
  })
})
