import { describe, expect, it, beforeEach } from 'vitest'
import { createHmac } from 'node:crypto'
import { detectPiiShape, bodyHasPiiShape } from './pii'
import { checkRateLimit, __resetRateLimit } from './rate-limit'
import { verifyIngestSignature } from './hmac'
import { ingestEventSchema } from './schema'

describe('ingest · PII-shape guard', () => {
  it('flags an email anywhere in the text', () => {
    expect(detectPiiShape('contact jane@example.com now')).toBe('email')
  })

  it('flags phone shapes (international + separators)', () => {
    expect(detectPiiShape('+51 987 654 321')).toBe('phone')
    expect(detectPiiShape('(305) 555-0142')).toBe('phone')
  })

  it('passes clean anonymous payloads', () => {
    expect(detectPiiShape('{"event":"product_view","lane":"machinery"}')).toBeNull()
  })

  it('does not flag the opaque session_hash as a phone number', () => {
    const raw = JSON.stringify({ session_hash: '1234567890abcdef1234', event: 'page_view' })
    // The all-numeric-ish hash is stripped before scanning → no false positive.
    expect(bodyHasPiiShape(raw, '1234567890abcdef1234')).toBeNull()
  })

  it('still catches PII hidden in meta even with a valid session_hash', () => {
    const raw = JSON.stringify({ session_hash: 'abcd1234abcd1234', meta: { email: 'x@y.com' } })
    expect(bodyHasPiiShape(raw, 'abcd1234abcd1234')).toBe('email')
  })
})

describe('ingest · rate limit (fixed window)', () => {
  beforeEach(() => __resetRateLimit())

  it('allows up to the limit, then throttles with a positive retry-after', () => {
    const cfg = { limit: 3, windowMs: 1000 }
    const now = 1_000_000
    for (let i = 0; i < 3; i++) {
      expect(checkRateLimit('wings:s1', cfg, now).allowed).toBe(true)
    }
    const blocked = checkRateLimit('wings:s1', cfg, now)
    expect(blocked.allowed).toBe(false)
    expect(blocked.retryAfterSeconds).toBe(1)
  })

  it('isolates buckets per key and resets after the window', () => {
    const cfg = { limit: 1, windowMs: 1000 }
    const now = 2_000_000
    expect(checkRateLimit('wings:a', cfg, now).allowed).toBe(true)
    expect(checkRateLimit('wings:b', cfg, now).allowed).toBe(true) // different key
    expect(checkRateLimit('wings:a', cfg, now).allowed).toBe(false) // same key, over
    expect(checkRateLimit('wings:a', cfg, now + 1001).allowed).toBe(true) // window rolled
  })
})

describe('ingest · per-brand HMAC', () => {
  beforeEach(() => {
    process.env.INGEST_HMAC_KEY_WINGS = 'wings-secret'
    process.env.INGEST_HMAC_KEY_ALADIN = 'aladin-secret'
  })

  function sign(body: string, secret: string) {
    return `sha256=${createHmac('sha256', secret).update(body, 'utf8').digest('hex')}`
  }

  it('verifies with the matching brand key and reports the brand', () => {
    const body = '{"brand":"aladin"}'
    const out = verifyIngestSignature(body, sign(body, 'aladin-secret'))
    expect(out).toEqual({ ok: true, brand: 'aladin' })
  })

  it('fails closed on a wrong/missing signature', () => {
    expect(verifyIngestSignature('{}', `sha256=${'0'.repeat(64)}`).ok).toBe(false)
    expect(verifyIngestSignature('{}', null).ok).toBe(false)
  })
})

describe('ingest · schema', () => {
  it('accepts a well-formed anonymous event', () => {
    const r = ingestEventSchema.safeParse({
      brand: 'wings',
      lane: 'machinery',
      event: 'spec_open',
      session_hash: 'a'.repeat(24),
    })
    expect(r.success).toBe(true)
  })

  it('rejects an email-shaped session_hash at the schema layer', () => {
    const r = ingestEventSchema.safeParse({
      brand: 'wings',
      lane: 'machinery',
      event: 'spec_open',
      session_hash: 'jane@example.com',
    })
    expect(r.success).toBe(false)
  })
})
