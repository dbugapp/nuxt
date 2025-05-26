import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { H3Event } from 'h3'

// Mock the report function to avoid actual API calls
// This needs to be at the top level due to hoisting
vi.mock('../src/runtime/dbug', () => ({
  report: vi.fn(),
  getAgent: vi.fn(),
}))

describe('shouldIgnoreError functionality', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should correctly identify HTTP status codes to ignore', async () => {
    // Import the module with our function
    const { dbugReport } = await import('../src/runtime/server/utils/dbug')

    // Get reference to the mocked report function
    const { report } = await import('../src/runtime/dbug')

    // Create a type-safe mock for H3Event
    type MockEvent = Pick<H3Event, 'node'>

    // Test status codes that should be ignored
    const ignoredStatusCodes = [400, 401, 403, 404, 405, 429]

    for (const statusCode of ignoredStatusCodes) {
      // Reset mocks between tests
      vi.clearAllMocks()

      // Create a mock event with the status code
      const mockEvent = {
        node: {
          res: { statusCode },
        },
      } as MockEvent

      // Call dbugReport with the mock event
      await dbugReport(mockEvent as H3Event, new Error(`Error ${statusCode}`))

      // Verify the error was ignored (report not called)
      expect(report).not.toHaveBeenCalled()
    }

    // Test status codes that should not be ignored
    const nonIgnoredStatusCodes = [500, 502, 503]

    for (const statusCode of nonIgnoredStatusCodes) {
      // Reset mocks between tests
      vi.clearAllMocks()

      // Create a mock event with the status code
      const mockEvent = {
        node: {
          res: { statusCode },
        },
      } as MockEvent

      // Call dbugReport with the mock event
      await dbugReport(mockEvent as H3Event, new Error(`Error ${statusCode}`))

      // Verify the error was not ignored (report called)
      expect(report).toHaveBeenCalled()
    }
  })
})
