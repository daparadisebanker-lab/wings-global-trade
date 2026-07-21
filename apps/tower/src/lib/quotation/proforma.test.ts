import { describe, expect, it } from 'vitest'
import {
  computeProformaTotals,
  DEFAULT_PROFORMA_TERMS,
  formatProformaNo,
  withDefaultProformaTerms,
} from './proforma'

describe('formatProformaNo', () => {
  it('formats the proforma reference as PF-WGT-YYYY-NNNN', () => {
    expect(formatProformaNo(2026, 1)).toBe('PF-WGT-2026-0001')
    expect(formatProformaNo(2026, 42)).toBe('PF-WGT-2026-0042')
  })
})

describe('computeProformaTotals (reuses the quotation money math)', () => {
  it('matches the reference proforma (38,000.00 + 38,500.00 @ IGV 18%)', () => {
    // Same figures the reference PDF prints: 76,500.00 sub / 13,770.00 IGV.
    const t = computeProformaTotals([3_800_000, 3_850_000], 'IGV 18%', 1800, 'USD')
    expect(t.subtotalMinor).toBe(7_650_000) // 76,500.00
    expect(t.taxMinor).toBe(1_377_000) // 13,770.00
    expect(t.totalMinor).toBe(9_027_000) // 90,270.00
  })

  it('is integer-only and rounds tax once (no float drift)', () => {
    const t = computeProformaTotals([100_033], 'IGV 18%', 1800, 'USD')
    expect(t.taxMinor).toBe(18_006)
    expect(Number.isInteger(t.taxMinor)).toBe(true)
    expect(t.totalMinor).toBe(118_039)
  })

  it('empty line list totals zero (a valid draft state)', () => {
    const t = computeProformaTotals([], 'IGV 18%', 1800, 'USD')
    expect(t.subtotalMinor).toBe(0)
    expect(t.totalMinor).toBe(0)
  })
})

describe('withDefaultProformaTerms', () => {
  it('falls back to the reference defaults for empty fields', () => {
    const merged = withDefaultProformaTerms({ portOfOrigin: 'Ningbo, China' })
    expect(merged.portOfOrigin).toBe('Ningbo, China')
    expect(merged.portOfDestination).toBe(DEFAULT_PROFORMA_TERMS.portOfDestination)
    expect(merged.paymentTerms).toBe(DEFAULT_PROFORMA_TERMS.paymentTerms)
  })

  it('treats blank strings as empty', () => {
    const merged = withDefaultProformaTerms({ deliveryTime: '   ' })
    expect(merged.deliveryTime).toBe(DEFAULT_PROFORMA_TERMS.deliveryTime)
  })
})
