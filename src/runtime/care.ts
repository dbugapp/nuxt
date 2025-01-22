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

const validApiKey = (config: Config): boolean => {
  if (!config || !config.apiKey) return false
  return /^[a-z0-9]{32}$/.test(config.apiKey)
}

export const careReportConfig = (config: Config) => {
  if (!validApiKey(config)) {
    log.info('[fume.care] No valid API Key discovered - reporting muted')
  }
  else {
    log.success('[fume.care] Valid API key found - reporting activated')
  }

  if (config.verbose) {
    log.info('[fume.care] Verbose mode enabled - error details will be printed')
  }
}

export const careCheckConfig = (config: Config): boolean => {
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
    client: typeof window !== 'undefined',
    timestamp: Math.floor(Date.now() / 1000),
    os: {
      platform: process.platform,
      arch: process.arch,
      version: process.version,
    },
  }
  const url = `${config.apiDomain}/api/entry`
  try {
    if (config.verbose) {
      log.info(`[fume.care] Error in ${hook} going to ${url}`, payload)
    }
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apiKey: config.apiKey,
        environment: 'production',
        payload: JSON.stringify(payload),
      }),
    })
    const data = await response.json()
    log.success('[fume.care] Error sent successfully:', data.meta)
    return data
  }
  catch (err) {
    log.error(`[fume.care] Failed to send error to ${url}:`, err)
  }
}
