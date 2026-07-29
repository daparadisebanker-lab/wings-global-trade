'use client'

// El Pasillo · §4.12 — the Trade Desk.
//
// Record layer, full REF-A: a ruled editable table, no chips and no icons.
// Quantity per SKU, destination port, incoterm, target date. Each line carries
// its lamp. The volume footer carries over and drives the container-load line.
//
// Two send actions of equal weight — WhatsApp and email. Parity is mandatory:
// the buyer's counterpart uses one or the other, and the tool does not get to
// decide which. Below them, unadorned: the promise.

import Link from 'next/link'
import { PASILLO_ROUTES } from '@/pasillo/lib/routes'
import { useMemo, useState } from 'react'
import { StatusLamp } from '@/pasillo/components/StatusLamp'
import { VolumeFooter } from '@/pasillo/components/VolumeFooter'
import { finishLabel, getSeries, getSku } from '@/pasillo/lib/catalogue'
import { mailtoHref, requestBody, whatsappHref } from '@/pasillo/lib/export'
import {
  BASIS_LABEL,
  containerFill,
  fmtInt,
  fmtKg,
  fmtM2,
  lineTotals,
  sumTotals,
  type ContainerKind,
} from '@/pasillo/lib/packing'
import { useRecord } from '@/pasillo/lib/record'

const INCOTERMS = ['FOB', 'CIF', 'EXW', 'CFR']

export function TradeDesk() {
  const rec = useRecord()
  const [kind, setKind] = useState<ContainerKind>('20GP')

  const rows = useMemo(
    () =>
      rec.state.folders.flatMap((f) => {
        const series = getSeries(f.series_uid)
        if (!series) return []
        return f.selected.flatMap((uid) => {
          const sku = getSku(uid)
          return sku ? [{ sku, series, totals: lineTotals(rec.state.qty[uid], series) }] : []
        })
      }),
    [rec.state.folders, rec.state.qty],
  )

  const totals = useMemo(() => sumTotals(rows.map((r) => r.totals)), [rows])
  const fill = containerFill(totals.kg, kind)
  const basis = rec.state.basis

  const body = useMemo(
    () =>
      requestBody({
        folders: rec.state.folders,
        qty: rec.state.qty,
        notes: rec.state.notes,
        buyer: rec.state.buyer,
        kind,
        dateISO: new Date().toISOString().slice(0, 10),
      }),
    [rec.state.folders, rec.state.qty, rec.state.notes, rec.state.buyer, kind],
  )

  if (!rec.hydrated) return <div className="min-h-dvh bg-pas-surface" aria-busy="true" />

  return (
    <div className="flex min-h-dvh flex-col bg-pas-surface">
      <header className="border-b pas-rule px-4 py-4">
        <div className="mx-auto flex max-w-4xl items-baseline justify-between gap-4">
          <div>
            <p className="pas-stamp opacity-pas-resting">Mesa de comercio</p>
            <h1 className="font-pas-display text-pas-t2 font-semibold tracking-[-0.02em]">
              {rows.length} {rows.length === 1 ? 'referencia' : 'referencias'}
            </h1>
          </div>
          <Link href={PASILLO_ROUTES.muestrario} className="pas-stamp rounded-pas-chrome border border-pas-ink/25 px-4 py-2">
            Al muestrario
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-pas-5">
        {rows.length === 0 ? (
          <p className="border pas-rule px-pas-6 py-14 text-center text-pas-t1 opacity-pas-resting">
            Elige piezas en el muestrario y aparecerán aquí para cotizar.
          </p>
        ) : (
          <>
            <section className="mb-pas-6 grid gap-3 sm:grid-cols-3">
              {(
                [
                  ['name', 'Nombre'],
                  ['company', 'Empresa'],
                  ['project', 'Proyecto'],
                  ['port', 'Puerto de destino'],
                  ['target', 'Fecha objetivo'],
                ] as const
              ).map(([key, label]) => (
                <label key={key}>
                  <span className="pas-stamp block opacity-pas-resting">{label}</span>
                  <input
                    type="text"
                    value={rec.state.buyer[key]}
                    onChange={(e) => rec.setBuyer({ [key]: e.target.value })}
                    className="mt-1 w-full border pas-rule bg-pas-surface px-3 py-2 text-pas-t0"
                  />
                </label>
              ))}
              <label>
                <span className="pas-stamp block opacity-pas-resting">Incoterm</span>
                <select
                  value={rec.state.buyer.incoterm}
                  onChange={(e) => rec.setBuyer({ incoterm: e.target.value })}
                  className="mt-1 w-full border pas-rule bg-pas-surface px-3 py-2 text-pas-t0"
                >
                  {INCOTERMS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </label>
            </section>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] border-collapse">
                <thead>
                  <tr className="border-b pas-rule-hard">
                    {['Código', 'Serie', 'Acabado', `Cant. (${BASIS_LABEL[basis]})`, 'Cajas', 'm²', 'kg', ''].map(
                      (h, i) => (
                        <th
                          key={h || i}
                          className={`pas-stamp py-2 font-normal opacity-pas-resting ${
                            i >= 3 && i <= 6 ? 'text-right' : 'text-left'
                          }`}
                        >
                          {h}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {rows.map(({ sku, series, totals: t }) => (
                    <tr key={sku.sku_uid} className="border-b pas-rule align-top">
                      <td className="pas-mono py-2.5 text-pas-t0">{sku.code}</td>
                      <td className="py-2.5 text-pas-dense opacity-pas-resting">{series.name_raw}</td>
                      <td className="py-2.5 text-pas-dense opacity-pas-resting">{finishLabel(sku)}</td>
                      <td className="py-2 text-right">
                        <input
                          type="number"
                          inputMode="decimal"
                          min={0}
                          step="0.01"
                          value={rec.state.qty[sku.sku_uid]?.value ?? ''}
                          placeholder="0"
                          aria-label={`Cantidad para ${sku.code}`}
                          onChange={(e) =>
                            rec.setQty(
                              sku.sku_uid,
                              e.target.value === ''
                                ? null
                                : { value: Math.max(0, Number(e.target.value)), basis },
                            )
                          }
                          className="pas-mono w-20 border pas-rule bg-pas-surface px-2 py-1 text-right text-pas-t0"
                        />
                      </td>
                      <td className="pas-mono py-2.5 text-right text-pas-t0">{fmtInt(t.cartons)}</td>
                      <td className="pas-mono py-2.5 text-right text-pas-t0">{fmtM2(t.m2)}</td>
                      <td className="pas-mono py-2.5 text-right text-pas-t0">{fmtKg(t.kg)}</td>
                      <td className="py-2.5 pl-3">
                        <StatusLamp status={series.status} />
                      </td>
                    </tr>
                  ))}
                  <tr className="border-t pas-rule-hard">
                    <td className="py-3 text-pas-t0 font-semibold" colSpan={4}>
                      TOTAL · {fmtInt(totals.skus)} referencias
                    </td>
                    <td className="pas-mono py-3 text-right text-pas-t0 font-semibold">
                      {fmtInt(totals.cartons)}
                    </td>
                    <td className="pas-mono py-3 text-right text-pas-t0 font-semibold">
                      {fmtM2(totals.m2)}
                    </td>
                    <td className="pas-mono py-3 text-right text-pas-t0 font-semibold">
                      {fmtKg(totals.kg)}
                    </td>
                    <td />
                  </tr>
                </tbody>
              </table>
            </div>

            <section className="mt-pas-8">
              <h2 className="pas-stamp opacity-pas-resting">Vista previa del mensaje</h2>
              <pre className="pas-mono mt-2 max-h-64 overflow-auto whitespace-pre-wrap border pas-rule bg-pas-surface-2 p-3 text-pas-micro">
                {body}
              </pre>
            </section>
          </>
        )}
      </main>

      {rows.length > 0 && (
        <div className="sticky bottom-0">
          <VolumeFooter
            totals={totals}
            fill={fill}
            basis={basis}
            onBasis={rec.setBasis}
            kind={kind}
            onKind={setKind}
          />
          <div className="border-t pas-rule bg-pas-surface px-4 py-4">
            <div className="mx-auto max-w-4xl">
              <div className="flex gap-3">
                <a
                  href={whatsappHref(body)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 rounded-pas-chrome bg-pas-ink py-3.5 text-center text-pas-t0 text-pas-surface"
                >
                  WhatsApp
                </a>
                <a
                  href={mailtoHref(body)}
                  className="flex-1 rounded-pas-chrome border border-pas-ink py-3.5 text-center text-pas-t0"
                >
                  Email
                </a>
              </div>
              <p className="mt-3 text-pas-t0 opacity-pas-resting">Respuesta en 24h hábiles.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
