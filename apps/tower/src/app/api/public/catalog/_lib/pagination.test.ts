import { describe, expect, it } from 'vitest'
import { decodeCursor, encodeCursor } from './pagination'

describe('catalog pagination cursor', () => {
  it('round-trips through encode/decode', () => {
    const cursor = { updatedAt: '2026-07-01T00:00:00Z', id: 'product-1' }
    expect(decodeCursor(encodeCursor(cursor))).toEqual(cursor)
  })

  it('decodes null/undefined/empty to null (start from the top)', () => {
    expect(decodeCursor(null)).toBeNull()
    expect(decodeCursor(undefined)).toBeNull()
    expect(decodeCursor('')).toBeNull()
  })

  it('never throws on a tampered or garbage cursor — degrades to null', () => {
    expect(decodeCursor('not-base64url-json')).toBeNull()
    expect(decodeCursor(Buffer.from(JSON.stringify({ foo: 'bar' })).toString('base64url'))).toBeNull()
    expect(decodeCursor(Buffer.from('not json at all').toString('base64url'))).toBeNull()
  })
})
