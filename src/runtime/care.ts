import log from 'consola'
import type { ModuleOptions as Config } from '../module'

interface ErrorPayload {
  name: string
  message: string
  stack: string
  hook: string
  cause: string
  client?: boolean
  timestamp: number
  os: {
    platform: string
    arch: string
    version: string
  }
}
export enum CareHookType {
  vueError = 'vue:error',
  appError = 'app:error',
  nitroError = 'nitro:error',
}

const validApiKey = (config: Config) => !!config.apiKey && /^[a-z0-9]{32}$/.test(config.apiKey)

export const careCheckConfig = (config: Config): boolean => {
  if (!validApiKey(config)) {
    log.info('[nuxt-care] Invalid or missing API key - not reporting.')
  }
  else {
    log.success('[nuxt-care] Valid API key found - reporting errors.')
  }
  return validApiKey(config)
}

export const careReport = (type: CareHookType, error: unknown, config: Config) => {
  sendError(type, error as ErrorPayload, config)
}

const sendError = async (hook: string, error: ErrorPayload, config: Config) => {
  const payload: ErrorPayload = {
    name: error.name,
    message: error.message,
    stack: error.stack,
    hook: hook,
    cause: error.cause,
    client: import.meta.client,
    timestamp: Math.floor(Date.now() / 1000),
    os: {
      platform: process.platform,
      arch: process.arch,
      version: process.version,
    },
  }
  try {
    const response = await fetch(`${config.apiDomain}/api/entry`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apiKey: config.apiKey,
        environment: 'production',
        payload: JSON.stringify(payload),
      }),
    })
    const data = await response.json()
    console.log('Error sent successfully:', data.meta)
    return data
  }
  catch (err) {
    console.error('Failed to send error:', err)
  }
}
