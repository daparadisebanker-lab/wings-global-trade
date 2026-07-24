// src/lib/torre/comms/tone.test.ts
import { describe, it, expect } from 'vitest'
import { defaultLanguage, toneProfile } from './tone'

describe('defaultLanguage', () => {
  it('client defaults to its own language (fallback ES)', () => {
    expect(defaultLanguage('client')).toBe('es')
    expect(defaultLanguage('client', 'en')).toBe('en')
  })
  it('supplier defaults to EN, agent to ES (ignoring client language)', () => {
    expect(defaultLanguage('supplier', 'es')).toBe('en')
    expect(defaultLanguage('agent', 'en')).toBe('es')
  })
})

describe('toneProfile', () => {
  it('gives a client a formal register with its greeting/signoff', () => {
    const t = toneProfile('client', { clientLanguage: 'es' })
    expect(t.register).toBe('formal')
    expect(t.language).toBe('es')
    expect(t.greeting).toBe('Estimado/a')
    expect(t.signoff).toBe('Saludos cordiales')
  })

  it('gives a supplier an EN professional register by default', () => {
    const t = toneProfile('supplier')
    expect(t.register).toBe('professional')
    expect(t.language).toBe('en')
    expect(t.greeting).toBe('Dear')
  })

  it('gives an agent an operational ES register', () => {
    const t = toneProfile('agent')
    expect(t.register).toBe('operational')
    expect(t.language).toBe('es')
  })

  it('honors an explicit language override (client who prefers EN)', () => {
    const t = toneProfile('client', { clientLanguage: 'es', language: 'en' })
    expect(t.language).toBe('en')
    expect(t.greeting).toBe('Dear')
  })

  it('guidance forbids retail sales language for the client', () => {
    expect(toneProfile('client').guidance).toMatch(/minorista/)
  })
})
