import { describe, it, expect, vi } from 'vitest'
import { shouldIgnoreError, report } from '../src/runtime/dbug'

// Mock the fetch function to avoid actual API calls
global.fetch = vi.fn(() => Promise.resolve({
  json: () => Promise.resolve({ meta: 'test' }),
})) as any

describe('shared error filtering', () => {
  it('should identify errors with statusCode property', () => {
    const errorWithStatusCode = { statusCode: 404, message: 'Not Found' }
    expect(shouldIgnoreError(errorWithStatusCode)).toBe(true)

    const errorWithNonIgnoredStatusCode = { statusCode: 500, message: 'Server Error' }
    expect(shouldIgnoreError(errorWithNonIgnoredStatusCode)).toBe(false)
  })

  it('should identify errors with status property', () => {
    const errorWithStatus = { status: 401, message: 'Unauthorized' }
    expect(shouldIgnoreError(errorWithStatus)).toBe(true)

    const errorWithNonIgnoredStatus = { status: 500, message: 'Server Error' }
    expect(shouldIgnoreError(errorWithNonIgnoredStatus)).toBe(false)
  })

  it('should identify errors with response.status property', () => {
    const errorWithResponseStatus = {
      response: { status: 403 },
      message: 'Forbidden',
    }
    expect(shouldIgnoreError(errorWithResponseStatus)).toBe(true)

    const errorWithNonIgnoredResponseStatus = {
      response: { status: 500 },
      message: 'Server Error',
    }
    expect(shouldIgnoreError(errorWithNonIgnoredResponseStatus)).toBe(false)
  })

  it('should not filter non-HTTP errors', () => {
    const genericError = new Error('Generic error')
    expect(shouldIgnoreError(genericError)).toBe(false)

    const nullError = null
    expect(shouldIgnoreError(nullError)).toBe(false)

    const undefinedError = undefined
    expect(shouldIgnoreError(undefinedError)).toBe(false)
  })

  it('should skip reporting for common HTTP errors', async () => {
    const mockConfig = {
      key: 'a'.repeat(32),
      env: 'test',
      domain: 'https://test.com',
      log: false,
      authUtils: false,
    }

    // Mock checkConfig to return true
    vi.mock('../src/runtime/dbug', async () => {
      const actual = await vi.importActual('../src/runtime/dbug')
      return {
        ...actual,
        checkConfig: () => true,
      }
    })

    // Test with a 404 error
    const error404 = { statusCode: 404, message: 'Not Found' }
    await report('app:error', error404, mockConfig, {})

    // Fetch should not be called for ignored errors
    expect(fetch).not.toHaveBeenCalled()
  })
})
