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
  it('normalizes an email and threads a reply onto the same subject key', () => {
    const first = normalizeInbound('email', { from: 'a@x.com', to: 'ops@wings.com', subject: 'Cotización Grupo', text: 'Hola', messageId: 'm1' })
    const reply = normalizeInbound('email', { from: 'ops@wings.com', to: 'a@x.com', subject: 'Re: Cotización Grupo', text: 'Gracias', messageId: 'm2' })
    expect(first?.threadKey).toBe('email:subj:cotización grupo')
    expect(reply?.threadKey).toBe(first?.threadKey) // reply groups with the original
  })

  it('prefers an explicit references/in-reply-to root over the subject', () => {
    const m = normalizeInbound('email', { from: 'a@x.com', subject: 'Re: x', text: 'y', messageId: 'm3', inReplyTo: 'root-1' })
    expect(m?.threadKey).toBe('email:ref:root-1')
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
    expect(m?.threadKey).toBe('email:from:a@x.com')
  })
})
