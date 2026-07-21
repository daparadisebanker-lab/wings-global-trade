// src/lib/rb/data.ts
// Server-side loaders for the Represented Brands public contract:
// public.rb_public_brands / rb_public_templates / rb_public_containers
// (views over the tower schema — the ONLY surfaces the site reads) plus the
// public.rb_reserve RPC wrapper. Service role only; never import client-side.
//
// When Supabase is unconfigured (dev without env), everything falls back to
// the SPEC §6 fixtures so the shelf still renders — same policy as insertLead.

import { createServiceClient } from '@/lib/supabase/server'
import {
  ALADIN_CONTAINERS,
  ALADIN_PRODUCTS,
  ALADIN_TEMPLATE_40HC,
  type RbContainerTemplate,
  type RbProduct,
  type RbPublicContainer,
} from '@/lib/rb/fixtures'
import type { SpecIconId } from '@/components/features/brands/SpecIcons'
import type { PackingSpec, PalletSpec } from '@wings/trade-ui'

const KIND_LABELS: Record<string, string> = {
  '20GP': "20' Standard · 33 m³",
  '40GP': "40' Standard · 67 m³",
  '40HC': "40' High Cube · 76 m³",
  REEFER: "40' Reefer",
}

interface TemplateRow {
  ref: string
  kind: string
  total_slots: number
  packages_per_slot: number
  packets_per_package: number
  units_per_package: number
  unit_name_plural: string
  package_kg: number | string
  max_packages: number
  governing_bound: string
  brand_slug: string
}

interface ContainerRow {
  id: string
  code: string
  route: { origin?: string; destination?: string } | null
  closes_at: string | null
  template_ref: string
  brand_slug: string
  total_slots: number
  committed_slots: number
  reserved_slots: number
}

function mapTemplate(row: TemplateRow): RbContainerTemplate {
  return {
    ref: row.ref,
    kind: row.kind as RbContainerTemplate['kind'],
    kindLabel: KIND_LABELS[row.kind] ?? row.kind,
    productSlug: '',
    totalPackages: row.max_packages,
    totalSlots: row.total_slots,
    packagesPerSlot: row.packages_per_slot,
    packetsPerPackage: row.packets_per_package,
    unitsPerPackage: row.units_per_package,
    unitNamePlural: row.unit_name_plural,
    packageKg: Number(row.package_kg),
    governingBound: row.governing_bound as RbContainerTemplate['governingBound'],
  }
}

function mapContainer(row: ContainerRow): RbPublicContainer {
  return {
    id: row.id,
    code: row.code,
    templateRef: row.template_ref,
    route: { origin: row.route?.origin ?? '—', destination: row.route?.destination ?? 'Callao' },
    closesAt: row.closes_at ?? '',
    slots: {
      total: row.total_slots,
      committed: row.committed_slots,
      reserved: row.reserved_slots,
    },
  }
}

export async function getRbTemplateForBrand(brandSlug: string): Promise<RbContainerTemplate | null> {
  const supabase = createServiceClient()
  if (!supabase) return brandSlug === 'aladin' ? ALADIN_TEMPLATE_40HC : null
  const { data, error } = await supabase
    .from('rb_public_templates')
    .select('*')
    .eq('brand_slug', brandSlug)
    .limit(1)
    .maybeSingle()
  if (error) throw new Error(`rb_public_templates read failed: ${error.message}`)
  return data ? mapTemplate(data as TemplateRow) : null
}

export async function getRbTemplateByRef(ref: string): Promise<RbContainerTemplate | null> {
  const supabase = createServiceClient()
  if (!supabase) return ref === ALADIN_TEMPLATE_40HC.ref ? ALADIN_TEMPLATE_40HC : null
  const { data, error } = await supabase
    .from('rb_public_templates')
    .select('*')
    .eq('ref', ref)
    .maybeSingle()
  if (error) throw new Error(`rb_public_templates read failed: ${error.message}`)
  return data ? mapTemplate(data as TemplateRow) : null
}

export async function getRbContainers(brandSlug: string): Promise<RbPublicContainer[]> {
  const supabase = createServiceClient()
  if (!supabase) return brandSlug === 'aladin' ? ALADIN_CONTAINERS : []
  const { data, error } = await supabase
    .from('rb_public_containers')
    .select('*')
    .eq('brand_slug', brandSlug)
    .order('closes_at', { ascending: true })
  if (error) throw new Error(`rb_public_containers read failed: ${error.message}`)
  return ((data ?? []) as ContainerRow[]).map(mapContainer)
}

export async function getRbContainerById(id: string): Promise<RbPublicContainer | null> {
  const supabase = createServiceClient()
  if (!supabase) return ALADIN_CONTAINERS.find((c) => c.id === id) ?? null
  const { data, error } = await supabase
    .from('rb_public_containers')
    .select('*')
    .eq('id', id)
    .maybeSingle()
  if (error) throw new Error(`rb_public_containers read failed: ${error.message}`)
  return data ? mapContainer(data as ContainerRow) : null
}

export interface RbReserveResult {
  ok: boolean
  allocationId?: string
  reason?: 'insufficient' | 'closed' | 'not_found'
}

/** Atomic slot reservation through public.rb_reserve (row-locked in tower).
 *  Dev fallback: no DB → pretend-success so the flow remains drivable. */
export async function reserveRbSlots(params: {
  containerId: string
  slots: number
  leadId: string
  quantityUnits: number
}): Promise<RbReserveResult> {
  const supabase = createServiceClient()
  if (!supabase) {
    console.info('[rb] (dev — no Supabase) allocation would be inserted:', params)
    return { ok: true, allocationId: crypto.randomUUID() }
  }
  const { data, error } = await supabase.rpc('rb_reserve', {
    p_container: params.containerId,
    p_slots: params.slots,
    p_lead: params.leadId,
    p_quantity_units: params.quantityUnits,
  })
  if (error) {
    if (error.message.includes('RB_INSUFFICIENT_SLOTS')) return { ok: false, reason: 'insufficient' }
    if (error.message.includes('RB_CONTAINER_CLOSED')) return { ok: false, reason: 'closed' }
    if (error.message.includes('RB_CONTAINER_NOT_FOUND')) return { ok: false, reason: 'not_found' }
    throw new Error(`rb_reserve failed: ${error.message}`)
  }
  return { ok: true, allocationId: data as string }
}

// ── Brand identity loader (RB Console Wave 1b — the declared-but-unwired view) ──
// Reads the widened public.rb_public_brands (tower_25): the --rb-* token contract
// + logo + public-safe mandate for LIVE console brands. Additive — Áladín's rich
// fixture shelf is unchanged; this exposes the identity a console-created brand
// carries. (Next seam step: the brand layout injects these --rb-* tokens with a
// fixture fallback — a rendering-strategy change to verify against a LIVE brand.)
export interface RbLiveBrand {
  code: string
  slug: string
  name: string
  categories: string[]
  tokens: Record<string, string>
  logo: { isologo?: string; positivo?: string; isotipo?: string; sello?: string }
  territory: string | null
  mandateScope: string[]
}

interface RbPublicBrandRow {
  code: string
  slug: string
  name: string
  categories: string[] | null
  identity: { tokens?: Record<string, string>; logo?: Record<string, string> } | null
  mandate_public: { territory?: string; scope?: string[] } | null
}

function mapLiveBrand(r: RbPublicBrandRow): RbLiveBrand {
  return {
    code: r.code,
    slug: r.slug,
    name: r.name,
    categories: r.categories ?? [],
    tokens: r.identity?.tokens ?? {},
    logo: r.identity?.logo ?? {},
    territory: r.mandate_public?.territory ?? null,
    mandateScope: Array.isArray(r.mandate_public?.scope) ? (r.mandate_public!.scope as string[]) : [],
  }
}

/** All LIVE console brands (the view filters status='LIVE'). Empty when
 *  Supabase is unconfigured or no console brand is live yet — callers keep their
 *  fixture path. */
export async function getRbLiveBrands(): Promise<RbLiveBrand[]> {
  const supabase = createServiceClient()
  if (!supabase) return []
  const { data, error } = await supabase
    .from('rb_public_brands')
    .select('code,slug,name,categories,identity,mandate_public')
  if (error || !data) return []
  return (data as unknown as RbPublicBrandRow[]).map(mapLiveBrand)
}

// ── Active (promoted) container — the public marketing surface (tower_33) ─────
// Reads public.rb_active_containers: one row per PROMOTED, still-open container
// of a LIVE brand, with product + live slot state + the rep-authored promo copy.
// Dev fallback (no Supabase): synthesize Áladín's flagship container from the
// fixtures so the page renders.
export interface RbPromoCopy {
  headline?: string
  priceNote?: string
  routeLabel?: string
  unitLabel?: string
  specs?: { label: string; value: string }[]
}

export interface RbActiveContainer {
  id: string
  code: string
  brandSlug: string
  brandName: string
  productName: string
  unitNamePlural: string
  route: { origin?: string; destination?: string }
  closesAt: string | null
  containerKind: string
  /** Shipping phase from the container spec. */
  shippingPhase: 'EN_ORIGEN' | 'EN_TRANSITO' | 'ARRIBADO' | 'NACIONALIZADO'
  slots: { total: number; committed: number; reserved: number; taken: number; available: number }
  productFacts: {
    packetsPerPackage?: number
    unitsPerPackage?: number
    unitNamePlural?: string
    packageKg?: number
    packageCbm?: number
    gtin?: string | null
    packagesPerSlot?: number
  }
  copy: RbPromoCopy
  /** Brand accent (hex) — the container-fill colour for the share card. Absent
   *  when the brand's identity carries no accent; rb-core falls back to gold. */
  accent?: string
}

interface ActiveContainerRow {
  id: string
  code: string
  brand_slug: string
  brand_name: string
  route: { origin?: string; destination?: string } | null
  closes_at: string | null
  container_kind: string
  shipping_phase: 'EN_ORIGEN' | 'EN_TRANSITO' | 'ARRIBADO' | 'NACIONALIZADO'
  total_slots: number
  taken_slots: number
  available_slots: number
  committed_slots: number
  reserved_slots: number
  product_name: string
  unit_name_plural: string
  product_facts: Record<string, unknown> | null
  promo_copy: RbPromoCopy | null
  accent: string | null
}

function mapActiveContainer(r: ActiveContainerRow): RbActiveContainer {
  const f = (r.product_facts ?? {}) as Record<string, unknown>
  const num = (v: unknown) => (v == null ? undefined : Number(v))
  return {
    id: r.id,
    code: r.code,
    brandSlug: r.brand_slug,
    brandName: r.brand_name,
    productName: r.product_name,
    unitNamePlural: r.unit_name_plural,
    route: { origin: r.route?.origin ?? '—', destination: r.route?.destination ?? 'Callao' },
    closesAt: r.closes_at,
    containerKind: r.container_kind,
    shippingPhase: r.shipping_phase ?? 'EN_ORIGEN',
    slots: {
      total: r.total_slots,
      committed: r.committed_slots,
      reserved: r.reserved_slots,
      taken: r.taken_slots,
      available: r.available_slots,
    },
    productFacts: {
      packetsPerPackage: num(f.packetsPerPackage),
      unitsPerPackage: num(f.unitsPerPackage),
      unitNamePlural: (f.unitNamePlural as string) ?? r.unit_name_plural,
      packageKg: num(f.packageKg),
      packageCbm: num(f.packageCbm),
      gtin: (f.gtin as string) ?? null,
      packagesPerSlot: num(f.packagesPerSlot),
    },
    copy: (r.promo_copy ?? {}) as RbPromoCopy,
    accent: r.accent ?? undefined,
  }
}

function aladinActiveFixture(code: string): RbActiveContainer {
  const c = ALADIN_CONTAINERS[0]
  const t = ALADIN_TEMPLATE_40HC
  const taken = c.slots.committed + c.slots.reserved
  return {
    id: c.id,
    code: code || 'RB01-40HC-001',
    brandSlug: 'aladin',
    brandName: 'Áladín',
    productName: 'Papel higiénico de bambú',
    unitNamePlural: t.unitNamePlural,
    route: c.route,
    closesAt: c.closesAt,
    containerKind: t.kind,
    shippingPhase: 'EN_TRANSITO',
    slots: {
      total: c.slots.total,
      committed: c.slots.committed,
      reserved: c.slots.reserved,
      taken,
      available: Math.max(0, c.slots.total - taken),
    },
    productFacts: {
      packetsPerPackage: t.packetsPerPackage,
      unitsPerPackage: t.unitsPerPackage,
      unitNamePlural: t.unitNamePlural,
      packageKg: t.packageKg,
      packagesPerSlot: t.packagesPerSlot,
    },
    copy: {},
    // Áladín's principal green (--rb-accent), so the dev fallback card carries
    // the brand accent exactly as the LIVE read path now does.
    accent: '#5e8a16',
  }
}

export async function getActiveContainer(brandSlug: string, code: string): Promise<RbActiveContainer | null> {
  const supabase = createServiceClient()
  if (!supabase) return brandSlug === 'aladin' ? aladinActiveFixture(code) : null
  const { data, error } = await supabase
    .from('rb_active_containers')
    .select('*')
    .eq('brand_slug', brandSlug)
    .eq('code', code)
    .maybeSingle()
  if (error) throw new Error(`rb_active_containers read failed: ${error.message}`)
  return data ? mapActiveContainer(data as ActiveContainerRow) : null
}

export async function getRbLiveBrandBySlug(slug: string): Promise<RbLiveBrand | null> {
  const supabase = createServiceClient()
  if (!supabase) return null
  const { data } = await supabase
    .from('rb_public_brands')
    .select('code,slug,name,categories,identity,mandate_public')
    .eq('slug', slug)
    .maybeSingle()
  return data ? mapLiveBrand(data as unknown as RbPublicBrandRow) : null
}

// ── Brand product shelf — LIVE read model (RB Console Wave 2 tail) ─────────────
// The site's product fiche reads public.rb_public_products (tower_26): PUBLISHED
// products of LIVE brands, joined to their GTIN from rb_packing_profiles. The view
// carries fiche PRESENTATION only (spec.unitLabel/description/highlights) + the
// column-home numbers (hs_code, moq, cbm_per_unit, gtin) — diagram geometry is not
// modelled until rb_diagram_specs (Wave 4), so live rows render spec-led while
// fixtures keep their rich technical drawings. Read model only (Directive 5): the
// site never writes. Graceful fallback: no Supabase, a read error, or zero live
// rows → the SPEC §6 fixtures, so Áladín keeps rendering.

export interface RbShelfSpecRow {
  label: string
  value: string
  icon: SpecIconId
}

export interface RbShelfProduct {
  slug: string
  name: string
  unitLabel: string
  descriptionEs: string
  highlights: string[]
  specs: RbShelfSpecRow[]
  /** Full technical drawings — only fixture-sourced products carry them; live
   *  rows render spec-led until rb_diagram_specs ships. */
  diagrams: {
    packing: PackingSpec
    explodeAxis: 'y' | 'z'
    explodeCaption: string
    pallet: PalletSpec
  } | null
}

interface RbPublicProductRow {
  id: string
  slug: string
  name: { es?: string; en?: string } | null
  category_path: string[] | null
  specs: { unitLabel?: unknown; description?: unknown; highlights?: unknown } | null
  hs_code: string | null
  moq: number | string | null
  cbm_per_unit: number | string | null
  brand_slug: string
  gtin: string | null
}

/** Pick a display string from a localised value ({es,en}) or a plain string. */
function loc(v: unknown): string {
  if (v == null) return ''
  if (typeof v === 'string') return v
  if (typeof v === 'object') {
    const o = v as { es?: string; en?: string }
    return o.es || o.en || ''
  }
  return ''
}

function numOrNull(v: number | string | null): number | null {
  if (v == null) return null
  const n = typeof v === 'string' ? Number(v) : v
  return Number.isFinite(n) ? n : null
}

function fixtureToShelf(p: RbProduct): RbShelfProduct {
  return {
    slug: p.slug,
    name: p.name,
    unitLabel: p.unitLabel,
    descriptionEs: p.descriptionEs,
    highlights: p.highlights,
    specs: p.specs,
    diagrams: { packing: p.packing, explodeAxis: p.explodeAxis, explodeCaption: p.explodeCaption, pallet: p.pallet },
  }
}

function liveToShelf(row: RbPublicProductRow): RbShelfProduct {
  const specs = row.specs ?? {}
  const unitLabel = loc(specs.unitLabel)
  const highlights = Array.isArray(specs.highlights)
    ? (specs.highlights as unknown[]).filter((h): h is string => typeof h === 'string')
    : []

  const rows: RbShelfSpecRow[] = []
  if (unitLabel) rows.push({ label: 'Presentación', value: unitLabel, icon: 'package' })
  const category = (row.category_path ?? []).join(' · ')
  if (category) rows.push({ label: 'Categoría', value: category, icon: 'box' })
  if (row.gtin) rows.push({ label: 'GTIN', value: row.gtin, icon: 'barcode' })
  if (row.hs_code) rows.push({ label: 'HS Code', value: row.hs_code, icon: 'seal' })
  const moq = numOrNull(row.moq)
  if (moq != null) rows.push({ label: 'MOQ', value: String(moq), icon: 'box' })
  const cbm = numOrNull(row.cbm_per_unit)
  if (cbm != null) rows.push({ label: 'CBM / unidad', value: `${cbm} m³`, icon: 'ruler' })
  rows.push({ label: 'Origen', value: 'Importado', icon: 'ship' })

  return {
    slug: row.slug,
    name: loc(row.name) || row.slug,
    unitLabel,
    descriptionEs: loc(specs.description),
    highlights,
    specs: rows,
    diagrams: null,
  }
}

/** LIVE brand products (PUBLISHED × LIVE) for the public shelf, with a graceful
 *  fixture fallback so Áladín renders before any console-authored row goes live. */
export async function getRbProductsForBrand(brandSlug: string): Promise<RbShelfProduct[]> {
  const fallback = (): RbShelfProduct[] => (brandSlug === 'aladin' ? ALADIN_PRODUCTS.map(fixtureToShelf) : [])
  const supabase = createServiceClient()
  if (!supabase) return fallback()
  const { data, error } = await supabase
    .from('rb_public_products')
    .select('id,slug,name,category_path,specs,hs_code,moq,cbm_per_unit,brand_slug,gtin')
    .eq('brand_slug', brandSlug)
    .order('slug', { ascending: true })
  if (error) throw new Error(`rb_public_products read failed: ${error.message}`)
  const rows = (data ?? []) as unknown as RbPublicProductRow[]
  if (rows.length === 0) return fallback()
  return rows.map(liveToShelf)
}
