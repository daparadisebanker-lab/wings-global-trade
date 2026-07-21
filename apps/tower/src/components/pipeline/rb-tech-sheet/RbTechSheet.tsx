// RB technical spec-sheet renderer — pure presentational. Draws the
// techSheetSections (built in @wings/rb-core · buildTechSheetSections) as
// tabular-mono exhibit tables: the container/product numbers as brand assets
// (CLAUDE.md Directive 5 · Numbers are exhibited, not hidden). ALLOCATION only —
// slots / packing cascade / CBM / HS / GTIN. No data access, no math (the
// sections arrive fully built). Bilingual: ES primary, EN secondary. Styling
// scoped in rb-tech-sheet.css — a self-contained light print surface, the same
// approach as the Cotización / Ficha documents.
import type { TechSheetSection } from '@wings/rb-core'
import './rb-tech-sheet.css'

export interface RbTechSheetProps {
  /** Container/product identity for the sheet header. */
  productName: string
  brandName: string
  containerCode: string
  reference?: string | null
  sections: TechSheetSection[]
}

export function RbTechSheet({ productName, brandName, containerCode, reference, sections }: RbTechSheetProps) {
  return (
    <section className="rts">
      <div className="rts-head">
        <span className="rts-kicker">Ficha técnica del contenedor · Container technical data sheet</span>
        <h2 className="rts-title">{productName}</h2>
        <p className="rts-meta">
          {brandName} · {containerCode}
          {reference ? <span className="rts-ref"> · {reference}</span> : null}
        </p>
      </div>

      <div className="rts-grid">
        {sections.map((section) => (
          <div className="rts-section" key={section.titleEn}>
            <div className="rts-section-bar">
              {section.title}
              <span className="rts-section-en"> · {section.titleEn}</span>
            </div>
            <table className="rts-table">
              <tbody>
                {section.rows.map((row) => (
                  <tr key={row.labelEn}>
                    <th scope="row">
                      {row.label}
                      <span className="rts-row-en"> · {row.labelEn}</span>
                    </th>
                    <td className="rts-value">{row.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </section>
  )
}
