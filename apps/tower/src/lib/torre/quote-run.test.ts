// src/lib/torre/quote-run.test.ts
// Flagship gate: the quote run reproduces the SUNAT engine TO THE CENT, links the
// hoja_costos + cotizacion pair, and refuses to invent numbers (honesty).
import { describe, it, expect } from 'vitest'
import { buildQuoteRun, type QuoteRunInput } from './quote-run'
import { isApprovable } from './artifacts'

// A fully-specified, resolved run (the happy path). The engine numbers below were
// captured directly from computeImportCost (parity.test.ts guards the engine itself).
function catInput(overrides: Partial<QuoteRunInput> = {}): QuoteRunInput {
  return {
    productName: 'Excavadora CAT 320',
    brand: 'Caterpillar',
    model: '320',
    fuelType: 'diesel',
    engineCC: 6600,
    origin: 'china',
    year: 2026,
    clientName: 'Provemaq',
    laneCode: 'WGT/01',
    language: 'es',
    quantity: 1,
    fob: 78400,
    incoterm: 'FOB',
    scenarios: ['FOB'],
    freightInternational: 4200,
    freightZofratacna: 500,
    portExpenses: 375,
    customsAgency: 300,
    igvRate: 0.18,
    percepcionRate: 0.035,
    insuranceRate: 0.015,
    adValoremRate: 0, // resolved (0%)
    marginPercent: 0.18,
    exchangeRate: 3.7,
    freightSource: { kind: 'rate_table', label: 'Flete SH→CLL 40HC', validUntil: '2026-08-31' },
    tariffSource: { kind: 'tariff_position', label: 'HS 8429.52 (0%)', validUntil: '2026-12-31' },
    trmSource: { kind: 'org_rule', label: 'TC BCRP 23-JUL', validUntil: '2026-07-24' },
    marginSource: { kind: 'org_rule', label: 'Regla de margen WGT/01 (18%)' },
    validityDays: 15,
    today: '2026-07-23',
    ...overrides,
  }
}

describe('buildQuoteRun — flagship happy path', () => {
  const out = buildQuoteRun(catInput())

  it('reproduces the SUNAT engine landed cost to the cent', () => {
    expect(out.hojaCostos.result.landedCost).toBe(85014)
    expect(out.hojaCostos.result.cif).toBe(83839)
    expect(out.hojaCostos.result.salePriceFinal).toBe(118373.49)
    expect(out.hojaCostos.result.cashOutlay).toBe(103567.57)
  })

  it('carries the cotizacion scenario in integer minor units, to the cent', () => {
    const s = out.cotizacion.scenarios[0]
    expect(s.incoterm).toBe('FOB')
    expect(s.landedCostMinor).toBe(8_501_400) // 85014.00
    expect(s.unitPriceMinor).toBe(11_837_349) // 118373.49
    expect(s.confidence).toBe('verified')
  })

  it('is approvable with zero blockers', () => {
    expect(out.blockers).toHaveLength(0)
    expect(out.approvable).toBe(true)
    expect(isApprovable(out.cotizacion)).toBe(true)
  })

  it('surfaces the negative CASH margin caution (a real SUNAT phenomenon)', () => {
    // margenNetoCaja for this case is -3251.05 → a caution, not a silent pass.
    expect(out.hojaCostos.result.margenNetoCaja).toBeLessThan(0)
    const es = out.hojaCostos.cautions.map((c) => c.es).join(' ')
    expect(es).toMatch(/caja negativo/i)
  })

  it('emits ±flete and ±TRM sensitivity legs', () => {
    const labels = out.hojaCostos.sensitivity.map((s) => s.label)
    expect(labels.some((l) => /Flete \+10%/.test(l))).toBe(true)
    expect(labels.some((l) => /Flete −10%/.test(l))).toBe(true)
    expect(labels.some((l) => /TC \+0\.10/.test(l))).toBe(true)
    // freight up must raise landed cost.
    const up = out.hojaCostos.sensitivity.find((s) => /Flete \+10%/.test(s.label))!
    expect(up.deltaLanded).toBeGreaterThan(0)
  })

  it('always attaches the engine source and the dated rate sources', () => {
    const kinds = out.hojaCostos.sources.map((s) => s.kind)
    expect(kinds).toContain('engine')
    expect(kinds).toContain('rate_table')
    expect(kinds).toContain('tariff_position')
  })

  it('cover comunicacion names the exact side effect and the client', () => {
    expect(out.comunicacion.sideEffect.es).toMatch(/Provemaq/)
    expect(out.comunicacion.body).toMatch(/Provemaq/)
    expect(out.comunicacion.language).toBe('es')
  })
})

describe('buildQuoteRun — honesty (Directive 4/5): never invent numbers', () => {
  it('missing FOB → hard blocker, not approvable, scenario prices are null (not $0)', () => {
    const out = buildQuoteRun(catInput({ fob: null }))
    expect(out.approvable).toBe(false)
    expect(out.blockers.some((b) => b.id === 'fob-missing')).toBe(true)
    expect(out.cotizacion.scenarios[0].unitPriceMinor).toBeNull()
    expect(out.cotizacion.scenarios[0].landedCostMinor).toBeNull()
    expect(out.cotizacion.scenarios[0].confidence).toBe('requiere_verificacion')
  })

  it('missing freight rate → rate blocker, refuses (never invents a freight)', () => {
    const out = buildQuoteRun(catInput({ freightInternational: null, freightSource: null }))
    expect(out.approvable).toBe(false)
    expect(out.blockers.some((b) => b.id === 'rate-missing')).toBe(true)
    expect(out.cotizacion.scenarios[0].unitPriceMinor).toBeNull()
  })

  it('unresolved tariff → provisional numbers marked estimado, blocked from approval', () => {
    const out = buildQuoteRun(catInput({ adValoremRate: null }))
    expect(out.approvable).toBe(false)
    expect(out.blockers.some((b) => b.id === 'tariff-ambiguous')).toBe(true)
    // numbers still compute (Ad Valorem provisional 0%) but are NOT verified.
    expect(out.cotizacion.scenarios[0].unitPriceMinor).toBe(11_837_349)
    expect(out.cotizacion.scenarios[0].confidence).toBe('estimado')
  })

  it('stale tariff (lapsed validity) → tariff-stale blocker', () => {
    const out = buildQuoteRun(
      catInput({ tariffSource: { kind: 'tariff_position', label: 'HS 8429.52', validUntil: '2026-06-30' } }),
    )
    expect(out.blockers.some((b) => b.id === 'tariff-stale')).toBe(true)
    expect(out.approvable).toBe(false)
  })

  it('expired freight rate → rate-expired blocker', () => {
    const out = buildQuoteRun(
      catInput({ freightSource: { kind: 'rate_table', label: 'Flete', validUntil: '2026-07-01' } }),
    )
    expect(out.blockers.some((b) => b.id === 'rate-expired')).toBe(true)
    expect(out.approvable).toBe(false)
  })
})

describe('buildQuoteRun — scenarios and validity', () => {
  it('renders one scenario per requested incoterm', () => {
    const out = buildQuoteRun(catInput({ scenarios: ['FOB', 'CIF'] }))
    expect(out.cotizacion.scenarios.map((s) => s.incoterm)).toEqual(['FOB', 'CIF'])
  })

  it('computes validity as today + validityDays', () => {
    const out = buildQuoteRun(catInput({ today: '2026-07-23', validityDays: 15 }))
    expect(out.cotizacion.validityUntil).toBe('2026-08-07')
  })

  it('produces an English cover for an English-language client', () => {
    const out = buildQuoteRun(catInput({ language: 'en', clientName: 'Andes Machinery' }))
    expect(out.comunicacion.body).toMatch(/Dear Andes Machinery/)
    expect(out.cotizacion.terms.join(' ')).toMatch(/Wholesale B2B/)
  })
})
