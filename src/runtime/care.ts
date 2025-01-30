import log from 'consola'
import type { H3Event } from 'h3'
import type { ModuleOptions as Config } from '../module'

interface ErrorPayload {
  hook: string
  name: string
  message: string
  stack: string
  cause: string
  client: boolean
  environment: string
  os: {
    platform: string
    arch: string
    version: string
  }
  process: {
    pid: number
    version: string
  }
}

interface ErrorMeta {
  user?: {
    id?: string
    email?: string
    name?: string
    avatar?: string
  }
  meta?: Record<string, unknown>
}

export const careConfigDefaults = {
  env: 'development',
  apiDomain: 'https://fume.care',
  log: false,
  authUtils: false,
  authUtilsFields: ['id', 'email', 'name', 'avatar'],
}

const mergeConfig = (config: Config) => {
  return {
    ...careConfigDefaults,
    ...config,
  }
}
export enum CareHookType {
  vueError = 'vue:error',
  appError = 'app:error',
  nitroError = 'nitro:error',
  windowRejection = 'window:unhandledrejection',
}

const getMeta = (config: Config, user?: Record<string, string>) => {
  const meta: ErrorMeta = { user: undefined, meta: undefined }
  console.log('getMeta user', user)
  if (config.authUtils && user) {
    meta.user = userFromFields(user, config.authUtilsFields)
  }
  if (config.log) log.info('[fume.care] stored meta being sent:', JSON.stringify(meta))
  return meta
}

const userFromFields = (user: Record<string, unknown>, fields: string[]) => {
  if (!user || !fields?.length) return undefined
  const filtered = Object.fromEntries(
    fields
      .filter(key => user[key] !== undefined)
      .map(key => [key, user[key]]),
  )

  return Object.keys(filtered).length ? filtered : undefined
}

const getEnv = (config: Config) => {
  if (config.env) return config.env
  if (process.env.NUXT_HUB_ENV) return process.env.NUXT_HUB_ENV
  if (process.env.NUXT_APP_ENV) return process.env.NUXT_APP_ENV
  return 'development'
}

const validApiKey = (config: Config): boolean => {
  if (!config || !config.apiKey) return false
  return /^[a-z0-9]{32}$/i.test(config.apiKey)
}

export const careCheckConfig = (config: Config): boolean => {
  return validApiKey(config) && getEnv(config) !== 'development'
}

export const careReportConfig = (config: Config) => {
  if (!config.apiKey) {
    log.info('[fume.care] no API key detected - reporting disabled')
  }
  else if (!validApiKey(config)) {
    log.warn('[fume.care] API key is invalid - reporting disabled')
  }
  else if (getEnv(config) === 'development') {
    log.info('[fume.care] development or undetected environment - reporting disabled')
  }
  else {
    log.success(`[fume.care] Valid API key found - reporting enabled for \`${getEnv(config)}\` environment`)
  }

  if (careCheckConfig(config) && config.log) {
    log.info('[fume.care] logging enabled - error details will be printed')
  }
}

export const careReport = async (type: CareHookType, err: unknown, unmerged: Config, event?: H3Event, user?: Record<string, string>) => {
  const config = mergeConfig(unmerged)
  const error = err as ErrorPayload
  const payload: ErrorPayload = {
    name: error.name,
    message: error.message,
    stack: error.stack,
    hook: type,
    cause: error.cause,
    client: typeof window !== 'undefined',
    environment: getEnv(config),
    os: {
      platform: process.platform,
      arch: process.arch,
      version: process.version,
    },
    process: {
      pid: process.pid,
      version: process.version,
    },
  }
  const url = `${config.apiDomain}/api/issue`
  const meta = getMeta(config, user)
  try {
    if (config.log) {
      log.info(`[fume.care] Error in ${type} going to ${url}`, payload)
    }
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apiKey: config.apiKey,
        payload: JSON.stringify(payload),
        meta: JSON.stringify(meta),
      }),
    })
    const data = await response.json()
    if (config.log) log.success('[fume.care] Error sent successfully:', data.meta)
    return data
  }
  catch (err) {
    if (config.log) log.error(`[fume.care] Failed to send error:`, err)
  }
}
