import { describe, it, expect } from 'vitest'
import { inheritedCostingLabels, inheritedFitLabels, safeSeq } from './canvas-seed'
import { DEFAULT_INPUTS } from '@/lib/costing/engine'
import type { ContainerFitInput } from './container-fit'

describe('inheritedCostingLabels', () => {
  it('labels a deviating, unstated field as inherited', () => {
    const inputs = { ...DEFAULT_INPUTS, exchangeRate: 3.85, adValoremRate: 0.06 }
    const labels = inheritedCostingLabels(inputs, DEFAULT_INPUTS, new Set())
    expect(labels).toContain('TC 3.85')
    expect(labels).toContain('Ad Val 6.0%')
  })

  it('omits a field the operator restated this turn', () => {
    const inputs = { ...DEFAULT_INPUTS, exchangeRate: 3.85 }
    const labels = inheritedCostingLabels(inputs, DEFAULT_INPUTS, new Set(['exchangeRate']))
    expect(labels).not.toContain('TC 3.85')
  })

  it('omits fields equal to the defaults (nothing was inherited)', () => {
    const labels = inheritedCostingLabels({ ...DEFAULT_INPUTS }, DEFAULT_INPUTS, new Set())
    expect(labels).toEqual([])
  })

  it('surfaces freight only under EXW/FOB — not CFR/CIF', () => {
    const fob = { ...DEFAULT_INPUTS, incoterm: 'FOB' as const, freightInternational: 2500 }
    expect(inheritedCostingLabels(fob, DEFAULT_INPUTS, new Set())).toContain('Flete 2500')
    const cif = { ...DEFAULT_INPUTS, incoterm: 'CIF' as const, freightInternational: 2500 }
    // Under CIF the freight is already inside the stated value; never a provenance label.
    expect(inheritedCostingLabels(cif, DEFAULT_INPUTS, new Set()).some((l) => l.startsWith('Flete'))).toBe(false)
  })
})

describe('inheritedFitLabels', () => {
  const box: ContainerFitInput = {
    itemLengthM: 1.2,
    itemWidthM: 1,
    itemHeightM: 1.1,
    weightEachKg: 500,
    weightCapKg: null,
    quantity: null,
    containerKind: '20GP',
  }

  it('labels box + container + weight when none were restated', () => {
    const labels = inheritedFitLabels(box, new Set())
    expect(labels).toContain('Caja 1.2×1×1.1 m')
    expect(labels).toContain('20GP')
    expect(labels).toContain('500 kg c/u')
  })

  it('omits the box + container the operator restated this turn', () => {
    const labels = inheritedFitLabels({ ...box, weightEachKg: null }, new Set(['box', 'containerKind']))
    expect(labels).toEqual([])
  })
})

describe('safeSeq', () => {
  it('accepts a positive integer', () => {
    expect(safeSeq(3)).toBe(3)
  })

  it('rejects zero, negatives, non-integers, and out-of-range', () => {
    expect(safeSeq(0)).toBeUndefined()
    expect(safeSeq(-1)).toBeUndefined()
    expect(safeSeq(1.5)).toBeUndefined()
    expect(safeSeq(100_000)).toBeUndefined()
    expect(safeSeq(1e9)).toBeUndefined()
  })

  it('rejects non-number junk from a hostile client', () => {
    expect(safeSeq('3')).toBeUndefined()
    expect(safeSeq(NaN)).toBeUndefined()
    expect(safeSeq(null)).toBeUndefined()
    expect(safeSeq(undefined)).toBeUndefined()
    expect(safeSeq({})).toBeUndefined()
  })
})
