// src/lib/torre/comms/send.test.ts
import { describe, it, expect } from 'vitest'
import type { ComunicacionPayload } from '@/lib/torre/artifacts'
import { buildSendRow, mockAdapter, prepareSend, resolveSendAdapter, type SendResult } from './send'

function comunicacion(over: Partial<ComunicacionPayload> = {}): ComunicacionPayload {
  return {
    kind: 'COMUNICACION', version: 1, channel: 'email', audience: 'client', language: 'es',
    to: 'cliente@example.com', subject: 'Cotización', body: 'Estimado cliente, adjunto la cotización.',
    sideEffect: { es: 'Enviar correo', en: 'Send email' }, blockers: [], cotizacionRef: null,
    ...over,
  }
}

describe('prepareSend — the send gate', () => {
  it('prepares a sendable message carrying the idempotency key', () => {
    const r = prepareSend(comunicacion(), 'draft-1')
    expect(r.ok).toBe(true)
    if (r.ok) {
      expect(r.message).toMatchObject({ channel: 'email', to: 'cliente@example.com', audience: 'client', language: 'es', idempotencyKey: 'draft-1' })
    }
  })

  it('REFUSES a payload that still carries blockers (unapprovable never sends)', () => {
    const r = prepareSend(comunicacion({ blockers: [{ id: 'x', field: 'to', reason: { es: 'a', en: 'b' }, task: { es: 'c', en: 'd' } }] }), 'd')
    expect(r).toEqual({ ok: false, reason: 'has-blockers' })
  })

  it('refuses a message with no recipient', () => {
    expect(prepareSend(comunicacion({ to: null }), 'd')).toEqual({ ok: false, reason: 'no-recipient' })
    expect(prepareSend(comunicacion({ to: '   ' }), 'd')).toEqual({ ok: false, reason: 'no-recipient' })
  })

  it('refuses an empty body', () => {
    expect(prepareSend(comunicacion({ body: '   ' }), 'd')).toEqual({ ok: false, reason: 'empty-body' })
  })
})

describe('mock adapters', () => {
  it('records a send and keys the provider id on the idempotency token (stable on retry)', async () => {
    const a = mockAdapter('email')
    const prepared = prepareSend(comunicacion(), 'draft-42')
    expect(prepared.ok).toBe(true)
    if (!prepared.ok) return
    const res = await a.send(prepared.message)
    expect(res).toMatchObject({ ok: true, channel: 'email', to: 'cliente@example.com', mocked: true })
    expect(res.providerId).toBe('mock-email-draft-42')
    // a retry of the same message yields the SAME provider id (dedupe-able)
    const retry = await a.send(prepared.message)
    expect(retry.providerId).toBe('mock-email-draft-42')
    expect(a.sent).toHaveLength(2) // mock records both; the id is what a real adapter dedupes on
  })

  it('rejects a channel mismatch', async () => {
    const a = mockAdapter('whatsapp')
    const res = await a.send({ channel: 'email', to: 'x', subject: null, body: 'hi', audience: 'client', language: 'es', idempotencyKey: 'd' })
    expect(res.ok).toBe(false)
    expect(res.error).toMatch(/channel mismatch/)
    expect(a.sent).toHaveLength(0)
  })

  it('resolveSendAdapter returns a mock recorder for each channel (MOCK_CONNECTORS)', async () => {
    const wa = resolveSendAdapter('whatsapp')
    const res = await wa.send({ channel: 'whatsapp', to: '+51999', subject: null, body: 'hola', audience: 'client', language: 'es', idempotencyKey: 'd' })
    expect(res).toMatchObject({ ok: true, mocked: true, channel: 'whatsapp' })
  })
})

describe('buildSendRow — the outbox ledger row (L2 persistence)', () => {
  const meta = { brandId: 'brand-1', laneId: 'lane-1', draftId: 'draft-1' }

  async function sendVia(channel: 'email' | 'whatsapp', over: Partial<ComunicacionPayload> = {}) {
    const prepared = prepareSend(comunicacion({ channel, ...over }), meta.draftId)
    if (!prepared.ok) throw new Error('unexpected refusal')
    const result = await mockAdapter(channel).send(prepared.message)
    return { message: prepared.message, result }
  }

  it('records a SENT row keyed on the draft id (the send idempotency key) with the provider id', async () => {
    const { message, result } = await sendVia('email')
    expect(buildSendRow(message, result, meta)).toEqual({
      brand_id: 'brand-1',
      lane_id: 'lane-1',
      draft_id: 'draft-1', // == idempotencyKey; UNIQUE(draft_id) makes a re-approve a no-op
      channel: 'email',
      to_addr: 'cliente@example.com',
      subject: 'Cotización',
      language: 'es',
      provider_id: 'mock-email-draft-1',
      status: 'SENT',
      mocked: true,
    })
  })

  it('carries a null lane through (a brand-scoped send)', async () => {
    const { message, result } = await sendVia('whatsapp', { to: '+51999', subject: null })
    const row = buildSendRow(message, result, { ...meta, laneId: null })
    expect(row.lane_id).toBeNull()
    expect(row.channel).toBe('whatsapp')
    expect(row.subject).toBeNull()
  })

  it('records a FAILED attempt (no provider id) — the ledger keeps failures for retry, not just successes', async () => {
    const { message } = await sendVia('email')
    const failed: SendResult = { ok: false, channel: 'email', to: message.to, error: 'provider down', mocked: false }
    const row = buildSendRow(message, failed, meta)
    expect(row.status).toBe('FAILED')
    expect(row.provider_id).toBeNull()
    expect(row.mocked).toBe(false)
  })

  it('does not mislabel the language (a pt/en body is logged verbatim, never coerced to es)', async () => {
    const { message, result } = await sendVia('email', { language: 'pt' })
    expect(buildSendRow(message, result, meta).language).toBe('pt')
  })
})
