import { describe, it, expect } from 'vitest'
import {
  buildRbSlotLine,
  computeRbContainerTotals,
  formatRbQuoteNo,
  rbItemNo,
  rbQuoteSeqFromCode,
} from './rb-container'

describe('formatRbQuoteNo / rbQuoteSeqFromCode', () => {
  it('formats the RB reference with a zero-padded 4-digit sequence', () => {
    expect(formatRbQuoteNo(2026, 7)).toBe('COT-RB-2026-0007')
  })

  it('is deterministic — same container code → same sequence', () => {
    expect(rbQuoteSeqFromCode('RB01-40HC-001')).toBe(rbQuoteSeqFromCode('RB01-40HC-001'))
  })

  it('never yields sequence 0', () => {
    expect(rbQuoteSeqFromCode('')).toBe(1)
  })
})

describe('rbItemNo', () => {
  it('zero-pads to two digits', () => {
    expect(rbItemNo(0)).toBe('01')
    expect(rbItemNo(11)).toBe('12')
  })
})

describe('buildRbSlotLine', () => {
  it('prices the line as slots × per-slot minor (integer, no float)', () => {
    const line = buildRbSlotLine({
      index: 0,
      productEs: 'Papel higiénico Áladín',
      productEn: 'Áladín toilet paper',
      slots: 3,
      pricePerSlotMinor: 120_000, // USD 1,200.00 per slot
    })
    expect(line.itemNo).toBe('01')
    expect(line.slots).toBe(3)
    expect(line.lineTotalMinor).toBe(360_000)
    expect(line.description).toContain('3 cupos')
    expect(line.descriptionEn).toContain('3 slots')
  })

  it('leaves the total null on an un-priced line (wholesale RFQ posture)', () => {
    const line = buildRbSlotLine({
      index: 1,
      productEs: 'Producto',
      productEn: 'Product',
      slots: 2,
      pricePerSlotMinor: null,
    })
    expect(line.pricePerSlotMinor).toBeNull()
    expect(line.lineTotalMinor).toBeNull()
  })
})

describe('computeRbContainerTotals', () => {
  it('reuses the shared quotation math: subtotal + IGV(bps) = total', () => {
    const lines = [
      buildRbSlotLine({ index: 0, productEs: 'A', productEn: 'A', slots: 3, pricePerSlotMinor: 120_000 }),
    ]
    const totals = computeRbContainerTotals(lines, 'IGV 18%', 1800, 'USD')
    expect(totals).not.toBeNull()
    expect(totals?.subtotalMinor).toBe(360_000)
    expect(totals?.taxMinor).toBe(64_800) // 360000 × 0.18
    expect(totals?.totalMinor).toBe(424_800)
  })

  it('returns null when any line is un-priced (no total on an RFQ-posture quote)', () => {
    const lines = [
      buildRbSlotLine({ index: 0, productEs: 'A', productEn: 'A', slots: 3, pricePerSlotMinor: 120_000 }),
      buildRbSlotLine({ index: 1, productEs: 'B', productEn: 'B', slots: 1, pricePerSlotMinor: null }),
    ]
    expect(computeRbContainerTotals(lines, 'IGV 18%', 1800, 'USD')).toBeNull()
  })

  it('returns null for an empty line set', () => {
    expect(computeRbContainerTotals([], 'IGV 18%', 1800, 'USD')).toBeNull()
  })
})
