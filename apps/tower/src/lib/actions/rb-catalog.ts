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
import { createServerSupabase } from '@/lib/supabase/server'
import { fail, ok, type ActionResult } from './result'
import { localizedSchema, type Localized } from '@/lib/archetypes'
import { SPEC_ZOD_DEFAULTS } from '@/lib/schemas/spec'
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
import { computeRbProductCapabilities } from './rb-catalog-logic'
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
 * The R14 cross-guard (refuse while the profile appears in a live template/
 * container composition) lands with the container lifecycle in Wave 3; the base
 * retire transition is here. */
export async function retireRbProduct(id: string): Promise<ActionResult<RbProductRow>> {
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
  if (!statusCanRetire((current as { status: string }).status as ProductStatus)) {
    return fail('VALIDATION', 'Solo un producto publicado puede retirarse / Only a published product can be retired')
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
