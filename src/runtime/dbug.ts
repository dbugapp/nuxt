import { consola } from 'consola'
import type { ModuleOptions as Config } from '../module'

const signature = '[`dbug`]'
const info = (msg: string) => consola.info(`${signature} ${msg}`)
const warn = (msg: string) => consola.warn(`${signature} ${msg}`)
const success = (msg: string) => consola.success(`${signature} ${msg}`)
export const configDefaults = {
  key: '',
  env: 'development',
  domain: 'https://dbug.nuxt.dev',
  log: false,
}
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
