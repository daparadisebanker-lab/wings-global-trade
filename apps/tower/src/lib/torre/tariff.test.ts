// src/lib/torre/tariff.test.ts
import { describe, it, expect } from 'vitest'
import { resolveQuoteTariff, resolveTariffCandidates, toCandidate, type TariffPosition } from './tariff'

const POSITIONS: TariffPosition[] = [
  { hsCode: '8429.52', description: 'Excavadoras', keywords: ['excavadora', 'excavator', 'cat 320'], dutyBps: 0, ivaBps: 1800, verifiedAt: '2026-07-01' },
  { hsCode: '8502.13', description: 'Genset >375kVA', keywords: ['generador', 'genset'], dutyBps: 600, ivaBps: 1800, verifiedAt: null },
  { hsCode: '8502.20', description: 'Piston genset', keywords: ['generador', 'diesel generator'], dutyBps: 0, ivaBps: 1800, verifiedAt: null },
]

describe('resolveTariffCandidates', () => {
  it('resolves a single candidate by keyword', () => {
    const c = resolveTariffCandidates(POSITIONS, 'Excavadora CAT 320 diésel')
    expect(c.map((p) => p.hsCode)).toEqual(['8429.52'])
  })

  it('returns MULTIPLE candidates when ambiguous (both genset positions)', () => {
    const c = resolveTariffCandidates(POSITIONS, 'Generador diésel 250 kVA')
    expect(c.map((p) => p.hsCode)).toEqual(['8502.13', '8502.20'])
  })

  it('is accent-insensitive (electrógeno-style matching)', () => {
    const positions: TariffPosition[] = [
      { hsCode: '8502.11', description: 'x', keywords: ['grupo electrógeno'], dutyBps: 0, ivaBps: 1800, verifiedAt: null },
    ]
    expect(resolveTariffCandidates(positions, 'un GRUPO ELECTROGENO nuevo').map((p) => p.hsCode)).toEqual(['8502.11'])
  })

  it('returns no candidates for unmatched or empty text', () => {
    expect(resolveTariffCandidates(POSITIONS, 'zapatos de cuero')).toEqual([])
    expect(resolveTariffCandidates(POSITIONS, '')).toEqual([])
  })

  it('toCandidate exposes the duty as a fraction', () => {
    expect(toCandidate(POSITIONS[1]).dutyPct).toBe(0.06) // 600 bps
    expect(toCandidate(POSITIONS[1]).hsCode).toBe('8502.13')
  })
})

describe('resolveQuoteTariff — the agent-pin governance guard', () => {
  it('no hint → keyword candidates, not pinned', () => {
    const r = resolveQuoteTariff(POSITIONS, 'Generador diésel 250 kVA')
    expect(r.pinnedByAgent).toBe(false)
    expect(r.positions.map((p) => p.hsCode)).toEqual(['8502.13', '8502.20'])
  })

  it('a hint that IS one of the keyword candidates pins it (disambiguates ≥2)', () => {
    const r = resolveQuoteTariff(POSITIONS, 'Generador diésel 250 kVA', '8502.20')
    expect(r.pinnedByAgent).toBe(true)
    expect(r.positions.map((p) => p.hsCode)).toEqual(['8502.20'])
  })

  it('IGNORES a hint that is NOT a keyword candidate (cannot dodge the ambiguity blocker)', () => {
    // 8429.52 (excavadora, 0% duty) is unrelated to a generator query — the agent must
    // not be able to pin it to escape the ≥2 ambiguity. The candidate set is preserved.
    const r = resolveQuoteTariff(POSITIONS, 'Generador diésel 250 kVA', '8429.52')
    expect(r.pinnedByAgent).toBe(false)
    expect(r.positions.map((p) => p.hsCode)).toEqual(['8502.13', '8502.20'])
  })

  it('ignores an invented HS code not in the table', () => {
    const r = resolveQuoteTariff(POSITIONS, 'Generador diésel', '0000.00')
    expect(r.pinnedByAgent).toBe(false)
    expect(r.positions.map((p) => p.hsCode)).toEqual(['8502.13', '8502.20'])
  })
})
