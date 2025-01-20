import { defineNitroPlugin, useRuntimeConfig } from 'nitropack/runtime'
import type { ModuleOptions } from '../../../module'
import { careNitroError } from '../../care'

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('error', async (error, { event }) => {
    const config = useRuntimeConfig(event).public.care as Required<ModuleOptions>
    careNitroError(error, config)
  })
})
