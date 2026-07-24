// src/lib/torre/export.test.ts
import { describe, it, expect } from 'vitest'
import { cotizacionAoa } from './export'
import type { CotizacionPayload } from './artifacts'

const payload: CotizacionPayload = {
  kind: 'COTIZACION',
  version: 1,
  clientName: 'Provemaq',
  laneCode: 'WGT/01',
  language: 'es',
  machine: { productName: 'Excavadora', brand: 'CAT', model: '320', fuelType: 'diesel', engineCC: 6600, incoterm: 'FOB', origin: 'china' },
  currency: 'USD',
  scenarios: [
    { incoterm: 'FOB', landedCostMinor: 8_501_400, unitPriceMinor: 11_837_349, confidence: 'verified' },
    { incoterm: 'CIF', landedCostMinor: null, unitPriceMinor: null, confidence: 'requiere_verificacion' },
  ],
  quantity: 1,
  validityUntil: '2026-08-07',
  terms: ['Precios mayoristas', 'Incoterm FOB'],
  sources: [],
  blockers: [],
  hojaCostosRef: null,
}

describe('cotizacionAoa', () => {
  const rows = cotizacionAoa(payload, 'es')

  it('converts minor units to major-unit numbers for the sheet', () => {
    const fob = rows.find((r) => r[0] === 'FOB')!
    expect(fob[1]).toBe(85014) // 8_501_400 / 100
    expect(fob[2]).toBe(118373.49)
  })

  it('renders a blocked scenario price as an em dash, not $0', () => {
    const cif = rows.find((r) => r[0] === 'CIF')!
    expect(cif[1]).toBe('—')
    expect(cif[2]).toBe('—')
  })

  it('includes the terms block', () => {
    expect(rows.some((r) => r[0] === 'Precios mayoristas')).toBe(true)
  })
})
