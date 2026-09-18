// src/app/(lanes)/automoviles/marcas/[oem]/page.tsx
// WGT/07 brand sub-page — the arrival moment BrandCurtain floods in
// [data-oem]'s --oem-accent for. The content is the real fleet catalog —
// segment, engine, transmission, trims — not fabricated brand-story copy,
// since no OEM brand kit (photography, isologo, claim) exists in this repo
// yet. Orientation (breadcrumb, sticky accent bar) comes from AutoLaneNav
// in the shared layout — this page no longer carries its own separate
// sticky header, which would have stacked two sticky bars under the site
// header on mobile.
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getProducts } from '@/lib/catalog-data'
import { getOemBrand, OEM_BRANDS } from '@/lib/automoviles/oem-brands'
import { pluralizeCount } from '@/lib/pluralize'
import { BrandModelGrid } from '@/components/features/automoviles/BrandModelGrid'
import { SectionHero } from '@/components/features/automoviles/SectionHero'

interface PageProps {
  params: Promise<{ oem: string }>
}

export function generateStaticParams() {
  return OEM_BRANDS.map((b) => ({ oem: b.slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { oem } = await params
  const brand = getOemBrand(oem)
  if (!brand) return {}
  const title = `${brand.name} — Automóviles | Wings Global Trade`
  const description = `Catálogo ${brand.name}: ${brand.note}. Consulta técnica sin registro, cotización por unidad configurada o por contenedor.`
  const url = `https://wingsglobaltrade.com/automoviles/marcas/${brand.slug}`
  // First product of this brand with a real studio hero (index 0), if any —
  // the same "no image if none exists" discipline the generic catalog
  // product page already uses, never a fabricated OG asset.
  const { products } = await getProducts({ category: 'automoviles', brand: brand.filterBrand, limit: 1 })
  const ogImage = products[0]?.images?.[0]
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      locale: 'es_PE',
      type: 'website',
      url,
      ...(ogImage && { images: [{ url: ogImage, width: 1200, height: 630 }] }),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    // The old /catalogo/automoviles?brand=X redirect (next.config.mjs)
    // forwards its query string by default (documented Next.js redirect
    // behavior — a destination with no matching capture group doesn't
    // consume it), landing here as .../toyota?brand=Toyota. Canonical
    // points search engines at the clean URL regardless.
    alternates: { canonical: `/automoviles/marcas/${brand.slug}` },
  }
}

export default async function AutomovilesBrandPage({ params }: PageProps) {
  const { oem } = await params
  const brand = getOemBrand(oem)
  if (!brand) notFound()

  const { products } = await getProducts({ category: 'automoviles', brand: brand.filterBrand, limit: 50 })

  return (
    <div data-oem={brand.slug}>
      <SectionHero
        kicker="Automóviles / Marcas"
        title={brand.name}
        meta={pluralizeCount(products.length, 'línea de modelo', 'líneas de modelo')}
        description={`${brand.note}. Catálogo directo de fábrica — especificaciones básicas de referencia; la configuración final se confirma al cotizar.`}
        accentColor="var(--oem-accent)"
      />

      <div className="mx-auto max-w-6xl px-5 py-12 md:px-8 md:py-16">
        <BrandModelGrid products={products} brandName={brand.name} />

        <div className="mt-16 flex flex-col gap-6 border border-[color:var(--ink-decoration)] bg-[color:var(--surface-2)] p-8 md:flex-row md:items-center md:justify-between">
          <p className="max-w-xl text-body-md text-[color:var(--ink-secondary)]">
            Cotización por unidad configurada o por contenedor — un asesor confirma
            especificación exacta y condiciones.
          </p>
          <Link
            href="/cotizar"
            className="inline-flex h-12 shrink-0 items-center justify-center rounded-[var(--radius-control)] bg-[color:var(--oem-accent)] px-8 font-mono text-sm uppercase tracking-wide text-white transition-opacity hover:opacity-90"
          >
            Solicitar cotización — {brand.name}
          </Link>
        </div>
      </div>
    </div>
  )
}
