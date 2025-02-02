import { defineNitroPlugin } from 'nitropack/runtime'
import { careReport } from '../utils/care'

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('error', async (error, { event }) => await careReport(event, error))
})
