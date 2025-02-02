import { defineNuxtModule, addPlugin, addServerPlugin, addImports, createResolver, useRuntimeConfig } from '@nuxt/kit'
import { reportConfig, configDefaults } from './runtime/care'

export interface ModuleOptions {
  key: string
  env: string
  domain: string
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
      key: string
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

      domain?: string
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
    }
  }
}
export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'fume.care',
    configKey: 'care',
  },
  defaults: configDefaults,
  async setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)
    const config = useRuntimeConfig().public.care || options
    nuxt.options.alias['#api-utils'] = resolver.resolve('./runtime/types/index')
    nuxt.hook('modules:done', () => reportConfig(config))
    addPlugin(resolver.resolve('./runtime/app/plugins/care'))
    addImports({
      name: 'useCare',
      from: resolver.resolve('./runtime/app/composables/care'),
    })
    addServerPlugin(resolver.resolve('./runtime/server/plugins/care'))
  },
})
