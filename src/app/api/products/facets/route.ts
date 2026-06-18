// src/app/api/products/facets/route.ts
// GET /api/products/facets?category=[slug]&sub=[subcategory-slug]
// Returns facet counts for filtering the product catalog.
// Assumes migration 0005 has been applied (subcategory_id, filter_attrs columns).

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { z, ZodError } from 'zod'
import type { SupabaseClient } from '@supabase/supabase-js'
import { createServiceClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const FacetsQuerySchema = z.object({
  category: z.string().min(1).max(100).optional(),
  sub: z.string().min(1).max(100).optional(),
})

export interface FacetItem {
  value: string
  label: string
  count: number
}

export interface SubcategoryFacet {
  slug: string
  name_es: string
  count: number
}

export interface FacetsResponse {
  subcategories: SubcategoryFacet[]
  hp: FacetItem[]
  traction: FacetItem[]
  transmission: FacetItem[]
  brand: FacetItem[]
}

// HP bucket definitions — inclusive lower, exclusive upper (except last)
const HP_BUCKETS: { value: string; label: string; min: number; max: number }[] = [
  { value: '15-50', label: '15–50 HP', min: 15, max: 50 },
  { value: '50-100', label: '50–100 HP', min: 50, max: 100 },
  { value: '100-200', label: '100–200 HP', min: 100, max: 200 },
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const rawParams = {
      category: searchParams.get('category') ?? undefined,
      sub: searchParams.get('sub') ?? undefined,
    }

    const params = FacetsQuerySchema.parse(rawParams)
    const supabase = createServiceClient()

    // When running without a live database, return empty facets gracefully.
    if (!supabase) {
      const empty: FacetsResponse = {
        subcategories: [],
        hp: [],
        traction: [],
        transmission: [],
        brand: [],
      }
      return NextResponse.json(empty)
    }

    // Resolve category slug → id
    let categoryId: string | undefined
    if (params.category) {
      const { data: catRow, error: catErr } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', params.category)
        .eq('is_active', true)
        .maybeSingle()

      if (catErr) {
        console.error('[api/products/facets] category lookup', catErr)
        return NextResponse.json(
          { error: 'Error interno del servidor', code: 'INTERNAL_ERROR' },
          { status: 500 },
        )
      }
      if (!catRow) {
        return NextResponse.json(
          { error: 'Categoría no encontrada', code: 'CATEGORY_NOT_FOUND' },
          { status: 404 },
        )
      }
      categoryId = catRow.id as string
    }

    // ------------------------------------------------------------------ //
    // 1. Subcategory facets — count active products per subcategory
    // ------------------------------------------------------------------ //
    const subcategoryFacets = await getSubcategoryFacets(supabase, categoryId)

    // ------------------------------------------------------------------ //
    // 2. Filter-attr facets — query products that have filter_attrs
    // ------------------------------------------------------------------ //
    let attrQuery = supabase
      .from('products')
      .select('filter_attrs')
      .eq('is_active', true)

    if (categoryId) attrQuery = attrQuery.eq('category_id', categoryId)
    if (params.sub) {
      // Resolve subcategory slug → id for attr filtering
      const { data: subRow } = await supabase
        .from('subcategories')
        .select('id')
        .eq('slug', params.sub)
        .maybeSingle()
      if (subRow) {
        attrQuery = attrQuery.eq('subcategory_id', (subRow as { id: string }).id)
      }
    }

    const { data: attrRows, error: attrErr } = await attrQuery

    if (attrErr) {
      console.error('[api/products/facets] filter_attrs query', attrErr)
      return NextResponse.json(
        { error: 'Error interno del servidor', code: 'INTERNAL_ERROR' },
        { status: 500 },
      )
    }

    const rows = (attrRows ?? []) as { filter_attrs: Record<string, unknown> | null }[]

    // ------------------------------------------------------------------ //
    // 3. HP bucketing (client-side — avoids raw SQL)
    // ------------------------------------------------------------------ //
    const hpBucketCounts: Record<string, number> = {}
    const tractionCounts: Record<string, number> = {}
    const transmissionCounts: Record<string, number> = {}
    const brandCounts: Record<string, number> = {}

    for (const row of rows) {
      const attrs = row.filter_attrs
      if (!attrs) continue

      // HP bucketing
      if (attrs.hp !== undefined && attrs.hp !== null) {
        const hpVal = Number(attrs.hp)
        if (!isNaN(hpVal)) {
          for (const bucket of HP_BUCKETS) {
            if (hpVal >= bucket.min && hpVal < bucket.max) {
              hpBucketCounts[bucket.value] = (hpBucketCounts[bucket.value] ?? 0) + 1
              break
            }
          }
        }
      }

      // Traction
      if (typeof attrs.traction === 'string' && attrs.traction.trim()) {
        const t = attrs.traction.trim()
        tractionCounts[t] = (tractionCounts[t] ?? 0) + 1
      }

      // Transmission
      if (typeof attrs.transmission === 'string' && attrs.transmission.trim()) {
        const tr = attrs.transmission.trim()
        transmissionCounts[tr] = (transmissionCounts[tr] ?? 0) + 1
      }

      // Brand
      if (typeof attrs.brand === 'string' && attrs.brand.trim()) {
        const b = attrs.brand.trim()
        brandCounts[b] = (brandCounts[b] ?? 0) + 1
      }
    }

    // ------------------------------------------------------------------ //
    // 4. Shape response
    // ------------------------------------------------------------------ //
    const hpFacets: FacetItem[] = HP_BUCKETS.filter((b) => (hpBucketCounts[b.value] ?? 0) > 0).map(
      (b) => ({ value: b.value, label: b.label, count: hpBucketCounts[b.value] }),
    )

    const tractionFacets: FacetItem[] = Object.entries(tractionCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([value, count]) => ({ value, label: value, count }))

    const transmissionFacets: FacetItem[] = Object.entries(transmissionCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([value, count]) => ({ value, label: value, count }))

    const brandFacets: FacetItem[] = Object.entries(brandCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([value, count]) => ({ value, label: value, count }))

    const response: FacetsResponse = {
      subcategories: subcategoryFacets,
      hp: hpFacets,
      traction: tractionFacets,
      transmission: transmissionFacets,
      brand: brandFacets,
    }

    return NextResponse.json(response)
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', code: 'VALIDATION_ERROR', details: error.errors },
        { status: 400 },
      )
    }
    console.error('[api/products/facets]', error)
    return NextResponse.json(
      { error: 'Error interno del servidor', code: 'INTERNAL_ERROR' },
      { status: 500 },
    )
  }
}

// ---------------------------------------------------------------------------
// Helper: subcategory facets via a join
// ---------------------------------------------------------------------------
async function getSubcategoryFacets(
  supabase: SupabaseClient,
  categoryId: string | undefined,
): Promise<SubcategoryFacet[]> {
  // Query subcategories and count their active products via a nested select.
  // Supabase supports embedded resource counts: select('*, products(count)').
  let query = supabase
    .from('subcategories')
    .select('slug, name_es, products(count)')

  if (categoryId) query = query.eq('category_id', categoryId)

  const { data, error } = await query

  if (error) {
    console.error('[api/products/facets] subcategory facets', error)
    return []
  }

  type SubcategoryRow = {
    slug: string
    name_es: string
    products: { count: number }[] | { count: number }
  }

  return ((data as SubcategoryRow[]) ?? [])
    .map((row) => {
      const countVal = Array.isArray(row.products) ? row.products[0]?.count ?? 0 : row.products?.count ?? 0
      return { slug: row.slug, name_es: row.name_es, count: Number(countVal) }
    })
    .filter((f) => f.count > 0)
    .sort((a, b) => b.count - a.count)
}
