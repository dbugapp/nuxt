import { careVueError, careAppError } from './care'
import { defineNuxtPlugin, useRuntimeConfig } from '#app'

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig().public.care as Required<{ apiKey: string, apiDomain?: string }>
  nuxtApp.hook('vue:error', (error: unknown, _instance, _info) => careVueError(error, config))
  nuxtApp.hook('app:error', (error: unknown) => careAppError(error, config))
})
