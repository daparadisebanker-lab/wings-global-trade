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
// Spec grouping — mirrors ProductSpecTable grouping logic
// ---------------------------------------------------------------------------

const SPEC_GROUPS: { label: string; pattern: RegExp }[] = [
  { label: 'Motor',       pattern: /HP|Potencia|RPM|Motor|Cilindro|Desplazamiento|Combustible|Aspiración|CV/i },
  { label: 'Transmisión', pattern: /Transmisión|Velocidad|Tracción|Embrague|Marcha/i },
  { label: 'Hidráulica',  pattern: /Hidráulico|Caudal|Presión|Enganche|PTO|Bomba/i },
  { label: 'Dimensiones', pattern: /Largo|Ancho|Alto|Peso|Longitud|Anchura|Altura|Batalla|Distancia/i },
  { label: 'Capacidad',   pattern: /Capacidad|Depósito|Tanque|Litro|Carga/i },
]

function getSpecGroup(key: string): string {
  for (const g of SPEC_GROUPS) {
    if (g.pattern.test(key)) return g.label
  }
  return 'General'
}

function groupSpecKeys(keys: string[]): { label: string; keys: string[] }[] {
  const map = new Map<string, string[]>()
  const order: string[] = []
  for (const key of keys) {
    const g = getSpecGroup(key)
    if (!map.has(g)) { map.set(g, []); order.push(g) }
    map.get(g)!.push(key)
  }
  return order.map((label) => ({ label, keys: map.get(label)! }))
}

function collectSpecKeys(products: Product[]): string[] {
  const keys = new Set<string>()
  products.forEach((p) => Object.keys(p.specs).forEach((k) => keys.add(k)))
  return Array.from(keys)
}

// Returns true if a numeric value can be extracted for comparison
function extractNumeric(val: string): number | null {
  const m = val.match(/^([\d,]+\.?\d*)/)
  if (m) {
    const n = parseFloat(m[1].replace(',', ''))
    return isNaN(n) ? null : n
  }
  return null
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

  if (products.length === 0) {
    return (
      <>
        <PageHero eyebrow="Comparación técnica" title="Comparar modelos" />
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
  const allSpecKeys = collectSpecKeys(products)
  const groupedSpecs = groupSpecKeys(allSpecKeys)

  // Count how many specs actually differ across products
  const differingCount = allSpecKeys.filter((key) => {
    const vals = products.map((p) => p.specs[key] ?? '—')
    const nonMissing = vals.filter((v) => v !== '—')
    return new Set(nonMissing).size > 1
  }).length

  const colMinWidth = products.length === 2 ? 220 : 180

  return (
    <>
      <PageHero
        eyebrow="Comparación técnica"
        title="Comparar modelos"
        subtitle={`Comparando ${products.length} producto${products.length > 1 ? 's' : ''} · ${differingCount} especificación${differingCount !== 1 ? 'es' : ''} con diferencias`}
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
            <div className="mt-8 mb-10">
              <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.15em] text-text-muted">
                Comparación visual
              </p>
              <ImageComparisonSlider
                imageA={{ src: products[0].images[0], label: products[0].name_es }}
                imageB={{ src: products[1].images[0], label: products[1].name_es }}
              />
            </div>
          )}

          {/* Difference summary chips */}
          <div className="mt-8 mb-6 flex items-center gap-3 flex-wrap">
            <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-navy/40">
              Resumen
            </span>
            <span className="border border-gold/25 bg-gold/[0.05] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.10em] text-navy">
              {differingCount} diferencias
            </span>
            <span className="border border-[rgba(0,30,80,0.10)] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.10em] text-navy/50">
              {allSpecKeys.length - differingCount} coincidencias
            </span>
          </div>

          {/* Comparison table — horizontally scrollable on mobile */}
          <div className="overflow-x-auto rounded-none">
            <table
              className="w-full border-collapse"
              style={{ minWidth: `${160 + products.length * colMinWidth}px` }}
            >
              {/* Product header row */}
              <thead>
                <tr>
                  {/* Sticky spec key column header */}
                  <th
                    className="sticky left-0 z-20 w-40 bg-warm-white border-b border-[rgba(0,30,80,0.08)] py-4 pr-6 text-left align-bottom"
                    style={{ minWidth: '160px' }}
                  >
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
                        className="border-b border-[rgba(0,30,80,0.08)] px-4 py-4 text-left align-top"
                        style={{ minWidth: `${colMinWidth}px` }}
                      >
                        <div className="relative mb-3 aspect-[4/3] w-full overflow-hidden bg-[#EDEAE1]">
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

                        {category && (
                          <Badge variant="muted" className="mb-2">
                            {category.name_es}
                          </Badge>
                        )}

                        <p className="font-display text-lg font-light text-navy leading-tight">
                          {product.name_es}
                        </p>

                        <div className="mt-2 flex flex-wrap gap-1">
                          {product.source_markets.map((m) => (
                            <Badge key={m} variant="source">{m}</Badge>
                          ))}
                        </div>
                      </th>
                    )
                  })}
                </tr>
              </thead>

              {/* Spec rows — grouped by category */}
              <tbody>
                {groupedSpecs.map(({ label, keys }) => (
                  <>
                    {/* Group header row */}
                    <tr key={`g-${label}`}>
                      <td
                        colSpan={products.length + 1}
                        className="sticky left-0 bg-warm-white pt-6 pb-1"
                      >
                        <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-gold/50">
                          {label}
                        </span>
                        <div className="mt-1 h-px w-full bg-[rgba(0,30,80,0.06)]" />
                      </td>
                    </tr>

                    {keys.map((key) => {
                      const values = products.map((p) => p.specs[key] ?? '—')
                      const nonMissing = values.filter((v) => v !== '—')
                      const hasDifference = new Set(nonMissing).size > 1

                      // For numeric comparison: find which product has the highest value
                      const numerics = values.map(extractNumeric)
                      const maxNumeric = numerics.reduce<number | null>(
                        (acc, n) => (n !== null && (acc === null || n > acc) ? n : acc),
                        null,
                      )

                      return (
                        <tr
                          key={key}
                          className="border-b border-[rgba(0,30,80,0.04)] last:border-0 hover:bg-gold/[0.02] transition-colors"
                        >
                          {/* Sticky key cell */}
                          <td
                            className="sticky left-0 z-10 bg-warm-white py-3 pr-6 align-middle"
                            style={{ minWidth: '160px' }}
                          >
                            <span className="font-mono text-[11px] text-navy/50">{key}</span>
                            {hasDifference && (
                              <span className="ml-2 inline-block h-1.5 w-1.5 rounded-full bg-gold/60 align-middle" />
                            )}
                          </td>

                          {products.map((product, pi) => {
                            const value = values[pi]
                            const isMissing = value === '—'
                            const num = numerics[pi]
                            const isHighest = num !== null && num === maxNumeric && maxNumeric !== null
                            const isDiff = hasDifference && !isMissing

                            return (
                              <td
                                key={product.id}
                                className={`px-4 py-3 align-middle transition-colors ${
                                  isDiff ? 'bg-gold/[0.06]' : ''
                                }`}
                              >
                                <span
                                  className={`font-mono text-[12px] ${
                                    isMissing
                                      ? 'text-navy/20'
                                      : isDiff && isHighest && products.length > 1
                                      ? 'font-semibold text-gold'
                                      : isDiff
                                      ? 'text-navy'
                                      : 'text-navy/60'
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
                  </>
                ))}
              </tbody>

              {/* Legend + CTA row */}
              <tfoot>
                <tr>
                  <td colSpan={products.length + 1} className="pt-6 pb-3">
                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="inline-block h-2 w-2 rounded-full bg-gold" />
                        <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-navy/40">
                          Valor más alto
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="inline-block h-2.5 w-4 rounded-sm bg-gold/[0.06] border border-gold/20" />
                        <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-navy/40">
                          Diferencia detectada
                        </span>
                      </div>
                    </div>
                  </td>
                </tr>
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
                          className="inline-flex items-center gap-2 bg-gold px-4 py-2.5 font-mono text-[10px] uppercase tracking-widest-2 text-navy transition-colors hover:bg-gold-hover"
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
