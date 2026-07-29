'use client'

// El Pasillo · §4.5 — the SKU's own truth, in one body with two frames.
//
// This used to live inside SheetDock. It was lifted out the moment the aisle
// grew a second frame for it (the desktop side panel), because the alternative
// — two copies of a spec table — is how a catalogue ends up telling a buyer two
// different things about the same tile depending on the width of their window.
// One body, one set of rows, one place a field is added.
//
// The frame decides chrome and motion. The body decides what is true.

import { RepeatPreview } from '@/pasillo/components/RepeatPreview'
import { StatusLamp } from '@/pasillo/components/StatusLamp'
import {
  colourLabel,
  finishLabel,
  formatLabel,
  getSeries,
  patternLabel,
  seriesName,
  seriesNameRaw,
  skusOf,
} from '@/pasillo/lib/catalogue'
import { fmtM2 } from '@/pasillo/lib/packing'
import { haptic, useRecord } from '@/pasillo/lib/record'
import type { Sku } from '@/pasillo/types/catalogue'

function Row({ label, value }: { label: string; value: string | null | undefined }) {
  const missing = value == null || value === ''
  return (
    <div className="flex items-baseline justify-between gap-pas-6 border-b pas-rule py-2">
      <dt className="text-pas-t0 opacity-pas-resting">{label}</dt>
      <dd className={`pas-mono text-pas-t0 text-right ${missing ? 'opacity-pas-dimmed' : 'opacity-pas-lit'}`}>
        {missing ? 'pendiente' : value}
      </dd>
    </div>
  )
}

export function SkuDetail({
  sku,
  onOpenSku,
  /** Rendered at the top-right, beside the collect button. The sheet has a drag
   *  handle and an overlay to dismiss with; the panel has neither and needs a
   *  named control, so the frame supplies it rather than the body assuming one. */
  onClose,
}: {
  sku: Sku
  onOpenSku: (sku: Sku) => void
  onClose?: () => void
}) {
  const rec = useRecord()
  const series = getSeries(sku.series_uid)
  if (!series) return null

  const siblings = skusOf(sku.series_uid).filter((s) => s.sku_uid !== sku.sku_uid)
  const collected = rec.isSkuSelected(sku.series_uid, sku.sku_uid)

  return (
    <>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="pas-mono text-pas-t2 leading-tight">{sku.code}</p>
          <p className="text-pas-t0 opacity-pas-resting">{seriesName(series)}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => {
              haptic('collect')
              if (collected) rec.toggleSku(sku.series_uid, sku.sku_uid)
              else rec.collectSku(sku.series_uid, sku.sku_uid)
            }}
            className={`rounded-pas-chrome px-pas-5 py-2 text-pas-t0 transition-colors ${
              collected ? 'bg-pas-ink text-pas-surface' : 'border border-pas-ink/30'
            }`}
          >
            {collected ? 'En el muestrario' : 'Guardar'}
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar la ficha"
              className="grid h-11 w-11 place-items-center rounded-pas-chrome text-pas-t1 opacity-pas-resting
                         transition-opacity duration-pas-light hover:opacity-pas-lit"
            >
              <span aria-hidden>×</span>
            </button>
          )}
        </div>
      </div>

      <div className="mt-4">
        <RepeatPreview sku={sku} />
      </div>

      <dl className="mt-pas-6">
        <Row label="Código" value={sku.code} />
        <Row label="Serie" value={seriesName(series)} />
        {/* The printed name, so a buyer can match this sheet back to
            the supplier's own PDF without leaving it. */}
        {seriesNameRaw(series) && <Row label="Serie (fábrica)" value={seriesNameRaw(series)} />}
        {colourLabel(sku) && <Row label="Color" value={colourLabel(sku)} />}
        <Row label="Formato" value={`${formatLabel(series)}×${series.thickness_mm} mm`} />
        <Row label="Acabado" value={finishLabel(sku)} />
        <Row label="Patrones" value={patternLabel(sku)} />
        <Row label="Piezas/caja" value={String(series.pcs_per_ctn)} />
        <Row label="Cobertura" value={`${fmtM2(series.m2_per_ctn)} m²/caja`} />
        <Row label="Peso/caja" value={`${series.kgs_per_ctn} kg`} />
        {/* Absent from these catalogues. Shown as pending rather than invented —
            a spec a buyer relies on must have a printed source. */}
        <Row label="Absorción de agua" value={null} />
        <Row label="PEI" value={null} />
        <Row label="Resist. al deslizamiento" value={null} />
        <Row label="Aplicación" value={null} />
      </dl>

      <div className="mt-3 flex items-center justify-between">
        <p className="pas-stamp opacity-pas-dimmed">{sku.finish_raw}</p>
        <StatusLamp status={series.status} />
      </div>

      {siblings.length > 0 && (
        <section className="mt-pas-7">
          <h3 className="pas-stamp opacity-pas-resting">Misma serie · {siblings.length}</h3>
          {/* the sibling strip: the family, without navigating away */}
          <div className="-mx-pas-5 mt-3 flex gap-2 overflow-x-auto px-pas-5 pb-2">
            {siblings.map((s) => {
              const has = rec.isSkuSelected(s.series_uid, s.sku_uid)
              return (
                <button
                  key={s.sku_uid}
                  type="button"
                  onClick={() => onOpenSku(s)}
                  className="relative w-pas-8 shrink-0"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={s.thumb}
                    alt={s.code}
                    className="aspect-square w-full rounded-pas-record object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                  {has && <span aria-hidden className="pas-collected-mark absolute inset-0" />}
                  <span className="pas-mono mt-1 block truncate text-pas-label opacity-pas-resting">
                    {s.code}
                  </span>
                </button>
              )
            })}
          </div>
        </section>
      )}
    </>
  )
}
