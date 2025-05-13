import { defineNitroPlugin } from 'nitropack/runtime'
import { dbugReport } from '../utils/dbug'

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('error', async (error, { event }) => {
    // @ts-expect-error getUserSession is supplied by nuxt-auth-utils
    const session = await getUserSession(event)
    await dbugReport(event, error, session?.user)
  })
})
