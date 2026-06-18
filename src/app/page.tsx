// src/app/page.tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import { getCategories } from '@/lib/catalog-data'
import { HeroSection } from '@/components/features/homepage/HeroSection'
import { CategoryGrid } from '@/components/features/homepage/CategoryGrid'
import { TrustBar } from '@/components/features/homepage/TrustBar'
import { MarketMap } from '@/components/features/homepage/MarketMap'
import { SectionBlock } from '@/components/features/shared/SectionBlock'
import { Button } from '@/components/ui/button'
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

      {/* Hero — navy */}
      <HeroSection />

      {/* Category grid — warm-white */}
      <SectionBlock theme="warm-white">
        <CategoryGrid categories={categories} />
      </SectionBlock>

      {/* Trust bar — navy */}
      <SectionBlock theme="navy">
        <div className="mb-10">
          <h2 className="font-display text-display-sm font-semibold text-warm-white">
            Una operación construida sobre credenciales verificables
          </h2>
        </div>
        <TrustBar />
      </SectionBlock>

      {/* Market map — warm-white */}
      <SectionBlock theme="warm-white">
        <MarketMap />
      </SectionBlock>

      {/* Mister CTA — navy (merges into footer) */}
      <SectionBlock theme="navy">
        <div className="flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
          <div className="max-w-xl">
            <h2 className="font-display text-display-md font-semibold text-warm-white">
              ¿Necesitas importar desde China? Mister te guía.
            </h2>
            <p className="mt-3 font-body text-body-lg text-text-muted-inverse">
              Mister es tu asistente con inteligencia artificial. Te acompaña en todo el proceso
              — cotización CIF, zona franca, aranceles y nacionalización. Sin llamadas previas.
            </p>
          </div>
          <Link href="/mister">
            <Button size="lg">Hablar con Mister</Button>
          </Link>
        </div>
      </SectionBlock>
    </>
  )
}
