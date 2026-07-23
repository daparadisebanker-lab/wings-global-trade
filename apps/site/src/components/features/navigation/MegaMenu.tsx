// src/components/features/navigation/MegaMenu.tsx
'use client'

import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import type { Category } from '@/types/database'
import { CategoryIcon } from '@/components/features/homepage/CategoryIcon'

interface MegaMenuProps {
  categories: Category[]
  /** Live subcategories grouped by category slug (from the DB, via layout). */
  subcategoriesByCategory: Record<string, { slug: string; name_es: string }[]>
  open: boolean
}

// --------------------------------------------------------------------------
// The category columns are DERIVED FROM THE LIVE CATEGORY LIST (roadmap #2).
// The previous version hardcoded five columns — including an "Automóviles"
// column whose links 404'd (no such category) and a "Buses" column whose slug
// could drift from the DB's `buses-y-transporte`. Deriving from `categories`
// makes a non-existent category structurally impossible and guarantees every
// live category (incl. Motocicletas / Repuestos) appears. Subcategory links
// come from the LIVE subcategories table (grouped by category slug in
// layout.tsx); a category with no subcategories simply shows its heading +
// "Ver todo". Every link targets a real category slug — never a 404.
// --------------------------------------------------------------------------

// The category grid wraps (auto-fit), so EVERY live category shows — no cap
// that could silently drop a real category (prod has 9, incl. Autos / UTV).
const CATEGORY_COLUMN_MIN = '150px'

// --------------------------------------------------------------------------
// Quick-access row — standalone links, all verified routes
// --------------------------------------------------------------------------

interface QuickItem {
  label: string
  href: string
  highlight?: boolean
  prefix?: string
}

const QUICK_ITEMS: QuickItem[] = [
  { label: 'Solicitar cotización', href: '/cotizar', highlight: true, prefix: '→' },
  { label: 'Importación personalizada', href: '/mister', highlight: true, prefix: '★' },
  { label: 'Cómo importar', href: '/proceso', prefix: '→' },
  { label: 'Contacto técnico', href: '/contacto', prefix: '→' },
]

// --------------------------------------------------------------------------
// Stagger variants
// --------------------------------------------------------------------------

const columnContainerVariants = {
  closed: {},
  open: { transition: { staggerChildren: 0.03, delayChildren: 0.12 } },
}

const columnItemVariants = {
  closed: { opacity: 0, y: 6 },
  open: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.2, ease: [0, 0, 0.2, 1] as [number, number, number, number] },
  },
}

// --------------------------------------------------------------------------
// Component
// --------------------------------------------------------------------------

export function MegaMenu({ categories, subcategoriesByCategory, open }: MegaMenuProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.28, ease: [0.25, 1, 0.5, 1] }}
          className="w-full border-t border-[rgba(196,147,63,0.12)] bg-[#000C1F] shadow-card-hover"
          role="region"
          aria-label="Menú de catálogo"
        >
          {/* Gateway link — hover and click on "Catálogo" resolve here */}
          <div className="mx-auto max-w-7xl px-10 pt-7">
            <Link
              href="/catalogo"
              className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-nav text-gold transition-colors hover:text-gold-hover"
            >
              Ver todo el catálogo
              <span aria-hidden>→</span>
            </Link>
          </div>

          {/* Category grid — wraps so every live category is shown */}
          <div
            className="mx-auto max-w-7xl gap-x-8 gap-y-8 px-10 pt-6"
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(auto-fit, minmax(${CATEGORY_COLUMN_MIN}, 1fr))`,
            }}
          >
            {categories.map((cat) => {
              const subs = subcategoriesByCategory[cat.slug] ?? []
              return (
                <div key={cat.id}>
                  {/* Column heading — category icon + name */}
                  <p className="mb-4 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.15em] text-gold/40">
                    <CategoryIcon iconKey={cat.icon_key} className="h-3.5 w-3.5 shrink-0 text-gold/50" />
                    <span className="truncate">{cat.name_es}</span>
                  </p>

                  {/* Subcategory items — staggered entrance */}
                  {subs.length > 0 && (
                    <motion.ul
                      className="flex flex-col gap-2"
                      variants={columnContainerVariants}
                      initial="closed"
                      animate={open ? 'open' : 'closed'}
                    >
                      {subs.map((item) => (
                        <motion.li key={item.slug} variants={columnItemVariants}>
                          <Link
                            href={`/catalogo/${cat.slug}?sub=${item.slug}`}
                            className="block font-mono text-[11px] text-warm-white/70 transition-colors duration-150 hover:text-gold"
                          >
                            {item.name_es}
                          </Link>
                        </motion.li>
                      ))}
                    </motion.ul>
                  )}

                  {/* Ver todo link */}
                  <Link
                    href={`/catalogo/${cat.slug}`}
                    className="mt-5 block font-mono text-[11px] text-gold/70 transition-colors duration-150 hover:text-gold"
                  >
                    Ver todo →
                  </Link>
                </div>
              )
            })}
          </div>

          {/* ---- Acceso rápido — full-width row below the category grid ---- */}
          <div className="mx-auto max-w-7xl px-10 pb-10 pt-8">
            <div className="border-t border-warm-white/[0.06] pt-6">
              <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.15em] text-gold/40">
                Acceso rápido
              </p>
              <ul className="flex flex-wrap gap-x-8 gap-y-3">
                {QUICK_ITEMS.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={
                        item.highlight
                          ? 'block font-mono text-[11px] uppercase tracking-nav text-gold transition-colors duration-150 hover:text-gold-hover'
                          : 'block font-mono text-[11px] text-warm-white/70 transition-colors duration-150 hover:text-gold'
                      }
                    >
                      {item.prefix && <span className="mr-1.5 text-gold/70">{item.prefix}</span>}
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
