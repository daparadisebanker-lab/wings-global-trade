import { describe, expect, it, vi, beforeEach, beforeAll } from 'vitest'
import { createHmac } from 'node:crypto'
import type { NextRequest } from 'next/server'

// Real HMAC + schema + PII are exercised end-to-end; only the rate-limiter is
// swapped for a controllable fn (its own windowing logic is unit-tested in
// ingest.test.ts), and the service client is faked so no DB is touched.
vi.mock('@/lib/ingest', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/ingest')>()
  return { ...actual, checkRateLimit: vi.fn(() => ({ allowed: true, retryAfterSeconds: 0 })) }
})

const { createServiceClient } = vi.hoisted(() => ({ createServiceClient: vi.fn() }))
vi.mock('@/lib/supabase/server', () => ({ createServiceClient }))

import { POST } from './route'
import { checkRateLimit } from '@/lib/ingest'

const SECRET = 'wings-ingest-test-secret'

beforeAll(() => {
  process.env.INGEST_HMAC_KEY_WINGS = SECRET
  process.env.INGEST_HMAC_KEY_ALADIN = 'aladin-ingest-test-secret'
})

function sign(rawBody: string, secret = SECRET): string {
  return `sha256=${createHmac('sha256', secret).update(rawBody, 'utf8').digest('hex')}`
}

function fakeRequest(body: string, headers: Record<string, string> = {}): NextRequest {
  const headerMap = new Map(Object.entries(headers).map(([k, v]) => [k.toLowerCase(), v]))
  return {
    text: () => Promise.resolve(body),
    headers: { get: (key: string) => headerMap.get(key.toLowerCase()) ?? null },
  } as unknown as NextRequest
}

type Resp = { data: unknown; error: unknown }
function makeBuilder(response: Resp) {
  const builder: Record<string, unknown> = {}
  for (const m of ['select', 'eq', 'insert']) builder[m] = vi.fn(() => builder)
  ;(builder as { then: unknown }).then = (resolve: (v: Resp) => void, reject?: (e: unknown) => void) =>
    Promise.resolve(response).then(resolve, reject)
  return builder
}
function makeServiceClient(response: Resp = { data: null, error: null }) {
  const from = vi.fn(() => makeBuilder(response))
  const schema = vi.fn(() => ({ from }))
  return { schema, from, __from: from, __schema: schema }
}

const VALID = { brand: 'wings', lane: 'machinery', event: 'product_view', session_hash: 'a'.repeat(32) }

describe('POST /api/ingest · security gates', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(checkRateLimit).mockReturnValue({ allowed: true, retryAfterSeconds: 0 })
  })

  it('rejects a missing/invalid signature BEFORE parsing the body (401, DB untouched)', async () => {
    const raw = JSON.stringify(VALID)
    const res = await POST(fakeRequest(raw, { 'x-wings-signature': `sha256=${'0'.repeat(64)}` }))

    expect(res.status).toBe(401)
    expect((await res.json()).error.code).toBe('UNAUTHORIZED')
    expect(createServiceClient).not.toHaveBeenCalled()
    expect(checkRateLimit).not.toHaveBeenCalled()
  })

  it('rejects a PII-shaped payload (email in meta) with VALIDATION, before any write', async () => {
    createServiceClient.mockReturnValue(makeServiceClient())
    const raw = JSON.stringify({ ...VALID, meta: { email: 'jane@example.com' } })
    const res = await POST(fakeRequest(raw, { 'x-wings-signature': sign(raw) }))

    expect(res.status).toBe(400)
    expect((await res.json()).error.code).toBe('VALIDATION')
    expect(createServiceClient).not.toHaveBeenCalled()
  })

  it('rejects a phone-shaped payload with VALIDATION', async () => {
    createServiceClient.mockReturnValue(makeServiceClient())
    const raw = JSON.stringify({ ...VALID, meta: { note: 'call +51 987 654 321' } })
    const res = await POST(fakeRequest(raw, { 'x-wings-signature': sign(raw) }))

    expect(res.status).toBe(400)
    expect((await res.json()).error.code).toBe('VALIDATION')
  })

  it('rate-limits per session_hash with RATE_LIMITED + Retry-After, before any write', async () => {
    vi.mocked(checkRateLimit).mockReturnValue({ allowed: false, retryAfterSeconds: 42 })
    createServiceClient.mockReturnValue(makeServiceClient())
    const raw = JSON.stringify(VALID)
    const res = await POST(fakeRequest(raw, { 'x-wings-signature': sign(raw) }))

    expect(res.status).toBe(429)
    expect((await res.json()).error.code).toBe('RATE_LIMITED')
    expect(res.headers.get('Retry-After')).toBe('42')
    expect(createServiceClient).not.toHaveBeenCalled()
  })

  it('rejects a valid Wings signature that claims a different brand (cross-brand forgery)', async () => {
    const raw = JSON.stringify({ ...VALID, brand: 'aladin' }) // signed with the WINGS key
    const res = await POST(fakeRequest(raw, { 'x-wings-signature': sign(raw, SECRET) }))

    expect(res.status).toBe(401)
    expect((await res.json()).error.code).toBe('UNAUTHORIZED')
  })

  it('rejects an unknown event name with VALIDATION', async () => {
    const raw = JSON.stringify({ ...VALID, event: 'add_to_cart' })
    const res = await POST(fakeRequest(raw, { 'x-wings-signature': sign(raw) }))

    expect(res.status).toBe(400)
    expect((await res.json()).error.code).toBe('VALIDATION')
  })

  it('accepts a valid, signed, PII-free event → 202 and inserts into tower.events only', async () => {
    const service = makeServiceClient()
    createServiceClient.mockReturnValue(service)
    const raw = JSON.stringify({ ...VALID, product_slug: 'cnc-lathe', path: '/machinery/cnc-lathe' })
    const res = await POST(fakeRequest(raw, { 'x-wings-signature': sign(raw) }))

    expect(res.status).toBe(202)
    expect((await res.json()).data).toEqual({ accepted: true })
    // Writes go through the tower schema, to the events table, and nowhere else.
    expect(service.__schema).toHaveBeenCalledWith('tower')
    expect(service.__from).toHaveBeenCalledWith('events')
    expect(service.__from).toHaveBeenCalledTimes(1)
  })
})
