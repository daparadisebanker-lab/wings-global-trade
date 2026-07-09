import { describe, expect, it, vi, beforeEach } from 'vitest'
import type { NextRequest } from 'next/server'

const { verifyRevalidateSignature } = vi.hoisted(() => ({ verifyRevalidateSignature: vi.fn() }))
vi.mock('@/lib/revalidate', () => ({ verifyRevalidateSignature }))

const { recordWebhookDelivery } = vi.hoisted(() => ({ recordWebhookDelivery: vi.fn() }))
vi.mock('@/lib/webhook-deliveries', () => ({
  recordWebhookDelivery,
  // Real shape so the route's Zod source validation behaves as in production.
  SOURCE_KEY_PATTERN: /^[A-Z][A-Z0-9_]{1,39}$/,
}))

import { POST } from './route'

function fakeRequest(body: string, headers: Record<string, string> = {}): NextRequest {
  const headerMap = new Map(Object.entries(headers).map(([k, v]) => [k.toLowerCase(), v]))
  return {
    text: () => Promise.resolve(body),
    headers: { get: (key: string) => headerMap.get(key.toLowerCase()) ?? null },
  } as unknown as NextRequest
}

const signed = { 'x-revalidate-signature': 'sha256=' + 'a'.repeat(64) }

describe('POST /api/hooks/revalidate-callback', () => {
  beforeEach(() => vi.clearAllMocks())

  it('rejects an unsigned request before recording anything', async () => {
    verifyRevalidateSignature.mockReturnValue(false)
    const res = await POST(fakeRequest(JSON.stringify({}), {}))
    expect(res.status).toBe(401)
    expect(recordWebhookDelivery).not.toHaveBeenCalled()
  })

  it('records a Vercel revalidation confirmation (default source, INBOUND OK)', async () => {
    verifyRevalidateSignature.mockReturnValue(true)
    const res = await POST(fakeRequest(JSON.stringify({ reference: 'wings/machinery' }), signed))
    expect(res.status).toBe(200)
    expect(recordWebhookDelivery).toHaveBeenCalledWith({
      source: 'REVALIDATE_CALLBACK',
      direction: 'INBOUND',
      status: 'OK',
      reference: 'wings/machinery',
      detail: {},
    })
  })

  it('accepts an explicit n8n source + FAILED status', async () => {
    verifyRevalidateSignature.mockReturnValue(true)
    const res = await POST(fakeRequest(JSON.stringify({ source: 'N8N_BRIEF', status: 'FAILED' }), signed))
    expect(res.status).toBe(200)
    expect(recordWebhookDelivery).toHaveBeenCalledWith(
      expect.objectContaining({ source: 'N8N_BRIEF', status: 'FAILED', direction: 'INBOUND' }),
    )
  })

  it('rejects a malformed source as VALIDATION', async () => {
    verifyRevalidateSignature.mockReturnValue(true)
    const res = await POST(fakeRequest(JSON.stringify({ source: 'lower case!' }), signed))
    expect(res.status).toBe(400)
    expect(recordWebhookDelivery).not.toHaveBeenCalled()
  })

  it('rejects malformed JSON as VALIDATION', async () => {
    verifyRevalidateSignature.mockReturnValue(true)
    const res = await POST(fakeRequest('{ not json', signed))
    expect(res.status).toBe(400)
    expect(recordWebhookDelivery).not.toHaveBeenCalled()
  })
})
