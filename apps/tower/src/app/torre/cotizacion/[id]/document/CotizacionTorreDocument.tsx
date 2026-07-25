// The Mister Torre cotización as a print-ready A4 document. PURE server render of
// the tested `CotizacionPrintModel` (lib/torre/print.ts) — no computation, no live
// data, no client JS. Honesty rides through: a non-approvable payload shows a
// banner and '—' landed/unit values; each scenario's confidence renders its label
// in the chosen language. Self-scoped hardcoded palette (document exemption).
import type { CotizacionPrintModel } from '@/lib/torre/print'
import { CONFIDENCE_LABEL } from '@/lib/torre/artifacts'
import type { Locale } from '@/lib/i18n'

function fmtDate(iso: string | null, locale: Locale): string | null {
  if (!iso) return null
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return null
  return new Intl.DateTimeFormat(locale === 'es' ? 'es-PE' : 'en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d)
}

export function CotizacionTorreDocument({ model, locale }: { model: CotizacionPrintModel; locale: Locale }) {
  const issued = fmtDate(model.issuedAt, locale)
  return (
    <article className="tcot" lang={locale}>
      <header className="tcot-head">
        <div>
          <div className="tcot-brand">{model.brand}</div>
          <div className="tcot-title">{model.title[locale]}</div>
        </div>
        <div className="tcot-ver">
          <div>v{model.version}</div>
          {issued ? <div>{issued}</div> : null}
        </div>
      </header>

      {/* Lifecycle honesty — nothing leaves the tower as a final document without
          human approval. Anything not APPROVED prints marked (draft or rejected). */}
      {model.status && model.status !== 'APPROVED' ? (
        <div className="tcot-banner">
          {model.status === 'REJECTED'
            ? locale === 'es'
              ? 'Rechazada — no es un documento válido.'
              : 'Rejected — not a valid document.'
            : locale === 'es'
              ? 'Borrador — pendiente de aprobación. No es un documento final.'
              : 'Draft — pending approval. Not a final document.'}
        </div>
      ) : null}

      {!model.approvable ? (
        <div className="tcot-banner">
          {locale === 'es'
            ? 'Borrador con verificaciones pendientes — no aprobable como documento final.'
            : 'Draft with pending checks — not approvable as a final document.'}
        </div>
      ) : null}

      <section className="tcot-section">
        <div className="tcot-meta">
          {model.meta.map((row) => (
            <div key={row.label.en} className="tcot-meta-row">
              <span className="tcot-meta-k">{row.label[locale]}</span>
              <span className="tcot-meta-v">{row.value}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="tcot-section">
        <div className="tcot-section-h">{model.product[locale]}</div>
        <div className="tcot-meta-v">{model.product.value}</div>
      </section>

      <section className="tcot-section">
        <table className="tcot-table">
          <thead>
            <tr>
              {model.scenarioHeader.map((h, i) => (
                <th key={h.en} className={i === 0 ? '' : 'tcot-num'}>
                  {h[locale]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {model.scenarios.map((s) => (
              <tr key={s.incoterm}>
                <td>{s.incoterm}</td>
                <td className="tcot-num">{s.landed}</td>
                <td className="tcot-num">{s.unit}</td>
                <td className="tcot-num">{CONFIDENCE_LABEL[s.confidence][locale]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {model.terms.length > 0 ? (
        <section className="tcot-section">
          <div className="tcot-section-h">{locale === 'es' ? 'Términos' : 'Terms'}</div>
          <ul className="tcot-list">
            {model.terms.map((term, i) => (
              <li key={i}>{term}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {model.legend.length > 0 ? (
        <section className="tcot-section">
          <div className="tcot-section-h">{locale === 'es' ? 'Confianza' : 'Confidence'}</div>
          <div className="tcot-legend">
            {model.legend.map((state) => (
              <span key={state}>{CONFIDENCE_LABEL[state][locale]}</span>
            ))}
          </div>
        </section>
      ) : null}

      <footer className="tcot-foot">
        {model.footnotes.map((f) => (
          <div key={f.en}>{f[locale]}</div>
        ))}
        {model.endorsement ? <div className="tcot-endorse">{model.endorsement[locale]}</div> : null}
      </footer>
    </article>
  )
}
