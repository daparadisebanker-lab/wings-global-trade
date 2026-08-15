// Locks the container-fit-driven freight split against the exact real-world
// case that motivated it: a 4.59×1.90×1.685m / 4720kg unit fits only 2-per-40HC
// (grid-packed, matching the public cubicaje tool's own output) — so a flat
// "$2000/unit" guess was wrong; the true rate is $3000/unit at a clean batch of
// 4, and MORE per unit whenever the last container isn't full.
import { describe, expect, it } from 'vitest'
import { computeContainerFreight, type ContainerFreightConfig } from './container-freight'

function config(over: Partial<ContainerFreightConfig> = {}): ContainerFreightConfig {
  return {
    itemLengthMm: 4590,
    itemWidthMm: 1900,
    itemHeightMm: 1685,
    weightEachKg: 4720,
    containerKind: '40HC',
    rotatable: false,
    stackable: false,
    containerRateUsd: 6000,
    quantity: 4,
    ...over,
  }
}

describe('computeContainerFreight', () => {
  it('returns null on non-positive geometry', () => {
    expect(computeContainerFreight(config({ itemLengthMm: 0 }))).toBeNull()
  })

  it('returns null when quantity or rate is not positive', () => {
    expect(computeContainerFreight(config({ quantity: 0 }))).toBeNull()
    expect(computeContainerFreight(config({ containerRateUsd: -1 }))).toBeNull()
  })

  it('matches the reference case: 2 per 40HC, $3000/unit for a clean batch of 4', () => {
    const r = computeContainerFreight(config())!
    expect(r.unitsPerContainer).toBe(2)
    expect(r.grid).toEqual({ alongL: 2, alongW: 1, layers: 1 })
    expect(r.limitedBy).toBe('volume')
    expect(r.containersNeeded).toBe(2)
    expect(r.totalFreightUsd).toBe(12000)
    expect(r.freightPerUnitUsd).toBe(3000)
  })

  it('a partially-filled last container raises the per-unit rate (3 units still needs 2 containers)', () => {
    const r = computeContainerFreight(config({ quantity: 3 }))!
    expect(r.containersNeeded).toBe(2)
    expect(r.totalFreightUsd).toBe(12000)
    expect(r.freightPerUnitUsd).toBe(4000)
  })

  it('a batch smaller than one container still books a whole container', () => {
    const r = computeContainerFreight(config({ quantity: 1 }))!
    expect(r.containersNeeded).toBe(1)
    expect(r.freightPerUnitUsd).toBe(6000)
  })

  it('is weight-limited when the payload cap binds before the packing grid', () => {
    const r = computeContainerFreight(
      config({
        itemLengthMm: 1000,
        itemWidthMm: 1000,
        itemHeightMm: 1000,
        weightEachKg: 2000,
        quantity: 14,
      }),
    )!
    // Grid: floor(12032/1000)=12 × floor(2352/1000)=2 × 1 layer = 24 by volume;
    // floor(28500/2000)=14 by weight → weight binds.
    expect(r.unitsPerContainer).toBe(14)
    expect(r.limitedBy).toBe('weight')
  })

  it('returns null when the item does not fit the container at all', () => {
    expect(
      computeContainerFreight(config({ itemLengthMm: 20000, itemWidthMm: 1000, itemHeightMm: 1000, weightEachKg: null })),
    ).toBeNull()
  })

  it('rotation can be the only orientation that fits', () => {
    const cfg = config({
      itemLengthMm: 100,
      itemWidthMm: 5000,
      itemHeightMm: 1000,
      weightEachKg: null,
      containerKind: '20GP',
      quantity: 20,
    })
    expect(computeContainerFreight(cfg)).toBeNull() // not rotatable: alongW = floor(2352/5000) = 0
    const r = computeContainerFreight({ ...cfg, rotatable: true })!
    expect(r.grid).toEqual({ alongL: 1, alongW: 23, layers: 1 })
    expect(r.unitsPerContainer).toBe(23)
  })

  it('stacking increases the layer count when enabled', () => {
    const flat = computeContainerFreight(
      config({ itemLengthMm: 1000, itemWidthMm: 1000, itemHeightMm: 500, weightEachKg: null, stackable: false }),
    )!
    const stacked = computeContainerFreight(
      config({ itemLengthMm: 1000, itemWidthMm: 1000, itemHeightMm: 500, weightEachKg: null, stackable: true }),
    )!
    expect(flat.grid.layers).toBe(1)
    expect(stacked.grid.layers).toBeGreaterThan(1)
    expect(stacked.unitsPerContainer).toBeGreaterThan(flat.unitsPerContainer)
  })
})
