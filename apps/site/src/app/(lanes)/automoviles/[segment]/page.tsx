// src/app/(lanes)/automoviles/[segment]/page.tsx
// WGT/07 segment drill-down — the canonical taxonomy axis (lane.config.ts:
// segment is canonical, brand is the curated overlay). Cross-brand by
// design: unlike a brand page (one brand, many segments), this is one
// segment, many brands — the natural place to show what "multiple brand
// colors" actually looks like in one grid, since each card carries its own
// [data-oem] scope and therefore its own --oem-accent.
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getProducts } from '@/lib/catalog-data'
import { getOemBrandByName } from '@/lib/automoviles/oem-brands'
import { lane } from '@wings/liveries/automoviles/lane.config'
import { MotionCard } from '@/components/features/automoviles/MotionCard'

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
  return {
    title: `${segment.name.es} — Automóviles | Wings Global Trade`,
    description: `Modelos ${segment.name.es.toLowerCase()} de las 11 marcas en catálogo. Consulta técnica sin registro, cotización por unidad configurada o por contenedor.`,
    alternates: { canonical: `/automoviles/${segment.slug}` },
  }
}

export default async function AutomovilesSegmentPage({ params }: PageProps) {
  const { segment: slug } = await params
  const segment = getSegment(slug)
  if (!segment) notFound()

  const { products: all } = await getProducts({ category: 'automoviles', limit: 100 })
  const products = all.filter(
    (p) => (p.filter_attrs as Record<string, unknown> | undefined)?.segment === slug,
  )

  return (
    <div className="mx-auto max-w-6xl px-5 py-12 md:px-8 md:py-16">
      <p className="font-mono text-mono-sm uppercase tracking-widest-2 text-[color:var(--accent-ink)]">
        WGT/07 · Automóviles
      </p>
      <h1 className="mt-3 text-3xl font-medium text-[color:var(--ink-primary)] md:text-4xl">
        {segment.name.es}
      </h1>
      <p className="mt-4 max-w-2xl text-body-lg text-[color:var(--ink-secondary)]">
        {products.length} {products.length === 1 ? 'modelo' : 'modelos'} en este segmento, de{' '}
        {new Set(products.map((p) => (p.filter_attrs as Record<string, unknown> | undefined)?.brand)).size}{' '}
        marcas distintas.
      </p>

      {products.length === 0 ? (
        <p className="mt-10 text-body-md text-[color:var(--ink-decoration)]">
          Sin modelos activos en este segmento por el momento.
        </p>
      ) : (
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => {
            const rawBrand = (p.filter_attrs as Record<string, unknown> | undefined)?.brand
            const brandName = typeof rawBrand === 'string' ? rawBrand : undefined
            const oem = brandName ? getOemBrandByName(brandName) : undefined
            return (
              <MotionCard
                key={p.id}
                dataOem={oem?.slug}
                className="border border-[color:var(--ink-decoration)] bg-[color:var(--surface-1)] p-6 transition-colors hover:border-[color:var(--oem-accent,_var(--accent-border))]"
              >
                <Link href={oem ? `/automoviles/marcas/${oem.slug}` : '/automoviles/marcas'} className="block">
                  <div className="flex items-center gap-2">
                    <span
                      aria-hidden
                      className="h-2 w-2 shrink-0 rounded-[2px] bg-[color:var(--oem-accent,_var(--accent-ink))]"
                    />
                    <p className="font-mono text-[10px] uppercase tracking-widest-2 text-[color:var(--oem-accent,_var(--accent-ink))]">
                      {oem?.name ?? brandName}
                    </p>
                  </div>
                  <p className="mt-2 font-display text-xl text-[color:var(--ink-primary)]">
                    {oem ? p.name_es.replace(`${oem.name} `, '') : p.name_es}
                  </p>
                  <p className="mt-2 font-mono text-[12px] text-[color:var(--ink-secondary)]">
                    {p.specs?.['Motor']}
                    {p.specs?.['Transmisión'] ? ` · ${p.specs['Transmisión']}` : ''}
                  </p>
                </Link>
                <div aria-hidden className="mt-4 h-px w-full bg-[color:var(--ink-decoration)]" />
                <div className="mt-4 flex items-center justify-between gap-3">
                  <p className="font-mono text-[10px] uppercase text-[color:var(--oem-accent,_var(--accent-ink))]">
                    {p.models?.length ?? 0} {p.models?.length === 1 ? 'versión' : 'versiones'}
                  </p>
                  <Link
                    href={`/automoviles/ficha/${p.slug}`}
                    className="font-mono text-[10px] uppercase tracking-widest-2 text-[color:var(--ink-secondary)] transition-colors hover:text-[color:var(--ink-primary)]"
                  >
                    Ficha técnica ↓
                  </Link>
                </div>
              </MotionCard>
            )
          })}
        </div>
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
  )
}
