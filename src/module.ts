import { defineNuxtModule, addPlugin, addServerPlugin, createResolver, useRuntimeConfig } from '@nuxt/kit'
import { careReportConfig, careConfigDefaults } from './runtime/care'

// Module options TypeScript interface definition
export interface ModuleOptions {
  /**
   * fume.care API Key
   */
  apiKey: string
  /**
   * Optional custom fume.care API domain
   */
  apiDomain: string
  /**
   * Verbose logging
   */
  verbose: boolean
  /**
   * Attempt to store the user from nuxt-auth-utils
   * https://nuxt.com/modules/auth-utils
   */
  userFromAuthUtils: boolean
  authUtilsUserFields: string[]
}

declare module 'nuxt/schema' {
  interface PubilcRuntimeConfig {
  /**
   * fume.care API Key
   */
    apiKey: string
    /**
     * Optional custom fume.care API domain
     */
    apiDomain?: string
    /**
     * Verbose logging
     */
    verbose?: boolean
    /**
     * Attempt to store the user from nuxt-auth-utils
     * https://nuxt.com/modules/auth-utils
     */
    userFromAuthUtils?: boolean
    authUtilsUserFields?: string[]
  }
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'fume.care',
    configKey: 'care',
  },
  // Default configuration options of the Nuxt module
  defaults: careConfigDefaults,
  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)
    const config = useRuntimeConfig().public.care || options
    nuxt.hook('modules:done', () => careReportConfig(config))
    addPlugin(resolver.resolve('./runtime/plugin'))
    addServerPlugin(resolver.resolve('./runtime/nitro'))
  },
})
