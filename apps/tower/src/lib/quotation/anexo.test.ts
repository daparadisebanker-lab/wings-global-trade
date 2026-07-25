import { describe, expect, it } from 'vitest'
import {
  buildAnexoDocument,
  deriveRouteCode,
  freightLineFrom,
  logisticsSubtotal,
  portToken,
  type AnexoLine,
  type BuildAnexoParams,
} from './anexo'
import { resolveFreightRate, type RateRow } from '@/lib/torre/rates'
import { WINGS_ISSUER } from './company'

const baseParams = (lines: AnexoLine[], proformaSaleMinor: number): BuildAnexoParams => ({
  anexoOf: 'PF-WGT-2026-0723',
  issuer: WINGS_ISSUER,
  issuerId: 'shining-star-cl',
  locale: 'es',
  issuedCity: 'Iquique',
  issuedOn: '2026-07-23',
  route: { origin: 'Qingdao, China', destination: 'Iquique, Chile' },
  cbmLabel: '10.30 RT',
  currency: 'USD',
  lines,
  proformaSaleMinor,
})

// The shipped deliverable's logistics lines (minor units).
const LOGISTICS: AnexoLine[] = [
  { label: 'Flete marítimo', amountMinor: 92_700 },
  { label: 'Carga en puerto de origen', amountMinor: 23_000 },
  { label: 'Gastos del puerto Iquique, Chile', amountMinor: 174_276 },
  { label: 'Costo de carga, descarga y almacenaje', amountMinor: null }, // No incluido
]

describe('buildAnexoDocument — golden fixture (the shipped anexo)', () => {
  it('subtotal = Σ included lines; grand = subtotal + proforma sale', () => {
    const doc = buildAnexoDocument(baseParams(LOGISTICS, 505_100)) // sale 5,051.00
    expect(doc.logisticsSubtotalMinor).toBe(289_976) // 2,899.76
    expect(doc.proformaSaleMinor).toBe(505_100) // 5,051.00
    expect(doc.grandTotalMinor).toBe(795_076) // 7,950.76
  })

  it('the "No incluido" line stays in the list but never counts toward the subtotal', () => {
    const doc = buildAnexoDocument(baseParams(LOGISTICS, 505_100))
    expect(doc.lines).toHaveLength(4)
    expect(doc.lines[3].amountMinor).toBeNull()
    expect(logisticsSubtotal(LOGISTICS)).toBe(289_976)
  })
})

describe('derivation — the grand total is computed, never a copied constant', () => {
  it('repricing the quote total moves the grand total (0.35 → 0.40 class of bug)', () => {
    const at035 = buildAnexoDocument(baseParams(LOGISTICS, 505_100))
    const at040 = buildAnexoDocument(baseParams(LOGISTICS, 567_600)) // sale 5,676.00
    expect(at035.grandTotalMinor).toBe(795_076) // 7,950.76
    expect(at040.grandTotalMinor).toBe(857_576) // 8,575.76
    // subtotal unchanged; only the sale-driven grand total moves
    expect(at035.logisticsSubtotalMinor).toBe(at040.logisticsSubtotalMinor)
  })
})

describe('deriveRouteCode / portToken', () => {
  it('maps known ports; unknown → null', () => {
    expect(portToken('Qingdao, China')).toBe('CN-QINGDAO')
    expect(portToken('Iquique, Chile')).toBe('CL-IQUIQUE')
    expect(portToken('Rotterdam')).toBeNull()
    expect(deriveRouteCode('Qingdao, China', 'Iquique, Chile')).toBe('CN-QINGDAO>CL-IQUIQUE')
    expect(deriveRouteCode('Qingdao, China', 'Rotterdam')).toBeNull()
  })
})

describe('freightLineFrom — sourced from rate_tables, never invented', () => {
  const rows: RateRow[] = [
    {
      kind: 'FREIGHT',
      route: 'CN-QINGDAO>CL-IQUIQUE',
      mode: 'SEA',
      containerType: '40HC',
      rateMinor: 92_700,
      currency: 'USD',
      validFrom: '2026-07-01',
      validTo: '2026-08-31',
      source: 'Agent quote #A-42',
    },
  ]

  it('a currently-valid rate becomes an amount with provenance, not flagged', () => {
    const r = resolveFreightRate(rows, { route: 'CN-QINGDAO>CL-IQUIQUE', mode: 'SEA' }, '2026-07-23')
    const line = freightLineFrom(r, '2026-07-23', 'Flete marítimo')
    expect(line.amountMinor).toBe(92_700)
    expect(line.source?.kind).toBe('rate_table')
    expect(line.flagged).toBeUndefined()
  })

  it('a lapsed rate is shown but flagged', () => {
    const r = resolveFreightRate(rows, { route: 'CN-QINGDAO>CL-IQUIQUE', mode: 'SEA' }, '2026-09-15')
    const line = freightLineFrom(r, '2026-09-15', 'Flete marítimo')
    expect(line.amountMinor).toBe(92_700)
    expect(line.flagged).toBe(true)
  })

  it('no matching rate → "No incluido" (null), excluded from the subtotal', () => {
    const r = resolveFreightRate(rows, { route: 'CN-NINGBO>PE-CALLAO', mode: 'SEA' }, '2026-07-23')
    const line = freightLineFrom(r, '2026-07-23', 'Flete marítimo')
    expect(line.amountMinor).toBeNull()
    expect(logisticsSubtotal([line])).toBe(0)
  })
})
