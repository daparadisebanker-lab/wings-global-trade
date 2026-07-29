'use client'

// "¿Qué formato?" — the decision panel.
//
// THIS IS A FIX, NOT A TUTORIAL STEP. A buyer weighing 150×150 against 300×300
// is not lost in the interface; they have found the format chips and cannot
// decide. A tour step anchored to those chips would have taught the location of
// a control they were already looking at.
//
// It states no recommendation. Not "150 suits a bathroom", not "300 reads
// calmer" — the supplier prints piece counts, weights and coverage and prints
// nothing about application, and the buyer's architect already made the
// aesthetic call. What no one can give them elsewhere is what the format costs
// to lay, to handle and to ship. See lib/formats.ts.
//
// The area field is the only input in the aisle that is about the PROJECT
// rather than the product, and it is why this page is worth a route: a buyer
// with 400 m² gets 396 cartons and 17 820 pieces against 297 and 4 455, which
// is a decision, where "44,4 piezas/m²" is a fact they still have to do
// arithmetic on.

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { LaneExit } from '@/pasillo/components/PasilloShell'
import { FORMAT_FACTS, FORMAT_PAYLOAD_KG, cartonsFor } from '@/pasillo/lib/formats'
import { AISLE_TOUR, replayTour } from '@/pasillo/lib/onboarding'
import { fmtInt, fmtM2 } from '@/pasillo/lib/packing'
import { PASILLO_ROUTES } from '@/pasillo/lib/routes'

const dec1 = (n: number) =>
  n.toLocaleString('es-ES', { minimumFractionDigits: 1, maximumFractionDigits: 1 })

export function Formatos() {
  // Empty, not pre-filled. A default area is a number the buyer did not give us
  // appearing in a comparison they are about to act on.
  const router = useRouter()
  const [area, setArea] = useState('')
  const m2 = Number(area.replace(',', '.'))
  const hasArea = Number.isFinite(m2) && m2 > 0

  return (
    <div className="flex min-h-dvh flex-col bg-pas-surface">
      <header className="border-b pas-rule px-4 py-4">
        <div className="pas-measure flex items-baseline justify-between gap-4">
          <div>
            <LaneExit />
            <h1 className="font-pas-display text-pas-t2 font-semibold tracking-pas-display">
              ¿Qué formato?
            </h1>
          </div>
          <Link
            href={PASILLO_ROUTES.lane}
            className="pas-stamp rounded-pas-chrome border border-pas-ink/25 px-4 py-2"
          >
            Al recorrido
          </Link>
        </div>
      </header>

      <main className="pas-measure flex-1 px-4 py-pas-5">
        <p className="max-w-[58ch] text-pas-t1">
          El catálogo trae dos formatos. El diseño lo decide el proyecto; lo que cambia con
          el formato son las piezas que hay que colocar, las cajas que hay que mover y los m²
          que entran en un contenedor.
        </p>

        {/* ── The buyer's own number ─────────────────────────────────────── */}
        <label className="mt-pas-6 flex flex-wrap items-center gap-3">
          <span className="pas-stamp opacity-pas-resting">Área del proyecto</span>
          <input
            type="number"
            inputMode="decimal"
            min={0}
            step="1"
            value={area}
            onChange={(e) => setArea(e.target.value)}
            placeholder="0"
            aria-label="Área del proyecto en metros cuadrados"
            className="pas-mono h-11 w-28 border pas-rule bg-pas-surface px-2 text-right text-pas-t0"
          />
          <span className="pas-stamp opacity-pas-resting">m²</span>
        </label>

        {/* ── The comparison ─────────────────────────────────────────────── */}
        <div className="mt-pas-6 grid gap-px border pas-rule bg-pas-rule sm:grid-cols-2">
          {FORMAT_FACTS.map((f) => {
            const forArea = hasArea ? cartonsFor(m2, f) : null
            return (
              <section key={f.format} className="bg-pas-surface p-pas-5">
                <h2 className="pas-mono text-pas-t1">{f.format} mm</h2>
                <p className="pas-stamp mt-1 opacity-pas-resting">
                  {fmtInt(f.seriesCount)} series · {fmtInt(f.skuCount)} referencias
                </p>

                <dl className="mt-pas-5 space-y-3">
                  <Row label="Piezas por m²" value={`${dec1(f.piecesPerM2)}`} />
                  <Row
                    label="Una caja"
                    value={`${fmtInt(f.pcsPerCtn)} pzas · ${fmtM2(f.m2PerCtn)} m² · ${f.kgPerCtn.toLocaleString('es-ES')} kg`}
                  />
                  <Row
                    label={`Al tope de ${fmtInt(FORMAT_PAYLOAD_KG)} kg`}
                    value={`${fmtInt(f.cartonsAtLimit)} cajas · ${fmtInt(Math.round(f.m2AtLimit))} m²`}
                  />
                  <Row label="Piezas en ese contenedor" value={fmtInt(f.piecesAtLimit)} />
                </dl>

                {/* The answer to the buyer's own question, in their own number.
                    Only rendered once they have given one — a projection over a
                    blank field is a number nobody asked for. */}
                {forArea && (
                  <p className="mt-pas-5 border-t pas-rule-hard pt-3 text-pas-t0">
                    Para {fmtInt(Math.round(m2))} m²:{' '}
                    <span className="pas-mono">{fmtInt(forArea.cartons)} cajas</span>
                    <span className="mx-2 opacity-pas-dimmed">·</span>
                    <span className="pas-mono">{fmtInt(forArea.pieces)} piezas</span>
                  </p>
                )}
              </section>
            )
          })}
        </div>

        {/* ── The trade, stated once ─────────────────────────────────────── */}
        <div className="mt-pas-6 border-l-2 pas-rule-hard pl-4">
          <p className="max-w-[58ch] text-pas-t1">
            El formato pequeño cubre{' '}
            <strong className="font-semibold">más m² por contenedor</strong> —{' '}
            {fmtInt(Math.round(FORMAT_FACTS[0].m2AtLimit))} contra{' '}
            {fmtInt(Math.round(FORMAT_FACTS[1].m2AtLimit))} — y lo hace en{' '}
            {fmtInt(FORMAT_FACTS[0].cartonsAtLimit)} cajas y{' '}
            {fmtInt(FORMAT_FACTS[0].piecesAtLimit)} piezas, contra{' '}
            {fmtInt(FORMAT_FACTS[1].cartonsAtLimit)} cajas y{' '}
            {fmtInt(FORMAT_FACTS[1].piecesAtLimit)} piezas del grande. Más cobertura por
            flete, más manipulación y más colocación.
          </p>
        </div>

        <p className="mt-pas-6 max-w-[58ch] text-pas-label opacity-pas-resting">
          Estas cifras salen del empaque impreso del proveedor. No incluyen merma por corte
          ni rotura: eso se define contra el despiece del proyecto y se acuerda en la
          cotización. Y no hay recomendación de uso — PEI, resistencia al deslizamiento y
          aplicación no vienen impresos en estos catálogos, así que no los afirmamos.
        </p>

        {/* The way back into the guide. This page is where a buyer already
            comes with a question, so it is where the answer to "how does the
            recorrido work again?" belongs. */}
        <div className="mt-pas-7 border-t pas-rule pt-pas-5">
          <button
            type="button"
            onClick={() => {
              replayTour(AISLE_TOUR.id, AISLE_TOUR.version)
              router.push(PASILLO_ROUTES.lane)
            }}
            className="pas-stamp min-h-11 underline underline-offset-4 opacity-pas-resting"
          >
            Ver la guía del recorrido otra vez
          </button>
        </div>

        <div className="mt-pas-6 flex flex-wrap gap-3">
          {FORMAT_FACTS.map((f) => (
            <Link
              key={f.format}
              href={`${PASILLO_ROUTES.lista}?formato=${encodeURIComponent(f.format)}`}
              className="rounded-pas-chrome border border-pas-ink/30 px-pas-5 py-3 text-pas-t0"
            >
              Ver {f.format} en Lista
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-4 border-b pas-rule pb-2">
      <dt className="pas-stamp opacity-pas-resting">{label}</dt>
      <dd className="pas-mono text-pas-dense">{value}</dd>
    </div>
  )
}
