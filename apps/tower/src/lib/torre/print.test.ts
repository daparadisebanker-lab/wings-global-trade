// src/lib/torre/print.test.ts
import { describe, it, expect } from 'vitest'
import type { CotizacionPayload, Machine } from './artifacts'
import { cotizacionPrintModel } from './print'

const machine: Machine = {
  productName: 'Grupo electrógeno', brand: 'Cummins', model: 'C150', fuelType: 'diesel',
  engineCC: 5000, incoterm: 'FOB', origin: 'china',
}
function cotizacion(over: Partial<CotizacionPayload> = {}): CotizacionPayload {
  return {
    kind: 'COTIZACION', version: 1, clientName: 'Clínica Sur', laneCode: 'WGT/01', language: 'es',
    machine, currency: 'USD', quantity: 2, validityUntil: '2026-08-15', terms: ['50% adelanto'],
    scenarios: [{ incoterm: 'FOB', landedCostMinor: 1234500, unitPriceMinor: 1500000, confidence: 'verified' }],
    sources: [], blockers: [], hojaCostosRef: null, ...over,
  }
}

describe('cotizacionPrintModel', () => {
  it('brands as Wings by default and carries the client + validity meta', () => {
    const m = cotizacionPrintModel(cotizacion())
    expect(m.brand).toBe('Wings Global Trade')
    expect(m.meta).toContainEqual({ label: { es: 'Cliente', en: 'Client' }, value: 'Clínica Sur' })
    expect(m.meta).toContainEqual({ label: { es: 'Válida hasta', en: 'Valid until' }, value: '2026-08-15' })
  })

  it('accepts an endorsed/represented brand name', () => {
    expect(cotizacionPrintModel(cotizacion(), 'Áladín').brand).toBe('Áladín')
  })

  it('formats scenario money from minor units and labels confidence', () => {
    const m = cotizacionPrintModel(cotizacion())
    expect(m.scenarioRows[0]).toEqual(['FOB', '12345.00', '15000.00', 'verificado'])
  })

  it('renders a blocked scenario price as em dash (never a fake number)', () => {
    const m = cotizacionPrintModel(
      cotizacion({ scenarios: [{ incoterm: 'CIF', landedCostMinor: null, unitPriceMinor: null, confidence: 'requiere_verificacion' }] }),
    )
    expect(m.scenarioRows[0]).toEqual(['CIF', '—', '—', 'requiere verificación'])
  })

  it('builds a de-duplicated confidence legend of states actually present', () => {
    const m = cotizacionPrintModel(
      cotizacion({
        scenarios: [
          { incoterm: 'FOB', landedCostMinor: 1, unitPriceMinor: 2, confidence: 'verified' },
          { incoterm: 'CIF', landedCostMinor: 3, unitPriceMinor: 4, confidence: 'verified' },
          { incoterm: 'CFR', landedCostMinor: 5, unitPriceMinor: 6, confidence: 'estimado' },
        ],
      }),
    )
    expect(m.legend.map((l) => l.state)).toEqual(['verified', 'estimado'])
  })

  it('carries the wholesale / not-an-invoice footnote', () => {
    const m = cotizacionPrintModel(cotizacion())
    expect(m.footnotes.some((f) => /No constituye una factura/.test(f.es))).toBe(true)
  })
})
