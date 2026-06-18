// src/app/catalogo/comparar/page.tsx
// Server component — fetches products by ID from URL param ?ids=uuid1,uuid2,uuid3
// and renders a side-by-side spec comparison table.

import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { createServiceClient } from '@/lib/supabase/server'
import { ImageComparisonSlider } from '@/components/features/catalog/ImageComparisonSliderClient'
import { PageHero } from '@/components/features/shared/PageHero'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { Badge } from '@/components/ui/badge'
import type { Product, Category } from '@/types/database'
import seed from '@/data/seed.json'

export const metadata: Metadata = {
  title: 'Comparar modelos',
  description: 'Comparación técnica de modelos del catálogo Wings Global Trade.',
}

// ---------------------------------------------------------------------------
// Data access
// ---------------------------------------------------------------------------

async function fetchProductsByIds(ids: string[]): Promise<Product[]> {
  if (ids.length === 0) return []

  const supabase = createServiceClient()
  if (!supabase) {
    // Fall back to seed data
    const seedProducts = seed.products as unknown as Product[]
    return seedProducts.filter((p) => ids.includes(p.id))
  }

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .in('id', ids)
    .eq('is_active', true)

  if (error) {
    console.error('[comparar] fetchProductsByIds', error)
    const seedProducts = seed.products as unknown as Product[]
    return seedProducts.filter((p) => ids.includes(p.id))
  }

  return (data ?? []) as Product[]
}

async function fetchCategoriesForProducts(
  categoryIds: string[],
): Promise<Map<string, Category>> {
  const supabase = createServiceClient()
  const seedCategories = seed.categories as unknown as Category[]

  if (!supabase) {
    const map = new Map<string, Category>()
    seedCategories.forEach((c) => {
      if (categoryIds.includes(c.id)) map.set(c.id, c)
    })
    return map
  }

  const { data, error } = await supabase.from('categories').select('*').in('id', categoryIds)
  if (error) {
    console.error('[comparar] fetchCategoriesForProducts', error)
    const map = new Map<string, Category>()
    seedCategories.forEach((c) => {
      if (categoryIds.includes(c.id)) map.set(c.id, c)
    })
    return map
  }

  const map = new Map<string, Category>()
  ;(data ?? []).forEach((c: Category) => map.set(c.id, c))
  return map
}

// ---------------------------------------------------------------------------
// Spec key union — collect all unique spec keys across compared products
// ---------------------------------------------------------------------------

function collectSpecKeys(products: Product[]): string[] {
  const keys = new Set<string>()
  products.forEach((p) => Object.keys(p.specs).forEach((k) => keys.add(k)))
  return Array.from(keys)
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

interface PageProps {
  searchParams: Promise<{ ids?: string }>
}

export default async function CompararPage({ searchParams }: PageProps) {
  const { ids: idsParam } = await searchParams

  const rawIds = idsParam
    ? idsParam
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 3)
    : []

  // Empty state
  if (rawIds.length === 0) {
    return (
      <>
        <PageHero
          eyebrow="Comparación técnica"
          title="Comparar modelos"
          subtitle="Selecciona hasta 3 productos del catálogo para compararlos."
        />
        <div className="bg-warm-white px-6 py-24 md:px-10">
          <div className="mx-auto w-full max-w-6xl">
            <Breadcrumb
              items={[
                { label: 'Inicio', href: '/' },
                { label: 'Catálogo', href: '/catalogo' },
                { label: 'Comparar modelos' },
              ]}
            />
            <div className="mt-16 flex flex-col items-center gap-6 text-center">
              <p className="font-mono text-[11px] uppercase tracking-widest-3 text-text-muted">
                Sin productos seleccionados
              </p>
              <h2 className="font-display text-display-sm font-light text-navy">
                Selecciona productos para comparar
              </h2>
              <p className="max-w-md font-body text-body-md text-text-muted">
                Agrega productos desde el catálogo usando el botón de comparación y accede aquí
                para ver sus especificaciones lado a lado.
              </p>
              <Link
                href="/catalogo"
                className="mt-2 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest-2 text-gold transition-colors hover:text-gold-hover"
              >
                Ir al catálogo →
              </Link>
            </div>
          </div>
        </div>
      </>
    )
  }

  const products = await fetchProductsByIds(rawIds)

  // If products came back empty after a valid ID list (e.g. stale localStorage)
  if (products.length === 0) {
    return (
      <>
        <PageHero
          eyebrow="Comparación técnica"
          title="Comparar modelos"
        />
        <div className="bg-warm-white px-6 py-24 md:px-10">
          <div className="mx-auto w-full max-w-6xl">
            <Breadcrumb
              items={[
                { label: 'Inicio', href: '/' },
                { label: 'Catálogo', href: '/catalogo' },
                { label: 'Comparar modelos' },
              ]}
            />
            <div className="mt-16 flex flex-col items-center gap-6 text-center">
              <p className="font-mono text-[11px] uppercase tracking-widest-3 text-text-muted">
                Productos no encontrados
              </p>
              <h2 className="font-display text-display-sm font-light text-navy">
                No se encontraron los productos seleccionados
              </h2>
              <Link
                href="/catalogo"
                className="mt-2 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest-2 text-gold transition-colors hover:text-gold-hover"
              >
                Volver al catálogo →
              </Link>
            </div>
          </div>
        </div>
      </>
    )
  }

  const categoryIds = [...new Set(products.map((p) => p.category_id))]
  const categoryMap = await fetchCategoriesForProducts(categoryIds)
  const specKeys = collectSpecKeys(products)

  return (
    <>
      <PageHero
        eyebrow="Comparación técnica"
        title="Comparar modelos"
        subtitle={`Comparando ${products.length} producto${products.length > 1 ? 's' : ''} seleccionado${products.length > 1 ? 's' : ''}.`}
      />

      <div className="bg-warm-white px-4 py-10 md:px-10">
        <div className="mx-auto w-full max-w-6xl">
          <Breadcrumb
            items={[
              { label: 'Inicio', href: '/' },
              { label: 'Catálogo', href: '/catalogo' },
              { label: 'Comparar modelos' },
            ]}
          />

          {products.length === 2 && products[0].images[0] && products[1].images[0] && (
            <div className="mb-10">
              <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.15em] text-text-muted">
                Comparación visual
              </p>
              <ImageComparisonSlider
                imageA={{ src: products[0].images[0], label: products[0].name_es }}
                imageB={{ src: products[1].images[0], label: products[1].name_es }}
              />
            </div>
          )}

          <div className="mt-10 overflow-x-auto">
            <table className="w-full border-collapse">
              {/* Product header row */}
              <thead>
                <tr>
                  {/* Spec key column header */}
                  <th className="w-44 border-b border-[rgba(0,30,80,0.08)] py-4 pr-6 text-left align-bottom">
                    <span className="font-mono text-[10px] uppercase tracking-widest-3 text-text-muted">
                      Especificación
                    </span>
                  </th>

                  {products.map((product) => {
                    const category = categoryMap.get(product.category_id)
                    const image = product.images[0] ?? null

                    return (
                      <th
                        key={product.id}
                        className="min-w-[200px] border-b border-[rgba(0,30,80,0.08)] px-4 py-4 text-left align-top"
                      >
                        {/* Product image */}
                        <div className="relative mb-3 aspect-[4/3] w-full overflow-hidden rounded-wings bg-[#EDEAE1]">
                          {image ? (
                            <Image
                              src={image}
                              alt={product.name_es}
                              fill
                              sizes="(max-width: 768px) 50vw, 25vw"
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center font-mono text-xs text-text-muted">
                              Sin imagen
                            </div>
                          )}
                        </div>

                        {/* Category badge */}
                        {category && (
                          <Badge variant="muted" className="mb-2">
                            {category.name_es}
                          </Badge>
                        )}

                        {/* Product name */}
                        <p className="font-display text-display-sm font-light text-navy">
                          {product.name_es}
                        </p>

                        {/* Source markets */}
                        <div className="mt-2 flex flex-wrap gap-1">
                          {product.source_markets.map((m) => (
                            <Badge key={m} variant="source">
                              {m}
                            </Badge>
                          ))}
                        </div>
                      </th>
                    )
                  })}
                </tr>
              </thead>

              {/* Spec rows */}
              <tbody>
                {specKeys.map((key) => {
                  const values = products.map((p) => p.specs[key] ?? '—')
                  const uniqueValues = new Set(values.filter((v) => v !== '—'))
                  const hasDifference = uniqueValues.size > 1

                  return (
                    <tr
                      key={key}
                      className="border-b border-[rgba(0,30,80,0.05)] last:border-0"
                    >
                      <td className="py-3 pr-6 align-middle">
                        <span className="font-mono text-mono-sm text-text-muted">{key}</span>
                      </td>

                      {products.map((product) => {
                        const value = product.specs[key] ?? '—'
                        const isMissing = value === '—'

                        return (
                          <td
                            key={product.id}
                            className={`px-4 py-3 align-middle ${
                              hasDifference && !isMissing ? 'bg-gold/10' : ''
                            }`}
                          >
                            <span
                              className={`font-mono text-mono-sm ${
                                isMissing ? 'text-text-muted/40' : 'text-text-mono'
                              }`}
                            >
                              {value}
                            </span>
                          </td>
                        )
                      })}
                    </tr>
                  )
                })}
              </tbody>

              {/* CTA row */}
              <tfoot>
                <tr>
                  <td className="py-6 pr-6" />
                  {products.map((product) => {
                    const category = categoryMap.get(product.category_id)
                    const inquiryHref = category
                      ? `/catalogo/${category.slug}/${product.slug}#cotizar`
                      : `/catalogo/${product.slug}#cotizar`

                    return (
                      <td key={product.id} className="px-4 py-6 align-top">
                        <Link
                          href={inquiryHref}
                          className="inline-flex items-center gap-2 rounded-wings bg-gold px-4 py-2.5 font-mono text-[10px] uppercase tracking-widest-2 text-navy transition-colors hover:bg-gold-hover"
                        >
                          Solicitar cotización →
                        </Link>
                      </td>
                    )
                  })}
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Back link */}
          <div className="mt-10 border-t border-[rgba(0,30,80,0.06)] pt-8">
            <Link
              href="/catalogo"
              className="font-mono text-[11px] uppercase tracking-widest-2 text-text-muted transition-colors hover:text-navy"
            >
              ← Volver al catálogo
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
