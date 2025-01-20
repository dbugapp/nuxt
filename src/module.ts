import { defineNuxtModule, addPlugin, addServerPlugin, createResolver } from '@nuxt/kit'

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
    name: 'care',
    configKey: 'care',
  },
  // Default configuration options of the Nuxt module
  defaults: {
    apiDomain: 'https://fume.care',
  },
  setup(_options, _nuxt) {
    const resolver = createResolver(import.meta.url)

    addPlugin(resolver.resolve('./runtime/plugin'))
    addServerPlugin(resolver.resolve('./runtime/nitro.ts'))
  },
})
