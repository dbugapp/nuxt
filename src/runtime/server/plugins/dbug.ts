import { defineNitroPlugin } from 'nitropack/runtime'
import { dbugReport } from '../utils/dbug'

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('error', async (error, { event }) => await dbugReport(event, error))
})
