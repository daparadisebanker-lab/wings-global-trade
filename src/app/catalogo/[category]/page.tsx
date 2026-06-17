// src/app/catalogo/[category]/page.tsx
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getCategories, getCategoryBySlug, getProducts } from '@/lib/catalog-data'
import { PageHero } from '@/components/features/shared/PageHero'
import { CategoryNav } from '@/components/features/catalog/CategoryNav'
import { ProductGrid } from '@/components/features/catalog/ProductGrid'
import { JsonLd } from '@/components/seo/JsonLd'
import { breadcrumbSchema } from '@/lib/schema'
import { Button } from '@/components/ui/button'

interface PageProps {
  params: Promise<{ category: string }>
  searchParams: Promise<{ q?: string }>
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
  const { category } = await params
  const { q } = await searchParams

  const cat = await getCategoryBySlug(category)
  if (!cat) notFound()

  const categories = await getCategories()
  const { products } = await getProducts({ category, q })

  const seoMeta = CATEGORY_SEO[category]
  const markets = seoMeta?.markets ?? 'China, Japón y Tailandia'

  const breadcrumbs = [
    { name: 'Inicio', url: 'https://wingsglobaltrade.com' },
    { name: 'Catálogo', url: 'https://wingsglobaltrade.com/catalogo' },
    { name: cat.name_es, url: `https://wingsglobaltrade.com/catalogo/${category}` },
  ]

  return (
    <>
      <JsonLd data={breadcrumbSchema(breadcrumbs)} />

      {/* Per ENRICHED_SPEC §3.3 — Catálogo H1 pattern: "Catálogo Wings — [Categoría]" */}
      <PageHero
        eyebrow="Catálogo"
        title={`Catálogo Wings — ${cat.name_es}`}
        subtitle={`${products.length} modelos de origen ${markets}. Solicitud de consulta sin cuenta requerida.`}
      />

      <div className="bg-warm-white px-6 py-12 md:px-10">
        <div className="mx-auto w-full max-w-6xl">
          <div className="mb-10">
            <CategoryNav categories={categories} activeSlug={cat.slug} />
          </div>
          <ProductGrid products={products} category={cat} />

          {/* Category → /accio CTA — per ia-architect.md §Internal Linking */}
          <div className="mt-16 rounded-wings-card border border-border-default bg-white p-8 text-center">
            <p className="font-mono text-label-sm uppercase tracking-widest-2 text-gold">
              Motor Accio
            </p>
            <h3 className="mt-2 font-display text-display-sm font-semibold text-navy">
              ¿Necesitas un volumen mayor o especificaciones personalizadas?
            </h3>
            <p className="mx-auto mt-3 max-w-lg font-body text-body-md text-text-muted">
              El Motor Accio calcula un estimado CIF real antes de la primera llamada — vía
              ZOFRATACNA o ZOFRI.
            </p>
            <div className="mt-6">
              <Link href="/accio">
                <Button>Calcular mi importación</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
