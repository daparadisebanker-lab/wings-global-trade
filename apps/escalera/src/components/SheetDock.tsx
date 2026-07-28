'use client'

// El Pasillo · §4.5 — the sheet-dock.
//
// Soft chrome over a hard record: the corners a thumb touches are rounded, the
// table inside is ruled key/value with no cards, no chips and no icons. A ruled
// row does a card's work for one hairline.
//
// Peek carries the 3×3 repeat, the code and the collect action — enough to judge
// the field and collect without leaving the view. Full adds the spec table and
// the sibling strip, so a buyer who likes this pattern sees its family without
// navigating away.
//
// The frame never moves when the SKU changes; only the contents cross-fade.

import { Drawer } from 'vaul'
import { useEffect, useState } from 'react'
import { RepeatPreview } from '@/components/RepeatPreview'
import { StatusLamp } from '@/components/StatusLamp'
import { finishLabel, formatLabel, getSeries, patternLabel, skusOf } from '@/lib/catalogue'
import { haptic, useRecord } from '@/lib/record'
import type { Sku } from '@/types/catalogue'

function Row({ label, value }: { label: string; value: string | null | undefined }) {
  const missing = value == null || value === ''
  return (
    <div className="flex items-baseline justify-between gap-6 border-b rule py-2.5">
      <dt className="text-t0 opacity-resting">{label}</dt>
      <dd className={`mono text-t0 text-right ${missing ? 'opacity-dimmed' : 'opacity-lit'}`}>
        {missing ? 'pendiente' : value}
      </dd>
    </div>
  )
}

export function SheetDock({
  sku,
  onClose,
  onOpenSku,
}: {
  sku: Sku | null
  onClose: () => void
  onOpenSku: (sku: Sku) => void
}) {
  const rec = useRecord()
  const [shown, setShown] = useState<Sku | null>(sku)

  // Cross-fade the contents when the SKU changes; the frame stays put.
  useEffect(() => {
    if (!sku) return
    if (!shown || shown.sku_uid === sku.sku_uid) {
      setShown(sku)
      return
    }
    const t = setTimeout(() => setShown(sku), 90)
    return () => clearTimeout(t)
  }, [sku, shown])

  const active = shown ?? sku
  const series = active ? getSeries(active.series_uid) : undefined
  const siblings = active ? skusOf(active.series_uid).filter((s) => s.sku_uid !== active.sku_uid) : []
  const collected = active ? rec.isSkuSelected(active.series_uid, active.sku_uid) : false

  return (
    <Drawer.Root open={!!sku} onOpenChange={(o) => !o && onClose()} snapPoints={[0.35, 0.92]}>
      <Drawer.Portal>
        {/* the scrim is capped: blur is the battery line item */}
        <Drawer.Overlay className="fixed inset-0 z-40 bg-lane-ground/55 backdrop-blur-[8px]" />
        <Drawer.Content
          className="fixed inset-x-0 bottom-0 z-50 mx-auto flex h-[92dvh] max-w-2xl flex-col
                     rounded-t-chrome bg-surface outline-none"
        >
          <Drawer.Handle className="mx-auto my-3 h-1 w-10 shrink-0 rounded-full bg-ink/20" />

          {active && series && (
            <div
              key={active.sku_uid}
              className="flex-1 overflow-y-auto px-5 pb-8 transition-opacity duration-cross"
            >
              <Drawer.Title className="sr-only">{active.code}</Drawer.Title>

              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="mono text-t2 leading-tight">{active.code}</p>
                  <p className="text-t0 opacity-resting">{series.name_raw}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    haptic('collect')
                    if (collected) rec.toggleSku(active.series_uid, active.sku_uid)
                    else rec.collectSku(active.series_uid, active.sku_uid)
                  }}
                  className={`shrink-0 rounded-chrome px-5 py-2.5 text-t0 transition-colors ${
                    collected ? 'bg-ink text-surface' : 'border border-ink/30'
                  }`}
                >
                  {collected ? 'En el muestrario' : 'Guardar'}
                </button>
              </div>

              <div className="mt-4">
                <RepeatPreview sku={active} />
              </div>

              <dl className="mt-6">
                <Row label="Código" value={active.code} />
                <Row label="Serie" value={series.name_raw} />
                <Row
                  label="Formato"
                  value={`${formatLabel(series)}×${series.thickness_mm} mm`}
                />
                <Row label="Acabado" value={finishLabel(active)} />
                <Row label="Patrones" value={patternLabel(active)} />
                <Row label="Piezas/caja" value={String(series.pcs_per_ctn)} />
                <Row label="Cobertura" value={`${series.m2_per_ctn.toFixed(2)} m²/caja`} />
                <Row label="Peso/caja" value={`${series.kgs_per_ctn} kg`} />
                {/* Absent from these catalogues. Shown as pending rather than invented —
                    a spec a buyer relies on must have a printed source. */}
                <Row label="Absorción" value={null} />
                <Row label="PEI" value={null} />
                <Row label="Antideslizante" value={null} />
                <Row label="Aplicación" value={null} />
              </dl>

              <div className="mt-3 flex items-center justify-between">
                <p className="stamp opacity-dimmed">{active.finish_raw}</p>
                <StatusLamp status={series.status} />
              </div>

              {siblings.length > 0 && (
                <section className="mt-7">
                  <h3 className="stamp opacity-resting">
                    Misma serie · {siblings.length}
                  </h3>
                  {/* the sibling strip: the family, without navigating away */}
                  <div className="-mx-5 mt-3 flex gap-2 overflow-x-auto px-5 pb-2">
                    {siblings.map((s) => {
                      const has = rec.isSkuSelected(s.series_uid, s.sku_uid)
                      return (
                        <button
                          key={s.sku_uid}
                          type="button"
                          onClick={() => onOpenSku(s)}
                          className="relative w-20 shrink-0"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={s.thumb}
                            alt={s.code}
                            className="aspect-square w-full rounded-record object-cover"
                            loading="lazy"
                            decoding="async"
                          />
                          {has && (
                            <span aria-hidden className="collected-mark absolute inset-0" />
                          )}
                          <span className="mono mt-1 block truncate text-[10px] opacity-resting">
                            {s.code}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </section>
              )}
            </div>
          )}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}
