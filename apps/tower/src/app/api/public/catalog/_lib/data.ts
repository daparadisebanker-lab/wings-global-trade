// _lib/data.ts
// Server-only reads backing the public catalog endpoints (API_MAP
// `GET /api/public/catalog/{brand}/{lane}`; CLAUDE.md Directive 5 "the public
// site is a read model"). These serve `tower.product_versions` snapshots of
// PUBLISHED products ONLY — the `status = 'PUBLISHED'` filter below is the one
// line standing between this endpoint and leaking DRAFT/IN_REVIEW content.
//
// Uses the service-role client deliberately: the caller is an anonymous public
// site visitor with no `lane_memberships` row, so the RLS policies in
// DATABASE_SCHEMA.sql (scoped to internal staff) would return nothing. The
// service key is only ever used server-side, inside this route tree, and never
// serialized back to the client — only the shaped snapshot is.
import { createServiceClient } from '@/lib/supabase/server'

// The service client defaults to the `public` schema; TOWER tables live in `tower`.
type TowerDb = ReturnType<NonNullable<ReturnType<typeof createServiceClient>>['schema']>
import { encodeCursor, type CatalogCursor } from './pagination'

export interface CatalogSnapshot {
  productId: string
  slug: string
  version: number
  publishedAt: string | null
  snapshot: Record<string, unknown>
}

export interface CatalogListResult {
  items: CatalogSnapshot[]
  nextCursor: string | null
}

/** Distinguishes "nothing there" (→ 404) from "backend problem" (→ 500). */
export type CatalogLookupError = 'BRAND_NOT_FOUND' | 'LANE_NOT_FOUND' | 'PRODUCT_NOT_FOUND' | 'UNAVAILABLE'

export type CatalogListOutcome =
  | { ok: true; data: CatalogListResult }
  | { ok: false; error: CatalogLookupError }

export type CatalogItemOutcome = { ok: true; data: CatalogSnapshot } | { ok: false; error: CatalogLookupError }

interface ProductRow {
  id: string
  slug: string
  updated_at: string
}

interface VersionRow {
  product_id: string
  version: number
  snapshot: Record<string, unknown>
  published_at: string | null
}

/** Resolves brand slug → id, then lane slug (scoped to that brand) → id. */
async function resolveBrandAndLane(
  supabase: TowerDb,
  brandSlug: string,
  laneSlug: string,
): Promise<{ ok: true; brandId: string; laneId: string } | { ok: false; error: CatalogLookupError }> {
  const brand = await supabase.from('brands').select('id').eq('slug', brandSlug).maybeSingle()
  if (brand.error) return { ok: false, error: 'UNAVAILABLE' }
  if (!brand.data) return { ok: false, error: 'BRAND_NOT_FOUND' }

  const lane = await supabase
    .from('lanes')
    .select('id')
    .eq('brand_id', brand.data.id)
    .eq('slug', laneSlug)
    .maybeSingle()
  if (lane.error) return { ok: false, error: 'UNAVAILABLE' }
  if (!lane.data) return { ok: false, error: 'LANE_NOT_FOUND' }

  return { ok: true, brandId: brand.data.id as string, laneId: lane.data.id as string }
}

/** Latest `product_versions` row per product id (highest `version` wins). */
async function latestVersionsByProductId(
  supabase: TowerDb,
  productIds: string[],
): Promise<Map<string, VersionRow> | null> {
  if (productIds.length === 0) return new Map()

  const { data, error } = await supabase
    .from('product_versions')
    .select('product_id, version, snapshot, published_at')
    .in('product_id', productIds)
    .order('version', { ascending: false })
  if (error) return null

  const latest = new Map<string, VersionRow>()
  for (const row of (data ?? []) as VersionRow[]) {
    const existing = latest.get(row.product_id)
    if (!existing || row.version > existing.version) latest.set(row.product_id, row)
  }
  return latest
}

export async function listPublishedProducts(params: {
  brandSlug: string
  laneSlug: string
  limit: number
  cursor: CatalogCursor | null
}): Promise<CatalogListOutcome> {
  const client = createServiceClient()
  if (!client) return { ok: false, error: 'UNAVAILABLE' }
  const supabase = client.schema('tower')

  const resolved = await resolveBrandAndLane(supabase, params.brandSlug, params.laneSlug)
  if (!resolved.ok) return resolved

  // Build the filter chain first (`.or` is a filter-builder method, unavailable
  // once `.order`/`.limit` narrow the chain to a transform builder) — the
  // keyset cursor predicate applies before ordering/limiting is attached.
  let filterQuery = supabase
    .from('products')
    .select('id, slug, updated_at')
    .eq('brand_id', resolved.brandId)
    .eq('lane_id', resolved.laneId)
    .eq('status', 'PUBLISHED')

  if (params.cursor) {
    // Keyset predicate: strictly "after" the cursor in (updated_at desc, id desc).
    filterQuery = filterQuery.or(
      `updated_at.lt.${params.cursor.updatedAt},and(updated_at.eq.${params.cursor.updatedAt},id.lt.${params.cursor.id})`,
    )
  }

  const { data, error } = await filterQuery
    .order('updated_at', { ascending: false })
    .order('id', { ascending: false })
    .limit(params.limit + 1)
  if (error) return { ok: false, error: 'UNAVAILABLE' }

  const rows = (data ?? []) as ProductRow[]
  const hasMore = rows.length > params.limit
  const page = hasMore ? rows.slice(0, params.limit) : rows

  const nextCursor =
    hasMore && page.length > 0
      ? encodeCursor({ updatedAt: page[page.length - 1].updated_at, id: page[page.length - 1].id })
      : null

  if (page.length === 0) return { ok: true, data: { items: [], nextCursor: null } }

  const versions = await latestVersionsByProductId(
    supabase,
    page.map((p) => p.id),
  )
  if (versions === null) return { ok: false, error: 'UNAVAILABLE' }

  // A PUBLISHED product with no snapshot row would be a publish-flow bug, not a
  // client error — drop it rather than fail the whole page.
  const items: CatalogSnapshot[] = page.flatMap((p) => {
    const v = versions.get(p.id)
    if (!v) return []
    return [{ productId: p.id, slug: p.slug, version: v.version, publishedAt: v.published_at, snapshot: v.snapshot }]
  })

  return { ok: true, data: { items, nextCursor } }
}

export async function getPublishedProductBySlug(params: {
  brandSlug: string
  laneSlug: string
  productSlug: string
}): Promise<CatalogItemOutcome> {
  const client = createServiceClient()
  if (!client) return { ok: false, error: 'UNAVAILABLE' }
  const supabase = client.schema('tower')

  const resolved = await resolveBrandAndLane(supabase, params.brandSlug, params.laneSlug)
  if (!resolved.ok) return resolved

  const product = await supabase
    .from('products')
    .select('id, slug')
    .eq('brand_id', resolved.brandId)
    .eq('lane_id', resolved.laneId)
    .eq('slug', params.productSlug)
    .eq('status', 'PUBLISHED')
    .maybeSingle()
  if (product.error) return { ok: false, error: 'UNAVAILABLE' }
  if (!product.data) return { ok: false, error: 'PRODUCT_NOT_FOUND' }

  const version = await supabase
    .from('product_versions')
    .select('version, snapshot, published_at')
    .eq('product_id', product.data.id)
    .order('version', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (version.error) return { ok: false, error: 'UNAVAILABLE' }
  if (!version.data) return { ok: false, error: 'PRODUCT_NOT_FOUND' }

  return {
    ok: true,
    data: {
      productId: product.data.id as string,
      slug: product.data.slug as string,
      version: version.data.version as number,
      publishedAt: version.data.published_at as string | null,
      snapshot: version.data.snapshot as Record<string, unknown>,
    },
  }
}
