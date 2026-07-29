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
import { LaneExit } from '@/pasillo/components/PasilloShell'
import { PASILLO_ROUTES } from '@/pasillo/lib/routes'
import { useMemo, useState } from 'react'
import { StatusLamp } from '@/pasillo/components/StatusLamp'
import { VolumeFooter } from '@/pasillo/components/VolumeFooter'
import { finishLabel, getSeries, getSku, seriesName } from '@/pasillo/lib/catalogue'
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
        <div className="pas-measure flex items-baseline justify-between gap-4">
          <div>
            <LaneExit />
            <h1 className="font-pas-display text-pas-t2 font-semibold tracking-pas-display">
              {rows.length} {rows.length === 1 ? 'referencia' : 'referencias'}
            </h1>
          </div>
          <Link href={PASILLO_ROUTES.muestrario} className="pas-stamp rounded-pas-chrome border border-pas-ink/25 px-4 py-2">
            Al muestrario
          </Link>
        </div>
      </header>

      <main className="pas-measure flex-1 px-4 py-pas-5">
        {rows.length === 0 ? (
          <p className="border pas-rule px-pas-6 py-pas-7 text-center text-pas-t1 opacity-pas-resting">
            Marca referencias en el muestrario y aparecerán aquí para cotizar.{' '}
            <Link href={PASILLO_ROUTES.muestrario} className="underline underline-offset-4">
              Ir al muestrario
            </Link>
          </p>
        ) : (
          <>
            {/* THE TABLE COMES FIRST.
                Six full-width contact fields ran ~900px on a phone, so the
                quantity inputs — the only reason this screen exists — began
                below the fold behind a sticky footer. The buyer arrives here
                having already chosen the references; the first thing they owe
                is a number, and the last is their own name. */}
            {/* A PHONE GETS CARDS, NOT A SIDEWAYS TABLE.
                min-w-[640px] on a 390px screen put the quantity input — the one
                control this screen exists for — entirely off the right edge,
                behind a "slide the table" hint. A buyer had to scroll right to
                type, then left to read what they had typed. Below sm each
                reference is a card: identity on top, the field under it, the
                derived figures beneath that, in the order they are decided. */}
            <ul className="sm:hidden">
              {rows.map(({ sku, series, totals: t }) => (
                <li key={sku.sku_uid} className="flex items-start gap-3 border-b pas-rule py-3">
                  {/* Identity left, the number right, on the same two lines.
                      Stacked they ran 215px per reference — a buyer with
                      twenty of them scrolled a screen and a half to type
                      twenty numbers. */}
                  <div className="min-w-0 flex-1">
                    <p className="pas-mono text-pas-t0">{sku.code}</p>
                    <p className="truncate text-pas-label opacity-pas-resting">
                      {seriesName(series)} · {finishLabel(sku)}
                    </p>
                    {series.status !== 'available' && (
                      <div className="mt-1">
                        <StatusLamp status={series.status} />
                      </div>
                    )}
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <input
                        type="number"
                        inputMode="decimal"
                        min={0}
                        step="0.01"
                        value={rec.state.qty[sku.sku_uid]?.value ?? ''}
                        placeholder="0"
                        aria-label={`Cantidad para ${sku.code} en ${BASIS_LABEL[basis]}`}
                        onChange={(e) =>
                          rec.setQty(
                            sku.sku_uid,
                            e.target.value === ''
                              ? null
                              : { value: Math.max(0, Number(e.target.value)), basis },
                          )
                        }
                        className="pas-mono h-11 w-24 border pas-rule bg-pas-surface px-2 text-right text-pas-t0"
                      />
                      {/* The unit sits on the field, so the label does not need
                          a line of its own. The input still carries the full
                          name for anyone not reading the layout. */}
                      <span aria-hidden className="pas-stamp w-8 text-left opacity-pas-resting">
                        {BASIS_LABEL[basis]}
                      </span>
                    </div>
                    {/* The consequence of the number, under the number. It is
                        cartons that get quoted, and cartons round up. */}
                    <p className="pas-mono mt-1 text-pas-micro opacity-pas-resting">
                      {t.cartons > 0
                        ? `${fmtInt(t.cartons)} cajas · ${fmtM2(t.m2)} m² · ${fmtKg(t.kg)} kg`
                        : 'sin cantidad'}
                    </p>
                  </div>
                </li>
              ))}
              <li className="flex flex-wrap items-baseline justify-between gap-x-4 border-t pas-rule-hard py-3">
                <span className="text-pas-t0 font-semibold">
                  TOTAL · {fmtInt(totals.skus)}{' '}
                  {totals.skus === 1 ? 'referencia con cantidad' : 'referencias con cantidad'}
                </span>
                <span className="pas-mono text-pas-t0 font-semibold">
                  {fmtInt(totals.cartons)} cajas · {fmtM2(totals.m2)} m² · {fmtKg(totals.kg)} kg
                </span>
              </li>
            </ul>

            <div className="hidden sm:block">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b pas-rule-hard">
                    {/* Acabado absorbs the slack (w-full on one cell of an
                        auto-layout table), so the four numeric columns group at
                        the right edge instead of floating mid-table with 200px of
                        ground on either side of them at 1280. Figures right,
                        identity left — the shape every buyer already reads a
                        quotation in. */}
                    {['Código', 'Serie', 'Acabado', `Cant. (${BASIS_LABEL[basis]})`, 'Cajas', 'm²', 'kg', ''].map(
                      (h, i) => (
                        <th
                          key={h || i}
                          className={`pas-stamp py-2 font-normal opacity-pas-resting ${
                            i >= 3 && i <= 6 ? 'text-right' : 'text-left'
                          } ${i === 2 ? 'w-full' : 'whitespace-nowrap'}`}
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
                      <td className="pas-mono py-2 text-pas-t0">{sku.code}</td>
                      <td className="py-2 text-pas-dense opacity-pas-resting">{seriesName(series)}</td>
                      <td className="py-2 text-pas-dense opacity-pas-resting">{finishLabel(sku)}</td>
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
                          // h-11 is the 44px touch floor (§4-bis), not a
                          // spacing step. This is the one control a buyer
                          // retypes a dozen times in a row; at 30px it was
                          // below the floor the rest of the aisle holds.
                          className="pas-mono h-11 w-24 border pas-rule bg-pas-surface px-2 text-right text-pas-t0"
                        />
                      </td>
                      <td className="pas-mono py-2 text-right text-pas-t0">{fmtInt(t.cartons)}</td>
                      <td className="pas-mono py-2 text-right text-pas-t0">{fmtM2(t.m2)}</td>
                      <td className="pas-mono py-2 text-right text-pas-t0">{fmtKg(t.kg)}</td>
                      <td className="py-2 pl-3">
                        <StatusLamp status={series.status} />
                      </td>
                    </tr>
                  ))}
                  <tr className="border-t pas-rule-hard">
                    <td className="py-3 text-pas-t0 font-semibold" colSpan={4}>
                      {/* Explicitly "con cantidad": the header counts SELECTED
                          references, this row counts QUANTIFIED ones, and two
                          different numbers under one label on one screen is how
                          a buyer stops trusting both. */}
                      TOTAL · {fmtInt(totals.skus)}{' '}
                      {totals.skus === 1 ? 'referencia con cantidad' : 'referencias con cantidad'}
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

            <section className="mt-pas-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
              <h2 className="pas-stamp col-span-full opacity-pas-resting">Para la cotización</h2>
              {(
                [
                  ['name', 'Nombre'],
                  ['company', 'Empresa'],
                  ['project', 'Proyecto'],
                  ['port', 'Puerto de destino'],
                  ['target', 'Fecha objetivo'],
                ] as const
              ).map(([key, label]) => (
                <label key={key} className={key === 'project' || key === 'port' ? 'col-span-2 sm:col-span-1' : undefined}>
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

            <section className="mt-pas-8">
              <h2 className="pas-stamp opacity-pas-resting">El mensaje, tal como saldrá</h2>
              <pre className="pas-mono mt-2 max-h-[var(--pas-preview-max)] overflow-auto whitespace-pre-wrap border pas-rule bg-pas-surface-2 p-3 text-pas-micro">
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
            <div className="pas-measure">
              {/* Capped, not stretched. Two 620px slabs at 1280 is the send bar
                  of a phone blown up; equal weight is about the PAIR being
                  identical, which a 448px pair satisfies exactly as well. */}
              <div className="flex max-w-md gap-3">
                {/* Equal weight is spec law (§4.12), not a preference: the
                    buyer's counterpart uses one or the other and the tool does
                    not get to nominate a favourite. Both filled, identically. */}
                <a
                  href={whatsappHref(body)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 rounded-pas-chrome border border-pas-ink bg-pas-ink py-3 text-center text-pas-t0 text-pas-surface"
                >
                  WhatsApp
                </a>
                <a
                  href={mailtoHref(body, rec.state.buyer.company)}
                  className="flex-1 rounded-pas-chrome border border-pas-ink bg-pas-ink py-3 text-center text-pas-t0 text-pas-surface"
                >
                  Email
                </a>
              </div>
              <p className="mt-3 text-pas-t0 opacity-pas-resting">Respuesta en un día útil.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
