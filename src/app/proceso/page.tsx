// src/app/proceso/page.tsx
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { AnimatedInteriorHero } from '@/components/features/shared/AnimatedInteriorHero'
import { AnimatedProcessSteps, type Phase } from '@/components/features/proceso/AnimatedProcessSteps'
import { JsonLd } from '@/components/seo/JsonLd'

export const metadata: Metadata = {
  title: 'Cómo importar con Wings — Proceso de importación B2B LATAM',
  description:
    'Wings gestiona la importación completa: fabricante certificado, cotización CIF desglosada, zona franca ZOFRATACNA o ZOFRI, documentación aduanal y entrega. El importador solo recibe la mercancía.',
  openGraph: {
    title: 'Cómo importar con Wings — Proceso B2B LATAM',
    description:
      'Proceso de importación B2B: consulta técnica, cotización CIF, zona franca, documentación y entrega. Wings Global Trade.',
    locale: 'es_PE',
    type: 'website',
    url: 'https://wingsglobaltrade.com/proceso',
  },
  alternates: {
    canonical: 'https://wingsglobaltrade.com/proceso',
  },
}

const PHASES: Phase[] = [
  {
    id: 'fase-a',
    label: 'Fase A',
    sublabel: 'Origen y verificación',
    steps: [
      {
        id: 'paso-01',
        num: '01',
        title: 'Consulta técnica',
        body: 'Describe el producto desde el catálogo, el cotizador, o vía Mister IA. El equipo de Wings evalúa la especificación exacta, el fabricante disponible en origen, y las condiciones de mercado actuales antes de responder. Sin llamadas previas. Sin reuniones introductorias.',
        data: [
          { label: 'Canal', value: 'Catálogo · Cotizador · Mister IA · WhatsApp' },
          { label: 'Respuesta', value: 'Menos de 24 horas hábiles' },
        ],
        cta: { label: 'Iniciar consulta con Mister IA', href: '/mister' },
        faqs: [
          {
            q: '¿Cuál es el pedido mínimo?',
            a: 'No hay mínimo absoluto. Las importaciones más eficientes en costo parten de un contenedor de 20 pies (20GP) o una unidad de maquinaria pesada. Para repuestos se puede consolidar en LCL (carga compartida) junto a otros importadores.',
          },
        ],
      },
      {
        id: 'paso-02',
        num: '02',
        title: 'Verificación de fabricante',
        body: 'Wings identifica fabricantes certificados según la especificación: China, Japón, Tailandia o Dubai. Se verifican homologaciones CE, ISO, EPA o EURO IV, certificados de origen, y la capacidad de producción real en planta antes de emitir cualquier cotización.',
        data: [
          { label: 'Orígenes', value: 'China · Japón · Tailandia · Dubai' },
          { label: 'Certificaciones', value: 'CE · ISO · EPA · EURO IV' },
        ],
        faqs: [
          {
            q: '¿Trabajan con marcas reconocidas o solo genéricos?',
            a: 'Catálogo activo: New Holland, John Deere, Massey Ferguson y Kubota en maquinaria agrícola; KAMA en camiones y vehículos eléctricos. Para cualquier otra marca o especificación, Wings cotiza directamente con fabricantes en origen mediante importación personalizada.',
          },
          {
            q: '¿Qué garantía tiene la maquinaria?',
            a: 'Los tractores New Holland incluyen garantía de fabricante de 12 meses o 1.000 horas de operación (lo primero que ocurra). John Deere y Massey Ferguson aplican condiciones similares. Wings documenta el expediente de garantía en el proceso de importación.',
          },
        ],
      },
    ],
  },
  {
    id: 'fase-b',
    label: 'Fase B',
    sublabel: 'Precio y documentación',
    steps: [
      {
        id: 'paso-03',
        num: '03',
        title: 'Cotización CIF desglosada',
        body: 'El precio CIF que entrega Wings incluye costo FOB, flete internacional, seguro de carga ICC, arancel de importación estimado y cargo de zona franca. Sin costos ocultos. Perú y Bolivia operan vía ZOFRATACNA; Chile y LATAM vía ZOFRI.',
        data: [
          { label: 'Componentes', value: 'FOB + Flete + Seguro + Arancel' },
          { label: 'Zonas francas', value: 'ZOFRATACNA (Perú/Bolivia) · ZOFRI (Chile/LATAM)' },
        ],
        cta: { label: 'Solicitar cotización CIF', href: '/cotizar' },
      },
      {
        id: 'paso-04',
        num: '04',
        title: 'Gestión documental',
        body: 'Wings abre la carta de crédito, gestiona los certificados de exportación, permisos sanitarios y fitosanitarios, y prepara el expediente de importación completo. El importador no necesita agente de aduana propio.',
        data: [
          { label: 'Documentos', value: 'LC · BL · Cert. de Origen · Packing List' },
          { label: 'Responsable', value: 'Wings Global Trade — gestión integral' },
        ],
        faqs: [
          {
            q: '¿Se puede importar sin agente de aduana propio?',
            a: 'Sí. Wings gestiona todo el proceso documental y aduanal. El importador solo necesita RUC activo en Perú, número de identificación tributaria equivalente en Chile o Colombia, o la figura legal correspondiente en el país destino.',
          },
        ],
      },
    ],
  },
  {
    id: 'fase-c',
    label: 'Fase C',
    sublabel: 'Logística y entrega',
    steps: [
      {
        id: 'paso-05',
        num: '05',
        title: 'Zona franca e inspección',
        body: 'La mercancía ingresa a la zona franca asignada. Antes de la nacionalización, el importador puede inspeccionar la carga en planta franca y rechazarla sin haberla importado al territorio nacional. Wings coordina el despacho aduanal y la liquidación de impuestos.',
        data: [
          { label: 'Perú / Bolivia', value: 'ZOFRATACNA — Tacna, Perú' },
          { label: 'Chile / LATAM', value: 'ZOFRI — Iquique, Chile' },
        ],
        faqs: [
          {
            q: '¿Se puede inspeccionar la mercancía antes de recibirla?',
            a: 'Sí. La zona franca permite inspección de calidad antes de la nacionalización. El importador puede rechazar la carga en planta franca sin haberla importado al territorio nacional — sin costos aduaneros en ese caso.',
          },
        ],
      },
      {
        id: 'paso-06',
        num: '06',
        title: 'Entrega en destino',
        body: 'Wings coordina el transporte de último tramo desde la zona franca hasta el almacén o punto de recepción del importador. Monitoreo de la unidad en tránsito y confirmación documentada de entrega.',
        data: [
          { label: 'Cobertura', value: 'Perú · Chile · Colombia · Bolivia · Panamá' },
          { label: 'Seguimiento', value: 'Tiempo real con reporte al importador' },
        ],
        faqs: [
          {
            q: '¿Cuánto tarda una importación completa?',
            a: 'Maquinaria agrícola desde China: 60 a 90 días. Camiones y buses: 75 a 105 días. Repuestos y equipo compacto: 45 a 70 días. Los plazos incluyen producción, embarque, tránsito marítimo, zona franca y despacho aduanal.',
          },
        ],
      },
    ],
  },
]

const ALL_STEPS = PHASES.flatMap((p) => p.steps)

const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'Cómo importar maquinaria con Wings Global Trade',
  description:
    'Wings gestiona la importación completa: fabricante certificado, precio CIF con desglose real, zona franca ZOFRATACNA o ZOFRI, y documentación aduanal.',
  step: ALL_STEPS.map((s, i) => ({
    '@type': 'HowToStep',
    position: i + 1,
    name: s.title,
    text: s.body,
    url: `https://wingsglobaltrade.com/proceso#${s.id}`,
  })),
}

export default function ProcesoPage() {
  return (
    <>
      <JsonLd data={howToSchema} />

      {/* Dark hero */}
      <section className="relative flex min-h-[55vh] items-end overflow-hidden bg-[#000C1F] px-6 pb-20 pt-40 hero-grain md:px-10 md:pb-28">
        <div className="mx-auto w-full max-w-6xl">
          <div className="wings-rule mb-8" />
          <AnimatedInteriorHero
            overline="Cómo importar · Wings Global Trade"
            headline={['De la consulta a la entrega.', 'Sin zonas grises.']}
            subtitle="Wings gestiona la importación completa: fabricante certificado, precio CIF con desglose real, zona franca ZOFRATACNA o ZOFRI, y documentación aduanal. El importador solo recibe la mercancía."
            dark
          />
          <div className="mt-10 flex flex-wrap gap-6 border-t border-warm-white/[0.07] pt-8">
            {[
              { label: 'Respuesta inicial', value: '< 24 h', href: '#paso-01' },
              { label: 'Marcas en catálogo', value: 'NH · JD · MF · Kubota · KAMA', href: '#paso-02' },
              { label: 'Zonas francas', value: 'ZOFRATACNA · ZOFRI', href: '#paso-05' },
              { label: 'Importador gestiona', value: 'Solo su RUC / NIT', href: '#paso-04' },
            ].map((d) => (
              <Link key={d.label} href={d.href} className="group flex flex-col gap-1">
                <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-warm-white/30 transition-colors group-hover:text-warm-white/50">
                  {d.label}
                </span>
                <span className="font-body text-sm text-warm-white/75 transition-colors group-hover:text-warm-white/90">
                  {d.value}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Image strip 1 — Wings containers at port — scale proof */}
      <div className="relative h-[68vh] overflow-hidden">
        <Image
          src="/Importacion/como-importar/containers-port.png"
          alt="Contenedores Wings en puerto de origen"
          fill
          className="object-cover object-bottom"
          sizes="100vw"
        />
      </div>

      {/* Process steps — Fase A */}
      <section className="bg-[#F8F6F0] px-6 pt-20 pb-16 md:px-10 md:pt-28 md:pb-20">
        <div className="mx-auto w-full max-w-6xl">
          <AnimatedProcessSteps phases={[PHASES[0]]} />
        </div>
      </section>

      {/* Image strip 2 — operative in warehouse — human proof */}
      <div className="relative h-[72vh] overflow-hidden">
        <Image
          src="/Importacion/como-importar/operative-warehouse.png"
          alt="Coordinador Wings supervisando operación en almacén"
          fill
          className="object-cover object-top"
          sizes="100vw"
        />
      </div>

      {/* Process steps — Fase B + C */}
      <section className="bg-[#F8F6F0] px-6 pt-16 pb-20 md:px-10 md:pt-20 md:pb-28">
        <div className="mx-auto w-full max-w-6xl">
          <AnimatedProcessSteps phases={PHASES.slice(1)} />
        </div>
      </section>

      {/* Image strip 3 — truck at dock — delivery proof */}
      <div className="relative h-[46vh] overflow-hidden">
        <Image
          src="/Importacion/como-importar/truck-dock.png"
          alt="Entrega en destino — último tramo Wings Global Trade"
          fill
          className="object-cover object-left"
          sizes="100vw"
        />
      </div>

      {/* Dual CTA — warm white (separates visually from navy footer) */}
      <section className="bg-[#F8F6F0] px-6 py-20 md:px-10 md:py-28">
        <div className="mx-auto w-full max-w-6xl">
          <div className="wings-rule mb-8" />
          <div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
            <div className="max-w-lg">
              <h2 className="font-display text-display-md font-light text-navy leading-[1.05] tracking-[-0.02em]">
                Más de 50 modelos en catálogo. Precio CIF sin intermediarios.
              </h2>
              <p className="mt-4 font-body text-body-md leading-relaxed text-navy/55">
                New Holland, John Deere, Massey Ferguson, Kubota, KAMA. Tractores desde 50 hasta
                140 HP, camiones diésel y eléctricos, buses y equipo industrial.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/catalogo"
                className="inline-flex items-center gap-3 bg-gold px-8 py-4 font-mono text-[11px] uppercase tracking-[0.12em] text-navy transition-colors duration-200 hover:bg-gold-hover"
              >
                <span aria-hidden className="h-px w-6 bg-current" />
                Explorar catálogo
              </Link>
              <Link
                href="/mister"
                className="inline-flex items-center gap-3 border border-[rgba(0,30,80,0.18)] px-8 py-4 font-mono text-[11px] uppercase tracking-[0.12em] text-navy/70 transition-all duration-200 hover:border-gold/40 hover:text-gold"
              >
                Hablar con Mister IA
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
