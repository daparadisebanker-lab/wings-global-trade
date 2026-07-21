'use server'

// src/lib/actions/container-promo.ts
// Container promotion — the TOWER write-side over rb_containers.promo_* (tower_33).
// A rep who manages the brand (has_rb_role BRAND_MANAGER/BRAND_OPS, or a group
// admin) may ACTIVATE a container for marketing, author its share copy, and pull
// the derived ContainerPromo that feeds @wings/rb-core's copy + card builders.
// Mutation law: auth → Zod → RLS. rb_containers_upd (tower_25) is the gate; no
// role branching here. Reads run under the caller's RLS client, so a rep only
// ever sees their own brands' containers (group admins see all).
import { createServerSupabase } from '@/lib/supabase/server'
import { emitServerEvent } from '@/lib/ingest/emit'
import { fail, ok, type ActionResult } from './result'
import {
  promoCopySchema,
  computeSlotsTaken,
  computeSlotBreakdown,
  toContainerPromo,
  defaultSpecs,
  routeLabelOf,
  SHIPPING_PHASES,
  type PromoCopy,
  type ProductFacts,
} from './container-promo-logic'
import type { ContainerPromo, ContainerPromoSpec, ShippingPhase } from '@wings/rb-core'
import type { SupabaseClient } from '@supabase/supabase-js'
import { z } from 'zod'

const uuidSchema = z.string().uuid()

async function requireTower() {
  const supabase = await createServerSupabase()
  if (!supabase) return { ok: false as const, error: fail('UNAUTHORIZED', 'Auth no configurado / Auth not configured') }
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false as const, error: fail('UNAUTHORIZED', 'Sesión requerida / Session required') }
  return { ok: true as const, supabase: supabase.schema('tower'), user }
}

type TowerClient = ReturnType<SupabaseClient['schema']>

interface ContainerJoinRow {
  id: string
  code: string
  status: string
  route: { origin?: string; destination?: string } | null
  closes_at: string | null
  shipping_phase: ShippingPhase
  promo_active: boolean
  promo_copy: PromoCopy | null
  promo_activated_at: string | null
  represented_brand_id: string
  template: { ref: string; kind: string; total_slots: number; packages_per_slot: number; composition: Array<{ profile_slug: string }> } | null
  brand: { slug: string; name: string; status: string; identity: { tokens?: Record<string, string> } | null } | null
}

const CONTAINER_SELECT = `
  id, code, status, route, closes_at, shipping_phase, promo_active, promo_copy, promo_activated_at, represented_brand_id,
  template:rb_container_templates!template_id ( ref, kind, total_slots, packages_per_slot, composition ),
  brand:represented_brands!represented_brand_id ( slug, name, status, identity )
`

export interface PromotableContainerRow {
  id: string
  code: string
  status: string
  brandSlug: string
  brandName: string
  productName: string
  slotsTotal: number
  slotsAvailable: number
  promoActive: boolean
  promoActivatedAt: string | null
  closesAt: string | null
  /** Shipping phase + the route from the container spec. */
  phase: ShippingPhase
  routeLabel: string | null
}

export interface ContainerPromoDetail extends PromotableContainerRow {
  copy: PromoCopy
  route: { origin?: string; destination?: string } | null
  promo: ContainerPromo
  /** Specs derived from the packing profile — the client's fallback when the rep
   *  clears their custom specs (keeps the live preview correct without facts). */
  defaultSpecs: ContainerPromoSpec[]
}

/** Live slots taken for a container (RLS-scoped read of its allocations). */
async function slotsTakenFor(supabase: TowerClient, containerId: string): Promise<number> {
  const { data } = await supabase
    .from('rb_slot_allocations')
    .select('slots,status,expires_at')
    .eq('rb_container_id', containerId)
  return computeSlotsTaken((data ?? []) as never[])
}

/** Live vendido/reservado/taken breakdown for a container (RLS-scoped). */
async function slotBreakdownFor(supabase: TowerClient, containerId: string) {
  const { data } = await supabase
    .from('rb_slot_allocations')
    .select('slots,status,expires_at')
    .eq('rb_container_id', containerId)
  return computeSlotBreakdown((data ?? []) as never[])
}

/** Packing profile (product name + exhibited facts) for a container's product. */
async function factsFor(
  supabase: TowerClient,
  row: ContainerJoinRow,
): Promise<{ productName: string; facts: ProductFacts }> {
  const slug = row.template?.composition?.[0]?.profile_slug
  if (!slug) return { productName: row.code, facts: {} }
  const { data } = await supabase
    .from('rb_packing_profiles')
    .select('product_name,packets_per_package,units_per_package,unit_name_plural,package_kg,package_cbm,gtin')
    .eq('product_slug', slug)
    .maybeSingle()
  const p = data as
    | {
        product_name: string
        packets_per_package: number
        units_per_package: number
        unit_name_plural: string
        package_kg: number | string
        package_cbm: number | string
        gtin: string | null
      }
    | null
  if (!p) return { productName: row.code, facts: { packagesPerSlot: row.template?.packages_per_slot } }
  return {
    productName: p.product_name,
    facts: {
      packetsPerPackage: p.packets_per_package,
      unitsPerPackage: p.units_per_package,
      unitNamePlural: p.unit_name_plural,
      packageKg: p.package_kg,
      packageCbm: p.package_cbm,
      gtin: p.gtin,
      packagesPerSlot: row.template?.packages_per_slot,
    },
  }
}

/** Containers the caller may promote — OPEN/FILLING, RLS-scoped to their brands. */
export async function listPromotableContainers(): Promise<ActionResult<PromotableContainerRow[]>> {
  const auth = await requireTower()
  if (!auth.ok) return auth.error
  const { data, error } = await auth.supabase
    .from('rb_containers')
    .select(CONTAINER_SELECT)
    .in('status', ['OPEN', 'FILLING'])
    .order('created_at', { ascending: false })
  if (error) return fail('FORBIDDEN_LANE', 'No se pudieron leer los contenedores / Could not read containers')
  const rows = (data ?? []) as unknown as ContainerJoinRow[]
  const out = await Promise.all(
    rows.map(async (row) => {
      const taken = await slotsTakenFor(auth.supabase, row.id)
      const { productName } = await factsFor(auth.supabase, row)
      const total = row.template?.total_slots ?? 0
      return {
        id: row.id,
        code: row.code,
        status: row.status,
        brandSlug: row.brand?.slug ?? '',
        brandName: row.brand?.name ?? '',
        productName,
        slotsTotal: total,
        slotsAvailable: Math.max(0, total - taken),
        promoActive: row.promo_active,
        promoActivatedAt: row.promo_activated_at,
        closesAt: row.closes_at,
        phase: row.shipping_phase,
        routeLabel: routeLabelOf(row.route) ?? null,
      }
    }),
  )
  return ok(out)
}

async function loadDetail(
  supabase: TowerClient,
  containerId: string,
  siteBase?: string,
): Promise<ContainerPromoDetail | null> {
  const { data, error } = await supabase.from('rb_containers').select(CONTAINER_SELECT).eq('id', containerId).maybeSingle()
  if (error || !data) return null
  const row = data as unknown as ContainerJoinRow
  const [breakdown, pf] = await Promise.all([slotBreakdownFor(supabase, row.id), factsFor(supabase, row)])
  const total = row.template?.total_slots ?? 0
  const available = Math.max(0, total - breakdown.taken)
  const copy = (row.promo_copy ?? {}) as PromoCopy
  const promo = toContainerPromo({
    code: row.code,
    brandSlug: row.brand?.slug ?? '',
    brandName: row.brand?.name ?? '',
    productName: pf.productName,
    slotsTotal: total,
    slotsAvailable: available,
    slotsCommitted: breakdown.committed,
    slotsReserved: breakdown.reserved,
    route: row.route,
    phase: row.shipping_phase,
    facts: pf.facts,
    copy,
    siteBase,
    accent: row.brand?.identity?.tokens?.accent,
  })
  return {
    id: row.id,
    code: row.code,
    status: row.status,
    brandSlug: row.brand?.slug ?? '',
    brandName: row.brand?.name ?? '',
    productName: pf.productName,
    slotsTotal: total,
    slotsAvailable: available,
    promoActive: row.promo_active,
    promoActivatedAt: row.promo_activated_at,
    closesAt: row.closes_at,
    phase: row.shipping_phase,
    routeLabel: routeLabelOf(row.route) ?? null,
    copy,
    route: row.route,
    promo,
    defaultSpecs: defaultSpecs(pf.facts),
  }
}

async function loadDetailByCode(supabase: TowerClient, code: string, siteBase?: string): Promise<ContainerPromoDetail | null> {
  const { data } = await supabase.from('rb_containers').select('id').eq('code', code).maybeSingle()
  const id = (data as { id: string } | null)?.id
  if (!id) return null
  return loadDetail(supabase, id, siteBase)
}

/** Full promotion detail by container code — used by the share-card route. */
export async function getContainerPromoByCode(code: string): Promise<ActionResult<ContainerPromoDetail>> {
  if (typeof code !== 'string' || !/^[A-Za-z0-9._-]{1,64}$/.test(code)) return fail('VALIDATION', 'Código inválido / Invalid code')
  const auth = await requireTower()
  if (!auth.ok) return auth.error
  const detail = await loadDetailByCode(auth.supabase, code, process.env.NEXT_PUBLIC_SITE_URL)
  if (!detail) return fail('FORBIDDEN_LANE', 'Contenedor no encontrado / Container not found')
  return ok(detail)
}

/** Full promotion detail for one container (incl. the derived ContainerPromo). */
export async function getContainerPromo(containerId: string): Promise<ActionResult<ContainerPromoDetail>> {
  const idParsed = uuidSchema.safeParse(containerId)
  if (!idParsed.success) return fail('VALIDATION', 'ID inválido / Invalid id')
  const auth = await requireTower()
  if (!auth.ok) return auth.error
  const detail = await loadDetail(auth.supabase, idParsed.data, process.env.NEXT_PUBLIC_SITE_URL)
  if (!detail) return fail('FORBIDDEN_LANE', 'Contenedor no encontrado / Container not found')
  return ok(detail)
}

/** Save the rep-authored share copy (RLS: BRAND_MANAGER/BRAND_OPS). */
export async function saveContainerPromoCopy(containerId: string, copy: unknown): Promise<ActionResult<ContainerPromoDetail>> {
  const idParsed = uuidSchema.safeParse(containerId)
  if (!idParsed.success) return fail('VALIDATION', 'ID inválido / Invalid id')
  const parsed = promoCopySchema.safeParse(copy)
  if (!parsed.success) {
    return fail('VALIDATION', 'Texto inválido / Invalid copy', parsed.error.flatten().fieldErrors as Record<string, string[]>)
  }
  const auth = await requireTower()
  if (!auth.ok) return auth.error
  const { error } = await auth.supabase.from('rb_containers').update({ promo_copy: parsed.data }).eq('id', idParsed.data)
  if (error) return fail('FORBIDDEN_LANE', 'No se pudo guardar el texto / Could not save copy')
  const detail = await loadDetail(auth.supabase, idParsed.data, process.env.NEXT_PUBLIC_SITE_URL)
  if (!detail) return fail('FORBIDDEN_LANE', 'Contenedor no encontrado / Container not found')
  return ok(detail)
}

// Analytics lane for represented-brand promotion events. RB brands are not a
// WGT lane; §5-bis surfaces them on WGT/05 Representation, so that is the lane
// dimension a promotion signal rolls up under.
const RB_PROMO_LANE = 'representation'

/** Activate/deactivate marketing for a container (RLS: BRAND_MANAGER/BRAND_OPS).
 *  Stamps who/when on activation for the audit trail. */
export async function setContainerPromoActive(containerId: string, active: boolean): Promise<ActionResult<ContainerPromoDetail>> {
  const idParsed = uuidSchema.safeParse(containerId)
  if (!idParsed.success) return fail('VALIDATION', 'ID inválido / Invalid id')
  const auth = await requireTower()
  if (!auth.ok) return auth.error
  const patch = active
    ? { promo_active: true, promo_activated_at: new Date().toISOString(), promo_activated_by: auth.user.id }
    : { promo_active: false }
  const { error } = await auth.supabase.from('rb_containers').update(patch).eq('id', idParsed.data)
  if (error) return fail('FORBIDDEN_LANE', 'No se pudo cambiar la promoción / Could not change promotion')
  const detail = await loadDetail(auth.supabase, idParsed.data, process.env.NEXT_PUBLIC_SITE_URL)
  if (!detail) return fail('FORBIDDEN_LANE', 'Contenedor no encontrado / Container not found')
  // Emit the activation signal (lane dimension) into tower.events. Fire-and-
  // forget: analytics never gates the mutation. NO PII (Directive 6) — only the
  // brand, lane, container code + shipping phase travel with the event.
  if (active && detail.brandSlug) {
    await emitServerEvent({
      brand: detail.brandSlug,
      lane: RB_PROMO_LANE,
      event: 'container_promoted',
      meta: { code: detail.code, phase: detail.phase, archetype: 'ALLOCATION' },
    })
  }
  return ok(detail)
}

/** Advance the container's shipping phase — en origen → en tránsito → arribado.
 *  The route (ports) is not touched; it always comes from the container spec. */
export async function setContainerShippingPhase(containerId: string, phase: ShippingPhase): Promise<ActionResult<ContainerPromoDetail>> {
  const idParsed = uuidSchema.safeParse(containerId)
  if (!idParsed.success) return fail('VALIDATION', 'ID inválido / Invalid id')
  if (!SHIPPING_PHASES.includes(phase)) return fail('VALIDATION', 'Fase inválida / Invalid phase')
  const auth = await requireTower()
  if (!auth.ok) return auth.error
  const { error } = await auth.supabase.from('rb_containers').update({ shipping_phase: phase }).eq('id', idParsed.data)
  if (error) return fail('FORBIDDEN_LANE', 'No se pudo cambiar la fase / Could not change phase')
  const detail = await loadDetail(auth.supabase, idParsed.data, process.env.NEXT_PUBLIC_SITE_URL)
  if (!detail) return fail('FORBIDDEN_LANE', 'Contenedor no encontrado / Container not found')
  return ok(detail)
}
