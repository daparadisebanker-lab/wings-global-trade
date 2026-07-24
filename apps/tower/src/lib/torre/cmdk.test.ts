// src/lib/torre/cmdk.test.ts
import { describe, it, expect } from 'vitest'
import { filterVerbs, TORRE_VERBS } from './cmdk'

describe('TORRE_VERBS registry', () => {
  it('covers the reachable loops + the review/policy/triage surfaces', () => {
    const ids = TORRE_VERBS.map((v) => v.id)
    expect(ids).toEqual(expect.arrayContaining(['cotizar', 'redactar', 'estado', 'analizar', 'precedente', 'cola', 'triage', 'reglas']))
  })

  it('every verb has a valid target', () => {
    for (const v of TORRE_VERBS) {
      if (v.target.kind === 'run') expect(['cotizador', 'operaciones', 'redactor', 'analista']).toContain(v.target.profile)
      else if (v.target.kind === 'panel') expect(['torre', 'triage', 'reglas', 'spec-extract']).toContain(v.target.panel)
      else expect(v.target.href).toBeTruthy()
    }
  })
})

describe('filterVerbs', () => {
  it('returns all verbs for an empty query, in registry order', () => {
    expect(filterVerbs('').map((v) => v.id)).toEqual(TORRE_VERBS.map((v) => v.id))
  })

  it('matches by label (accent-insensitive word-prefix)', () => {
    expect(filterVerbs('cotiz').map((v) => v.id)).toContain('cotizar')
    expect(filterVerbs('report').map((v) => v.id)).toContain('analizar')
  })

  it('matches by keyword when the label does not', () => {
    expect(filterVerbs('flete').map((v) => v.id)).toContain('reglas')
    expect(filterVerbs('whatsapp').map((v) => v.id)).toContain('redactar')
  })

  it('ranks a label hit above a keyword-only hit', () => {
    const verbs = [
      { id: 'kw', label: { es: 'Otra cosa', en: 'Other' }, hint: { es: '', en: '' }, target: { kind: 'panel' as const, panel: 'torre' as const }, keywords: ['flete'] },
      { id: 'lbl', label: { es: 'Flete', en: 'Freight' }, hint: { es: '', en: '' }, target: { kind: 'panel' as const, panel: 'reglas' as const }, keywords: [] },
    ]
    // 'lbl' matches by label (rank 0) → must precede 'kw' which matches only by keyword (rank 1)
    expect(filterVerbs('flete', verbs).map((v) => v.id)).toEqual(['lbl', 'kw'])
  })

  it('rescues an English keyword-only concept (freight → reglas)', () => {
    expect(filterVerbs('freight').map((v) => v.id)).toContain('reglas')
    expect(filterVerbs('customs').map((v) => v.id)).toContain('estado')
  })

  it('does not match mid-word (word-boundary): "eta" does not hit "redactar"', () => {
    const ids = filterVerbs('eta').map((v) => v.id)
    expect(ids).toContain('estado') // 'eta' keyword of operaciones
    expect(ids).not.toContain('redactar') // 'eta' inside 'redactar' must not fire
  })

  it('returns nothing for an unmatched query', () => {
    expect(filterVerbs('zzzzz')).toEqual([])
  })
})
