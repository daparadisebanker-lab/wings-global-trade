import { t, type Locale } from '@/lib/i18n'
import type { DocumentListItem, DocumentKind } from '@/lib/actions/documents-logic'
import { DocumentUploader } from './DocumentUploader'
import { DocumentActions } from './DocumentActions'

// The Documents / Drive hub — a per-lane store for spec sheets, supplier docs,
// certificates and saved quotations. Responsive (cards on mobile, table on
// desktop). Mister will pull from this in Slice 3D.

const TAG = 'DOC · Documentos'
const TITLE = { es: 'Documentos', en: 'Documents' }

const KIND_LABEL: Record<DocumentKind, { es: string; en: string }> = {
  SPEC_SHEET: { es: 'Ficha técnica', en: 'Spec sheet' },
  QUOTATION: { es: 'Cotización', en: 'Quotation' },
  SUPPLIER_DOC: { es: 'Doc. proveedor', en: 'Supplier doc' },
  CERTIFICATE: { es: 'Certificado', en: 'Certificate' },
  DOCUMENT: { es: 'Documento', en: 'Document' },
}

function formatBytes(n: number | null): string {
  if (n === null) return '—'
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${Math.round(n / 1024)} KB`
  return `${(n / 1024 / 1024).toFixed(1)} MB`
}

function Cell({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-3 py-3 align-middle ${className}`}>{children}</td>
}

export function DocumentsWindow({ items, locale }: { items: DocumentListItem[]; locale: Locale }) {
  return (
    <div className="flex flex-col gap-6 p-6">
      <header className="flex flex-col gap-1">
        <span className="font-mono text-label uppercase tracking-[0.15em] text-lane-accent" data-numeric>
          {TAG}
        </span>
        <div className="flex items-baseline justify-between gap-4">
          <h1 className="text-h2 font-semibold">{t(TITLE, locale)}</h1>
          <span className="font-mono text-label text-ink-secondary" data-numeric>
            {items.length}
          </span>
        </div>
        <p className="max-w-prose text-body-sm text-ink-secondary">
          {t(
            {
              es: 'El drive de cada marca y lane: fichas técnicas, docs de proveedor, certificados y cotizaciones. Mister podrá consultarlos.',
              en: 'Each brand and lane’s drive: spec sheets, supplier docs, certificates and quotations. Mister will be able to read them.',
            },
            locale,
          )}
        </p>
        <div className="mt-2">
          <DocumentUploader locale={locale} />
        </div>
      </header>

      {items.length === 0 ? (
        <div className="rounded-card border border-hairline bg-surface-1 p-8 text-center text-body-sm text-ink-secondary">
          {t(
            { es: 'Todavía no hay documentos. Sube el primero.', en: 'No documents yet. Upload the first one.' },
            locale,
          )}
        </div>
      ) : (
        <>
          {/* Mobile: one card per document. */}
          <ul className="flex flex-col gap-3 md:hidden">
            {items.map((d) => (
              <li key={d.id} className="flex flex-col gap-2 rounded-card border border-hairline bg-surface-1 p-4">
                <div className="flex items-start justify-between gap-3">
                  <span className="truncate font-medium text-ink-primary">{d.title}</span>
                  <span className="shrink-0 font-mono text-label uppercase tracking-[0.08em] text-accent">
                    {t(KIND_LABEL[d.kind], locale)}
                  </span>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-label uppercase tracking-[0.08em] text-ink-secondary">
                  <span>{d.brandName ?? '—'}</span>
                  {d.laneSlug ? <span>{d.laneSlug}</span> : null}
                  <span data-numeric>{formatBytes(d.sizeBytes)}</span>
                  <span data-numeric>{d.createdAt.slice(0, 10)}</span>
                </div>
                <div className="border-t border-hairline pt-2">
                  <DocumentActions id={d.id} locale={locale} />
                </div>
              </li>
            ))}
          </ul>

          {/* Desktop: the table. */}
          <div className="hidden overflow-x-auto rounded-card border border-hairline md:block">
            <table className="w-full border-collapse text-body-sm">
              <thead>
                <tr className="border-b border-hairline text-left font-mono text-label uppercase tracking-[0.1em] text-ink-secondary">
                  <Cell>{t({ es: 'Título', en: 'Title' }, locale)}</Cell>
                  <Cell>{t({ es: 'Tipo', en: 'Kind' }, locale)}</Cell>
                  <Cell>{t({ es: 'Marca', en: 'Brand' }, locale)}</Cell>
                  <Cell>{t({ es: 'Lane', en: 'Lane' }, locale)}</Cell>
                  <Cell className="text-right">{t({ es: 'Tamaño', en: 'Size' }, locale)}</Cell>
                  <Cell className="text-right">{t({ es: 'Fecha', en: 'Date' }, locale)}</Cell>
                  <Cell className="text-right">{t({ es: 'Acciones', en: 'Actions' }, locale)}</Cell>
                </tr>
              </thead>
              <tbody>
                {items.map((d) => (
                  <tr key={d.id} className="border-b border-hairline last:border-0 hover:bg-surface-2">
                    <Cell className="font-medium text-ink-primary">{d.title}</Cell>
                    <Cell className="font-mono uppercase text-ink-secondary">{t(KIND_LABEL[d.kind], locale)}</Cell>
                    <Cell className="font-mono text-ink-secondary">{d.brandName ?? '—'}</Cell>
                    <Cell className="font-mono uppercase text-ink-secondary">{d.laneSlug ?? '—'}</Cell>
                    <Cell className="text-right font-mono tabular-nums text-ink-secondary" data-numeric>
                      {formatBytes(d.sizeBytes)}
                    </Cell>
                    <Cell className="text-right font-mono tabular-nums text-ink-secondary" data-numeric>
                      {d.createdAt.slice(0, 10)}
                    </Cell>
                    <Cell className="text-right">
                      <DocumentActions id={d.id} locale={locale} />
                    </Cell>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
