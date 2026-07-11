// src/app/(brands)/marcas/page.tsx
// Represented Brands program sub-home (SPEC §2.3). White canvas starts here.
import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { FillMeter } from '@wings/trade-ui'
import { RB_BRANDS } from '@/lib/rb/fixtures'

export const metadata: Metadata = {
  title: 'Marcas representadas — venta exclusiva por contenedor',
  description:
    'Wings Global Trade es socio comercial oficial de marcas internacionales en Perú. Venta mayorista exclusivamente por contenedor completo o por cupos, con inventario gestionado por Wings.',
}

const STEPS = [
  {
    n: '01',
    title: 'Elegir la marca',
    body: 'Cada marca representada tiene su catálogo con fichas técnicas completas: GTIN, empaque máster, medidas y peso por caja.',
  },
  {
    n: '02',
    title: 'Configurar el contenedor',
    body: 'Se compra por contenedor completo o por cupos. El instrumento muestra la cascada exacta: cupos, cajas, paquetes, unidades y kilos.',
  },
  {
    n: '03',
    title: 'Asegurar los cupos',
    body: 'La reserva es documentada, sin pago en línea, con vigencia de 72 horas. Un asesor confirma condiciones y coordina la entrega en Callao.',
  },
]

export default function MarcasPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24">
      {/* Program header */}
      <header className="max-w-3xl">
        <p className="font-mono text-mono-sm uppercase tracking-widest-2 text-[var(--livery-gold)]">
          Programa · Representación oficial
        </p>
        <h1 className="mt-3 font-display text-display-lg text-neutral-900">
          Marcas representadas
        </h1>
        <p className="mt-5 text-body-lg text-neutral-600">
          Wings Global Trade actúa como socio comercial oficial de marcas internacionales
          para el territorio peruano. La venta es exclusivamente mayorista y por
          contenedor — completo o por cupos — con inventario gestionado por Wings de
          origen a Callao.
        </p>
      </header>

      {/* Brand roster */}
      <section className="mt-16" aria-labelledby="roster-heading">
        <h2 id="roster-heading" className="font-mono text-mono-sm uppercase tracking-widest-2 text-neutral-500">
          Marcas en representación
        </h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {RB_BRANDS.map((brand) => (
            <Link
              key={brand.slug}
              href={`/marcas/${brand.slug}`}
              data-brand={brand.slug}
              data-reveal
              className="group border border-neutral-200 bg-white p-8 transition-colors hover:border-[var(--rb-accent)]"
            >
              <div className="flex h-20 items-center">
                <Image
                  src={brand.logo.isologo}
                  alt={`Logotipo de ${brand.name}`}
                  width={180}
                  height={64}
                  className="h-14 w-auto"
                />
              </div>
              <div className="mt-6 h-[3px] w-12 bg-[var(--rb-accent)] transition-all group-hover:w-20" />
              <p className="mt-4 text-body-md font-medium text-neutral-900">{brand.categoryLabel}</p>
              <p className="mt-1 text-body-sm text-neutral-500">
                Territorio del mandato: {brand.territory}
              </p>
              <p className="mt-5 font-mono text-[11px] uppercase tracking-widest-2 text-[var(--rb-accent-ink)]">
                {brand.code} · Representada desde {brand.representedSince}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* How container purchase works */}
      <section className="mt-20 border-t border-neutral-200 pt-14" aria-labelledby="how-heading">
        <div className="grid gap-10 lg:grid-cols-[1fr_minmax(280px,380px)] lg:items-start">
          <div>
            <h2 id="how-heading" className="font-display text-display-sm text-neutral-900" data-split>
              Cómo funciona la compra por contenedor
            </h2>
            <ol className="mt-8 grid gap-8 md:grid-cols-3">
              {STEPS.map((s) => (
                <li key={s.n}>
                  <span className="font-mono text-mono-lg text-[var(--livery-gold)]">{s.n}</span>
                  <h3 className="mt-2 text-body-md font-semibold text-neutral-900">{s.title}</h3>
                  <p className="mt-2 text-body-sm text-neutral-600">{s.body}</p>
                </li>
              ))}
            </ol>
          </div>
          <div className="border border-neutral-200 bg-neutral-50/60 p-6">
            <p className="font-mono text-[11px] uppercase tracking-widest-2 text-neutral-500">
              Contenedor en llenado — ejemplo
            </p>
            <div className="mt-4">
              <FillMeter totalSlots={10} committedSlots={3} reservedSlots={2} showLegend size="md" />
            </div>
            <p className="mt-4 text-body-sm text-neutral-600">
              Cada contenedor se divide en cupos. Un cupo es una fracción fija con su
              equivalencia exacta en cajas, unidades y kilos — siempre visible.
            </p>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="mt-20 border border-neutral-200 bg-neutral-50/60 p-8 md:p-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="max-w-xl">
            <h2 className="font-display text-display-sm text-neutral-900">
              ¿Su marca busca representación en Perú?
            </h2>
            <p className="mt-3 text-body-md text-neutral-600">
              Wings evalúa mandatos de representación con gestión de inventario y venta
              por contenedor. Escríbanos y un asesor coordina la conversación.
            </p>
          </div>
          <Link
            href="/contacto"
            className="inline-flex h-12 shrink-0 items-center justify-center rounded-wings bg-navy px-8 text-label-lg font-semibold text-warm-white transition-colors hover:bg-navy-light"
          >
            Iniciar conversación
          </Link>
        </div>
      </section>
    </div>
  )
}
