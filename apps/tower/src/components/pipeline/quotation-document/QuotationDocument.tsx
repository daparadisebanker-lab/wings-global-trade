// Official "Cotización" renderer — pure presentational. Draws a QuotationDocument
// exactly to the approved reference layout: header + bill-to, line-item table,
// subtotal/tax/total, commercial conditions, observations, close + footer. No
// data access, no money math (both happen server-side in lib/actions/quotation);
// this component only formats what it's handed. Styling is scoped in
// quotation-document.css (a light, print-first surface).
import { formatAmount, type QuotationDocument } from '@/lib/quotation/document'
import './quotation-document.css'

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso)
  if (!m) return iso
  return `${m[3]}/${m[2]}/${m[1]}`
}

function monedaLabel(currency: string): string {
  return currency === 'USD' ? 'USD Dólares' : currency
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="qdoc-meta-row">
      <span className="qdoc-meta-label">{label}</span>
      <span className="qdoc-meta-value">{value}</span>
    </div>
  )
}

export function QuotationDocument({ doc }: { doc: QuotationDocument }) {
  const { billTo, totals, terms, issuer } = doc
  const currencyTag = `(${doc.currency})`

  return (
    <article className="qdoc">
      {/* Header */}
      <header className="qdoc-header">
        <div>
          <h1 className="qdoc-title">Cotización</h1>
          <p className="qdoc-number" data-draft={doc.quoteNo ? 'false' : 'true'}>
            {doc.quoteNo ?? 'Pendiente de emisión'}
          </p>
        </div>
        <div className="qdoc-brand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="qdoc-logo" src={issuer.logoSrc} alt={issuer.name} />
          <span className="qdoc-tagline">{issuer.tagline}</span>
        </div>
      </header>
      <div className="qdoc-rule" aria-hidden />

      {/* Bill-to */}
      <section>
        <div className="qdoc-billto-lead">Señores:</div>
        <div className="qdoc-billto-company">{billTo.company || '—'}</div>
        <div className="qdoc-meta">
          <MetaRow label="RUC:" value={billTo.taxId || '—'} />
          <MetaRow label="FECHA:" value={formatDate(doc.issuedOn)} />
          <MetaRow label="ATENCIÓN:" value={billTo.attention || '—'} />
          <MetaRow label="VALIDEZ:" value={doc.validityLabel || terms.validityText || '—'} />
          <MetaRow label="CONTACTO:" value={billTo.contact || '—'} />
          <MetaRow label="MONEDA:" value={monedaLabel(doc.currency)} />
        </div>
      </section>

      <p className="qdoc-intro">
        Por medio de la presente, nos es grato presentar nuestra propuesta económica:
      </p>

      {/* Line items */}
      <table className="qdoc-table">
        <thead>
          <tr>
            <th className="qd-col-item">Ítem</th>
            <th className="qd-col-desc">Descripción</th>
            <th className="qd-col-qty">Cant.</th>
            <th>Precio unit. {currencyTag}</th>
            <th>Precio total {currencyTag}</th>
          </tr>
        </thead>
        <tbody>
          {doc.lines.map((line) => (
            <tr key={line.itemNo}>
              <td className="qd-item">{line.itemNo}</td>
              <td className="qd-desc">
                {line.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img className="qd-desc-img" src={line.imageUrl} alt="" />
                ) : (
                  <span className="qd-desc-placeholder" aria-hidden />
                )}
                <span className="qd-desc-caption">{line.description}</span>
              </td>
              <td className="qd-cell-num">{line.quantity}</td>
              <td className="qd-cell-num">{formatAmount(line.unitPriceMinor)}</td>
              <td className="qd-cell-num">{formatAmount(line.lineTotalMinor)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="qdoc-totals">
        <div className="qdoc-total-row">
          <span className="qd-total-label">Sub total</span>
          <span className="qd-total-value">{formatAmount(totals.subtotalMinor)}</span>
        </div>
        {totals.taxMinor > 0 ? (
          <div className="qdoc-total-row">
            <span className="qd-total-label">Impuestos ({totals.taxLabel})</span>
            <span className="qd-total-value">{formatAmount(totals.taxMinor)}</span>
          </div>
        ) : null}
        <div className="qdoc-total-row" data-emphasis="true">
          <span className="qd-total-label">Total</span>
          <span className="qd-total-value">{formatAmount(totals.totalMinor)}</span>
        </div>
      </div>

      {/* Commercial conditions */}
      <div className="qdoc-section-bar">Condiciones comerciales</div>
      <div className="qdoc-terms">
        {terms.paymentTerms ? (
          <>
            <span className="qdoc-term-label">Formas de pago:</span>
            <span>{terms.paymentTerms}</span>
          </>
        ) : null}
        {terms.deliveryTime ? (
          <>
            <span className="qdoc-term-label">Tiempos de entrega:</span>
            <span>{terms.deliveryTime}</span>
          </>
        ) : null}
        {terms.incoterm ? (
          <>
            <span className="qdoc-term-label">Incoterm:</span>
            <span>{terms.incoterm}</span>
          </>
        ) : null}
        {terms.warranty ? (
          <>
            <span className="qdoc-term-label">Garantía:</span>
            <span>{terms.warranty}</span>
          </>
        ) : null}
        {terms.validityText ? (
          <>
            <span className="qdoc-term-label">Validez de la cotización:</span>
            <span>{terms.validityText}</span>
          </>
        ) : null}
      </div>

      {/* Observations */}
      {doc.observations.length > 0 ? (
        <>
          <div className="qdoc-section-bar">Observaciones</div>
          <ul className="qdoc-observations">
            {doc.observations.map((o, i) => (
              <li key={i}>{o}</li>
            ))}
          </ul>
        </>
      ) : null}

      {/* Close */}
      <div className="qdoc-close">
        <div>Agradecemos tu preferencia,</div>
        <div className="qdoc-close-signoff">{issuer.name}</div>
      </div>

      {/* Footer */}
      <footer className="qdoc-footer">
        <div>
          <div>Consultas?</div>
          <div>Email: {issuer.email}</div>
          <div>o llámanos a {issuer.whatsapp}</div>
        </div>
        <div className="qd-foot-right">
          <div>{issuer.address}</div>
          <div>{issuer.website}</div>
        </div>
      </footer>
    </article>
  )
}
