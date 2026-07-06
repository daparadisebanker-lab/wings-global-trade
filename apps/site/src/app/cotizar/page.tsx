// src/app/cotizar/page.tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import { QuotationForm } from '@/components/features/quotation/QuotationForm'

export const metadata: Metadata = {
  title: 'Solicitar cotización — Wings Global Trade',
  description:
    'Solicita una cotización CIF para importar maquinaria agrícola, camiones, buses o equipo industrial desde China, Japón y Tailandia para América Latina.',
  openGraph: {
    title: 'Solicitar cotización — Wings Global Trade',
    description:
      'Cotización CIF para importación B2B. Selecciona del catálogo y recibe una propuesta en 24 horas.',
    locale: 'es_PE',
    type: 'website',
    url: 'https://wingsglobaltrade.com/cotizar',
  },
  alternates: {
    canonical: 'https://wingsglobaltrade.com/cotizar',
  },
}

export default function CotizarPage() {
  return (
    <>
      {/* Dark hero */}
      <section className="relative min-h-[min(50vh,_420px)] flex items-end bg-[#000C1F] hero-grain overflow-hidden px-6 pb-16 pt-36 md:px-10 md:pb-24">
        <div className="mx-auto w-full max-w-6xl">
          <div className="max-w-2xl">
            <div className="wings-rule mb-8" />
            <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.15em] text-warm-white/50">
              Cotización · Wings Global Trade
            </p>
            <h1 className="font-display text-display-xl font-light text-warm-white leading-[0.95] tracking-[-0.02em]">
              Solicita tu cotización.
            </h1>
            <p className="mt-6 font-body text-body-lg text-warm-white/50 max-w-lg">
              Selecciona del catálogo o describe lo que necesitas. Respondemos con una propuesta CIF
              en menos de 24 horas hábiles.
            </p>
          </div>

          {/* Quick data strip */}
          <div className="mt-10 flex flex-wrap gap-8 border-t border-warm-white/[0.07] pt-8">
            {[
              { value: '24h', label: 'Tiempo de respuesta' },
              { value: 'CIF', label: 'Precio puerta a puerta' },
              { value: '5+', label: 'Categorías disponibles' },
              { value: '0', label: 'Registros requeridos' },
            ].map((s) => (
              <div key={s.label}>
                <div className="font-display text-2xl font-light text-gold leading-none">{s.value}</div>
                <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-warm-white/50">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Form section */}
      <section className="bg-[#F8F6F0] px-6 py-20 md:px-10 md:py-28">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-16 lg:grid-cols-[1fr_320px]">
          {/* Form */}
          <QuotationForm />

          {/* Sidebar info */}
          <aside className="hidden lg:block">
            <div className="sticky top-28 space-y-10">
              <div>
                <p className="mb-4 font-mono text-[9px] uppercase tracking-[0.18em] text-navy/35">
                  ¿Cómo funciona?
                </p>
                <ol className="flex flex-col gap-5">
                  {[
                    { n: '01', text: 'Completa el formulario con el producto y destino.' },
                    { n: '02', text: 'Nuestro equipo evalúa fabricantes y condiciones de origen.' },
                    { n: '03', text: 'Recibes una cotización CIF detallada en 24 horas.' },
                    { n: '04', text: 'Coordinamos la importación vía zona franca.' },
                  ].map((s) => (
                    <li key={s.n} className="flex gap-4">
                      <span className="mt-0.5 font-mono text-[9px] tracking-[0.15em] text-gold/50 shrink-0">{s.n}</span>
                      <span className="font-body text-sm leading-relaxed text-navy/60">{s.text}</span>
                    </li>
                  ))}
                </ol>
                <Link
                  href="/proceso"
                  className="mt-6 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.10em] text-gold transition-colors hover:text-gold-hover"
                >
                  <span className="h-px w-4 bg-current" aria-hidden />
                  Ver proceso completo
                </Link>
              </div>

              <div className="border-t border-[rgba(0,30,80,0.08)] pt-8">
                <p className="mb-3 font-mono text-[9px] uppercase tracking-[0.18em] text-navy/35">
                  ¿Prefieres hablar?
                </p>
                <Link
                  href="/mister"
                  className="inline-flex w-full items-center justify-center gap-3 border border-[rgba(0,30,80,0.15)] px-5 py-3 font-mono text-[11px] uppercase tracking-[0.10em] text-navy/60 transition-all duration-200 hover:border-gold/30 hover:text-navy"
                >
                  <span className="h-px w-4 bg-gold/40" aria-hidden />
                  Mister IA
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </>
  )
}
