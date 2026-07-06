import { describe, expect, it } from 'vitest'
import { isValidStage, isValidUnit } from '@/lib/archetypes'
import {
  canConvertToOrder,
  canMarkQuoteStatus,
  canSendQuote,
  computePipelineCapabilities,
  computeQuoteLines,
  computeQuoteTotal,
  defaultStageFor,
  nextQuoteVersion,
  type QuoteLineInput,
} from './pipeline-logic'

describe('pipeline-logic · capabilities (presentation-only, mirrors RLS)', () => {
  it('no memberships and not a group admin → nothing', () => {
    const caps = computePipelineCapabilities([], false)
    expect(caps.canCreateRfq).toBe(false)
    expect(caps.canConvertToOrder).toBe(false)
  })

  it('SALES gets full pipeline write (rfqs/quotes/orders are a single SALES + LANE_DIRECTOR boundary)', () => {
    const caps = computePipelineCapabilities(['SALES'], false)
    expect(caps.canCreateRfq).toBe(true)
    expect(caps.canAdvanceStage).toBe(true)
    expect(caps.canComposeQuote).toBe(true)
    expect(caps.canSendQuote).toBe(true)
    expect(caps.canConvertToOrder).toBe(true)
  })

  it('LANE_DIRECTOR gets full pipeline write', () => {
    const caps = computePipelineCapabilities(['LANE_DIRECTOR'], false)
    expect(caps.canCreateRfq).toBe(true)
    expect(caps.canConvertToOrder).toBe(true)
  })

  it('a group admin gets every capability even with zero lane_memberships rows', () => {
    const caps = computePipelineCapabilities([], true)
    expect(caps.canCreateRfq).toBe(true)
    expect(caps.canConvertToOrder).toBe(true)
  })

  it('CATALOG_EDITOR/TRADE_OPS/VIEWER alone grant no pipeline-write capability', () => {
    for (const role of ['CATALOG_EDITOR', 'TRADE_OPS', 'VIEWER'] as const) {
      const caps = computePipelineCapabilities([role], false)
      expect(caps.canCreateRfq).toBe(false)
      expect(caps.canComposeQuote).toBe(false)
    }
  })
})

describe('pipeline-logic · default stage is archetype-driven', () => {
  it('opens a fresh RFQ on the first stage of its archetype — no hardcoded stage id', () => {
    expect(defaultStageFor('EQUIPMENT')).toBe('inquiry')
    expect(defaultStageFor('PROJECT')).toBe('brief')
    expect(defaultStageFor('CREDENTIAL')).toBe('inquiry')
  })
})

describe('pipeline-logic · stage validation is archetype-driven (works for ≥2 archetypes, no branching)', () => {
  it('the same stage id is valid for one archetype and invalid for another', () => {
    expect(isValidStage('EQUIPMENT', 'specification')).toBe(true)
    expect(isValidStage('PROJECT', 'specification')).toBe(false)
    expect(isValidStage('PROJECT', 'spec')).toBe(true)
    expect(isValidStage('EQUIPMENT', 'spec')).toBe(false)
  })

  it('an unknown stage is rejected for every archetype', () => {
    expect(isValidStage('EQUIPMENT', 'not_a_stage')).toBe(false)
    expect(isValidStage('COMMODITY', 'not_a_stage')).toBe(false)
  })
})

describe('pipeline-logic · quote status transitions', () => {
  it('a quote can be sent only while DRAFT', () => {
    expect(canSendQuote('DRAFT')).toBe(true)
    expect(canSendQuote('SENT')).toBe(false)
    expect(canSendQuote('ACCEPTED')).toBe(false)
  })

  it('a quote status can be marked (ACCEPTED/REJECTED/EXPIRED) only from SENT', () => {
    expect(canMarkQuoteStatus('SENT')).toBe(true)
    expect(canMarkQuoteStatus('DRAFT')).toBe(false)
    expect(canMarkQuoteStatus('ACCEPTED')).toBe(false)
    expect(canMarkQuoteStatus('REJECTED')).toBe(false)
    expect(canMarkQuoteStatus('EXPIRED')).toBe(false)
  })

  it('convertToOrder only allowed once a quote is ACCEPTED — never from any other state', () => {
    expect(canConvertToOrder('DRAFT')).toBe(false)
    expect(canConvertToOrder('SENT')).toBe(false)
    expect(canConvertToOrder('ACCEPTED')).toBe(true)
    expect(canConvertToOrder('REJECTED')).toBe(false)
    expect(canConvertToOrder('EXPIRED')).toBe(false)
  })
})

describe('pipeline-logic · quote line + total math (integer minor units, via lib/money)', () => {
  it('computes a line total for a non-cbm-bearing unit (EQUIPMENT · per_unit)', () => {
    const lines: QuoteLineInput[] = [
      { description: 'Excavadora CAT 320', unitId: 'per_unit', quantity: 2, unitPriceMinor: 1_500_000 },
    ]
    const computed = computeQuoteLines('EQUIPMENT', lines)
    expect(computed[0].totalMinor).toBe(3_000_000)
    expect(computed[0].cbm).toBeUndefined()
  })

  it('derives CBM for a cbm-bearing unit (COMMODITY · per_pallet) — archetype-driven, not hardcoded', () => {
    const lines: QuoteLineInput[] = [
      { description: 'Café pergamino grado 1', unitId: 'per_pallet', quantity: 10, unitPriceMinor: 80_000, cbmPerUnit: 1.2 },
    ]
    const computed = computeQuoteLines('COMMODITY', lines)
    expect(computed[0].totalMinor).toBe(800_000)
    expect(computed[0].cbm).toBe(12)
  })

  it('rejects a unit that is not valid for the archetype', () => {
    expect(isValidUnit('EQUIPMENT', 'per_mt')).toBe(false)
    expect(() =>
      computeQuoteLines('EQUIPMENT', [{ description: 'x', unitId: 'per_mt', quantity: 1, unitPriceMinor: 100 }]),
    ).toThrow()
  })

  it('sums multiple lines of the same currency into an integer total', () => {
    const lines = computeQuoteLines('EQUIPMENT', [
      { description: 'A', unitId: 'per_unit', quantity: 2, unitPriceMinor: 1_000_00 },
      { description: 'B', unitId: 'per_crate_cbm', quantity: 3, unitPriceMinor: 250_00, cbmPerUnit: 0.8 },
    ])
    expect(computeQuoteTotal(lines, 'USD')).toBe(2 * 1_000_00 + 3 * 250_00)
  })

  it('an empty line list totals zero rather than throwing', () => {
    expect(computeQuoteTotal([], 'USD')).toBe(0)
  })
})

describe('pipeline-logic · quote version numbering (append-only, mirrors product_versions)', () => {
  it('starts at 1 and always increments from the max seen — never reused', () => {
    expect(nextQuoteVersion([])).toBe(1)
    expect(nextQuoteVersion([{ version: 1 }])).toBe(2)
    expect(nextQuoteVersion([{ version: 1 }, { version: 3 }, { version: 2 }])).toBe(4)
  })
})
