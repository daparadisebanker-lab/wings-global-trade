import { describe, expect, it } from 'vitest'
import { computeRbProductCapabilities, mapRbPackingProfileRow, type RawRbPackingProfileRow } from './rb-catalog-logic'

describe('computeRbProductCapabilities', () => {
  it('grants nothing to a user with no rb role and no admin flag', () => {
    const caps = computeRbProductCapabilities([], false, true)
    expect(caps).toEqual({
      canCreate: false,
      canEdit: false,
      canSubmitForReview: false,
      canPublish: false,
      canRetire: false,
      canRollback: false,
    })
  })

  it('gives a BRAND_VIEWER read-only (no write capability)', () => {
    const caps = computeRbProductCapabilities(['BRAND_VIEWER'], false, true)
    expect(caps.canCreate).toBe(false)
    expect(caps.canEdit).toBe(false)
    expect(caps.canPublish).toBe(false)
  })

  it('lets BRAND_OPS create/edit/submit but not publish or retire', () => {
    const caps = computeRbProductCapabilities(['BRAND_OPS'], false, true)
    expect(caps.canCreate).toBe(true)
    expect(caps.canEdit).toBe(true)
    expect(caps.canSubmitForReview).toBe(true)
    expect(caps.canPublish).toBe(false)
    expect(caps.canRetire).toBe(false)
    expect(caps.canRollback).toBe(false)
  })

  it('lets BRAND_MANAGER publish/retire only when the brand kit is complete', () => {
    const complete = computeRbProductCapabilities(['BRAND_MANAGER'], false, true)
    expect(complete.canPublish).toBe(true)
    expect(complete.canRetire).toBe(true)
    expect(complete.canRollback).toBe(true)

    const incomplete = computeRbProductCapabilities(['BRAND_MANAGER'], false, false)
    expect(incomplete.canEdit).toBe(true) // still editable
    expect(incomplete.canPublish).toBe(false) // kit gate hides publish
  })

  it('applies the kit gate to group admins too (no publish under an unvalidated kit)', () => {
    expect(computeRbProductCapabilities([], true, false).canPublish).toBe(false)
    expect(computeRbProductCapabilities([], true, true).canPublish).toBe(true)
  })
})

describe('mapRbPackingProfileRow', () => {
  const base: RawRbPackingProfileRow = {
    id: 'p1',
    represented_brand_id: 'b1',
    product_slug: 'papel-higienico-bambu',
    product_name: 'Papel higiénico de bambú',
    gtin: '0723707931803',
    package_kind: 'box',
    packets_per_package: '6',
    units_per_package: '60',
    unit_name_plural: 'rollos',
    package_cbm: '0.0777',
    package_kg: '9.70',
    stackable: true,
    notes: null,
  }

  it('coerces numeric(…) strings from PostgREST into numbers', () => {
    const row = mapRbPackingProfileRow(base)
    expect(row.packetsPerPackage).toBe(6)
    expect(row.unitsPerPackage).toBe(60)
    expect(row.packageCbm).toBeCloseTo(0.0777)
    expect(row.packageKg).toBeCloseTo(9.7)
  })

  it('applies column defaults for null/absent fields', () => {
    const row = mapRbPackingProfileRow({
      ...base,
      gtin: null,
      package_kind: null,
      unit_name_plural: null,
      stackable: null,
      packets_per_package: null,
    })
    expect(row.gtin).toBeNull()
    expect(row.packageKind).toBe('box')
    expect(row.unitNamePlural).toBe('unidades')
    expect(row.stackable).toBe(true)
    expect(row.packetsPerPackage).toBe(0)
  })
})
