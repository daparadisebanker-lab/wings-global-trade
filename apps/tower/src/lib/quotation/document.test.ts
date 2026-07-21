import { describe, expect, it } from 'vitest'
import {
  buildIssuedByRep,
  computeQuotationTotals,
  formatAmount,
  formatQuoteNo,
  itemNo,
  withDefaultTerms,
  DEFAULT_TERMS,
} from './document'

describe('computeQuotationTotals', () => {
  it('matches the reference document (38,000.00 + 38,500.00 @ IGV 18%)', () => {
    // 3800000 + 3850000 minor = 7,650,000 minor (USD 76,500.00)
    const t = computeQuotationTotals([3_800_000, 3_850_000], 'IGV 18%', 1800, 'USD')
    expect(t.subtotalMinor).toBe(7_650_000) // 76,500.00
    expect(t.taxMinor).toBe(1_377_000) // 13,770.00
    expect(t.totalMinor).toBe(9_027_000) // 90,270.00
  })

  it('is integer-only and rounds tax once (no float drift)', () => {
    const t = computeQuotationTotals([100_033], 'IGV 18%', 1800, 'USD')
    // 100033 * 1800 / 10000 = 18005.94 -> 18006
    expect(t.taxMinor).toBe(18_006)
    expect(Number.isInteger(t.taxMinor)).toBe(true)
    expect(t.totalMinor).toBe(118_039)
  })

  it('zero tax yields subtotal === total', () => {
    const t = computeQuotationTotals([500_000], 'Sin impuesto', 0, 'USD')
    expect(t.taxMinor).toBe(0)
    expect(t.totalMinor).toBe(t.subtotalMinor)
  })

  it('empty line list totals zero', () => {
    const t = computeQuotationTotals([], 'IGV 18%', 1800, 'USD')
    expect(t.subtotalMinor).toBe(0)
    expect(t.totalMinor).toBe(0)
  })
})

describe('formatting helpers', () => {
  it('formats the quote number as COT-WGT-YYYY-NNNN', () => {
    expect(formatQuoteNo(2026, 1)).toBe('COT-WGT-2026-0001')
    expect(formatQuoteNo(2026, 42)).toBe('COT-WGT-2026-0042')
  })

  it('zero-pads item numbers', () => {
    expect(itemNo(0)).toBe('01')
    expect(itemNo(11)).toBe('12')
  })

  it('formats amounts grouped, two decimals, no symbol', () => {
    expect(formatAmount(9_027_000)).toBe('90,270.00')
    expect(formatAmount(3_800_000)).toBe('38,000.00')
  })
})

describe('withDefaultTerms', () => {
  it('falls back to the reference defaults for empty fields', () => {
    const merged = withDefaultTerms({ incoterm: 'FOB - Callao' })
    expect(merged.incoterm).toBe('FOB - Callao')
    expect(merged.paymentTerms).toBe(DEFAULT_TERMS.paymentTerms)
  })

  it('treats blank strings as empty', () => {
    const merged = withDefaultTerms({ warranty: '   ' })
    expect(merged.warranty).toBe(DEFAULT_TERMS.warranty)
  })
})

describe('buildIssuedByRep', () => {
  it('builds the block from a named rep with a signature', () => {
    const block = buildIssuedByRep(
      { displayName: 'María Torres', title: 'Ejecutiva Comercial' },
      'https://signed.example/sig.png',
    )
    expect(block).toEqual({
      displayName: 'María Torres',
      title: 'Ejecutiva Comercial',
      signatureUrl: 'https://signed.example/sig.png',
    })
  })

  it('degrades to name + title when there is no signature', () => {
    const block = buildIssuedByRep({ displayName: 'María Torres', title: null }, null)
    expect(block).toEqual({ displayName: 'María Torres', title: null, signatureUrl: null })
  })

  it('returns null when there is no usable name (→ company block)', () => {
    expect(buildIssuedByRep(null, 'https://signed.example/sig.png')).toBeNull()
    expect(buildIssuedByRep({ displayName: null, title: 'Ejecutiva' }, null)).toBeNull()
    expect(buildIssuedByRep({ displayName: '   ', title: 'Ejecutiva' }, null)).toBeNull()
  })
})
