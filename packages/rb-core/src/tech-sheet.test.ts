import { describe, it, expect } from 'vitest'
import { buildTechSheetSections, type TechSheetFacts } from './tech-sheet'

const BASE: TechSheetFacts = {
  container: {
    kind: '40HC',
    ref: 'RB01-40HC',
    totalSlots: 10,
    packagesPerSlot: 100,
    routeLabel: 'Qingdao → Callao',
    phaseLabel: 'En tránsito',
  },
  packing: {
    packageKind: 'caja',
    unitsPerPackage: 48,
    packetsPerPackage: 4,
    packageCbm: 0.05,
    packageKg: 9.7,
    unitNamePlural: 'rollos',
    gtin: '7750182000012',
  },
  product: { hsCode: '4818.10.00.00', moq: 1, moqUnit: 'cupos', cbmPerUnit: 0.001 },
}

function rowValue(sections: ReturnType<typeof buildTechSheetSections>, title: string, labelEn: string) {
  const s = sections.find((x) => x.titleEn === title)
  return s?.rows.find((r) => r.labelEn === labelEn)?.value
}

function row(sections: ReturnType<typeof buildTechSheetSections>, title: string, labelEn: string) {
  return sections.find((x) => x.titleEn === title)?.rows.find((r) => r.labelEn === labelEn)
}

/** Digits only — assert numeric content without depending on the runtime ICU
 *  grouping separator (es-PE resolves to "." with full ICU, "," without). */
function digits(v: string | undefined): string {
  return (v ?? '').replace(/[^\d]/g, '')
}

describe('buildTechSheetSections', () => {
  it('emits the fixed section order without an allocation section by default', () => {
    const s = buildTechSheetSections(BASE)
    expect(s.map((x) => x.titleEn)).toEqual(['Container', 'Slot', 'Packaging', 'Customs'])
  })

  it('exhibits the per-slot cascade (packages × units) from the container template', () => {
    const s = buildTechSheetSections(BASE)
    // packagesPerSlot 100 · unitsPerPackage 48 → 4.800 rollos/cupo (es-PE grouping)
    expect(rowValue(s, 'Slot', 'Packages per slot')).toBe('100')
    expect(digits(rowValue(s, 'Slot', 'Units per slot (rollos)'))).toBe('4800')
    expect(rowValue(s, 'Slot', 'Weight per slot')).toMatch(/^970[.,]00 kg$/)
  })

  it('exhibits full-container totals', () => {
    const s = buildTechSheetSections(BASE)
    // 10 slots × 100 packages = 1000 packages
    expect(digits(rowValue(s, 'Container', 'Packages per container'))).toBe('1000')
  })

  it('renders customs numbers, and "—" when the product facts are absent', () => {
    const withProduct = buildTechSheetSections(BASE)
    expect(rowValue(withProduct, 'Customs', 'HS code')).toBe('4818.10.00.00')

    const noProduct = buildTechSheetSections({ ...BASE, product: null })
    expect(rowValue(noProduct, 'Customs', 'HS code')).toBe('—')
    expect(rowValue(noProduct, 'Customs', 'MOQ')).toBe('—')
  })

  it('appends the Allocation section only when slots are requested and cascades them', () => {
    const s = buildTechSheetSections({ ...BASE, requestedSlots: 3 })
    expect(s.map((x) => x.titleEn)).toContain('Allocation')
    // 3 slots × 100 packages/slot × 48 units = 14.400 units
    expect(rowValue(s, 'Allocation', 'Slots allocated')).toBe('3')
    expect(digits(rowValue(s, 'Allocation', 'Units (rollos)'))).toBe('14400')
  })

  it('is pure — identical facts produce identical output', () => {
    expect(buildTechSheetSections(BASE)).toEqual(buildTechSheetSections(BASE))
  })

  it('carries a machine-typed `num` for numeric rows so an export types them as real numbers', () => {
    const s = buildTechSheetSections(BASE)
    // Counts: raw integers, unit absent.
    expect(row(s, 'Container', 'Total slots')?.num).toBe(10)
    expect(row(s, 'Container', 'Packages per container')?.num).toBe(1000)
    expect(row(s, 'Container', 'Total slots')?.unit).toBeUndefined()
    // Volume rows tagged m³ ; weight rows tagged kg.
    expect(row(s, 'Slot', 'Weight per slot')?.num).toBeCloseTo(970, 5)
    expect(row(s, 'Slot', 'Weight per slot')?.unit).toBe('kg')
    expect(row(s, 'Packaging', 'Package volume')?.num).toBeCloseTo(0.05, 5)
    expect(row(s, 'Packaging', 'Package volume')?.unit).toBe('m³')
  })

  it('leaves identifier/text rows non-numeric (num null) — HS, GTIN, route, class', () => {
    const s = buildTechSheetSections(BASE)
    expect(row(s, 'Customs', 'HS code')?.num).toBeNull()
    expect(row(s, 'Packaging', 'GTIN')?.num).toBeNull()
    expect(row(s, 'Container', 'Route')?.num).toBeNull()
    expect(row(s, 'Container', 'Class')?.num).toBeNull()
  })

  it('nulls a numeric row when the underlying product fact is absent', () => {
    const s = buildTechSheetSections({ ...BASE, product: null })
    expect(row(s, 'Customs', 'MOQ')?.num).toBeNull()
    expect(row(s, 'Customs', 'CBM per unit')?.num).toBeNull()
  })
})
