import type { H3Event } from 'h3'
import type { ModuleOptions } from '../../../module'
import { report } from '../../dbug'

export async function dbugReport(event: H3Event | undefined, _error: unknown) {
  const config = {
    key: process.env.NUXT_DBUG_KEY || '',
    env: process.env.NUXT_DBUG_ENV,
    domain: process.env.NUXT_DBUG_DOMAIN || 'https://dbug.nuxt.dev',
    log: process.env.NUXT_DBUG_LOG === 'true' ? true : false,
  } as Required<ModuleOptions>

  const meta = {
    user: undefined,
    agent: undefined,
    tags: {},
  }

  report('nitro:error', _error, config, meta, event)
  if (!event) return
}
