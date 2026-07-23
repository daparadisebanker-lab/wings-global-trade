// src/app/page.tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { RB_BRANDS } from '@/lib/rb/fixtures'
import { getNavCategories } from '@/lib/catalog-data'
import { HeroNarrativeCarousel } from '@/components/features/homepage/HeroNarrativeCarousel'
import { StatBar } from '@/components/features/homepage/StatBar'
import { CategoryGrid } from '@/components/features/homepage/CategoryGrid'
import { TrustBar } from '@/components/features/homepage/TrustBar'
import { MarketMap } from '@/components/features/homepage/MarketMap'
import { BrandMarquee } from '@/components/features/homepage/BrandMarquee'
import { SectionBlock } from '@/components/features/shared/SectionBlock'
import { JsonLd } from '@/components/seo/JsonLd'
import { websiteSchema } from '@/lib/schema'

export const metadata: Metadata = {
  title: 'Wings Global Trade — Importación B2B para LATAM',
  description:
    'Importa maquinaria agrícola, camiones, buses y equipamiento industrial desde China para América Latina. Mister es tu asistente IA para importar y nacionalizar. Wings Global Trade.',
  openGraph: {
    title: 'Wings Global Trade — Importación B2B para LATAM',
    description:
      'Importa maquinaria agrícola, camiones, buses y equipamiento industrial desde China para América Latina. Mister es tu asistente IA para importar y nacionalizar. Wings Global Trade.',
    locale: 'es_PE',
    type: 'website',
    url: 'https://wingsglobaltrade.com/',
  },
  alternates: {
    canonical: 'https://wingsglobaltrade.com/',
  },
}

export default async function HomePage() {
  const categories = await getNavCategories()

  return (
    <>
      <JsonLd data={websiteSchema()} />

      {/* Hero — scroll narrative pin → becomes carousel on desktop; straight carousel on mobile */}
      <HeroNarrativeCarousel />

      {/* Stats bar */}
      <StatBar />

      {/* Category grid — warm-white */}
      <SectionBlock theme="warm-white" className="pt-14 md:pt-20">
        <CategoryGrid categories={categories} />
      </SectionBlock>

      {/* Marcas representadas — program intro (SPEC §2.1: after category
          architecture, before proof; the white brand canvas starts at /marcas,
          never here — brand logos render on white tiles inside the navy band) */}
      <SectionBlock theme="navy">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl">
            <p className="mb-4 font-mono text-[10px] uppercase tracking-widest-3 text-warm-white/30">
              Marcas representadas
            </p>
            <h2 className="font-display text-display-sm font-light text-warm-white">
              Representación oficial de marcas — venta exclusivamente por contenedor
            </h2>
            <p className="mt-4 font-body text-body-lg text-warm-white/45">
              Wings gestiona el inventario y vende por contenedor completo o por cupos,
              con la equivalencia exacta en cajas, unidades y kilos siempre visible.
            </p>
            <Link
              href="/marcas"
              className="mt-8 inline-flex items-center gap-3 bg-gold px-8 py-4 font-mono text-[11px] uppercase tracking-[0.12em] text-navy transition-colors duration-200 hover:bg-gold-hover"
            >
              <span className="h-px w-6 bg-current" aria-hidden />
              Ver marcas
            </Link>
          </div>
          <div className="flex flex-wrap gap-4">
            {RB_BRANDS.map((brand) => (
              <Link
                key={brand.slug}
                href={`/marcas/${brand.slug}`}
                className="group flex w-56 flex-col items-center gap-3 bg-white p-8 transition-transform duration-200 hover:-translate-y-0.5"
              >
                <Image
                  src={brand.logo.isologo}
                  alt={`Logotipo de ${brand.name}`}
                  width={150}
                  height={54}
                  className="h-12 w-auto"
                />
                <span className="font-mono text-[10px] uppercase tracking-widest-2 text-neutral-500">
                  {brand.code} · desde {brand.representedSince}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </SectionBlock>

      {/* Trust bar — navy */}
      <SectionBlock theme="navy">
        <BrandMarquee />
        <div className="mb-14">
          <p className="mb-4 font-mono text-[10px] uppercase tracking-widest-3 text-warm-white/30">Inteligencia comercial</p>
          <h2 className="font-display text-display-sm font-light text-warm-white">
            Una operación construida sobre credenciales verificables
          </h2>
        </div>
        <TrustBar />
      </SectionBlock>

      {/* Market map — navy */}
      <SectionBlock theme="navy" className="pt-10 md:pt-14">
        <MarketMap />
      </SectionBlock>

      {/* Mister CTA — navy (merges into footer) */}
      <SectionBlock theme="navy">
        <div className="flex flex-col items-start gap-10 md:flex-row md:items-end md:justify-between">
          <div className="max-w-xl">
            <p className="mb-4 font-mono text-[10px] uppercase tracking-widest-3 text-warm-white/30">Mister · Asistente IA</p>
            <h2 className="font-display text-display-md font-light text-warm-white">
              ¿Necesitas importar desde China? Mister te guía.
            </h2>
            <p className="mt-4 font-body text-body-lg text-warm-white/45">
              Cotización CIF, zona franca, aranceles y nacionalización. Sin llamadas previas.
            </p>
          </div>
          <Link
            href="/mister"
            className="inline-flex shrink-0 items-center gap-3 bg-gold px-8 py-4 font-mono text-[11px] uppercase tracking-[0.12em] text-navy transition-colors duration-200 hover:bg-gold-hover"
          >
            <span className="h-px w-6 bg-current" aria-hidden />
            Hablar con Mister
          </Link>
        </div>
      </SectionBlock>
    </>
  )
}
