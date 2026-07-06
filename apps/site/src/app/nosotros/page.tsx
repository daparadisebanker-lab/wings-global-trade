import type { Metadata } from 'next'
import Link from 'next/link'
import { JsonLd } from '@/components/seo/JsonLd'
import { faqSchema, WINGS_FAQS, breadcrumbSchema, importHowToSchema } from '@/lib/schema'
import { FREE_ZONES, SOURCE_MARKETS, MARKETS_SERVED } from '@/lib/constants'
import { NosotrosHero } from '@/components/features/nosotros/NosotrosHero'
import { NosotrosProofBar } from '@/components/features/nosotros/NosotrosProofBar'
import { MarketTokenStagger } from '@/components/features/nosotros/MarketTokenStagger'
import { AnimatedWingsRule } from '@/components/features/nosotros/AnimatedWingsRule'

export const metadata: Metadata = {
  title: 'Nosotros — Wings Global Trade | Zona Franca LATAM',
  description:
    'Wings Global Trade opera en ZOFRATACNA y ZOFRI. Importación B2B para distribuidores en LATAM desde China, Japón, Tailandia y Dubai. Precisión. Proximidad. Confianza.',
  openGraph: {
    title: 'Nosotros — Wings Global Trade | Zona Franca LATAM',
    description:
      'Wings Global Trade opera en ZOFRATACNA y ZOFRI. Importación B2B para distribuidores en LATAM desde China, Japón, Tailandia y Dubai.',
    locale: 'es_PE',
    type: 'website',
    url: 'https://wingsglobaltrade.com/nosotros',
  },
  alternates: { canonical: 'https://wingsglobaltrade.com/nosotros' },
}

const breadcrumbs = [
  { name: 'Inicio', url: 'https://wingsglobaltrade.com' },
  { name: 'Nosotros', url: 'https://wingsglobaltrade.com/nosotros' },
]

const SPEC_ROWS = [
  { label: 'Régimen',                 value: 'Zona franca industrial — CIF' },
  { label: 'Mercados de origen',      value: 'China · Japón · Tailandia · Emiratos Árabes' },
  { label: 'Documentación',           value: 'B/L · Factura comercial · Cert. de origen · Fitosanitario' },
  { label: 'Plazo de respuesta',      value: '24 horas hábiles — consultas documentadas' },
  { label: 'Categorías',              value: 'Maquinaria agrícola · Vehículos comerciales · Equipo industrial · Repuestos' },
  { label: 'Zonas de operación',      value: 'ZOFRATACNA (Tacna, Perú) · ZOFRI (Iquique, Chile)' },
  { label: 'Mercados de destino',     value: 'Perú · Chile · Colombia · Panamá · Costa Rica · Bolivia · R. Dominicana' },
]

const WHY_WINGS = [
  {
    num: '01',
    title: 'Posición en zona franca',
    body: 'Operar desde ZOFRATACNA y ZOFRI significa que la mercancía entra en régimen franco y se despacha directamente desde el nodo logístico. El costo de internación es diferente desde dentro.',
  },
  {
    num: '02',
    title: 'Acceso directo a fabricantes',
    body: 'Acceso directo a fabricantes verificados en China, Japón, Tailandia y Dubai. El comprador recibe especificaciones técnicas, certificados y capacidad de producción verificable antes de cualquier compromiso.',
  },
  {
    num: '03',
    title: 'Mister — información antes de precio',
    body: 'Antes de cualquier compromiso, el importador resuelve sus preguntas técnicas y entiende la estructura del costo de internación a través de Mister. Menor incertidumbre en el primer contacto.',
  },
]

const PROCESS_STEPS = [
  {
    num: '01',
    title: 'Consulta',
    body: 'Nos cuentas qué necesitas importar, para qué mercado y en qué volumen aproximado, vía Mister o contacto directo.',
  },
  {
    num: '02',
    title: 'Cotización CIF documentada',
    body: 'Armamos una propuesta con especificaciones técnicas verificables, estructura de costo de internación y documentación de origen en 24 horas hábiles.',
  },
  {
    num: '03',
    title: 'Coordinación operativa',
    body: 'Coordinamos fabricante, flete, depósito en zona franca, tramitación aduanal y seguimiento hasta entrega en destino final.',
  },
]

export default function NosotrosPage() {
  return (
    <>
      <JsonLd data={faqSchema(WINGS_FAQS)} />
      <JsonLd data={breadcrumbSchema(breadcrumbs)} />
      <JsonLd data={importHowToSchema()} />

      {/* ── 1. Hero — navy ───────────────────────────────────────────── */}
      <section className="bg-[#000C1F] hero-grain overflow-hidden px-6 pb-0 pt-40 md:px-10">
        <div className="flex items-end min-h-[60vh] pb-16 md:pb-20">
          <NosotrosHero />
        </div>
        <NosotrosProofBar />
      </section>

      {/* ── 2. Zonas Francas — warm-white ─────────────────────────────── */}
      <section className="bg-[#F8F6F0] py-20 md:py-28 px-6 md:px-10">
        <div className="max-w-6xl mx-auto">
          <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-navy/40 mb-3">
            01 — Posiciones operativas
          </p>
          <AnimatedWingsRule className="mb-8" />
          <h2 className="font-display text-display-md font-light text-navy mb-16 max-w-xl leading-[1.1]">
            Dos posiciones en el corredor arancelario del Pacífico Sur
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {FREE_ZONES.map((z) => (
              <div
                key={z.name}
                className="relative border border-[rgba(0,30,80,0.07)] bg-[#FAFAF8] p-8 overflow-hidden"
              >
                {/* Year watermark */}
                <span
                  className="absolute bottom-4 right-6 font-display text-[7rem] font-light leading-none text-navy/[0.05] select-none pointer-events-none"
                  aria-hidden
                >
                  {z.name === 'ZOFRATACNA' ? '1988' : '1975'}
                </span>

                <div className="flex items-start justify-between mb-1">
                  <p className="font-mono text-sm text-gold tracking-[0.06em]">{z.name}</p>
                  <span className="font-mono text-[9px] text-navy/25 tracking-[0.08em] mt-0.5">
                    {z.name === 'ZOFRATACNA' ? '17°59′ S · 70°14′ O' : '20°13′ S · 70°10′ O'}
                  </span>
                </div>
                <p className="font-body text-sm text-navy/45 mb-7">{z.location}</p>

                <div className="space-y-0 relative">
                  {z.name === 'ZOFRATACNA' ? (
                    <>
                      <ZoneRow label="Régimen" value="Zona franca de transformación industrial" />
                      <ZoneRow label="Condición arancelaria" value="Suspensión arancelaria hasta destino final en Perú y Bolivia" />
                      <ZoneRow label="Autoridad" value="SUNAT — Aduanas del Perú" />
                      <ZoneRow label="Mercados de destino" value="Perú, Bolivia, sur de Colombia" />
                    </>
                  ) : (
                    <>
                      <ZoneRow label="Régimen" value="Zona franca comercial e industrial" />
                      <ZoneRow label="Condición arancelaria" value="Tránsito con 0% aranceles hacia Bolivia, Colombia y Ecuador" />
                      <ZoneRow label="Autoridad" value="Servicio Nacional de Aduanas de Chile" />
                      <ZoneRow label="Mercados de destino" value="Chile, Colombia, Panamá, Cono Sur" />
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. Trade Corridor — navy ──────────────────────────────────── */}
      <section className="bg-[#001E50] py-20 md:py-28 px-6 md:px-10">
        <div className="max-w-6xl mx-auto">
          <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-warm-white/30 mb-3">
            02 — Corredor comercial
          </p>
          <AnimatedWingsRule className="mb-8" />
          <h2 className="font-display text-display-md font-light text-warm-white mb-16 max-w-xl leading-[1.1]">
            Cuatro mercados de origen. Siete países de destino.
          </h2>

          <div className="grid grid-cols-1 gap-12 md:grid-cols-[5fr_1px_7fr]">
            <div className="md:pr-10">
              <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-warm-white/30 mb-5">
                Origen
              </p>
              <MarketTokenStagger
                markets={SOURCE_MARKETS}
                className="font-display text-display-lg font-light text-gold leading-snug"
              />
            </div>

            <div className="hidden md:block bg-warm-white/[0.06] self-stretch" />

            <div className="md:pl-10">
              <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-warm-white/30 mb-5">
                Destino
              </p>
              <MarketTokenStagger
                markets={MARKETS_SERVED}
                className="font-display text-display-lg font-light text-warm-white leading-snug"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. Perfil del Operador — warm-white ───────────────────────── */}
      <section className="bg-[#F8F6F0] py-20 md:py-28 px-6 md:px-10">
        <div className="max-w-6xl mx-auto">
          <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-navy/40 mb-3">
            03 — Ficha técnica
          </p>
          <AnimatedWingsRule className="mb-8" />
          <h2 className="font-display text-display-md font-light text-navy mb-12 max-w-xl leading-[1.1]">
            Ficha de operación
          </h2>

          <div>
            {SPEC_ROWS.map(({ label, value }) => (
              <div
                key={label}
                className="grid grid-cols-[minmax(0,1fr)_minmax(0,2fr)] gap-6 py-5 border-t border-[rgba(0,30,80,0.06)] first:border-0 items-baseline"
              >
                <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-navy/35 leading-relaxed">
                  {label}
                </span>
                <span className="font-body text-body-sm text-navy/70 leading-relaxed">
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. Por qué Wings — navy ───────────────────────────────────── */}
      <section className="bg-[#001E50] py-20 md:py-28 px-6 md:px-10">
        <div className="max-w-6xl mx-auto">
          <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-warm-white/30 mb-3">
            04 — Posición
          </p>
          <AnimatedWingsRule className="mb-8" />
          <h2 className="font-display text-display-md font-light text-warm-white mb-16 max-w-lg leading-[1.1]">
            La posición es el argumento
          </h2>

          <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
            {WHY_WINGS.map(({ num, title, body }) => (
              <div key={num} className="border-t border-warm-white/[0.08] pt-6">
                <span className="font-mono text-[10px] text-gold/60 tracking-[0.12em] mb-5 block">
                  {num}
                </span>
                <h3 className="font-display text-display-sm font-light text-warm-white mb-4 leading-snug">
                  {title}
                </h3>
                <p className="font-body text-body-sm text-warm-white/55 leading-relaxed">
                  {body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. Proceso de Importación — warm-white ────────────────────── */}
      <section className="bg-[#F8F6F0] py-20 md:py-28 px-6 md:px-10">
        <div className="max-w-6xl mx-auto">
          <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-navy/40 mb-3">
            05 — Flujo de operación
          </p>
          <AnimatedWingsRule className="mb-8" />
          <h2 className="font-display text-display-md font-light text-navy mb-16 max-w-lg leading-[1.1]">
            Tres pasos. Una cotización documentada.
          </h2>

          <div className="grid grid-cols-1 gap-0 md:grid-cols-3">
            {PROCESS_STEPS.map(({ num, title, body }, i) => (
              <div
                key={num}
                className={[
                  'py-10 px-8',
                  i < PROCESS_STEPS.length - 1
                    ? 'border-b md:border-b-0 md:border-r border-[rgba(0,30,80,0.06)]'
                    : '',
                ].join(' ')}
              >
                <span className="font-mono text-[10px] text-gold tracking-[0.12em] mb-6 block">
                  {num}
                </span>
                <h3 className="font-display text-display-sm font-light text-navy mb-3 leading-snug">
                  {title}
                </h3>
                <p className="font-body text-body-sm text-navy/55 leading-relaxed">
                  {body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 7. CTA — navy ─────────────────────────────────────────────── */}
      <section className="bg-[#000C1F] py-20 md:py-28 px-6 md:px-10">
        <div className="max-w-6xl mx-auto">
          <AnimatedWingsRule className="mb-8" />

          <div className="flex flex-col gap-12 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="max-w-lg font-display text-display-md font-light text-warm-white leading-[1.05] tracking-[-0.02em] mb-5">
                La primera conversación es técnica. Sin precio adjunto.
              </h2>
              <p className="font-body text-body-sm text-warm-white/35 max-w-md leading-relaxed">
                Mister resuelve las preguntas de estructura antes de cualquier cotización formal. Para el catálogo, respondemos en 24 horas hábiles.
              </p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center shrink-0">
              <Link
                href="/mister"
                className="inline-flex items-center gap-3 bg-gold px-8 py-4 font-mono text-[11px] uppercase tracking-[0.12em] text-navy hover:bg-gold-hover transition-colors duration-200"
              >
                <span className="h-px w-6 bg-current" aria-hidden />
                Hablar con Mister
              </Link>
              <Link
                href="/catalogo"
                className="inline-flex items-center gap-3 border border-warm-white/[0.15] px-8 py-4 font-mono text-[11px] uppercase tracking-[0.12em] text-warm-white/60 hover:border-gold/40 hover:text-gold transition-all duration-200"
              >
                Explorar catálogo
              </Link>
            </div>
          </div>

          <div className="mt-10 border-t border-warm-white/[0.06] pt-8 flex items-center justify-between">
            <p className="font-mono text-[11px] tracking-[0.1em] text-warm-white/20 uppercase">
              WhatsApp directo
            </p>
            <p className="font-mono text-[11px] tracking-[0.08em] text-warm-white/40">
              +507 6025 0735
            </p>
          </div>
        </div>
      </section>
    </>
  )
}

function ZoneRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-4 border-t border-[rgba(0,30,80,0.05)] py-3">
      <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-navy/30 w-28 shrink-0 pt-0.5 leading-relaxed">
        {label}
      </span>
      <span className="font-body text-body-sm text-navy/65 leading-snug">{value}</span>
    </div>
  )
}
