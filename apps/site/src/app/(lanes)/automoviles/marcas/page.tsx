// src/app/(lanes)/automoviles/marcas/page.tsx
// WGT/07 brand roster — the overlay entry point (lane.config.ts taxonomy:
// segment is canonical, brand is the curated overlay). Mirrors
// (brands)/marcas/page.tsx's structure — grid of tiles, data-reveal scroll-in
// — with a different data attribute ([data-oem], never [data-brand]) and
// real catalog counts instead of RB's brand-kit story fields, since no OEM
// brand kit exists yet (same honesty the photography gate already logs).
import type { Metadata } from 'next'
import Link from 'next/link'
import { getProducts } from '@/lib/catalog-data'
import { OEM_BRANDS } from '@/lib/automoviles/oem-brands'
import { MotionCard } from '@/components/features/automoviles/MotionCard'

export const metadata: Metadata = {
  title: 'Marcas — Automóviles | Wings Global Trade',
  description:
    'Once fabricantes, un solo escritorio: Toyota, Jetour, KIA, Audi, BMW, Hyundai, Mercedes-Benz, MG, Star 5, Changan y Wuling. Catálogo directo de fábrica, consulta técnica sin registro.',
  alternates: { canonical: '/automoviles/marcas' },
}

export default async function AutomovilesMarcasPage() {
  const { products } = await getProducts({ category: 'automoviles', limit: 100 })

  const counts = new Map<string, number>()
  for (const p of products) {
    const brand = (p.filter_attrs as Record<string, unknown> | undefined)?.brand
    if (typeof brand === 'string') counts.set(brand, (counts.get(brand) ?? 0) + 1)
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24">
      <header className="max-w-3xl">
        <p className="font-mono text-mono-sm uppercase tracking-widest-2 text-[color:var(--accent-ink)]">
          Automóviles
        </p>
        <h1 className="mt-3 font-display text-display-lg text-[color:var(--ink-primary)]">Marcas</h1>
        <p className="mt-5 text-body-lg text-[color:var(--ink-secondary)]">
          Once fabricantes bajo un mismo escritorio de importación. Cada marca conserva su
          propia identidad — el catálogo completo por unidad configurada o por contenedor
          se solicita al ingresar a cada una.
        </p>
      </header>

      <section className="mt-16" aria-labelledby="roster-heading">
        <h2
          id="roster-heading"
          className="font-mono text-mono-sm uppercase tracking-widest-2 text-[color:var(--ink-decoration)]"
        >
          Marcas en catálogo
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {OEM_BRANDS.map((brand) => {
            const count = counts.get(brand.filterBrand) ?? 0
            return (
              <MotionCard
                key={brand.slug}
                dataOem={brand.slug}
                className="group border border-[color:var(--ink-decoration)] bg-[color:var(--surface-1)] transition-colors"
              >
                <Link href={`/automoviles/marcas/${brand.slug}`} className="block p-8">
                  <p className="font-mono text-[11px] uppercase tracking-widest-2 text-[color:var(--ink-decoration)]">
                    {count} {count === 1 ? 'línea de modelo' : 'líneas de modelo'}
                  </p>
                  <p className="mt-3 font-display text-2xl text-[color:var(--ink-primary)]">{brand.name}</p>
                  <div className="mt-5 h-[3px] w-12 bg-[color:var(--oem-accent,_var(--accent-ink))] transition-all group-hover:w-20" />
                  <p className="mt-4 text-body-sm text-[color:var(--ink-secondary)]">{brand.note}</p>
                </Link>
              </MotionCard>
            )
          })}
        </div>
      </section>

      <section className="mt-20 border border-[color:var(--ink-decoration)] bg-[color:var(--surface-2)] p-8 md:p-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="max-w-xl">
            <h2 className="font-display text-display-sm text-[color:var(--ink-primary)]">
              ¿No encuentra la marca o el modelo que necesita?
            </h2>
            <p className="mt-3 text-body-md text-[color:var(--ink-secondary)]">
              Wings importa bajo pedido más allá del catálogo activo. Un asesor confirma
              disponibilidad, especificación exacta y condiciones antes de cotizar.
            </p>
          </div>
          <Link
            href="/cotizar"
            className="inline-flex h-12 shrink-0 items-center justify-center rounded-[var(--radius-control)] bg-[color:var(--btn-primary-bg)] px-8 font-mono text-sm uppercase tracking-wide text-[color:var(--btn-primary-ink)] transition-colors hover:bg-[color:var(--btn-primary-bg-hover)]"
          >
            Solicitar cotización
          </Link>
        </div>
      </section>
    </div>
  )
}
