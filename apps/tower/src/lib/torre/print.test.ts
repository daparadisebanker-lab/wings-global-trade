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
    expect(m.endorsement).toBeNull() // no §5 credit when the brand IS Wings
    expect(m.meta).toContainEqual({ label: { es: 'Cliente', en: 'Client' }, value: 'Clínica Sur' })
    expect(m.meta).toContainEqual({ label: { es: 'Válida hasta', en: 'Valid until' }, value: '2026-08-15' })
  })

  it('an endorsed brand gets the §5 "Represented by Wings" credit', () => {
    const m = cotizacionPrintModel(cotizacion(), { brand: 'Áladín' })
    expect(m.brand).toBe('Áladín')
    expect(m.endorsement).toEqual({ es: 'Representado por Wings Global Trade', en: 'Represented by Wings Global Trade' })
  })

  it('carries version, issue date and approvability so a blocked draft is marked', () => {
    const m = cotizacionPrintModel(cotizacion({ version: 3 }), { issuedAt: '2026-07-24' })
    expect(m.version).toBe(3)
    expect(m.issuedAt).toBe('2026-07-24')
    expect(m.approvable).toBe(true)
    const blocked = cotizacionPrintModel(cotizacion({ blockers: [{ id: 'x', field: 'fob', reason: { es: 'a', en: 'b' }, task: { es: 'c', en: 'd' } }] }))
    expect(blocked.approvable).toBe(false)
  })

  it('formats scenario money and carries the confidence STATE (language-agnostic)', () => {
    const m = cotizacionPrintModel(cotizacion())
    expect(m.scenarios[0]).toEqual({ incoterm: 'FOB', landed: '12345.00', unit: '15000.00', confidence: 'verified' })
  })

  it('renders a blocked scenario price as em dash (never a fake number)', () => {
    const m = cotizacionPrintModel(
      cotizacion({ scenarios: [{ incoterm: 'CIF', landedCostMinor: null, unitPriceMinor: null, confidence: 'requiere_verificacion' }] }),
    )
    expect(m.scenarios[0]).toEqual({ incoterm: 'CIF', landed: '—', unit: '—', confidence: 'requiere_verificacion' })
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
    expect(m.legend).toEqual(['verified', 'estimado'])
  })

  it('carries the wholesale / not-an-invoice footnote', () => {
    const m = cotizacionPrintModel(cotizacion())
    expect(m.footnotes.some((f) => /No constituye una factura/.test(f.es))).toBe(true)
  })
})
