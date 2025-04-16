import type { H3Event } from 'h3'
import type { ModuleOptions as Config } from '../../../module'
import { checkConfig, report as dbReport, getAgent } from '../../dbug'
import type { DbugComposable, ErrorMeta, HookType } from '#dbug'
import { useState, computed } from '#imports'

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

  const report = async (type: HookType, err: unknown, config: Config, event?: H3Event) => {
    if (!checkConfig(config)) return

    setAgent(getAgent(event))
    dbReport(type, err, config, meta.value, event)
  }

  return {
    meta: computed(() => meta.value),
    setUser,
    tag,
    report,
  }
}
