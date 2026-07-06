import { describe, expect, it, vi, beforeEach } from 'vitest'
import type { NextRequest } from 'next/server'

const { verifyRevalidateSignature } = vi.hoisted(() => ({ verifyRevalidateSignature: vi.fn() }))
vi.mock('@/lib/revalidate', () => ({ verifyRevalidateSignature }))

const { createServiceClient } = vi.hoisted(() => ({ createServiceClient: vi.fn() }))
vi.mock('@/lib/supabase/server', () => ({ createServiceClient }))

import { POST } from './route'

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
  for (const m of ['select', 'eq', 'order', 'limit', 'or', 'in', 'insert', 'update']) {
    builder[m] = vi.fn(() => builder)
  }
  builder.maybeSingle = vi.fn(() => Promise.resolve(response))
  builder.single = vi.fn(() => Promise.resolve(response))
  ;(builder as { then: unknown }).then = (resolve: (v: Resp) => void, reject?: (e: unknown) => void) =>
    Promise.resolve(response).then(resolve, reject)
  return builder
}

function makeServiceClient(queue: Record<string, Resp[]>) {
  const counters: Record<string, number> = {}
  const from = (table: string) => {
    const i = counters[table] ?? 0
    counters[table] = i + 1
    const responses = queue[table] ?? []
    return makeBuilder(responses[i] ?? { data: null, error: null })
  }
  return { from, schema: () => ({ from }) }
}

const SIG = 'sha256=' + 'a'.repeat(64)

describe('POST /api/hooks/mister · auth + validation gate', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('rejects a request with no/invalid signature before the body is parsed', async () => {
    verifyRevalidateSignature.mockReturnValue(false)

    const res = await POST(
      fakeRequest(JSON.stringify({ session_id: 's1', lane: 'machinery', phase: 'started' })),
    )

    expect(res.status).toBe(401)
    const json = await res.json()
    expect(json.error.code).toBe('UNAUTHORIZED')
    expect(createServiceClient).not.toHaveBeenCalled()
  })

  it('rejects malformed JSON on a validly-signed request', async () => {
    verifyRevalidateSignature.mockReturnValue(true)

    const res = await POST(fakeRequest('{not json', { 'x-wings-signature': SIG }))

    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error.code).toBe('VALIDATION')
  })

  it('rejects a `started` session that carries a contact object (PII before conversion — Directive 6)', async () => {
    verifyRevalidateSignature.mockReturnValue(true)

    const res = await POST(
      fakeRequest(
        JSON.stringify({
          session_id: 's1',
          lane: 'machinery',
          phase: 'started',
          contact: { full_name: 'Jane Buyer', email: 'jane@example.com' },
        }),
        { 'x-wings-signature': SIG },
      ),
    )

    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error.code).toBe('VALIDATION')
    expect(createServiceClient).not.toHaveBeenCalled()
  })

  it('accepts a contact object on phase=completed (the actual conversion point)', async () => {
    verifyRevalidateSignature.mockReturnValue(true)
    createServiceClient.mockReturnValue(
      makeServiceClient({
        lanes: [{ data: { id: 'lane-1', brand_id: 'brand-1', archetype: 'EQUIPMENT' }, error: null }],
        mister_projects: [{ data: { id: 'session-uuid' }, error: null }],
        contacts: [
          { data: [], error: null }, // no existing contact match
          { data: null, error: null }, // insert new contact
        ],
        accounts: [{ data: { id: 'acct-1' }, error: null }], // insert new account
        rfqs: [
          { data: null, error: null }, // no existing rfq for this session
          { data: { id: 'rfq-1' }, error: null }, // create
        ],
      }),
    )

    const res = await POST(
      fakeRequest(
        JSON.stringify({
          session_id: 's1',
          lane: 'machinery',
          phase: 'completed',
          contact: { full_name: 'Jane Buyer', email: 'jane@example.com' },
        }),
        { 'x-wings-signature': SIG },
      ),
    )

    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.data).toEqual({ rfqId: 'rfq-1', accountId: 'acct-1', created: true })
  })
})

describe('POST /api/hooks/mister · RFQ create/update', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    verifyRevalidateSignature.mockReturnValue(true)
  })

  it('returns NOT_FOUND when the lane slug does not resolve', async () => {
    createServiceClient.mockReturnValue(makeServiceClient({ lanes: [{ data: null, error: null }] }))

    const res = await POST(
      fakeRequest(JSON.stringify({ session_id: 's1', lane: 'nope', phase: 'started' }), {
        'x-wings-signature': SIG,
      }),
    )

    expect(res.status).toBe(404)
    const json = await res.json()
    expect(json.error.code).toBe('NOT_FOUND')
  })

  it('returns NOT_FOUND when the Mister session_id does not resolve', async () => {
    createServiceClient.mockReturnValue(
      makeServiceClient({
        lanes: [{ data: { id: 'lane-1', brand_id: 'brand-1', archetype: 'EQUIPMENT' }, error: null }],
        mister_projects: [{ data: null, error: null }],
      }),
    )

    const res = await POST(
      fakeRequest(JSON.stringify({ session_id: 'unknown', lane: 'machinery', phase: 'started' }), {
        'x-wings-signature': SIG,
      }),
    )

    expect(res.status).toBe(404)
  })

  it('creates a new RFQ at the archetype first stage for a fresh session (no contact)', async () => {
    createServiceClient.mockReturnValue(
      makeServiceClient({
        lanes: [{ data: { id: 'lane-1', brand_id: 'brand-1', archetype: 'EQUIPMENT' }, error: null }],
        mister_projects: [{ data: { id: 'session-uuid' }, error: null }],
        rfqs: [
          { data: null, error: null }, // no existing rfq
          { data: { id: 'rfq-1' }, error: null }, // insert
        ],
      }),
    )

    const res = await POST(
      fakeRequest(JSON.stringify({ session_id: 's1', lane: 'machinery', phase: 'started' }), {
        'x-wings-signature': SIG,
      }),
    )

    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.data).toEqual({ rfqId: 'rfq-1', accountId: null, created: true })
  })

  it('never overwrites an already-linked account on a repeat call for the same session', async () => {
    createServiceClient.mockReturnValue(
      makeServiceClient({
        lanes: [{ data: { id: 'lane-1', brand_id: 'brand-1', archetype: 'EQUIPMENT' }, error: null }],
        mister_projects: [{ data: { id: 'session-uuid' }, error: null }],
        contacts: [{ data: [{ account_id: 'acct-existing' }], error: null }],
        accounts: [{ data: [{ id: 'acct-existing' }], error: null }],
        rfqs: [{ data: { id: 'rfq-1', account_id: 'acct-original' }, error: null }],
      }),
    )

    const res = await POST(
      fakeRequest(
        JSON.stringify({
          session_id: 's1',
          lane: 'machinery',
          phase: 'handoff',
          contact: { full_name: 'Someone Else', email: 'someone@example.com' },
        }),
        { 'x-wings-signature': SIG },
      ),
    )

    const json = await res.json()
    // rfq already had an account (`acct-original`) — the hook must not clobber it,
    // even though this call's contact resolved to a different account.
    expect(json.data).toEqual({ rfqId: 'rfq-1', accountId: 'acct-original', created: false })
  })
})
