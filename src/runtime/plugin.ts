import type { ModuleOptions } from '../module'
import { careVueError, careAppError } from './care'
import { defineNuxtPlugin, useRuntimeConfig } from '#app'

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig().public.care as Required<ModuleOptions>
  nuxtApp.hook('vue:error', error => careVueError(error, config))
  nuxtApp.hook('app:error', error => careAppError(error, config))
})
