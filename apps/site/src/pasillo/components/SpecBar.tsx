// El Pasillo · §4.2 — the booth header, built on the supplier's own best idea.
//
// The catalogue hoists every shared spec out of the grid into one black band
// above it: "Packing: 45 PCS/CTN · Weight: 17.5 KGS/CTN · 150×150×9MM". Series
// truth stated once, never repeated on a tile. Buyers in this trade already read
// that document fluently, so the header inherits the language rather than
// inventing one — and it is what lets the grid beneath run dense, because every
// tile carries only what differs.

import { StatusLamp } from '@/pasillo/components/StatusLamp'
import { formatLabel } from '@/pasillo/lib/catalogue'
import type { Series } from '@/pasillo/types/catalogue'

export function SpecBar({
  series,
  invertedOnDark = false,
}: {
  series: Series
  /** on the lane's dark ground the band inverts the other way to stay a band */
  invertedOnDark?: boolean
}) {
  return (
    <header className={invertedOnDark ? 'text-pas-surface' : 'text-pas-ink'}>
      <h2 className="font-pas-display text-pas-t2 font-semibold leading-tight tracking-pas-display">
        {series.name_raw}
      </h2>
      <p className="pas-stamp mt-1 opacity-pas-resting">
        {formatLabel(series)}×{series.thickness_mm}MM
      </p>

      {/* the inverted bar itself */}
      <div
        className={`mt-3 flex h-pas-6 items-center px-3 ${
          invertedOnDark ? 'bg-pas-surface text-pas-ink' : 'pas-spec-bar'
        }`}
      >
        <p className="pas-stamp truncate">
          {series.pcs_per_ctn} PCS/CTN · {series.kgs_per_ctn} KGS/CTN ·{' '}
          {series.m2_per_ctn.toFixed(2)} m²/CTN
        </p>
      </div>

      <div className="mt-2 flex items-center justify-between gap-4">
        <p className="pas-stamp opacity-pas-resting">
          {series.sku_count} {series.sku_count === 1 ? 'diseño' : 'diseños'}
        </p>
        <StatusLamp status={series.status} onDark={invertedOnDark} />
      </div>
    </header>
  )
}
