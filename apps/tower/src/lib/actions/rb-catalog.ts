'use server'

// src/lib/actions/rb-catalog.ts
// RB product shelf mutations (RB Console Wave 2, Ch 02) — the write-side for
// represented-brand (RB/xx) products + their ALLOCATION specs. Every action
// follows the TOWER mutation law: auth (requireUser) → Zod parse → RLS-scoped
// query. RLS (tower.rb_products has_rb_role policies, tower_26) is the ONLY
// permission boundary — this file never gates with `if (role === …)`; see
// rb-catalog-logic.ts#computeRbProductCapabilities for the presentation-only
// capability derivation the editor + PublishBar read.
//
// Reuse, not fork: the DRAFT→IN_REVIEW→PUBLISHED→RETIRED status guards and the
// version-snapshot math are imported verbatim from catalog-logic.ts (archetype-
// agnostic). Only the table (rb_products, brand-scoped) and the spec archetype
// (ALLOCATION) differ from the lane catalog.
import { z } from 'zod'
import type { SupabaseClient } from '@supabase/supabase-js'
import { createServerSupabase, createServiceClient } from '@/lib/supabase/server'
import { fail, ok, type ActionResult } from './result'
import { localizedSchema, type Localized } from '@/lib/archetypes'
import { SPEC_ZOD_DEFAULTS } from '@/lib/schemas/spec'
import { RB_ASSET_BUCKET, buildRbAssetStoragePath } from './represented-brands-logic'
import { MEDIA_KINDS, type MediaKind } from './media-types'
import {
  buildVersionSnapshot,
  applyRollbackSnapshot,
  canEditStatus,
  canPublish as statusCanPublish,
  canRetire as statusCanRetire,
  canRollback as statusCanRollback,
  canSubmitForReview as statusCanSubmitForReview,
  isCompleteForPublish,
  nextVersionNumber,
  type ProductCapabilities,
  type ProductSnapshot,
  type ProductStatus,
} from './catalog-logic'
import {
  computeRbProductCapabilities,
  mapRbPackingProfileRow,
  type RawRbPackingProfileRow,
  type RbPackingProfileRow,
} from './rb-catalog-logic'
import { RB_ROLES, type RbRole } from './represented-brands-logic'

const uuidSchema = z.string().uuid()

type TowerClient = ReturnType<SupabaseClient['schema']>

// ── Row shape ────────────────────────────────────────────────────────────────

export interface RbProductRow {
  id: string
  representedBrandId: string
  slug: string
  status: ProductStatus
  categoryPath: string[]
  name: Localized
  specs: Record<string, unknown>
  specSchemaId: string | null
  hsCode: string | null
  moq: number | null
  cbmPerUnit: number | null
  createdBy: string | null
  updatedAt: string
}

export interface RbProductVersionRow {
  id: string
  rbProductId: string
  version: number
  snapshot: ProductSnapshot
  publishedBy: string | null
  publishedAt: string
}

const SELECT_COLS =
  'id,represented_brand_id,slug,status,category_path,name,specs,spec_schema_id,hs_code,moq,cbm_per_unit,created_by,updated_at'

/** Live container statuses — a container in one of these still depends on its
 * composed products staying published (R14). Terminal/not-live = CLOSED, SHIPPED,
 * CANCELLED. Mirrors rb_reserve()'s live-set and the tower_42 retire guard. */
const RB_LIVE_CONTAINER_STATUSES = ['OPEN', 'FILLING'] as const

interface RawRbProductRow {
  id: string
  represented_brand_id: string
  slug: string
  status: string
  category_path: string[] | null
  name: Localized
  specs: Record<string, unknown> | null
  spec_schema_id: string | null
  hs_code: string | null
  moq: number | string | null
  cbm_per_unit: number | string | null
  created_by: string | null
  updated_at: string
}

function toNumberOrNull(v: number | string | null | undefined): number | null {
  if (v === null || v === undefined) return null
  const n = typeof v === 'string' ? Number(v) : v
  return Number.isFinite(n) ? n : null
}

function mapRow(row: RawRbProductRow): RbProductRow {
  return {
    id: row.id,
    representedBrandId: row.represented_brand_id,
    slug: row.slug,
    status: row.status as ProductStatus,
    categoryPath: row.category_path ?? [],
    name: row.name,
    specs: row.specs ?? {},
    specSchemaId: row.spec_schema_id,
    hsCode: row.hs_code,
    moq: toNumberOrNull(row.moq),
    cbmPerUnit: toNumberOrNull(row.cbm_per_unit),
    createdBy: row.created_by,
    updatedAt: row.updated_at,
  }
}

function toEditableFields(row: RbProductRow) {
  return {
    slug: row.slug,
    categoryPath: row.categoryPath,
    name: row.name,
    specs: row.specs,
    specSchemaId: row.specSchemaId,
    hsCode: row.hsCode,
    moq: row.moq,
    cbmPerUnit: row.cbmPerUnit,
  }
}

function slugify(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

// ── Zod input schemas ────────────────────────────────────────────────────────

const categoryPathSchema = z.array(z.string().min(1)).max(8)
const specsSchema = z.record(z.unknown())
const slugSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'kebab-case')

const productInputSchema = z.object({
  slug: slugSchema.optional(),
  name: localizedSchema,
  categoryPath: categoryPathSchema.default([]),
  specs: specsSchema.default({}),
  hsCode: z.string().trim().min(1).nullable().optional(),
  moq: z.number().nonnegative().nullable().optional(),
  cbmPerUnit: z.number().nonnegative().nullable().optional(),
})
const productPatchSchema = productInputSchema.partial()

export type RbProductInput = z.input<typeof productInputSchema>
export type RbProductPatch = z.input<typeof productPatchSchema>

/** Validate a specs payload against the ALLOCATION Zod object (the same guard
 * SpecForm runs client-side, re-run server-side because display never authorizes,
 * root §5-bis). Empty specs are allowed on DRAFT — completeness is gated at
 * publish, not at every save. */
function validateAllocationSpecs(specs: Record<string, unknown>): { ok: true } | { ok: false; details: Record<string, string[]> } {
  if (Object.keys(specs).length === 0) return { ok: true }
  const parsed = SPEC_ZOD_DEFAULTS.ALLOCATION.safeParse(specs)
  if (parsed.success) return { ok: true }
  return { ok: false, details: parsed.error.flatten().fieldErrors as Record<string, string[]> }
}

// ── Auth helper (RLS client) ─────────────────────────────────────────────────

async function requireUser() {
  const supabase = await createServerSupabase()
  if (!supabase) return { ok: false, error: fail('UNAUTHORIZED', 'Auth no configurado / Auth not configured') } as const
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: fail('UNAUTHORIZED', 'Sesión requerida / Session required') } as const
  return { ok: true, supabase: supabase.schema('tower'), user } as const
}

/** The ALLOCATION default spec-schema row id (lane_id = null, highest version) —
 * stamped onto new products so SpecForm/SpecView resolve without a lookup. Read
 * under the caller's RLS client (spec_schemas is reference data); null if unseeded. */
async function allocationSchemaId(supabase: TowerClient): Promise<string | null> {
  const { data } = await supabase
    .from('spec_schemas')
    .select('id')
    .eq('archetype', 'ALLOCATION')
    .is('lane_id', null)
    .order('version', { ascending: false })
    .limit(1)
    .maybeSingle()
  return (data as { id: string } | null)?.id ?? null
}

// ── Reads ────────────────────────────────────────────────────────────────────

/** List a brand's products. requireUser + RLS (R8) — a rep sees only their own
 * brand's rows; a group admin sees all via has_rb_role's is_group_admin branch. */
export async function listRbProducts(brandId: string): Promise<ActionResult<RbProductRow[]>> {
  const gate = await requireUser()
  if (!gate.ok) return gate.error
  const idParsed = uuidSchema.safeParse(brandId)
  if (!idParsed.success) return fail('VALIDATION', 'Marca inválida / Invalid brand')

  const { data, error } = await gate.supabase
    .from('rb_products')
    .select(SELECT_COLS)
    .eq('represented_brand_id', idParsed.data)
    .order('updated_at', { ascending: false })
    .order('id', { ascending: false })
  if (error) return fail('FORBIDDEN_LANE', 'No se pudo listar productos / Could not list products')
  return ok(((data ?? []) as unknown as RawRbProductRow[]).map(mapRow))
}

export async function getRbProduct(id: string): Promise<ActionResult<RbProductRow>> {
  const gate = await requireUser()
  if (!gate.ok) return gate.error
  const idParsed = uuidSchema.safeParse(id)
  if (!idParsed.success) return fail('VALIDATION', 'ID inválido / Invalid id')

  const { data, error } = await gate.supabase.from('rb_products').select(SELECT_COLS).eq('id', idParsed.data).maybeSingle()
  if (error) return fail('VALIDATION', 'No se pudo leer el producto / Could not read product')
  if (!data) return fail('FORBIDDEN_LANE', 'Producto no encontrado o sin acceso / Product not found or no access')
  return ok(mapRow(data as unknown as RawRbProductRow))
}

export async function getRbProductVersions(rbProductId: string): Promise<ActionResult<RbProductVersionRow[]>> {
  const gate = await requireUser()
  if (!gate.ok) return gate.error
  const idParsed = uuidSchema.safeParse(rbProductId)
  if (!idParsed.success) return fail('VALIDATION', 'ID inválido / Invalid id')

  const { data, error } = await gate.supabase
    .from('rb_product_versions')
    .select('id,rb_product_id,version,snapshot,published_by,published_at')
    .eq('rb_product_id', idParsed.data)
    .order('version', { ascending: false })
  if (error) return fail('VALIDATION', 'No se pudo leer el historial / Could not read version history')

  return ok(
    (data ?? []).map((r) => ({
      id: (r as { id: string }).id,
      rbProductId: (r as { rb_product_id: string }).rb_product_id,
      version: (r as { version: number }).version,
      snapshot: (r as { snapshot: unknown }).snapshot as ProductSnapshot,
      publishedBy: (r as { published_by: string | null }).published_by,
      publishedAt: (r as { published_at: string }).published_at,
    })),
  )
}

/** Presentation-only capabilities for a brand's product editor: rb roles +
 * group-admin flag + the brand kit gate → the shared ProductCapabilities shape
 * (PublishBar consumes it unchanged). RLS remains the real boundary. */
export async function getRbProductCapabilities(brandId: string): Promise<ActionResult<ProductCapabilities>> {
  const gate = await requireUser()
  if (!gate.ok) return gate.error
  const idParsed = uuidSchema.safeParse(brandId)
  if (!idParsed.success) return fail('VALIDATION', 'Marca inválida / Invalid brand')

  const [{ data: profile }, { data: memberships, error }, { data: brand }] = await Promise.all([
    gate.supabase.from('profiles').select('is_group_admin').eq('id', gate.user.id).maybeSingle(),
    gate.supabase.from('rb_memberships').select('role').eq('user_id', gate.user.id).eq('represented_brand_id', idParsed.data),
    gate.supabase.from('represented_brands').select('kit_complete').eq('id', idParsed.data).maybeSingle(),
  ])
  if (error) return fail('VALIDATION', 'No se pudo resolver permisos / Could not resolve permissions')

  const roles = ((memberships ?? []) as { role: string }[])
    .map((m) => m.role)
    .filter((r): r is RbRole => (RB_ROLES as readonly string[]).includes(r))
  const isGroupAdmin = Boolean((profile as { is_group_admin?: boolean } | null)?.is_group_admin)
  const kitComplete = Boolean((brand as { kit_complete?: boolean } | null)?.kit_complete)

  return ok(computeRbProductCapabilities(roles, isGroupAdmin, kitComplete))
}

// ── Mutations ────────────────────────────────────────────────────────────────

/** Create a DRAFT product under a brand. RLS confines the insert to a brand the
 * caller holds BRAND_MANAGER/BRAND_OPS on (tower_26). specs validated vs the
 * ALLOCATION Zod object; spec_schema_id stamped to the ALLOCATION default. */
export async function createRbProduct(brandId: string, input: RbProductInput): Promise<ActionResult<RbProductRow>> {
  const gate = await requireUser()
  if (!gate.ok) return gate.error
  const brandParsed = uuidSchema.safeParse(brandId)
  if (!brandParsed.success) return fail('VALIDATION', 'Marca inválida / Invalid brand')

  const parsed = productInputSchema.safeParse(input)
  if (!parsed.success) return fail('VALIDATION', 'Datos inválidos / Invalid data', parsed.error.flatten().fieldErrors)

  const specCheck = validateAllocationSpecs(parsed.data.specs)
  if (!specCheck.ok) return fail('VALIDATION', 'Especificación inválida / Invalid spec', specCheck.details)

  const slug = parsed.data.slug || slugify(parsed.data.name.en || parsed.data.name.es)
  if (!slug) return fail('VALIDATION', 'No se pudo derivar el slug / Could not derive a slug from the name')

  const schemaId = await allocationSchemaId(gate.supabase)

  const { data, error } = await gate.supabase
    .from('rb_products')
    .insert({
      represented_brand_id: brandParsed.data,
      slug,
      category_path: parsed.data.categoryPath,
      name: parsed.data.name,
      specs: parsed.data.specs,
      spec_schema_id: schemaId,
      hs_code: parsed.data.hsCode ?? null,
      moq: parsed.data.moq ?? null,
      cbm_per_unit: parsed.data.cbmPerUnit ?? null,
      created_by: gate.user.id,
    })
    .select(SELECT_COLS)
    .single()

  if (error) {
    if (error.code === '23505') {
      return fail('VALIDATION', 'Ya existe un producto con ese slug en la marca / Slug already used in this brand', {
        slug: ['duplicate'],
      })
    }
    return fail('FORBIDDEN_LANE', 'No se pudo crear el producto / Could not create product')
  }
  return ok(mapRow(data as unknown as RawRbProductRow))
}

/** Edit a DRAFT/IN_REVIEW product. Locked once PUBLISHED/RETIRED (canEditStatus)
 * so version snapshots stay truthful; specs re-validated when present. */
export async function updateRbProduct(id: string, patch: RbProductPatch): Promise<ActionResult<RbProductRow>> {
  const gate = await requireUser()
  if (!gate.ok) return gate.error
  const idParsed = uuidSchema.safeParse(id)
  if (!idParsed.success) return fail('VALIDATION', 'ID inválido / Invalid id')

  const parsed = productPatchSchema.safeParse(patch)
  if (!parsed.success) return fail('VALIDATION', 'Datos inválidos / Invalid data', parsed.error.flatten().fieldErrors)

  const { data: current, error: currentError } = await gate.supabase
    .from('rb_products')
    .select('status')
    .eq('id', idParsed.data)
    .maybeSingle()
  if (currentError) return fail('VALIDATION', 'No se pudo leer el producto / Could not read product')
  if (!current) return fail('FORBIDDEN_LANE', 'Producto no encontrado o sin acceso / Product not found or no access')
  if (!canEditStatus((current as { status: string }).status as ProductStatus)) {
    return fail('VALIDATION', 'Solo se puede editar en borrador o en revisión / Only editable while DRAFT or IN_REVIEW')
  }

  if (parsed.data.specs !== undefined) {
    const specCheck = validateAllocationSpecs(parsed.data.specs)
    if (!specCheck.ok) return fail('VALIDATION', 'Especificación inválida / Invalid spec', specCheck.details)
  }

  const payload: Record<string, unknown> = {}
  if (parsed.data.slug !== undefined) payload.slug = parsed.data.slug
  if (parsed.data.name !== undefined) payload.name = parsed.data.name
  if (parsed.data.categoryPath !== undefined) payload.category_path = parsed.data.categoryPath
  if (parsed.data.specs !== undefined) payload.specs = parsed.data.specs
  if (parsed.data.hsCode !== undefined) payload.hs_code = parsed.data.hsCode
  if (parsed.data.moq !== undefined) payload.moq = parsed.data.moq
  if (parsed.data.cbmPerUnit !== undefined) payload.cbm_per_unit = parsed.data.cbmPerUnit

  const { data, error } = await gate.supabase.from('rb_products').update(payload).eq('id', idParsed.data).select(SELECT_COLS).single()
  if (error) return fail('FORBIDDEN_LANE', 'No se pudo actualizar el producto / Could not update product')
  return ok(mapRow(data as unknown as RawRbProductRow))
}

export async function submitRbForReview(id: string): Promise<ActionResult<RbProductRow>> {
  const gate = await requireUser()
  if (!gate.ok) return gate.error
  const idParsed = uuidSchema.safeParse(id)
  if (!idParsed.success) return fail('VALIDATION', 'ID inválido / Invalid id')

  const { data: current, error: currentError } = await gate.supabase
    .from('rb_products')
    .select('status')
    .eq('id', idParsed.data)
    .maybeSingle()
  if (currentError) return fail('VALIDATION', 'No se pudo leer el producto / Could not read product')
  if (!current) return fail('FORBIDDEN_LANE', 'Producto no encontrado o sin acceso / Product not found or no access')
  if (!statusCanSubmitForReview((current as { status: string }).status as ProductStatus)) {
    return fail('VALIDATION', 'Solo un borrador puede enviarse a revisión / Only a draft can be submitted for review')
  }

  const { data, error } = await gate.supabase
    .from('rb_products')
    .update({ status: 'IN_REVIEW' })
    .eq('id', idParsed.data)
    .select(SELECT_COLS)
    .single()
  if (error) return fail('FORBIDDEN_LANE', 'No se pudo enviar a revisión / Could not submit for review')
  return ok(mapRow(data as unknown as RawRbProductRow))
}

/** Publish: gated write first (RLS: BRAND_MANAGER/BRAND_OPS on rb_products),
 * then the append-only version snapshot. Fiche freshness rides the site's ISR
 * window (SPEC §5.4, revalidate=60) — the frozen triggerRevalidate contract is
 * lane-shaped and RB has no lane, so no lane cache tags are fanned here. */
export async function publishRbProduct(id: string): Promise<ActionResult<{ product: RbProductRow; version: number }>> {
  const gate = await requireUser()
  if (!gate.ok) return gate.error
  const idParsed = uuidSchema.safeParse(id)
  if (!idParsed.success) return fail('VALIDATION', 'ID inválido / Invalid id')

  const { data: current, error: currentError } = await gate.supabase
    .from('rb_products')
    .select(SELECT_COLS)
    .eq('id', idParsed.data)
    .maybeSingle()
  if (currentError) return fail('VALIDATION', 'No se pudo leer el producto / Could not read product')
  if (!current) return fail('FORBIDDEN_LANE', 'Producto no encontrado o sin acceso / Product not found or no access')

  const product = mapRow(current as unknown as RawRbProductRow)
  if (!statusCanPublish(product.status)) {
    return fail('VALIDATION', 'Transición de estado inválida para publicar / Invalid status transition to publish')
  }
  if (!isCompleteForPublish(product)) {
    return fail('VALIDATION', 'Nombre (ES/EN) y categoría son obligatorios para publicar / Name (ES/EN) and category are required to publish')
  }
  const specCheck = validateAllocationSpecs(product.specs)
  if (!specCheck.ok) return fail('VALIDATION', 'Especificación incompleta o inválida / Spec incomplete or invalid', specCheck.details)

  const { data: updated, error: updateError } = await gate.supabase
    .from('rb_products')
    .update({ status: 'PUBLISHED' })
    .eq('id', idParsed.data)
    .select(SELECT_COLS)
    .single()
  if (updateError) return fail('FORBIDDEN_LANE', 'No se pudo publicar / Could not publish')

  const updatedProduct = mapRow(updated as unknown as RawRbProductRow)

  const { data: versions, error: versionsError } = await gate.supabase
    .from('rb_product_versions')
    .select('version')
    .eq('rb_product_id', idParsed.data)
  if (versionsError) return fail('VALIDATION', 'No se pudo leer el historial de versiones / Could not read version history')

  const version = nextVersionNumber(versions ?? [])
  const snapshot = buildVersionSnapshot(toEditableFields(updatedProduct))

  const { error: insertError } = await gate.supabase
    .from('rb_product_versions')
    .insert({ rb_product_id: idParsed.data, version, snapshot, published_by: gate.user.id })
  if (insertError) return fail('VALIDATION', 'No se pudo registrar la versión publicada / Could not record the published version')

  return ok({ product: updatedProduct, version })
}

/** Remove a product = PUBLISHED → RETIRED (append-only; never a hard delete).
 * The R14 cross-guard refuses the retire while the product is composed into a
 * LIVE container: its slug appears as a profile_slug in a same-brand container
 * template whose container is still OPEN/FILLING. The authoritative enforcement
 * is the tower_42 rb_products_retire_guard trigger; the pre-check below is defence
 * in depth so the user sees a clean message instead of a raw trigger error. */
export async function retireRbProduct(id: string): Promise<ActionResult<RbProductRow>> {
  const gate = await requireUser()
  if (!gate.ok) return gate.error
  const idParsed = uuidSchema.safeParse(id)
  if (!idParsed.success) return fail('VALIDATION', 'ID inválido / Invalid id')

  const { data: current, error: currentError } = await gate.supabase
    .from('rb_products')
    .select('status,slug,represented_brand_id')
    .eq('id', idParsed.data)
    .maybeSingle()
  if (currentError) return fail('VALIDATION', 'No se pudo leer el producto / Could not read product')
  if (!current) return fail('FORBIDDEN_LANE', 'Producto no encontrado o sin acceso / Product not found or no access')
  if (!statusCanRetire((current as { status: string }).status as ProductStatus)) {
    return fail('VALIDATION', 'Solo un producto publicado puede retirarse / Only a published product can be retired')
  }

  // R14 cross-guard (friendly pre-check; the tower_42 trigger is the real boundary).
  // A product enters a container through its packing profile: the template
  // composition carries {profile_slug} = product.slug. Refuse the retire while any
  // same-brand container built on such a template is still LIVE (OPEN/FILLING).
  const { slug, represented_brand_id: brandId } = current as { slug: string; represented_brand_id: string }
  const { data: liveTemplates, error: templatesError } = await gate.supabase
    .from('rb_container_templates')
    .select('id')
    .eq('represented_brand_id', brandId)
    .contains('composition', [{ profile_slug: slug }])
  if (templatesError) return fail('VALIDATION', 'No se pudo verificar contenedores / Could not verify containers')
  const templateIds = ((liveTemplates ?? []) as { id: string }[]).map((t) => t.id)
  if (templateIds.length > 0) {
    const { data: liveContainers, error: containersError } = await gate.supabase
      .from('rb_containers')
      .select('code')
      .in('template_id', templateIds)
      .in('status', [...RB_LIVE_CONTAINER_STATUSES])
      .limit(1)
    if (containersError) return fail('VALIDATION', 'No se pudo verificar contenedores / Could not verify containers')
    if (liveContainers && liveContainers.length > 0) {
      return fail(
        'VALIDATION',
        'No se puede retirar: el producto está comprometido en un contenedor activo. Ciérralo, embárcalo o cancélalo primero. / Cannot retire: the product is committed in a live container. Close, ship or cancel it first.',
      )
    }
  }

  const { data, error } = await gate.supabase
    .from('rb_products')
    .update({ status: 'RETIRED' })
    .eq('id', idParsed.data)
    .select(SELECT_COLS)
    .single()
  if (error) return fail('FORBIDDEN_LANE', 'No se pudo retirar / Could not retire')
  return ok(mapRow(data as unknown as RawRbProductRow))
}

/** Restore a published/retired product from a version snapshot, re-snapshotting
 * on republish (append-only — history is never rewritten). */
export async function rollbackRbProduct(id: string, version: number): Promise<ActionResult<{ product: RbProductRow; version: number }>> {
  const gate = await requireUser()
  if (!gate.ok) return gate.error
  const inputParsed = z.object({ id: uuidSchema, version: z.number().int().positive() }).safeParse({ id, version })
  if (!inputParsed.success) return fail('VALIDATION', 'Datos inválidos / Invalid data')

  const { data: current, error: currentError } = await gate.supabase
    .from('rb_products')
    .select('status')
    .eq('id', inputParsed.data.id)
    .maybeSingle()
  if (currentError) return fail('VALIDATION', 'No se pudo leer el producto / Could not read product')
  if (!current) return fail('FORBIDDEN_LANE', 'Producto no encontrado o sin acceso / Product not found or no access')
  if (!statusCanRollback((current as { status: string }).status as ProductStatus)) {
    return fail('VALIDATION', 'Solo un producto publicado o retirado puede revertirse / Only a published or retired product can be rolled back')
  }

  const { data: versionRow, error: versionError } = await gate.supabase
    .from('rb_product_versions')
    .select('version,snapshot')
    .eq('rb_product_id', inputParsed.data.id)
    .eq('version', inputParsed.data.version)
    .maybeSingle()
  if (versionError) return fail('VALIDATION', 'No se pudo leer la versión / Could not read version')
  if (!versionRow) return fail('VALIDATION', 'Versión no encontrada / Version not found')

  const restored = applyRollbackSnapshot((versionRow as { snapshot: unknown }).snapshot as ProductSnapshot)

  const { data: updated, error: updateError } = await gate.supabase
    .from('rb_products')
    .update({
      slug: restored.slug,
      category_path: restored.categoryPath,
      name: restored.name,
      specs: restored.specs,
      spec_schema_id: restored.specSchemaId,
      hs_code: restored.hsCode,
      moq: restored.moq,
      cbm_per_unit: restored.cbmPerUnit,
      status: 'PUBLISHED',
    })
    .eq('id', inputParsed.data.id)
    .select(SELECT_COLS)
    .single()
  if (updateError) return fail('FORBIDDEN_LANE', 'No se pudo revertir / Could not roll back')

  const updatedProduct = mapRow(updated as unknown as RawRbProductRow)

  const { data: versions, error: versionsError } = await gate.supabase
    .from('rb_product_versions')
    .select('version')
    .eq('rb_product_id', inputParsed.data.id)
  if (versionsError) return fail('VALIDATION', 'No se pudo leer el historial de versiones / Could not read version history')

  const nextVersion = nextVersionNumber(versions ?? [])
  const { error: insertError } = await gate.supabase
    .from('rb_product_versions')
    .insert({ rb_product_id: inputParsed.data.id, version: nextVersion, snapshot: buildVersionSnapshot(restored), published_by: gate.user.id })
  if (insertError) return fail('VALIDATION', 'No se pudo registrar la versión revertida / Could not record the rolled-back version')

  return ok({ product: updatedProduct, version: nextVersion })
}

// ── Product media (Wave 2 tail) ──────────────────────────────────────────────
// Attaches product images to an rb_product via tower.rb_product_media (tower_26).
// Reuses the shipped RB signed-upload pipeline (represented-brands-media.ts): the
// private `brand-kits` bucket + buildRbAssetStoragePath + the service-role signer
// — no new bucket or broker is invented. The upload-URL mint uses the service role
// (the bucket has no authenticated storage policy), so it is authorized in-action
// (editor gate below); the DB write itself rides the caller's RLS client, where
// rb_product_media_ins (has_rb_role BRAND_MANAGER/BRAND_OPS, join-through-parent)
// is the real boundary. No remove: tower_26 ships NO delete policy on the table
// (append-only law — retire, never delete).

export interface RbProductMediaRow {
  id: string
  rbProductId: string
  storagePath: string
  kind: MediaKind
  sort: number
  meta: Record<string, unknown>
}

interface RawRbProductMediaRow {
  id: string
  rb_product_id: string
  storage_path: string
  kind: string
  sort: number
  meta: Record<string, unknown> | null
}

function mapMediaRow(row: RawRbProductMediaRow): RbProductMediaRow {
  return {
    id: row.id,
    rbProductId: row.rb_product_id,
    storagePath: row.storage_path,
    kind: row.kind as MediaKind,
    sort: row.sort,
    meta: row.meta ?? {},
  }
}

export interface RbMediaUploadTicket {
  path: string
  token: string
  signedUrl: string
  bucket: string
}

interface RbProductEditorCtx {
  productId: string
  productSlug: string
  brandId: string
  brandSlug: string
}

/** Resolve a product to its brand slug + confirm the caller is a brand editor.
 * The product read runs under the caller's RLS client (returns a row only if they
 * hold some RB role on the brand); the editor check (group admin OR BRAND_MANAGER/
 * BRAND_OPS membership) then gates the service-role signed-URL mint — the same
 * authorize-in-action posture as represented-brands-media.ts#requireBrandManager,
 * widened to include BRAND_OPS (the product write role). */
async function resolveRbProductEditorCtx(
  gate: { supabase: TowerClient; user: { id: string } },
  productId: string,
): Promise<ActionResult<RbProductEditorCtx>> {
  const { data, error } = await gate.supabase
    .from('rb_products')
    .select('id, slug, represented_brand_id, brand:represented_brands!represented_brand_id ( slug )')
    .eq('id', productId)
    .maybeSingle()
  if (error) return fail('VALIDATION', 'No se pudo leer el producto / Could not read product')
  if (!data) return fail('FORBIDDEN_LANE', 'Producto no encontrado o sin acceso / Product not found or no access')
  const row = data as unknown as {
    id: string
    slug: string
    represented_brand_id: string
    brand: { slug: string } | { slug: string }[] | null
  }
  const brand = Array.isArray(row.brand) ? row.brand[0] : row.brand

  const [{ data: profile }, { data: memberships }] = await Promise.all([
    gate.supabase.from('profiles').select('is_group_admin').eq('id', gate.user.id).maybeSingle(),
    gate.supabase.from('rb_memberships').select('role').eq('user_id', gate.user.id).eq('represented_brand_id', row.represented_brand_id),
  ])
  const isGroupAdmin = Boolean((profile as { is_group_admin?: boolean } | null)?.is_group_admin)
  const roles = ((memberships ?? []) as { role: string }[]).map((m) => m.role)
  const isEditor = isGroupAdmin || roles.includes('BRAND_MANAGER') || roles.includes('BRAND_OPS')
  if (!isEditor) return fail('FORBIDDEN_LANE', 'Solo gestor u operación de la marca / Brand manager or ops only')

  return ok({ productId: row.id, productSlug: row.slug, brandId: row.represented_brand_id, brandSlug: brand?.slug ?? 'brand' })
}

const rbMediaUploadInputSchema = z.object({
  kind: z.enum(MEDIA_KINDS),
  fileName: z.string().trim().min(1).max(200),
})

/** Issue a signed upload URL for one product image. The caller PUTs the file to
 * `signedUrl`, then calls attachRbMedia with the returned `path`. Bytes land in
 * the private brand-kits bucket under rb/{brandSlug}/product-{slug}/… */
export async function createRbProductMediaUploadUrl(
  productId: string,
  input: z.input<typeof rbMediaUploadInputSchema>,
): Promise<ActionResult<RbMediaUploadTicket>> {
  const gate = await requireUser()
  if (!gate.ok) return gate.error
  const idParsed = uuidSchema.safeParse(productId)
  if (!idParsed.success) return fail('VALIDATION', 'ID de producto inválido / Invalid product id')
  const parsed = rbMediaUploadInputSchema.safeParse(input)
  if (!parsed.success) return fail('VALIDATION', 'Datos inválidos / Invalid data', parsed.error.flatten().fieldErrors)

  const ctx = await resolveRbProductEditorCtx(gate, idParsed.data)
  if (ctx.error) return ctx

  const service = createServiceClient()
  if (!service) return fail('UNAUTHORIZED', 'Servicio no configurado / Service not configured')

  const path = buildRbAssetStoragePath({
    brandSlug: ctx.data.brandSlug,
    slot: `product-${ctx.data.productSlug}`,
    fileName: parsed.data.fileName,
  })
  const { data, error } = await service.storage.from(RB_ASSET_BUCKET).createSignedUploadUrl(path)
  if (error || !data) return fail('VALIDATION', 'No se pudo generar la URL de carga / Could not create the upload URL')
  return ok({ path: data.path, token: data.token, signedUrl: data.signedUrl, bucket: RB_ASSET_BUCKET })
}

const attachRbMediaInputSchema = z.object({
  storagePath: z.string().min(1).max(400),
  kind: z.enum(MEDIA_KINDS),
  sort: z.number().int().min(0).default(0),
  meta: z.record(z.unknown()).default({}),
})

/** Record already-uploaded product images against an rb_product. RLS
 * (rb_product_media_ins, has_rb_role BRAND_MANAGER/BRAND_OPS) is the gate; the
 * audit trigger (tower_26) logs each insert. */
export async function attachRbMedia(
  productId: string,
  uploads: z.input<typeof attachRbMediaInputSchema>[],
): Promise<ActionResult<RbProductMediaRow[]>> {
  const gate = await requireUser()
  if (!gate.ok) return gate.error
  const idParsed = uuidSchema.safeParse(productId)
  if (!idParsed.success) return fail('VALIDATION', 'ID de producto inválido / Invalid product id')

  const parsed = z.array(attachRbMediaInputSchema).min(1).max(50).safeParse(uploads)
  if (!parsed.success) return fail('VALIDATION', 'Datos inválidos / Invalid data', { uploads: parsed.error.issues.map((i) => i.message) })

  const { data, error } = await gate.supabase
    .from('rb_product_media')
    .insert(
      parsed.data.map((u) => ({
        rb_product_id: idParsed.data,
        storage_path: u.storagePath,
        kind: u.kind,
        sort: u.sort,
        meta: u.meta,
      })),
    )
    .select('id,rb_product_id,storage_path,kind,sort,meta')
  if (error) return fail('FORBIDDEN_LANE', 'No se pudo adjuntar el material / Could not attach media')
  return ok(((data ?? []) as unknown as RawRbProductMediaRow[]).map(mapMediaRow))
}

/** List a product's media (RLS read: any RB role on the brand). */
export async function listRbMedia(productId: string): Promise<ActionResult<RbProductMediaRow[]>> {
  const gate = await requireUser()
  if (!gate.ok) return gate.error
  const idParsed = uuidSchema.safeParse(productId)
  if (!idParsed.success) return fail('VALIDATION', 'ID de producto inválido / Invalid product id')

  const { data, error } = await gate.supabase
    .from('rb_product_media')
    .select('id,rb_product_id,storage_path,kind,sort,meta')
    .eq('rb_product_id', idParsed.data)
    .order('sort', { ascending: true })
  if (error) return fail('VALIDATION', 'No se pudo listar el material / Could not list media')
  return ok(((data ?? []) as unknown as RawRbProductMediaRow[]).map(mapMediaRow))
}

// ── Packing profile (Wave 2 tail) ────────────────────────────────────────────
// tower.rb_packing_profiles (rb_wave1) is what a product's ALLOCATION math reads:
// packets/units per package, package CBM/KG, GTIN. The public fiche joins it to
// rb_products by (represented_brand_id, product_slug = slug); the container
// templates derive their slot capacity from it. This upsert is the write-side.
// Mutation law: auth → Zod → RLS (rb_profiles_ins/upd, BRAND_MANAGER/BRAND_OPS).
// product_slug is globally UNIQUE, so the upsert conflict-targets it — an attempt
// to steal another brand's slug fails the RLS check (isolation holds). Physical
// quantities (CBM/KG) are not money, so no integer-minor-unit rule applies.

const packingProfileInputSchema = z.object({
  productSlug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'kebab-case'),
  productName: z.string().trim().min(1).max(200),
  gtin: z.string().trim().min(1).max(64).nullable().optional(),
  packageKind: z.string().trim().min(1).max(40).default('box'),
  packetsPerPackage: z.number().int().min(1).default(1),
  unitsPerPackage: z.number().int().min(1),
  unitNamePlural: z.string().trim().min(1).max(60).default('unidades'),
  packageCbm: z.number().positive(),
  packageKg: z.number().positive(),
  stackable: z.boolean().default(true),
  notes: z.string().trim().max(500).nullable().optional(),
})

export type RbPackingProfileInput = z.input<typeof packingProfileInputSchema>
export type { RbPackingProfileRow }

const PACKING_SELECT =
  'id,represented_brand_id,product_slug,product_name,gtin,package_kind,packets_per_package,units_per_package,unit_name_plural,package_cbm,package_kg,stackable,notes'

/** Read a product's packing profile (by brand + product slug) for editor prefill.
 * RLS read (any RB role); returns null when none has been authored yet. */
export async function getRbPackingProfile(brandId: string, productSlug: string): Promise<ActionResult<RbPackingProfileRow | null>> {
  const gate = await requireUser()
  if (!gate.ok) return gate.error
  const brandParsed = uuidSchema.safeParse(brandId)
  if (!brandParsed.success) return fail('VALIDATION', 'Marca inválida / Invalid brand')
  const slugParsed = z.string().min(1).safeParse(productSlug)
  if (!slugParsed.success) return fail('VALIDATION', 'Slug inválido / Invalid slug')

  const { data, error } = await gate.supabase
    .from('rb_packing_profiles')
    .select(PACKING_SELECT)
    .eq('represented_brand_id', brandParsed.data)
    .eq('product_slug', slugParsed.data)
    .maybeSingle()
  if (error) return fail('VALIDATION', 'No se pudo leer el perfil de empaque / Could not read packing profile')
  return ok(data ? mapRbPackingProfileRow(data as unknown as RawRbPackingProfileRow) : null)
}

/** Create or update the packing profile a product's ALLOCATION math depends on.
 * RLS (rb_profiles_ins/upd) confines the write to a brand the caller manages/ops. */
export async function upsertRbPackingProfile(
  brandId: string,
  input: RbPackingProfileInput,
): Promise<ActionResult<RbPackingProfileRow>> {
  const gate = await requireUser()
  if (!gate.ok) return gate.error
  const brandParsed = uuidSchema.safeParse(brandId)
  if (!brandParsed.success) return fail('VALIDATION', 'Marca inválida / Invalid brand')
  const parsed = packingProfileInputSchema.safeParse(input)
  if (!parsed.success) return fail('VALIDATION', 'Datos inválidos / Invalid data', parsed.error.flatten().fieldErrors)

  const payload = {
    represented_brand_id: brandParsed.data,
    product_slug: parsed.data.productSlug,
    product_name: parsed.data.productName,
    gtin: parsed.data.gtin ?? null,
    package_kind: parsed.data.packageKind,
    packets_per_package: parsed.data.packetsPerPackage,
    units_per_package: parsed.data.unitsPerPackage,
    unit_name_plural: parsed.data.unitNamePlural,
    package_cbm: parsed.data.packageCbm,
    package_kg: parsed.data.packageKg,
    stackable: parsed.data.stackable,
    notes: parsed.data.notes ?? null,
  }

  const { data, error } = await gate.supabase
    .from('rb_packing_profiles')
    .upsert(payload, { onConflict: 'product_slug' })
    .select(PACKING_SELECT)
    .single()
  if (error) {
    if (error.code === '23505') {
      return fail('VALIDATION', 'Ese slug de producto ya pertenece a otra marca / That product slug already belongs to another brand', {
        productSlug: ['duplicate'],
      })
    }
    return fail('FORBIDDEN_LANE', 'No se pudo guardar el perfil de empaque / Could not save packing profile')
  }
  return ok(mapRbPackingProfileRow(data as unknown as RawRbPackingProfileRow))
}
