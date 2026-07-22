import { describe, it, expect } from 'vitest'
import { computeContainerFit, CONTAINER_SPECS, STOWAGE_FACTOR } from './container-fit'

describe('computeContainerFit', () => {
  it('returns null on non-positive geometry', () => {
    expect(
      computeContainerFit({ itemLengthM: 0, itemWidthM: 1, itemHeightM: 1, containerKind: '40HC' }),
    ).toBeNull()
  })

  it('is volume-limited when no weight is given', () => {
    const r = computeContainerFit({
      itemLengthM: 1,
      itemWidthM: 1,
      itemHeightM: 1, // 1 CBM per unit
      containerKind: '40HC',
    })!
    const expected = Math.floor((CONTAINER_SPECS['40HC'].internalCbm * STOWAGE_FACTOR) / 1)
    expect(r.units).toBe(expected)
    expect(r.limitedBy).toBe('volume')
    expect(r.unitsByWeight).toBeNull()
    expect(r.totalWeightKg).toBeNull()
  })

  it('takes the smaller of volume and weight, and reports the binding limit', () => {
    // 1 CBM box → ~68 by volume in a 40HC; a 2000kg box under a 22t cap → 11 by weight.
    const r = computeContainerFit({
      itemLengthM: 1,
      itemWidthM: 1,
      itemHeightM: 1,
      weightEachKg: 2000,
      weightCapKg: 22000,
      containerKind: '40HC',
    })!
    expect(r.unitsByWeight).toBe(11)
    expect(r.units).toBe(11)
    expect(r.limitedBy).toBe('weight')
    expect(r.totalWeightKg).toBe(22000)
  })

  it('computes containers needed for a requested quantity', () => {
    const r = computeContainerFit({
      itemLengthM: 1,
      itemWidthM: 1,
      itemHeightM: 1,
      weightEachKg: 2000,
      weightCapKg: 22000, // 11 fit
      quantity: 30,
      containerKind: '40HC',
    })!
    expect(r.requested).toEqual({ quantity: 30, fitsInOne: false, containersNeeded: 3 })
  })

  it('falls back to the kind payload when no weight cap is given', () => {
    const r = computeContainerFit({
      itemLengthM: 1,
      itemWidthM: 1,
      itemHeightM: 1,
      weightEachKg: 1000,
      containerKind: '20GP',
    })!
    // volume ~29, weight = floor(28200/1000) = 28 → weight-limited
    expect(r.unitsByWeight).toBe(28)
    expect(r.limitedBy).toBe('weight')
  })
})
