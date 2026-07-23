import { describe, it, expect } from 'vitest'
import { deriveParentSeq, deltasFor } from './lineage'

/** Flatten deltas to a {label: value} map on the ES side for assertions. */
const map = (ds: { label: { es: string }; value: string }[]) =>
  Object.fromEntries(ds.map((d) => [d.label.es, d.value]))

describe('deriveParentSeq', () => {
  it('accepts a positive integer strictly earlier than the child', () => {
    expect(deriveParentSeq(2, 3)).toBe(2)
    expect(deriveParentSeq(1, 5)).toBe(1)
  })

  it('rejects a seq at or after the child (never a self- or forward-edge)', () => {
    expect(deriveParentSeq(3, 3)).toBeNull()
    expect(deriveParentSeq(5, 3)).toBeNull()
  })

  it('rejects junk from a spoofed payload', () => {
    expect(deriveParentSeq(0, 3)).toBeNull()
    expect(deriveParentSeq(-1, 3)).toBeNull()
    expect(deriveParentSeq(1.5, 3)).toBeNull()
    expect(deriveParentSeq('2', 3)).toBeNull()
    expect(deriveParentSeq(undefined, 3)).toBeNull()
    expect(deriveParentSeq(null, 3)).toBeNull()
  })
})

describe('deltasFor', () => {
  it('landed-cost: signed landed-cost + sale-price deltas, grouped', () => {
    const child = { landedCost: 10240, salePriceFinal: 15000 }
    const parent = { landedCost: 8000, salePriceFinal: 12500 }
    const d = map(deltasFor('landed-cost', child, parent))
    expect(d['Costo puesto']).toBe('+2,240.00')
    expect(d['Precio de venta']).toBe('+2,500.00') // salePriceFinal, labelled like the card
  })

  it('reverse-quote: sale-price delta + margin delta when both are the same kind', () => {
    const child = { salePrice: 60000, achievedPct: 0.25, marginKind: 'bruto' }
    const parent = { salePrice: 58000, achievedPct: 0.22, marginKind: 'bruto' }
    const d = map(deltasFor('reverse-quote', child, parent))
    expect(d['Precio de venta']).toBe('+2,000.00')
    expect(d['Margen']).toBe('+3 pp') // (0.25 - 0.22) * 100
  })

  it('reverse-quote: DROPS the margin chip across kinds (never subtracts net-cash from gross)', () => {
    const child = { salePrice: 60000, achievedPct: 0.12, marginKind: 'neto_caja' }
    const parent = { salePrice: 58000, achievedPct: 0.25, marginKind: 'bruto' }
    const d = deltasFor('reverse-quote', child, parent)
    expect(map(d)['Precio de venta']).toBe('+2,000.00') // sale price stays (both final price)
    expect(map(d)['Margen']).toBeUndefined() // -13pp gross-vs-net-cash never shown
    expect(d).toHaveLength(1)
  })

  it('fit: units delta + volume-utilization delta (pp), signs shown', () => {
    const child = { units: 60, cbmUsedPct: 88 }
    const parent = { units: 68, cbmUsedPct: 95 }
    const d = map(deltasFor('fit', child, parent))
    expect(d['Unidades']).toBe('-8')
    expect(d['Volumen']).toBe('-7 pp')
  })

  it('shows an unsigned zero when a figure did not move', () => {
    const same = { landedCost: 8000, salePriceFinal: 12500 }
    const d = map(deltasFor('landed-cost', same, { ...same }))
    expect(d['Costo puesto']).toBe('0.00') // money keeps 2 decimals; exceptZero drops the sign
  })

  it('returns [] for a different renderer or missing payloads', () => {
    expect(deltasFor('quote-proposal', {}, {})).toEqual([])
    expect(deltasFor('landed-cost', null, { landedCost: 1 })).toEqual([])
    expect(deltasFor('landed-cost', { landedCost: NaN }, { landedCost: 1 })).toEqual([])
  })

  it('drops only the chip whose field is missing, keeps the comparable one', () => {
    // A partial payload (final price absent) still yields the landed-cost delta and
    // never renders "NaN" for the missing figure.
    const child = { landedCost: 9000 }
    const parent = { landedCost: 8000 }
    const d = deltasFor('landed-cost', child, parent)
    expect(d).toHaveLength(1)
    expect(map(d)['Costo puesto']).toBe('+1,000.00')
    expect(JSON.stringify(d)).not.toContain('NaN')
  })
})
