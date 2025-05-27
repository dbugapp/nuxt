import type { H3Event } from 'h3'
import type { ModuleOptions } from '../../../module'
import { report, getAgent, shouldIgnoreError } from '../../dbug'
import type { ErrorMetaUser } from '#dbug'

// Check if an error should be ignored based on HTTP status code
function shouldIgnoreEventError(event: H3Event | undefined): boolean {
  if (!event) return false

  const ignoredStatusCodes = [400, 401, 403, 404, 405, 429]
  const statusCode = event.node?.res?.statusCode

  return !!statusCode && ignoredStatusCodes.includes(statusCode)
}

export async function dbugReport(event: H3Event | undefined, _error: unknown, user?: ErrorMetaUser) {
  // Skip reporting for common HTTP errors
  if (shouldIgnoreError(_error) || shouldIgnoreEventError(event)) return

  const config = {
    key: process.env.NUXT_DBUG_KEY || '',
    env: process.env.NUXT_DBUG_ENV,
    domain: process.env.NUXT_DBUG_DOMAIN || 'https://dbug.acidjazz.workers.dev',
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
