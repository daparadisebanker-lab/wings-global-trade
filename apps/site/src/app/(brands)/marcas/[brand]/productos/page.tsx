// src/app/(brands)/marcas/[brand]/productos/page.tsx
// Brand shelf — Products (SPEC §2.4.2). Spec-sheet-led; numbers exhibited in
// tabular mono. NO unit purchasing anywhere: the single action per product is
// «Ver disponibilidad en contenedor», deep-linking into the instrument.
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getBrand } from '@/lib/rb/fixtures'
import { getRbProductsForBrand } from '@/lib/rb/data'
import { PackingDiagram } from '@wings/trade-ui'
import { ExplodedDiagram } from '@wings/trade-ui'
import { PalletDiagram } from '@wings/trade-ui'
import { SpecIcon } from '@/components/features/brands/SpecIcons'
import { TechDraw } from '@wings/trade-ui'

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
  // LIVE read model: PUBLISHED rb_products of a LIVE brand (public.rb_public_products,
  // tower_26), with a graceful fallback to the SPEC §6 fixtures when no live row
  // exists yet. Live rows render spec-led; fixtures keep their technical drawings.
  const products = await getRbProductsForBrand(slug)

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

      <div className="mt-12 space-y-14">
        {products.map((product, idx) => (
          <article
            key={product.slug}
            data-reveal
            className="border border-neutral-200 bg-white"
          >
            {/* Header band */}
            <div className="border-b border-neutral-100 bg-[var(--rb-surface-tint)] p-7 md:p-9">
              <p className="font-mono text-[12px] uppercase tracking-widest-2 text-[var(--rb-accent-ink)]">
                {brand.name} · {product.unitLabel}
              </p>
              <h2 className="mt-2 font-display text-display-md text-neutral-900">
                {product.name}
              </h2>
              <p className="mt-4 max-w-2xl text-body-lg text-neutral-600">{product.descriptionEs}</p>
              <ul className="mt-5 flex flex-wrap gap-2">
                {product.highlights.map((h) => (
                  <li
                    key={h}
                    className="border border-[var(--rb-accent-border)] bg-white px-3 py-1.5 text-body-sm text-[var(--rb-accent-ink)]"
                  >
                    {h}
                  </li>
                ))}
              </ul>
            </div>

            {/* Technical body — row 1: vista técnica beside the spec sheet;
                row 2: explosionada + pallet as a side-by-side pair. Live rows
                carry no diagram geometry yet (rb_diagram_specs, Wave 4), so the
                drawings render only when present; otherwise the fiche is spec-led. */}
            <div className="space-y-8 p-4 md:space-y-10 md:p-9">
              <div
                className={`grid gap-8 md:gap-10 ${product.diagrams ? 'lg:grid-cols-[minmax(320px,460px)_1fr]' : ''} ${
                  product.diagrams && idx % 2 === 1 ? 'lg:[direction:rtl]' : ''
                }`}
              >
                {product.diagrams ? (
                  <div className="lg:[direction:ltr]">
                    <TechDraw>
                      <PackingDiagram spec={product.diagrams.packing} />
                    </TechDraw>
                  </div>
                ) : null}

                <dl className="divide-y divide-neutral-100 lg:[direction:ltr]">
                  {product.specs.map((row) => (
                    <div
                      key={row.label}
                      className="grid grid-cols-[28px_150px_1fr] items-baseline gap-4 py-3.5 md:grid-cols-[28px_180px_1fr]"
                    >
                      <span className="self-center text-[var(--rb-accent-ink)]">
                        <SpecIcon id={row.icon} />
                      </span>
                      <dt className="text-[13px] uppercase tracking-widest-2 text-neutral-500">
                        {row.label}
                      </dt>
                      <dd className="font-mono text-mono-md tabular-nums text-neutral-900">
                        {row.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>

              {product.diagrams ? (
                <div className="grid gap-8 md:gap-10 lg:grid-cols-2">
                  <TechDraw>
                    <ExplodedDiagram
                      spec={product.diagrams.packing}
                      axis={product.diagrams.explodeAxis}
                      caption={product.diagrams.explodeCaption}
                    />
                  </TechDraw>
                  <TechDraw>
                    <PalletDiagram spec={product.diagrams.pallet} />
                  </TechDraw>
                </div>
              ) : null}
            </div>

            <div className="px-7 pb-7 md:px-9 md:pb-9">
              <Link
                href={`/marcas/${brand.slug}/contenedor?producto=${product.slug}`}
                className="inline-flex h-12 w-full items-center justify-center rounded-wings bg-[var(--rb-accent-ink)] px-6 text-label-lg font-semibold text-white transition-opacity hover:opacity-90 md:w-auto md:px-10"
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
