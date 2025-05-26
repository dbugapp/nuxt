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

describe('error filtering', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should filter common HTTP errors', async () => {
    // Import the function we want to test
    const { dbugReport } = await import('../src/runtime/server/utils/dbug')

    // Create a mock H3Event with the necessary properties
    const createMockEvent = (statusCode: number): H3Event => {
      return {
        node: {
          res: { statusCode },
        },
        // Add required H3Event properties
        __is_event__: true,
        context: {},
        _handled: false,
        _onBeforeResponseCalled: false,
        respondWith: vi.fn(),
        waitUntil: vi.fn(),
        fetch: vi.fn(),
        read: vi.fn(),
        readBody: vi.fn(),
        isFinished: false,
        isReadable: true,
        createError: vi.fn(),
        captureError: vi.fn(),
        handleError: vi.fn(),
        _locals: {},
        locals: {},
        headers: new Headers(),
      } as unknown as H3Event
    }

    // Test common HTTP errors that should be filtered
    const commonErrors = [400, 401, 403, 404, 405, 429]

    for (const statusCode of commonErrors) {
      // Reset mocks between tests
      vi.clearAllMocks()

      // Call dbugReport with the mock event
      await dbugReport(createMockEvent(statusCode), new Error(`Error ${statusCode}`))

      // Verify report was not called for this error
      expect(report).not.toHaveBeenCalled()
    }

    // Test an error that should be reported
    vi.clearAllMocks()
    await dbugReport(createMockEvent(500), new Error('Server Error'))
    expect(report).toHaveBeenCalledTimes(1)

    // Test with undefined event (should report)
    vi.clearAllMocks()
    await dbugReport(undefined, new Error('Unknown Error'))
    expect(report).toHaveBeenCalledTimes(1)
  })
})
