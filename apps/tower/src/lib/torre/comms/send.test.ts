// src/lib/torre/comms/send.test.ts
import { describe, it, expect } from 'vitest'
import type { ComunicacionPayload } from '@/lib/torre/artifacts'
import { mockAdapter, prepareSend, resolveSendAdapter } from './send'

function comunicacion(over: Partial<ComunicacionPayload> = {}): ComunicacionPayload {
  return {
    kind: 'COMUNICACION', version: 1, channel: 'email', audience: 'client', language: 'es',
    to: 'cliente@example.com', subject: 'Cotización', body: 'Estimado cliente, adjunto la cotización.',
    sideEffect: { es: 'Enviar correo', en: 'Send email' }, blockers: [], cotizacionRef: null,
    ...over,
  }
}

describe('prepareSend — the send gate', () => {
  it('prepares a sendable message from an approved payload', () => {
    const r = prepareSend(comunicacion())
    expect(r.ok).toBe(true)
    if (r.ok) {
      expect(r.message).toMatchObject({ channel: 'email', to: 'cliente@example.com', audience: 'client', language: 'es' })
    }
  })

  it('REFUSES a payload that still carries blockers (unapprovable never sends)', () => {
    const r = prepareSend(comunicacion({ blockers: [{ id: 'x', field: 'to', reason: { es: 'a', en: 'b' }, task: { es: 'c', en: 'd' } }] }))
    expect(r).toEqual({ ok: false, reason: 'has-blockers' })
  })

  it('refuses a message with no recipient', () => {
    expect(prepareSend(comunicacion({ to: null }))).toEqual({ ok: false, reason: 'no-recipient' })
    expect(prepareSend(comunicacion({ to: '   ' }))).toEqual({ ok: false, reason: 'no-recipient' })
  })

  it('refuses an empty body', () => {
    expect(prepareSend(comunicacion({ body: '   ' }))).toEqual({ ok: false, reason: 'empty-body' })
  })
})

describe('mock adapters', () => {
  it('records a send and returns a mock provider id', async () => {
    const a = mockAdapter('email')
    const prepared = prepareSend(comunicacion())
    expect(prepared.ok).toBe(true)
    if (!prepared.ok) return
    const res = await a.send(prepared.message)
    expect(res).toMatchObject({ ok: true, channel: 'email', to: 'cliente@example.com', mocked: true })
    expect(res.providerId).toBe('mock-email-1')
    expect(a.sent).toHaveLength(1)
  })

  it('rejects a channel mismatch', async () => {
    const a = mockAdapter('whatsapp')
    const res = await a.send({ channel: 'email', to: 'x', subject: null, body: 'hi', audience: 'client', language: 'es' })
    expect(res.ok).toBe(false)
    expect(res.error).toMatch(/channel mismatch/)
    expect(a.sent).toHaveLength(0)
  })

  it('resolveSendAdapter returns a mock recorder for each channel (MOCK_CONNECTORS)', async () => {
    const wa = resolveSendAdapter('whatsapp')
    const res = await wa.send({ channel: 'whatsapp', to: '+51999', subject: null, body: 'hola', audience: 'client', language: 'es' })
    expect(res).toMatchObject({ ok: true, mocked: true, channel: 'whatsapp' })
  })
})
