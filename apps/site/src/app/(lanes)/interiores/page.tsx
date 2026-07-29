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
import { Escala } from './Escala'
import { Umbral } from './Umbral'

export const metadata: Metadata = {
  title: 'Interiores — WGT/02',
  // Says what ships. The old description listed five disciplines with nothing
  // behind them — the same overclaim the page itself no longer makes, except
  // this one was the version that reached a search result.
  description:
    'Azulejo de arte cerámico esmaltado para proyectos de hospitalidad y residenciales: 236 referencias en 150×150 y 300×300 mm, con m², cajas y peso por caja declarados antes de cotizar.',
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
  tileMm: s.format_mm[0],
  thickMm: s.thickness_mm,
  pcs: s.pcs_per_ctn,
  m2PerCtn: s.m2_per_ctn,
  kgPerCtn: s.kgs_per_ctn,
}))

const PAYLOAD_KG = CONTAINERS[0].payload

/** m² that reach the payload limit, per distinct packing. Floor, not ceil:
 *  this is what fits, and a carton you cannot load is not coverage. */
const FILL_ROWS = [...new Map(PACKINGS.map((p) => [`${p.format}|${p.pcs}|${p.kgPerCtn}`, p])).values()]
  .map((p) => {
    const cartons = Math.floor(PAYLOAD_KG / p.kgPerCtn)
    return { ...p, cartons, m2: cartons * p.m2PerCtn }
  })
  .sort((a, b) => b.m2 - a.m2)

export default function InterioresPage() {
  const active = lane.taxonomy.filter((t) => t.status === 'ACTIVE')

  return (
    // pt offsets the fixed site header, same as the (brands) group: this ground
    // is light and has no dark hero for the transparent nav to float over. It
    // lives here rather than on the lane layout — the aisle is a sibling and
    // must start at pixel zero.
    <div className="pt-16 md:pt-16" style={{ backgroundImage: 'var(--texture)' }}>
      {/* ── Lane header ──────────────────────────────────────────────────── */}
      <header className="mx-auto max-w-[var(--grid-max-width)] px-6 pb-12 pt-12 md:px-8 md:pb-16 md:pt-24">
        {/* NO STAMP PLATE HERE.
            WGTU 000002 · INTERIORES · PROJECT · DIVISIÓN EN APERTURA was four
            lines of internal registration language above the headline: an ISO
            container check digit, an archetype name out of the framework, and a
            status that tells a buyer the thing they are looking at is not ready.
            None of it is what a procurement buyer opened this page for. The
            lane code still governs the routes, the livery and the footer — it
            just no longer introduces the page. */}
        <h1 className=" max-w-[16ch] text-[length:var(--type-6)] font-normal leading-[1.05] tracking-[var(--lane-display-tracking)] md:text-[length:var(--type-7)]">
          Interiores
        </h1>

        <p className="mt-6 max-w-[62ch] text-[length:var(--type-2)] leading-[1.45] text-[color:var(--ink-secondary)]">
          {lane.scope.es}
        </p>
      </header>

      {/* ── Capability statement ─────────────────────────────────────────── */}
      <section className="border-y border-[color:var(--ink-decoration)] bg-[color:var(--surface-2)]">
        <div className="mx-auto grid max-w-[var(--grid-max-width)] gap-8 px-6 py-12 md:grid-cols-3 md:px-8 md:py-16">
          <div className="md:col-span-2">
            <h2 className="text-[length:var(--type-4)] leading-[1.15] tracking-[var(--lane-display-tracking)]">
              Un proyecto se compra en m² y se embarca en cajas enteras.
            </h2>
            <p className="mt-6 max-w-[58ch] text-[length:var(--type-1)] leading-[1.55] text-[color:var(--ink-secondary)]">
              Esta división es para quien compra contra una especificación que no escribió: firmas
              de procura y constructoras que necesitan saber cuántos m² cubren un piso, cuántas
              cajas son, cuánto pesan y cuánto contenedor ocupan — antes de pedir precio. Cada
              catálogo declara esas cuatro cifras en la misma pantalla donde se elige el diseño.
            </p>
          </div>

          <dl className="grid grid-cols-2 gap-x-6 gap-y-6 self-start md:grid-cols-1">
            {/* lane.unitMath is the registration record and is English on
                purpose — it is data. The buyer reads Spanish. */}
            <Figure label="Se negocia en" value="m² de cobertura · por llave" />
            <Figure label="Modalidad" value="Compra por proyecto" />
            <Figure label="Formatos" value={FORMATS.join(' · ') + ' mm'} />
            <Figure label="Referencias" value={fmtInt(SKUS.length)} />
          </dl>
        </div>
      </section>

      {/* ── The catalogue ────────────────────────────────────────────────
          NO DISCIPLINE INDEX. This section used to open with "Seis disciplinas,
          declaradas completas desde el primer día" and then list five of them
          under EN APERTURA stamps. It was an argument about the architecture of
          the lane, addressed to whoever built it, on a page whose reader is
          trying to price a floor. Five rows that go nowhere are five rows of
          noise, and the honesty they were reaching for is better served by
          simply not claiming the five. One catalogue ships; it gets the page. */}
      <section className="mx-auto max-w-[var(--grid-max-width)] px-6 py-12 md:px-8 md:py-24">
        <SectionLabel>El catálogo</SectionLabel>
        {active.map((d) => (
          <div key={d.slug} className="mt-8">
            <h2 className="max-w-[20ch] text-[length:var(--type-5)] leading-[1.1] tracking-[var(--lane-display-tracking)]">
              Azulejos
            </h2>
            <p className="mt-6 max-w-[58ch] text-[length:var(--type-1)] leading-[1.55] text-[color:var(--ink-secondary)]">
              Azulejo de arte cerámico esmaltado, {fmtInt(SERIES.length)} series y{' '}
              {fmtInt(SKUS.length)} referencias en {FORMATS.join(' y ')} mm. Cada referencia
              declara piezas por caja, m² por caja y kilos por caja — las cifras con las que
              se arma una cotización.
            </p>
            <Umbral>
              <Link
                href={PASILLO_ROUTES.lane}
                className="mt-8 inline-block border border-[color:var(--accent)] bg-[color:var(--accent)] px-8 py-4 text-[length:var(--type-0)] uppercase tracking-[var(--lane-label-tracking)] text-[color:var(--surface-0)] transition-colors hover:bg-[color:var(--accent-hover)]"
              >
                Recorrer el catálogo
              </Link>
            </Umbral>
          </div>
        ))}
      </section>

      {/* ── Container logic ──────────────────────────────────────────────── */}
      <section className="border-y border-[color:var(--ink-decoration)] bg-[color:var(--surface-2)]">
        <div className="mx-auto max-w-[var(--grid-max-width)] px-6 py-12 md:px-8 md:py-24">
          <SectionLabel>Lógica de contenedor</SectionLabel>
          <h2 className="mt-4 max-w-[24ch] text-[length:var(--type-4)] leading-[1.15] tracking-[var(--lane-display-tracking)]">
            La cerámica llega al límite de peso mucho antes que al de volumen.
          </h2>
          <p className="mt-6 max-w-[62ch] text-[length:var(--type-1)] leading-[1.55] text-[color:var(--ink-secondary)]">
            Por eso el medidor de esta división mide{' '}
            <strong className="font-medium">kilos</strong>, no metros cúbicos. Un 40&apos; admite la
            misma carga útil que un 20&apos; — {fmtInt(PAYLOAD_KG)} kg— en una caja más larga: el
            contenedor grande no aumenta el tonelaje que se puede cargar. Las cifras de abajo salen
            del empaque impreso del proveedor, no de un promedio.
          </p>

          <Escala rows={FILL_ROWS} payloadKg={PAYLOAD_KG} />

          <p className="mt-6 max-w-[62ch] text-[length:var(--type-0)] leading-[1.5] text-[color:var(--ink-secondary)]">
            Cobertura de tope de carga, sin merma. La merma por corte y rotura se define contra el
            despiece del proyecto y se acuerda en la cotización — este catálogo no la supone.
          </p>
        </div>
      </section>

      {/* ── Proof ────────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-[var(--grid-max-width)] px-6 py-12 md:px-8 md:py-24">
        <SectionLabel>Qué está declarado y qué no</SectionLabel>
        <div className="mt-8 grid gap-12 md:grid-cols-2">
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
                'PEI, resistencia al deslizamiento y absorción de agua: el proveedor no los imprime en estos catálogos',
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
      <section className="border-t border-[color:var(--surface-inverse)] bg-[color:var(--surface-inverse)] text-[color:var(--ink-inverse)]">
        <div className="mx-auto max-w-[var(--grid-max-width)] px-6 py-12 md:px-8 md:py-24">
          <h2 className="max-w-[20ch] text-[length:var(--type-5)] leading-[1.1] tracking-[var(--lane-display-tracking)]">
            Sal con la cantidad lista para cotizar.
          </h2>
          <p className="mt-6 max-w-[58ch] text-[length:var(--type-1)] leading-[1.55] text-[color:var(--ink-inverse-secondary)]">
            Recorre el catálogo, arma el muestrario y sal con los m², las cajas, los kilos y el
            llenado ya calculados. Esa lista es la que se cotiza.
          </p>
          <Umbral>
            <Link
              href={PASILLO_ROUTES.lane}
              className="mt-8 inline-block bg-[color:var(--ink-inverse)] px-8 py-4 text-[length:var(--type-0)] uppercase tracking-[var(--lane-label-tracking)] text-[color:var(--surface-inverse)]"
            >
              Recorrer el catálogo de azulejos
            </Link>
          </Umbral>
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
      <dd className="mt-2 text-[length:var(--type-1)] [font-variant-numeric:var(--numeric-variant)]">
        {value}
      </dd>
    </div>
  )
}
