import { defineNitroPlugin, useRuntimeConfig } from 'nitropack/runtime'
import { careNitroError } from './care'

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('error', async (error, { event }) => {
    const config = useRuntimeConfig(event).public.care as Required<{ apiKey: string, apiDomain?: string }>
    careNitroError(error, config)
  })
})
