// src/lib/torre/tariff.test.ts
import { describe, it, expect } from 'vitest'
import { resolveTariffCandidates, toCandidate, type TariffPosition } from './tariff'

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
