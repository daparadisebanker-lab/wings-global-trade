'use client'

// El Pasillo · §4.8 — the volume footer.
//
// Tiles are bought by area and shipped by container. A muestrario that totals
// items but not m² and container fill is not a procurement document — it is a
// wishlist. This component is probably the strongest reason a buyer keeps the
// app open instead of emailing a screenshot of the catalogue.
//
// The bar measures WEIGHT against payload, because tiles reach a container's
// weight limit long before its volume. A 40' box does not carry twice the tiles
// of a 20'; it carries the same payload in a longer room. The footer says so.

import {
  BASIS_LABEL,
  CONTAINERS,
  fmtFcl,
  fmtInt,
  fmtKg,
  fmtM2,
  type Basis,
  type ContainerFill,
  type RecordTotals,
} from '@/lib/packing'

const BASIS_CYCLE: Basis[] = ['m2', 'ctn', 'pcs']

export function VolumeFooter({
  totals,
  fill,
  basis,
  onBasis,
  kind,
  onKind,
}: {
  totals: RecordTotals
  fill: ContainerFill
  basis: Basis
  onBasis: (b: Basis) => void
  kind: ContainerFill['kind']
  onKind: (k: ContainerFill['kind']) => void
}) {
  const headline =
    basis === 'ctn'
      ? `${fmtInt(totals.cartons)} cajas`
      : basis === 'pcs'
        ? `${fmtInt(totals.pcs)} piezas`
        : `${fmtM2(totals.m2)} m²`

  return (
    <section className="border-t rule-hard bg-surface px-4 py-3">
      <div className="mx-auto max-w-3xl">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          {/* tap the figure to change what the record is counted in */}
          <button
            type="button"
            onClick={() => onBasis(BASIS_CYCLE[(BASIS_CYCLE.indexOf(basis) + 1) % BASIS_CYCLE.length])}
            className="mono text-t1 tracking-tight"
            aria-label={`Cambiar base; actualmente ${BASIS_LABEL[basis]}`}
          >
            {fmtInt(totals.skus)} SKU · {fmtInt(totals.cartons)} cajas · {headline}
          </button>

          <div role="radiogroup" aria-label="Contenedor" className="flex gap-1">
            {CONTAINERS.map((c) => (
              <button
                key={c.kind}
                type="button"
                role="radio"
                aria-checked={c.kind === kind}
                onClick={() => onKind(c.kind)}
                className={`stamp px-2 py-1 ${
                  c.kind === kind ? 'bg-ink text-surface' : 'opacity-resting'
                }`}
              >
                {c.kind === '20GP' ? "20'" : "40'"}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-2 flex items-center gap-3">
          <div
            className="h-1.5 flex-1 overflow-hidden bg-surface-2"
            role="img"
            aria-label={`${fmtKg(fill.loadedKg)} de ${fmtKg(fill.payloadKg)} kilos de carga máxima`}
          >
            <div
              className="h-full bg-ink transition-[width] duration-light ease-settle"
              style={{ width: `${fill.pct}%` }}
            />
          </div>
          <p className="mono shrink-0 text-t0">
            {fmtFcl(fill.fcl)} × {fill.kind === '20GP' ? "20'" : "40'"} FCL
          </p>
        </div>

        <p className="stamp mt-1.5 opacity-resting">
          {fmtKg(fill.loadedKg)} / {fmtKg(fill.payloadKg)} kg — los azulejos llenan por peso
          antes que por volumen
          {fill.containersNeeded > 1 ? ` · ${fill.containersNeeded} contenedores` : ''}
        </p>
      </div>
    </section>
  )
}
