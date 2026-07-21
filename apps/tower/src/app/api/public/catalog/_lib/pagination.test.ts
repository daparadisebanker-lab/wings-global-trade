import { describe, expect, it } from 'vitest'
import { decodeCursor, encodeCursor } from './pagination'

describe('catalog pagination cursor', () => {
  it('round-trips through encode/decode', () => {
    // `products.id` is a uuid and `updated_at` a timestamptz — the shapes the
    // cursor is validated against (a real page-boundary cursor always carries
    // these), so the fixture uses production-accurate values.
    const cursor = { updatedAt: '2026-07-01T00:00:00Z', id: '2f1c9a7e-3b4d-4e5f-8a9b-0c1d2e3f4a5b' }
    expect(decodeCursor(encodeCursor(cursor))).toEqual(cursor)
  })

  it('rejects a cursor whose fields carry PostgREST filter metacharacters', () => {
    // Injection guard: a tampered id/updatedAt with `,()` must not reach the
    // keyset .or() filter — it degrades to null (start from the top).
    const inject = { updatedAt: '2026-07-01T00:00:00Z', id: 'x,or(status.eq.DRAFT)' }
    expect(decodeCursor(encodeCursor(inject))).toBeNull()
    const badTs = { updatedAt: 'lt.2020),and(id.gt.0', id: '2f1c9a7e-3b4d-4e5f-8a9b-0c1d2e3f4a5b' }
    expect(decodeCursor(encodeCursor(badTs))).toBeNull()
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
