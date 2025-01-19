import type { ModuleOptions } from '../module'

interface ErrorPayload {
  name: string
  message: string
  stack: string
  cause: string
}

export const careVueError = (error: unknown, config: ModuleOptions) => {
  sendError('vue:error', error as unknown as ErrorPayload, config)
}

export const careAppError = (error: unknown, config: ModuleOptions) => {
  sendError('app:error', error as unknown as ErrorPayload, config)
}

export const careNitroError = (error: unknown, config: ModuleOptions) => {
  sendError('nitro:error', error as unknown as ErrorPayload, config)
}

const sendError = async (hook: string, error: ErrorPayload, config: ModuleOptions) => {
  const payload = {
    hook: hook,
    name: error.name,
    message: error.message,
    stack: error.stack,
    cause: error.cause,
    timestamp: Math.floor(Date.now() / 1000),
    client: import.meta.client,
    os: {
      platform: process.platform,
      arch: process.arch,
      version: process.version,
    },
  }
  try {
    const response = await fetch(`${config.apiDomain}/api/entry`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apiKey: config.apiKey,
        environment: 'production',
        payload: JSON.stringify(payload),
      }),
    })
    const data = await response.json()
    console.log('Error sent successfully:', data.meta)
    return data
  }
  catch (err) {
    console.error('Failed to send error:', err)
  }
}
