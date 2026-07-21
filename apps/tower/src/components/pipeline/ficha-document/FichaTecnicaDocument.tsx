// "Ficha técnica" renderer — pure presentational. Draws a FichaTecnicaDocument
// to the approved reference layout: header + product name, specifications table,
// destacados, the EXHIBITED logistics numbers (CBM / MOQ / HS / packing) as
// brand assets in tabular mono, optional dimensions strip, and the shared Wings
// footer. No data access, no math beyond the pure helpers in lib/quotation/ficha.
// Bilingual: ES primary, EN secondary. Styling scoped in ficha-document.css
// (the same self-contained light print surface as the Cotización document).
import { buildLogisticsExhibits, formatNumber, type FichaDocument } from '@/lib/quotation/ficha'
import './ficha-document.css'

function DimensionCell({ label, value }: { label: string; value: number | null }) {
  return (
    <div className="fdoc-dim">
      <span className="fdoc-dim-value">{value != null ? formatNumber(value) : '—'}</span>
      <span className="fdoc-dim-label">{label}</span>
    </div>
  )
}

export function FichaTecnicaDocument({ doc }: { doc: FichaDocument }) {
  const { issuer, logistics, dimensions } = doc
  const exhibits = buildLogisticsExhibits(logistics)

  return (
    <article className="fdoc">
      {/* Header */}
      <header className="fdoc-header">
        <div>
          <span className="fdoc-kicker">Ficha técnica · Technical data sheet</span>
          <h1 className="fdoc-title">{doc.nameEs}</h1>
          {doc.nameEn ? <p className="fdoc-subtitle">{doc.nameEn}</p> : null}
          <p className="fdoc-number" data-draft={doc.fichaNo ? 'false' : 'true'}>
            {doc.fichaNo ?? 'Borrador'}
            {doc.category ? <span className="fdoc-category"> · {doc.category}</span> : null}
          </p>
        </div>
        <div className="fdoc-brand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="fdoc-logo" src={issuer.logoSrc} alt={issuer.name} />
          <span className="fdoc-tagline">{issuer.tagline}</span>
        </div>
      </header>
      <div className="fdoc-rule" aria-hidden />

      {/* Specifications + destacados */}
      <div className="fdoc-grid">
        <section>
          <div className="fdoc-section-bar">
            Especificaciones<span className="fdoc-section-en"> · Specifications</span>
          </div>
          {doc.specs.length > 0 ? (
            <table className="fdoc-spec-table">
              <tbody>
                {doc.specs.map((row) => (
                  <tr key={row.label}>
                    <th scope="row">{row.label}</th>
                    <td className="fdoc-spec-value">{row.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="fdoc-empty">Sin especificaciones registradas.</p>
          )}
        </section>

        <section>
          <div className="fdoc-section-bar">
            Características destacadas<span className="fdoc-section-en"> · Highlights</span>
          </div>
          {doc.highlights.length > 0 ? (
            <ul className="fdoc-highlights">
              {doc.highlights.map((h, i) => (
                <li key={i}>
                  {h.title ? <span className="fdoc-highlight-title">{h.title}: </span> : null}
                  <span>{h.body}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="fdoc-empty">—</p>
          )}
        </section>
      </div>

      {/* Exhibited logistics numbers — the brand assets */}
      <div className="fdoc-section-bar">
        Datos logísticos<span className="fdoc-section-en"> · Logistics</span>
      </div>
      <table className="fdoc-exhibit-table">
        <tbody>
          {exhibits.map((row) => (
            <tr key={row.labelEn}>
              <th scope="row">
                {row.label}
                <span className="fdoc-exhibit-en"> · {row.labelEn}</span>
              </th>
              <td className="fdoc-exhibit-value">{row.value}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Dimensions strip */}
      {dimensions ? (
        <>
          <div className="fdoc-section-bar">
            Dimensiones (mm)<span className="fdoc-section-en"> · Dimensions (mm)</span>
          </div>
          <div className="fdoc-dims">
            <DimensionCell label="Largo · Length" value={dimensions.lengthMm} />
            <DimensionCell label="Ancho · Width" value={dimensions.widthMm} />
            <DimensionCell label="Alto · Height" value={dimensions.heightMm} />
          </div>
        </>
      ) : null}

      {/* Footer */}
      <footer className="fdoc-footer">
        <div>
          <div>Consultas?</div>
          <div>Email: {issuer.email}</div>
          <div>o llámanos a {issuer.whatsapp}</div>
        </div>
        <div className="fdoc-foot-right">
          <div>{issuer.address}</div>
          <div>{issuer.website}</div>
        </div>
      </footer>
    </article>
  )
}
