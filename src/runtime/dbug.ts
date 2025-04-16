import { consola } from 'consola'
import type { H3Event } from 'h3'
import type { ModuleOptions as Config } from '../module'
import type { ErrorMeta, ErrorPayload, HookType } from '#dbug'

const signature = '[`dbug`]'
const info = (msg: string) => consola.info(`${signature} ${msg}`)
const warn = (msg: string) => consola.warn(`${signature} ${msg}`)
const success = (msg: string) => consola.success(`${signature} ${msg}`)
export const validKey = (config: Config): boolean =>
  config && typeof config.key === 'string' && /^[a-z0-9]{32}$/i.test(config.key)

export const checkConfig = (config: Config): boolean =>
  validKey(config) && config.env !== 'development' && config.env !== ''

export const reportConfig = (config: Config) => {
  if (config.key === '') info('no key detected - reporting disabled')
  else if (!validKey(config)) warn('key is invalid - reporting disabled')
  else if (config.env === 'development') info('development environment detected - reporting disabled')
  else if (config.env === '') info('undetected environment - reporting disabled')
  else success(`valid API key found - reporting enabled for \`${config.env}\` environment`)
  if (checkConfig(config) && config.log) info('logging enabled - error details will be printed')
}

export const getAgent = (event?: H3Event): string | undefined => {
  try {
    return event?.headers.get('user-agent') as string
      || window?.navigator?.userAgent
  }
  catch {
    return undefined
  }
}

export const report = async (type: HookType, err: unknown, config: Config, meta: ErrorMeta) => {
  if (!checkConfig(config)) return

  const error = err as ErrorPayload
  const payload: ErrorPayload = {
    name: error.name,
    message: error.message,
    stack: error.stack,
    hook: type,
    cause: error.cause,
    client: typeof window !== 'undefined',
    environment: config.env,
    os: typeof process !== 'undefined'
      ? {
          platform: process.platform,
          arch: process.arch,
          version: process.version,
        }
      : undefined,
    process: typeof process !== 'undefined'
      ? {
          pid: process.pid,
          version: process.version,
        }
      : undefined,
  }
  if (config.log) consola.info('[dbug] stored meta being sent:', JSON.stringify(meta))

  const url = `${config.domain}/api/issue`
  try {
    if (config.log) {
      consola.info(`[dbug] Error in ${type} going to ${url}`, payload)
    }
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        key: config.key,
        payload: JSON.stringify(payload),
        meta: JSON.stringify(meta),
      }),
    })
    const data = await response.json()
    if (config.log) consola.success('[dbug] Error sent successfully:', data.meta)
    return data
  }
  catch (err) {
    if (config.log) consola.error(`[dbug] Failed to send error:`, err)
  }
}
