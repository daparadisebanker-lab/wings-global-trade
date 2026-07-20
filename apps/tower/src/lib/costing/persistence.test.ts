import { describe, expect, it } from 'vitest'
import fixtures from './fixtures.json'
import { computeImportCost } from './engine'
import { costCalcMoney, rateToMilli, toMinor } from './persistence'
import type { ImportInputs } from './types'

describe('money boundary', () => {
  it('toMinor is exact for pre-rounded engine values', () => {
    expect(toMinor(76500)).toBe(7_650_000)
    expect(toMinor(90270.0)).toBe(9_027_000)
    expect(toMinor(1234.56)).toBe(123_456)
    expect(toMinor(-123.45)).toBe(-12_345) // negative caja margin — no drift
  })

  it('rateToMilli encodes the exchange rate as integer ×1000', () => {
    expect(rateToMilli(3.7)).toBe(3700)
    expect(rateToMilli(3.812)).toBe(3812)
  })

  it('extracts integer-minor columns from a real computed case (fixtures A)', () => {
    const inputs = fixtures.importCases.A.inputs as ImportInputs
    const result = computeImportCost(inputs)
    const money = costCalcMoney(inputs, result)
    expect(money.incoterm).toBe('FOB')
    expect(money.exchange_rate_milli).toBe(3700)
    expect(money.landed_minor).toBe(toMinor(result.landedCost))
    expect(Number.isInteger(money.landed_minor)).toBe(true)
    expect(Number.isInteger(money.cash_outlay_minor)).toBe(true)
    // round-trip: minor / 100 recovers the engine's 2dp figure
    expect(money.landed_minor / 100).toBeCloseTo(result.landedCost, 2)
  })
})
