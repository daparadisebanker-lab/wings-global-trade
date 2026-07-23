// src/app/catalogo/[category]/page.tsx
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'
import {
  getCategoryBySlug,
  getProducts,
  getProductFacets,
  getSubcategories,
} from '@/lib/catalog-data'
import { ProductGrid } from '@/components/features/catalog/ProductGrid'
import { FilterSidebar } from '@/components/features/catalog/FilterSidebar'
import { FilterPanel } from '@/components/features/catalog/FilterPanel'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { JsonLd } from '@/components/seo/JsonLd'
import { breadcrumbSchema } from '@/lib/schema'
import { MisterDeadEnd } from '@/components/features/shared/MisterDeadEnd'
import { SubcategoryGateway } from '@/components/features/catalog/SubcategoryGateway'
import { FilterChipRow } from '@/components/features/catalog/FilterChipRow'
import { CategoryShelfNav } from '@/components/features/catalog/CategoryShelfNav'
import { CategoryReveal } from '@/components/features/catalog/CategoryReveal'
import { CategoryIntelligence } from '@/components/features/catalog/CategoryIntelligence'
import { getCategoryIdentity } from '@/lib/category-identity'
import { CategoryIcon } from '@/components/features/homepage/CategoryIcon'

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

  const [subcategories, { products }, facets] = await Promise.all([
    getSubcategories(category),
    getProducts({ category, q, sub, hp, traction, transmission, brand, fuel, payload, usage }),
    getProductFacets(category, sub),
  ])

  const seoMeta = CATEGORY_SEO[category]
  const markets = seoMeta?.markets ?? 'China, Japón y Tailandia'
  const identity = getCategoryIdentity(cat)

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

  return (
    <>
      <JsonLd data={breadcrumbSchema(breadcrumbs)} />

      {/* Category entry reveal — once-per-session brand moment (Áladín port) */}
      <CategoryReveal name={cat.name_es} tagline={identity.tagline} iconKey={identity.iconKey} />

      {/* ── Editorial Hero — carries the category motif ──────────────────── */}
      <header className="hero-mesh hero-grain relative overflow-hidden px-6 pb-20 pt-36 text-warm-white md:px-10 md:pb-28 md:pt-48">
        {/* Category icon watermark — the branded signal (family gold, faint) */}
        <CategoryIcon
          iconKey={identity.iconKey}
          className="pointer-events-none absolute -right-8 top-24 h-72 w-72 text-gold/[0.05] md:h-96 md:w-96"
        />
        <div className="relative z-[1] mx-auto w-full max-w-6xl">
          {/* Eyebrow */}
          <p className="mb-4 font-mono text-[10px] uppercase tracking-widest-3 text-gold/80">
            CATÁLOGO · WINGS GLOBAL TRADE
          </p>

          {/* Title */}
          <h1 className="font-display text-display-lg font-light">{cat.name_es}</h1>

          {/* Subtitle — the category's identity tagline */}
          <p className="mt-5 max-w-2xl font-body text-body-lg text-warm-white/55">
            {identity.tagline}
          </p>

          {/* Data strip — numbers exhibited (root §1.5) */}
          <div className="mt-8 border-t border-warm-white/10 pt-5">
            <p className="font-mono text-[10px] uppercase tracking-widest-3 text-gold/60">
              {products.length} modelos
              {productMarkets ? ` · ${productMarkets}` : ''}
              {markets ? ` · ${markets}` : ''}
            </p>
          </div>
        </div>
      </header>

      {/* Sticky category shelf — identity bar + subcategory horizontal nav +
          gold scroll-progress line (the "branded space" spine) */}
      <Suspense fallback={null}>
        <CategoryShelfNav
          category={{ slug: cat.slug, name_es: cat.name_es, iconKey: identity.iconKey }}
          subcategories={subcategories.map((s) => ({ id: s.id, slug: s.slug, name_es: s.name_es }))}
          count={products.length}
        />
      </Suspense>

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

          {/* Category intelligence — register + exhibited numbers */}
          <div className="mb-8">
            <CategoryIntelligence
              categoryName={cat.name_es}
              identity={identity}
              productCount={products.length}
              subcategoryCount={subcategories.length}
              productMarkets={productMarkets}
            />
          </div>

          {/* Horizontal quick-filter chip row */}
          <Suspense fallback={null}>
            <FilterChipRow
              categorySlug={category}
              facets={facets}
              activeFilters={definedFilters}
            />
          </Suspense>

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
            <Suspense fallback={null}>
              <FilterSidebar
                categorySlug={category}
                activeFilters={definedFilters}
                facets={facets}
              />
            </Suspense>
            <div>
              <ProductGrid products={products} category={cat} />
            </div>
          </div>

          {/* Mobile bottom-sheet drawer — FloatingTriggerButton always visible on mobile */}
          <Suspense fallback={null}>
            <FilterPanel
              categorySlug={category}
              activeFilters={definedFilters}
              facets={facets}
            />
          </Suspense>

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
