// src/components/features/navigation/MegaMenu.tsx
'use client'

import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import type { Category } from '@/types/database'

interface MegaMenuProps {
  categories: Category[]
  open: boolean
}

// --------------------------------------------------------------------------
// Static subcategory data — not DB-driven for performance.
// Slugs must match the ?sub= query param convention in catalog pages.
// --------------------------------------------------------------------------

interface SubItem {
  label: string
  sub?: string    // ?sub= query param — used with the column's categorySlug
  href?: string   // absolute override — used when item belongs to a different category
}

interface MegaColumn {
  categorySlug: string
  heading: string
  items: SubItem[]
}

const COLUMNS: MegaColumn[] = [
  {
    categorySlug: 'maquinaria-agricola',
    heading: 'Maquinaria Agrícola',
    items: [
      { label: 'Tractores', sub: 'tractores' },
      { label: 'Cosechadoras', sub: 'cosechadoras' },
      { label: 'Equipo de Labranza', sub: 'labranza' },
      { label: 'Siembra y Trasplante', sub: 'siembra' },
      { label: 'Protec. de Cultivos', sub: 'proteccion-cultivos' },
      { label: 'Poscosecha', sub: 'poscosecha' },
    ],
  },
  {
    categorySlug: 'camiones',
    heading: 'Camiones',
    items: [
      { label: 'Volteos y Dumpers', sub: 'volteos' },
      { label: 'Camiones de Carga', sub: 'camiones-carga' },
      { label: 'Camiones Cisterna', sub: 'camiones-cisterna' },
      { label: 'Camiones Especiales', sub: 'camiones-especiales' },
      { label: 'Tractocamiones', sub: 'tractocamiones' },
    ],
  },
  {
    categorySlug: 'buses',
    heading: 'Buses ASIASTAR',
    items: [
      { label: 'Buses Diésel', href: '/catalogo/buses?fuel=diesel' },
      { label: 'Buses Eléctricos', href: '/catalogo/buses?fuel=electrico' },
      { label: 'Hidrógeno', href: '/catalogo/buses?fuel=hidrogeno' },
      { label: 'Chasis', href: '/catalogo/buses?fuel=chasis' },
    ],
  },
  {
    categorySlug: 'equipo-industrial',
    heading: 'Industrial',
    items: [
      { label: 'Montacargas', sub: 'montacargas' },
      { label: 'Compactadores', sub: 'compactadores' },
      { label: 'Generadores', sub: 'generadores' },
      { label: 'Repuestos', href: '/catalogo/repuestos' },
    ],
  },
  {
    categorySlug: 'automoviles',
    heading: 'Automóviles',
    items: [
      { label: 'Changan', href: '/catalogo/automoviles?brand=Changan' },
      { label: 'Toyota', href: '/catalogo/automoviles?brand=Toyota' },
      { label: 'Hyundai', href: '/catalogo/automoviles?brand=Hyundai' },
      { label: 'Jetour', href: '/catalogo/automoviles?brand=Jetour' },
      { label: 'Híbridos', href: '/catalogo/automoviles?fuel=hibrido' },
    ],
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
  const base = `/catalogo/${categorySlug}`
  return item.sub ? `${base}?sub=${item.sub}` : base
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
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="w-full border-t border-[rgba(196,147,63,0.12)] bg-[#000C1F] shadow-card-hover"
          role="region"
          aria-label="Menú de catálogo"
        >
          <div className="mx-auto grid max-w-7xl grid-cols-6 gap-0 px-10 py-10">
            {/* ---- Three category columns ---- */}
            {COLUMNS.map((col) => (
              <div key={col.categorySlug} className="pr-8">
                {/* Column heading */}
                <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.15em] text-gold/40">
                  {col.heading}
                </p>

                {/* Subcategory items */}
                <ul className="flex flex-col gap-2">
                  {col.items.map((item) => (
                    <li key={item.sub ?? item.href ?? item.label}>
                      <Link
                        href={buildHref(col.categorySlug, item)}
                        className="block font-mono text-[11px] text-warm-white/70 transition-colors duration-150 hover:text-gold"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>

                {/* Ver todo link */}
                <Link
                  href={`/catalogo/${col.categorySlug}`}
                  className="mt-5 block font-mono text-[11px] text-gold/70 transition-colors duration-150 hover:text-gold"
                >
                  Ver todo →
                </Link>
              </div>
            ))}

            {/* ---- Acceso rápido column ---- */}
            <div className="border-l border-warm-white/[0.06] pl-8">
              <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.15em] text-gold/40">
                Acceso rápido
              </p>

              <ul className="flex flex-col gap-3">
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
                      {item.prefix && (
                        <span className="mr-1.5 text-gold/70">{item.prefix}</span>
                      )}
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
