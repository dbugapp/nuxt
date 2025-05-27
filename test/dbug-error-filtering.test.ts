import { describe, it, expect, vi, beforeEach } from 'vitest'
import { report } from '../src/runtime/dbug'

vi.mock('../src/runtime/dbug', async () => {
  const actual = await vi.importActual('../src/runtime/dbug')
  return {
    ...actual,
    report: vi.fn(),
    checkConfig: () => true,
  }
})

describe('dbug error filtering', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should not report errors with HTTP status codes', async () => {
    const dbugModule = await import('../src/runtime/server/utils/dbug')
    const originalDbugReport = dbugModule.dbugReport

    // Test errors with status code properties
    const commonErrors = [
      { statusCode: 400, message: 'Bad Request' },
      { statusCode: 401, message: 'Unauthorized' },
      { statusCode: 403, message: 'Forbidden' },
      { statusCode: 404, message: 'Not Found' },
      { status: 405, message: 'Method Not Allowed' },
      { response: { status: 429 }, message: 'Too Many Requests' },
    ]

    for (const error of commonErrors) {
      vi.clearAllMocks()
      await originalDbugReport(undefined, error)
      expect(report).not.toHaveBeenCalled()
    }
  })

  it('should report server errors', async () => {
    const dbugModule = await import('../src/runtime/server/utils/dbug')
    const originalDbugReport = dbugModule.dbugReport

    // Test server errors
    const serverErrors = [
      { statusCode: 500, message: 'Internal Server Error' },
      { status: 502, message: 'Bad Gateway' },
      { response: { status: 503 }, message: 'Service Unavailable' },
    ]

    for (const error of serverErrors) {
      vi.clearAllMocks()
      await originalDbugReport(undefined, error)
      expect(report).toHaveBeenCalledTimes(1)
    }
  })

  it('should report errors without status codes', async () => {
    const dbugModule = await import('../src/runtime/server/utils/dbug')
    const originalDbugReport = dbugModule.dbugReport

    vi.clearAllMocks()
    await originalDbugReport(undefined, new Error('Unknown Error'))
    expect(report).toHaveBeenCalledTimes(1)
  })
})
