// "Ficha técnica" renderer — pure presentational, mirrors the structure of
// TOWER's FichaTecnicaDocument (header · specs table · trims · logistics-
// style notice · footer). No data access, no math beyond what ficha.ts
// already computed. data-oem on the root lets --oem-accent (oem-canvas.css)
// resolve for the brand dot/rule, the same mechanism every other card in
// this lane already uses — not a parallel one.
import type { FichaDocument } from '@/lib/automoviles/ficha'
import { WINGS_PUBLIC_EMAIL, WINGS_PUBLIC_WHATSAPP, WINGS_TAGLINE } from '@/lib/constants'
import './ficha-document.css'

export function FichaAutomovilDocument({ doc }: { doc: FichaDocument }) {
  return (
    <article className="fdoc" data-oem={doc.brand?.slug}>
      <header className="fdoc-header">
        <div>
          <span className="fdoc-kicker">Ficha técnica · WGT/07 Automóviles</span>
          {doc.brand && (
            <div className="fdoc-brandline">
              <span className="fdoc-brand-dot" aria-hidden />
              <span className="fdoc-brand-name">{doc.brand.name}</span>
            </div>
          )}
          <h1 className="fdoc-title">{doc.nameEs}</h1>
          {doc.descriptionEs && <p className="fdoc-subtitle">{doc.descriptionEs}</p>}
          <p className="fdoc-number">
            {doc.reference}
            {doc.segmentLabel ? ` · ${doc.segmentLabel}` : ''}
          </p>
        </div>
        <div className="fdoc-logo-block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="fdoc-logo" src="/Wings-logo-imagotipo-color.svg" alt="Wings Global Trade" />
          <span className="fdoc-tagline">{WINGS_TAGLINE}</span>
        </div>
      </header>
      <div className="fdoc-rule" aria-hidden />

      <div className="fdoc-section-bar">Especificaciones</div>
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

      <div className="fdoc-section-bar">
        Versiones disponibles {doc.trims.length > 0 ? `(${doc.trims.length})` : ''}
      </div>
      {doc.trims.length > 0 ? (
        <div className="fdoc-trims">
          {doc.trims.map((trim) => (
            <span key={trim} className="fdoc-trim">
              {trim}
            </span>
          ))}
        </div>
      ) : (
        <p className="fdoc-empty">Sin versiones registradas.</p>
      )}

      {doc.sourceMarkets.length > 0 && (
        <>
          <div className="fdoc-section-bar">Origen</div>
          <p className="fdoc-empty">{doc.sourceMarkets.join(' · ')}</p>
        </>
      )}

      <div className="fdoc-notice">
        Ficha de referencia — especificación básica de catálogo. La
        configuración final, disponibilidad y condiciones se confirman con
        un asesor al cotizar. Este documento no exhibe precio.
      </div>

      <footer className="fdoc-footer">
        <div>
          <div>¿Consultas?</div>
          <div>{WINGS_PUBLIC_EMAIL}</div>
          <div>WhatsApp +{WINGS_PUBLIC_WHATSAPP}</div>
        </div>
        <div className="fdoc-foot-right">
          <div>Wings Global Trade</div>
          <div>wingsglobaltrade.com</div>
        </div>
      </footer>
    </article>
  )
}
