import log from 'consola'
import type { ModuleOptions as Config } from '../module'

export const configDefaults = {
  env: 'development',
  domain: 'https://fume.care',
  log: false,
}
export const validKey = (config: Config): boolean =>
  config && typeof config.key === 'string' && /^[a-z0-9]{32}$/i.test(config.key)

export const checkConfig = (config: Config): boolean =>
  validKey(config) && config.env !== 'development'

export const reportConfig = (config: Config) => {
  if (!config.key) {
    log.info('[fume.care] no key detected - reporting disabled')
  }
  else if (!validKey(config)) {
    log.warn('[fume.care] key is invalid - reporting disabled')
  }
  else if (config.env === 'development') {
    log.info('[fume.care] development or undetected environment - reporting disabled')
  }
  else {
    log.success(`[fume.care] Valid API key found - reporting enabled for \`${config.env}\` environment`)
  }

  if (checkConfig(config) && config.log) {
    log.info('[fume.care] logging enabled - error details will be printed')
  }
}
