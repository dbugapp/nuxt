import { describe, it, expect } from 'vitest'
import { shouldIgnoreError } from '../src/runtime/dbug'

describe('shouldIgnoreError functionality', () => {
  it('should correctly identify HTTP status codes to ignore', () => {
    // Test with statusCode property
    expect(shouldIgnoreError({ statusCode: 400 })).toBe(true)
    expect(shouldIgnoreError({ statusCode: 401 })).toBe(true)
    expect(shouldIgnoreError({ statusCode: 403 })).toBe(true)
    expect(shouldIgnoreError({ statusCode: 404 })).toBe(true)
    expect(shouldIgnoreError({ statusCode: 405 })).toBe(true)
    expect(shouldIgnoreError({ statusCode: 429 })).toBe(true)

    // Test with status property
    expect(shouldIgnoreError({ status: 400 })).toBe(true)
    expect(shouldIgnoreError({ status: 401 })).toBe(true)

    // Test with response.status property
    expect(shouldIgnoreError({ response: { status: 404 } })).toBe(true)

    // Test with non-ignored status codes
    expect(shouldIgnoreError({ statusCode: 500 })).toBe(false)
    expect(shouldIgnoreError({ status: 502 })).toBe(false)
    expect(shouldIgnoreError({ response: { status: 503 } })).toBe(false)

    // Test with non-HTTP errors
    expect(shouldIgnoreError(new Error('Generic error'))).toBe(false)
    expect(shouldIgnoreError(null)).toBe(false)
    expect(shouldIgnoreError(undefined)).toBe(false)
  })
})
