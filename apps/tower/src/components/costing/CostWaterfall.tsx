// SUNAT cost cascade + margin blocks — pure presentational. Renders an
// ImportResult as the operator sees it in the reference workbook: the cost
// waterfall (CIF → Ad Valorem → ISC → IGV imp → percepción → landed → cash) and
// Módulo 7's three margin blocks. Money is tabular-mono; the negative
// caja margin is rendered in accounting parentheses (it is normally negative
// during the IGV recovery window — capital inmovilizado, not a loss).
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
}: {
  label: string
  value: string
  emphasis?: boolean
  negative?: boolean
  sub?: string
}) {
  return (
    <div
      className={`flex items-baseline justify-between gap-4 py-1.5 ${
        emphasis ? 'border-t border-line font-semibold text-ink-primary' : 'text-ink-secondary'
      }`}
    >
      <span className="font-ui text-t0">
        {label}
        {sub ? <span className="ml-2 font-mono text-label text-ink-secondary">{sub}</span> : null}
      </span>
      <span
        className={`font-mono text-t0 tabular-nums ${
          negative ? 'text-negative' : emphasis ? 'text-ink-primary' : 'text-ink-primary'
        }`}
        data-numeric
      >
        {value}
      </span>
    </div>
  )
}

export function CostWaterfall({ result, currency = 'USD' }: { result: ImportResult; currency?: string }) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <section className="flex flex-col rounded-card border border-line bg-surface-1 p-4">
        <h3 className="mb-2 font-mono text-label uppercase tracking-[0.1em] text-ink-secondary">
          Cascada de costos ({currency})
        </h3>
        {result.insurance > 0 ? <Row label="Seguro" value={money(result.insurance)} /> : null}
        <Row label="CIF" value={money(result.cif)} />
        <Row label="Ad Valorem" value={money(result.adValorem)} />
        <Row label="ISC" sub={pct(result.iscRate)} value={money(result.isc)} />
        <Row label="IGV importación" value={money(result.igvImportacion)} />
        <Row label="Percepción" value={money(result.percepcion)} />
        <Row label="Gastos vinculados" value={money(result.gastosVinculados)} />
        <Row label="Costo puesto en almacén (landed)" value={money(result.landedCost)} emphasis />
        <Row label="Desembolso de caja" value={money(result.cashOutlay)} emphasis />
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
