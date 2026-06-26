// src/app/catalogo/[category]/page.tsx
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  getCategories,
  getCategoryBySlug,
  getProducts,
  getProductFacets,
  getSubcategories,
} from '@/lib/catalog-data'
import { CategoryNav } from '@/components/features/catalog/CategoryNav'
import { ProductGrid } from '@/components/features/catalog/ProductGrid'
import { FilterSidebar } from '@/components/features/catalog/FilterSidebar'
import { FilterPanel } from '@/components/features/catalog/FilterPanel'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { JsonLd } from '@/components/seo/JsonLd'
import { breadcrumbSchema } from '@/lib/schema'
import { MisterDeadEnd } from '@/components/features/shared/MisterDeadEnd'
import { SubcategoryGateway } from '@/components/features/catalog/SubcategoryGateway'
import { FilterChipRow } from '@/components/features/catalog/FilterChipRow'
import { cn } from '@/lib/utils'

interface PageProps {
  params: Promise<{ category: string }>
  searchParams: Promise<{
    q?: string
    sub?: string
    hp?: string
    traction?: string
    transmission?: string
    brand?: string
    fuel?: string
    payload?: string
    usage?: string
  }>
}

// SEO metadata per category
const CATEGORY_SEO: Record<
  string,
  { title: string; description: string; markets: string }
> = {
  'maquinaria-agricola': {
    title: 'Maquinaria Agrícola Importada — China y Tailandia | Wings',
    description:
      'Cosechadoras, tractores y sembradoras de origen chino y tailandés. Consulta técnica sin registro. Importación vía zona franca ZOFRATACNA, Perú.',
    markets: 'China, Tailandia y Japón',
  },
  camiones: {
    title: 'Camiones y Vehículos Comerciales Importados | Wings',
    description:
      'Camiones ligeros y pesados de origen chino y japonés. Consulta técnica sin cuenta. Importación para Perú, Chile y toda Latinoamérica.',
    markets: 'China y Japón',
  },
  buses: {
    title: 'Buses de Importación — China y Japón | Wings Global Trade',
    description:
      'Buses escolares, urbanos e interurbanos de origen chino y japonés. Importación B2B para operadores de transporte en Perú, Chile y LATAM.',
    markets: 'China y Japón',
  },
  'equipo-industrial': {
    title: 'Equipo Industrial Importado — China y Dubai | Wings',
    description:
      'Generadores, compresores y montacargas de origen chino y de Dubai. Consulta técnica sin registro. Importación vía zona franca ZOFRI y ZOFRATACNA.',
    markets: 'China y Dubai',
  },
  repuestos: {
    title: 'Repuestos para Maquinaria e Industrial Importados | Wings',
    description:
      'Repuestos para maquinaria agrícola, camiones y equipo industrial. Origen China, Tailandia y Dubai. Consulta técnica directa. Sin registro.',
    markets: 'China, Tailandia y Dubai',
  },
}

/** Filter param keys that appear in searchParams and in the chips row */
const FILTER_KEYS = ['hp', 'traction', 'transmission', 'brand', 'fuel', 'payload', 'usage'] as const
type FilterKey = (typeof FILTER_KEYS)[number]

/** Human-readable label per filter key */
const FILTER_LABELS: Record<FilterKey, string> = {
  hp: 'HP',
  traction: 'Tracción',
  transmission: 'Transmisión',
  brand: 'Marca',
  fuel: 'Combustible',
  payload: 'Tonelaje',
  usage: 'Aplicación',
}

/** Category-specific label overrides for filter keys */
const CATEGORY_FILTER_LABELS: Partial<Record<string, Partial<Record<FilterKey, string>>>> = {
  buses: { fuel: 'Propulsión' },
}

function getFilterLabel(categorySlug: string, key: FilterKey): string {
  return CATEGORY_FILTER_LABELS[categorySlug]?.[key] ?? FILTER_LABELS[key]
}

/** Display-friendly values for raw filter param values */
const FUEL_DISPLAY: Record<string, string> = {
  diesel: 'Diésel',
  electrico: 'Eléctrico',
  hidrogeno: 'Hidrógeno',
  chasis: 'Chasis',
  gas: 'Gas',
}

function formatFilterValue(key: FilterKey, value: string): string {
  if (key === 'fuel') return FUEL_DISPLAY[value] ?? value
  return value
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category } = await params
  const cat = await getCategoryBySlug(category)
  if (!cat) return { title: 'Categoría no encontrada' }

  const seoMeta = CATEGORY_SEO[category] || {
    title: `Catálogo Wings — ${cat.name_es}`,
    description:
      cat.description_es ??
      `Catálogo de ${cat.name_es.toLowerCase()} para importación con gestión en zona franca.`,
    markets: 'China, Japón y Tailandia',
  }

  return {
    title: seoMeta.title,
    description: seoMeta.description,
    openGraph: {
      title: seoMeta.title,
      description: seoMeta.description,
      locale: 'es_PE',
      type: 'website',
      url: `https://wingsglobaltrade.com/catalogo/${category}`,
    },
    alternates: {
      canonical: `https://wingsglobaltrade.com/catalogo/${category}`,
    },
  }
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  // Next.js 15 — both params and searchParams are Promises
  const { category } = await params
  const { q, sub, hp, traction, transmission, brand, fuel, payload, usage } = await searchParams

  const cat = await getCategoryBySlug(category)
  if (!cat) notFound()

  const [categories, subcategories, { products }, facets] = await Promise.all([
    getCategories(),
    getSubcategories(category),
    getProducts({ category, q, sub, hp, traction, transmission, brand, fuel, payload, usage }),
    getProductFacets(category, sub),
  ])

  const seoMeta = CATEGORY_SEO[category]
  const markets = seoMeta?.markets ?? 'China, Japón y Tailandia'

  // Collect unique source markets from returned products for the data strip
  const productMarkets = Array.from(
    new Set(products.flatMap((p) => p.source_markets)),
  ).join(', ')

  const breadcrumbs = [
    { name: 'Inicio', url: 'https://wingsglobaltrade.com' },
    { name: 'Catálogo', url: 'https://wingsglobaltrade.com/catalogo' },
    { name: cat.name_es, url: `https://wingsglobaltrade.com/catalogo/${category}` },
  ]

  // Build active filters map for chips row
  const activeFilters: Record<FilterKey, string | undefined> = {
    hp,
    traction,
    transmission,
    brand,
    fuel,
    payload,
    usage,
  }
  const hasActiveFilters = FILTER_KEYS.some((k) => Boolean(activeFilters[k]))

  // Defined-only filters for FilterSidebar (which requires Record<string, string>)
  const definedFilters: Record<string, string> = Object.fromEntries(
    FILTER_KEYS.filter((k) => activeFilters[k] !== undefined).map((k) => [k, activeFilters[k] as string]),
  )

  /** Build a URL that removes a single filter param while preserving all others */
  function buildRemoveFilterUrl(removeKey: FilterKey): string {
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    if (sub) params.set('sub', sub)
    for (const key of FILTER_KEYS) {
      if (key !== removeKey && activeFilters[key]) {
        params.set(key, activeFilters[key]!)
      }
    }
    const qs = params.toString()
    return `/catalogo/${category}${qs ? `?${qs}` : ''}`
  }

  /** Build subcategory tab URL, preserving active filter params */
  function buildSubUrl(subSlug: string | null): string {
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    if (subSlug) params.set('sub', subSlug)
    if (hp) params.set('hp', hp)
    if (traction) params.set('traction', traction)
    if (transmission) params.set('transmission', transmission)
    if (brand) params.set('brand', brand)
    if (fuel) params.set('fuel', fuel)
    if (payload) params.set('payload', payload)
    if (usage) params.set('usage', usage)
    const qs = params.toString()
    return `/catalogo/${category}${qs ? `?${qs}` : ''}`
  }

  return (
    <>
      <JsonLd data={breadcrumbSchema(breadcrumbs)} />

      {/* ── Editorial Hero (Task 10) ─────────────────────────────────────── */}
      <header className="hero-mesh hero-grain relative overflow-hidden px-6 pb-20 pt-36 text-warm-white md:px-10 md:pb-28 md:pt-48">
        <div className="relative z-[1] mx-auto w-full max-w-6xl">
          {/* Eyebrow */}
          <p className="mb-4 font-mono text-[10px] uppercase tracking-widest-3 text-gold/80">
            CATÁLOGO · WINGS GLOBAL TRADE
          </p>

          {/* Title */}
          <h1 className="font-display text-display-lg font-light">{cat.name_es}</h1>

          {/* Subtitle */}
          <p className="mt-5 max-w-2xl font-body text-body-lg text-warm-white/55">
            {products.length} modelos disponibles · Importación desde {markets}. Consulta técnica
            sin cuenta requerida.
          </p>

          {/* Data strip — Alibaba intelligence layer */}
          <div className="mt-8 border-t border-warm-white/10 pt-5">
            <p className="font-mono text-[10px] uppercase tracking-widest-3 text-gold/60">
              {products.length} modelos
              {productMarkets ? ` · ${productMarkets}` : ''}
              {markets ? ` · ${markets}` : ''}
            </p>
          </div>
        </div>
      </header>

      {/* ── Content area ────────────────────────────────────────────────── */}
      <div className="bg-warm-white px-6 py-12 md:px-10">
        <div className="mx-auto w-full max-w-6xl">

          {/* Breadcrumb (Task 7) */}
          <Breadcrumb
            items={[
              { label: 'Inicio', href: '/' },
              { label: 'Catálogo', href: '/catalogo' },
              { label: cat.name_es },
            ]}
            className="mb-8"
          />

          {/* Category nav */}
          <div className="mb-6">
            <CategoryNav categories={categories} activeSlug={cat.slug} />
          </div>

          {/* Subcategory tabs (Task 3) */}
          {subcategories.length > 0 && (
            <nav
              aria-label="Subcategorías"
              className="no-scrollbar -mx-6 mb-8 flex gap-0 overflow-x-auto border-b border-[rgba(0,30,80,0.06)] px-6 md:mx-0 md:px-0"
            >
              {/* "All" tab */}
              <Link
                href={buildSubUrl(null)}
                aria-current={!sub ? 'page' : undefined}
                className={cn(
                  'shrink-0 pb-3 pr-6 font-mono text-[11px] uppercase tracking-nav transition-colors',
                  !sub
                    ? 'border-b-2 border-gold text-gold'
                    : 'border-b-2 border-transparent text-navy/45 hover:text-navy',
                )}
              >
                Todos
              </Link>

              {subcategories.map((sc) => {
                const isActive = sub === sc.slug
                return (
                  <Link
                    key={sc.id}
                    href={buildSubUrl(sc.slug)}
                    aria-current={isActive ? 'page' : undefined}
                    className={cn(
                      'shrink-0 pb-3 pr-6 font-mono text-[11px] uppercase tracking-nav transition-colors',
                      isActive
                        ? 'border-b-2 border-gold text-gold'
                        : 'border-b-2 border-transparent text-navy/45 hover:text-navy',
                    )}
                  >
                    {sc.name_es}
                  </Link>
                )
              })}
            </nav>
          )}

          {/* Horizontal quick-filter chip row */}
          <FilterChipRow
            categorySlug={category}
            facets={facets}
            activeFilters={definedFilters}
          />

          {/* Active filters chips row */}
          {hasActiveFilters && (
            <div className="mb-6 flex flex-wrap items-center gap-2">
              <span className="font-mono text-[10px] uppercase tracking-widest-2 text-navy/55">
                Filtros:
              </span>
              {FILTER_KEYS.map((key) => {
                const value = activeFilters[key]
                if (!value) return null
                return (
                  <Link
                    key={key}
                    href={buildRemoveFilterUrl(key)}
                    className="flex items-center gap-1.5 rounded border border-gold/30 bg-gold-subtle px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest-2 text-navy transition-colors hover:border-gold/60"
                    title={`Eliminar filtro ${getFilterLabel(category, key)}`}
                  >
                    {getFilterLabel(category, key)}: {formatFilterValue(key, value)}
                    <span aria-hidden="true" className="text-navy/40">
                      ×
                    </span>
                  </Link>
                )
              })}

              {/* Clear all */}
              <Link
                href={`/catalogo/${category}${q ? `?q=${q}` : ''}`}
                className="font-mono text-[10px] uppercase tracking-widest-2 text-navy/45 underline-offset-2 hover:text-navy hover:underline"
              >
                Limpiar todo
              </Link>
            </div>
          )}

          {/* Main content: filter sidebar + product grid */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[220px_1fr]">
            {/* Desktop sidebar — always visible */}
            <FilterSidebar
              categorySlug={category}
              activeFilters={definedFilters}
              facets={facets}
            />
            <div>
              <ProductGrid products={products} category={cat} />
            </div>
          </div>

          {/* Mobile bottom-sheet drawer — FloatingTriggerButton always visible on mobile */}
          <FilterPanel
            categorySlug={category}
            activeFilters={definedFilters}
            facets={facets}
          />

          {/* ── Subcategory gateway — inactive subcategories route to Mister */}
          <SubcategoryGateway
            categorySlug={category}
            categoryName={cat.name_es}
            activeSubSlugs={subcategories.map((s) => s.slug)}
            productCount={products.length}
          />

          {/* ── Mister dead-end CTA ───────────────────────────────────────── */}
          <div className="mt-16">
            <MisterDeadEnd context="category-bottom" />
          </div>
        </div>
      </div>
    </>
  )
}
