'use server'

// src/lib/actions/rb-quotation.ts
// Represented-brand CONTAINER quote — the TOWER read-side that assembles an
// RbContainerQuoteDocument (the ALLOCATION archetype, root CLAUDE.md §5-bis: sold
// container-only / by slot, never by unit). NO new migration: it reads the SHIPPED
// RB tables (rb_containers + rb_container_templates + rb_packing_profiles +
// rb_slot_allocations + rb_products/tower_26) exactly as container-promo.ts does,
// and reuses the shipped company / RUC / tax / money layer for pricing.
//
// Mutation law even for a read (like ficha.ts / proforma.ts): auth → Zod parse →
// RLS-scoped query. RLS on the tower RB tables is the ONLY permission boundary;
// this file never gates with `if (role === …)`. The buyer negotiates in slots;
// a requested quantity is CONVERTED to slots HERE on the server (slotsForQuantity)
// — display math never overrides it (§5-bis.4). Money is integer minor units +
// a currency code; the per-slot price arrives as a Zod-validated input (there is
// no persisted RB slot price and no migration is in scope), and totals come from
// the shared computeQuotationTotals. An un-priced request renders a wholesale RFQ
// posture ("por cotizar"), never a retail listing.
import { z } from 'zod'
import { createServerSupabase } from '@/lib/supabase/server'
import { fail, ok, type ActionResult } from './result'
import { computeSlotBreakdown, routeLabelOf } from './container-promo-logic'
import { WINGS_ISSUER } from '@/lib/quotation/company'
import { withDefaultTerms } from '@/lib/quotation/document'
import {
  buildRbSlotLine,
  computeRbContainerTotals,
  formatRbQuoteNo,
  rbQuoteSeqFromCode,
  DEFAULT_RB_OBSERVATIONS,
  DEFAULT_RB_TAX_BPS,
  DEFAULT_RB_TAX_LABEL,
  DEFAULT_RB_TERMS,
  type BillTo,
  type RbContainerQuoteDocument,
  type RbPackingExhibit,
  type RbSlotLine,
  type RbSpecRow,
} from '@/lib/quotation/rb-container'
import {
  buildTechSheetSections,
  cascadeForSlots,
  packingSpecFromGeometry,
  slotsForQuantity,
  SHIPPING_PHASE_LABELS,
  type RbContainerTemplate,
  type RbPackingDiagramSpec,
  type ShippingPhase,
  type TechSheetFacts,
} from '@wings/rb-core'
import type { SupabaseClient } from '@supabase/supabase-js'

// ── Input (parsed from the route's search params) ────────────────────────────
// z.coerce so a query-string value ("3") is accepted; every field is optional so
// the document always renders (un-priced when no price is supplied).
const rbQuoteInputSchema = z
  .object({
    slots: z.coerce.number().int().min(1).max(10_000).optional(),
    quantity: z.coerce.number().int().min(1).max(10_000_000).optional(),
    level: z.enum(['units', 'packets', 'packages']).optional(),
    pricePerSlotMinor: z.coerce.number().int().min(0).max(1_000_000_000).optional(),
    currency: z
      .string()
      .trim()
      .regex(/^[A-Za-z]{3}$/)
      .transform((s) => s.toUpperCase())
      .optional(),
    taxBps: z.coerce.number().int().min(0).max(10_000).optional(),
    taxLabel: z.string().trim().max(24).optional(),
    validityDays: z.coerce.number().int().min(1).max(365).optional(),
    buyerCompany: z.string().trim().max(120).optional(),
    buyerTaxId: z.string().trim().max(20).optional(),
    buyerAttention: z.string().trim().max(120).optional(),
    buyerContact: z.string().trim().max(160).optional(),
  })
  .strip()
export type RbQuoteInput = z.input<typeof rbQuoteInputSchema>

const codeSchema = z
  .string()
  .trim()
  .regex(/^[A-Za-z0-9._-]{1,64}$/)
const slugSchema = z
  .string()
  .trim()
  .regex(/^[a-z0-9-]{1,64}$/)

async function requireUser() {
  const supabase = await createServerSupabase()
  if (!supabase) return { ok: false as const, error: fail('UNAUTHORIZED', 'Auth no configurado / Auth not configured') }
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false as const, error: fail('UNAUTHORIZED', 'Sesión requerida / Session required') }
  return { ok: true as const, supabase: supabase.schema('tower'), user }
}

type TowerClient = ReturnType<SupabaseClient['schema']>

// ── Persisted shapes (RLS-scoped reads; mirror container-promo.ts) ───────────
interface ContainerJoinRow {
  id: string
  code: string
  status: string
  route: { origin?: string; destination?: string } | null
  shipping_phase: ShippingPhase
  represented_brand_id: string
  template: {
    ref: string
    kind: string
    total_slots: number
    packages_per_slot: number
    composition: Array<{ profile_slug: string }>
  } | null
  brand: { slug: string; name: string; status: string } | null
}

const CONTAINER_SELECT = `
  id, code, status, route, shipping_phase, represented_brand_id,
  template:rb_container_templates!template_id ( ref, kind, total_slots, packages_per_slot, composition ),
  brand:represented_brands!represented_brand_id ( slug, name, status )
`

interface PackingRow {
  product_name: string
  package_kind: string | null
  packets_per_package: number
  units_per_package: number
  unit_name_plural: string | null
  package_cbm: number | string
  package_kg: number | string
  gtin: string | null
}

interface ProductRow {
  id: string
  name: unknown
  hs_code: string | null
  moq: number | string | null
  cbm_per_unit: number | string | null
  specs: unknown
}

/**
 * Extract the ALLOCATION fiche rows from a product's `specs` jsonb (specs.specRows,
 * spec_schemas v2 · tower_44). Defensive: display-only, never trusts shape — a
 * malformed row is dropped, an empty label+value is skipped. Presentation only;
 * no slot/packing math lives here (§5-bis.4).
 */
function specRowsFrom(specs: unknown): RbSpecRow[] {
  if (typeof specs !== 'object' || specs === null) return []
  const raw = (specs as Record<string, unknown>).specRows
  if (!Array.isArray(raw)) return []
  const rows: RbSpecRow[] = []
  for (const item of raw) {
    if (typeof item !== 'object' || item === null) continue
    const rec = item as Record<string, unknown>
    const label = typeof rec.label === 'string' ? rec.label : ''
    const value = typeof rec.value === 'string' ? rec.value : ''
    if (label === '' && value === '') continue
    const icon = typeof rec.icon === 'string' ? rec.icon : undefined
    rows.push(icon ? { label, value, icon } : { label, value })
  }
  return rows
}

// Bounded diagram geometry (rb_diagram_specs, tower_45 — read only).
interface DiagramRow {
  package_length_mm: number
  package_width_mm: number
  package_height_mm: number
  units_per_package: number
  packages_per_slot: number
  cells_across: number
  cells_high: number
  cells_deep: number
  detail: string
  caption: string | null
}

function numOrNull(v: number | string | null | undefined): number | null {
  if (v === null || v === undefined || v === '') return null
  const n = typeof v === 'string' ? Number(v) : v
  return Number.isFinite(n) ? n : null
}

function localized(v: unknown, locale: 'es' | 'en'): string | null {
  if (typeof v === 'string') return v
  if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
    const rec = v as Record<string, unknown>
    const val = rec[locale] ?? rec.es ?? rec.en
    return typeof val === 'string' ? val : null
  }
  return null
}

/** RLS-scoped slot breakdown for the container (same rule as tower.rb_slots_taken). */
async function breakdownFor(supabase: TowerClient, containerId: string) {
  const { data } = await supabase
    .from('rb_slot_allocations')
    .select('slots,status,expires_at')
    .eq('rb_container_id', containerId)
  return computeSlotBreakdown((data ?? []) as never[])
}

async function packingFor(supabase: TowerClient, slug: string): Promise<PackingRow | null> {
  const { data } = await supabase
    .from('rb_packing_profiles')
    .select('product_name,package_kind,packets_per_package,units_per_package,unit_name_plural,package_cbm,package_kg,gtin')
    .eq('product_slug', slug)
    .maybeSingle()
  return (data as PackingRow | null) ?? null
}

/** rb_products (tower_26) row for the container's product — optional customs/name
 *  data + the id used to key the diagram geometry. */
async function productFor(supabase: TowerClient, brandId: string, slug: string): Promise<ProductRow | null> {
  const { data } = await supabase
    .from('rb_products')
    .select('id,name,hs_code,moq,cbm_per_unit,specs')
    .eq('represented_brand_id', brandId)
    .eq('slug', slug)
    .maybeSingle()
  return (data as ProductRow | null) ?? null
}

/** Bounded diagram geometry for the product, mapped to the shared PackingDiagram
 *  spec (rb_diagram_specs, tower_45 · R1). RLS-scoped read; null when the product
 *  has no authored geometry — the tech sheet then stays spec-led. */
async function diagramFor(supabase: TowerClient, rbProductId: string, title: string): Promise<RbPackingDiagramSpec | null> {
  const { data } = await supabase
    .from('rb_diagram_specs')
    .select(
      'package_length_mm,package_width_mm,package_height_mm,units_per_package,packages_per_slot,cells_across,cells_high,cells_deep,detail,caption',
    )
    .eq('rb_product_id', rbProductId)
    .maybeSingle()
  if (!data) return null
  const g = data as DiagramRow
  return packingSpecFromGeometry(
    {
      packageLengthMm: g.package_length_mm,
      packageWidthMm: g.package_width_mm,
      packageHeightMm: g.package_height_mm,
      unitsPerPackage: g.units_per_package,
      packagesPerSlot: g.packages_per_slot,
      cellsAcross: g.cells_across,
      cellsHigh: g.cells_high,
      cellsDeep: g.cells_deep,
      detail: g.detail === 'rolls' ? 'rolls' : 'slabs',
      caption: g.caption,
    },
    title,
  )
}

function billToFrom(input: z.infer<typeof rbQuoteInputSchema>): BillTo {
  return {
    company: input.buyerCompany ?? '',
    taxId: input.buyerTaxId ?? null,
    attention: input.buyerAttention ?? null,
    contact: input.buyerContact ?? null,
  }
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

/**
 * Assemble the RB container quote document for a brand's container (RLS-scoped).
 * `code` identifies the container; `brandSlug` is verified against the joined
 * brand so the URL can't point one brand's slug at another's container.
 */
export async function getRbContainerQuoteByCode(
  brandSlug: string,
  code: string,
  input?: RbQuoteInput,
): Promise<ActionResult<RbContainerQuoteDocument>> {
  const parsedSlug = slugSchema.safeParse(brandSlug)
  if (!parsedSlug.success) return fail('VALIDATION', 'Marca inválida / Invalid brand')
  const parsedCode = codeSchema.safeParse(code)
  if (!parsedCode.success) return fail('VALIDATION', 'Código inválido / Invalid code')
  const parsedInput = rbQuoteInputSchema.safeParse(input ?? {})
  if (!parsedInput.success) {
    return fail('VALIDATION', 'Parámetros inválidos / Invalid parameters', parsedInput.error.flatten().fieldErrors as Record<string, string[]>)
  }
  const args = parsedInput.data

  const auth = await requireUser()
  if (!auth.ok) return auth.error

  const { data, error } = await auth.supabase
    .from('rb_containers')
    .select(CONTAINER_SELECT)
    .eq('code', parsedCode.data)
    .maybeSingle()
  if (error || !data) return fail('FORBIDDEN_LANE', 'Contenedor no encontrado / Container not found')
  const row = data as unknown as ContainerJoinRow

  if (!row.brand || row.brand.slug !== parsedSlug.data) {
    return fail('FORBIDDEN_LANE', 'Contenedor no encontrado / Container not found')
  }
  if (!row.template) return fail('FORBIDDEN_LANE', 'Plantilla de contenedor no disponible / Container template unavailable')

  const profileSlug = row.template.composition?.[0]?.profile_slug
  const packing = profileSlug ? await packingFor(auth.supabase, profileSlug) : null
  if (!packing) return fail('FORBIDDEN_LANE', 'Perfil de empaque no disponible / Packing profile unavailable')
  const product = profileSlug ? await productFor(auth.supabase, row.represented_brand_id, profileSlug) : null
  const breakdown = await breakdownFor(auth.supabase, row.id)

  const total = row.template.total_slots
  const available = Math.max(0, total - breakdown.taken)

  // Packing template for the ALLOCATION cascade (server-side slot conversion).
  const template: RbContainerTemplate = {
    packagesPerSlot: row.template.packages_per_slot,
    packetsPerPackage: packing.packets_per_package,
    unitsPerPackage: packing.units_per_package,
    packageKg: Number(packing.package_kg),
  }

  // Resolve the negotiated slots: a requested quantity is converted to slots on
  // the server (Costco honesty — the remainder is exhibited, never hidden).
  let slots: number
  let remainderUnits = 0
  if (args.quantity != null && args.level) {
    const conv = slotsForQuantity(template, args.quantity, args.level)
    slots = conv.slots
    remainderUnits = conv.remainderUnits
  } else {
    slots = args.slots ?? 1
  }
  const cascade = cascadeForSlots(template, slots)
  const packingExhibit: RbPackingExhibit = { ...cascade, remainderUnits }

  const productEs = localized(product?.name, 'es') ?? packing.product_name
  const productEn = localized(product?.name, 'en') ?? packing.product_name

  // Diagram geometry (rb_diagram_specs, tower_45 · R1) — read only when the
  // product row resolved; the tech sheet draws the master package when present.
  const diagram = product?.id ? await diagramFor(auth.supabase, product.id, productEs) : null

  const line: RbSlotLine = buildRbSlotLine({
    index: 0,
    productEs,
    productEn,
    slots,
    unitLabel: 'cupos',
    pricePerSlotMinor: args.pricePerSlotMinor ?? null,
  })
  const lines = [line]

  const currency = args.currency ?? 'USD'
  const taxLabel = args.taxLabel ?? DEFAULT_RB_TAX_LABEL
  const taxBps = args.taxBps ?? DEFAULT_RB_TAX_BPS
  const totals = computeRbContainerTotals(lines, taxLabel, taxBps, currency)

  const phaseLabel = SHIPPING_PHASE_LABELS[row.shipping_phase] ?? null
  const routeLabel = routeLabelOf(row.route) ?? null

  const facts: TechSheetFacts = {
    container: {
      kind: row.template.kind,
      ref: row.template.ref,
      totalSlots: total,
      packagesPerSlot: row.template.packages_per_slot,
      routeLabel,
      phaseLabel,
    },
    packing: {
      packageKind: packing.package_kind,
      unitsPerPackage: packing.units_per_package,
      packetsPerPackage: packing.packets_per_package,
      packageCbm: Number(packing.package_cbm),
      packageKg: Number(packing.package_kg),
      unitNamePlural: packing.unit_name_plural,
      gtin: packing.gtin,
    },
    product: {
      hsCode: product?.hs_code ?? null,
      moq: numOrNull(product?.moq),
      moqUnit: 'cupos',
      cbmPerUnit: numOrNull(product?.cbm_per_unit),
    },
    requestedSlots: slots,
  }

  const validityLabel = args.validityDays != null ? `${args.validityDays} días` : null

  const doc: RbContainerQuoteDocument = {
    quoteRef: formatRbQuoteNo(new Date().getFullYear(), rbQuoteSeqFromCode(row.code)),
    status: row.status,
    currency,
    priced: totals != null,
    issuedOn: todayIso(),
    issuedCity: 'Lima',
    validityLabel: validityLabel ?? DEFAULT_RB_TERMS.validityText ?? null,
    incoterm: DEFAULT_RB_TERMS.incoterm ?? null,
    brandName: row.brand.name,
    brandSlug: row.brand.slug,
    productName: productEs,
    containerCode: row.code,
    containerKind: row.template.kind,
    routeLabel,
    phaseLabel,
    slotsTotal: total,
    slotsAvailable: available,
    billTo: billToFrom(args),
    lines,
    packing: packingExhibit,
    totals,
    techSheet: buildTechSheetSections(facts),
    specRows: specRowsFrom(product?.specs),
    diagram,
    terms: withDefaultTerms(DEFAULT_RB_TERMS),
    observations: DEFAULT_RB_OBSERVATIONS,
    issuer: WINGS_ISSUER,
  }

  return ok(doc)
}
