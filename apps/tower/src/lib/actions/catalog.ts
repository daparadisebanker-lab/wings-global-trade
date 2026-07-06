'use server'

// src/lib/actions/catalog.ts
// Catalog Studio (PIM) mutations — API_MAP "Catalog" domain. Every action
// follows the mutation law: auth → Zod parse → RLS-scoped query (result.ts).
// RLS (tower.products policies) is the only permission boundary; this file
// never gates with `if (role === …)` — see catalog-logic.ts#computeCapabilities
// for the presentation-only capability derivation PublishBar reads.
import { z } from 'zod'
import { createServerSupabase } from '@/lib/supabase/server'
import { fail, ok, type ActionResult } from './result'
import { localizedSchema, type Archetype, type Localized } from '@/lib/archetypes'
import { triggerRevalidate } from '@/lib/revalidate'
import {
  applyRollbackSnapshot,
  buildVersionSnapshot,
  canEditStatus,
  canPublish as statusCanPublish,
  canRetire as statusCanRetire,
  canRollback as statusCanRollback,
  canSubmitForReview as statusCanSubmitForReview,
  computeCapabilities,
  decodeCursor,
  encodeCursor,
  isCompleteForPublish,
  nextVersionNumber,
  type DbLaneRole,
  type ProductCapabilities,
  type ProductSnapshot,
  type ProductStatus,
} from './catalog-logic'

const uuidSchema = z.string().uuid()

// ── Row shapes ───────────────────────────────────────────────────────────────

export interface ProductRow {
  id: string
  brandId: string
  laneId: string
  laneSlug: string
  laneArchetype: Archetype
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

export interface ProductVersionRow {
  id: string
  productId: string
  version: number
  snapshot: ProductSnapshot
  publishedBy: string | null
  publishedAt: string
}

export interface EditableLane {
  laneId: string
  laneCode: string
  laneSlug: string
  laneName: string
  archetype: Archetype
  brandId: string
}

export interface ProductListPage {
  rows: ProductRow[]
  nextCursor: string | null
}

const SELECT_COLS =
  'id,brand_id,lane_id,slug,status,category_path,name,specs,spec_schema_id,hs_code,moq,cbm_per_unit,created_by,updated_at,lanes(slug,archetype)'

interface RawLaneJoin {
  slug: string
  archetype: string
}

interface RawProductRow {
  id: string
  brand_id: string
  lane_id: string
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
  lanes: RawLaneJoin | RawLaneJoin[] | null
}

function toNumberOrNull(v: number | string | null | undefined): number | null {
  if (v === null || v === undefined) return null
  const n = typeof v === 'string' ? Number(v) : v
  return Number.isFinite(n) ? n : null
}

function mapProductRow(row: RawProductRow): ProductRow {
  const laneJoin = Array.isArray(row.lanes) ? row.lanes[0] : row.lanes
  return {
    id: row.id,
    brandId: row.brand_id,
    laneId: row.lane_id,
    laneSlug: laneJoin?.slug ?? '',
    laneArchetype: (laneJoin?.archetype as Archetype) ?? 'EQUIPMENT',
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

function mapVersionRow(row: {
  id: string
  product_id: string
  version: number
  snapshot: unknown
  published_by: string | null
  published_at: string
}): ProductVersionRow {
  return {
    id: row.id,
    productId: row.product_id,
    version: row.version,
    snapshot: row.snapshot as ProductSnapshot,
    publishedBy: row.published_by,
    publishedAt: row.published_at,
  }
}

function mapLaneRow(row: {
  id: string
  code: string
  slug: string
  name: string
  archetype: string
  brand_id: string
}): EditableLane {
  return {
    laneId: row.id,
    laneCode: row.code,
    laneSlug: row.slug,
    laneName: row.name,
    archetype: row.archetype as Archetype,
    brandId: row.brand_id,
  }
}

function slugify(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // strip combining diacritics after NFD split
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

/** Strip characters that would break a PostgREST `.or()` filter string
 * (commas/parens are the filter grammar's delimiters). Internal search box
 * input only — never used for anything security-relevant since RLS is the
 * real boundary. */
function sanitizeSearchTerm(term: string): string {
  return term.replace(/[,()]/g, ' ').trim()
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
  specSchemaId: z.string().uuid().nullable().optional(),
  hsCode: z.string().trim().min(1).nullable().optional(),
  moq: z.number().nonnegative().nullable().optional(),
  cbmPerUnit: z.number().nonnegative().nullable().optional(),
})

const productPatchSchema = productInputSchema.partial()

const listProductsInputSchema = z.object({
  laneId: z.string().uuid().optional(),
  status: z.enum(['DRAFT', 'IN_REVIEW', 'PUBLISHED', 'RETIRED']).optional(),
  search: z.string().trim().min(1).max(120).optional(),
  cursor: z.string().nullish(),
  limit: z.number().int().min(1).max(200).default(50),
})

export type ProductInput = z.input<typeof productInputSchema>
export type ProductPatch = z.input<typeof productPatchSchema>
export type ListProductsInput = z.input<typeof listProductsInputSchema>

// ── Auth helper ──────────────────────────────────────────────────────────────

async function requireUser() {
  const supabase = await createServerSupabase()
  if (!supabase) return { ok: false, error: fail('UNAUTHORIZED', 'Auth no configurado / Auth not configured') } as const
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: fail('UNAUTHORIZED', 'Sesión requerida / Session required') } as const
  return { ok: true, supabase: supabase.schema('tower'), user } as const
}

// ── Reads ────────────────────────────────────────────────────────────────────

export async function listProducts(input: ListProductsInput): Promise<ActionResult<ProductListPage>> {
  const gate = await requireUser()
  if (!gate.ok) return gate.error
  const { supabase } = gate

  const parsed = listProductsInputSchema.safeParse(input)
  if (!parsed.success) {
    return fail('VALIDATION', 'Filtros inválidos / Invalid filters', parsed.error.flatten().fieldErrors)
  }
  const { laneId, status, search, limit } = parsed.data
  const cursor = decodeCursor(parsed.data.cursor)

  let query = supabase
    .from('products')
    .select(SELECT_COLS)
    .order('updated_at', { ascending: false })
    .order('id', { ascending: false })
    .limit(limit + 1)

  if (laneId) query = query.eq('lane_id', laneId)
  if (status) query = query.eq('status', status)
  if (search) {
    const term = sanitizeSearchTerm(search)
    if (term) query = query.or(`name->>es.ilike.%${term}%,name->>en.ilike.%${term}%`)
  }
  if (cursor) {
    query = query.or(`updated_at.lt.${cursor.updatedAt},and(updated_at.eq.${cursor.updatedAt},id.lt.${cursor.id})`)
  }

  const { data, error } = await query
  if (error) return fail('VALIDATION', 'No se pudo listar el catálogo / Could not list catalog')

  const rows = ((data ?? []) as unknown as RawProductRow[]).map(mapProductRow)
  const hasMore = rows.length > limit
  const page = hasMore ? rows.slice(0, limit) : rows
  const last = page[page.length - 1]
  const nextCursor = hasMore && last ? encodeCursor({ updatedAt: last.updatedAt, id: last.id }) : null

  return ok({ rows: page, nextCursor })
}

export async function getProduct(id: string): Promise<ActionResult<ProductRow>> {
  const gate = await requireUser()
  if (!gate.ok) return gate.error
  const { supabase } = gate

  const parsed = uuidSchema.safeParse(id)
  if (!parsed.success) return fail('VALIDATION', 'ID inválido / Invalid id')

  const { data, error } = await supabase.from('products').select(SELECT_COLS).eq('id', parsed.data).maybeSingle()
  if (error) return fail('VALIDATION', 'No se pudo leer el producto / Could not read product')
  if (!data) return fail('FORBIDDEN_LANE', 'Producto no encontrado o sin acceso / Product not found or no access')

  return ok(mapProductRow(data as unknown as RawProductRow))
}

export async function getProductVersions(productId: string): Promise<ActionResult<ProductVersionRow[]>> {
  const gate = await requireUser()
  if (!gate.ok) return gate.error
  const { supabase } = gate

  const parsed = uuidSchema.safeParse(productId)
  if (!parsed.success) return fail('VALIDATION', 'ID inválido / Invalid id')

  const { data, error } = await supabase
    .from('product_versions')
    .select('id,product_id,version,snapshot,published_by,published_at')
    .eq('product_id', parsed.data)
    .order('version', { ascending: false })

  if (error) return fail('VALIDATION', 'No se pudo leer el historial / Could not read version history')

  return ok((data ?? []).map(mapVersionRow))
}

export async function getLaneCapabilities(laneId: string): Promise<ActionResult<ProductCapabilities>> {
  const gate = await requireUser()
  if (!gate.ok) return gate.error
  const { supabase, user } = gate

  const parsed = uuidSchema.safeParse(laneId)
  if (!parsed.success) return fail('VALIDATION', 'Lane inválida / Invalid lane')

  const [{ data: profile }, { data: memberships, error }] = await Promise.all([
    supabase.from('profiles').select('is_group_admin').eq('id', user.id).maybeSingle(),
    supabase.from('lane_memberships').select('role').eq('user_id', user.id).eq('lane_id', parsed.data),
  ])
  if (error) return fail('VALIDATION', 'No se pudo resolver permisos / Could not resolve permissions')

  const roles = (memberships ?? []).map((m) => m.role as DbLaneRole)
  const isGroupAdmin = Boolean((profile as { is_group_admin?: boolean } | null)?.is_group_admin)

  return ok(computeCapabilities(roles, isGroupAdmin))
}

export async function listEditableLanes(): Promise<ActionResult<EditableLane[]>> {
  const gate = await requireUser()
  if (!gate.ok) return gate.error
  const { supabase, user } = gate

  const { data: profile } = await supabase.from('profiles').select('is_group_admin').eq('id', user.id).maybeSingle()

  if ((profile as { is_group_admin?: boolean } | null)?.is_group_admin) {
    const { data, error } = await supabase
      .from('lanes')
      .select('id,code,slug,name,archetype,brand_id')
      .neq('status', 'ARCHIVED')
    if (error) return fail('VALIDATION', 'No se pudieron listar las lanes / Could not list lanes')
    return ok((data ?? []).map(mapLaneRow))
  }

  const { data, error } = await supabase
    .from('lane_memberships')
    .select('role, lanes(id,code,slug,name,archetype,brand_id)')
    .eq('user_id', user.id)
    .in('role', ['LANE_DIRECTOR', 'CATALOG_EDITOR'])

  if (error) return fail('VALIDATION', 'No se pudieron listar las lanes / Could not list lanes')

  const rows = (data ?? []) as unknown as {
    lanes: { id: string; code: string; slug: string; name: string; archetype: string; brand_id: string } | null
  }[]
  const byLaneId = new Map<string, EditableLane>()
  for (const row of rows) {
    if (!row.lanes) continue
    const lane = mapLaneRow(row.lanes)
    byLaneId.set(lane.laneId, lane)
  }
  return ok([...byLaneId.values()])
}

// ── Mutations ────────────────────────────────────────────────────────────────

export async function createProduct(laneId: string, input: ProductInput): Promise<ActionResult<ProductRow>> {
  const gate = await requireUser()
  if (!gate.ok) return gate.error
  const { supabase, user } = gate

  const laneParsed = uuidSchema.safeParse(laneId)
  if (!laneParsed.success) return fail('VALIDATION', 'Lane inválida / Invalid lane')

  const parsed = productInputSchema.safeParse(input)
  if (!parsed.success) {
    return fail('VALIDATION', 'Datos inválidos / Invalid data', parsed.error.flatten().fieldErrors)
  }

  const { data: lane, error: laneError } = await supabase
    .from('lanes')
    .select('id,brand_id')
    .eq('id', laneParsed.data)
    .maybeSingle()
  if (laneError) return fail('VALIDATION', 'No se pudo leer la lane / Could not read lane')
  if (!lane) return fail('FORBIDDEN_LANE', 'Lane no encontrada o sin acceso / Lane not found or no access')

  const slug = parsed.data.slug || slugify(parsed.data.name.en || parsed.data.name.es)
  if (!slug) return fail('VALIDATION', 'No se pudo derivar el slug / Could not derive a slug from the name')

  const laneRow = lane as { id: string; brand_id: string }

  const { data, error } = await supabase
    .from('products')
    .insert({
      brand_id: laneRow.brand_id,
      lane_id: laneRow.id,
      slug,
      category_path: parsed.data.categoryPath,
      name: parsed.data.name,
      specs: parsed.data.specs,
      spec_schema_id: parsed.data.specSchemaId ?? null,
      hs_code: parsed.data.hsCode ?? null,
      moq: parsed.data.moq ?? null,
      cbm_per_unit: parsed.data.cbmPerUnit ?? null,
      created_by: user.id,
    })
    .select(SELECT_COLS)
    .single()

  if (error) {
    if (error.code === '23505') {
      return fail('VALIDATION', 'Ya existe un producto con ese slug en la lane / Slug already used in this lane', {
        slug: ['duplicate'],
      })
    }
    return fail('FORBIDDEN_LANE', 'No se pudo crear el producto / Could not create product')
  }

  return ok(mapProductRow(data as unknown as RawProductRow))
}

export async function updateProduct(id: string, patch: ProductPatch): Promise<ActionResult<ProductRow>> {
  const gate = await requireUser()
  if (!gate.ok) return gate.error
  const { supabase } = gate

  const idParsed = uuidSchema.safeParse(id)
  if (!idParsed.success) return fail('VALIDATION', 'ID inválido / Invalid id')

  const parsed = productPatchSchema.safeParse(patch)
  if (!parsed.success) {
    return fail('VALIDATION', 'Datos inválidos / Invalid data', parsed.error.flatten().fieldErrors)
  }

  const { data: current, error: currentError } = await supabase
    .from('products')
    .select('status')
    .eq('id', idParsed.data)
    .maybeSingle()
  if (currentError) return fail('VALIDATION', 'No se pudo leer el producto / Could not read product')
  if (!current) return fail('FORBIDDEN_LANE', 'Producto no encontrado o sin acceso / Product not found or no access')
  if (!canEditStatus((current as { status: string }).status as ProductStatus)) {
    return fail(
      'VALIDATION',
      'Solo se puede editar en borrador o en revisión / Only editable while DRAFT or IN_REVIEW',
    )
  }

  const payload: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (parsed.data.slug !== undefined) payload.slug = parsed.data.slug
  if (parsed.data.name !== undefined) payload.name = parsed.data.name
  if (parsed.data.categoryPath !== undefined) payload.category_path = parsed.data.categoryPath
  if (parsed.data.specs !== undefined) payload.specs = parsed.data.specs
  if (parsed.data.specSchemaId !== undefined) payload.spec_schema_id = parsed.data.specSchemaId
  if (parsed.data.hsCode !== undefined) payload.hs_code = parsed.data.hsCode
  if (parsed.data.moq !== undefined) payload.moq = parsed.data.moq
  if (parsed.data.cbmPerUnit !== undefined) payload.cbm_per_unit = parsed.data.cbmPerUnit

  const { data, error } = await supabase
    .from('products')
    .update(payload)
    .eq('id', idParsed.data)
    .select(SELECT_COLS)
    .single()

  if (error) return fail('FORBIDDEN_LANE', 'No se pudo actualizar el producto / Could not update product')

  return ok(mapProductRow(data as unknown as RawProductRow))
}

export async function submitForReview(id: string): Promise<ActionResult<ProductRow>> {
  const gate = await requireUser()
  if (!gate.ok) return gate.error
  const { supabase } = gate

  const idParsed = uuidSchema.safeParse(id)
  if (!idParsed.success) return fail('VALIDATION', 'ID inválido / Invalid id')

  const { data: current, error: currentError } = await supabase
    .from('products')
    .select('status')
    .eq('id', idParsed.data)
    .maybeSingle()
  if (currentError) return fail('VALIDATION', 'No se pudo leer el producto / Could not read product')
  if (!current) return fail('FORBIDDEN_LANE', 'Producto no encontrado o sin acceso / Product not found or no access')
  if (!statusCanSubmitForReview((current as { status: string }).status as ProductStatus)) {
    return fail('VALIDATION', 'Solo un borrador puede enviarse a revisión / Only a draft can be submitted for review')
  }

  const { data, error } = await supabase
    .from('products')
    .update({ status: 'IN_REVIEW', updated_at: new Date().toISOString() })
    .eq('id', idParsed.data)
    .select(SELECT_COLS)
    .single()

  if (error) return fail('FORBIDDEN_LANE', 'No se pudo enviar a revisión / Could not submit for review')

  return ok(mapProductRow(data as unknown as RawProductRow))
}

export async function publishProduct(id: string): Promise<ActionResult<{ product: ProductRow; version: number }>> {
  const gate = await requireUser()
  if (!gate.ok) return gate.error
  const { supabase, user } = gate

  const idParsed = uuidSchema.safeParse(id)
  if (!idParsed.success) return fail('VALIDATION', 'ID inválido / Invalid id')

  const { data: current, error: currentError } = await supabase
    .from('products')
    .select(SELECT_COLS)
    .eq('id', idParsed.data)
    .maybeSingle()
  if (currentError) return fail('VALIDATION', 'No se pudo leer el producto / Could not read product')
  if (!current) return fail('FORBIDDEN_LANE', 'Producto no encontrado o sin acceso / Product not found or no access')

  const product = mapProductRow(current as unknown as RawProductRow)
  if (!statusCanPublish(product.status)) {
    return fail('VALIDATION', 'Transición de estado inválida para publicar / Invalid status transition to publish')
  }
  if (!isCompleteForPublish(product)) {
    return fail(
      'VALIDATION',
      'Nombre (ES/EN) y categoría son obligatorios para publicar / Name (ES/EN) and category are required to publish',
    )
  }

  // The gated write happens first: only a Lane Director may set PUBLISHED
  // (products_update RLS policy). If this fails, no version row is written.
  const { data: updated, error: updateError } = await supabase
    .from('products')
    .update({ status: 'PUBLISHED', updated_at: new Date().toISOString() })
    .eq('id', idParsed.data)
    .select(SELECT_COLS)
    .single()

  if (updateError) {
    return fail('FORBIDDEN_LANE', 'Solo el Lane Director puede publicar / Only the Lane Director can publish')
  }

  const updatedProduct = mapProductRow(updated as unknown as RawProductRow)

  const { data: versions, error: versionsError } = await supabase
    .from('product_versions')
    .select('version')
    .eq('product_id', idParsed.data)
  if (versionsError) return fail('VALIDATION', 'No se pudo leer el historial de versiones / Could not read version history')

  const version = nextVersionNumber(versions ?? [])
  const snapshot = buildVersionSnapshot(updatedProduct)

  const { error: insertError } = await supabase
    .from('product_versions')
    .insert({ product_id: idParsed.data, version, snapshot, published_by: user.id })
  if (insertError) {
    return fail('VALIDATION', 'No se pudo registrar la versión publicada / Could not record the published version')
  }

  await triggerRevalidate({ laneSlug: updatedProduct.laneSlug, productSlug: updatedProduct.slug })

  return ok({ product: updatedProduct, version })
}

export async function retireProduct(id: string): Promise<ActionResult<ProductRow>> {
  const gate = await requireUser()
  if (!gate.ok) return gate.error
  const { supabase } = gate

  const idParsed = uuidSchema.safeParse(id)
  if (!idParsed.success) return fail('VALIDATION', 'ID inválido / Invalid id')

  const { data: current, error: currentError } = await supabase
    .from('products')
    .select('status')
    .eq('id', idParsed.data)
    .maybeSingle()
  if (currentError) return fail('VALIDATION', 'No se pudo leer el producto / Could not read product')
  if (!current) return fail('FORBIDDEN_LANE', 'Producto no encontrado o sin acceso / Product not found or no access')
  if (!statusCanRetire((current as { status: string }).status as ProductStatus)) {
    return fail('VALIDATION', 'Solo un producto publicado puede retirarse / Only a published product can be retired')
  }

  const { data, error } = await supabase
    .from('products')
    .update({ status: 'RETIRED', updated_at: new Date().toISOString() })
    .eq('id', idParsed.data)
    .select(SELECT_COLS)
    .single()

  if (error) return fail('FORBIDDEN_LANE', 'Solo el Lane Director puede retirar / Only the Lane Director can retire')

  const product = mapProductRow(data as unknown as RawProductRow)
  await triggerRevalidate({ laneSlug: product.laneSlug, productSlug: product.slug })

  return ok(product)
}

export async function rollbackProduct(
  id: string,
  version: number,
): Promise<ActionResult<{ product: ProductRow; version: number }>> {
  const gate = await requireUser()
  if (!gate.ok) return gate.error
  const { supabase, user } = gate

  const inputParsed = z.object({ id: uuidSchema, version: z.number().int().positive() }).safeParse({ id, version })
  if (!inputParsed.success) return fail('VALIDATION', 'Datos inválidos / Invalid data')

  const { data: current, error: currentError } = await supabase
    .from('products')
    .select(SELECT_COLS)
    .eq('id', inputParsed.data.id)
    .maybeSingle()
  if (currentError) return fail('VALIDATION', 'No se pudo leer el producto / Could not read product')
  if (!current) return fail('FORBIDDEN_LANE', 'Producto no encontrado o sin acceso / Product not found or no access')

  const product = mapProductRow(current as unknown as RawProductRow)
  if (!statusCanRollback(product.status)) {
    return fail(
      'VALIDATION',
      'Solo un producto publicado o retirado puede revertirse / Only a published or retired product can be rolled back',
    )
  }

  const { data: versionRow, error: versionError } = await supabase
    .from('product_versions')
    .select('version,snapshot')
    .eq('product_id', inputParsed.data.id)
    .eq('version', inputParsed.data.version)
    .maybeSingle()
  if (versionError) return fail('VALIDATION', 'No se pudo leer la versión / Could not read version')
  if (!versionRow) return fail('VALIDATION', 'Versión no encontrada / Version not found')

  const restored = applyRollbackSnapshot((versionRow as { snapshot: unknown }).snapshot as ProductSnapshot)

  // The gated write: only a Lane Director may set status back to PUBLISHED.
  const { data: updated, error: updateError } = await supabase
    .from('products')
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
      updated_at: new Date().toISOString(),
    })
    .eq('id', inputParsed.data.id)
    .select(SELECT_COLS)
    .single()

  if (updateError) {
    return fail('FORBIDDEN_LANE', 'Solo el Lane Director puede revertir / Only the Lane Director can roll back')
  }

  const updatedProduct = mapProductRow(updated as unknown as RawProductRow)

  const { data: versions, error: versionsError } = await supabase
    .from('product_versions')
    .select('version')
    .eq('product_id', inputParsed.data.id)
  if (versionsError) {
    return fail('VALIDATION', 'No se pudo leer el historial de versiones / Could not read version history')
  }

  const nextVersion = nextVersionNumber(versions ?? [])

  const { error: insertError } = await supabase.from('product_versions').insert({
    product_id: inputParsed.data.id,
    version: nextVersion,
    snapshot: buildVersionSnapshot(restored),
    published_by: user.id,
  })
  if (insertError) {
    return fail('VALIDATION', 'No se pudo registrar la versión revertida / Could not record the rolled-back version')
  }

  await triggerRevalidate({ laneSlug: updatedProduct.laneSlug, productSlug: updatedProduct.slug })

  return ok({ product: updatedProduct, version: nextVersion })
}
