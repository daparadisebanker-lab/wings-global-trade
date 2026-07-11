// src/app/(brands)/marcas/[brand]/page.tsx
// Brand shelf — About (SPEC §2.4.1): hero, mandate block, story. Carries the
// Faire-style conversion weight; typography-led interim (launch-gate option)
// until the hero photography set lands.
import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { getBrand } from '@/lib/rb/fixtures'
import { MandateSeal } from '@/components/features/brands/MandateSeal'
import { BrandHero } from '@/components/features/brands/BrandHero'
import { BrandMarquee } from '@/components/features/brands/BrandMarquee'
import { BrandGallery } from '@/components/features/brands/BrandGallery'

interface PageProps {
  params: Promise<{ brand: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { brand: slug } = await params
  const brand = getBrand(slug)
  if (!brand) return {}
  return {
    title: `${brand.name} Perú — distribuidor oficial por contenedor`,
    description: `Wings Global Trade es socio comercial oficial de ${brand.name} en ${brand.territory}. ${brand.categoryLabel}. Venta mayorista exclusiva por contenedor completo o por cupos.`,
  }
}

export default async function BrandAboutPage({ params }: PageProps) {
  const { brand: slug } = await params
  const brand = getBrand(slug)
  if (!brand) notFound()

  return (
    <div className="mx-auto max-w-6xl px-5 py-14 md:px-8 md:py-20">
      {/* Hero — typography-led, brand tint band */}
      <header className="grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:items-center">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-widest-2 text-[var(--rb-accent-ink)]">
            {brand.code} · Representada desde {brand.representedSince}
          </p>
          <div className="mt-6">
            <Image
              src={brand.logo.isologo}
              alt={`Logotipo de ${brand.name}`}
              width={340}
              height={120}
              priority
              className="h-20 w-auto md:h-28"
            />
          </div>
          <div className="mt-6 h-[3px] w-16 bg-[var(--rb-accent)]" />
          <p className="mt-5 text-body-lg text-neutral-700">{brand.categoryLabel}</p>
          <p className="text-body-md text-neutral-500">
            Territorio del mandato: {brand.territory}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={`/marcas/${brand.slug}/contenedor`}
              className="inline-flex h-12 items-center justify-center rounded-wings bg-[var(--rb-accent-ink)] px-7 text-label-lg font-semibold text-white transition-opacity hover:opacity-90"
            >
              Ver disponibilidad en contenedor
            </Link>
            <Link
              href={`/marcas/${brand.slug}/productos`}
              className="inline-flex h-12 items-center justify-center rounded-wings border border-neutral-300 px-7 text-label-lg font-medium text-neutral-800 transition-colors hover:border-[var(--rb-accent)]"
            >
              Catálogo
            </Link>
          </div>
        </div>
        <BrandHero
          brand={{ name: brand.name, claim: brand.claim, logo: brand.logo, heroSlides: brand.heroSlides }}
        />
      </header>

      {/* Mandate */}
      <section className="mt-16 max-w-2xl" aria-label="Mandato de representación" data-reveal>
        <MandateSeal
          brandName={brand.name}
          territory={brand.territory}
          scope={brand.mandateScope}
          since={brand.representedSince}
        />
      </section>

      {/* Vocabulary marquee — §2.7⑥, full-bleed inside the canvas */}
      <div className="mt-16 -mx-5 md:-mx-8">
        <BrandMarquee items={brand.vocabulary} />
      </div>

      {/* Story — word-scrub per the Odd Ritual grammar */}
      <section className="mt-16" aria-labelledby="story-heading">
        <h2 id="story-heading" className="font-mono text-mono-sm uppercase tracking-widest-2 text-neutral-500">
          La marca
        </h2>
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          {brand.story.map((block) => (
            <p
              key={block.slice(0, 24)}
              data-split-words
              className="text-body-md leading-relaxed text-neutral-700"
            >
              {block}
            </p>
          ))}
        </div>
        <p className="mt-8 border-l-2 border-[var(--rb-accent)] pl-4 text-body-sm text-neutral-500" data-reveal>
          {brand.certificationsNote}
        </p>
      </section>

      {/* Gallery — drag-to-explore (attested imagery only) */}
      <section className="mt-16 border-t border-neutral-200 pt-12" aria-label="Galería de la marca">
        <h2 className="font-mono text-mono-sm uppercase tracking-widest-2 text-neutral-500" data-reveal>
          En imágenes
        </h2>
        <div className="mt-6">
          <BrandGallery
            items={brand.heroSlides
              .filter((s) => s.kind === 'image' && s.src)
              .map((s, i) => ({
                src: s.src as string,
                alt: s.alt ?? brand.name,
                caption: ['Producto · pack ×10 rollos', 'Rollo de fibra sin blanquear', 'Origen · fibra de bambú'][i] ?? brand.name,
              }))}
          />
        </div>
      </section>
    </div>
  )
}
