import { defineNitroPlugin, useRuntimeConfig } from 'nitropack/runtime'
import type { ModuleOptions } from '../module'
import { CareHookType, careCheckConfig, careReport } from './care'

export default defineNitroPlugin((nitroApp) => {
  const config = useRuntimeConfig().public.care as Required<ModuleOptions>
  if (careCheckConfig(config))
    nitroApp.hooks.hook('error', async (error, { event }) => {
      let user = undefined
      if (config.authUtils) {
      // @ts-expect-error auto-imported
        const { user: userSession } = getUserSession(event)
        user = userSession.value
      }

      careReport(CareHookType.nitroError, error, config, event, user)
    })
})
