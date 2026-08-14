'use server'

// The Supplier FOB Price Book data layer. tower.suppliers is RLS-scoped on
// has_brand_access (read) / has_brand_role (write); tower.supplier_offers
// mirrors that scope 1:1 (tower_60). An offer's brand_id is always derived
// server-side from its supplier — never trusted from client input — so an
// offer can never land under a brand its supplier doesn't belong to.

import { z } from 'zod'
import { createServerSupabase } from '@/lib/supabase/server'
import { ok, fail, type ActionResult } from './result'
import {
  mapSupplierOfferRow,
  mapSupplierRow,
  SUPPLIER_OFFER_SELECT,
  SUPPLIER_SELECT,
  type RawSupplierOfferRow,
  type RawSupplierRow,
  type SupplierListItem,
  type SupplierOfferListItem,
  type SupplierOption,
} from './suppliers-logic'

async function requireUser() {
  const supabase = await createServerSupabase()
  if (!supabase) return { ok: false as const, error: fail('UNAUTHORIZED', 'Sesión requerida / Session required') }
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false as const, error: fail('UNAUTHORIZED', 'Sesión requerida / Session required') }
  return { ok: true as const, supabase, user }
}

const nz = (max: number) => z.string().trim().max(max).nullish()

/** All suppliers the caller can see, A→Z. RLS on tower.suppliers is the scope boundary. */
export async function listSuppliers(): Promise<ActionResult<SupplierListItem[]>> {
  const auth = await requireUser()
  if (!auth.ok) return auth.error

  const { data, error } = await auth.supabase
    .schema('tower')
    .from('suppliers')
    .select(SUPPLIER_SELECT)
    .order('name', { ascending: true })
    .limit(500)

  if (error) return fail('VALIDATION', 'No se pudieron listar los proveedores / Could not list suppliers')
  return ok(((data ?? []) as unknown as RawSupplierRow[]).map(mapSupplierRow))
}

const createSupplierSchema = z.object({
  brandId: z.string().uuid(),
  name: z.string().trim().min(1).max(200),
  country: nz(120),
  contactWhatsapp: nz(40),
  contactEmail: nz(200),
  notes: nz(2000),
})
export type CreateSupplierInput = z.input<typeof createSupplierSchema>

/** Register a new supplier (RLS: suppliers_ins = LANE_DIRECTOR/TRADE_OPS on the brand). */
export async function createSupplier(input: CreateSupplierInput): Promise<ActionResult<SupplierOption>> {
  const parsed = createSupplierSchema.safeParse(input)
  if (!parsed.success) return fail('VALIDATION', 'Datos inválidos / Invalid data')
  const d = parsed.data

  const auth = await requireUser()
  if (!auth.ok) return auth.error

  const { data, error } = await auth.supabase
    .schema('tower')
    .from('suppliers')
    .insert({
      brand_id: d.brandId,
      name: d.name,
      country: d.country ?? null,
      contact_whatsapp: d.contactWhatsapp ?? null,
      contact_email: d.contactEmail ?? null,
      notes: d.notes ?? null,
    })
    .select('id,name,country,verified')
    .single()

  if (error || !data) return fail('FORBIDDEN_LANE', 'No se pudo registrar el proveedor / Could not register the supplier')
  return ok(data as SupplierOption)
}

/** One offer by id — feeds the "Costear" hand-off into the Costing calculator. */
export async function getSupplierOffer(id: string): Promise<ActionResult<SupplierOfferListItem>> {
  const parsed = z.string().uuid().safeParse(id)
  if (!parsed.success) return fail('VALIDATION', 'ID inválido / Invalid id')

  const auth = await requireUser()
  if (!auth.ok) return auth.error

  const { data, error } = await auth.supabase
    .schema('tower')
    .from('supplier_offers')
    .select(SUPPLIER_OFFER_SELECT)
    .eq('id', parsed.data)
    .maybeSingle()

  if (error) return fail('VALIDATION', 'No se pudo leer la oferta / Could not read the offer')
  if (!data) return fail('FORBIDDEN_LANE', 'Oferta no encontrada o sin acceso / Offer not found or no access')
  return ok(mapSupplierOfferRow(data as unknown as RawSupplierOfferRow))
}

/**
 * Offers the caller can see, newest first — optionally scoped to one supplier
 * or filtered by a free-text search across the product label (the "regardless
 * of category" lookup: what FOB have we gotten for X, from whom).
 */
export async function listSupplierOffers(params?: {
  supplierId?: string
  search?: string
}): Promise<ActionResult<SupplierOfferListItem[]>> {
  const auth = await requireUser()
  if (!auth.ok) return auth.error

  let query = auth.supabase
    .schema('tower')
    .from('supplier_offers')
    .select(SUPPLIER_OFFER_SELECT)
    .order('created_at', { ascending: false })
    .limit(300)

  if (params?.supplierId) {
    const parsed = z.string().uuid().safeParse(params.supplierId)
    if (!parsed.success) return fail('VALIDATION', 'ID inválido / Invalid id')
    query = query.eq('supplier_id', parsed.data)
  }
  if (params?.search && params.search.trim().length > 0) {
    query = query.ilike('product_label', `%${params.search.trim()}%`)
  }

  const { data, error } = await query
  if (error) return fail('VALIDATION', 'No se pudieron listar las ofertas / Could not list offers')
  return ok(((data ?? []) as unknown as RawSupplierOfferRow[]).map(mapSupplierOfferRow))
}

const offerExtraSchema = z.object({ label: z.string().trim().min(1).max(60), value: z.string().trim().min(1).max(200) })

const createOfferSchema = z.object({
  supplierId: z.string().uuid(),
  productId: z.string().uuid().nullish(),
  productLabel: z.string().trim().min(1).max(300),
  categoryPath: z.array(z.string().trim().max(80)).max(8).optional().default([]),
  unitPriceMinor: z.number().int().positive().nullish(),
  currency: z
    .string()
    .trim()
    .regex(/^[A-Za-z]{3}$/)
    .transform((s) => s.toUpperCase())
    .nullish(),
  priceUnit: nz(60),
  moq: nz(120),
  incoterm: nz(10).transform((v) => (v ? v.toUpperCase() : v)),
  leadTimeDays: z.number().int().positive().nullish(),
  port: nz(120),
  hsCode: nz(20),
  extras: z.array(offerExtraSchema).max(8).optional().default([]),
  source: z.enum(['whatsapp', 'alibaba', 'email', 'manual', 'other']).default('manual'),
  validUntil: nz(10),
  notes: nz(2000),
})
export type CreateSupplierOfferInput = z.input<typeof createOfferSchema>

/**
 * Capture a supplier price/offer. RLS: supplier_offers_ins =
 * LANE_DIRECTOR/TRADE_OPS/SALES on the supplier's brand. brand_id is looked up
 * from the supplier row (RLS-scoped read) rather than trusted from the caller.
 */
export async function createSupplierOffer(
  input: CreateSupplierOfferInput,
): Promise<ActionResult<SupplierOfferListItem>> {
  const parsed = createOfferSchema.safeParse(input)
  if (!parsed.success) return fail('VALIDATION', 'Datos inválidos / Invalid data')
  const d = parsed.data

  const auth = await requireUser()
  if (!auth.ok) return auth.error
  const db = auth.supabase.schema('tower')

  const { data: supplier, error: supplierError } = await db
    .from('suppliers')
    .select('brand_id')
    .eq('id', d.supplierId)
    .maybeSingle()
  if (supplierError || !supplier) return fail('FORBIDDEN_LANE', 'Proveedor no encontrado / Supplier not found')

  const { data, error } = await db
    .from('supplier_offers')
    .insert({
      brand_id: (supplier as { brand_id: string }).brand_id,
      supplier_id: d.supplierId,
      product_id: d.productId ?? null,
      product_label: d.productLabel,
      category_path: d.categoryPath,
      unit_price_minor: d.unitPriceMinor ?? null,
      currency: d.currency ?? null,
      price_unit: d.priceUnit ?? null,
      moq: d.moq ?? null,
      incoterm: d.incoterm ?? null,
      lead_time_days: d.leadTimeDays ?? null,
      port: d.port ?? null,
      hs_code: d.hsCode ?? null,
      extras: d.extras,
      source: d.source,
      valid_until: d.validUntil ?? null,
      notes: d.notes ?? null,
    })
    .select(SUPPLIER_OFFER_SELECT)
    .single()

  if (error || !data) return fail('FORBIDDEN_LANE', 'No se pudo guardar la oferta / Could not save the offer')
  return ok(mapSupplierOfferRow(data as unknown as RawSupplierOfferRow))
}
