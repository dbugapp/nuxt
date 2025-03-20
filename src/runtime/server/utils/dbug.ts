import type { H3Event } from 'h3'
import { useSession, isEvent } from 'h3'
import type { ModuleOptions } from '../../../module'
import { useRuntimeConfig } from '#imports'

export async function dbugReport(event: H3Event | undefined, _error: unknown) {
  const config = useRuntimeConfig(isEvent(event) ? event : undefined).dbug as Required<ModuleOptions>
  if (!event) return
  const session = await useSession(event, { password: config.key })
  console.log('in nitro config', session)
}
