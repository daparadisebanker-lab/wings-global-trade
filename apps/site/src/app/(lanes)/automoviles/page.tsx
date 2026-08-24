// src/app/(lanes)/automoviles/page.tsx
// WGT/07 lane root — the canonical segment-led entry (lane.config.ts
// taxonomy: segment is canonical, brand is the curated overlay at
// /automoviles/marcas). Counts read filter_attrs.segment (an explicit
// specs.Segmento → slug map, @/lib/automoviles/segments.ts — NOT a keyword
// heuristic: an earlier substring-match attempt silently merged "SUV
// compacto"/"SUV mediano"/"SUV todoterreno" into one count because they all
// start with "SUV"). Segment cards are informational only for now — they
// don't yet link to a filtered view; /catalogo/[category]'s FILTER_KEYS
// doesn't include "segment" yet, flagged in programs/automobiles/SCOPE.md.
import type { Metadata } from 'next'
import Link from 'next/link'
import { getProducts } from '@/lib/catalog-data'
import { OEM_BRANDS } from '@/lib/automoviles/oem-brands'
import { lane } from '@wings/liveries/automoviles/lane.config'

export const metadata: Metadata = {
  title: 'Automóviles — Once marcas, un solo escritorio | Wings Global Trade',
  description:
    'Sedanes, SUV, MPV e híbridos de 11 marcas: Toyota, Jetour, KIA, Audi, BMW, Hyundai, Mercedes-Benz, MG, Star 5, Changan y Wuling. Catálogo directo de fábrica, por unidad configurada o por contenedor.',
}

export default async function AutomovilesLaneRootPage() {
  const { products } = await getProducts({ category: 'automoviles', limit: 100 })

  const segmentCounts = new Map<string, number>()
  for (const p of products) {
    const slug = (p.filter_attrs as Record<string, unknown> | undefined)?.segment
    if (typeof slug === 'string') segmentCounts.set(slug, (segmentCounts.get(slug) ?? 0) + 1)
  }

  const featuredBrands = OEM_BRANDS.slice(0, 6)

  return (
    <div>
      {/* Hero */}
      <section className="border-b border-[color:var(--ink-decoration)]">
        <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24">
          <p className="font-mono text-mono-sm uppercase tracking-[var(--lane-label-tracking)] text-[color:var(--accent-ink)]">
            {lane.code} · Automóviles
          </p>
          <h1
            data-split
            className="mt-4 max-w-3xl text-5xl uppercase text-[color:var(--ink-primary)] tracking-[var(--lane-display-tracking)] font-[var(--lane-display-weight)] md:text-6xl"
          >
            Once fábricas.<br />Un solo escritorio.
          </h1>
          <p className="mt-6 max-w-xl text-body-lg text-[color:var(--ink-secondary)]">
            {lane.scope.es}
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link
              href="/automoviles/marcas"
              className="inline-flex h-12 items-center justify-center bg-[color:var(--chrome-accent)] px-8 text-label-lg font-semibold text-[color:var(--chrome-accent-ink)] transition-opacity hover:opacity-90"
            >
              Ver las 11 marcas
            </Link>
            <Link
              href="/cotizar"
              className="inline-flex h-12 items-center justify-center border border-[color:var(--accent-border)] px-8 text-label-lg font-semibold text-[color:var(--accent-ink)] transition-colors"
            >
              Solicitar cotización
            </Link>
          </div>
        </div>
      </section>

      {/* Segments — the canonical taxonomy */}
      <section className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
        <h2 className="font-mono text-mono-sm uppercase tracking-[var(--lane-label-tracking)] text-[color:var(--ink-decoration)]">
          Por segmento
        </h2>
        <div data-reveal className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {lane.taxonomy.map((seg) => (
            <div
              key={seg.slug}
              className="border border-[color:var(--ink-decoration)] bg-[color:var(--surface-1)] p-6"
            >
              <p className="text-base font-medium text-[color:var(--ink-primary)]">{seg.name.es}</p>
              <p className="mt-2 font-mono text-[11px] uppercase text-[color:var(--ink-decoration)]">
                {segmentCounts.get(seg.slug) ?? 0} modelos
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Brand preview strip — bridges into the full roster */}
      <section className="border-t border-[color:var(--ink-decoration)] bg-[color:var(--surface-2)]">
        <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-mono text-mono-sm uppercase tracking-[var(--lane-label-tracking)] text-[color:var(--ink-decoration)]">
              Marcas
            </h2>
            <Link href="/automoviles/marcas" className="font-mono text-[11px] uppercase text-[color:var(--accent-ink)]">
              Ver las 11 →
            </Link>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
            {featuredBrands.map((b) => (
              <Link
                key={b.slug}
                href={`/automoviles/marcas/${b.slug}`}
                data-oem={b.slug}
                className="group flex h-20 items-center justify-center border border-[color:var(--ink-decoration)] bg-[color:var(--surface-0)] text-center transition-colors"
              >
                <span className="text-sm font-medium text-[color:var(--ink-secondary)] transition-colors group-hover:opacity-100">
                  {b.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
