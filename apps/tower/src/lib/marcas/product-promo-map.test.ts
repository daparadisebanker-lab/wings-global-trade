import { describe, expect, it } from 'vitest'
import { humanizeKey, primitiveSpecs, productRowToPromo } from './product-promo-map'
import type { ProductRow } from '@/lib/actions/catalog'

describe('humanizeKey', () => {
  it('splits camelCase and snake/kebab into words', () => {
    expect(humanizeKey('unitsPerCarton')).toBe('units Per Carton')
    expect(humanizeKey('peso_neto_kg')).toBe('peso neto kg')
    expect(humanizeKey('hp-rating')).toBe('hp rating')
  })
})

describe('primitiveSpecs', () => {
  it('keeps scalar entries, drops objects/arrays/reserved/blank, caps', () => {
    const specs = {
      potencia: '40 HP',
      ruedas: 4,
      electrico: false,
      dimensions: { l: 1 }, // reserved structured → skip
      packing: { x: 1 }, // reserved → skip
      extras: ['a', 'b'], // array/object → skip
      vacio: '   ', // blank → skip
      nulo: null, // null → skip
    }
    const rows = primitiveSpecs(specs)
    expect(rows).toContainEqual({ label: 'potencia', value: '40 HP' })
    expect(rows).toContainEqual({ label: 'ruedas', value: '4' })
    expect(rows).toContainEqual({ label: 'electrico', value: 'false' })
    expect(rows.find((r) => r.label === 'dimensions')).toBeUndefined()
    expect(rows.find((r) => r.label === 'extras')).toBeUndefined()
    expect(rows).toHaveLength(3)
  })
  it('respects the cap', () => {
    const specs = Object.fromEntries(Array.from({ length: 10 }, (_, i) => [`k${i}`, i]))
    expect(primitiveSpecs(specs, 4)).toHaveLength(4)
  })
})

const row = (over: Partial<ProductRow> = {}): ProductRow => ({
  id: 'p1',
  brandId: 'b1',
  laneId: 'l1',
  laneSlug: 'maquinaria',
  laneArchetype: 'EQUIPMENT' as ProductRow['laneArchetype'],
  slug: 'tractor-40hp',
  status: 'PUBLISHED' as ProductRow['status'],
  categoryPath: ['Tractores', '40hp'],
  name: { es: 'Tractor 40HP', en: '40HP Tractor' },
  specs: { potencia: '40 HP' },
  specSchemaId: null,
  hsCode: '8701.90',
  moq: 2,
  cbmPerUnit: 3,
  createdBy: null,
  updatedAt: '2026-07-24T00:00:00Z',
  ...over,
})

describe('productRowToPromo', () => {
  it('maps name (by locale), top category, specs + HS, and MOQ', () => {
    const p = productRowToPromo(row(), 'es')
    expect(p.productName).toBe('Tractor 40HP')
    expect(p.category).toBe('Tractores')
    expect(p.specs).toContainEqual({ label: 'potencia', value: '40 HP' })
    expect(p.specs).toContainEqual({ label: 'HS', value: '8701.90' })
    expect(p.moq).toBe('2')
    expect(p.listingUrl).toBeUndefined() // no fabricated link
  })
  it('prefers the requested locale, falls back across locales', () => {
    expect(productRowToPromo(row(), 'en').productName).toBe('40HP Tractor')
    expect(productRowToPromo(row({ name: { es: '', en: 'Only EN' } }), 'es').productName).toBe('Only EN')
  })
  it('threads the rep overrides (price note, accent, owner)', () => {
    const p = productRowToPromo(row(), 'es', { priceNote: ' campaña ', accent: '#123456', ownerLabel: 'WGT/01' })
    expect(p.priceNote).toBe('campaña')
    expect(p.accent).toBe('#123456')
    expect(p.ownerLabel).toBe('WGT/01')
  })
  it('does not push HS when specs are already full', () => {
    const specs = Object.fromEntries(Array.from({ length: 6 }, (_, i) => [`k${i}`, i]))
    const p = productRowToPromo(row({ specs }), 'es')
    expect(p.specs).toHaveLength(6)
    expect(p.specs?.find((s) => s.label === 'HS')).toBeUndefined()
  })
})
