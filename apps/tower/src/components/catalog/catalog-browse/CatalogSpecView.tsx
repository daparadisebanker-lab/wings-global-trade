// CatalogSpecView — read-only product spec for the pure-rep browse. Server
// component (no interaction): it renders the fields a rep needs to check a
// listing — name, category, HS/MOQ/CBM exhibited as tabular mono, and the
// spec record — with a back link and zero edit chrome (no PublishBar, no
// version actions, no form). RLS already scoped the product to a PUBLISHED
// row the caller may read; this view simply presents it.
import Link from 'next/link'
import { DEFAULT_LOCALE, t } from '@/lib/i18n'
import type { ProductRow } from '@/lib/actions/catalog'

function renderSpecValue(value: unknown): string {
  if (value === null || value === undefined) return '—'
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return String(value)
  return JSON.stringify(value)
}

function DataCell({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 border-b border-line py-3">
      <span className="font-mono text-label uppercase tracking-[0.1em] text-ink-secondary">{label}</span>
      {children}
    </div>
  )
}

export function CatalogSpecView({ product }: { product: ProductRow }) {
  const specEntries = Object.entries(product.specs ?? {})

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-2">
        <Link
          href="/catalog/browse"
          className="font-mono text-label uppercase tracking-[0.1em] text-ink-secondary hover:text-ink-primary"
        >
          ← Volver al catálogo / Back to catalog
        </Link>
        <span className="font-mono text-label uppercase tracking-[0.15em] text-lane-accent" data-numeric>
          CAT · Ficha / Spec
        </span>
        <h1 className="font-display text-t3 text-ink-primary">{t(product.name, DEFAULT_LOCALE)}</h1>
        <span className="font-ui text-t0 text-ink-secondary">{t(product.name, 'en')}</span>
      </div>

      <div className="grid grid-cols-1 gap-x-8 sm:grid-cols-2 lg:grid-cols-3">
        <DataCell label="Categoría / Category">
          <span className="font-ui text-t0 text-ink-primary">{product.categoryPath.join(' / ') || '—'}</span>
        </DataCell>
        <DataCell label="Slug">
          <span data-numeric className="font-mono text-t0 text-ink-primary">
            {product.slug}
          </span>
        </DataCell>
        <DataCell label="HS Code">
          <span data-numeric className="font-mono text-t0 text-ink-primary">
            {product.hsCode ?? '—'}
          </span>
        </DataCell>
        <DataCell label="MOQ">
          <span data-numeric className="font-mono text-t0 text-ink-primary">
            {product.moq ?? '—'}
          </span>
        </DataCell>
        <DataCell label="CBM / unidad · per unit">
          <span data-numeric className="font-mono text-t0 text-ink-primary">
            {product.cbmPerUnit ?? '—'}
          </span>
        </DataCell>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="font-mono text-label uppercase tracking-[0.12em] text-ink-secondary">
          Especificaciones / Specifications
        </h2>
        {specEntries.length === 0 ? (
          <p className="font-ui text-t0 text-ink-secondary">
            Sin especificaciones registradas. / No specifications recorded.
          </p>
        ) : (
          <dl className="grid grid-cols-1 gap-x-8 sm:grid-cols-2">
            {specEntries.map(([key, value]) => (
              <div key={key} className="flex justify-between gap-4 border-b border-line py-2">
                <dt className="font-mono text-label uppercase tracking-[0.08em] text-ink-secondary">{key}</dt>
                <dd data-numeric className="text-right font-mono text-t0 text-ink-primary">
                  {renderSpecValue(value)}
                </dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </div>
  )
}
