'use client'

// La Escalera · Rung 3 — the container fill bar.
//
// The one instrument on the sheet that is not a number in a table, and the one
// place the tool tells the buyer something the PDF never could: this load is
// limited by WEIGHT, not by space. A 40' box does not carry twice the tiles of a
// 20' — it carries the same payload in a longer room. The honest note prints
// beside the bar, exactly as the spec requires.

import { motion, useReducedMotion } from 'framer-motion'
import {
  ESCALERA_CONTAINERS,
  fmtKg,
  fmtPct,
  type ContainerFill,
  type ContainerKind,
} from '@/lib/packing'
import { WEIGHT_NOTE } from '@/lib/quote'

export function ContainerFillBar({
  fill,
  kind,
  onKind,
}: {
  fill: ContainerFill
  kind: ContainerKind
  onKind: (k: ContainerKind) => void
}) {
  const reduced = useReducedMotion()
  const over = fill.containersNeeded > 1

  return (
    <section className="rounded-panel border border-line/20 bg-sheet-1 p-5">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h3 className="stamp text-sheet-ink-dim">Carga del contenedor</h3>

        {/* 20ft / 40ft toggle */}
        <div
          role="radiogroup"
          aria-label="Tipo de contenedor"
          className="flex rounded-pill border border-line/25 p-1"
        >
          {ESCALERA_CONTAINERS.map((c) => {
            const active = c.kind === kind
            return (
              <button
                key={c.kind}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => onKind(c.kind)}
                className={`stamp rounded-pill px-4 py-1.5 transition-colors ${
                  active ? 'bg-accent text-accent-ink' : 'text-sheet-ink-dim'
                }`}
              >
                {c.kind === '20GP' ? "20'" : "40'"}
              </button>
            )
          })}
        </div>
      </div>

      {/* the box */}
      <div
        className="relative h-16 overflow-hidden rounded-control border border-line-strong/40 bg-sheet-0"
        role="img"
        aria-label={`${fmtKg(fill.loadedKg)} kilos de ${fmtKg(fill.payloadKg)} kilos de carga máxima, ${fmtPct(fill.fillPct)} por ciento`}
      >
        {/* corrugation — a container, not a progress bar */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.14]"
          style={{
            backgroundImage:
              'repeating-linear-gradient(90deg, rgb(var(--sheet-ink)) 0 1px, transparent 1px 9px)',
          }}
        />
        <motion.div
          className={`absolute inset-y-0 left-0 ${over ? 'bg-caution' : 'bg-accent'}`}
          initial={false}
          animate={{ width: `${fill.fillPct}%` }}
          transition={reduced ? { duration: 0 } : { duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        />
        {/* payload ceiling */}
        <div aria-hidden className="absolute inset-y-0 right-0 w-px bg-line-strong/60" />
      </div>

      <div className="mt-3 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <p className="tabular font-mono text-t1 text-sheet-ink">
          {fmtKg(fill.loadedKg)} <span className="text-sheet-ink-dim">/ {fmtKg(fill.payloadKg)} kg</span>
        </p>
        <p className="tabular font-mono text-t1 text-sheet-ink">{fmtPct(fill.fillPct)}%</p>
      </div>

      {over && (
        <p className="mt-2 text-t0 font-medium text-caution">
          Esta carga necesita {fill.containersNeeded} contenedores {fill.label}.
        </p>
      )}

      <p className="mt-3 border-t border-line/20 pt-3 text-t0 leading-snug text-sheet-ink-dim">
        {WEIGHT_NOTE} Por eso la barra mide kilos contra la carga máxima ({fmtKg(fill.payloadKg)} kg),
        no metros cúbicos.
      </p>
    </section>
  )
}
