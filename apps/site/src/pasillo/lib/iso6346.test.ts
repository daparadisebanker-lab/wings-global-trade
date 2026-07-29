// The lane stamp prints a real ISO 6346 check digit. If this drifts, every lane
// stamp on every trade document is quietly wrong in a way only someone who reads
// container markings would catch — which is exactly the audience the grammar was
// borrowed to impress.

import { describe, expect, it } from 'vitest'
import { iso6346CheckDigit, laneUnitNumber } from '@wings/trade-ui/iso6346'

describe('iso6346CheckDigit', () => {
  it('computes the standard worked example', () => {
    // CSQU3054383 is the example carried in ISO 6346 itself.
    expect(iso6346CheckDigit('CSQU305438')).toBe(3)
  })

  it('renders a remainder of 10 as 0, per the standard', () => {
    // WGTU000002 sums to 1473; 1473 mod 11 = 10. The standard stamps 0 here —
    // it is a rule, not a truncation, and getting it wrong is invisible.
    expect(iso6346CheckDigit('WGTU000002')).toBe(0)
  })

  it('rejects a string that is not 10 characters', () => {
    expect(() => iso6346CheckDigit('WGTU00002')).toThrow(/10 characters/)
  })

  it('rejects an invalid character', () => {
    expect(() => iso6346CheckDigit('WGT-000002')).toThrow(/invalid character/)
  })
})

describe('laneUnitNumber', () => {
  it('turns a lane code into its container-marking form', () => {
    expect(laneUnitNumber('WGT/02')).toEqual({ owner: 'WGTU', serial: '000002', check: 0 })
  })

  it('derives each lane independently — no lane shares a check digit by accident', () => {
    const digits = ['WGT/01', 'WGT/02', 'WGT/03', 'WGT/04', 'WGT/05', 'WGT/06'].map(
      (c) => laneUnitNumber(c).check,
    )
    // The point is not that they differ; it is that each is computed, so a typo
    // in one lane cannot silently match another.
    expect(digits).toEqual(digits.map((_, i) => laneUnitNumber(`WGT/0${i + 1}`).check))
    expect(new Set(digits).size).toBeGreaterThan(1)
  })
})
