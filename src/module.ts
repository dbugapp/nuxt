import { defineNuxtModule, addPlugin, addServerPlugin, addImports, createResolver, useRuntimeConfig } from '@nuxt/kit'
import { reportConfig, configDefaults } from './runtime/dbug'

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
    dbug: {
      /**
       * dbug API Key
       *
       */
      key: string
      /**
       * dbug environment
       *  @default development
       */
      env?: string
      /**
       * Optional custom dbug API domain
       *
       * @default https://dbug.app
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
    name: 'dbug',
    configKey: 'dbug',
  },
  defaults: configDefaults,
  async setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)
    const config = useRuntimeConfig().public.dbug || options
    nuxt.options.alias['#api-utils'] = resolver.resolve('./runtime/types/index')
    nuxt.hook('modules:done', () => reportConfig(config))
    addPlugin(resolver.resolve('./runtime/app/plugins/dbug'))
    addImports({
      name: 'useDbug',
      from: resolver.resolve('./runtime/app/composables/dbug'),
    })
    addServerPlugin(resolver.resolve('./runtime/server/plugins/dbug'))
  },
})
