import { defineNuxtModule, addPlugin, addServerPlugin, createResolver, useRuntimeConfig } from '@nuxt/kit'
import { careReportConfig } from './runtime/care'

// Module options TypeScript interface definition
export interface ModuleOptions {
  apiKey: string
  apiDomain?: string
  verbose?: boolean
}

declare module 'nuxt/schema' {
  interface PubilcRuntimeConfig {
    // API key for Care
    apiKey: string
    // Optional custom care API domain
    apiDomain?: string
    // Verbose logging
    verbose?: boolean
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
    verbose: false,
  },
  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)
    const config = useRuntimeConfig().public.care || options
    nuxt.hook('modules:done', () => careReportConfig(config))
    addPlugin(resolver.resolve('./runtime/plugin'))
    addServerPlugin(resolver.resolve('./runtime/nitro'))
  },
})
