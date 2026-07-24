// src/lib/torre/comms/tone.test.ts
import { describe, it, expect } from 'vitest'
import { defaultLanguage, toneGuidanceBlock, toneProfile } from './tone'

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

describe('toneGuidanceBlock — the redactor prompt contract (one source of truth)', () => {
  it('covers all three audiences with their register + default-language rule', () => {
    const b = toneGuidanceBlock('es')
    expect(b).toMatch(/cliente \(formal/)
    expect(b).toMatch(/proveedor \(professional/)
    expect(b).toMatch(/interno\/agente \(operational/)
    // the default-language rule is stated per audience
    expect(b).toMatch(/inglés por defecto/) // supplier
    expect(b).toMatch(/idioma del cliente/) // client
  })

  it('carries the wholesale-only guidance into the prompt (never retail sales language)', () => {
    expect(toneGuidanceBlock('es')).toMatch(/minorista/)
    expect(toneGuidanceBlock('en')).toMatch(/retail sales language/)
  })

  it('renders in the requested prompt language', () => {
    const en = toneGuidanceBlock('en')
    expect(en).toMatch(/TONE BY AUDIENCE/)
    expect(en).toMatch(/in English by default/)
    expect(toneGuidanceBlock('es')).toMatch(/TONO POR AUDIENCIA/)
  })

  it('defaults to Spanish (the redactor prompt language)', () => {
    expect(toneGuidanceBlock()).toBe(toneGuidanceBlock('es'))
  })
})
