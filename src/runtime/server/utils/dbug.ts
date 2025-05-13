import type { H3Event } from 'h3'
import type { ModuleOptions } from '../../../module'
import { report, getAgent } from '../../dbug'
import type { ErrorMetaUser } from '#dbug'

export async function dbugReport(event: H3Event | undefined, _error: unknown, user?: ErrorMetaUser) {
  const config = {
    key: process.env.NUXT_DBUG_KEY || '',
    env: process.env.NUXT_DBUG_ENV,
    domain: process.env.NUXT_DBUG_DOMAIN || 'https://dbug.nuxt.dev',
    log: process.env.NUXT_DBUG_LOG === 'true' ? true : false,
  } as Required<ModuleOptions>

  const meta = {
    user: user,
    agent: getAgent(event),
    tags: {},
  }

  report('nitro:error', _error, config, meta)
  if (!event) return
}
