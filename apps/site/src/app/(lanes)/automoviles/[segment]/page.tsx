// src/app/(lanes)/automoviles/[segment]/page.tsx
// WGT/07 segment drill-down — the canonical taxonomy axis (lane.config.ts:
// segment is canonical, brand is the curated overlay). Cross-brand by
// design: unlike a brand page (one brand, many segments), this is one
// segment, many brands — the natural place to show what "multiple brand
// colors" actually looks like in one grid, since each card carries its own
// [data-oem] scope and therefore its own --oem-accent. Card grid + brand
// filter now live in SegmentModelGrid (mirrors BrandModelGrid, filter axis
// flipped) — same shared VehicleCard/FilterBar every other page uses.
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getProducts } from '@/lib/catalog-data'
import { lane } from '@wings/liveries/automoviles/lane.config'
import { pluralize, pluralizeCount } from '@/lib/pluralize'
import { SectionHero } from '@/components/features/automoviles/SectionHero'
import { SegmentModelGrid } from '@/components/features/automoviles/SegmentModelGrid'
import { VehicleTypeIcon, type VehicleSegmentSlug } from '@/components/features/automoviles/VehicleTypeIcon'

interface PageProps {
  params: Promise<{ segment: string }>
}

export function generateStaticParams() {
  return lane.taxonomy.map((s) => ({ segment: s.slug }))
}

function getSegment(slug: string) {
  return lane.taxonomy.find((s) => s.slug === slug)
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { segment: slug } = await params
  const segment = getSegment(slug)
  if (!segment) return {}
  const title = `${segment.name.es} — Automóviles | Wings Global Trade`
  const description = `Modelos ${segment.name.es.toLowerCase()} de las 11 marcas en catálogo. Consulta técnica sin registro, cotización por unidad configurada o por contenedor.`
  const url = `https://wingsglobaltrade.com/automoviles/${segment.slug}`
  return {
    title,
    description,
    openGraph: { title, description, locale: 'es_PE', type: 'website', url },
    twitter: { card: 'summary_large_image', title, description },
    alternates: { canonical: url },
  }
}

export default async function AutomovilesSegmentPage({ params }: PageProps) {
  const { segment: slug } = await params
  const segment = getSegment(slug)
  if (!segment) notFound()

  const { products: all } = await getProducts({ category: 'automoviles', limit: 100 })
  const products = all.filter((p) => (p.filter_attrs as Record<string, unknown> | undefined)?.segment === slug)
  const brandCount = new Set(products.map((p) => (p.filter_attrs as Record<string, unknown> | undefined)?.brand)).size

  return (
    <div>
      <SectionHero
        kicker="Automóviles"
        icon={
          <VehicleTypeIcon
            segment={segment.slug as VehicleSegmentSlug}
            className="h-9 w-16 shrink-0 text-[color:var(--ink-primary)]"
          />
        }
        title={segment.name.es}
        description={`${pluralizeCount(products.length, 'modelo')} en este segmento, de ${brandCount} ${pluralize(brandCount, 'marca', 'marcas')} distintas.`}
      />

      <div className="mx-auto max-w-6xl px-5 py-12 md:px-8 md:py-16">
        {products.length === 0 ? (
          <p className="text-body-md text-[color:var(--ink-decoration)]">
            Sin modelos activos en este segmento por el momento.
          </p>
        ) : (
          <SegmentModelGrid products={products} segmentSlugValue={segment.slug as VehicleSegmentSlug} />
        )}

        <div className="mt-16 flex flex-col gap-6 border border-[color:var(--ink-decoration)] bg-[color:var(--surface-2)] p-8 md:flex-row md:items-center md:justify-between">
          <p className="max-w-xl text-body-md text-[color:var(--ink-secondary)]">
            Cotización por unidad configurada o por contenedor — un asesor confirma
            especificación exacta y condiciones.
          </p>
          <Link
            href="/cotizar"
            className="inline-flex h-12 shrink-0 items-center justify-center rounded-[var(--radius-control)] bg-[color:var(--btn-primary-bg)] px-8 font-mono text-sm uppercase tracking-wide text-[color:var(--btn-primary-ink)] transition-colors hover:bg-[color:var(--btn-primary-bg-hover)]"
          >
            Solicitar cotización
          </Link>
        </div>
      </div>
    </div>
  )
}
