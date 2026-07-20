// src/lib/catalog-data.ts
// Read-side catalog access. Uses Supabase when configured, otherwise falls
// back to the local seed fixture so the app renders without a live database.

import type { Category, Product, Subcategory } from '@/types/database'
import { createServiceClient } from '@/lib/supabase/server'
import seed from '@/data/seed.json'

const seedCategories = seed.categories as unknown as Category[]
const seedProducts = seed.products as unknown as Product[]

export async function getCategories(): Promise<Category[]> {
  const supabase = createServiceClient()
  if (!supabase) {
    return [...seedCategories].sort((a, b) => a.sort_order - b.sort_order)
  }
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  if (error || !data) {
    console.error('[catalog-data] getCategories', error)
    return [...seedCategories].sort((a, b) => a.sort_order - b.sort_order)
  }
  return data as Category[]
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const categories = await getCategories()
  return categories.find((c) => c.slug === slug) ?? null
}

/**
 * Fetch subcategories for a given category slug.
 * Queries the `subcategories` table joined by category_id.
 * Returns an empty array if the table does not exist or Supabase is not configured.
 */
export async function getSubcategories(categorySlug: string): Promise<Subcategory[]> {
  const supabase = createServiceClient()
  if (!supabase) return []

  const cat = await getCategoryBySlug(categorySlug)
  if (!cat) return []

  const { data, error } = await supabase
    .from('subcategories')
    .select('*')
    .eq('category_id', cat.id)
    .order('sort_order', { ascending: true })

  if (error) {
    // Subcategories table may not exist yet — degrade gracefully.
    console.warn('[catalog-data] getSubcategories', error.message)
    return []
  }
  return (data ?? []) as Subcategory[]
}

/**
 * Fetch every subcategory across all categories in one query. Used by the
 * mega-menu to derive its columns from live data (no hardcoded links).
 * Returns [] when Supabase is not configured or the table is absent.
 */
export async function getAllSubcategories(): Promise<Subcategory[]> {
  const supabase = createServiceClient()
  if (!supabase) return []

  const { data, error } = await supabase
    .from('subcategories')
    .select('*')
    .order('sort_order', { ascending: true })

  if (error) {
    console.warn('[catalog-data] getAllSubcategories', error.message)
    return []
  }
  return (data ?? []) as Subcategory[]
}

export interface ProductQuery {
  category?: string
  q?: string
  /** Subcategory slug filter — requires migration 0005 (subcategory_id column) */
  sub?: string
  /**
   * HP range bucket — e.g. "50-100" means hp >= 50 AND hp < 100.
   * Requires migration 0005 (filter_attrs JSONB column).
   */
  hp?: string
  /** Traction value filter — e.g. "4WD". Requires migration 0005. */
  traction?: string
  /** Transmission value filter. Requires migration 0005. */
  transmission?: string
  /** Brand value filter. Requires migration 0005. */
  brand?: string
  /** Fuel type — gasolina | diesel | gnc | electrico | multi. Migration 0009. */
  fuel?: string
  /** Payload/tonnage bucket — mini | ligero | mediano | pesado. Migration 0009. */
  payload?: string
  /** Usage type — carga | volteo | pasajeros. Migration 0009. */
  usage?: string
  limit?: number
  offset?: number
}

export async function getProducts(
  query: ProductQuery = {},
): Promise<{ products: Product[]; total: number; limit: number; offset: number }> {
  const limit = Math.min(query.limit ?? 20, 50)
  const offset = query.offset ?? 0
  const supabase = createServiceClient()

  if (!supabase) {
    return filterSeedProducts(query, limit, offset)
  }

  let categoryId: string | undefined
  if (query.category) {
    const cat = await getCategoryBySlug(query.category)
    if (!cat) return { products: [], total: 0, limit, offset }
    categoryId = cat.id
  }

  // Resolve subcategory id when sub slug is provided
  let subcategoryId: string | undefined
  if (query.sub && categoryId) {
    const { data: subData } = await supabase
      .from('subcategories')
      .select('id')
      .eq('slug', query.sub)
      .eq('category_id', categoryId)
      .maybeSingle()
    subcategoryId = (subData as { id: string } | null)?.id
  }

  let builder = supabase
    .from('products')
    .select('*', { count: 'exact' })
    .eq('is_active', true)

  if (categoryId) builder = builder.eq('category_id', categoryId)
  if (subcategoryId) builder = builder.eq('subcategory_id', subcategoryId)

  if (query.q) {
    builder = builder.textSearch('name_es', query.q.split(/\s+/).join(' & '), {
      type: 'plain',
      config: 'spanish',
    })
  }

  // --- filter_attrs JSONB filters (migration 0005) ---

  if (query.traction) {
    builder = builder.eq('filter_attrs->>traction', query.traction)
  }

  if (query.transmission) {
    builder = builder.eq('filter_attrs->>transmission', query.transmission)
  }

  if (query.brand) {
    builder = builder.eq('filter_attrs->>brand', query.brand)
  }

  if (query.fuel) {
    builder = builder.eq('filter_attrs->>fuel', query.fuel)
  }

  if (query.payload) {
    builder = builder.eq('filter_attrs->>payload', query.payload)
  }

  if (query.usage) {
    builder = builder.eq('filter_attrs->>usage', query.usage)
  }

  if (query.hp) {
    // Parse "min-max" bucket format. The JSONB text value is compared as string,
    // which works correctly for numeric string comparison when both sides are integers
    // of equal digit length. For robust comparison, use PostgREST cast syntax.
    const hpRange = parseHpRange(query.hp)
    if (hpRange) {
      // PostgREST filter syntax for JSONB text extraction with cast:
      // filter_attrs->>'hp' cast to int via gte/lte on the extracted text value.
      // Supabase JS client supports .filter() with raw PostgREST syntax for this.
      // ::int cast forces numeric comparison — string comparison breaks for
      // cross-digit-length values ("80" < "100" is false as text but true as int)
      builder = builder
        .filter('filter_attrs->>hp::int', 'gte', String(hpRange.min))
        .filter('filter_attrs->>hp::int', 'lt', String(hpRange.max))
    }
  }

  const { data, count, error } = await builder
    .order('sort_order', { ascending: true })
    .range(offset, offset + limit - 1)

  if (error || !data) {
    console.error('[catalog-data] getProducts', error)
    return filterSeedProducts(query, limit, offset)
  }

  return { products: data as Product[], total: count ?? data.length, limit, offset }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = createServiceClient()
  if (!supabase) {
    return seedProducts.find((p) => p.slug === slug) ?? null
  }
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle()

  if (error) {
    console.error('[catalog-data] getProductBySlug', error)
    return seedProducts.find((p) => p.slug === slug) ?? null
  }
  return (data as Product) ?? null
}

/**
 * Returns up to `limit` products in the same category, excluding the current
 * product. Ordered by sort_order ascending.
 *
 * Used for the "También podría interesarte" strip on product detail pages.
 */
export async function getRelatedProducts(
  productId: string,
  categoryId: string,
  limit = 4,
): Promise<Product[]> {
  const supabase = createServiceClient()

  if (!supabase) {
    return seedProducts
      .filter((p) => p.category_id === categoryId && p.id !== productId && p.is_active)
      .sort((a, b) => a.sort_order - b.sort_order)
      .slice(0, limit)
  }

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('category_id', categoryId)
    .eq('is_active', true)
    .neq('id', productId)
    .order('sort_order', { ascending: true })
    .limit(limit)

  if (error || !data) {
    console.error('[catalog-data] getRelatedProducts', error)
    return seedProducts
      .filter((p) => p.category_id === categoryId && p.id !== productId && p.is_active)
      .sort((a, b) => a.sort_order - b.sort_order)
      .slice(0, limit)
  }

  return data as Product[]
}

// ---------------------------------------------------------------------------
// HP buckets — matched to actual tractor HP distribution (50–140 HP)
// ---------------------------------------------------------------------------
export const HP_BUCKETS: { value: string; label: string; min: number; max: number }[] = [
  { value: '50-70',  label: '50–70 HP',  min: 50,  max: 70  },
  { value: '70-100', label: '70–100 HP', min: 70,  max: 100 },
  { value: '100-120',label: '100–120 HP',min: 100, max: 120 },
  { value: '120-200',label: '120+ HP',   min: 120, max: 200 },
]

// ---------------------------------------------------------------------------
// Product facets — computed server-side from the full unfiltered product list
// ---------------------------------------------------------------------------

export interface FacetOption {
  value: string
  label: string
  count: number
}

export interface ProductFacets {
  brand: FacetOption[]
  hp: FacetOption[]
  traction: FacetOption[]
  transmission: FacetOption[]
  fuel: FacetOption[]
  payload: FacetOption[]
  usage: FacetOption[]
}

export const FUEL_LABELS: Record<string, string> = {
  gasolina: 'Gasolina',
  diesel: 'Diésel',
  gnc: 'GNC',
  electrico: 'Eléctrico',
  hidrogeno: 'Hidrógeno',
  chasis: 'Chasis',
  multi: 'Multi-combustible',
}

export const PAYLOAD_ORDER = ['mini', 'ligero', 'mediano', 'pesado'] as const
export const PAYLOAD_LABELS: Record<string, string> = {
  mini: 'Mini (< 3.5T)',
  ligero: 'Ligero (3.5–7T)',
  mediano: 'Mediano (7–14T)',
  pesado: 'Pesado (14T+)',
}

export const USAGE_LABELS: Record<string, string> = {
  carga: 'Carga',
  volteo: 'Volteo',
  pasajeros: 'Pasajeros',
}

const FUEL_ORDER = ['gasolina', 'diesel', 'gnc', 'electrico', 'hidrogeno', 'chasis', 'multi'] as const

/**
 * Compute facets for a category from ALL products (ignoring hp/brand/traction/transmission filters).
 * Subcategory filter (sub) is preserved since it narrows the meaningful product set.
 * Called server-side; does not paginate — loads up to 200 products.
 */
export async function getProductFacets(
  categorySlug: string,
  sub?: string,
): Promise<ProductFacets> {
  const supabase = createServiceClient()
  let rows: { filter_attrs: Record<string, unknown> | null; specs: Record<string, unknown> | null }[] = []

  if (supabase) {
    const cat = await getCategoryBySlug(categorySlug)
    if (cat) {
      let q = supabase
        .from('products')
        .select('filter_attrs, specs')
        .eq('category_id', cat.id)
        .eq('is_active', true)

      if (sub) {
        const { data: subRow } = await supabase
          .from('subcategories')
          .select('id')
          .eq('slug', sub)
          .maybeSingle()
        if (subRow) q = q.eq('subcategory_id', (subRow as { id: string }).id)
      }

      const { data } = await q.limit(200)
      rows = (data ?? []) as typeof rows
    }
  } else {
    // Seed fallback
    const cat = seedCategories.find((c) => c.slug === categorySlug)
    rows = cat
      ? seedProducts
          .filter((p) => p.category_id === cat.id && p.is_active)
          .map((p) => ({ filter_attrs: (p as unknown as Record<string, unknown>).filter_attrs as Record<string, unknown> | null, specs: p.specs as Record<string, unknown> | null }))
      : []
  }

  const brandCounts: Record<string, number> = {}
  const hpBucketCounts: Record<string, number> = {}
  const tractionCounts: Record<string, number> = {}
  const transmissionCounts: Record<string, number> = {}
  const fuelCounts: Record<string, number> = {}
  const payloadCounts: Record<string, number> = {}
  const usageCounts: Record<string, number> = {}

  for (const row of rows) {
    const attrs = row.filter_attrs

    const brand =
      typeof attrs?.brand === 'string'
        ? attrs.brand
        : typeof row.specs?.['Marca'] === 'string'
          ? (row.specs['Marca'] as string)
          : null
    if (brand) brandCounts[brand] = (brandCounts[brand] ?? 0) + 1

    const hpVal = Number(attrs?.hp)
    if (!isNaN(hpVal) && hpVal > 0) {
      for (const bucket of HP_BUCKETS) {
        if (hpVal >= bucket.min && hpVal < bucket.max) {
          hpBucketCounts[bucket.value] = (hpBucketCounts[bucket.value] ?? 0) + 1
          break
        }
      }
    }

    if (typeof attrs?.traction === 'string') {
      const t = attrs.traction
      tractionCounts[t] = (tractionCounts[t] ?? 0) + 1
    }

    if (typeof attrs?.transmission === 'string') {
      const tr = attrs.transmission
      transmissionCounts[tr] = (transmissionCounts[tr] ?? 0) + 1
    }

    if (typeof attrs?.fuel === 'string') {
      const f = attrs.fuel
      fuelCounts[f] = (fuelCounts[f] ?? 0) + 1
    }

    if (typeof attrs?.payload === 'string') {
      const p = attrs.payload
      payloadCounts[p] = (payloadCounts[p] ?? 0) + 1
    }

    if (typeof attrs?.usage === 'string') {
      const u = attrs.usage
      usageCounts[u] = (usageCounts[u] ?? 0) + 1
    }
  }

  const TRACTION_LABELS: Record<string, string> = { '4wd': '4WD', '2wd': '2WD' }
  const TRANSMISSION_LABELS: Record<string, string> = {
    mechanical: 'Mecánica',
    syncro: 'Sincronizada',
    powershift: 'Powershift',
  }

  return {
    brand: Object.entries(brandCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([v, c]) => ({ value: v, label: v, count: c })),
    hp: HP_BUCKETS.filter((b) => (hpBucketCounts[b.value] ?? 0) > 0).map((b) => ({
      value: b.value,
      label: b.label,
      count: hpBucketCounts[b.value],
    })),
    traction: Object.entries(tractionCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([v, c]) => ({ value: v, label: TRACTION_LABELS[v] ?? v, count: c })),
    transmission: Object.entries(transmissionCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([v, c]) => ({ value: v, label: TRANSMISSION_LABELS[v] ?? v, count: c })),
    fuel: FUEL_ORDER.filter((f) => fuelCounts[f] > 0).map((f) => ({
      value: f,
      label: FUEL_LABELS[f] ?? f,
      count: fuelCounts[f],
    })),
    payload: PAYLOAD_ORDER.filter((p) => payloadCounts[p] > 0).map((p) => ({
      value: p,
      label: PAYLOAD_LABELS[p] ?? p,
      count: payloadCounts[p],
    })),
    usage: Object.entries(usageCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([v, c]) => ({ value: v, label: USAGE_LABELS[v] ?? v, count: c })),
  }
}

// ---------------------------------------------------------------------------
// HP range parser — "50-100" → { min: 50, max: 100 }
// ---------------------------------------------------------------------------
function parseHpRange(range: string): { min: number; max: number } | null {
  const match = /^(\d+)-(\d+)$/.exec(range.trim())
  if (!match) return null
  const min = parseInt(match[1], 10)
  const max = parseInt(match[2], 10)
  if (isNaN(min) || isNaN(max) || min >= max) return null
  return { min, max }
}

// ---------------------------------------------------------------------------
// Seed fallback — in-memory filtering (no DB)
// ---------------------------------------------------------------------------
function filterSeedProducts(
  query: ProductQuery,
  limit: number,
  offset: number,
): { products: Product[]; total: number; limit: number; offset: number } {
  let list = [...seedProducts]

  if (query.category) {
    const cat = seedCategories.find((c) => c.slug === query.category)
    list = cat ? list.filter((p) => p.category_id === cat.id) : []
  }

  if (query.q) {
    const q = query.q.toLowerCase()
    list = list.filter(
      (p) =>
        p.name_es.toLowerCase().includes(q) ||
        p.description_es.toLowerCase().includes(q),
    )
  }

  // filter_attrs filters applied against seed data (best-effort — seed has no filter_attrs)
  if (query.traction) {
    list = list.filter((p) => (p.filter_attrs as Record<string, unknown> | undefined)?.traction === query.traction)
  }
  if (query.transmission) {
    list = list.filter((p) => (p.filter_attrs as Record<string, unknown> | undefined)?.transmission === query.transmission)
  }
  if (query.brand) {
    list = list.filter((p) => (p.filter_attrs as Record<string, unknown> | undefined)?.brand === query.brand)
  }
  if (query.fuel) {
    list = list.filter((p) => (p.filter_attrs as Record<string, unknown> | undefined)?.fuel === query.fuel)
  }
  if (query.payload) {
    list = list.filter((p) => (p.filter_attrs as Record<string, unknown> | undefined)?.payload === query.payload)
  }
  if (query.usage) {
    list = list.filter((p) => (p.filter_attrs as Record<string, unknown> | undefined)?.usage === query.usage)
  }
  if (query.hp) {
    const hpRange = parseHpRange(query.hp)
    if (hpRange) {
      list = list.filter((p) => {
        const hpVal = Number((p.filter_attrs as Record<string, unknown> | undefined)?.hp)
        return !isNaN(hpVal) && hpVal >= hpRange.min && hpVal < hpRange.max
      })
    }
  }

  list.sort((a, b) => a.sort_order - b.sort_order)
  const total = list.length
  const paged = list.slice(offset, offset + limit)
  return { products: paged, total, limit, offset }
}
