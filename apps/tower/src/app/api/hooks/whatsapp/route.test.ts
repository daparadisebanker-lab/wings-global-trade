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
const validBody = {
  wa_message_id: 'wamid.1',
  from: '+50760250735',
  to: '+50760250736',
  body: 'Hola, quiero cotizar',
}

describe('POST /api/hooks/whatsapp · auth + validation gate', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('rejects a request with no/invalid signature before the body is parsed', async () => {
    verifyRevalidateSignature.mockReturnValue(false)

    const res = await POST(fakeRequest(JSON.stringify(validBody)))

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

  it('rejects a non-phone-shaped `from`', async () => {
    verifyRevalidateSignature.mockReturnValue(true)

    const res = await POST(
      fakeRequest(JSON.stringify({ ...validBody, from: 'not-a-phone' }), { 'x-wings-signature': SIG }),
    )

    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error.code).toBe('VALIDATION')
    expect(createServiceClient).not.toHaveBeenCalled()
  })
})

describe('POST /api/hooks/whatsapp · idempotency + threading', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    verifyRevalidateSignature.mockReturnValue(true)
  })

  it('no-ops a webhook retry (same wa_message_id already stored)', async () => {
    createServiceClient.mockReturnValue(
      makeServiceClient({
        whatsapp_messages: [{ data: { id: 'msg-1', rfq_id: 'rfq-1', account_id: 'acct-1' }, error: null }],
      }),
    )

    const res = await POST(fakeRequest(JSON.stringify(validBody), { 'x-wings-signature': SIG }))

    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.data).toMatchObject({ messageId: 'msg-1', rfqId: 'rfq-1', duplicate: true })
  })

  it('threads onto the account\'s most recent RFQ when the number matches an existing contact', async () => {
    createServiceClient.mockReturnValue(
      makeServiceClient({
        whatsapp_messages: [
          { data: null, error: null }, // no duplicate
          { data: { id: 'msg-2' }, error: null }, // insert
        ],
        contacts: [{ data: [{ account_id: 'acct-1' }], error: null }],
        rfqs: [{ data: [{ id: 'rfq-9' }], error: null }], // latest rfq for the account
      }),
    )

    const res = await POST(fakeRequest(JSON.stringify(validBody), { 'x-wings-signature': SIG }))

    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.data).toEqual({ messageId: 'msg-2', rfqId: 'rfq-9', accountId: 'acct-1', triaged: false })
  })

  it('lands in the Triage Queue (both FKs null) when the number matches no contact', async () => {
    createServiceClient.mockReturnValue(
      makeServiceClient({
        whatsapp_messages: [
          { data: null, error: null }, // no duplicate
          { data: { id: 'msg-3' }, error: null }, // insert
        ],
        contacts: [{ data: [], error: null }], // no match
      }),
    )

    const res = await POST(fakeRequest(JSON.stringify(validBody), { 'x-wings-signature': SIG }))

    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.data).toEqual({ messageId: 'msg-3', rfqId: null, accountId: null, triaged: true })
  })

  it('creates a new RFQ from lane_hint when the account has no open RFQ yet', async () => {
    createServiceClient.mockReturnValue(
      makeServiceClient({
        whatsapp_messages: [
          { data: null, error: null }, // no duplicate
          { data: { id: 'msg-4' }, error: null }, // insert
        ],
        contacts: [{ data: [{ account_id: 'acct-1' }], error: null }],
        rfqs: [
          { data: [], error: null }, // no existing rfq for the account
          { data: { id: 'rfq-new' }, error: null }, // insert
        ],
        brands: [{ data: { id: 'brand-wings' }, error: null }],
        lanes: [{ data: { id: 'lane-1', archetype: 'EQUIPMENT' }, error: null }],
      }),
    )

    const res = await POST(
      fakeRequest(JSON.stringify({ ...validBody, lane_hint: 'machinery' }), { 'x-wings-signature': SIG }),
    )

    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.data).toEqual({ messageId: 'msg-4', rfqId: 'rfq-new', accountId: 'acct-1', triaged: false })
  })
})
