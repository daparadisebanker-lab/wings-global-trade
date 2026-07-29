'use client'

// src/components/features/navigation/MobileMenu.tsx
//
// THE DRAWER IS THE SITE'S NAVIGATION, not a page's. It is the one surface that
// spans machinery, Interiores, the represented brands and whatever opens next,
// and a buyer reaches for it precisely because they are not where they want to
// be. So it is achromatic and identical everywhere — see the --nav-* block in
// globals.css for why it no longer reads --chrome-*.
//
// TWO LEVELS, NOT NINE ROWS. The old drawer was a flat numbered list — Catálogo,
// Interiores, Motores, Marcas, Cotizar, Cómo importar, Mister IA, Nosotros,
// Contacto — then a chip rail of machinery categories underneath, unlabelled and
// belonging to exactly one of those nine. Everything sat at one level, so the
// list said nothing about how the site is actually shaped: two product worlds,
// and some pages about the company.
//
// Now: Categorías opens to the worlds. Maquinaria opens in place to its own
// categories, because it has several. Interiores goes straight there, because
// it has one catalogue and a step that leads nowhere is worse than no step.
// The structure is the information.
//
// Mister is gone from here. It has a dedicated launcher on every screen, and a
// menu row that duplicates a permanent button spends a line to say nothing.
// Cotizar is gone as a row too — it is the closing action, so it is the CTA.

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import type { Category } from '@/types/database'
import { WINGS_PUBLIC_EMAIL, WINGS_PUBLIC_WHATSAPP } from '@/lib/constants'
import { buildWhatsAppLink } from '@/lib/utils'
import { SearchBar } from '@/components/features/homepage/SearchBar'

interface MobileMenuProps {
  open: boolean
  onClose: () => void
  categories: Category[]
}

/** Pages about the company rather than about a product. */
const SECONDARY = [
  { href: '/proceso', label: 'Cómo importar' },
  { href: '/marcas', label: 'Marcas representadas' },
  { href: '/nosotros', label: 'Nosotros' },
  { href: '/contacto', label: 'Contacto' },
]

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number]

export function MobileMenu({ open, onClose, categories }: MobileMenuProps) {
  // Which world is expanded. Only one at a time — the drawer is a place to
  // decide, and two open trees on a 390px screen is a place to scroll.
  const [openWorld, setOpenWorld] = useState<string | null>(null)

  // A fresh open starts closed. Reopening the drawer into whatever tree was
  // expanded three pages ago is state the buyer did not ask us to keep.
  useEffect(() => {
    if (!open) setOpenWorld(null)
  }, [open])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.22 } }}
          transition={{ duration: 0.26 }}
          className="fixed inset-0 z-40 overflow-y-auto bg-[var(--nav-ground)] lg:hidden"
        >
          <div className="flex min-h-full flex-col px-6 pb-10 pt-24">
            <SearchBar
              onNavy
              mono
              placeholder="Buscar modelo, categoría o código HS"
              onNavigate={onClose}
            />

            {/* ── The worlds ─────────────────────────────────────────────── */}
            <p className="mt-10 font-mono text-[9px] uppercase tracking-[0.20em] text-[color:var(--nav-ink-3)]">
              Categorías
            </p>

            <nav aria-label="Categorías" className="mt-3">
              <World
                label="Maquinaria"
                note="Tractores, camiones, buses y equipo"
                expanded={openWorld === 'maquinaria'}
                onToggle={() =>
                  setOpenWorld((w) => (w === 'maquinaria' ? null : 'maquinaria'))
                }
              >
                {categories.map((c) => (
                  <Leaf
                    key={c.id}
                    href={`/catalogo/${c.slug}`}
                    label={c.name_es}
                    onClose={onClose}
                  />
                ))}
                <Leaf href="/catalogo" label="Todo el catálogo" onClose={onClose} />
                <Leaf href="/repuestos" label="Motores JDM" onClose={onClose} />
              </World>

              {/* One catalogue behind it, so it is a link and not a tree. A
                  disclosure that opens onto a single row is a wasted tap. */}
              <World
                label="Interiores"
                note="Azulejo cerámico · 236 referencias"
                href="/interiores"
                onClose={onClose}
              />
            </nav>

            {/* ── The company ────────────────────────────────────────────── */}
            <nav aria-label="Wings Global Trade" className="mt-10">
              <ul className="flex flex-col">
                {SECONDARY.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      onClick={onClose}
                      className="flex min-h-11 items-center border-b border-[color:var(--nav-rule)] py-3
                                 font-body text-[15px] text-[color:var(--nav-ink-2)]
                                 transition-colors duration-150 hover:text-[color:var(--nav-ink)]"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {/* ── The close ──────────────────────────────────────────────── */}
            <div className="mt-auto pt-10">
              <Link
                href="/cotizar"
                onClick={onClose}
                className="flex min-h-11 w-full items-center justify-center gap-3 bg-[var(--nav-cta)] py-4
                           font-mono text-[11px] uppercase tracking-[0.14em] text-[color:var(--nav-cta-ink)]
                           transition-opacity duration-150 hover:opacity-90"
              >
                Solicitar cotización
              </Link>
              <a
                href={buildWhatsAppLink(
                  WINGS_PUBLIC_WHATSAPP,
                  'Hola, me interesa importar a través de Wings Global Trade.',
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 flex min-h-11 w-full items-center justify-center gap-3
                           border border-[color:var(--nav-rule-strong)] py-4 font-mono text-[11px]
                           uppercase tracking-[0.14em] text-[color:var(--nav-ink)]
                           transition-colors duration-150 hover:border-[color:var(--nav-ink)]"
              >
                WhatsApp
              </a>

              <a
                href={`mailto:${WINGS_PUBLIC_EMAIL}`}
                className="mt-6 block font-mono text-[10px] text-[color:var(--nav-ink-3)]
                           transition-colors hover:text-[color:var(--nav-ink)]"
              >
                {WINGS_PUBLIC_EMAIL}
              </a>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/**
 * A product world. With `href` it is a link; with `children` it is a disclosure
 * that expands in place. Both render identically at rest, because to the buyer
 * they are the same kind of thing — the difference is only how much is behind.
 */
function World({
  label,
  note,
  href,
  onClose,
  expanded,
  onToggle,
  children,
}: {
  label: string
  note: string
  href?: string
  onClose?: () => void
  expanded?: boolean
  onToggle?: () => void
  children?: React.ReactNode
}) {
  const body = (
    <>
      <span className="min-w-0">
        <span className="block font-display text-[1.75rem] font-light leading-none tracking-[-0.02em] text-[color:var(--nav-ink)]">
          {label}
        </span>
        <span className="mt-2 block font-mono text-[10px] uppercase tracking-[0.12em] text-[color:var(--nav-ink-3)]">
          {note}
        </span>
      </span>
      <Chevron open={expanded} isLink={Boolean(href)} />
    </>
  )

  return (
    <div className="border-b border-[color:var(--nav-rule)]">
      {href ? (
        <Link
          href={href}
          onClick={onClose}
          className="flex min-h-11 items-center justify-between gap-4 py-5"
        >
          {body}
        </Link>
      ) : (
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={expanded}
          className="flex min-h-11 w-full items-center justify-between gap-4 py-5 text-left"
        >
          {body}
        </button>
      )}

      {/* height:auto is not animatable, and a fixed max-height either clips a
          longer category list or leaves the collapse coasting through empty
          space. Framer measures it. */}
      <AnimatePresence initial={false}>
        {expanded && children && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1, transition: { duration: 0.28, ease: EASE } }}
            exit={{ height: 0, opacity: 0, transition: { duration: 0.2, ease: EASE } }}
            className="overflow-hidden"
          >
            <ul className="pb-4 pl-4">{children}</ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/** A category inside an open world. Indented, quieter, and still a 44px row. */
function Leaf({
  href,
  label,
  onClose,
}: {
  href: string
  label: string
  onClose: () => void
}) {
  return (
    <li>
      <Link
        href={href}
        onClick={onClose}
        className="flex min-h-11 items-center border-l border-[color:var(--nav-rule)] py-2 pl-4
                   font-body text-[15px] text-[color:var(--nav-ink-2)]
                   transition-colors duration-150 hover:border-[color:var(--nav-ink)] hover:text-[color:var(--nav-ink)]"
      >
        {label}
      </Link>
    </li>
  )
}

/** → for a link, a rotating ⌄ for a disclosure. The shape says which it is. */
function Chevron({ open, isLink }: { open?: boolean; isLink: boolean }) {
  return (
    <svg
      viewBox="0 0 14 14"
      className={`h-3.5 w-3.5 shrink-0 text-[color:var(--nav-ink-3)] transition-transform duration-200 ${
        !isLink && open ? 'rotate-180' : ''
      }`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {isLink ? <path d="M2 7h10M8 3l4 4-4 4" /> : <path d="M3 5.5 L7 9.5 L11 5.5" />}
    </svg>
  )
}
