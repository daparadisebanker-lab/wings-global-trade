import { describe, expect, it, vi, beforeEach } from 'vitest'
import type { NextRequest } from 'next/server'

const { triggerRevalidate, verifyRevalidateSignature } = vi.hoisted(() => ({
  triggerRevalidate: vi.fn(),
  verifyRevalidateSignature: vi.fn(),
}))

vi.mock('@/lib/revalidate', () => ({ triggerRevalidate, verifyRevalidateSignature }))

import { POST } from './route'

function fakeRequest(body: string, headers: Record<string, string> = {}): NextRequest {
  const headerMap = new Map(Object.entries(headers).map(([k, v]) => [k.toLowerCase(), v]))
  return {
    text: () => Promise.resolve(body),
    headers: { get: (key: string) => headerMap.get(key.toLowerCase()) ?? null },
  } as unknown as NextRequest
}

describe('POST /api/hooks/revalidate', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('rejects a request with no signature header before touching the body', async () => {
    verifyRevalidateSignature.mockReturnValue(false)

    const res = await POST(fakeRequest(JSON.stringify({ laneSlug: 'provisions' })))

    expect(res.status).toBe(401)
    const body = await res.json()
    expect(body.error.code).toBe('UNAUTHORIZED')
    expect(triggerRevalidate).not.toHaveBeenCalled()
  })

  it('rejects an invalid signature', async () => {
    verifyRevalidateSignature.mockReturnValue(false)

    const res = await POST(
      fakeRequest(JSON.stringify({ laneSlug: 'provisions' }), {
        'x-revalidate-signature': 'sha256=deadbeef',
      }),
    )

    expect(res.status).toBe(401)
    expect(triggerRevalidate).not.toHaveBeenCalled()
  })

  it('rejects a validly-signed but schema-invalid body', async () => {
    verifyRevalidateSignature.mockReturnValue(true)

    const res = await POST(
      fakeRequest(JSON.stringify({ productSlug: 'no-lane-slug' }), {
        'x-revalidate-signature': 'sha256=' + 'a'.repeat(64),
      }),
    )

    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error.code).toBe('VALIDATION')
    expect(triggerRevalidate).not.toHaveBeenCalled()
  })

  it('calls triggerRevalidate and returns its outcome for a valid signed request', async () => {
    verifyRevalidateSignature.mockReturnValue(true)
    triggerRevalidate.mockResolvedValue({
      ok: true,
      paths: ['/api/public/catalog/wings/provisions'],
      tags: ['catalog:lane:provisions'],
    })

    const res = await POST(
      fakeRequest(JSON.stringify({ laneSlug: 'provisions' }), {
        'x-revalidate-signature': 'sha256=' + 'a'.repeat(64),
      }),
    )

    expect(res.status).toBe(200)
    expect(triggerRevalidate).toHaveBeenCalledWith({ laneSlug: 'provisions' })
    const body = await res.json()
    expect(body.data.ok).toBe(true)
  })

  it('surfaces a triggerRevalidate failure as 500 INTERNAL', async () => {
    verifyRevalidateSignature.mockReturnValue(true)
    triggerRevalidate.mockResolvedValue({ ok: false, paths: [], tags: [], error: 'boom' })

    const res = await POST(
      fakeRequest(JSON.stringify({ laneSlug: 'provisions' }), {
        'x-revalidate-signature': 'sha256=' + 'a'.repeat(64),
      }),
    )

    expect(res.status).toBe(500)
    const body = await res.json()
    expect(body.error.code).toBe('INTERNAL')
  })
})
