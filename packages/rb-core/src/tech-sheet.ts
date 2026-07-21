// @wings/rb-core · tech-sheet.ts
// The RB technical-spec-sheet contract (SPEC R6/R18 · root CLAUDE.md §5-bis) —
// the ONE place that turns a represented-brand container's facts into ordered,
// bilingual sections of EXHIBITED numbers (CLAUDE.md Directive 5: CBM, slots,
// packages-per-slot, packing cascade, HS, GTIN are brand assets, tabular-mono).
//
// Pure + framework-agnostic, exactly like packing.ts / promo.ts: given the same
// facts it returns the same sections. It owns NO app or Supabase imports — the
// TOWER action (apps/tower/lib/actions/rb-quotation.ts) assembles the facts from
// RLS-scoped reads and the renderer draws the sections. ALLOCATION only: the unit
// is a slot / quantity-in-container, never a retail unit.
import { cascadeForSlots, type RbContainerTemplate } from './packing'

const EM_DASH = '—'

/** es-PE grouped integer (1.000) — the tabular-mono exhibit format. */
function fmtInt(n: number): string {
  return new Intl.NumberFormat('es-PE', { maximumFractionDigits: 0 }).format(n)
}

/** es-PE grouped decimal to a fixed number of places (CBM = 3, kg = 2). */
function fmtDec(n: number, decimals: number): string {
  return new Intl.NumberFormat('es-PE', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(n)
}

function cbm(n: number): string {
  return `${fmtDec(n, 3)} m³`
}
function kg(n: number): string {
  return `${fmtDec(n, 2)} kg`
}

// ── Exhibited row + section ──────────────────────────────────────────────────
export interface TechSheetRow {
  label: string
  labelEn: string
  /** Human-formatted exhibit string (es-PE grouped) — what a print surface draws. */
  value: string
  /** Machine-typed value of the SAME number, or null for code/text rows (HS, GTIN,
   *  route, class, phase). Lets a spreadsheet export type the cell as a real number
   *  instead of a string, so Excel treats CBM/slots/packing as numeric brand assets.
   *  Presentation-agnostic: the exporter decides the number format from `unit`. */
  num?: number | null
  /** Unit of `num` for an exporter to format: 'm³' (3-decimal volume) or 'kg'
   *  (2-decimal weight). Absent → a plain integer count. */
  unit?: 'm³' | 'kg'
}

export interface TechSheetSection {
  title: string
  titleEn: string
  rows: TechSheetRow[]
}

// ── Normalized facts (structural subsets of the TOWER RB reads) ───────────────
/** Container + template facts (rb_containers + rb_container_templates). */
export interface TechSheetContainerFacts {
  /** Container class, e.g. "40HC" / "20GP" (template.kind). */
  kind: string
  /** Template reference (template.ref), e.g. "RB01-40HC". */
  ref?: string | null
  totalSlots: number
  packagesPerSlot: number
  /** "Qingdao → Callao" — from the container route (never invented here). */
  routeLabel?: string | null
  /** Human shipping phase label, e.g. "En tránsito". */
  phaseLabel?: string | null
}

/** Packing profile facts (rb_packing_profiles). */
export interface TechSheetPackingFacts {
  /** Package kind, e.g. "caja" / "box". */
  packageKind?: string | null
  unitsPerPackage: number
  packetsPerPackage: number
  packageCbm: number
  packageKg: number
  unitNamePlural?: string | null
  gtin?: string | null
}

/** Customs / catalog numbers (rb_products — tower_26). All optional. */
export interface TechSheetProductFacts {
  hsCode?: string | null
  moq?: number | null
  moqUnit?: string | null
  cbmPerUnit?: number | null
}

export interface TechSheetFacts {
  container: TechSheetContainerFacts
  packing: TechSheetPackingFacts
  product?: TechSheetProductFacts | null
  /** Slots the quote allocates — when >0, appends the ASIGNACIÓN section that
   *  cascades the negotiated slots to packages/packets/units/kg. */
  requestedSlots?: number | null
}

/** Template shape the cascade needs, from the packing + container facts. */
function templateOf(f: TechSheetFacts): RbContainerTemplate {
  return {
    packagesPerSlot: f.container.packagesPerSlot,
    packetsPerPackage: f.packing.packetsPerPackage,
    unitsPerPackage: f.packing.unitsPerPackage,
    packageKg: f.packing.packageKg,
  }
}

/**
 * Ordered, bilingual tech-sheet sections. Fixed order, every number exhibited as
 * a brand asset; absent numbers render "—" so a section is never a collapsed
 * table. Pure: same facts → same sections.
 *
 * Sections: Contenedor (the box) · Cupo (per-slot cascade — the ALLOCATION unit)
 * · Empaque (the package) · Aduana (HS/MOQ/CBM) · Asignación (only when the quote
 * requests slots).
 */
export function buildTechSheetSections(facts: TechSheetFacts): TechSheetSection[] {
  const { container, packing, product } = facts
  const template = templateOf(facts)
  const perSlot = cascadeForSlots(template, 1)
  const full = cascadeForSlots(template, Math.max(0, container.totalSlots))
  const slotCbm = container.packagesPerSlot * packing.packageCbm
  const unitName = packing.unitNamePlural ?? 'unidades'

  const containerCbm = full.packages * packing.packageCbm

  const sections: TechSheetSection[] = [
    {
      title: 'Contenedor',
      titleEn: 'Container',
      rows: [
        { label: 'Clase', labelEn: 'Class', value: container.kind || EM_DASH, num: null },
        { label: 'Referencia', labelEn: 'Reference', value: container.ref || EM_DASH, num: null },
        { label: 'Cupos totales', labelEn: 'Total slots', value: fmtInt(container.totalSlots), num: container.totalSlots },
        { label: 'Cajas por cupo', labelEn: 'Packages per slot', value: fmtInt(container.packagesPerSlot), num: container.packagesPerSlot },
        { label: 'Cajas por contenedor', labelEn: 'Packages per container', value: fmtInt(full.packages), num: full.packages },
        { label: 'Volumen por contenedor', labelEn: 'Volume per container', value: cbm(containerCbm), num: containerCbm, unit: 'm³' },
        { label: 'Ruta', labelEn: 'Route', value: container.routeLabel || EM_DASH, num: null },
        { label: 'Fase de embarque', labelEn: 'Shipping phase', value: container.phaseLabel || EM_DASH, num: null },
      ],
    },
    {
      title: 'Cupo',
      titleEn: 'Slot',
      rows: [
        { label: 'Cajas por cupo', labelEn: 'Packages per slot', value: fmtInt(perSlot.packages), num: perSlot.packages },
        { label: 'Empaques por cupo', labelEn: 'Packets per slot', value: fmtInt(perSlot.packets), num: perSlot.packets },
        { label: `Unidades por cupo (${unitName})`, labelEn: `Units per slot (${unitName})`, value: fmtInt(perSlot.units), num: perSlot.units },
        { label: 'Peso por cupo', labelEn: 'Weight per slot', value: kg(perSlot.kg), num: perSlot.kg, unit: 'kg' },
        { label: 'Volumen por cupo', labelEn: 'Volume per slot', value: cbm(slotCbm), num: slotCbm, unit: 'm³' },
      ],
    },
    {
      title: 'Empaque',
      titleEn: 'Packaging',
      rows: [
        { label: 'Tipo de empaque', labelEn: 'Package kind', value: packing.packageKind || EM_DASH, num: null },
        { label: `Unidades por caja (${unitName})`, labelEn: `Units per package (${unitName})`, value: fmtInt(packing.unitsPerPackage), num: packing.unitsPerPackage },
        { label: 'Empaques por caja', labelEn: 'Packets per package', value: fmtInt(packing.packetsPerPackage), num: packing.packetsPerPackage },
        { label: 'Volumen por caja', labelEn: 'Package volume', value: cbm(packing.packageCbm), num: packing.packageCbm, unit: 'm³' },
        { label: 'Peso por caja', labelEn: 'Package weight', value: kg(packing.packageKg), num: packing.packageKg, unit: 'kg' },
        // GTIN is an identifier code (leading zeros / check digit matter) — exhibited as text, never a number.
        { label: 'GTIN', labelEn: 'GTIN', value: packing.gtin || EM_DASH, num: null },
      ],
    },
    {
      title: 'Aduana',
      titleEn: 'Customs',
      rows: [
        // HS partida is a dotted customs code — text, not a number.
        { label: 'Partida arancelaria (HS)', labelEn: 'HS code', value: product?.hsCode || EM_DASH, num: null },
        {
          label: 'MOQ',
          labelEn: 'MOQ',
          value: product?.moq != null ? `${fmtInt(product.moq)} ${product.moqUnit ?? unitName}` : EM_DASH,
          num: product?.moq ?? null,
        },
        {
          label: 'CBM por unidad',
          labelEn: 'CBM per unit',
          value: product?.cbmPerUnit != null ? cbm(product.cbmPerUnit) : EM_DASH,
          num: product?.cbmPerUnit ?? null,
          unit: 'm³',
        },
      ],
    },
  ]

  const requested = facts.requestedSlots ?? 0
  if (requested > 0) {
    const alloc = cascadeForSlots(template, requested)
    const allocCbm = alloc.packages * packing.packageCbm
    sections.push({
      title: 'Asignación',
      titleEn: 'Allocation',
      rows: [
        { label: 'Cupos asignados', labelEn: 'Slots allocated', value: fmtInt(alloc.slots), num: alloc.slots },
        { label: 'Cajas', labelEn: 'Packages', value: fmtInt(alloc.packages), num: alloc.packages },
        { label: 'Empaques', labelEn: 'Packets', value: fmtInt(alloc.packets), num: alloc.packets },
        { label: `Unidades (${unitName})`, labelEn: `Units (${unitName})`, value: fmtInt(alloc.units), num: alloc.units },
        { label: 'Peso total', labelEn: 'Total weight', value: kg(alloc.kg), num: alloc.kg, unit: 'kg' },
        { label: 'Volumen total', labelEn: 'Total volume', value: cbm(allocCbm), num: allocCbm, unit: 'm³' },
      ],
    })
  }

  return sections
}
