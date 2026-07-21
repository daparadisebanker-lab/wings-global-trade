// SUNAT cost cascade + margin blocks — pure presentational. Renders an
// ImportResult as the operator sees it in the reference workbook: the cost
// waterfall (CIF → Ad Valorem → ISC → IGV imp → percepción → landed → cash) and
// Módulo 7's three margin blocks. Money is tabular-mono; the negative
// caja margin is rendered in accounting parentheses (it is normally negative
// during the IGV recovery window — capital inmovilizado, not a loss).
import type { ImportResult } from '@/lib/costing/types'

function money(n: number): string {
  const s = Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  return n < 0 ? `(${s})` : s
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
        <h3 className="mb-2 font-mono text-label uppercase tracking-[0.1em] text-ink-secondary">
          Cascada de costos ({currency})
        </h3>
        {result.insurance > 0 ? (
          <Row label="Seguro" value={money(result.insurance)} bar={result.insurance / cascadeMax} />
        ) : null}
        <Row label="CIF" value={money(result.cif)} bar={result.cif / cascadeMax} />
        <Row label="Ad Valorem" value={money(result.adValorem)} bar={result.adValorem / cascadeMax} />
        <Row label="ISC" sub={pct(result.iscRate)} value={money(result.isc)} bar={result.isc / cascadeMax} />
        <Row label="IGV importación" value={money(result.igvImportacion)} bar={result.igvImportacion / cascadeMax} />
        <Row label="Percepción" value={money(result.percepcion)} bar={result.percepcion / cascadeMax} />
        <Row label="Gastos vinculados" value={money(result.gastosVinculados)} bar={result.gastosVinculados / cascadeMax} />
        <Row label="Costo puesto en almacén (landed)" value={money(result.landedCost)} emphasis bar={result.landedCost / cascadeMax} />
        <Row label="Desembolso de caja" value={money(result.cashOutlay)} emphasis bar={result.cashOutlay / cascadeMax} />
      </section>

      <section className="flex flex-col rounded-card border border-line bg-surface-1 p-4">
        <h3 className="mb-2 font-mono text-label uppercase tracking-[0.1em] text-ink-secondary">
          Precio y márgenes ({currency})
        </h3>
        <Row label="Precio de venta (ex-IGV)" value={money(result.salePrice)} />
        <Row label="IGV ventas" value={money(result.igvVentas)} />
        <Row label="Precio final" value={money(result.salePriceFinal)} emphasis />
        <div className="mt-3" />
        <Row label="Margen bruto" sub={pct(result.margenBrutoPct)} value={money(result.margenBruto)} emphasis />
        <Row label="Impuestos recuperables (USD)" value={money(result.impuestosRecuperablesUSD)} />
        <Row label="Impuestos recuperables (PEN)" value={money(result.impuestosRecuperablesPEN)} />
        <Row
          label="Margen neto de caja"
          sub={pct(result.margenNetoCajaPct)}
          value={money(result.margenNetoCaja)}
          emphasis
          negative={result.margenNetoCaja < 0}
        />
        {result.margenNetoCaja < 0 ? (
          <p className="mt-2 font-ui text-label text-ink-secondary">
            Negativo = capital inmovilizado durante la recuperación del IGV, no una pérdida.
          </p>
        ) : null}
      </section>
    </div>
  )
}
