// RB container quote renderer — pure presentational. Draws an
// RbContainerQuoteDocument (the ALLOCATION archetype — root CLAUDE.md §5-bis:
// container-only / by slot, never by unit) to a proforma-style layout: header +
// dateline, Wings (vendedor) / buyer (comprador) parties, the slot-allocation
// line table, the packing cascade exhibited as brand assets, the IGV split, the
// commercial conditions, and the shared Wings footer. No data access, no money
// math — totals arrive already computed server-side (lib/actions/rb-quotation);
// money is DISPLAY-formatted es-PE here and never re-computed from these strings.
// Wholesale only (Prime Directive 2): the unit is a slot, never a retail price;
// an un-priced quote reads as "Por cotizar", an RFQ posture, not a listing.
// Bilingual: ES primary, EN secondary. Styling scoped in rb-container-quote.css.
import type { RbContainerQuoteDocument as RbDoc } from '@/lib/quotation/rb-container'
import './rb-container-quote.css'

/** Display only (es-PE grouping, no symbol — the column header carries the code).
 *  Never fed back into arithmetic; money math is integer minor units server-side. */
function formatEsPe(minor: number): string {
  return (minor / 100).toLocaleString('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

/** es-PE grouped integer for slot / cascade counts (a brand asset, tabular mono). */
function formatInt(n: number): string {
  return n.toLocaleString('es-PE', { maximumFractionDigits: 0 })
}

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso)
  if (!m) return iso
  return `${m[3]}-${m[2]}-${m[1]}`
}

const PENDING = 'Por cotizar'

function TermRow({ label, labelEn, value }: { label: string; labelEn: string; value: string | null | undefined }) {
  if (!value) return null
  return (
    <>
      <span className="rbq-term-label">
        {label}
        <span className="rbq-term-en"> · {labelEn}</span>
      </span>
      <span>{value}</span>
    </>
  )
}

export function RbContainerQuoteDocument({ doc }: { doc: RbDoc }) {
  const { issuer, totals, terms, packing, billTo } = doc
  const currencyTag = `(${doc.currency})`

  return (
    <article className="rbq">
      {/* Header */}
      <header className="rbq-header">
        <div>
          <span className="rbq-kicker">Cotización de contenedor · Container quotation</span>
          <h1 className="rbq-title">{doc.brandName}</h1>
          <p className="rbq-subtitle">
            Contenedor {doc.containerKind} · {doc.containerCode}
          </p>
          <p className="rbq-number" data-draft={doc.quoteRef ? 'false' : 'true'}>
            {doc.quoteRef ?? 'Borrador'}
          </p>
        </div>
        <div className="rbq-brand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="rbq-logo" src={issuer.logoSrc} alt={issuer.name} />
          <span className="rbq-tagline">{issuer.tagline}</span>
        </div>
      </header>
      <div className="rbq-rule" aria-hidden />

      {/* Dateline */}
      <div className="rbq-dateline">
        <span>
          {doc.issuedCity ?? 'Lima'}, {formatDate(doc.issuedOn)}
        </span>
        {doc.validityLabel ? <span>Validez: {doc.validityLabel}</span> : null}
        {doc.incoterm ? <span>Incoterm: {doc.incoterm}</span> : null}
        <span>Moneda: {doc.currency}</span>
        {doc.phaseLabel ? <span>Fase: {doc.phaseLabel}</span> : null}
        {doc.routeLabel ? <span>Ruta: {doc.routeLabel}</span> : null}
      </div>

      {/* Parties */}
      <div className="rbq-parties">
        <div className="rbq-party">
          <div className="rbq-party-head">
            Vendedor<span className="rbq-party-en"> · Seller</span>
          </div>
          <div className="rbq-party-name">{issuer.name}</div>
          <dl className="rbq-party-meta">
            <dt>Marca representada</dt>
            <dd>{doc.brandName}</dd>
            <dt>Contacto</dt>
            <dd>{issuer.email}</dd>
            <dt>WhatsApp</dt>
            <dd>{issuer.whatsapp}</dd>
          </dl>
        </div>
        <div className="rbq-party">
          <div className="rbq-party-head">
            Comprador<span className="rbq-party-en"> · Buyer</span>
          </div>
          <div className="rbq-party-name">{billTo.company || '—'}</div>
          <dl className="rbq-party-meta">
            {billTo.taxId ? (
              <>
                <dt>RUC</dt>
                <dd>{billTo.taxId}</dd>
              </>
            ) : null}
            {billTo.attention ? (
              <>
                <dt>Atención</dt>
                <dd>{billTo.attention}</dd>
              </>
            ) : null}
            {billTo.contact ? (
              <>
                <dt>Contacto</dt>
                <dd>{billTo.contact}</dd>
              </>
            ) : null}
          </dl>
        </div>
      </div>

      {/* Slot availability strip */}
      <div className="rbq-avail">
        <span>
          Cupos disponibles · Available slots:{' '}
          <strong>
            {formatInt(doc.slotsAvailable)} / {formatInt(doc.slotsTotal)}
          </strong>
        </span>
      </div>

      {/* Allocation line(s) */}
      <table className="rbq-table">
        <thead>
          <tr>
            <th className="rbq-col-item">Ítem</th>
            <th className="rbq-col-desc">Descripción · Description</th>
            <th className="rbq-col-qty">Cupos</th>
            <th>Precio / cupo {currencyTag}</th>
            <th>Total {currencyTag}</th>
          </tr>
        </thead>
        <tbody>
          {doc.lines.map((line) => (
            <tr key={line.itemNo}>
              <td className="rbq-item">{line.itemNo}</td>
              <td className="rbq-desc">
                <div>{line.description}</div>
                <div className="rbq-desc-en">{line.descriptionEn}</div>
              </td>
              <td className="rbq-cell-num">{formatInt(line.slots)}</td>
              <td className="rbq-cell-num">
                {line.pricePerSlotMinor != null ? formatEsPe(line.pricePerSlotMinor) : PENDING}
              </td>
              <td className="rbq-cell-num">
                {line.lineTotalMinor != null ? formatEsPe(line.lineTotalMinor) : PENDING}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Packing cascade — exhibited (the ALLOCATION numbers as brand assets) */}
      <div className="rbq-section-bar">
        Desglose de la asignación<span className="rbq-section-en"> · Allocation breakdown</span>
      </div>
      <div className="rbq-cascade">
        <div className="rbq-cascade-cell">
          <span className="rbq-cascade-value">{formatInt(packing.slots)}</span>
          <span className="rbq-cascade-label">Cupos · Slots</span>
        </div>
        <div className="rbq-cascade-cell">
          <span className="rbq-cascade-value">{formatInt(packing.packages)}</span>
          <span className="rbq-cascade-label">Cajas · Packages</span>
        </div>
        <div className="rbq-cascade-cell">
          <span className="rbq-cascade-value">{formatInt(packing.packets)}</span>
          <span className="rbq-cascade-label">Empaques · Packets</span>
        </div>
        <div className="rbq-cascade-cell">
          <span className="rbq-cascade-value">{formatInt(packing.units)}</span>
          <span className="rbq-cascade-label">Unidades · Units</span>
        </div>
        <div className="rbq-cascade-cell">
          <span className="rbq-cascade-value">{formatInt(packing.kg)}</span>
          <span className="rbq-cascade-label">Kg</span>
        </div>
      </div>
      {packing.remainderUnits > 0 ? (
        <p className="rbq-remainder">
          Sobran {formatInt(packing.remainderUnits)} unidades de capacidad en el último cupo · {formatInt(packing.remainderUnits)}{' '}
          units of spare capacity in the last slot.
        </p>
      ) : null}

      {/* Totals — or the RFQ posture when un-priced */}
      {totals ? (
        <div className="rbq-totals">
          <div className="rbq-total-row">
            <span className="rbq-total-label">Sub total</span>
            <span className="rbq-total-value">{formatEsPe(totals.subtotalMinor)}</span>
          </div>
          {totals.taxMinor > 0 ? (
            <div className="rbq-total-row">
              <span className="rbq-total-label">Impuestos ({totals.taxLabel})</span>
              <span className="rbq-total-value">{formatEsPe(totals.taxMinor)}</span>
            </div>
          ) : null}
          <div className="rbq-total-row" data-emphasis="true">
            <span className="rbq-total-label">Total</span>
            <span className="rbq-total-value">{formatEsPe(totals.totalMinor)}</span>
          </div>
        </div>
      ) : (
        <p className="rbq-rfq-note">
          Precio por cupo a cotizar — solicita tu cotización de asignación al por mayor · Per-slot price to be quoted —
          request your wholesale allocation quote.
        </p>
      )}

      {/* Commercial conditions */}
      <div className="rbq-section-bar">
        Condiciones comerciales<span className="rbq-section-en"> · Commercial conditions</span>
      </div>
      <div className="rbq-terms">
        <TermRow label="Forma de pago" labelEn="Payment terms" value={terms.paymentTerms} />
        <TermRow label="Tiempo de entrega" labelEn="Delivery time" value={terms.deliveryTime} />
        <TermRow label="Incoterm" labelEn="Incoterm" value={terms.incoterm} />
        <TermRow label="Validez" labelEn="Validity" value={terms.validityText} />
      </div>

      {/* Notes */}
      {doc.observations.length > 0 ? (
        <>
          <div className="rbq-section-bar">
            Observaciones<span className="rbq-section-en"> · Notes</span>
          </div>
          <ul className="rbq-observations">
            {doc.observations.map((o, i) => (
              <li key={i}>{o}</li>
            ))}
          </ul>
        </>
      ) : null}

      {/* Close */}
      <div className="rbq-close">
        <div>Atentamente,</div>
        <div className="rbq-close-signoff">{issuer.name}</div>
      </div>

      {/* Footer */}
      <footer className="rbq-footer">
        <div>
          <div>Marca representada por Wings Global Trade · Represented by Wings Global Trade</div>
          <div>Email: {issuer.email}</div>
          <div>o llámanos a {issuer.whatsapp}</div>
        </div>
        <div className="rbq-foot-right">
          <div>{issuer.address}</div>
          <div>{issuer.website}</div>
        </div>
      </footer>
    </article>
  )
}
