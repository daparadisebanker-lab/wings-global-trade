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

  if (query.hp) {
    // Parse "min-max" bucket format. The JSONB text value is compared as string,
    // which works correctly for numeric string comparison when both sides are integers
    // of equal digit length. For robust comparison, use PostgREST cast syntax.
    const hpRange = parseHpRange(query.hp)
    if (hpRange) {
      // PostgREST filter syntax for JSONB text extraction with cast:
      // filter_attrs->>'hp' cast to int via gte/lte on the extracted text value.
      // Supabase JS client supports .filter() with raw PostgREST syntax for this.
      builder = builder
        .filter('filter_attrs->>hp', 'gte', String(hpRange.min))
        .filter('filter_attrs->>hp', 'lt', String(hpRange.max))
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
