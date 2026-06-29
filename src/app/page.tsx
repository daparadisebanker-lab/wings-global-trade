// src/app/page.tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import { getCategories } from '@/lib/catalog-data'
import { HeroScrollNarrative } from '@/components/features/homepage/HeroScrollNarrative'
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
  const categories = await getCategories()

  return (
    <>
      <JsonLd data={websiteSchema()} />

      {/* Hero — scroll-pinned narrative on desktop, static on mobile */}
      <HeroScrollNarrative />

      {/* Stats bar — dark, anchored to carousel base */}
      <StatBar />

      {/* Category grid — warm-white */}
      <SectionBlock theme="warm-white" className="pt-14 md:pt-20">
        <CategoryGrid categories={categories} />
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
