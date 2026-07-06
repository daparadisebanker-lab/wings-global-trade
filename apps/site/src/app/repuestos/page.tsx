import type { Metadata } from 'next'
import { AnimatedInteriorHero } from '@/components/features/shared/AnimatedInteriorHero'
import { EngineDatabase } from '@/components/features/repuestos/EngineDatabase'

export const metadata: Metadata = {
  title: 'Motores JDM — Repuestos Wings Global Trade',
  description:
    'Catálogo de motores usados de origen japonés: Toyota, Nissan, Honda, Mazda, Subaru, Mitsubishi, Suzuki, Daihatsu. Filtrado por marca, cilindrada, potencia y tipo de vehículo.',
}

export default function RepuestosPage() {
  return (
    <>
      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <section className="relative min-h-[50vh] flex items-end bg-[#000C1F] hero-grain overflow-hidden px-6 pb-20 pt-40 md:px-10 md:pb-28">

        {/* Engine — full-bleed background across the entire hero */}
        <div className="absolute inset-0" aria-hidden>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/engine-hero.png"
            alt=""
            className="h-full w-full object-cover object-center"
          />
          {/* Dark overlay — bottom heavy so text stays readable */}
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(to top, rgba(0,12,31,0.92) 0%, rgba(0,12,31,0.65) 50%, rgba(0,12,31,0.45) 100%)' }}
          />
        </div>

        {/* Content — constrained to left half on desktop so engine breathes on right */}
        <div className="relative z-10 mx-auto w-full max-w-6xl">
          <div className="md:max-w-[52%]">
            <div className="wings-rule mb-8" />
            <AnimatedInteriorHero
              overline="Repuestos · Motores JDM"
              headline={['Motores de origen japonés.']}
              subtitle="Catálogo directo de Japón. Especificaciones técnicas verificadas por marca y modelo."
              dark
            />
          </div>
        </div>
      </section>

      {/* ── Database ───────────────────────────────────────────────────── */}
      <section className="bg-warm-white px-6 py-14 md:px-10">
        <div className="mx-auto max-w-6xl">
          <EngineDatabase />
        </div>
      </section>

      {/* ── CTA strip ──────────────────────────────────────────────────── */}
      <section className="border-t border-[rgba(0,30,80,0.08)] bg-warm-white px-6 py-12 md:px-10">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-navy/35">
                ¿Necesitas un motor específico?
              </p>
              <p className="mt-1 font-display text-xl font-light text-navy">
                Solicita una cotización directa.
              </p>
            </div>
            <a
              href="/cotizar"
              className="inline-flex items-center gap-3 bg-gold px-8 py-3.5 font-mono text-[11px] uppercase tracking-[0.12em] text-navy transition-colors duration-200 hover:bg-gold/80"
            >
              <span className="h-px w-5 bg-current" aria-hidden />
              Cotizar ahora
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
