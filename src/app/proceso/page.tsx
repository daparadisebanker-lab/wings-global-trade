// src/app/proceso/page.tsx
// Editorial explainer: how the Wings importation process works.
// 6-step technical narrative + FAQ + dual CTA.
import type { Metadata } from 'next'
import Link from 'next/link'

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

const STEPS = [
  {
    num: '01',
    title: 'Consulta técnica',
    body: 'Describe el producto desde el catálogo, el cotizador, o vía Mister IA. El equipo de Wings evalúa la especificación exacta, el fabricante disponible en origen, y las condiciones de mercado actuales antes de responder. Sin llamadas previas. Sin reuniones introductorias.',
    data: [
      { label: 'Canal', value: 'Catálogo · Cotizador · Mister IA · WhatsApp' },
      { label: 'Respuesta', value: 'Menos de 24 horas hábiles' },
    ],
  },
  {
    num: '02',
    title: 'Verificación de fabricante',
    body: 'Wings identifica fabricantes certificados según la especificación: China, Japón, Tailandia o Dubai. Se verifican homologaciones CE, ISO, EPA o EURO IV, certificados de origen, y la capacidad de producción real en planta antes de emitir cualquier cotización.',
    data: [
      { label: 'Orígenes', value: 'China · Japón · Tailandia · Dubai' },
      { label: 'Certificaciones', value: 'CE · ISO · EPA · EURO IV' },
    ],
  },
  {
    num: '03',
    title: 'Cotización CIF desglosada',
    body: 'El precio CIF que entrega Wings incluye costo FOB, flete internacional, seguro de carga ICC, arancel de importación estimado y cargo de zona franca. Sin costos ocultos. Perú y Bolivia operan vía ZOFRATACNA; Chile y LATAM vía ZOFRI.',
    data: [
      { label: 'Componentes', value: 'FOB + Flete + Seguro + Arancel' },
      { label: 'Zonas francas', value: 'ZOFRATACNA (Perú/Bolivia) · ZOFRI (Chile/LATAM)' },
    ],
  },
  {
    num: '04',
    title: 'Gestión documental',
    body: 'Wings abre la carta de crédito, gestiona los certificados de exportación, permisos sanitarios y fitosanitarios, y prepara el expediente de importación completo. El importador no necesita agente de aduana propio.',
    data: [
      { label: 'Documentos', value: 'LC · BL · Cert. de Origen · Packing List' },
      { label: 'Responsable', value: 'Wings Global Trade — gestión integral' },
    ],
  },
  {
    num: '05',
    title: 'Zona franca e inspección',
    body: 'La mercancía ingresa a la zona franca asignada. Antes de la nacionalización, el importador puede inspeccionar la carga en planta franca y rechazarla sin haberla importado al territorio nacional. Wings coordina el despacho aduanal y la liquidación de impuestos.',
    data: [
      { label: 'Perú / Bolivia', value: 'ZOFRATACNA — Tacna, Perú' },
      { label: 'Chile / LATAM', value: 'ZOFRI — Iquique, Chile' },
    ],
  },
  {
    num: '06',
    title: 'Entrega en destino',
    body: 'Wings coordina el transporte de último tramo desde la zona franca hasta el almacén o punto de recepción del importador. Monitoreo de la unidad en tránsito y confirmación documentada de entrega.',
    data: [
      { label: 'Cobertura', value: 'Perú · Chile · Colombia · Bolivia · Panamá' },
      { label: 'Seguimiento', value: 'Tiempo real con reporte al importador' },
    ],
  },
]

const FAQ = [
  {
    q: '¿Trabajan con marcas reconocidas o solo genéricos?',
    a: 'Catálogo activo: New Holland, John Deere, Massey Ferguson y Kubota en maquinaria agrícola; KAMA en camiones y vehículos eléctricos. Para cualquier otra marca o especificación, Wings cotiza directamente con fabricantes en origen mediante importación personalizada.',
  },
  {
    q: '¿Cuánto tarda una importación completa?',
    a: 'Maquinaria agrícola desde China: 60 a 90 días. Camiones y buses: 75 a 105 días. Repuestos y equipo compacto: 45 a 70 días. Los plazos incluyen producción, embarque, tránsito marítimo, zona franca y despacho aduanal.',
  },
  {
    q: '¿Se puede importar sin agente de aduana propio?',
    a: 'Sí. Wings gestiona todo el proceso documental y aduanal. El importador solo necesita RUC activo en Perú, número de identificación tributaria equivalente en Chile o Colombia, o la figura legal correspondiente en el país destino.',
  },
  {
    q: '¿Cuál es el pedido mínimo?',
    a: 'No hay mínimo absoluto. Las importaciones más eficientes en costo parten de un contenedor de 20 pies (20GP) o una unidad de maquinaria pesada. Para repuestos se puede consolidar en LCL (carga compartida) junto a otros importadores.',
  },
  {
    q: '¿Qué garantía tiene la maquinaria?',
    a: 'Los tractores New Holland incluyen garantía de fabricante de 12 meses o 1.000 horas de operación (lo primero que ocurra). John Deere y Massey Ferguson aplican condiciones similares. Wings documenta el expediente de garantía en el proceso de importación.',
  },
  {
    q: '¿Se puede inspeccionar la mercancía antes de recibirla?',
    a: 'Sí. La zona franca permite inspección de calidad antes de la nacionalización. El importador puede rechazar la carga en planta franca sin haberla importado al territorio nacional — sin costos aduaneros en ese caso.',
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
            De la consulta a la entrega.<br />Sin zonas grises.
          </h1>
          <p className="mt-8 max-w-2xl font-body text-body-lg text-warm-white/55 leading-relaxed">
            Wings gestiona la importación completa: fabricante certificado, precio CIF con desglose real,
            zona franca ZOFRATACNA o ZOFRI, y documentación aduanal. El importador solo recibe la mercancía.
          </p>
          <div className="mt-10 flex flex-wrap gap-6">
            {[
              { label: 'Respuesta inicial', value: '< 24 h' },
              { label: 'Marcas en catálogo', value: 'NH · JD · MF · Kubota · KAMA' },
              { label: 'Zonas francas', value: 'ZOFRATACNA · ZOFRI' },
              { label: 'Importador gestiona', value: 'Solo su RUC / NIT' },
            ].map((d) => (
              <div key={d.label} className="flex flex-col gap-1">
                <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-warm-white/30">{d.label}</span>
                <span className="font-body text-sm text-warm-white/75">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process steps */}
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
                      <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.15em] text-navy/30">
                        {d.label}
                      </p>
                      <p className="font-body text-sm leading-snug text-navy/75">{d.value}</p>
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
              <div
                key={item.q}
                className="border-b border-warm-white/[0.07] py-8 last:border-b-0 md:last:border-b"
              >
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
            <div className="max-w-lg">
              <h2 className="font-display text-display-md font-light text-navy leading-[1.05] tracking-[-0.02em]">
                Más de 50 modelos en catálogo. Cotización CIF en 24 horas.
              </h2>
              <p className="mt-4 font-body text-body-md text-navy/55 leading-relaxed">
                New Holland, John Deere, Massey Ferguson, Kubota, KAMA. Tractores desde 50 hasta 140 HP, camiones diésel y eléctricos, buses y equipo industrial.
              </p>
            </div>
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
                Hablar con Mister
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
