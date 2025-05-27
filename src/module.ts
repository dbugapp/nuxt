import { defineNuxtModule, addPlugin, addServerPlugin, addImports, createResolver } from '@nuxt/kit'
import { defu } from 'defu'
import { reportConfig } from './runtime/dbug'
/**
 * dbug configuration .
 * @see https://github.com/fumeapp/dbug-module
 */
export interface ModuleOptions {
  /**
   * dbug API Key
   *
   */
  key: string
  /**
   * dbug environment
   *  @default development
   */
  env: string
  /**
   * Optional custom dbug API domain
   *
   * @default https://dbug.acidjazz.workers.dev
   */
  domain: string
  /**
   * Verbose logging
   *
   * @default false
   */
  log: boolean
  /**
   * Support sending nuxt-auth-utils user sessions to dbug
   *
   * @see https://github.com/atinux/nuxt-auth-utils
   * @default false
   */
  authUtils: boolean
}
declare module 'nuxt/schema' {
  interface RuntimeConfig {
    dbug: {
      key: string
      env: string
      domain: string
      log: boolean
      authUtils: boolean
    }
  }
}
export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'dbug',
    configKey: 'dbug',
  },
  defaults: {
    key: '',
    env: 'development',
    domain: 'https://dbug.acidjazz.workers.dev',
    log: false,
    authUtils: false,
  },
  async setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)
    nuxt.options.runtimeConfig.public.dbug = defu({
      key: process.env.NUXT_DBUG_KEY || '',
      env: process.env.NUXT_DBUG_ENV,
      domain: process.env.NUXT_DBUG_DOMAIN,
      log: process.env.NUXT_DBUG_LOG === 'true' ? true : false,
    }, options)
    nuxt.options.alias['#dbug'] = resolver.resolve('./runtime/types/index')
    nuxt.hook('modules:done', () => reportConfig(nuxt.options.runtimeConfig.public.dbug as ModuleOptions))
    addPlugin(resolver.resolve('./runtime/app/plugins/dbug'))
    addImports({
      name: 'useDbug',
      from: resolver.resolve('./runtime/app/composables/dbug'),
    })
    if (options.authUtils)
      addServerPlugin(resolver.resolve('./runtime/server/plugins/dbug-nuxt-auth-utils'))
    else
      addServerPlugin(resolver.resolve('./runtime/server/plugins/dbug'))
  },
})
