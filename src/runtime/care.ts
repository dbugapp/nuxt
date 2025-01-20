interface Config {
  apiKey: string
  apiDomain?: string
}

interface ErrorPayload {
  name: string
  message: string
  stack: string
  hook: string
  cause: string
  client?: boolean
  timestamp: number
  os: {
    platform: string
    arch: string
    version: string
  }
}

export const careVueError = (error: unknown, config: Config) => {
  sendError('vue:error', error as unknown as ErrorPayload, config)
}

export const careAppError = (error: unknown, config: Config) => {
  sendError('app:error', error as unknown as ErrorPayload, config)
}

export const careNitroError = (error: unknown, config: Config) => {
  sendError('nitro:error', error as unknown as ErrorPayload, config)
}

const sendError = async (hook: string, error: ErrorPayload, config: Config) => {
  const payload: ErrorPayload = {
    name: error.name,
    message: error.message,
    stack: error.stack,
    hook: hook,
    cause: error.cause,
    client: import.meta.client,
    timestamp: Math.floor(Date.now() / 1000),
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
