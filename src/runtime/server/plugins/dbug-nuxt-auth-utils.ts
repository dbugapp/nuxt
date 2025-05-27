import { defineNitroPlugin } from 'nitropack/runtime'
import { dbugReport } from '../utils/dbug'
// @ts-expect-error getUserSession is supplied by nuxt-auth-utils
import { getUserSession } from '#imports'

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('error', async (error, { event }) => {
    const session = await getUserSession(event)
    await dbugReport(event, error, session?.user)
  })
})
