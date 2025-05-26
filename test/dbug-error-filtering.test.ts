import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { H3Event } from 'h3'
import { report } from '../src/runtime/dbug'

vi.mock('../src/runtime/dbug', async () => {
  const actual = await vi.importActual('../src/runtime/dbug')
  return {
    ...actual,
    report: vi.fn(),
  }
})

describe('dbug error filtering', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should not report common HTTP errors', async () => {
    const dbugModule = await import('../src/runtime/server/utils/dbug')
    const originalDbugReport = dbugModule.dbugReport

    type MockEvent = Pick<H3Event, 'node'>
    const commonErrors = [400, 401, 403, 404, 405, 429]

    for (const statusCode of commonErrors) {
      vi.clearAllMocks()

      const mockEvent = {
        node: {
          res: { statusCode },
        },
      } as MockEvent

      await originalDbugReport(mockEvent as H3Event, new Error(`Error ${statusCode}`))
      expect(report).not.toHaveBeenCalled()
    }
  })

  it('should report server errors', async () => {
    const dbugModule = await import('../src/runtime/server/utils/dbug')
    const originalDbugReport = dbugModule.dbugReport

    type MockEvent = Pick<H3Event, 'node'>
    const serverErrors = [500, 502, 503]

    for (const statusCode of serverErrors) {
      vi.clearAllMocks()

      const mockEvent = {
        node: {
          res: { statusCode },
        },
      } as MockEvent

      await originalDbugReport(mockEvent as H3Event, new Error(`Error ${statusCode}`))
      expect(report).toHaveBeenCalledTimes(1)
    }
  })

  it('should report errors when event is undefined', async () => {
    const dbugModule = await import('../src/runtime/server/utils/dbug')
    const originalDbugReport = dbugModule.dbugReport

    vi.clearAllMocks()
    await originalDbugReport(undefined, new Error('Unknown Error'))
    expect(report).toHaveBeenCalledTimes(1)
  })
})
