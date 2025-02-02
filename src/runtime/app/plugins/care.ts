import type { ModuleOptions } from '../../../module'
import { useCare } from '#imports'
import { defineNuxtPlugin, useRuntimeConfig } from '#app'

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig().public.care as Required<ModuleOptions>
  if (import.meta.client || window)
    window.addEventListener('unhandledrejection', event =>
      useCare().report('window:unhandledrejection', event.reason, config))
  nuxtApp.hook('vue:error', (error: unknown, _instance, _info) =>
    useCare().report('vue:error', error, config))
  nuxtApp.hook('app:error', (error: unknown) =>
    useCare().report('app:error', error, config))
})
