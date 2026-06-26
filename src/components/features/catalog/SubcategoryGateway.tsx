// src/components/features/catalog/SubcategoryGateway.tsx
// Server component — renders icon cards for subcategories not yet in the DB.
// Each card routes to /mister?context=[pre-composed Spanish message] so Mister
// auto-sends it as the user's opening query and begins TPR collection.

import Link from 'next/link'
import { CategoryIcon } from '@/components/features/homepage/CategoryIcon'
import { SUBCATEGORY_CATALOG } from '@/lib/subcategory-catalog'

interface SubcategoryGatewayProps {
  categorySlug: string
  categoryName: string
  activeSubSlugs: string[]
  productCount: number
}

export function SubcategoryGateway({
  categorySlug,
  categoryName,
  activeSubSlugs,
  productCount,
}: SubcategoryGatewayProps) {
  const allEntries = SUBCATEGORY_CATALOG[categorySlug]
  if (!allEntries || allEntries.length === 0) return null

  const inactiveEntries = allEntries.filter(
    (entry) => !activeSubSlugs.includes(entry.slug),
  )
  if (inactiveEntries.length === 0) return null

  const hasCatalogAbove = productCount > 0

  return (
    <section
      aria-label={`Equipamiento de ${categoryName} en desarrollo`}
      className="mt-16 border-t border-[rgba(0,30,80,0.06)] pt-16"
    >
      {/* Section header */}
      <div className="mb-10">
        <div className="mb-6 flex items-center gap-4">
          <div className="wings-rule" />
          <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-navy/35">
            Próximamente
          </p>
        </div>

        <h2 className="font-display text-xl text-navy leading-tight">
          {hasCatalogAbove
            ? `Más ${categoryName.toLowerCase()} en camino.`
            : `Catálogo de ${categoryName.toLowerCase()} en desarrollo.`}
        </h2>

        <p className="mt-3 max-w-xl font-mono text-[10px] uppercase tracking-[0.12em] leading-relaxed text-navy/40">
          Consulta cualquier equipo directamente con Mister — cotización técnica y precio CIF en minutos, sin esperas.
        </p>
      </div>

      {/* Icon card grid */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {inactiveEntries.map((entry) => (
          <Link
            key={entry.slug}
            href={`/mister?context=${encodeURIComponent(entry.misterContext)}`}
            className="group flex flex-col items-center gap-3 border border-[rgba(0,30,80,0.09)] px-4 pb-5 pt-6 text-center transition-all duration-200 hover:border-navy hover:bg-navy"
          >
            <CategoryIcon
              iconKey={entry.iconKey}
              className="h-6 w-6 shrink-0 text-navy/40 transition-colors duration-200 group-hover:text-gold"
            />
            <span className="font-mono text-[10px] uppercase leading-snug tracking-[0.10em] text-navy/60 transition-colors duration-200 group-hover:text-warm-white">
              {entry.name_es}
            </span>
            <span className="flex items-center gap-1.5 font-mono text-[8px] uppercase tracking-[0.18em] text-gold/40 transition-colors duration-200 group-hover:text-gold/80">
              <span className="h-px w-2 bg-current shrink-0" aria-hidden />
              Consultar
            </span>
          </Link>
        ))}
      </div>

      {/* Explanatory footnote */}
      <p className="mt-5 font-mono text-[9px] uppercase tracking-[0.12em] text-navy/30">
        Mister te asistirá y recopilará los requisitos técnicos para iniciar tu importación.
      </p>
    </section>
  )
}
