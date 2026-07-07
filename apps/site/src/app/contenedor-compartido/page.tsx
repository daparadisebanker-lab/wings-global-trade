// src/app/contenedor-compartido/page.tsx
// Evergreen public landing for the shared-container offering «Trae tu grupo».
// Cold-visitor explainer (spec §4.2-A voice, §6 Phase-1 scope). Fully static
// server component — no live container state here (that lives on /g/{token}).
// Section bands alternate navy ↔ warm-white and end warm (footer is navy).
import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { FillMeter } from '@wings/trade-ui'
import { JsonLd } from '@/components/seo/JsonLd'
import { WINGS_PUBLIC_WHATSAPP } from '@/lib/constants'

const WA_TEXT = 'Hola Mister, quiero importar en un contenedor compartido.'
const WA_HREF = `https://wa.me/${WINGS_PUBLIC_WHATSAPP}?text=${encodeURIComponent(WA_TEXT)}`

export const metadata: Metadata = {
  title: 'Contenedor compartido — Trae tu grupo',
  description:
    'Importa en un contenedor compartido con tu grupo: un solo precio todo incluido por cupo, el costo repartido por volumen, y tu contrato siempre con Wings Global Trade.',
  openGraph: {
    title: 'Contenedor compartido — Trae tu grupo',
    description:
      'Un contenedor compartido entre tu grupo, un precio todo incluido por cupo, tu contrato siempre con Wings. Así funciona la importación compartida con Wings Global Trade.',
    locale: 'es_PE',
    type: 'website',
    url: 'https://wingsglobaltrade.com/contenedor-compartido',
  },
  alternates: {
    canonical: 'https://wingsglobaltrade.com/contenedor-compartido',
  },
}

const FAQ_ITEMS: { q: string; a: string }[] = [
  {
    q: '¿Necesito llenar el contenedor solo?',
    a: 'No. Compartes un contenedor de 40 pies con tu grupo. Cada uno toma su propio cupo y paga solo la parte que ocupa, en proporción a su volumen.',
  },
  {
    q: '¿Cómo se calcula mi precio?',
    a: 'Es un precio todo incluido por cupo que ya cubre flete, seguro, zona franca y despacho. El costo se reparte en proporción al volumen en metros cúbicos (CBM) que ocupa tu carga. Mister estima ese volumen por ti a partir de la máquina que traes.',
  },
  {
    q: '¿Y si el contenedor no se llena?',
    a: 'Ampliamos el plazo una vez. Si aun así el grupo no completa los cupos, te devolvemos tu depósito. La regla se publica antes de que tomes tu cupo, no después.',
  },
  {
    q: '¿Con quién es mi contrato?',
    a: 'Siempre con Wings Global Trade. Tu relación no depende de los demás compradores del grupo: nosotros custodiamos el dinero, respondemos legalmente y coordinamos el embarque.',
  },
  {
    q: '¿Qué pasa si un socio se retira antes de confirmar?',
    a: 'Su cupo vuelve a quedar disponible y el grupo lo ve en el workspace. El resto de los cupos y el precio de cada uno no cambian.',
  },
  {
    q: '¿Puedo traer más de un cupo?',
    a: 'Sí. Un comprador puede tomar varios cupos dentro del mismo contenedor. El precio de cada cupo adicional se calcula igual, por el volumen que ocupa.',
  },
]

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ_ITEMS.map((it) => ({
    '@type': 'Question',
    name: it.q,
    acceptedAnswer: { '@type': 'Answer', text: it.a },
  })),
}

export default function ContenedorCompartidoPage() {
  return (
    <>
      <JsonLd data={faqSchema} />

      {/* ── 1 · Hero — navy over container photo ─────────────────────── */}
      <section className="relative flex min-h-[min(72vh,_620px)] flex-col overflow-hidden bg-[#000C1F]">
        <Image
          src="/Importacion/como-importar/containers-port.png"
          alt="Contenedores Wings en puerto de origen"
          fill
          className="object-cover object-bottom"
          sizes="100vw"
          priority
        />
        {/* Navy scrim — bottom-heavy for hero text legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#000C1F] via-[#000C1F]/85 to-[#000C1F]/45" />

        {/* Nav spacer — content clears the fixed navy header */}
        <div className="h-16 md:h-[72px]" />

        <div className="relative z-10 flex flex-1 flex-col justify-end px-6 pb-14 md:px-10 md:pb-20">
          <div className="max-w-3xl">
            <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-gold">
              Contenedor compartido
            </p>
            <h1 className="mt-5 font-display text-display-xl font-light leading-[0.95] tracking-[-0.02em] text-warm-white">
              Trae tu grupo
            </h1>
            <p className="mt-6 max-w-xl font-body text-body-lg leading-relaxed text-warm-white/60">
              Un contenedor compartido entre tu grupo, un solo precio todo incluido por cupo, tu
              contrato siempre con Wings.
            </p>
            <div className="mt-8">
              <a
                href={WA_HREF}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 bg-gold px-8 py-4 font-mono text-[11px] uppercase tracking-[0.12em] text-navy transition-colors duration-200 hover:bg-gold-hover"
              >
                <span aria-hidden className="h-px w-6 bg-current" />
                Hablar con Mister
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2 · El problema — warm, with FillMeter demo ──────────────── */}
      <section className="bg-[#F8F6F0] px-6 py-20 md:px-10 md:py-28">
        <div className="mx-auto w-full max-w-6xl">
          <div className="grid grid-cols-1 gap-14 lg:grid-cols-2 lg:gap-20">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-navy/40">
                El problema
              </p>
              <h2 className="mt-5 font-display text-display-md font-light leading-[1.05] tracking-[-0.02em] text-navy">
                Un contenedor de 40 pies casi nunca se llena solo.
              </h2>
              <p className="mt-6 font-body text-body-md leading-relaxed text-navy/60">
                Los importadores ya se coordinan de manera informal — uno junta a dos o tres
                conocidos en un grupo de WhatsApp para compartir un contenedor completo. Funciona,
                hasta que aparecen las grietas de confianza:
              </p>
              <ul className="mt-6 flex flex-col divide-y divide-navy/10 border-y border-navy/10">
                <ProblemPoint text="Quién custodia el dinero mientras se arma el grupo." />
                <ProblemPoint text="Quién responde legalmente por la importación." />
                <ProblemPoint text="Cómo se reparte el costo según el volumen de cada uno." />
              </ul>
              <p className="mt-6 font-body text-body-md leading-relaxed text-navy">
                Wings productiza esa coordinación: reparto de costo por volumen transparente, cupos
                asegurados con depósito y reglas de respaldo publicadas de antemano.
              </p>
            </div>

            {/* FillMeter demo — dark mono legend needs the warm ground to read */}
            <div className="flex flex-col justify-center">
              <div className="border border-navy/10 bg-warm-white p-6 md:p-8">
                <FillMeter
                  totalSlots={10}
                  committedSlots={4}
                  reservedSlots={2}
                  size="lg"
                  showLegend
                />
                <p className="mt-6 font-body text-body-sm leading-relaxed text-navy/55">
                  Cada cupo es una fracción del contenedor. El medidor muestra el estado real del
                  grupo: <span className="text-navy">tomado</span> es un cupo confirmado,{' '}
                  <span className="text-navy">reservado</span> está apartado a la espera de
                  confirmación, y <span className="text-navy">disponible</span> es lo que aún puede
                  tomar tu grupo.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3 · Cómo funciona — navy, 5 steps ────────────────────────── */}
      <section className="bg-[#000C1F] px-6 py-20 md:px-10 md:py-28">
        <div className="mx-auto w-full max-w-6xl">
          <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-gold">
            Cómo funciona
          </p>
          <h2 className="mt-5 max-w-2xl font-display text-display-md font-light leading-[1.05] tracking-[-0.02em] text-warm-white">
            Del primer mensaje a la entrega, en cinco pasos.
          </h2>

          <ol className="mt-12 grid grid-cols-1 gap-px overflow-hidden border border-warm-white/10 bg-warm-white/10 md:grid-cols-2">
            <Step
              n="01"
              title="Cuéntale a Mister qué traes"
              body="Le describes la máquina o el equipo. Mister estima tu volumen en metros cúbicos por ti — nunca te pide que sepas tu CBM."
            />
            <Step
              n="02"
              title="Wings configura el contenedor"
              body="Definimos la ruta, los cupos, el precio todo incluido por cupo y la fecha límite. Lo confirmas en una sola tarjeta."
            />
            <Step
              n="03"
              title="Compartes tu enlace de grupo"
              body="Cada socio toma su propio cupo por WhatsApp, con su propia cuenta. Tu relación es con Wings, no entre ustedes."
            />
            <Step
              n="04"
              title="El contenedor se llena"
              body="Cuando el grupo completa los cupos, Wings cierra la reserva y arranca el embarque."
            />
            <Step
              n="05"
              title="Sigues cada hito"
              body="Zarpó, llegó a zona franca, nacionalizado, entregado — desde el workspace del grupo y por WhatsApp."
            />
            {/* Filler cell keeps the 2-col grid edges square on desktop */}
            <li aria-hidden className="hidden bg-[#000C1F] md:block" />
          </ol>
        </div>
      </section>

      {/* ── 4 · El precio, explicado — warm ──────────────────────────── */}
      <section className="bg-[#F8F6F0] px-6 py-20 md:px-10 md:py-28">
        <div className="mx-auto w-full max-w-6xl">
          <div className="wings-rule mb-8" />
          <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-navy/40">
            El precio, explicado
          </p>
          <h2 className="mt-5 max-w-2xl font-display text-display-md font-light leading-[1.05] tracking-[-0.02em] text-navy">
            Un solo número por cupo. Sin costos ocultos.
          </h2>

          <div className="mt-12 grid grid-cols-1 gap-px overflow-hidden border border-navy/10 bg-navy/10 md:grid-cols-3">
            <PriceCard
              label="Todo incluido"
              title="Un precio por cupo"
              body="Cada cupo tiene un solo precio que ya cubre flete, seguro, zona franca y despacho. Es el número que negocias, antes de cualquier detalle."
            />
            <PriceCard
              label="Reparto por volumen"
              title="En proporción a tu CBM"
              body="El costo del contenedor se reparte según el volumen en metros cúbicos que ocupa cada uno. Traes menos volumen, pagas menos."
            />
            <PriceCard
              label="Ajuste publicado"
              title="Si excedes tu cupo"
              body="Si tu carga ocupa más de lo previsto, el ajuste se calcula con una tarifa por metro cúbico publicada de antemano. Nunca una sorpresa al final."
            />
          </div>
        </div>
      </section>

      {/* ── 5 · Trust layer — navy, three fixed badges ──────────────── */}
      <section className="bg-[#000C1F] px-6 py-20 md:px-10 md:py-28">
        <div className="mx-auto w-full max-w-6xl">
          <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-gold">
            Por qué es seguro
          </p>
          <h2 className="mt-5 max-w-2xl font-display text-display-md font-light leading-[1.05] tracking-[-0.02em] text-warm-white">
            La confianza es una estructura, no una promesa.
          </h2>

          <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-3">
            <TrustBadge
              title="Depósito protegido"
              body="Tu dinero lo custodia Wings, nunca otro comprador."
            />
            <TrustBadge
              title="Tu contrato es con Wings"
              body="No con los demás compradores del grupo."
            />
            <TrustBadge
              title="Regla de respaldo"
              body="Ampliamos el plazo una vez; si no cierra, te devolvemos tu depósito."
            />
          </div>
        </div>
      </section>

      {/* ── 6 · FAQ + Final CTA — warm (last band before navy footer) ─ */}
      <section className="bg-[#F8F6F0] px-6 py-20 md:px-10 md:py-28">
        <div className="mx-auto w-full max-w-3xl">
          <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-navy/40">
            Preguntas frecuentes
          </p>
          <div className="mt-8 flex flex-col divide-y divide-navy/10 border-y border-navy/10">
            {FAQ_ITEMS.map((it) => (
              <details key={it.q} className="group py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-body text-body-md text-navy">
                  {it.q}
                  <span
                    aria-hidden
                    className="shrink-0 font-mono text-navy/40 transition-transform duration-200 group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p className="mt-3 font-body text-body-sm leading-relaxed text-navy/60">{it.a}</p>
              </details>
            ))}
          </div>

          <div className="wings-rule mb-8 mt-20" />
          <h2 className="max-w-2xl font-display text-display-md font-light leading-[1.05] tracking-[-0.02em] text-navy">
            Trae tu grupo. Wings arma el contenedor.
          </h2>
          <p className="mt-4 max-w-lg font-body text-body-md leading-relaxed text-navy/55">
            Cuéntale a Mister qué traes y con cuántos socios importas. Él estima tu volumen y prepara
            los cupos.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href={WA_HREF}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-gold px-8 py-4 font-mono text-[11px] uppercase tracking-[0.12em] text-navy transition-colors duration-200 hover:bg-gold-hover"
            >
              <span aria-hidden className="h-px w-6 bg-current" />
              Hablar con Mister
            </a>
            <Link
              href="/mister"
              className="inline-flex items-center gap-3 border border-[rgba(0,30,80,0.18)] px-8 py-4 font-mono text-[11px] uppercase tracking-[0.12em] text-navy/70 transition-all duration-200 hover:border-gold/40 hover:text-gold"
            >
              Conocer a Mister IA
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}

// ── Sub-components ──────────────────────────────────────────────────

function ProblemPoint({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-3 py-3">
      <span aria-hidden className="mt-2 h-px w-4 shrink-0 bg-gold" />
      <span className="font-body text-body-md leading-relaxed text-navy/70">{text}</span>
    </li>
  )
}

function Step({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <li className="flex flex-col gap-3 bg-[#000C1F] p-7 md:p-8">
      <span className="font-mono text-mono-lg text-gold">{n}</span>
      <p className="font-display text-display-sm font-light leading-[1.1] text-warm-white">{title}</p>
      <p className="font-body text-body-sm leading-relaxed text-warm-white/55">{body}</p>
    </li>
  )
}

function PriceCard({ label, title, body }: { label: string; title: string; body: string }) {
  return (
    <div className="flex flex-col gap-3 bg-warm-white p-7 md:p-8">
      <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-gold">{label}</span>
      <p className="font-display text-display-sm font-light leading-[1.1] text-navy">{title}</p>
      <p className="font-body text-body-sm leading-relaxed text-navy/60">{body}</p>
    </div>
  )
}

function TrustBadge({ title, body }: { title: string; body: string }) {
  return (
    <div className="border border-warm-white/[0.12] bg-warm-white/[0.03] p-6">
      <p className="font-display text-display-sm font-light leading-[1.1] text-warm-white">{title}</p>
      <p className="mt-3 font-body text-body-sm leading-relaxed text-warm-white/55">{body}</p>
    </div>
  )
}
