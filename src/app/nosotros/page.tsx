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
  { label: 'Régimen aduanero',       value: 'Zona franca industrial · CIF incluido' },
  { label: 'Mercados de origen',      value: 'China · Japón · Tailandia · Emiratos Árabes' },
  { label: 'Documentación incluida',  value: 'B/L · Factura comercial · Cert. de origen · Fitosanitario' },
  { label: 'Plazo de respuesta',      value: '24 horas hábiles por consulta documentada' },
  { label: 'Categorías activas',      value: 'Maquinaria agrícola · Vehículos comerciales · Equipo industrial · Repuestos' },
  { label: 'Zonas de operación',      value: 'ZOFRATACNA (Tacna, Perú) · ZOFRI (Iquique, Chile)' },
  { label: 'Mercados atendidos',      value: 'Perú · Chile · Colombia · Panamá · Costa Rica · Bolivia · R. Dominicana' },
]

const WHY_WINGS = [
  {
    num: '01',
    title: 'Posición en zona franca',
    body: 'Operar desde ZOFRATACNA y ZOFRI, no desde Lima ni Santiago, significa que la mercancía entra en régimen franco y se despacha desde el nodo logístico, no desde una oficina de intermediación. El costo de internación es diferente desde dentro.',
  },
  {
    num: '02',
    title: 'Acceso directo a fabricantes',
    body: 'Wings trabaja con fabricantes verificados en origen. El comprador recibe especificaciones técnicas, certificados y capacidad de producción verificables antes de cualquier compromiso. No presentamos catálogos de terceros.',
  },
  {
    num: '03',
    title: 'Mister como herramienta de pre-calificación',
    body: 'Antes de cualquier compromiso económico, el importador puede resolver sus preguntas técnicas y entender la estructura de costo de internación a través de Mister. Menos riesgo de información en la primera llamada.',
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
            01 — Infraestructura
          </p>
          <AnimatedWingsRule className="mb-8" />
          <h2 className="font-display text-display-md font-light text-navy mb-16 max-w-xl leading-[1.1]">
            Infraestructura real en dos zonas francas del Pacífico Sur
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {FREE_ZONES.map((z) => (
              <div
                key={z.name}
                className="relative border border-[rgba(0,30,80,0.08)] bg-white p-8 overflow-hidden"
              >
                {/* Large year watermark */}
                <span
                  className="absolute bottom-4 right-6 font-display text-[7rem] font-light leading-none text-navy/[0.04] select-none pointer-events-none"
                  aria-hidden
                >
                  {z.name === 'ZOFRATACNA' ? '1988' : '1975'}
                </span>

                <p className="font-mono text-sm text-gold tracking-[0.06em] mb-1">{z.name}</p>
                <p className="font-body text-sm text-navy/50 mb-6">{z.location}</p>

                <div className="space-y-3 relative">
                  {z.name === 'ZOFRATACNA' ? (
                    <>
                      <ZoneRow label="Régimen" value="Zona franca de transformación" />
                      <ZoneRow label="Ventaja" value="Suspensión arancelaria hasta destino final en Perú y Bolivia" />
                      <ZoneRow label="Aduana" value="SUNAT — Aduanas del Perú" />
                      <ZoneRow label="Uso óptimo" value="Importaciones hacia Perú, Bolivia y sur de Colombia" />
                    </>
                  ) : (
                    <>
                      <ZoneRow label="Régimen" value="Zona franca comercial e industrial" />
                      <ZoneRow label="Ventaja" value="0% aranceles en tránsito hacia Bolivia, Colombia y Ecuador" />
                      <ZoneRow label="Aduana" value="Aduana de Chile — Servicio Nacional de Aduanas" />
                      <ZoneRow label="Uso óptimo" value="Importaciones hacia Chile, Colombia, Panamá y Cono Sur" />
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
          <AnimatedWingsRule className="mb-12" />

          <div className="grid grid-cols-1 gap-14 md:grid-cols-2">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-warm-white/30 mb-4">
                Mercados de origen
              </p>
              <MarketTokenStagger
                markets={SOURCE_MARKETS}
                className="font-display text-display-lg font-light text-gold leading-snug"
              />
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-warm-white/30 mb-4">
                Mercados atendidos
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
            02 — Perfil operativo
          </p>
          <AnimatedWingsRule className="mb-8" />
          <h2 className="font-display text-display-md font-light text-navy mb-12 max-w-xl leading-[1.1]">
            Especificaciones del operador
          </h2>

          <div className="border-l-2 border-gold/30 pl-0">
            {SPEC_ROWS.map(({ label, value }, i) => (
              <div
                key={label}
                className={[
                  'grid grid-cols-[minmax(0,1fr)_minmax(0,2fr)] gap-4 py-4 px-6',
                  i < SPEC_ROWS.length - 1 ? 'border-b border-[rgba(0,30,80,0.06)]' : '',
                  i % 2 === 0 ? '' : 'bg-[rgba(0,30,80,0.02)]',
                ].join(' ')}
              >
                <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-navy/40 pt-0.5 leading-relaxed">
                  {label}
                </span>
                <span className="font-body text-body-sm text-navy/80 leading-relaxed">
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
            03 — Diferenciación estructural
          </p>
          <AnimatedWingsRule className="mb-12" />

          <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
            {WHY_WINGS.map(({ num, title, body }) => (
              <div key={num} className="border-t border-warm-white/[0.08] pt-6">
                <span className="font-mono text-[10px] text-gold/60 tracking-[0.12em] mb-4 block">
                  {num}
                </span>
                <h3 className="font-display text-display-sm font-light text-warm-white mb-4 leading-snug">
                  {title}
                </h3>
                <p className="font-body text-body-sm text-warm-white/60 leading-relaxed">
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
            04 — Proceso
          </p>
          <AnimatedWingsRule className="mb-12" />

          <div className="grid grid-cols-1 gap-0 md:grid-cols-3">
            {PROCESS_STEPS.map(({ num, title, body }, i) => (
              <div
                key={num}
                className={[
                  'py-8 px-6',
                  i < PROCESS_STEPS.length - 1
                    ? 'border-b md:border-b-0 md:border-r border-[rgba(0,30,80,0.08)]'
                    : '',
                ].join(' ')}
              >
                <span className="font-mono text-[10px] text-gold tracking-[0.12em] mb-4 block">
                  {num}
                </span>
                <h3 className="font-body font-semibold text-navy mb-3 text-body-md">
                  {title}
                </h3>
                <p className="font-body text-body-sm text-navy/60 leading-relaxed">
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

          <div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
            <h2 className="max-w-lg font-display text-display-md font-light text-warm-white leading-[1.05] tracking-[-0.02em]">
              Conversemos sobre tu próxima importación
            </h2>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
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

          <p className="mt-10 font-mono text-[11px] tracking-[0.1em] text-warm-white/25 border-t border-warm-white/[0.06] pt-8">
            WhatsApp directo: +507 6025 0735
          </p>
        </div>
      </section>
    </>
  )
}

function ZoneRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3">
      <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-navy/30 w-20 shrink-0 pt-0.5">
        {label}
      </span>
      <span className="font-body text-body-sm text-navy/70 leading-snug">{value}</span>
    </div>
  )
}
