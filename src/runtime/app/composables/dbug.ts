import { consola } from 'consola'
import type { H3Event } from 'h3'
import type { ModuleOptions as Config } from '../../../module'
import { checkConfig } from '../../dbug'
import type { DbugComposable, ErrorMeta, ErrorPayload, HookType } from '#dbug'
import { useState, computed, useRequestHeader } from '#imports'

/**
 * Composable to interact with dbug.
 * @see https://github.com/fumeapp/dbug-module
 */
export function useDbug(): DbugComposable {
  const meta = useState<ErrorMeta>('dbug-meta', () =>
    ({ user: undefined, agent: undefined, tags: {} }))

  const setUser = (user: Record<string, string>) =>
    meta.value.user = user

  const tag = (key: string, value: string) =>
    meta.value.tags = { ...meta.value.tags, [key]: value }

  const setAgent = (agent?: string) =>
    meta.value.agent = agent

  const getAgent = (event?: H3Event): string | undefined => {
    try {
      return useRequestHeader('user-agent')
        || window?.navigator?.userAgent
        || event?.headers.get('user-agent') as string
    }
    catch {
      return undefined
    }
  }
  const report = async (type: HookType, err: unknown, config: Config, event?: H3Event) => {
    if (!checkConfig(config)) return

    setAgent(getAgent(event))

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

    if (event) {
      console.log('event is present', event.headers)
    }

    if (config.log) consola.info('[dbug] stored meta being sent:', JSON.stringify(useDbug().meta.value))

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
          meta: JSON.stringify(useDbug().meta.value),
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

  return {
    meta: computed(() => meta.value),
    setUser,
    tag,
    report,
  }
}
