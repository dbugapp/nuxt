import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { H3Event } from 'h3'

vi.mock('../src/runtime/dbug', () => ({
  report: vi.fn(),
  getAgent: vi.fn(),
}))

describe('shouldIgnoreError functionality', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should correctly identify HTTP status codes to ignore', async () => {
    const { dbugReport } = await import('../src/runtime/server/utils/dbug')
    const { report } = await import('../src/runtime/dbug')

    type MockEvent = Pick<H3Event, 'node'>
    const ignoredStatusCodes = [400, 401, 403, 404, 405, 429]

    for (const statusCode of ignoredStatusCodes) {
      vi.clearAllMocks()

      const mockEvent = {
        node: {
          res: { statusCode },
        },
      } as MockEvent

      await dbugReport(mockEvent as H3Event, new Error(`Error ${statusCode}`))
      expect(report).not.toHaveBeenCalled()
    }

    const nonIgnoredStatusCodes = [500, 502, 503]

    for (const statusCode of nonIgnoredStatusCodes) {
      vi.clearAllMocks()

      const mockEvent = {
        node: {
          res: { statusCode },
        },
      } as MockEvent

      await dbugReport(mockEvent as H3Event, new Error(`Error ${statusCode}`))
      expect(report).toHaveBeenCalled()
    }
  })
})
