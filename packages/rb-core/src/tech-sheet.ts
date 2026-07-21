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
  value: string
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

  const sections: TechSheetSection[] = [
    {
      title: 'Contenedor',
      titleEn: 'Container',
      rows: [
        { label: 'Clase', labelEn: 'Class', value: container.kind || EM_DASH },
        { label: 'Referencia', labelEn: 'Reference', value: container.ref || EM_DASH },
        { label: 'Cupos totales', labelEn: 'Total slots', value: fmtInt(container.totalSlots) },
        { label: 'Cajas por cupo', labelEn: 'Packages per slot', value: fmtInt(container.packagesPerSlot) },
        { label: 'Cajas por contenedor', labelEn: 'Packages per container', value: fmtInt(full.packages) },
        { label: 'Volumen por contenedor', labelEn: 'Volume per container', value: cbm(full.packages * packing.packageCbm) },
        { label: 'Ruta', labelEn: 'Route', value: container.routeLabel || EM_DASH },
        { label: 'Fase de embarque', labelEn: 'Shipping phase', value: container.phaseLabel || EM_DASH },
      ],
    },
    {
      title: 'Cupo',
      titleEn: 'Slot',
      rows: [
        { label: 'Cajas por cupo', labelEn: 'Packages per slot', value: fmtInt(perSlot.packages) },
        { label: 'Empaques por cupo', labelEn: 'Packets per slot', value: fmtInt(perSlot.packets) },
        { label: `Unidades por cupo (${unitName})`, labelEn: `Units per slot (${unitName})`, value: fmtInt(perSlot.units) },
        { label: 'Peso por cupo', labelEn: 'Weight per slot', value: kg(perSlot.kg) },
        { label: 'Volumen por cupo', labelEn: 'Volume per slot', value: cbm(slotCbm) },
      ],
    },
    {
      title: 'Empaque',
      titleEn: 'Packaging',
      rows: [
        { label: 'Tipo de empaque', labelEn: 'Package kind', value: packing.packageKind || EM_DASH },
        { label: `Unidades por caja (${unitName})`, labelEn: `Units per package (${unitName})`, value: fmtInt(packing.unitsPerPackage) },
        { label: 'Empaques por caja', labelEn: 'Packets per package', value: fmtInt(packing.packetsPerPackage) },
        { label: 'Volumen por caja', labelEn: 'Package volume', value: cbm(packing.packageCbm) },
        { label: 'Peso por caja', labelEn: 'Package weight', value: kg(packing.packageKg) },
        { label: 'GTIN', labelEn: 'GTIN', value: packing.gtin || EM_DASH },
      ],
    },
    {
      title: 'Aduana',
      titleEn: 'Customs',
      rows: [
        { label: 'Partida arancelaria (HS)', labelEn: 'HS code', value: product?.hsCode || EM_DASH },
        {
          label: 'MOQ',
          labelEn: 'MOQ',
          value: product?.moq != null ? `${fmtInt(product.moq)} ${product.moqUnit ?? unitName}` : EM_DASH,
        },
        {
          label: 'CBM por unidad',
          labelEn: 'CBM per unit',
          value: product?.cbmPerUnit != null ? cbm(product.cbmPerUnit) : EM_DASH,
        },
      ],
    },
  ]

  const requested = facts.requestedSlots ?? 0
  if (requested > 0) {
    const alloc = cascadeForSlots(template, requested)
    sections.push({
      title: 'Asignación',
      titleEn: 'Allocation',
      rows: [
        { label: 'Cupos asignados', labelEn: 'Slots allocated', value: fmtInt(alloc.slots) },
        { label: 'Cajas', labelEn: 'Packages', value: fmtInt(alloc.packages) },
        { label: 'Empaques', labelEn: 'Packets', value: fmtInt(alloc.packets) },
        { label: `Unidades (${unitName})`, labelEn: `Units (${unitName})`, value: fmtInt(alloc.units) },
        { label: 'Peso total', labelEn: 'Total weight', value: kg(alloc.kg) },
        { label: 'Volumen total', labelEn: 'Total volume', value: cbm(alloc.packages * packing.packageCbm) },
      ],
    })
  }

  return sections
}
