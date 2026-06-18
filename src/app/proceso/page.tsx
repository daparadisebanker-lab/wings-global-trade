// src/app/proceso/page.tsx
// Editorial explainer: how the Wings importation process works.
// 6-step technical narrative + FAQ strip + dual CTA.
import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Cómo importar con Wings — Proceso de importación B2B',
  description:
    'El proceso de importación de Wings: desde la consulta técnica hasta la entrega en destino. Zonas francas, cotización CIF y gestión documental para América Latina.',
  openGraph: {
    title: 'Cómo importar con Wings — Proceso B2B LATAM',
    description:
      'Proceso de importación B2B: consulta, cotización CIF, zona franca, documentación y entrega. Wings Global Trade.',
    locale: 'es_PE',
    type: 'website',
    url: 'https://wingsglobaltrade.com/proceso',
  },
  alternates: {
    canonical: 'https://wingsglobaltrade.com/proceso',
  },
}

const STEPS = [
  {
    num: '01',
    title: 'Consulta técnica',
    body: 'Describe el producto que necesitas o selecciona del catálogo. Nuestro equipo técnico evalúa la especificación, el origen disponible y las condiciones de mercado antes de responder.',
    data: [
      { label: 'Canal', value: 'Catálogo · Cotizador · Mister IA · WhatsApp' },
      { label: 'Tiempo', value: 'Respuesta en menos de 24 h' },
    ],
  },
  {
    num: '02',
    title: 'Verificación de fabricante',
    body: 'Identificamos fabricantes certificados en China, Tailandia, Japón o Dubai según la especificación. Verificamos homologaciones, certificados de origen y capacidad de producción antes de cotizar.',
    data: [
      { label: 'Mercados', value: 'China · Tailandia · Japón · Dubai' },
      { label: 'Certificaciones', value: 'CE · ISO · EPA · EURO IV' },
    ],
  },
  {
    num: '03',
    title: 'Cotización CIF',
    body: 'Entregamos un precio CIF (Cost, Insurance, Freight) en destino: incluye costo FOB, flete internacional, seguro de carga, arancel de importación y derechos de aduana estimados.',
    data: [
      { label: 'Componentes', value: 'FOB + Flete + Seguro + Arancel' },
      { label: 'Zonas francas', value: 'ZOFRATACNA (Perú) · ZOFRI (Chile)' },
    ],
  },
  {
    num: '04',
    title: 'Gestión documental',
    body: 'Una vez aceptada la propuesta, abrimos la carta de crédito, gestionamos certificados de exportación, permisos sanitarios y fitosanitarios, y preparamos el expediente de importación.',
    data: [
      { label: 'Documentos', value: 'LC · BL · Certificado de origen · Packing list' },
      { label: 'Responsable', value: 'Wings Global Trade' },
    ],
  },
  {
    num: '05',
    title: 'Zona franca y nacionalización',
    body: 'La mercancía ingresa a la zona franca asignada (ZOFRATACNA para Perú/Bolivia; ZOFRI para Chile/LATAM). Coordinamos el despacho aduanal y la liquidación de impuestos en destino final.',
    data: [
      { label: 'Perú / Bolivia', value: 'ZOFRATACNA — Tacna, Perú' },
      { label: 'Chile / LATAM', value: 'ZOFRI — Iquique, Chile' },
    ],
  },
  {
    num: '06',
    title: 'Entrega en destino',
    body: 'Coordinamos el transporte de último tramo desde la zona franca hasta tu almacén o punto de recepción. Incluye monitoreo de la unidad en tránsito y confirmación de entrega.',
    data: [
      { label: 'Cobertura', value: 'Perú · Chile · Colombia · Panamá · LATAM' },
      { label: 'Seguimiento', value: 'Tiempo real con reporte a cliente' },
    ],
  },
]

const FAQ = [
  {
    q: '¿Importan solo del catálogo o también productos personalizados?',
    a: 'Ambos. El catálogo cubre los modelos más solicitados. Para cualquier otra especificación, Mister IA recoge los requisitos técnicos y cotizamos directamente con fabricantes en origen.',
  },
  {
    q: '¿Cuánto tarda una importación completa?',
    a: 'Entre 60 y 120 días hábiles desde la confirmación de pedido, dependiendo del origen y la complejidad documental. Maquinaria agrícola desde China tarda en promedio 75 días.',
  },
  {
    q: '¿Se puede importar sin tener un agente de aduana propio?',
    a: 'Sí. Wings gestiona todo el proceso documental y aduanal. El importador solo necesita un RUC activo o número de identificación tributaria en el país destino.',
  },
  {
    q: '¿Cuál es el pedido mínimo?',
    a: 'No hay un mínimo absoluto, pero las importaciones más eficientes en costo empiezan desde un contenedor de 20 pies (20GP) o una unidad de maquinaria pesada.',
  },
]

export default function ProcesoPage() {
  return (
    <>
      {/* Dark hero */}
      <section className="min-h-[55vh] flex items-end bg-[#000C1F] hero-grain px-6 pb-20 pt-40 md:px-10 md:pb-28">
        <div className="mx-auto w-full max-w-6xl">
          <div className="wings-rule mb-8" />
          <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.15em] text-warm-white/30">
            Cómo importar · Wings Global Trade
          </p>
          <h1 className="font-display text-display-xl font-light text-warm-white leading-[0.95] tracking-[-0.02em] max-w-3xl">
            De la consulta a la entrega. Sin zonas grises.
          </h1>
          <p className="mt-8 max-w-2xl font-body text-body-lg text-warm-white/50 leading-relaxed">
            Importación B2B con gestión completa en zona franca. Precio CIF transparente, documentación
            a cargo de Wings, y seguimiento real en cada etapa.
          </p>
        </div>
      </section>

      {/* Process steps — alternating */}
      <section className="bg-[#F8F6F0] px-6 py-20 md:px-10 md:py-28">
        <div className="mx-auto w-full max-w-6xl">
          <div className="flex flex-col divide-y divide-[rgba(0,30,80,0.06)]">
            {STEPS.map((step, i) => (
              <div
                key={step.num}
                className={`grid grid-cols-1 gap-10 py-14 lg:grid-cols-[80px_1fr_260px] lg:gap-16 ${
                  i === 0 ? 'pt-0' : ''
                } ${i === STEPS.length - 1 ? 'pb-0' : ''}`}
              >
                {/* Step number */}
                <div className="flex items-start">
                  <span className="font-mono text-[11px] tracking-[0.20em] text-gold/40">{step.num}</span>
                </div>

                {/* Title + body */}
                <div>
                  <h2 className="mb-5 font-display text-display-sm font-light text-navy leading-tight">
                    {step.title}
                  </h2>
                  <p className="font-body text-body-lg leading-relaxed text-navy/65">
                    {step.body}
                  </p>
                </div>

                {/* Data block */}
                <div className="flex flex-col gap-4 border-l-0 pt-0 lg:border-l lg:border-[rgba(0,30,80,0.08)] lg:pl-10 lg:pt-1">
                  {step.data.map((d) => (
                    <div key={d.label}>
                      <p className="mb-1 font-mono text-[9px] uppercase tracking-[0.18em] text-navy/30">
                        {d.label}
                      </p>
                      <p className="font-mono text-[11px] leading-snug text-navy/70">{d.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ — navy */}
      <section className="bg-[#000C1F] px-6 py-20 md:px-10 md:py-28">
        <div className="mx-auto w-full max-w-6xl">
          <div className="mb-14">
            <div className="wings-rule mb-8" />
            <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-warm-white/30 mb-4">
              Preguntas frecuentes
            </p>
            <h2 className="font-display text-display-md font-light text-warm-white max-w-lg">
              Lo que necesitas saber antes de importar.
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-0 md:grid-cols-2 md:gap-x-16">
            {FAQ.map((item) => (
              <div key={item.q} className="border-b border-warm-white/[0.07] py-8 last:border-b-0 md:last:border-b">
                <h3 className="mb-3 font-display text-lg font-light text-warm-white leading-tight">
                  {item.q}
                </h3>
                <p className="font-body text-sm leading-relaxed text-warm-white/50">
                  {item.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dual CTA — warm-white */}
      <section className="bg-[#F8F6F0] px-6 py-20 md:px-10 md:py-28">
        <div className="mx-auto w-full max-w-6xl">
          <div className="wings-rule mb-8" />
          <div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
            <h2 className="max-w-lg font-display text-display-md font-light text-navy leading-[1.05] tracking-[-0.02em]">
              ¿Listo para tu próxima importación?
            </h2>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/cotizar"
                className="inline-flex items-center gap-3 bg-gold px-8 py-4 font-mono text-[11px] uppercase tracking-[0.12em] text-navy transition-colors duration-200 hover:bg-gold-hover"
              >
                <span className="h-px w-6 bg-current" aria-hidden />
                Solicitar cotización
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
