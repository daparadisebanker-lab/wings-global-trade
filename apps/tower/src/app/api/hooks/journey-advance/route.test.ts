import { describe, expect, it, vi, beforeEach } from 'vitest'
import type { NextRequest } from 'next/server'

const { verifyRevalidateSignature } = vi.hoisted(() => ({ verifyRevalidateSignature: vi.fn() }))
vi.mock('@/lib/revalidate', () => ({ verifyRevalidateSignature }))

const { createServiceClient } = vi.hoisted(() => ({ createServiceClient: vi.fn() }))
vi.mock('@/lib/supabase/server', () => ({ createServiceClient }))

// emitServerEvent is fire-and-forget; stub it so the advance path doesn't reach Supabase.
const { emitServerEvent } = vi.hoisted(() => ({ emitServerEvent: vi.fn(() => Promise.resolve({ ok: true })) }))
vi.mock('@/lib/ingest/emit', () => ({ emitServerEvent, SERVER_SESSION: 'srv_tower_action' }))

import { POST } from './route'

function fakeRequest(body: string, headers: Record<string, string> = {}): NextRequest {
  const headerMap = new Map(Object.entries(headers).map(([k, v]) => [k.toLowerCase(), v]))
  return {
    text: () => Promise.resolve(body),
    headers: { get: (key: string) => headerMap.get(key.toLowerCase()) ?? null },
  } as unknown as NextRequest
}

type Resp = { data: unknown; error: unknown }

// A thenable query builder: chainable methods return `this`, and awaiting it (or
// .maybeSingle()) resolves the queued response for that table.
function makeBuilder(response: Resp) {
  const builder: Record<string, unknown> = {}
  for (const m of ['select', 'eq', 'neq', 'limit', 'order', 'insert', 'update']) {
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

describe('POST /api/hooks/journey-advance · auth gate', () => {
  beforeEach(() => vi.clearAllMocks())

  it('rejects a request with no/invalid signature before touching Supabase', async () => {
    verifyRevalidateSignature.mockReturnValue(false)

    const res = await POST(fakeRequest('{}'))

    expect(res.status).toBe(401)
    expect((await res.json()).error.code).toBe('UNAUTHORIZED')
    expect(createServiceClient).not.toHaveBeenCalled()
  })

  it('rejects malformed JSON on a validly-signed request', async () => {
    verifyRevalidateSignature.mockReturnValue(true)

    const res = await POST(fakeRequest('{not json', { 'x-wings-signature': SIG }))

    expect(res.status).toBe(400)
    expect((await res.json()).error.code).toBe('VALIDATION')
  })

  it('rejects an unknown field (strict body schema)', async () => {
    verifyRevalidateSignature.mockReturnValue(true)

    const res = await POST(fakeRequest(JSON.stringify({ bogus: 1 }), { 'x-wings-signature': SIG }))

    expect(res.status).toBe(400)
    expect((await res.json()).error.code).toBe('VALIDATION')
  })
})

describe('POST /api/hooks/journey-advance · reconciliation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    verifyRevalidateSignature.mockReturnValue(true)
  })

  it('returns INTERNAL when Supabase is unconfigured', async () => {
    createServiceClient.mockReturnValue(null)

    const res = await POST(fakeRequest('{}', { 'x-wings-signature': SIG }))

    expect(res.status).toBe(500)
    expect((await res.json()).error.code).toBe('INTERNAL')
  })

  it('advances a journey whose live container state has outrun its cached phase', async () => {
    createServiceClient.mockReturnValue(
      makeServiceClient({
        // 1st import_journeys read = the open-journey scan; 2nd = the update.
        import_journeys: [
          {
            data: [
              {
                id: 'jrn-1',
                quote_id: 'q-1',
                order_id: null,
                container_id: 'c-1',
                brand_id: 'b-1',
                lane_id: 'l-1',
                phase_set: 'STANDARD_IMPORT',
                current_phase: 'ACEPTADA',
              },
            ],
            error: null,
          },
          { data: null, error: null }, // update
        ],
        quotes: [{ data: { status: 'ACCEPTED' }, error: null }],
        containers: [{ data: { status: 'CLEARED' }, error: null }],
        journey_milestones: [
          { data: [], error: null }, // gatherState read
          { data: null, error: null }, // milestone insert
        ],
        brands: [{ data: { slug: 'aladin' }, error: null }],
        lanes: [{ data: { slug: 'machinery' }, error: null }],
      }),
    )

    const res = await POST(fakeRequest('{}', { 'x-wings-signature': SIG }))

    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.data.scanned).toBe(1)
    expect(json.data.advanced).toBe(1)
    expect(json.data.results[0]).toEqual({
      journeyId: 'jrn-1',
      advanced: true,
      fromPhase: 'ACEPTADA',
      toPhase: 'NACIONALIZADO',
    })
    expect(emitServerEvent).toHaveBeenCalledTimes(1)
    expect(emitServerEvent).toHaveBeenCalledWith(
      expect.objectContaining({ event: 'journey.phase.advanced', meta: expect.objectContaining({ to_phase: 'NACIONALIZADO', trigger: 'auto' }) }),
    )
  })

  it('is a no-op (no milestone, no event) when live state matches the cached phase', async () => {
    createServiceClient.mockReturnValue(
      makeServiceClient({
        import_journeys: [
          {
            data: [
              {
                id: 'jrn-2',
                quote_id: 'q-2',
                order_id: null,
                container_id: null,
                brand_id: 'b-1',
                lane_id: 'l-1',
                phase_set: 'STANDARD_IMPORT',
                current_phase: 'ACEPTADA',
              },
            ],
            error: null,
          },
        ],
        quotes: [{ data: { status: 'ACCEPTED' }, error: null }],
        journey_milestones: [{ data: [], error: null }],
      }),
    )

    const res = await POST(fakeRequest('{}', { 'x-wings-signature': SIG }))

    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.data.scanned).toBe(1)
    expect(json.data.advanced).toBe(0)
    expect(json.data.results[0].advanced).toBe(false)
    expect(emitServerEvent).not.toHaveBeenCalled()
  })
})
