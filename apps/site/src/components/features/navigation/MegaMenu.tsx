// src/components/features/navigation/MegaMenu.tsx
'use client'

import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import type { Category } from '@/types/database'
import { categoryHref } from '@/lib/category-href'

interface MegaMenuProps {
  categories: Category[]
  open: boolean
}

// TAILWIND CANNOT APPLY AN OPACITY MODIFIER TO AN ARBITRARY var() COLOUR
// (see SiteNav.tsx's INK_70 for the fuller version of this note) — `text-
// [color:var(--nav-ink)]/85` emits no rule at all. --nav-ink-2/-3 cover 56%
// and 48%; this is the one extra step (85%) this panel needed, spelled out
// explicitly so it actually compiles.
const INK_85 = 'text-[color:color-mix(in_srgb,var(--nav-ink)_85%,transparent)]'

// --------------------------------------------------------------------------
// Static subcategory data — not DB-driven for performance.
// Slugs must match the ?sub= query param convention in catalog pages.
//
// LISTED ONLY WHAT'S REAL. Verified against production Supabase 2026-08-31:
// several sub= slugs that used to appear here (Cosechadoras, Equipo de
// Labranza, Siembra y Trasplante, Protec. de Cultivos, Poscosecha under
// Maquinaria Agrícola; Volteos y Dumpers, Camiones Cisterna, Tractocamiones
// under Camiones; Montacargas, Compactadores, Generadores under Industrial)
// are registered subcategory rows with ZERO products behind them — clicking
// any of them landed on an empty result. Account owner flagged this
// directly ("options that don't really exist"). Cut rather than kept as
// aspirational placeholders. If real inventory lands in one of these later,
// re-add it then — a menu item earns its place by having something behind
// it, not by naming something the catalog might someday carry.
// Counts shown are a trust signal (root CLAUDE.md §1.5: numbers are brand
// assets, not hidden) — re-verify this query if the count drifts visibly
// from what a category page shows.
// --------------------------------------------------------------------------

interface SubItem {
  label: string
  sub?: string    // ?sub= query param — used with the column's categorySlug
  href?: string   // absolute override — used when item belongs to a different category
  count: number
}

interface MegaColumn {
  categorySlug: string
  heading: string
  items: SubItem[]
}

// Automóviles is deliberately NOT a column here — it has its own top-level
// nav link and its own lane (/automoviles: landing, segments, 11 brand
// pages). Keeping a second, older entry point into it here would be exactly
// the redundant-path problem this menu already had (two labels — "Motores"
// and "Motores JDM" — pointing at the same /repuestos destination before
// this rebuild). This menu is now honestly what it's labeled: Maquinaria.
const COLUMNS: MegaColumn[] = [
  {
    categorySlug: 'maquinaria-agricola',
    heading: 'Maquinaria Agrícola',
    // Every product in this category is a tractor today — one real
    // subcategory, not six. "Ver todo" and "Tractores" point at the same
    // 31 products; both stay because a buyer scanning for the word
    // "tractor" should find it named, not just implied by the column header.
    items: [{ label: 'Tractores', sub: 'tractores', count: 31 }],
  },
  {
    categorySlug: 'camiones',
    heading: 'Camiones',
    items: [
      { label: 'Camiones de Carga', sub: 'camiones-carga', count: 6 },
      { label: 'Camiones Especiales', sub: 'camiones-especiales', count: 3 },
    ],
  },
  {
    categorySlug: 'buses',
    heading: 'Buses ASIASTAR',
    items: [
      { label: 'Chasis', href: '/catalogo/buses?fuel=chasis', count: 12 },
      { label: 'Buses Diésel', href: '/catalogo/buses?fuel=diesel', count: 7 },
      { label: 'Buses Eléctricos', href: '/catalogo/buses?fuel=electrico', count: 5 },
      { label: 'Hidrógeno', href: '/catalogo/buses?fuel=hidrogeno', count: 5 },
    ],
  },
  {
    categorySlug: 'equipo-industrial',
    heading: 'Industrial',
    // The category's own 3 products carry no subcategory yet — Motores JDM
    // is the one real destination this column has today (its own page,
    // 14 products, not a filtered slice of Industrial's 3).
    items: [{ label: 'Motores JDM', href: '/repuestos', count: 3 }],
  },
]

// --------------------------------------------------------------------------
// Quick-access column — no category slug, standalone links
// --------------------------------------------------------------------------

interface QuickItem {
  label: string
  href: string
  highlight?: boolean
  prefix?: string
}

const QUICK_ITEMS: QuickItem[] = [
  {
    label: 'Solicitar cotización',
    href: '/cotizar',
    highlight: true,
    prefix: '→',
  },
  {
    label: 'Importación personalizada',
    href: '/mister',
    highlight: true,
    prefix: '★',
  },
  {
    label: 'Cómo importar',
    href: '/proceso',
    prefix: '→',
  },
  {
    label: 'Contacto técnico',
    href: '/contacto',
    prefix: '→',
  },
]

// --------------------------------------------------------------------------
// Helper: build href for a catalog item
// --------------------------------------------------------------------------
function buildHref(categorySlug: string, item: SubItem): string {
  if (item.href) return item.href
  const base = categoryHref(categorySlug)
  return item.sub ? `${base}?sub=${item.sub}` : base
}

// --------------------------------------------------------------------------
// Stagger variants — Fix #08
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

export function MegaMenu({ categories: _categories, open }: MegaMenuProps) {
  // _categories is accepted for prop-flow consistency (layout → SiteNav → MegaMenu)
  // but subcategory links are hardcoded above for performance.

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.28, ease: [0.25, 1, 0.5, 1] }}
          className="w-full border-t border-[var(--nav-rule)] bg-[var(--nav-ground)] shadow-card-hover"
          role="region"
          aria-label="Menú de maquinaria"
        >
          <div className="mx-auto grid max-w-7xl grid-cols-5 gap-0 px-12 py-12">
            {/* ---- Category columns ---- */}
            {COLUMNS.map((col) => (
              <div key={col.categorySlug} className="pr-10">
                {/* Column heading — quiet label, so the items (not the header) carry the weight */}
                <p className="mb-6 font-mono text-[11px] uppercase tracking-[0.18em] text-[color:var(--nav-ink-3)]">
                  {col.heading}
                </p>

                {/* Subcategory items — staggered entrance (Fix #08) */}
                <motion.ul
                  className="flex flex-col gap-4"
                  variants={columnContainerVariants}
                  initial="closed"
                  animate={open ? 'open' : 'closed'}
                >
                  {col.items.map((item) => (
                    <motion.li
                      key={item.sub ?? item.href ?? item.label}
                      variants={columnItemVariants}
                    >
                      <Link
                        href={buildHref(col.categorySlug, item)}
                        className={`group flex items-baseline justify-between gap-3 font-mono text-[15px] ${INK_85} transition-colors duration-150 hover:text-[color:var(--nav-ink)]`}
                      >
                        <span>{item.label}</span>
                        <span className="shrink-0 text-[11px] tabular-nums text-[color:var(--nav-ink-3)] transition-colors duration-150 group-hover:text-[color:var(--nav-ink-2)]">
                          {item.count}
                        </span>
                      </Link>
                    </motion.li>
                  ))}
                </motion.ul>

                {/* Ver todo — a real button, not a quiet afterthought */}
                <Link
                  href={categoryHref(col.categorySlug)}
                  className="mt-7 inline-flex items-center gap-2 border border-[var(--nav-rule-strong)] px-3 py-2 font-mono text-[11px] uppercase tracking-[0.10em] text-[color:var(--nav-ink-2)] transition-colors duration-150 hover:border-[var(--nav-ink)] hover:text-[color:var(--nav-ink)]"
                >
                  Ver todo
                  <span aria-hidden>→</span>
                </Link>
              </div>
            ))}

            {/* ---- Acceso rápido column ---- */}
            <div className="border-l border-[var(--nav-rule-strong)] pl-10">
              <p className="mb-6 font-mono text-[11px] uppercase tracking-[0.18em] text-[color:var(--nav-ink-3)]">
                Acceso rápido
              </p>

              <motion.ul
                className="flex flex-col gap-4"
                variants={columnContainerVariants}
                initial="closed"
                animate={open ? 'open' : 'closed'}
              >
                {QUICK_ITEMS.map((item) => (
                  <motion.li key={item.href} variants={columnItemVariants}>
                    <Link
                      href={item.href}
                      className={
                        item.highlight
                          ? 'block font-mono text-[15px] uppercase tracking-nav text-[color:var(--nav-ink)] transition-opacity duration-150 hover:opacity-70'
                          : `block font-mono text-[15px] ${INK_85} transition-colors duration-150 hover:text-[color:var(--nav-ink)]`
                      }
                    >
                      {item.prefix && (
                        <span className="mr-1.5 text-[color:var(--nav-ink-3)]">{item.prefix}</span>
                      )}
                      {item.label}
                    </Link>
                  </motion.li>
                ))}
              </motion.ul>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
