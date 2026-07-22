// Proforma invoice renderer — pure presentational. Draws a ProformaDocument to
// the approved reference layout: header + dateline, exporter / importer parties,
// the line-item table, the IGV split, commercial conditions (with ports),
// banking, notes, and the shared Wings footer. No data access, no money math —
// totals arrive already computed server-side (lib/actions/proforma). Money is
// DISPLAY-formatted es-PE here (never re-computed from these strings). Styling
// scoped in proforma-document.css. Bilingual: ES primary, EN secondary.
import type { ProformaDocument } from '@/lib/quotation/proforma'
import './proforma-document.css'

/** Display only (es-PE grouping, no symbol — the column header carries (USD)).
 *  Never fed back into arithmetic; money math is integer minor units server-side. */
function formatEsPe(minor: number): string {
  return (minor / 100).toLocaleString('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso)
  if (!m) return iso
  return `${m[3]}-${m[2]}-${m[1]}`
}

function PartyBlock({
  heading,
  headingEn,
  party,
}: {
  heading: string
  headingEn: string
  party: import('@/lib/quotation/proforma').TradeParty
}) {
  return (
    <div className="pdoc-party">
      <div className="pdoc-party-head">
        {heading}
        <span className="pdoc-party-en"> · {headingEn}</span>
      </div>
      <div className="pdoc-party-name">{party.name || '—'}</div>
      <dl className="pdoc-party-meta">
        {party.taxId ? (
          <>
            <dt>RUC</dt>
            <dd>{party.taxId}</dd>
          </>
        ) : null}
        {party.address ? (
          <>
            <dt>Dirección</dt>
            <dd>{party.address}</dd>
          </>
        ) : null}
        {party.city ? (
          <>
            <dt>Ciudad</dt>
            <dd>{party.city}</dd>
          </>
        ) : null}
        {party.phone ? (
          <>
            <dt>Teléfono</dt>
            <dd>{party.phone}</dd>
          </>
        ) : null}
        {party.contact ? (
          <>
            <dt>Contacto</dt>
            <dd>{party.contact}</dd>
          </>
        ) : null}
        {party.email ? (
          <>
            <dt>Email</dt>
            <dd>{party.email}</dd>
          </>
        ) : null}
      </dl>
    </div>
  )
}

function TermRow({ label, labelEn, value }: { label: string; labelEn: string; value: string | null | undefined }) {
  if (!value) return null
  return (
    <>
      <span className="pdoc-term-label">
        {label}
        <span className="pdoc-term-en"> · {labelEn}</span>
      </span>
      <span>{value}</span>
    </>
  )
}

export function ProformaDocument({ doc }: { doc: ProformaDocument }) {
  const { totals, terms, banking, issuer } = doc
  const currencyTag = `(${doc.currency})`

  return (
    <article className="pdoc">
      {/* Header */}
      <header className="pdoc-header">
        <div>
          <span className="pdoc-kicker">Factura proforma · Proforma invoice</span>
          <h1 className="pdoc-title">Proforma</h1>
          <p className="pdoc-number" data-draft={doc.proformaNo ? 'false' : 'true'}>
            {doc.proformaNo ?? 'Pendiente de emisión'}
          </p>
        </div>
        <div className="pdoc-brand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="pdoc-logo" src={issuer.logoSrc} alt={issuer.name} />
          <span className="pdoc-tagline">{issuer.tagline}</span>
        </div>
      </header>
      <div className="pdoc-rule" aria-hidden />

      {/* Dateline */}
      <div className="pdoc-dateline">
        <span>
          {doc.issuedCity ?? 'Lima'}, {formatDate(doc.issuedOn)}
        </span>
        {doc.validityLabel ? <span>Validez: {doc.validityLabel}</span> : null}
        {doc.incoterm ? <span>Incoterm: {doc.incoterm}</span> : null}
        <span>Moneda: {doc.currency}</span>
      </div>

      {/* Parties */}
      <div className="pdoc-parties">
        <PartyBlock heading="Vendedor / Exportador" headingEn="Seller / Exporter" party={doc.exporter} />
        <PartyBlock heading="Comprador / Importador" headingEn="Buyer / Importer" party={doc.importer} />
      </div>

      {/* Line items */}
      <table className="pdoc-table">
        <thead>
          <tr>
            <th className="pd-col-item">Ítem</th>
            <th className="pd-col-desc">Descripción</th>
            <th className="pd-col-qty">Cant.</th>
            <th>Precio unit. {currencyTag}</th>
            <th>Precio total {currencyTag}</th>
          </tr>
        </thead>
        <tbody>
          {doc.lines.map((line) => (
            <tr key={line.itemNo}>
              <td className="pd-item">{line.itemNo}</td>
              <td className="pd-desc">{line.description}</td>
              <td className="pd-cell-num">{line.quantity}</td>
              <td className="pd-cell-num">{formatEsPe(line.unitPriceMinor)}</td>
              <td className="pd-cell-num">{formatEsPe(line.lineTotalMinor)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="pdoc-totals">
        <div className="pdoc-total-row">
          <span className="pd-total-label">Sub total</span>
          <span className="pd-total-value">{formatEsPe(totals.subtotalMinor)}</span>
        </div>
        {totals.taxMinor > 0 ? (
          <div className="pdoc-total-row">
            <span className="pd-total-label">Impuestos ({totals.taxLabel})</span>
            <span className="pd-total-value">{formatEsPe(totals.taxMinor)}</span>
          </div>
        ) : null}
        <div className="pdoc-total-row" data-emphasis="true">
          <span className="pd-total-label">Total</span>
          <span className="pd-total-value">{formatEsPe(totals.totalMinor)}</span>
        </div>
      </div>

      {/* Commercial conditions */}
      <div className="pdoc-section-bar">
        Condiciones comerciales<span className="pdoc-section-en"> · Commercial conditions</span>
      </div>
      <div className="pdoc-terms">
        <TermRow label="Puerto de origen" labelEn="Port of origin" value={terms.portOfOrigin} />
        <TermRow label="Puerto de destino" labelEn="Port of destination" value={terms.portOfDestination} />
        <TermRow label="Forma de pago" labelEn="Payment terms" value={terms.paymentTerms} />
        <TermRow label="Tiempo de entrega" labelEn="Delivery time" value={terms.deliveryTime} />
        <TermRow label="Vigencia de la oferta" labelEn="Offer validity" value={terms.validityText} />
        <TermRow label="Garantía" labelEn="Warranty" value={terms.warranty} />
      </div>

      {/* Banking */}
      <div className="pdoc-section-bar">
        Datos bancarios<span className="pdoc-section-en"> · Bank details</span>
      </div>
      <div className="pdoc-terms">
        <TermRow label="Banco" labelEn="Bank" value={banking.bank} />
        <TermRow label="Nombre" labelEn="Account name" value={banking.accountName} />
        <TermRow label="Cuenta USD" labelEn="USD account" value={banking.accountUsd} />
        <TermRow label="Código SWIFT" labelEn="SWIFT" value={banking.swift} />
        <TermRow label="CCI" labelEn="CCI" value={banking.cci} />
      </div>

      {/* Notes */}
      {doc.observations.length > 0 ? (
        <>
          <div className="pdoc-section-bar">
            Observaciones<span className="pdoc-section-en"> · Notes</span>
          </div>
          <ul className="pdoc-observations">
            {doc.observations.map((o, i) => (
              <li key={i}>{o}</li>
            ))}
          </ul>
        </>
      ) : null}

      {/* Close */}
      <div className="pdoc-close">
        <div>Atentamente,</div>
        <div className="pdoc-close-signoff">{issuer.name}</div>
      </div>

      {/* Issuing rep — "Atendido por / Issued by". Signature is a signed READ url
          rendered through <img> (never inline SVG); degrades to name + title. */}
      {doc.issuedBy ? (
        <div className="pdoc-issuedby">
          <div className="pdoc-issuedby-label">Atendido por · Issued by</div>
          {doc.issuedBy.signatureUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="pdoc-signature" src={doc.issuedBy.signatureUrl} alt="Firma" />
          ) : null}
          <div className="pdoc-issuedby-name">{doc.issuedBy.displayName}</div>
          {doc.issuedBy.title ? <div className="pdoc-issuedby-title">{doc.issuedBy.title}</div> : null}
        </div>
      ) : null}

      {/* Footer */}
      <footer className="pdoc-footer">
        <div>
          <div>Consultas?</div>
          <div>Email: {issuer.email}</div>
          <div>o llámanos a {issuer.whatsapp}</div>
        </div>
        <div className="pd-foot-right">
          <div>{issuer.address}</div>
          <div>{issuer.website}</div>
        </div>
      </footer>
    </article>
  )
}
