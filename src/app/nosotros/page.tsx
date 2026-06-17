// src/app/nosotros/page.tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import { PageHero } from '@/components/features/shared/PageHero'
import { SectionBlock } from '@/components/features/shared/SectionBlock'
import { Button } from '@/components/ui/button'
import { JsonLd } from '@/components/seo/JsonLd'
import { faqSchema, WINGS_FAQS, breadcrumbSchema } from '@/lib/schema'
import { FREE_ZONES, SOURCE_MARKETS, MARKETS_SERVED } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'Nosotros — Wings Global Trade | Zona Franca LATAM',
  description:
    'Wings Global Trade opera en ZOFRATACNA y ZOFRI. Importación B2B para distribuidores en LATAM desde China, Japón y Dubai. Precisión. Proximidad. Confianza.',
  openGraph: {
    title: 'Nosotros — Wings Global Trade | Zona Franca LATAM',
    description:
      'Wings Global Trade opera en ZOFRATACNA y ZOFRI. Importación B2B para distribuidores en LATAM desde China, Japón y Dubai. Precisión. Proximidad. Confianza.',
    locale: 'es_PE',
    type: 'website',
    url: 'https://wingsglobaltrade.com/nosotros',
  },
  alternates: {
    canonical: 'https://wingsglobaltrade.com/nosotros',
  },
}

const breadcrumbs = [
  { name: 'Inicio', url: 'https://wingsglobaltrade.com' },
  { name: 'Nosotros', url: 'https://wingsglobaltrade.com/nosotros' },
]

export default function NosotrosPage() {
  return (
    <>
      <JsonLd data={faqSchema(WINGS_FAQS)} />
      <JsonLd data={breadcrumbSchema(breadcrumbs)} />

      {/* Per ENRICHED_SPEC §3.3 — exact H1 */}
      <PageHero
        eyebrow="Nosotros"
        title="Operadores de comercio. No intermediarios."
        subtitle="Wings Global Trade opera con infraestructura real en zonas francas del Pacífico Sur. Seguimiento en 24 horas. Sin promesas vacías."
      />

      {/* warm-white */}
      <SectionBlock theme="warm-white">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-display-sm font-semibold text-navy">Qué hacemos</h2>
            <p className="mt-4 font-body text-base leading-relaxed text-text-mono">
              Wings Global Trade conecta a importadores de América Latina con fabricantes
              certificados de China, Japón, Tailandia y Dubái. Gestionamos la importación de
              maquinaria agrícola, vehículos comerciales, equipo industrial y repuestos, con
              operación documental y logística desde zonas francas.
            </p>
            <p className="mt-4 font-body text-base leading-relaxed text-text-mono">
              Nuestro enfoque es técnico y directo: precios CIF transparentes, especificaciones
              verificables y un canal de comunicación constante con el comprador.
            </p>
          </div>
          <div>
            <h2 className="font-display text-display-sm font-semibold text-navy">Zonas francas</h2>
            <ul className="mt-4 space-y-3">
              {FREE_ZONES.map((z) => (
                <li key={z.name} className="rounded-wings-card border border-border-default bg-white p-4">
                  <p className="font-mono text-sm text-gold">{z.name}</p>
                  <p className="mt-1 font-body text-sm text-text-muted">{z.location}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </SectionBlock>

      {/* navy */}
      <SectionBlock theme="navy">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
          <div>
            <p className="mb-3 font-mono text-xs uppercase tracking-widest-2 text-text-muted-inverse">
              Mercados de origen
            </p>
            <p className="font-mono text-lg text-warm-white">{SOURCE_MARKETS.join(' · ')}</p>
          </div>
          <div>
            <p className="mb-3 font-mono text-xs uppercase tracking-widest-2 text-text-muted-inverse">
              Mercados atendidos
            </p>
            <p className="font-mono text-lg text-warm-white">{MARKETS_SERVED.join(' · ')}</p>
          </div>
        </div>
      </SectionBlock>

      {/* warm-white CTA — internal links: nosotros→/catalogo + /accio per ia-architect.md */}
      <SectionBlock theme="warm-white">
        <div className="flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
          <h2 className="max-w-xl font-display text-display-md font-semibold text-navy">
            Conversemos sobre tu próxima importación
          </h2>
          <div className="flex gap-3">
            <Link href="/accio">
              <Button>Calcular mi importación</Button>
            </Link>
            <Link href="/catalogo">
              <Button variant="secondary" className="text-navy">
                Ver catálogo
              </Button>
            </Link>
          </div>
        </div>
      </SectionBlock>
    </>
  )
}
