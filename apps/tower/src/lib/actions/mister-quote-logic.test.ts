import { describe, it, expect } from 'vitest'
import { getDefaultUnit } from '@/lib/archetypes'
import { toQuoteLineDrafts } from './mister-quote-logic'

describe('toQuoteLineDrafts', () => {
  it('anchors every line to the archetype default unit and keeps priced lines', () => {
    const unitId = getDefaultUnit('EQUIPMENT').id
    const drafts = toQuoteLineDrafts('EQUIPMENT', [
      { description: 'Scooter', quantity: 200, unitPriceMinor: 15000 },
      { description: 'Generator', quantity: 5, unitPriceMinor: 850000 },
    ])
    expect(drafts).toHaveLength(2)
    expect(drafts.every((d) => d.unitId === unitId)).toBe(true)
    expect(drafts[0]).toMatchObject({ description: 'Scooter', quantity: 200, unitPriceMinor: 15000 })
  })

  it('drops gap lines (null price) and non-positive quantities', () => {
    const drafts = toQuoteLineDrafts('EQUIPMENT', [
      { description: 'Priced', quantity: 1, unitPriceMinor: 1000 },
      { description: 'Gap', quantity: 3, unitPriceMinor: null },
      { description: 'ZeroQty', quantity: 0, unitPriceMinor: 500 },
    ])
    expect(drafts).toHaveLength(1)
    expect(drafts[0].description).toBe('Priced')
  })

  it('never emits an empty description (composeQuote requires min length 1)', () => {
    const drafts = toQuoteLineDrafts('EQUIPMENT', [{ description: '   ', quantity: 1, unitPriceMinor: 100 }])
    expect(drafts[0].description).toBe('—')
  })
})
