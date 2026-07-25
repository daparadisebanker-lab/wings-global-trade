import { describe, expect, it } from 'vitest'
import { computeExportCost, DEFAULT_EXPORT_INPUTS, type ExportInputs } from './export-engine'

// A fully-specified base case with round numbers so the build-up is checkable by
// hand: EXW 10000 · inland 500 · handling 300 · docs 200 · brokerage 150 · other
// 50 → FOB 11200. Int'l freight 2000 → CFR 13200. Insurance 1% of CFR → 132 →
// CIF 13332.
const base: ExportInputs = {
  productName: 'Café verde',
  originLabel: 'Callao, Perú',
  incoterm: 'FOB',
  quantity: 1,
  unitLabel: 'contenedor',
  goodsCost: 10000,
  inlandFreight: 500,
  exportHandling: 300,
  documentation: 200,
  customsBrokerageOrigin: 150,
  otherOriginCharges: 50,
  internationalFreight: 2000,
  insuranceRate: 0.01,
  marginMode: 'percent',
  marginPercent: 0.1,
  targetOfferPrice: 0,
}

describe('computeExportCost — cost build-up', () => {
  it('builds EXW → FOB → CFR → CIF correctly', () => {
    const r = computeExportCost(base)
    expect(r.exwCost).toBe(10000)
    expect(r.fobCost).toBe(11200) // 10000 + 500 + 300 + 200 + 150 + 50
    expect(r.cfrCost).toBe(13200) // 11200 + 2000
    expect(r.insurance).toBe(132) // 1% of 13200
    expect(r.cifCost).toBe(13332) // 13200 + 132
  })
})

describe('computeExportCost — quoted Incoterm selects the margin base', () => {
  it('FOB: margin applies to the FOB cost', () => {
    const r = computeExportCost({ ...base, incoterm: 'FOB' })
    expect(r.offerBaseCost).toBe(11200)
    expect(r.marginUSD).toBe(1120) // 10% of 11200
    expect(r.offerPrice).toBe(12320)
  })
  it('EXW: margin applies to goods only', () => {
    const r = computeExportCost({ ...base, incoterm: 'EXW' })
    expect(r.offerBaseCost).toBe(10000)
    expect(r.offerPrice).toBe(11000)
  })
  it('CIF: margin applies to the freight+insurance-inclusive cost', () => {
    const r = computeExportCost({ ...base, incoterm: 'CIF' })
    expect(r.offerBaseCost).toBe(13332)
    expect(r.offerPrice).toBe(14665.2) // 13332 * 1.1
  })
})

describe('computeExportCost — target-price margin mode', () => {
  it('derives the margin from a target offer price at the quoted Incoterm', () => {
    const r = computeExportCost({ ...base, incoterm: 'FOB', marginMode: 'target_price', targetOfferPrice: 13000 })
    expect(r.offerPrice).toBe(13000)
    expect(r.marginUSD).toBe(1800) // 13000 - 11200
    expect(r.marginRate).toBeCloseTo(1800 / 11200, 6)
  })
  it('guards a zero base (no divide-by-zero)', () => {
    const r = computeExportCost({
      ...base,
      incoterm: 'EXW',
      goodsCost: 0,
      marginMode: 'target_price',
      targetOfferPrice: 500,
    })
    expect(r.marginRate).toBe(0)
    expect(r.offerPrice).toBe(500)
  })
})

describe('computeExportCost — per-unit', () => {
  it('divides the offer across the quantity', () => {
    const r = computeExportCost({ ...base, incoterm: 'FOB', quantity: 4 })
    expect(r.offerPrice).toBe(12320)
    expect(r.offerPricePerUnit).toBe(3080) // 12320 / 4
  })
  it('treats a non-positive quantity as 1', () => {
    const r = computeExportCost({ ...base, incoterm: 'FOB', quantity: 0 })
    expect(r.offerPricePerUnit).toBe(r.offerPrice)
  })
})

describe('DEFAULT_EXPORT_INPUTS', () => {
  it('is internally consistent (FOB offer, positive margin)', () => {
    const r = computeExportCost(DEFAULT_EXPORT_INPUTS)
    expect(r.fobCost).toBeGreaterThan(r.exwCost)
    expect(r.offerPrice).toBeGreaterThan(r.offerBaseCost)
  })
})
