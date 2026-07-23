import { describe, it, expect } from 'vitest'
import { computeContainerFit, CONTAINER_SPECS, STOWAGE_FACTOR, type ContainerFitInput } from './container-fit'
import { containerFitCapability, type ContainerFitPayload } from './capabilities/container-fit'
import type { IntelligenceClient } from '@/lib/ai/client'

function stubClient(json: object): IntelligenceClient {
  return { complete: async () => JSON.stringify(json) } as unknown as IntelligenceClient
}

describe('containerFitCapability.run — Part B context inheritance', () => {
  it('inherits the box + container from the canvas on a weight-only follow-up', async () => {
    const client = stubClient({ understood: true, weightEachKg: 950 })
    const input: ContainerFitInput = {
      itemLengthM: 1.2,
      itemWidthM: 1.0,
      itemHeightM: 1.1,
      weightEachKg: 500,
      weightCapKg: null,
      quantity: null,
      containerKind: '20GP',
    }
    const res = await containerFitCapability.run(client, '¿y si pesan 950 kg cada una?', undefined, { kind: 'fit', input })
    const data = res.data as ContainerFitPayload
    expect(data.input.itemLengthM).toBe(1.2) // inherited box
    expect(data.input.containerKind).toBe('20GP') // inherited container (not defaulted to 40HC)
    expect(data.input.weightEachKg).toBe(950) // overridden
  })
})

describe('containerFitCapability.run — provenance (Scenario Ledger)', () => {
  it('stamps seededFrom with the inherited box + container on a weight-only follow-up', async () => {
    const client = stubClient({ understood: true, weightEachKg: 950 })
    const input: ContainerFitInput = {
      itemLengthM: 1.2,
      itemWidthM: 1.0,
      itemHeightM: 1.1,
      weightEachKg: 500,
      weightCapKg: null,
      quantity: null,
      containerKind: '20GP',
    }
    const res = await containerFitCapability.run(client, '¿y si pesan 950 kg cada una?', undefined, {
      kind: 'fit',
      input,
      sourceSeq: 4,
    })
    const data = res.data as ContainerFitPayload
    expect(data.seededFrom?.seq).toBe(4)
    expect(data.seededFrom?.fields).toContain('Caja 1.2×1×1.1 m')
    expect(data.seededFrom?.fields).toContain('20GP')
  })

  it('has no seededFrom when the box is stated fresh (no canvas)', async () => {
    const client = stubClient({ understood: true, itemLengthM: 1, itemWidthM: 1, itemHeightM: 1, containerKind: '40HC' })
    const res = await containerFitCapability.run(client, 'una caja de 1×1×1 en un 40HC', undefined, undefined)
    const data = res.data as ContainerFitPayload
    expect(data.seededFrom).toBeUndefined()
  })
})

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
