import { describe, it, expect } from 'vitest'
import { money, addMinor, lineTotalMinor, applyBps, formatMinor } from './money'

describe('money (integer minor units)', () => {
  it('rejects non-integer minor', () => {
    expect(() => money(10.5, 'USD')).toThrow()
  })

  it('sums same-currency amounts and rejects mismatches', () => {
    expect(addMinor([money(100, 'USD'), money(250, 'USD')])).toEqual({ minor: 350, currency: 'USD' })
    expect(() => addMinor([money(100, 'USD'), money(1, 'PEN')])).toThrow(/mismatch/)
    expect(() => addMinor([])).toThrow()
  })

  it('computes line totals with fractional quantities, rounding to integer minor', () => {
    expect(lineTotalMinor(1000, 3)).toBe(3000)
    expect(lineTotalMinor(333, 2.5)).toBe(833) // 832.5 → 833
  })

  it('applies basis points and rounds', () => {
    expect(applyBps(10000, 500)).toBe(500) // 5% of 100.00
    expect(applyBps(199, 1250)).toBe(25) // 24.875 → 25
  })

  it('formats for display only', () => {
    expect(formatMinor(123456, 'USD', 'en-US')).toBe('$1,234.56')
  })
})
