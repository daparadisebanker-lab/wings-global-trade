'use client'

// SUNAT cost cascade + margin blocks. Renders an ImportResult as the operator
// sees it in the reference workbook: the cost waterfall (CIF → Ad Valorem →
// ISC → IGV imp → percepción → landed → cash) and Módulo 7's three margin
// blocks. Money is tabular-mono; the negative caja margin is rendered in
// accounting parentheses (it is normally negative during the IGV recovery
// window — capital inmovilizado, not a loss). The itemized cascade collapses
// behind a toggle — an operator adjusting margin wants the answer to "how
// much is this costing me, all in" always in view, not nine line items to
// scan past on every keystroke.
import { useState } from 'react'
import type { ImportResult } from '@/lib/costing/types'
import { formatAccounting } from '@/lib/money'

// Cost-cascade figures render without a currency symbol (currency is in the
// section header) using the shared accounting formatter — negatives in
// parentheses. en-US to preserve the reference-workbook grouping.
function money(n: number): string {
  return formatAccounting(n, 'en-US')
}
function pct(x: number): string {
  return `${(x * 100).toFixed(1)}%`
}

function Row({
  label,
  value,
  emphasis,
  negative,
  sub,
  bar,
}: {
  label: string
  value: string
  emphasis?: boolean
  negative?: boolean
  sub?: string
  /** 0–1 magnitude of this line against its section max; draws a proportion rule. */
  bar?: number
}) {
  return (
    <div
      className={`flex flex-col gap-1 py-1.5 ${
        emphasis ? 'border-t border-line font-semibold text-ink-primary' : 'text-ink-secondary'
      }`}
    >
      <div className="flex items-baseline justify-between gap-4">
        <span className="font-ui text-t0">
          {label}
          {sub ? <span className="ml-2 font-mono text-label text-ink-secondary">{sub}</span> : null}
        </span>
        <span
          className={`font-mono text-t0 tabular-nums ${negative ? 'text-negative' : 'text-ink-primary'}`}
          data-numeric
        >
          {value}
        </span>
      </div>
      {typeof bar === 'number' ? (
        <div className="h-[3px] w-full bg-surface-2" aria-hidden>
          <div
            className={emphasis ? 'h-full bg-gold' : 'h-full bg-lane-accent'}
            style={{ width: `${Math.max(0, Math.min(1, bar)) * 100}%` }}
          />
        </div>
      ) : null}
    </div>
  )
}

export function CostWaterfall({ result, currency = 'USD' }: { result: ImportResult; currency?: string }) {
  const [showDetail, setShowDetail] = useState(false)

  // Section max drives the proportion rules — every cost line reads against the
  // largest one (normally the landed cost), so the cascade is scannable as
  // magnitude, not just a column of numbers.
  const cascadeMax = Math.max(
    result.insurance,
    result.cif,
    result.adValorem,
    result.isc,
    result.igvImportacion,
    result.percepcion,
    result.gastosVinculados,
    result.landedCost,
    result.cashOutlay,
    1,
  )
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <section className="flex flex-col rounded-card border border-line bg-surface-1 p-4">
        <div className="mb-2 flex items-center justify-between gap-2">
          <h3 className="font-mono text-label uppercase tracking-[0.1em] text-ink-secondary">
            Cascada de costos ({currency})
          </h3>
          <button
            type="button"
            onClick={() => setShowDetail((v) => !v)}
            aria-expanded={showDetail}
            className="font-mono text-label uppercase tracking-[0.08em] text-ink-secondary hover:text-lane-accent"
          >
            {showDetail ? 'Ocultar detalle ↑' : 'Ver detalle ↓'}
          </button>
        </div>

        {/* Always visible — the unambiguous answer to "how much is this
            costing me, all in," independent of whether the itemized
            breakdown below is expanded. */}
        <div className="rounded-control border border-line bg-surface-2 p-3">
          <div className="flex items-baseline justify-between gap-4">
            <span className="font-ui text-t0 text-ink-primary">Costo total puesto en almacén</span>
            <span className="font-mono text-t2 tabular-nums text-ink-primary" data-numeric>
              {money(result.landedCost)}
            </span>
          </div>
          <div className="mt-1 flex items-baseline justify-between gap-4">
            <span className="font-mono text-label uppercase tracking-[0.08em] text-ink-secondary">
              Desembolso de caja al despacho
            </span>
            <span className="font-mono text-t0 tabular-nums text-ink-secondary" data-numeric>
              {money(result.cashOutlay)}
            </span>
          </div>
        </div>

        {showDetail ? (
          <div className="mt-3 flex flex-col">
            {result.insurance > 0 ? (
              <Row label="Seguro" value={money(result.insurance)} bar={result.insurance / cascadeMax} />
            ) : null}
            <Row label="CIF" value={money(result.cif)} bar={result.cif / cascadeMax} />
            <Row label="Ad Valorem" value={money(result.adValorem)} bar={result.adValorem / cascadeMax} />
            <Row label="ISC" sub={pct(result.iscRate)} value={money(result.isc)} bar={result.isc / cascadeMax} />
            <Row label="IGV importación" value={money(result.igvImportacion)} bar={result.igvImportacion / cascadeMax} />
            <Row label="Percepción" value={money(result.percepcion)} bar={result.percepcion / cascadeMax} />
            <Row
              label="Gastos vinculados"
              value={money(result.gastosVinculados)}
              bar={result.gastosVinculados / cascadeMax}
            />
          </div>
        ) : null}
      </section>

      <section className="flex flex-col rounded-card border border-line bg-surface-1 p-4">
        <h3 className="mb-2 font-mono text-label uppercase tracking-[0.1em] text-ink-secondary">
          Precio y márgenes ({currency})
        </h3>
        <Row label="Precio de venta (ex-IGV)" value={money(result.salePrice)} />
        <Row label="IGV ventas" value={money(result.igvVentas)} />
        <Row label="Precio final" value={money(result.salePriceFinal)} emphasis />

        {/* The unambiguous bottom line: what the operation actually earns once
            recoverable taxes are back. Rendered as its own callout — gold, never
            red — so it can't be mistaken for the cash-timing figure below it. */}
        <div className="mt-4 rounded-control border border-gold/40 bg-gold/10 p-3">
          <div className="flex items-baseline justify-between gap-4">
            <span className="font-ui text-t0 text-ink-primary">Ganancia real esperada</span>
            <span className="font-mono text-t2 tabular-nums text-ink-primary" data-numeric>
              {money(result.margenBruto)}
            </span>
          </div>
          <div className="mt-0.5 flex items-baseline justify-between gap-4">
            <span className="font-mono text-label uppercase tracking-[0.08em] text-ink-secondary">
              Margen bruto sobre venta
            </span>
            <span className="font-mono text-t0 tabular-nums text-ink-secondary" data-numeric>
              {pct(result.margenBrutoPct)}
            </span>
          </div>
          <p className="mt-2 font-ui text-label text-ink-secondary">
            Esta es la rentabilidad real de la operación, una vez recuperados el IGV y la percepción. Es la cifra
            que decide si el precio es correcto.
          </p>
        </div>

        {/* Cash-timing block, visually separated from the profit callout above so
            a negative caja figure never reads as a second, competing loss. */}
        <div className="mt-4 border-t border-line pt-3">
          <h4 className="mb-1 font-mono text-label uppercase tracking-[0.1em] text-ink-tertiary">
            Posición de caja al despacho (no es utilidad)
          </h4>
          <Row label="Impuestos recuperables (USD)" value={money(result.impuestosRecuperablesUSD)} />
          <Row label="Impuestos recuperables (PEN)" value={money(result.impuestosRecuperablesPEN)} />
          <Row label="Pago a cuenta IR (1.77%)" value={money(result.paCuentaRenta)} negative />
          <Row
            label="Caja disponible hoy"
            sub={pct(result.margenNetoCajaPct)}
            value={money(result.margenNetoCaja)}
          />
          <p className="mt-2 font-ui text-label text-ink-secondary">
            {result.margenNetoCaja < 0
              ? 'Negativo = capital inmovilizado mientras se recupera el IGV y la percepción, no una pérdida. La ganancia real es la cifra de arriba.'
              : 'Efectivo disponible antes de recuperar IGV y percepción. La ganancia real de la operación es la cifra de arriba.'}
          </p>
        </div>
      </section>
    </div>
  )
}
