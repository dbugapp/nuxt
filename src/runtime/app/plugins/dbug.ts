import type { NuxtApp } from 'nuxt/app'
import type { ModuleOptions } from '../../../module'
import { useDbug, defineNuxtPlugin, useRuntimeConfig } from '#imports'

export default defineNuxtPlugin((nuxtApp: NuxtApp) => {
  const config = useRuntimeConfig().public.dbug as Required<ModuleOptions>
  if (import.meta.client || window)
    window.addEventListener('unhandledrejection', event =>
      useDbug().report('window:unhandledrejection', event.reason, config))
  nuxtApp.hook('vue:error', (error: unknown, _instance, _info) =>
    useDbug().report('vue:error', error, config))
  nuxtApp.hook('app:error', (error: unknown) =>
    useDbug().report('app:error', error, config))
})
