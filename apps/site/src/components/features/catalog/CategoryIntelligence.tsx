// src/components/features/catalog/CategoryIntelligence.tsx
// The category "intelligent info" component — a branded intelligence strip that
// exhibits the category's purchase logic and hard numbers (root §1.5: "numbers
// are exhibited, not hidden"). Pure/server component.
//
// Mister law (apps/site/CLAUDE.md): NEVER an absolute price, availability, or
// lead time. Everything here is structural — model count, origin markets, free
// zone, subcategory count, and the category's negotiation register.

import { CategoryIcon } from '@/components/features/homepage/CategoryIcon'
import type { CategoryIdentity } from '@/lib/category-identity'

interface Stat {
  label: string
  value: string
}

interface Props {
  categoryName: string
  identity: CategoryIdentity
  /** Real, DB-derived numbers. */
  productCount: number
  subcategoryCount: number
  /** Source markets observed on the returned products (may be empty). */
  productMarkets: string
}

export function CategoryIntelligence({
  categoryName,
  identity,
  productCount,
  subcategoryCount,
  productMarkets,
}: Props) {
  const stats: Stat[] = [
    { label: 'Modelos', value: String(productCount) },
    { label: 'Origen', value: productMarkets || identity.markets },
    ...(subcategoryCount > 0
      ? [{ label: 'Subcategorías', value: String(subcategoryCount) }]
      : []),
    { label: 'Zona franca', value: identity.freeZone },
  ]

  return (
    <section
      aria-label={`Inteligencia de ${categoryName}`}
      className="relative overflow-hidden border border-[rgba(0,30,80,0.08)] bg-white"
    >
      {/* Category motif watermark — the branded signal, faint so numbers lead */}
      <CategoryIcon
        iconKey={identity.iconKey}
        className="pointer-events-none absolute -right-6 -top-6 h-40 w-40 text-navy/[0.04]"
      />

      <div className="relative z-[1] p-6 md:p-8">
        {/* Eyebrow + register statement */}
        <div className="mb-6 flex items-center gap-4">
          <span className="wings-rule" />
          <p className="font-mono text-[10px] uppercase tracking-widest-3 text-navy/35">
            Inteligencia de categoría
          </p>
        </div>

        <p className="max-w-2xl font-display text-xl font-light leading-snug text-navy">
          {identity.register}
        </p>

        {/* Hard-number strip — tabular mono, exhibited as brand assets */}
        <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="border-t border-[rgba(0,30,80,0.10)] pt-3">
              <dt className="font-mono text-[9px] uppercase tracking-widest-2 text-navy/40">
                {s.label}
              </dt>
              <dd className="mt-1 font-mono text-body-lg tabular-nums text-navy">{s.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
