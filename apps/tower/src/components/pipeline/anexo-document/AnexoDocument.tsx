// Anexo (landed-cost annex) renderer — pure presentational, on the shared document
// grid (.doc-grid). Draws the approximate logistics costs to the port of
// destination, the proforma sale, and the client's landed cost. No data access, no
// money math — totals arrive computed (lib/quotation/anexo). Money is DISPLAY
// es-PE here; a null amount prints "No incluido", a flagged one carries the
// estimate cue. Scoped under .adoc. Language follows the entity locale.
import type { AnexoDocument } from '@/lib/quotation/anexo'
import '../document-grid.css'
import './anexo-document.css'

/** es-PE grouping, 2dp, no symbol (the column header carries the currency). */
function formatEsPe(minor: number): string {
  return (minor / 100).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso)
  return m ? `${m[3]}-${m[2]}-${m[1]}` : iso
}

export function AnexoDocument({ doc }: { doc: AnexoDocument }) {
  const { issuer } = doc
  const currencyTag = `(${doc.currency})`
  const routeLabel = [doc.route.origin, doc.route.destination].filter(Boolean).join(' → ')

  return (
    <article className="adoc doc-grid">
      {/* Header */}
      <header className="adoc-header">
        <div>
          <span className="adoc-kicker">
            {doc.anexoOf ? `Anexo a la proforma ${doc.anexoOf}` : 'Anexo a la proforma'}
          </span>
          <h1 className="adoc-title">Anexo</h1>
          <p className="adoc-number">Aproximación de costos logísticos</p>
        </div>
        <div className="adoc-brand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="adoc-logo" src={issuer.logoSrc} alt={issuer.name} />
          <span className="adoc-tagline">{issuer.tagline}</span>
        </div>
      </header>
      <div className="adoc-rule" aria-hidden />

      {/* Dateline */}
      <div className="adoc-dateline">
        <span>
          {doc.issuedCity}, {formatDate(doc.issuedOn)}
        </span>
        {routeLabel ? <span>Ruta: {routeLabel}</span> : null}
        {doc.cbmLabel ? <span>CBM total: {doc.cbmLabel}</span> : null}
        <span>Moneda: {doc.currency}</span>
      </div>

      {/* Cost table */}
      <div className="adoc-section-bar">Costos logísticos aproximados hasta el puerto de destino</div>
      <table className="adoc-table">
        <thead>
          <tr>
            <th className="ad-col-desc">Detalle</th>
            <th className="ad-col-monto">Monto {currencyTag}</th>
          </tr>
        </thead>
        <tbody>
          {doc.lines.map((line, i) => (
            <tr key={i}>
              <td className="ad-desc">
                {line.label}
                {line.flagged ? <span className="ad-flag"> · requiere verificación</span> : null}
              </td>
              {line.amountMinor === null ? (
                <td className="ad-muted">No incluido</td>
              ) : (
                <td className="ad-cell-num doc-money">{formatEsPe(line.amountMinor)}</td>
              )}
            </tr>
          ))}
          <tr className="ad-row-emph">
            <td className="ad-desc">Subtotal costos logísticos</td>
            <td className="ad-cell-num doc-money">{formatEsPe(doc.logisticsSubtotalMinor)}</td>
          </tr>
        </tbody>
      </table>

      {/* Totals */}
      <div className="adoc-totals">
        <div className="adoc-total-row">
          <span className="ad-total-label">Venta total a cliente (acuerdo proforma)</span>
          <span className="ad-total-value doc-money">{formatEsPe(doc.proformaSaleMinor)}</span>
        </div>
        <div className="adoc-total-row" data-emphasis="true">
          <span className="ad-total-label">
            Costo total hasta {doc.route.destination ?? 'destino'} para el cliente
          </span>
          <span className="ad-total-value doc-money">{formatEsPe(doc.grandTotalMinor)}</span>
        </div>
      </div>

      {/* Observations */}
      <div className="adoc-section-bar">Observaciones</div>
      <ul className="adoc-observations">
        {doc.observations.map((o, i) => (
          <li key={i}>{o}</li>
        ))}
      </ul>

      {/* Footer */}
      <footer className="adoc-footer">
        <div>
          <div>¿Consultas?</div>
          <div>Email: {issuer.email}</div>
          <div>Tel: {issuer.whatsapp}</div>
        </div>
        <div className="ad-foot-right">
          <div>{issuer.website}</div>
        </div>
      </footer>
    </article>
  )
}
