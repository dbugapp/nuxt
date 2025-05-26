import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { H3Event } from 'h3'
import { report } from '../src/runtime/dbug'

// Mock the report function to avoid actual API calls
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
    // Get direct reference to the original dbugReport function
    const dbugModule = await import('../src/runtime/server/utils/dbug')
    const originalDbugReport = dbugModule.dbugReport

    // Create a type-safe mock for H3Event
    type MockEvent = Pick<H3Event, 'node'>

    // Test common HTTP errors that should be filtered
    const commonErrors = [400, 401, 403, 404, 405, 429]

    for (const statusCode of commonErrors) {
      // Reset mocks between tests
      vi.clearAllMocks()

      // Create a simple mock event with just the statusCode
      const mockEvent = {
        node: {
          res: { statusCode },
        },
      } as MockEvent

      // Call dbugReport with the mock event
      await originalDbugReport(mockEvent as H3Event, new Error(`Error ${statusCode}`))

      // Verify report was not called for this error
      expect(report).not.toHaveBeenCalled()
    }
  })

  it('should report server errors', async () => {
    // Get direct reference to the original dbugReport function
    const dbugModule = await import('../src/runtime/server/utils/dbug')
    const originalDbugReport = dbugModule.dbugReport

    // Create a type-safe mock for H3Event
    type MockEvent = Pick<H3Event, 'node'>

    // Test server errors that should be reported
    const serverErrors = [500, 502, 503]

    for (const statusCode of serverErrors) {
      // Reset mocks between tests
      vi.clearAllMocks()

      // Create a simple mock event with just the statusCode
      const mockEvent = {
        node: {
          res: { statusCode },
        },
      } as MockEvent

      // Call dbugReport with the mock event
      await originalDbugReport(mockEvent as H3Event, new Error(`Error ${statusCode}`))

      // Verify report was called for this error
      expect(report).toHaveBeenCalledTimes(1)
    }
  })

  it('should report errors when event is undefined', async () => {
    // Get direct reference to the original dbugReport function
    const dbugModule = await import('../src/runtime/server/utils/dbug')
    const originalDbugReport = dbugModule.dbugReport

    // Reset mocks
    vi.clearAllMocks()

    // Call dbugReport with undefined event
    await originalDbugReport(undefined, new Error('Unknown Error'))

    // Verify report was called
    expect(report).toHaveBeenCalledTimes(1)
  })
})
