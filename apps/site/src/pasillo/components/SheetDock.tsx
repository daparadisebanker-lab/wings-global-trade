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
import { RepeatPreview } from '@/pasillo/components/RepeatPreview'
import { StatusLamp } from '@/pasillo/components/StatusLamp'
import { finishLabel, formatLabel, getSeries, patternLabel, skusOf } from '@/pasillo/lib/catalogue'
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
        {/* data-app is REQUIRED on both portal children and is not decoration.
            vaul portals to <body>, which is outside the [data-app='pasillo']
            wrapper the route layout stamps — so every --pas-* token, every
            scoped selector (.pas-mono, .pas-stamp, .pas-rule, the focus ring)
            and the Archivo/Geist Mono faces silently fail inside the portal.
            The drawer rendered transparent, in the site's body face, with SKU
            codes NOT in mono — breaking the one doctrine that matters most on
            the one surface where the buyer studies the code. It only looked
            plausible on the dark Lane, where white-on-blur reads by accident.
            Re-stamping the attribute brings the token layer through the portal. */}
        <Drawer.Overlay
          data-app="pasillo"
          className="fixed inset-0 z-40 bg-pas-lane-ground/55 backdrop-blur-[var(--pas-blur-scrim)]"
        />
        <Drawer.Content
          data-app="pasillo"
          className="fixed inset-x-0 bottom-0 z-50 mx-auto flex h-[92dvh] max-w-2xl flex-col
                     rounded-t-pas-chrome bg-pas-surface outline-none"
        >
          <Drawer.Handle className="mx-auto my-3 h-1 w-10 shrink-0 rounded-full bg-pas-ink/20" />

          {active && series && (
            <div
              key={active.sku_uid}
              className="flex-1 overflow-y-auto px-pas-5 pb-pas-8 transition-opacity duration-pas-cross"
            >
              <Drawer.Title className="sr-only">{active.code}</Drawer.Title>

              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="pas-mono text-pas-t2 leading-tight">{active.code}</p>
                  <p className="text-pas-t0 opacity-pas-resting">{series.name_raw}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    haptic('collect')
                    if (collected) rec.toggleSku(active.series_uid, active.sku_uid)
                    else rec.collectSku(active.series_uid, active.sku_uid)
                  }}
                  className={`shrink-0 rounded-pas-chrome px-pas-5 py-2 text-pas-t0 transition-colors ${
                    collected ? 'bg-pas-ink text-pas-surface' : 'border border-pas-ink/30'
                  }`}
                >
                  {collected ? 'En el muestrario' : 'Guardar'}
                </button>
              </div>

              <div className="mt-4">
                <RepeatPreview sku={active} />
              </div>

              <dl className="mt-pas-6">
                <Row label="Código" value={active.code} />
                <Row label="Serie" value={series.name_raw} />
                <Row
                  label="Formato"
                  value={`${formatLabel(series)}×${series.thickness_mm} mm`}
                />
                <Row label="Acabado" value={finishLabel(active)} />
                <Row label="Patrones" value={patternLabel(active)} />
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
                <p className="pas-stamp opacity-pas-dimmed">{active.finish_raw}</p>
                <StatusLamp status={series.status} />
              </div>

              {siblings.length > 0 && (
                <section className="mt-pas-7">
                  <h3 className="pas-stamp opacity-pas-resting">
                    Misma serie · {siblings.length}
                  </h3>
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
                          {has && (
                            <span aria-hidden className="pas-collected-mark absolute inset-0" />
                          )}
                          <span className="pas-mono mt-1 block truncate text-pas-label opacity-pas-resting">
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
