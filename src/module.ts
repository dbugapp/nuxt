import { defineNuxtModule, addPlugin, addServerPlugin, createResolver, useRuntimeConfig } from '@nuxt/kit'
import { careReportConfig } from './runtime/care'

// Module options TypeScript interface definition
export interface ModuleOptions {
  apiKey: string
  apiDomain?: string
}

declare module 'nuxt/schema' {
  interface PubilcRuntimeConfig {
    // API key for Care
    apiKey: string
    // Optional custom care API domain
    apiDomain?: string
  }
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'fume.care',
    configKey: 'care',
  },
  // Default configuration options of the Nuxt module
  defaults: {
    apiDomain: 'https://fume.care',
  },
  setup(_options, nuxt) {
    const resolver = createResolver(import.meta.url)

    const config = useRuntimeConfig().public.care

    nuxt.hook('modules:done', () => careReportConfig(config))

    addPlugin(resolver.resolve('./runtime/plugin'))
    addServerPlugin(resolver.resolve('./runtime/nitro'))
  },
})
