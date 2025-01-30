import { defineNuxtModule, addPlugin, addServerPlugin, createResolver, useRuntimeConfig, installModule } from '@nuxt/kit'
import { careReportConfig, careConfigDefaults } from './runtime/care'

export interface ModuleOptions {
  apiKey: string
  env: string
  apiDomain: string
  log: boolean
  authUtils: boolean
  authUtilsFields: string[]
}

declare module 'nuxt/schema' {
  interface PublicRuntimeConfig {
    care: {
      /**
       * fume.care API Key
       *
       */
      apiKey: string
      /**
       * fume.care environment
       *  @default development
       */
      env?: string
      /**
       * Optional custom fume.care API domain
       *
       * @default https://fume.care
       */

      apiDomain?: string
      /**
       * Verbose logging
       *
       * @default false
       */
      log?: boolean
      /**
       * Attempt to store the user from nuxt-auth-utils
       * @see https://nuxt.com/modules/auth-utils
       *
       * @default false
       */

      authUtils?: boolean
      /**
       * Customize the fields that are plucked from the user supplied from nuxt-auth-utils
       *
       * @default ['id', 'email', 'name', 'avatar']
       */
      authUtilsFields?: string[]
    }
  }
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'fume.care',
    configKey: 'care',
  },
  defaults: careConfigDefaults,
  async setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)
    const config = useRuntimeConfig().public.care || options
    nuxt.hook('modules:done', () => careReportConfig(config))
    addPlugin(resolver.resolve('./runtime/plugin'))
    addServerPlugin(resolver.resolve('./runtime/nitro'))
  },
})
