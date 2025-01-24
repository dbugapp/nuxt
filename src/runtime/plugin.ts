import type { ModuleOptions } from '../module'
import { CareHookType, careReport, careCheckConfig } from './care'
import { defineNuxtPlugin, useRuntimeConfig } from '#app'

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig().public.care as Required<ModuleOptions>
  if (careCheckConfig(config)) {
    if (import.meta.client || window) {
      window.addEventListener('unhandledrejection', event =>
        careReport(CareHookType.windowRejection, event.reason, config))
    }
    nuxtApp.hook('vue:error', (error: unknown, _instance, _info) => careReport(CareHookType.vueError, error, config))
    nuxtApp.hook('app:error', (error: unknown) => careReport(CareHookType.appError, error, config))
  }
})
