import { describe, it, expect } from 'vitest'
import { inheritedCostingLabels, inheritedFitLabels, safeSeq } from './canvas-seed'
import { DEFAULT_INPUTS } from '@/lib/costing/engine'
import type { ContainerFitInput } from './container-fit'

/** Fields are localized descriptors now — flatten to the ES side for assertions. */
const es = (fields: { es: string }[]) => fields.map((f) => f.es)
const en = (fields: { en: string }[]) => fields.map((f) => f.en)

describe('inheritedCostingLabels', () => {
  it('labels a deviating, unstated field as inherited', () => {
    const inputs = { ...DEFAULT_INPUTS, exchangeRate: 3.85, adValoremRate: 0.06 }
    const labels = es(inheritedCostingLabels(inputs, DEFAULT_INPUTS, new Set()))
    expect(labels).toContain('TC 3.85')
    expect(labels).toContain('Ad Val 6.0%')
  })

  it('labels the inherited FOB — the load-bearing base price', () => {
    const inputs = { ...DEFAULT_INPUTS, fob: 8000 }
    const labels = es(inheritedCostingLabels(inputs, DEFAULT_INPUTS, new Set()))
    expect(labels).toContain('FOB 8,000') // grouped, matching the money() strips
  })

  it('omits a field the operator restated this turn', () => {
    const inputs = { ...DEFAULT_INPUTS, exchangeRate: 3.85 }
    const labels = es(inheritedCostingLabels(inputs, DEFAULT_INPUTS, new Set(['exchangeRate'])))
    expect(labels).not.toContain('TC 3.85')
  })

  it('omits fields equal to the defaults (nothing was inherited)', () => {
    expect(inheritedCostingLabels({ ...DEFAULT_INPUTS }, DEFAULT_INPUTS, new Set())).toEqual([])
  })

  it('surfaces freight only under EXW/FOB — not CFR/CIF', () => {
    const fob = { ...DEFAULT_INPUTS, incoterm: 'FOB' as const, freightInternational: 2500 }
    expect(es(inheritedCostingLabels(fob, DEFAULT_INPUTS, new Set()))).toContain('Flete 2,500')
    const cif = { ...DEFAULT_INPUTS, incoterm: 'CIF' as const, freightInternational: 2500 }
    expect(es(inheritedCostingLabels(cif, DEFAULT_INPUTS, new Set())).some((l) => l.startsWith('Flete'))).toBe(false)
  })

  it('localizes the freight label (Flete / Freight) while keeping value-only tokens identical', () => {
    const fob = { ...DEFAULT_INPUTS, incoterm: 'FOB' as const, freightInternational: 2500, adValoremRate: 0.06 }
    const fields = inheritedCostingLabels(fob, DEFAULT_INPUTS, new Set())
    expect(en(fields)).toContain('Freight 2,500')
    expect(es(fields)).toContain('Flete 2,500')
    expect(en(fields)).toContain('Ad Val 6.0%') // enum/number tokens read the same both ways
  })

  it('never stringifies guard-passing junk as fact (out-of-enum incoterm, NaN rate)', () => {
    const junk = {
      ...DEFAULT_INPUTS,
      incoterm: 'not-an-incoterm' as unknown as (typeof DEFAULT_INPUTS)['incoterm'],
      adValoremRate: NaN,
      exchangeRate: Number.POSITIVE_INFINITY,
    }
    const labels = es(inheritedCostingLabels(junk, DEFAULT_INPUTS, new Set()))
    expect(labels.some((l) => l.includes('not-an-incoterm'))).toBe(false)
    expect(labels.some((l) => l.includes('NaN'))).toBe(false)
    expect(labels.some((l) => l.includes('Infinity'))).toBe(false)
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
    const labels = es(inheritedFitLabels(box, new Set(), '20GP', '40HC'))
    expect(labels).toContain('Caja 1.2×1×1.1 m')
    expect(labels).toContain('20GP')
    expect(labels).toContain('500 kg c/u')
  })

  it('still discloses the box when only one dimension was restated (two inherited)', () => {
    const labels = es(inheritedFitLabels(box, new Set(['itemLengthM']), '20GP', '40HC'))
    expect(labels).toContain('Caja 1.2×1×1.1 m')
  })

  it('omits every field the operator restated this turn', () => {
    const stated = new Set(['itemLengthM', 'itemWidthM', 'itemHeightM', 'containerKind', 'weightEachKg'])
    expect(inheritedFitLabels(box, stated, '20GP', '40HC')).toEqual([])
  })

  it('never labels the app-default container as inherited', () => {
    const onDefault = { ...box, containerKind: '40HC' as const }
    const labels = es(inheritedFitLabels(onDefault, new Set(), '40HC', '40HC'))
    expect(labels).not.toContain('40HC')
  })

  it('never claims the fallback kind when the canvas kind was rejected (ctxKind null)', () => {
    // Model/ctx kind failed validation → container-fit fell back to 40HC; that is not
    // provenance from the canvas.
    const fellBack = { ...box, containerKind: '40HC' as const }
    const labels = es(inheritedFitLabels(fellBack, new Set(), null, '40HC'))
    expect(labels).not.toContain('40HC')
  })

  it('labels an inherited quantity (it flips the question the fit answers)', () => {
    const labels = es(inheritedFitLabels({ ...box, quantity: 200 }, new Set(), '20GP', '40HC'))
    expect(labels).toContain('200 uds')
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
