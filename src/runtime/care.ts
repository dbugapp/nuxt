import log from 'consola'
import type { ComputedRef } from 'vue'
import type { H3Event } from 'h3'
import type { ModuleOptions as Config } from '../module'

interface ErrorPayload {
  name: string
  message: string
  stack: string
  hook: string
  cause: string
  client?: boolean
  os: {
    platform: string
    arch: string
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
  apiDomain: 'https://fume.care',
  verbose: false,
  authUtils: false,
  authUtilsFields: ['id', 'email', 'name', 'avatar'],
}

const mergeConfig = (config: Config) => {
  return {
    ...careConfigDefaults,
    ...config,
  }
}

declare const useUserSession: () => { user: ComputedRef<Record<string, unknown>> }
declare const getUserSession: (event: H3Event) => Promise<{ user: Record<string, unknown> }>

export enum CareHookType {
  vueError = 'vue:error',
  appError = 'app:error',
  nitroError = 'nitro:error',
  windowRejection = 'window:unhandledrejection',
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

const getMeta = async (config: Config, event?: H3Event) => {
  const meta: ErrorMeta = { user: undefined, meta: undefined }

  // if we are incorporating nuxt-auth-utils in app/
  if (config.authUtils && !event && typeof useUserSession === 'function') {
    const { user } = useUserSession()
    meta.user = userFromFields(user.value, config.authUtilsFields)
  }

  // if we are incorporating nuxt-auth-utils in server/
  if (config.authUtils && event && typeof getUserSession === 'function') {
    const { user } = await getUserSession(event)
    meta.user = userFromFields(user, config.authUtilsFields)
  }
  if (config.verbose) log.info('[fume.care] stored meta being sent:', JSON.stringify(meta))
  return meta
}

const validApiKey = (config: Config): boolean => {
  if (!config || !config.apiKey) return false
  return /^[a-z0-9]{32}$/i.test(config.apiKey)
}

export const careReportConfig = (config: Config) => {
  if (!config.apiKey) {
    log.info('[fume.care] no API key detected - reporting muted')
  }
  else if (!validApiKey(config)) {
    log.warn('[fume.care] API key is invalid - reporting muted')
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

export const careReport = async (type: CareHookType, err: unknown, unmerged: Config, event?: H3Event) => {
  const config = mergeConfig(unmerged)
  const error = err as ErrorPayload
  const payload: ErrorPayload = {
    name: error.name,
    message: error.message,
    stack: error.stack,
    hook: type,
    cause: error.cause,
    client: typeof window !== 'undefined',
    os: {
      platform: process.platform,
      arch: process.arch,
      version: process.version,
    },
  }
  const url = `${config.apiDomain}/api/issue`
  try {
    if (config.verbose) {
      log.info(`[fume.care] Error in ${type} going to ${url}`, payload)
    }
    const meta = await getMeta(config, event)
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apiKey: config.apiKey,
        environment: 'production',
        payload: JSON.stringify(payload),
        meta: JSON.stringify(meta),
      }),
    })
    const data = await response.json()
    if (config.verbose) log.success('[fume.care] Error sent successfully:', data.meta)
    return data
  }
  catch (err) {
    if (config.verbose) log.error(`[fume.care] Failed to send error:`, err)
  }
}
