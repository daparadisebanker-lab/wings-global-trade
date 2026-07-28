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
import { useMemo, useState } from 'react'
import { StatusLamp } from '@/components/StatusLamp'
import { VolumeFooter } from '@/components/VolumeFooter'
import { finishLabel, getSeries, getSku } from '@/lib/catalogue'
import { mailtoHref, requestBody, whatsappHref } from '@/lib/export'
import {
  BASIS_LABEL,
  containerFill,
  fmtInt,
  fmtKg,
  fmtM2,
  lineTotals,
  sumTotals,
  type ContainerKind,
} from '@/lib/packing'
import { useRecord } from '@/lib/record'

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

  if (!rec.hydrated) return <div className="min-h-dvh bg-surface" aria-busy="true" />

  return (
    <div className="flex min-h-dvh flex-col bg-surface">
      <header className="border-b rule px-4 py-4">
        <div className="mx-auto flex max-w-4xl items-baseline justify-between gap-4">
          <div>
            <p className="stamp opacity-resting">Mesa de comercio</p>
            <h1 className="font-display text-t2 font-semibold tracking-[-0.02em]">
              {rows.length} {rows.length === 1 ? 'referencia' : 'referencias'}
            </h1>
          </div>
          <Link href="/muestrario" className="stamp rounded-chrome border border-ink/25 px-4 py-2">
            Al muestrario
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-5">
        {rows.length === 0 ? (
          <p className="border rule px-6 py-14 text-center text-t1 opacity-resting">
            Elige piezas en el muestrario y aparecerán aquí para cotizar.
          </p>
        ) : (
          <>
            <section className="mb-6 grid gap-3 sm:grid-cols-3">
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
                  <span className="stamp block opacity-resting">{label}</span>
                  <input
                    type="text"
                    value={rec.state.buyer[key]}
                    onChange={(e) => rec.setBuyer({ [key]: e.target.value })}
                    className="mt-1 w-full border rule bg-surface px-3 py-2 text-t0"
                  />
                </label>
              ))}
              <label>
                <span className="stamp block opacity-resting">Incoterm</span>
                <select
                  value={rec.state.buyer.incoterm}
                  onChange={(e) => rec.setBuyer({ incoterm: e.target.value })}
                  className="mt-1 w-full border rule bg-surface px-3 py-2 text-t0"
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
                  <tr className="border-b rule-hard">
                    {['Código', 'Serie', 'Acabado', `Cant. (${BASIS_LABEL[basis]})`, 'Cajas', 'm²', 'kg', ''].map(
                      (h, i) => (
                        <th
                          key={h || i}
                          className={`stamp py-2 font-normal opacity-resting ${
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
                    <tr key={sku.sku_uid} className="border-b rule align-top">
                      <td className="mono py-2.5 text-t0">{sku.code}</td>
                      <td className="py-2.5 text-[13px] opacity-resting">{series.name_raw}</td>
                      <td className="py-2.5 text-[13px] opacity-resting">{finishLabel(sku)}</td>
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
                          className="mono w-20 border rule bg-surface px-2 py-1 text-right text-t0"
                        />
                      </td>
                      <td className="mono py-2.5 text-right text-t0">{fmtInt(t.cartons)}</td>
                      <td className="mono py-2.5 text-right text-t0">{fmtM2(t.m2)}</td>
                      <td className="mono py-2.5 text-right text-t0">{fmtKg(t.kg)}</td>
                      <td className="py-2.5 pl-3">
                        <StatusLamp status={series.status} />
                      </td>
                    </tr>
                  ))}
                  <tr className="border-t rule-hard">
                    <td className="py-3 text-t0 font-semibold" colSpan={4}>
                      TOTAL · {fmtInt(totals.skus)} referencias
                    </td>
                    <td className="mono py-3 text-right text-t0 font-semibold">
                      {fmtInt(totals.cartons)}
                    </td>
                    <td className="mono py-3 text-right text-t0 font-semibold">
                      {fmtM2(totals.m2)}
                    </td>
                    <td className="mono py-3 text-right text-t0 font-semibold">
                      {fmtKg(totals.kg)}
                    </td>
                    <td />
                  </tr>
                </tbody>
              </table>
            </div>

            <section className="mt-8">
              <h2 className="stamp opacity-resting">Vista previa del mensaje</h2>
              <pre className="mono mt-2 max-h-64 overflow-auto whitespace-pre-wrap border rule bg-surface-2 p-3 text-[12px]">
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
          <div className="border-t rule bg-surface px-4 py-4">
            <div className="mx-auto max-w-4xl">
              <div className="flex gap-3">
                <a
                  href={whatsappHref(body)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 rounded-chrome bg-ink py-3.5 text-center text-t0 text-surface"
                >
                  WhatsApp
                </a>
                <a
                  href={mailtoHref(body)}
                  className="flex-1 rounded-chrome border border-ink py-3.5 text-center text-t0"
                >
                  Email
                </a>
              </div>
              <p className="mt-3 text-t0 opacity-resting">Respuesta en 24h hábiles.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
