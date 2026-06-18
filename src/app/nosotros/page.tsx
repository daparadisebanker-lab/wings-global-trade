// src/app/nosotros/page.tsx
import type { Metadata } from 'next'
import Link from 'next/link'
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

      {/* Dark hero */}
      <section className="min-h-[60vh] flex items-end bg-[#000C1F] hero-grain px-6 pb-20 pt-40 md:px-10 md:pb-28">
        <div className="max-w-4xl">
          <div className="wings-rule mb-8" />
          <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-warm-white/30 mb-6">
            Nosotros
          </p>
          <h1 className="font-display text-display-xl font-light text-warm-white leading-[0.95] tracking-[-0.02em]">
            Operadores de comercio.<br />No intermediarios.
          </h1>
          <p className="mt-8 font-body text-body-lg text-warm-white/60 max-w-2xl leading-relaxed">
            Wings Global Trade opera con infraestructura real en zonas francas del Pacífico Sur.
            Seguimiento en 24 horas. Sin promesas vacías.
          </p>
        </div>
      </section>

      {/* What we do — warm-white */}
      <section className="bg-[#F8F6F0] py-20 md:py-28 px-6 md:px-10">
        <div className="max-w-6xl mx-auto grid grid-cols-1 gap-16 lg:grid-cols-2">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-navy/40 mb-4">
              01 — Qué hacemos
            </p>
            <h2 className="font-display text-display-sm font-light text-navy mb-6">
              Importación técnica desde el Pacífico
            </h2>
            <p className="font-body text-body-lg leading-relaxed text-navy/70">
              Wings Global Trade conecta a importadores de América Latina con fabricantes
              certificados de China, Japón, Tailandia y Dubái. Gestionamos la importación de
              maquinaria agrícola, vehículos comerciales, equipo industrial y repuestos, con
              operación documental y logística desde zonas francas.
            </p>
            <p className="mt-4 font-body text-body-lg leading-relaxed text-navy/70">
              Nuestro enfoque es técnico y directo: precios CIF transparentes, especificaciones
              verificables y un canal de comunicación constante con el comprador.
            </p>
          </div>

          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-navy/40 mb-4">
              02 — Zonas francas
            </p>
            <h2 className="font-display text-display-sm font-light text-navy mb-6">
              Infraestructura en origen
            </h2>
            <ul className="space-y-4">
              {FREE_ZONES.map((z) => (
                <li key={z.name} className="border border-[rgba(0,30,80,0.08)] bg-surface-card p-5">
                  <p className="font-mono text-sm text-gold tracking-[0.06em]">{z.name}</p>
                  <p className="mt-1 font-body text-sm text-navy/50">{z.location}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Markets — navy */}
      <section className="bg-[#000C1F] py-20 md:py-28 px-6 md:px-10">
        <div className="max-w-6xl mx-auto">
          <div className="wings-rule mb-12" />
          <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-warm-white/30 mb-4">
                Mercados de origen
              </p>
              <p className="font-display text-display-lg font-light text-gold leading-snug">
                {SOURCE_MARKETS.join(' · ')}
              </p>
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-warm-white/30 mb-4">
                Mercados atendidos
              </p>
              <p className="font-display text-display-lg font-light text-warm-white leading-snug">
                {MARKETS_SERVED.join(' · ')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA — warm-white */}
      <section className="bg-[#F8F6F0] py-20 md:py-28 px-6 md:px-10">
        <div className="max-w-6xl mx-auto">
          <div className="wings-rule mb-8" />
          <div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
            <h2 className="max-w-lg font-display text-display-md font-light text-navy leading-[1.05] tracking-[-0.02em]">
              Conversemos sobre tu próxima importación
            </h2>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Link
                href="/mister"
                className="inline-flex items-center gap-3 bg-gold px-8 py-4 font-mono text-[11px] uppercase tracking-[0.12em] text-navy hover:bg-gold-hover transition-colors duration-200"
              >
                <span className="h-px w-6 bg-current" aria-hidden />
                Hablar con Mister
              </Link>
              <Link
                href="/catalogo"
                className="inline-flex items-center gap-3 border border-[rgba(0,30,80,0.2)] px-8 py-4 font-mono text-[11px] uppercase tracking-[0.12em] text-navy/70 hover:border-gold/40 hover:text-gold transition-all duration-200"
              >
                Ver catálogo
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
