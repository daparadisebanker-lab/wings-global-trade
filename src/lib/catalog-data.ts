// src/lib/catalog-data.ts
// Read-side catalog access. Uses Supabase when configured, otherwise falls
// back to the local seed fixture so the app renders without a live database.

import type { Category, Product } from '@/types/database'
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

export interface ProductQuery {
  category?: string
  q?: string
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

  let builder = supabase
    .from('products')
    .select('*', { count: 'exact' })
    .eq('is_active', true)

  if (categoryId) builder = builder.eq('category_id', categoryId)
  if (query.q) {
    builder = builder.textSearch('name_es', query.q.split(/\s+/).join(' & '), {
      type: 'plain',
      config: 'spanish',
    })
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

  list.sort((a, b) => a.sort_order - b.sort_order)
  const total = list.length
  const paged = list.slice(offset, offset + limit)
  return { products: paged, total, limit, offset }
}
