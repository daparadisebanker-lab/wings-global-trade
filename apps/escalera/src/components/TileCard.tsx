'use client'

// La Escalera · Rung 1 — the card.
//
// "The product is a photograph. A tile card at full bleed IS the sales argument
// — no copy needed."  So: photo edge-to-edge, and the only chrome is the four
// things a buyer needs to read at arm's length — name, format, finish, status.
// One tap flips to the spec side. One flip, no navigation.

import { formatChip, type Tile } from '@/types/tile'
import { fmtM2 } from '@/lib/packing'

/** The status lamp.
 *
 * The catalogs publish format, finish and packing but no stock feed, so an
 * availability lamp would be a lie. What the lamp actually reports is whether
 * this SKU's numbers are ready to quote on: green = every packing constant came
 * off the supplier's own sheet; amber = at least one is a planning assumption
 * still to be confirmed. That is the fact that decides whether a carton count
 * can be trusted, which is the only status this tool can honestly show. */
export function specStatus(tile: Tile): { tone: 'ready' | 'pending'; label: string } {
  const assumed = Object.values(tile.packing.provenance).some((p) => p === 'assumed')
  return assumed
    ? { tone: 'pending', label: 'Empaque por confirmar' }
    : { tone: 'ready', label: 'Empaque confirmado' }
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="stamp rounded-pill border border-deck-ink/25 bg-deck-0/60 px-3 py-1 text-deck-ink backdrop-blur-sm">
      {children}
    </span>
  )
}

function SpecRow({ label, value }: { label: string; value: string | null | undefined }) {
  const missing = value == null || value === ''
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-deck-ink/10 py-3">
      <span className="stamp text-deck-ink-dim">{label}</span>
      <span
        className={
          missing
            ? 'font-mono text-t0 text-deck-ink-dim'
            : 'tabular font-mono text-t0 text-deck-ink'
        }
      >
        {missing ? 'pendiente' : value}
      </span>
    </div>
  )
}

export interface TileCardProps {
  tile: Tile
  /** which face is showing */
  flipped: boolean
  onFlip: () => void
  /** already in the record — the card says so instead of pretending it is new */
  kept: boolean
  /** eager-load the visible card, lazy-load the ones behind it */
  priority?: boolean
}

export function TileCard({ tile, flipped, onFlip, kept, priority }: TileCardProps) {
  const status = specStatus(tile)

  return (
    <div className="relative h-full w-full overflow-hidden rounded-panel bg-deck-1 shadow-elevation-3">
      {/* ── photo face ─────────────────────────────────────────────────── */}
      <div
        className="absolute inset-0 transition-opacity duration-200 ease-settle"
        style={{ opacity: flipped ? 0 : 1, pointerEvents: flipped ? 'none' : 'auto' }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={tile.image}
          alt={`${tile.name} — ${formatChip(tile)} mm`}
          className="h-full w-full select-none object-cover"
          draggable={false}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          fetchPriority={priority ? 'high' : 'low'}
        />

        {/* the only chrome: a bottom scrim carrying the four readable facts */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-deck-0 via-deck-0/80 to-transparent px-5 pb-5 pt-16">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <Chip>{formatChip(tile)}</Chip>
            <Chip>{tile.finish}</Chip>
            <span className="ml-auto flex items-center gap-2">
              <span
                aria-hidden
                className={`h-2 w-2 rounded-pill ${
                  status.tone === 'ready' ? 'bg-positive' : 'bg-gold'
                }`}
              />
              <span className="stamp text-deck-ink-dim">{status.label}</span>
            </span>
          </div>
          <h2 className="font-mono text-t2 leading-tight text-deck-ink">{tile.code}</h2>
          <p className="mt-1 text-t0 text-deck-ink-dim">
            {tile.series}
            {tile.note ? ` · ${tile.note}` : ''}
          </p>
        </div>

        {kept && (
          <div className="absolute left-5 top-5 rounded-pill bg-gold px-3 py-1">
            <span className="stamp text-gold-ink">En el muestrario</span>
          </div>
        )}
      </div>

      {/* ── spec face ──────────────────────────────────────────────────── */}
      <div
        className="absolute inset-0 overflow-y-auto bg-deck-1 px-5 py-6 transition-opacity duration-200 ease-settle"
        style={{ opacity: flipped ? 1 : 0, pointerEvents: flipped ? 'auto' : 'none' }}
        aria-hidden={!flipped}
      >
        <p className="stamp text-deck-ink-dim">Ficha técnica</p>
        <h2 className="mt-1 font-mono text-t3 text-deck-ink">{tile.code}</h2>
        <p className="mb-5 text-t0 text-deck-ink-dim">{tile.series}</p>

        <SpecRow label="Formato" value={`${formatChip(tile)} mm`} />
        <SpecRow label="Espesor" value={`${tile.thickness_mm} mm`} />
        <SpecRow label="Acabado" value={tile.finish} />
        <SpecRow label="Material" value={tile.material} />
        <SpecRow label="PEI" value={tile.pei ? String(tile.pei) : undefined} />
        <SpecRow label="Deslizamiento" value={tile.slip_rating} />
        <SpecRow label="Absorción" value={
          tile.water_absorption_pct != null ? `${tile.water_absorption_pct} %` : undefined
        } />
        <SpecRow label="Variación de tono" value={tile.shade_variation} />

        <p className="stamp mt-6 text-deck-ink-dim">Empaque</p>
        <SpecRow label="Piezas / caja" value={String(tile.packing.pcs_per_carton)} />
        <SpecRow label="m² / caja" value={fmtM2(tile.packing.m2_per_carton)} />
        <SpecRow label="kg / caja" value={String(tile.packing.kg_per_carton)} />
        <SpecRow
          label="Cajas / pallet"
          value={`${tile.packing.cartons_per_pallet}${
            tile.packing.provenance.cartons_per_pallet === 'assumed' ? ' *' : ''
          }`}
        />

        {tile.packing.provenance.cartons_per_pallet === 'assumed' && (
          <p className="mt-4 text-t0 leading-snug text-deck-ink-dim">
            * Cajas por pallet es un supuesto de planificación (pallet de 1 200 kg). El
            catálogo del proveedor no lo publica; se confirma en la cotización.
          </p>
        )}

        <button
          type="button"
          onClick={onFlip}
          className="mt-6 w-full rounded-control border border-deck-ink/25 py-3 text-t0 text-deck-ink"
        >
          Volver a la foto
        </button>
      </div>
    </div>
  )
}
