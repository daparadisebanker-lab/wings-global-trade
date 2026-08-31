// src/components/features/navigation/SiteNav.tsx
'use client'

import { useEffect, useRef, useState, type MouseEvent as ReactMouseEvent } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import type { Category } from '@/types/database'
import { cn } from '@/lib/utils'
import { MegaMenu } from '@/components/features/navigation/MegaMenu'
import { MobileMenu } from '@/components/features/navigation/MobileMenu'
import { WhatsAppButton } from '@/components/features/shared/WhatsAppButton'
import { SearchBar } from '@/components/features/homepage/SearchBar'

interface SiteNavProps {
  categories: Category[]
}

// ACHROMATIC — same reasoning as the drawer (see the --nav-* block in
// globals.css). The header used to read --chrome-*, which meant it changed
// colour by lane: navy+gold on the house pages, asphalt+ion-blue on
// /automoviles, walnut on /interiores. That made the header page chrome, not
// site chrome — a buyer could not learn what "Wings" looks like from it,
// because it never looked like the same thing twice. Rebuilt (2026-08-31,
// account owner's direction) to the drawer's own black/white system: this is
// the base Wings identity, and it is the same on every route, lane or not.
const LINKS = [
  // Automóviles and Interiores are real lanes with their own destination —
  // each gets a direct top-level link, exactly like the drawer's "worlds".
  // Automóviles leads (site direction, 2026-08-23 — programs/automobiles/
  // SCOPE.md): the category with the strongest commercial traction.
  { href: '/automoviles', label: 'Automóviles' },
  { href: '/interiores',  label: 'Interiores' },
  { href: '/marcas',      label: 'Marcas' },
  { href: '/proceso',     label: 'Cómo importar' },
  { href: '/nosotros',    label: 'Nosotros' },
]

export function SiteNav({ categories }: SiteNavProps) {
  const [scrolled, setScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [menuHovered, setMenuHovered] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const pathname = usePathname()
  const prevY = useRef(0)
  const scrolledRef = useRef(false)
  const hiddenRef = useRef(false)
  const progressBarRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLElement>(null)
  const machineryTriggerRef = useRef<HTMLAnchorElement>(null)
  const searchTriggerRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const onScroll = () => {
      const curr = window.scrollY

      const nextScrolled = curr > 20
      if (nextScrolled !== scrolledRef.current) {
        scrolledRef.current = nextScrolled
        setScrolled(nextScrolled)
      }

      // Hide when scrolling down past 100px, reveal on scroll up or near top
      const nextHidden = curr < 80 ? false : curr > prevY.current
      if (nextHidden !== hiddenRef.current) {
        hiddenRef.current = nextHidden
        setHidden(nextHidden)
      }

      prevY.current = curr

      // Drive the scroll-progress bar directly via ref — avoids a re-render on every pixel.
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const progress = docHeight > 0 ? curr / docHeight : 0
      if (progressBarRef.current) {
        progressBarRef.current.style.transform = `scaleX(${progress})`
      }
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Escape closes whichever panel is open and returns focus to its trigger;
  // clicking outside the header closes either panel.
  useEffect(() => {
    if (!menuHovered && !searchOpen) return

    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== 'Escape') return
      if (menuHovered) {
        setMenuHovered(false)
        machineryTriggerRef.current?.focus()
      }
      if (searchOpen) {
        setSearchOpen(false)
        searchTriggerRef.current?.focus()
      }
    }

    function onPointerDown(e: MouseEvent) {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setMenuHovered(false)
        setSearchOpen(false)
      }
    }

    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('mousedown', onPointerDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('mousedown', onPointerDown)
    }
  }, [menuHovered, searchOpen])

  // Mister page is a fullscreen world takeover — nav would break the world boundary.
  if (pathname === '/mister') return null

  // Not about lane colour anymore (the header no longer has one) — about page
  // background LIGHTNESS. A transparent white-text header is illegible the
  // instant it sits over a light/white ground instead of a dark hero image,
  // so these routes force solid immediately rather than waiting for scroll.
  const forceSolid =
    pathname?.startsWith('/catalogo') ||
    pathname?.startsWith('/repuestos') ||
    pathname?.startsWith('/g/') ||
    pathname?.startsWith('/contenedor') ||
    pathname?.startsWith('/marcas') ||
    pathname?.startsWith('/interiores') ||
    pathname?.startsWith('/automoviles')
  const solid = scrolled || forceSolid

  return (
    <>
      <header
        ref={headerRef}
        className={cn(
          'fixed inset-x-0 top-0 z-50 transition-all duration-300',
          // With the drawer open the bar is part of the drawer, so it goes
          // transparent and lets the drawer's own ground show through —
          // both are --nav-ground now, so this used to matter more than it
          // does today, but two stacked opaque black surfaces is still one
          // surface too many.
          menuOpen
            ? 'bg-transparent'
            : solid
            ? 'bg-[var(--nav-ground)] border-b border-[var(--nav-rule)]'
            : 'bg-transparent',
          hidden && !menuOpen && '-translate-y-full',
        )}
        onMouseLeave={() => setMenuHovered(false)}
      >
        {/* Scrim behind the transparent nav — keeps white text legible over hero imagery */}
        {!solid && !menuOpen && (
          <div
            className="pointer-events-none absolute inset-x-0 top-0 z-0 h-32 bg-gradient-to-b from-black/60 to-transparent md:h-40"
            aria-hidden
          />
        )}

        <div className="relative z-10 mx-auto flex h-16 max-w-7xl items-center justify-between px-6 md:h-18 md:px-10">
          <Link href="/" className="flex items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/Wings-logo-imagotipo-color.svg"
              alt="Wings Global Trade"
              className="h-12 w-auto brightness-0 invert md:h-14"
            />
          </Link>

          <nav className="hidden items-center gap-8 lg:flex">
            {LINKS.slice(0, 1).map((l) => (
              <NavLink key={l.href} {...l} active={pathname === l.href} />
            ))}

            {/* Maquinaria trigger — hover-opens for mouse, click/Enter toggles for keyboard, Escape closes.
                Named for what it actually contains now that Automóviles has its own top-level link and
                lane: tractores, camiones, buses, industrial, repuestos — machinery, not "everything". */}
            <div
              className="relative"
              onMouseEnter={() => {
                setMenuHovered(true)
                setSearchOpen(false)
              }}
            >
              <Link
                ref={machineryTriggerRef}
                href="/catalogo"
                aria-haspopup="true"
                aria-expanded={menuHovered}
                aria-controls="maquinaria-mega-menu"
                onClick={(e: ReactMouseEvent) => {
                  e.preventDefault()
                  setSearchOpen(false)
                  setMenuHovered((o) => !o)
                }}
                className={cn(
                  'flex items-center gap-1 font-mono text-[11px] uppercase tracking-nav text-[color:var(--nav-ink-2)] transition-colors hover:text-[color:var(--nav-ink)]',
                  pathname?.startsWith('/catalogo') &&
                    'text-[color:var(--nav-ink)] after:absolute after:bottom-[-2px] after:left-0 after:w-full after:h-px after:bg-[var(--nav-ink)]',
                )}
              >
                Maquinaria
                {/* Chevron icon */}
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 10 10"
                  fill="none"
                  aria-hidden="true"
                  className={cn(
                    'transition-transform duration-200',
                    menuHovered && 'rotate-180',
                  )}
                >
                  <path
                    d="M2 3.5L5 6.5L8 3.5"
                    stroke="currentColor"
                    strokeWidth="1.25"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
            </div>

            {LINKS.slice(1).map((l) => (
              <NavLink key={l.href} {...l} active={pathname === l.href} />
            ))}
          </nav>

          <div className="hidden items-center gap-4 lg:flex">
            <button
              ref={searchTriggerRef}
              type="button"
              aria-label="Buscar"
              aria-haspopup="dialog"
              aria-expanded={searchOpen}
              aria-controls="site-search-panel"
              onClick={() => {
                setMenuHovered(false)
                setSearchOpen((o) => !o)
              }}
              className="flex h-8 w-8 items-center justify-center text-[color:var(--nav-ink-2)] transition-colors duration-200 hover:text-[color:var(--nav-ink)]"
            >
              <svg
                viewBox="0 0 20 20"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                aria-hidden
              >
                <circle cx="9" cy="9" r="6" />
                <path d="M14 14l4 4" strokeLinecap="round" />
              </svg>
            </button>
            <Link
              href="/contacto"
              className="font-mono text-[11px] uppercase tracking-nav text-[color:var(--nav-ink-2)] transition-colors duration-200 hover:text-[color:var(--nav-ink)]"
            >
              Contacto
            </Link>
            {/* The one solid-filled element in the bar — the primary action gets
                the weight, per root CLAUDE.md §1.2. Everything else is outline or text. */}
            <Link
              href="/cotizar"
              className="inline-flex items-center gap-2 bg-[var(--nav-cta)] px-4 py-2 font-mono text-[11px] uppercase tracking-nav text-[color:var(--nav-cta-ink)] transition-opacity duration-200 hover:opacity-85"
            >
              Cotizar
            </Link>
            <WhatsAppButton
              variant="mono"
              label="WhatsApp"
              message="Hola, estoy revisando el catálogo de Wings Global Trade y me gustaría más información."
            />
          </div>

          <button
            type="button"
            aria-label="Abrir menú"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
            className="relative z-50 flex h-11 w-11 items-center justify-center text-[color:var(--nav-ink)] lg:hidden"
          >
            <div className="flex flex-col gap-1.5">
              <span
                className={cn('h-0.5 w-6 bg-current transition-transform', menuOpen && 'translate-y-2 rotate-45')}
              />
              <span className={cn('h-0.5 w-6 bg-current transition-opacity', menuOpen && 'opacity-0')} />
              <span
                className={cn('h-0.5 w-6 bg-current transition-transform', menuOpen && '-translate-y-2 -rotate-45')}
              />
            </div>
          </button>
        </div>

        {/* Mega-menu panel — sits inside <header> so mouse enter/leave is unified */}
        <div id="maquinaria-mega-menu" className="relative z-10 hidden lg:block">
          <MegaMenu categories={categories} open={menuHovered} />
        </div>

        {/* Search panel — desktop overlay, reuses SearchBar so submit routes through detectSearchIntent */}
        <div className="relative z-10 hidden lg:block">
          <AnimatePresence>
            {searchOpen && (
              <motion.div
                id="site-search-panel"
                role="search"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2, ease: [0.25, 1, 0.5, 1] }}
                className="border-t border-[var(--nav-rule)] bg-[var(--nav-ground)] px-10 py-6 shadow-card-hover"
              >
                <div className="mx-auto max-w-xl">
                  <SearchBar
                    autoFocus
                    onNavy
                    placeholder="Buscar modelo, categoría o código HS"
                    onNavigate={() => setSearchOpen(false)}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Scroll progress indicator — transform-driven, updated via ref (no re-render per pixel) */}
        <div
          ref={progressBarRef}
          className="absolute bottom-0 left-0 z-10 h-px w-full origin-left bg-[var(--nav-ink)]"
          style={{ transform: 'scaleX(0)' }}
          aria-hidden
        />
      </header>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} categories={categories} />
    </>
  )
}

function NavLink({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={cn(
        'font-mono text-[11px] uppercase tracking-nav text-[color:var(--nav-ink-2)] transition-colors duration-200 hover:text-[color:var(--nav-ink)] relative',
        active && 'text-[color:var(--nav-ink)] after:absolute after:bottom-[-2px] after:left-0 after:w-full after:h-px after:bg-[var(--nav-ink)]',
      )}
    >
      {label}
    </Link>
  )
}
