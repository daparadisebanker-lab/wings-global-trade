// src/app/(lanes)/automoviles/page.tsx
// WGT/07 lane root — the canonical segment-led landing page (lane.config.ts
// taxonomy: segment is canonical, brand is the curated overlay at
// /automoviles/marcas). Segment cards are now real links into
// /automoviles/[segment] — closing the gap where the canonical taxonomy
// axis had no drill-down pages while the brand overlay did. Counts read
// filter_attrs.segment (@/lib/automoviles/segments.ts's explicit map,
// pre-computed into the product data — not a runtime keyword guess).
import type { Metadata } from 'next'
import Link from 'next/link'
import { getProducts } from '@/lib/catalog-data'
import { OEM_BRANDS } from '@/lib/automoviles/oem-brands'
import { lane } from '@wings/liveries/automoviles/lane.config'

export const metadata: Metadata = {
  title: 'Automóviles — Once marcas, un solo escritorio | Wings Global Trade',
  description:
    'Sedanes, SUV, MPV e híbridos de 11 marcas: Toyota, Jetour, KIA, Audi, BMW, Hyundai, Mercedes-Benz, MG, Star 5, Changan y Wuling. Catálogo directo de fábrica, por unidad configurada o por contenedor.',
  // The old /catalogo/automoviles?fuel=hibrido redirect (next.config.mjs)
  // forwards that query string here by default — canonical keeps it out of
  // search results as a separate URL.
  alternates: { canonical: '/automoviles' },
}

const UNIT_MATH = [
  {
    n: '01',
    title: 'Por unidad configurada',
    body: 'Un dealer, una flota pequeña o un importador solicita una unidad con la especificación exacta — motor, transmisión, versión — confirmada antes de cotizar.',
  },
  {
    n: '02',
    title: 'Por contenedor',
    body: 'Una flota compra N unidades de una misma versión de una vez. El cupo se resuelve en unidades, cajas y kilos exactos, igual que el resto del catálogo Wings.',
  },
  {
    n: '03',
    title: 'Un asesor confirma',
    body: 'Ninguna de las dos rutas muestra precio en el sitio — Wings cotiza por unidad o por contenedor con un asesor, con condiciones y disponibilidad confirmadas.',
  },
]

export default async function AutomovilesLaneRootPage() {
  const { products } = await getProducts({ category: 'automoviles', limit: 100 })

  const segmentCounts = new Map<string, number>()
  for (const p of products) {
    const slug = (p.filter_attrs as Record<string, unknown> | undefined)?.segment
    if (typeof slug === 'string') segmentCounts.set(slug, (segmentCounts.get(slug) ?? 0) + 1)
  }

  const brandCounts = new Map<string, number>()
  for (const p of products) {
    const brand = (p.filter_attrs as Record<string, unknown> | undefined)?.brand
    if (typeof brand === 'string') brandCounts.set(brand, (brandCounts.get(brand) ?? 0) + 1)
  }

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

      {/* Segments — the canonical taxonomy, now real links */}
      <section className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-mono text-mono-sm uppercase tracking-[var(--lane-label-tracking)] text-[color:var(--ink-decoration)]">
            Por segmento
          </h2>
        </div>
        <div data-reveal className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {lane.taxonomy.map((seg) => (
            <Link
              key={seg.slug}
              href={`/automoviles/${seg.slug}`}
              className="group border border-[color:var(--ink-decoration)] bg-[color:var(--surface-1)] p-6 transition-colors hover:border-[color:var(--accent-border)]"
            >
              <p className="text-base font-medium text-[color:var(--ink-primary)]">{seg.name.es}</p>
              <p className="mt-2 font-mono text-[11px] uppercase text-[color:var(--ink-decoration)]">
                {segmentCounts.get(seg.slug) ?? 0} modelos
              </p>
              <div className="mt-4 h-[2px] w-8 bg-[color:var(--accent-ink)] transition-all group-hover:w-12" aria-hidden />
            </Link>
          ))}
        </div>
      </section>

      {/* Unit math — the dual RFQ shape the hero promises but never explained */}
      <section className="border-t border-[color:var(--ink-decoration)]">
        <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
          <h2 className="font-mono text-mono-sm uppercase tracking-[var(--lane-label-tracking)] text-[color:var(--ink-decoration)]">
            Cómo se compra
          </h2>
          <p className="mt-3 max-w-2xl text-body-md text-[color:var(--ink-secondary)]">{lane.unitMath}</p>
          <ol className="mt-10 grid gap-10 md:grid-cols-3">
            {UNIT_MATH.map((step) => (
              <li key={step.n}>
                <span className="font-mono text-mono-lg text-[color:var(--accent-ink)]">{step.n}</span>
                <h3 className="mt-2 text-lg font-medium text-[color:var(--ink-primary)]">{step.title}</h3>
                <p className="mt-2 text-body-sm text-[color:var(--ink-secondary)]">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Full brand grid — all 11, not a preview */}
      <section className="border-t border-[color:var(--ink-decoration)] bg-[color:var(--surface-2)]">
        <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-mono text-mono-sm uppercase tracking-[var(--lane-label-tracking)] text-[color:var(--ink-decoration)]">
              Las 11 marcas
            </h2>
            <Link href="/automoviles/marcas" className="font-mono text-[11px] uppercase text-[color:var(--accent-ink)]">
              Ver catálogo completo →
            </Link>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {OEM_BRANDS.map((b) => (
              <Link
                key={b.slug}
                href={`/automoviles/marcas/${b.slug}`}
                data-oem={b.slug}
                className="group flex h-24 flex-col items-center justify-center gap-1 border border-[color:var(--ink-decoration)] bg-[color:var(--surface-0)] px-2 text-center transition-colors hover:border-[color:var(--oem-accent,_var(--accent-border))]"
              >
                <span className="text-sm font-medium text-[color:var(--ink-primary)]">{b.name}</span>
                <span className="font-mono text-[10px] uppercase text-[color:var(--ink-decoration)]">
                  {brandCounts.get(b.filterBrand) ?? 0} modelos
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
        <div className="flex flex-col gap-6 border border-[color:var(--ink-decoration)] bg-[color:var(--surface-1)] p-8 md:flex-row md:items-center md:justify-between md:p-10">
          <div className="max-w-xl">
            <h2 className="text-2xl font-medium text-[color:var(--ink-primary)]">
              ¿No encuentra la marca o el modelo que necesita?
            </h2>
            <p className="mt-3 text-body-md text-[color:var(--ink-secondary)]">
              Wings importa bajo pedido más allá del catálogo activo. Un asesor confirma
              disponibilidad, especificación exacta y condiciones antes de cotizar.
            </p>
          </div>
          <Link
            href="/cotizar"
            className="inline-flex h-12 shrink-0 items-center justify-center bg-[color:var(--chrome-accent)] px-8 text-label-lg font-semibold text-[color:var(--chrome-accent-ink)] transition-opacity hover:opacity-90"
          >
            Solicitar cotización
          </Link>
        </div>
      </section>
    </div>
  )
}
