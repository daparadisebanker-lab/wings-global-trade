// src/lib/torre/comms/inbound.test.ts
import { describe, it, expect } from 'vitest'
import { normalizeInbound, normalizeSubject } from './inbound'

describe('normalizeSubject', () => {
  it('strips stacked reply/forward prefixes and lowercases', () => {
    expect(normalizeSubject('Re: Fwd: Cotización Grupo')).toBe('cotización grupo')
    expect(normalizeSubject('RV: Consulta')).toBe('consulta')
    expect(normalizeSubject('Plain subject')).toBe('plain subject')
  })
})

describe('normalizeInbound', () => {
  it('threads a same-sender reply onto the same subject key (scoped by sender)', () => {
    const first = normalizeInbound('email', { from: 'a@x.com', to: 'ops@wings.com', subject: 'Cotización Grupo', text: 'Hola', messageId: 'm1' })
    const reply = normalizeInbound('email', { from: 'a@x.com', to: 'ops@wings.com', subject: 'Re: Cotización Grupo', text: '¿?', messageId: 'm2' })
    expect(first?.threadKey).toBe('email:a@x.com:subj:cotización grupo')
    expect(reply?.threadKey).toBe(first?.threadKey)
  })

  it('does NOT collide two different clients sharing a common subject', () => {
    const a = normalizeInbound('email', { from: 'a@x.com', subject: 'Cotización', text: 'hi', messageId: 'm1' })
    const b = normalizeInbound('email', { from: 'b@y.com', subject: 'Cotización', text: 'hi', messageId: 'm2' })
    expect(a?.threadKey).not.toBe(b?.threadKey) // scoped by sender — no cross-account leak
  })

  it('uses the References ROOT (first id), so every reply depth threads together', () => {
    const d1 = normalizeInbound('email', { from: 'a@x.com', subject: 'Re: x', text: 'y', messageId: 'm3', references: 'root-1' })
    const d3 = normalizeInbound('email', { from: 'a@x.com', subject: 'Re: x', text: 'y', messageId: 'm5', references: 'root-1 mid-2 mid-3' })
    expect(d1?.threadKey).toBe('email:ref:root-1')
    expect(d3?.threadKey).toBe('email:ref:root-1') // deep reply still groups on the root
  })

  it('threads WhatsApp by phone number', () => {
    const m = normalizeInbound('whatsapp', { from: '+51999888', to: '+51111', body: 'hola', id: 'wa1' })
    expect(m).toMatchObject({ channel: 'whatsapp', from: '+51999888', body: 'hola', externalId: 'wa1', threadKey: 'whatsapp:+51999888' })
  })

  it('returns null when the essentials are missing', () => {
    expect(normalizeInbound('email', { from: 'a@x.com', subject: 'x' })).toBeNull() // no body/id
    expect(normalizeInbound('email', null)).toBeNull()
    expect(normalizeInbound('whatsapp', { body: 'hi', id: '1' })).toBeNull() // no from
  })

  it('falls back to the sender when an email has no subject or references', () => {
    const m = normalizeInbound('email', { from: 'A@X.com', text: 'hi', messageId: 'm4' })
    expect(m?.threadKey).toBe('email:a@x.com')
  })
})

describe('normalizeSubject stacking', () => {
  it('strips deeply-stacked prefixes in one pass', () => {
    expect(normalizeSubject('Re: RE: Fwd: Cotización')).toBe('cotización')
  })
})
