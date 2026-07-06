// src/app/catalogo/[category]/aplicacion/[useCase]/page.tsx
// Application-context landing pages for LATAM search intent.
// Route depth 4 — does not conflict with [category]/[slug] (depth 3).
// Example: /catalogo/maquinaria-agricola/aplicacion/arrozal

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  getCategoryBySlug,
  getProducts,
} from '@/lib/catalog-data'
import {
  getCatalogApplication,
  CATALOG_APPLICATIONS,
} from '@/lib/catalog-applications'
import { PageHero } from '@/components/features/shared/PageHero'
import { ProductGrid } from '@/components/features/catalog/ProductGrid'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { JsonLd } from '@/components/seo/JsonLd'
import { breadcrumbSchema } from '@/lib/schema'
import { Button } from '@/components/ui/button'

interface PageProps {
  params: Promise<{ category: string; useCase: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category, useCase } = await params
  const application = getCatalogApplication(category, useCase)
  if (!application) return { title: 'Aplicación no encontrada' }

  return {
    title: application.metaTitle,
    description: application.metaDescription,
    openGraph: {
      title: application.metaTitle,
      description: application.metaDescription,
      locale: 'es_PE',
      type: 'website',
      url: `https://wingsglobaltrade.com/catalogo/${category}/aplicacion/${useCase}`,
    },
    alternates: {
      canonical: `https://wingsglobaltrade.com/catalogo/${category}/aplicacion/${useCase}`,
    },
  }
}

/**
 * Generate static params for all known application pages so they can be
 * statically generated at build time.
 */
export function generateStaticParams(): Array<{ category: string; useCase: string }> {
  const out: Array<{ category: string; useCase: string }> = []
  for (const [categorySlug, apps] of Object.entries(CATALOG_APPLICATIONS)) {
    for (const app of apps) {
      out.push({ category: categorySlug, useCase: app.slug })
    }
  }
  return out
}

export default async function ApplicationPage({ params }: PageProps) {
  const { category, useCase } = await params

  // Resolve application definition — 404 if unknown
  const application = getCatalogApplication(category, useCase)
  if (!application) notFound()

  // Resolve category for display names — 404 if category doesn't exist
  const cat = await getCategoryBySlug(category)
  if (!cat) notFound()

  // Fetch products filtered by this application's recommended params
  const { products } = await getProducts({
    category,
    ...application.filterParams,
  })

  // Breadcrumb schema for JSON-LD
  const breadcrumbs = [
    { name: 'Inicio', url: 'https://wingsglobaltrade.com' },
    { name: 'Catálogo', url: 'https://wingsglobaltrade.com/catalogo' },
    { name: cat.name_es, url: `https://wingsglobaltrade.com/catalogo/${category}` },
    {
      name: application.name_es,
      url: `https://wingsglobaltrade.com/catalogo/${category}/aplicacion/${useCase}`,
    },
  ]

  return (
    <>
      <JsonLd data={breadcrumbSchema(breadcrumbs)} />

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <PageHero
        eyebrow={`APLICACIÓN · ${cat.name_es.toUpperCase()}`}
        title={application.name_es}
        subtitle={application.heroSubtitle}
      />

      {/* ── Content area ─────────────────────────────────────────────────── */}
      <div className="bg-warm-white px-6 py-12 md:px-10">
        <div className="mx-auto w-full max-w-6xl">

          {/* Breadcrumb nav */}
          <Breadcrumb
            items={[
              { label: 'Inicio', href: '/' },
              { label: 'Catálogo', href: '/catalogo' },
              { label: cat.name_es, href: `/catalogo/${category}` },
              { label: application.name_es },
            ]}
            className="mb-8"
          />

          {/* ── Recommendation strip ──────────────────────────────────────── */}
          <div className="mb-10 rounded-wings-card border border-gold/20 bg-gold-subtle px-6 py-5">
            <p className="mb-1 font-mono text-[10px] uppercase tracking-widest-3 text-gold/70">
              Recomendación técnica
            </p>
            <p className="font-mono text-[13px] text-navy">
              Para{' '}
              <span className="font-semibold">{application.name_es}</span>
              {' '}recomendamos:{' '}
              <span className="text-gold">{application.recommendedHpRange} HP</span>
              {' '}·{' '}
              <span className="text-gold">
                Tracción {application.recommendedTraction.toUpperCase()}
              </span>
            </p>
            <p className="mt-2 font-body text-sm text-text-muted">
              {application.description_es}
            </p>
          </div>

          {/* ── Product grid or empty state ───────────────────────────────── */}
          {products.length > 0 ? (
            <ProductGrid products={products} category={cat} />
          ) : (
            /* Mister dead-end CTA when no products match the filter */
            <div className="rounded-wings-card border border-border-default bg-white p-8 text-center">
              <p className="font-mono text-label-sm uppercase tracking-widest-2 text-gold">
                Mister · Asistente IA
              </p>
              <h3 className="mt-2 font-display text-display-sm font-semibold text-navy">
                No encontramos modelos con estos filtros en catálogo
              </h3>
              <p className="mx-auto mt-3 max-w-lg font-body text-body-md text-text-muted">
                Mister puede cotizar exactamente lo que necesitas —{' '}
                {application.recommendedHpRange} HP, tracción{' '}
                {application.recommendedTraction.toUpperCase()}, importación directa desde
                China vía zona franca.
              </p>
              <div className="mt-6">
                <Link href="/mister">
                  <Button>Hablar con Mister</Button>
                </Link>
              </div>
            </div>
          )}

          {/* ── Mister CTA block (always shown below products) ───────────── */}
          {products.length > 0 && (
            <div className="mt-16 rounded-wings-card border border-border-default bg-white p-8 text-center">
              <p className="font-mono text-label-sm uppercase tracking-widest-2 text-gold">
                Mister · Asistente IA
              </p>
              <h3 className="mt-2 font-display text-display-sm font-semibold text-navy">
                ¿Volumen mayor o especificaciones particulares?
              </h3>
              <p className="mx-auto mt-3 max-w-lg font-body text-body-md text-text-muted">
                Mister te ayuda a importar desde China y a nacionalizar en destino — cotización
                CIF, aranceles, zona franca. Sin llamadas previas.
              </p>
              <div className="mt-6">
                <Link href="/mister">
                  <Button>Hablar con Mister</Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
