// src/app/(brands)/marcas/[brand]/productos/page.tsx
// Brand shelf — Products (SPEC §2.4.2). Spec-sheet-led; numbers exhibited in
// tabular mono. NO unit purchasing anywhere: the single action per product is
// «Ver disponibilidad en contenedor», deep-linking into the instrument.
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getBrand, ALADIN_PRODUCTS } from '@/lib/rb/fixtures'

interface PageProps {
  params: Promise<{ brand: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { brand: slug } = await params
  const brand = getBrand(slug)
  if (!brand) return {}
  return {
    title: `Productos ${brand.name} — fichas técnicas y venta por contenedor`,
    description: `Catálogo mayorista de ${brand.name} en Perú: fichas técnicas con GTIN, empaque máster y equivalencias por contenedor. Sin venta por unidad.`,
  }
}

export default async function BrandProductsPage({ params }: PageProps) {
  const { brand: slug } = await params
  const brand = getBrand(slug)
  if (!brand) notFound()
  // Fixture phase: one catalog (RB/01). TOWER integration swaps this for
  // tower.products filtered by represented_brand_id (SPEC §5.1).
  const products = ALADIN_PRODUCTS

  return (
    <div className="mx-auto max-w-6xl px-5 py-14 md:px-8 md:py-20">
      <header className="max-w-2xl">
        <h1 className="font-display text-display-md text-neutral-900">Productos</h1>
        <p className="mt-4 text-body-md text-neutral-600">
          Catálogo mayorista con especificación logística completa. La compra es
          exclusivamente por contenedor — completo o por cupos; los productos no se
          venden por unidad.
        </p>
      </header>

      <div className="mt-12 grid gap-8 lg:grid-cols-2">
        {products.map((product) => (
          <article
            key={product.slug}
            data-reveal
            className="flex flex-col border border-neutral-200 bg-white"
          >
            <div className="border-b border-neutral-100 bg-[var(--rb-surface-tint)] p-7">
              <p className="font-mono text-[11px] uppercase tracking-widest-2 text-[var(--rb-accent-ink)]">
                {brand.name} · {product.unitLabel}
              </p>
              <h2 className="mt-2 font-display text-display-sm text-neutral-900">
                {product.name}
              </h2>
              <p className="mt-3 text-body-sm text-neutral-600">{product.descriptionEs}</p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {product.highlights.map((h) => (
                  <li
                    key={h}
                    className="border border-[var(--rb-accent-border)] bg-white px-2.5 py-1 text-[12px] text-[var(--rb-accent-ink)]"
                  >
                    {h}
                  </li>
                ))}
              </ul>
            </div>

            {/* Spec sheet — exhibited numbers, tabular mono */}
            <dl className="flex-1 divide-y divide-neutral-100 px-7">
              {product.specs.map((row) => (
                <div key={row.label} className="grid grid-cols-[140px_1fr] gap-4 py-2.5">
                  <dt className="text-[12px] uppercase tracking-widest-2 text-neutral-400">
                    {row.label}
                  </dt>
                  <dd className="font-mono text-mono-sm tabular-nums text-neutral-800">
                    {row.value}
                  </dd>
                </div>
              ))}
            </dl>

            <div className="p-7 pt-5">
              <Link
                href={`/marcas/${brand.slug}/contenedor?producto=${product.slug}`}
                className="inline-flex h-12 w-full items-center justify-center rounded-wings bg-[var(--rb-accent-ink)] px-6 text-label-lg font-semibold text-white transition-opacity hover:opacity-90"
              >
                Ver disponibilidad en contenedor
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
