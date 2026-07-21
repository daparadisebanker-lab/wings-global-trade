import { describe, expect, it } from 'vitest'
import {
  buildLogisticsExhibits,
  CONTAINER_CBM,
  formatCbm,
  formatFichaNo,
  formatNumber,
  unitsPerContainer,
  unitsPerPallet,
  type FichaLogistics,
} from './ficha'

describe('formatFichaNo', () => {
  it('formats the ficha reference as FT-WGT-YYYY-NNNN', () => {
    expect(formatFichaNo(2026, 1)).toBe('FT-WGT-2026-0001')
    expect(formatFichaNo(2026, 42)).toBe('FT-WGT-2026-0042')
  })
})

describe('number formatting', () => {
  it('groups integers with no decimals by default', () => {
    expect(formatNumber(1200)).toBe('1,200')
  })
  it('formats CBM to 3 decimals with the m³ unit', () => {
    expect(formatCbm(2.35)).toBe('2.350 m³')
    expect(formatCbm(12)).toBe('12.000 m³')
  })
})

describe('unitsPerContainer (CBM exhibit)', () => {
  it('floors whole units into the container volume', () => {
    // 2.35 CBM/unit into a 40′ HC (76.4 CBM) -> floor(32.5) = 32
    expect(unitsPerContainer(2.35, CONTAINER_CBM['40HC'])).toBe(32)
  })
  it('guards a zero or negative per-unit CBM', () => {
    expect(unitsPerContainer(0, 67.7)).toBe(0)
    expect(unitsPerContainer(-1, 67.7)).toBe(0)
  })
})

describe('unitsPerPallet (packing math)', () => {
  it('multiplies carton and pallet counts', () => {
    expect(unitsPerPallet(24, 40)).toBe(960)
  })
  it('returns null when a packing count is missing', () => {
    expect(unitsPerPallet(null, 40)).toBeNull()
    expect(unitsPerPallet(24, null)).toBeNull()
  })
})

describe('buildLogisticsExhibits', () => {
  const full: FichaLogistics = {
    hsCode: '8706.00.00',
    moq: 1,
    moqUnit: 'unidades',
    cbmPerUnit: 2.35,
    unitsPerCarton: 24,
    cartonsPerPallet: 40,
  }

  it('exhibits every number in fixed order, tabular + bilingual', () => {
    const rows = buildLogisticsExhibits(full)
    expect(rows.map((r) => r.labelEn)).toEqual([
      'HS code',
      'MOQ',
      'CBM per unit',
      'Units per carton',
      'Cartons per pallet',
      'Units per pallet',
      'Units per 40′ HC',
    ])
    expect(rows[0].value).toBe('8706.00.00')
    expect(rows[2].value).toBe('2.350 m³')
    expect(rows[5].value).toBe('960') // 24 × 40
    expect(rows[6].value).toBe('32') // floor(76.4 / 2.35)
  })

  it('renders an em dash for every absent number (never a collapsed block)', () => {
    const empty: FichaLogistics = {
      hsCode: null,
      moq: null,
      moqUnit: null,
      cbmPerUnit: null,
      unitsPerCarton: null,
      cartonsPerPallet: null,
    }
    const rows = buildLogisticsExhibits(empty)
    expect(rows).toHaveLength(7)
    expect(rows.every((r) => r.value === '—')).toBe(true)
  })
})
