// WGT/02 Interiores — the lane page.
//
// PROJECT archetype IA (ecosystem §3): the buyer buys a scoped delivery tied to
// milestones, and negotiates in m² of coverage or cost per key — never in units.
// So the page states coverage and container logic before it states anything
// else, and its one action is to start a quote conversation.
//
// The shared skeleton order is not optional and is followed exactly:
//   lane header → capability statement → category architecture →
//   container logic → proof → RFQ.
//
// Photography is deliberately absent. Phase 0 · Q5 recorded this lane as
// INTERIM_TYPOGRAPHIC: real tile faces exist, but no supplier room render is
// bound to a series, and a rendered room would put a fired-clay colour on screen
// that no buyer could hold us to. Typography and spec carry the page until the
// renders exist. That is the protocol's own escape hatch, taken openly.

import type { Metadata } from 'next'
import Link from 'next/link'
// The lane config is the Phase-0 record, not a copy of it. Every figure this
// page states about the lane's identity is read from there, so the page cannot
// drift from the registration.
import { lane } from '@wings/liveries/interiores/lane.config'
import { SERIES, SKUS } from '@/pasillo/data/catalogue'
import { CONTAINERS, fmtInt, fmtM2 } from '@/pasillo/lib/packing'
import { PASILLO_ROUTES } from '@/pasillo/lib/routes'

export const metadata: Metadata = {
  title: 'Interiores — WGT/02',
  description:
    'Acabados duros, mobiliario, iluminación, textiles, baño y OS&E para proyectos de hospitalidad y residenciales. Cobertura en m², cajas y llenado de contenedor declarados antes de cotizar.',
  alternates: { canonical: '/interiores' },
}

// ── Figures, computed from the catalogue at build time ──────────────────────
// Nothing on this page is a typed number. If the catalogue is rebuilt and a
// series gains SKUs, this page changes with it — which is the only way a
// capability statement stays true six months after it is written.

const FORMATS = [...new Set(SERIES.map((s) => s.format_mm.join('×')))]

/** The heaviest and lightest packing in the catalogue, so the container
 *  statement below quotes the real span rather than a convenient midpoint. */
const PACKINGS = SERIES.map((s) => ({
  format: s.format_mm.join('×'),
  m2PerCtn: s.m2_per_ctn,
  kgPerCtn: s.kgs_per_ctn,
}))

const PAYLOAD_KG = CONTAINERS[0].payload

/** m² that reach the payload limit, per distinct packing. Floor, not ceil:
 *  this is what fits, and a carton you cannot load is not coverage. */
const FILL_ROWS = [...new Map(PACKINGS.map((p) => [`${p.format}|${p.kgPerCtn}`, p])).values()]
  .map((p) => {
    const cartons = Math.floor(PAYLOAD_KG / p.kgPerCtn)
    return { ...p, cartons, m2: cartons * p.m2PerCtn }
  })
  .sort((a, b) => b.m2 - a.m2)

export default function InterioresPage() {
  const active = lane.taxonomy.filter((t) => t.status === 'ACTIVE')
  const opening = lane.taxonomy.filter((t) => t.status === 'OPENING')

  return (
    // pt offsets the fixed site header, same as the (brands) group: this ground
    // is light and has no dark hero for the transparent nav to float over. It
    // lives here rather than on the lane layout — the aisle is a sibling and
    // must start at pixel zero.
    <div className="pt-16 md:pt-18" style={{ backgroundImage: 'var(--texture)' }}>
      {/* ── Lane header ──────────────────────────────────────────────────── */}
      <header className="mx-auto max-w-[var(--grid-max-width)] px-6 pb-12 pt-16 md:px-10 md:pb-16 md:pt-24">
        <div className="flex flex-wrap items-center gap-3">
          <span className="lane-stamp px-2.5 py-1 text-[length:var(--lane-type-stamp)] leading-none">{lane.code}</span>
          <span
            className="lane-stamp border-0 px-0 text-[length:var(--lane-type-stamp)] leading-none"
            data-status={lane.status}
          >
            {lane.status === 'OPENING' ? 'Lane en apertura' : 'Lane activa'}
          </span>
        </div>

        <h1 className="mt-6 max-w-[16ch] text-[length:var(--type-6)] font-normal leading-[1.05] tracking-[var(--lane-display-tracking)] md:text-[length:var(--type-7)]">
          Interiores
        </h1>

        <p className="mt-6 max-w-[62ch] text-[length:var(--type-2)] leading-[1.45] text-[color:var(--ink-secondary)]">
          {lane.scope.es}
        </p>
      </header>

      {/* ── Capability statement ─────────────────────────────────────────── */}
      <section className="border-y border-[color:var(--ink-decoration)] bg-[color:var(--surface-2)]">
        <div className="mx-auto grid max-w-[var(--grid-max-width)] gap-8 px-6 py-12 md:grid-cols-3 md:px-10 md:py-16">
          <div className="md:col-span-2">
            <h2 className="text-[length:var(--type-4)] leading-[1.15] tracking-[var(--lane-display-tracking)]">
              Un proyecto no se compra por unidad. Se compra por cobertura y por fecha.
            </h2>
            <p className="mt-5 max-w-[58ch] text-[length:var(--type-1)] leading-[1.55] text-[color:var(--ink-secondary)]">
              Esta lane existe para quien compra contra una especificación que no escribió: firmas
              de procura y constructoras que necesitan saber cuántos m² cubren un piso, cuántas
              cajas son, cuánto pesan y cuánto contenedor ocupan — antes de pedir precio. Cada
              catálogo declara esas cuatro cifras en la misma pantalla donde se elige el diseño.
            </p>
          </div>

          <dl className="grid grid-cols-2 gap-x-6 gap-y-5 self-start md:grid-cols-1">
            {/* lane.unitMath is the registration record and is English on
                purpose — it is data. The buyer reads Spanish. */}
            <Figure label="Compra en" value="m² de cobertura · por llave" />
            <Figure label="Arquetipo" value="PROJECT" />
            <Figure label="Formatos" value={FORMATS.join(' · ') + ' mm'} />
            <Figure label="Referencias" value={`${fmtInt(SKUS.length)} SKU`} />
          </dl>
        </div>
      </section>

      {/* ── Category architecture ────────────────────────────────────────── */}
      <section className="mx-auto max-w-[var(--grid-max-width)] px-6 py-14 md:px-10 md:py-20">
        <SectionLabel>Disciplinas</SectionLabel>
        <p className="mt-4 max-w-[60ch] text-[length:var(--type-1)] leading-[1.55] text-[color:var(--ink-secondary)]">
          El eje completo queda registrado desde el primer día. Sólo una disciplina tiene
          profundidad embarcable hoy; las demás llevan sello de apertura en lugar de una página
          vacía, porque una taxonomía que se recorta después obliga a mover URLs que ya se
          compartieron.
        </p>

        <div className="mt-10 space-y-4">
          {active.map((d) => (
            <article
              key={d.slug}
              className="border border-[color:var(--accent-border)] bg-[color:var(--surface-1)]"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-[color:var(--ink-decoration)] px-6 py-5">
                <h3 className="text-[length:var(--type-3)] tracking-[var(--lane-display-tracking)]">
                  {d.name.es}
                </h3>
                <span className="lane-stamp px-2 py-1 text-[length:var(--lane-type-stamp)] leading-none">Activa</span>
              </div>

              <div className="flex flex-wrap items-end justify-between gap-6 px-6 py-6">
                <div>
                  <h4 className="text-[length:var(--type-2)] tracking-[var(--lane-display-tracking)]">
                    Azulejos
                  </h4>
                  <p className="mt-2 max-w-[46ch] text-[length:var(--type-0)] leading-[1.5] text-[color:var(--ink-secondary)]">
                    {fmtInt(SERIES.length)} series · {fmtInt(SKUS.length)} referencias ·{' '}
                    {FORMATS.join(' y ')} mm. Azulejo de arte esmaltado, cerámica cocida.
                  </p>
                </div>

                {/* One primary action for this card, and it is not "comprar". */}
                <Link
                  href={PASILLO_ROUTES.lane}
                  className="border border-[color:var(--accent)] bg-[color:var(--accent)] px-6 py-3 text-[length:var(--type-0)] tracking-[var(--lane-label-tracking)] text-[color:var(--surface-0)] uppercase transition-colors hover:bg-[color:var(--accent-hover)]"
                >
                  Recorrer el catálogo
                </Link>
              </div>
            </article>
          ))}

          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {opening.map((d) => (
              <li
                key={d.slug}
                data-status="OPENING"
                className="flex items-center justify-between border px-5 py-4"
              >
                <span className="text-[length:var(--type-1)]">{d.name.es}</span>
                <span className="text-[length:var(--lane-type-stamp)] uppercase tracking-[var(--lane-label-tracking)]">
                  En apertura
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Container logic ──────────────────────────────────────────────── */}
      <section className="border-y border-[color:var(--ink-decoration)] bg-[color:var(--surface-2)]">
        <div className="mx-auto max-w-[var(--grid-max-width)] px-6 py-14 md:px-10 md:py-20">
          <SectionLabel>Lógica de contenedor</SectionLabel>
          <h2 className="mt-4 max-w-[24ch] text-[length:var(--type-4)] leading-[1.15] tracking-[var(--lane-display-tracking)]">
            La cerámica llega al peso mucho antes que al volumen.
          </h2>
          <p className="mt-5 max-w-[62ch] text-[length:var(--type-1)] leading-[1.55] text-[color:var(--ink-secondary)]">
            Por eso el medidor de esta lane mide <strong className="font-medium">kilos</strong>, no
            metros cúbicos. Un 40&apos; admite la misma carga útil que un 20&apos; —{' '}
            {fmtInt(PAYLOAD_KG)} kg— en una caja más larga: pedir el contenedor grande no sube el
            tonelaje, sólo el flete. Las cifras de abajo salen del empaque impreso del proveedor,
            no de un promedio.
          </p>

          <div className="mt-10 overflow-x-auto">
            <table className="w-full min-w-[34rem] border-collapse text-left">
              <caption className="sr-only">
                Cobertura máxima por formato antes de alcanzar la carga útil de {fmtInt(PAYLOAD_KG)}{' '}
                kg
              </caption>
              <thead>
                <tr className="border-b border-[color:var(--ink-primary)]">
                  {['Formato', 'm² / caja', 'kg / caja', 'Cajas al tope', 'Cobertura'].map((h) => (
                    <th
                      key={h}
                      scope="col"
                      className="py-3 pr-6 text-[length:var(--lane-type-stamp)] font-medium uppercase tracking-[var(--lane-label-tracking)] text-[color:var(--ink-secondary)] last:pr-0"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="[font-variant-numeric:var(--numeric-variant)]">
                {FILL_ROWS.map((r) => (
                  <tr
                    key={`${r.format}-${r.kgPerCtn}`}
                    className="border-b border-[color:var(--ink-decoration)]"
                  >
                    <td className="py-4 pr-6 text-[length:var(--type-1)]">{r.format} mm</td>
                    <td className="py-4 pr-6 text-[length:var(--type-1)]">{fmtM2(r.m2PerCtn)}</td>
                    <td className="py-4 pr-6 text-[length:var(--type-1)]">{fmtM2(r.kgPerCtn)}</td>
                    <td className="py-4 pr-6 text-[length:var(--type-1)]">{fmtInt(r.cartons)}</td>
                    <td className="py-4 text-[length:var(--type-1)]">
                      <span className="text-[color:var(--accent-ink)]">{fmtM2(r.m2)} m²</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-5 max-w-[62ch] text-[length:var(--type-0)] leading-[1.5] text-[color:var(--ink-secondary)]">
            Cobertura de tope de carga, sin merma. La merma por corte y rotura se define contra el
            despiece del proyecto y se acuerda en la cotización — este catálogo no la supone.
          </p>
        </div>
      </section>

      {/* ── Proof ────────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-[var(--grid-max-width)] px-6 py-14 md:px-10 md:py-20">
        <SectionLabel>Qué está declarado y qué no</SectionLabel>
        <div className="mt-8 grid gap-10 md:grid-cols-2">
          <div>
            <h3 className="text-[length:var(--type-2)] tracking-[var(--lane-display-tracking)]">
              Declarado
            </h3>
            <ul className="mt-4 space-y-3 text-[length:var(--type-1)] leading-[1.5] text-[color:var(--ink-secondary)]">
              {[
                'Formato, espesor y acabado, tal como los imprime el proveedor',
                'Piezas por caja, kilos por caja y m² por caja',
                'Código de referencia exacto, verificable contra la hoja del catálogo',
                'Cuántas caras y cuántos patrones trae cada referencia',
              ].map((t) => (
                <li key={t} className="flex gap-3">
                  <span
                    aria-hidden
                    className="mt-2 h-px w-4 shrink-0 bg-[color:var(--accent)]"
                  />
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-[length:var(--type-2)] tracking-[var(--lane-display-tracking)]">
              Ausente, y por qué
            </h3>
            <ul className="mt-4 space-y-3 text-[length:var(--type-1)] leading-[1.5] text-[color:var(--ink-secondary)]">
              {[
                'PEI, resistencia al deslizamiento y absorción: el proveedor no las imprime en estos catálogos',
                'Uso recomendado y canto rectificado: mismo motivo',
                'Renders de ambiente: ninguno viene atado a una serie real',
                'Precio: se cotiza contra volumen, destino e incoterm',
              ].map((t) => (
                <li key={t} className="flex gap-3">
                  <span
                    aria-hidden
                    className="mt-2 h-px w-4 shrink-0 bg-[color:var(--ink-decoration)]"
                  />
                  {t}
                </li>
              ))}
            </ul>
            <p className="mt-6 max-w-[46ch] text-[length:var(--type-0)] leading-[1.5] text-[color:var(--ink-secondary)]">
              Un campo sin fuente impresa no es un campo. Aparece como pendiente en la ficha, nunca
              relleno con un valor plausible.
            </p>
          </div>
        </div>
      </section>

      {/* ── One primary action ───────────────────────────────────────────── */}
      <section className="border-t border-[color:var(--ink-primary)] bg-[color:var(--ink-primary)] text-[color:var(--surface-0)]">
        <div className="mx-auto max-w-[var(--grid-max-width)] px-6 py-14 md:px-10 md:py-20">
          <h2 className="max-w-[20ch] text-[length:var(--type-5)] leading-[1.1] tracking-[var(--lane-display-tracking)]">
            Empieza por la cantidad, no por el precio.
          </h2>
          <p className="mt-5 max-w-[58ch] text-[length:var(--type-1)] leading-[1.55] opacity-80">
            Recorre el catálogo, arma el muestrario y sal con los m², las cajas, los kilos y el
            llenado ya calculados. Esa lista es la que se cotiza.
          </p>
          <Link
            href={PASILLO_ROUTES.lane}
            className="mt-9 inline-block bg-[color:var(--surface-0)] px-8 py-4 text-[length:var(--type-0)] uppercase tracking-[var(--lane-label-tracking)] text-[color:var(--ink-primary)]"
          >
            Recorrer azulejos
          </Link>
        </div>
      </section>
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[length:var(--lane-type-stamp)] uppercase tracking-[var(--lane-label-tracking)] text-[color:var(--ink-secondary)]">
      {children}
    </p>
  )
}

function Figure({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[length:var(--lane-type-stamp)] uppercase tracking-[var(--lane-label-tracking)] text-[color:var(--ink-secondary)]">
        {label}
      </dt>
      <dd className="mt-1.5 text-[length:var(--type-1)] [font-variant-numeric:var(--numeric-variant)]">
        {value}
      </dd>
    </div>
  )
}
