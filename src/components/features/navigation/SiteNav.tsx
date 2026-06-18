// src/components/features/navigation/SiteNav.tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { Category } from '@/types/database'
import { cn } from '@/lib/utils'
import { MegaMenu } from '@/components/features/navigation/MegaMenu'
import { MobileMenu } from '@/components/features/navigation/MobileMenu'
import { WhatsAppButton } from '@/components/features/shared/WhatsAppButton'

interface SiteNavProps {
  categories: Category[]
}

// Per ENRICHED_SPEC §3.2 — exact nav labels
const LINKS = [
  { href: '/', label: 'Inicio' },
  { href: '/mister', label: 'Mister' },
  { href: '/nosotros', label: 'Nosotros' },
]

export function SiteNav({ categories }: SiteNavProps) {
  const [scrolled, setScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [menuHovered, setMenuHovered] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)
  const pathname = usePathname()
  const prevY = useRef(0)

  useEffect(() => {
    const onScroll = () => {
      const curr = window.scrollY
      setScrolled(curr > 20)
      // Hide when scrolling down past 100px, reveal on scroll up or near top
      if (curr < 80) {
        setHidden(false)
      } else {
        setHidden(curr > prevY.current)
      }
      prevY.current = curr
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      setScrollProgress(docHeight > 0 ? curr / docHeight : 0)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Mister page has its own full-height layout; keep nav solid there.
  const forceSolid = pathname?.startsWith('/mister') || pathname?.startsWith('/catalogo')
  const solid = scrolled || forceSolid

  return (
    <>
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-50 transition-all duration-300',
          solid
            ? 'bg-[#000C1F]/95 backdrop-blur-md border-b border-warm-white/[0.07]'
            : 'bg-transparent',
          hidden && !menuOpen && '-translate-y-full',
        )}
        onMouseLeave={() => setMenuHovered(false)}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 md:h-18 md:px-10">
          <Link href="/" className="flex items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/wings-logo.svg"
              alt="Wings Global Trade"
              className="h-8 w-auto brightness-0 invert md:h-10"
            />
          </Link>

          <nav className="hidden items-center gap-8 lg:flex">
            {LINKS.slice(0, 1).map((l) => (
              <NavLink key={l.href} {...l} active={pathname === l.href} />
            ))}

            {/* Catálogo trigger — shows chevron + opens mega-menu on hover */}
            <div
              className="relative"
              onMouseEnter={() => setMenuHovered(true)}
            >
              <Link
                href="/catalogo"
                className={cn(
                  'flex items-center gap-1 font-mono text-[11px] uppercase tracking-nav text-warm-white/70 transition-colors hover:text-warm-white',
                  (pathname?.startsWith('/catalogo')) && 'text-warm-white after:absolute after:bottom-[-2px] after:left-0 after:w-full after:h-px after:bg-gold',
                )}
                onFocus={() => setMenuHovered(true)}
              >
                Catálogo
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
            <Link
              href="/contacto"
              className="font-mono text-[11px] uppercase tracking-nav text-warm-white/70 transition-colors duration-200 hover:text-warm-white"
            >
              Contacto
            </Link>
            {/* Per ENRICHED_SPEC §3.4 — WhatsApp CTA exact string */}
            <WhatsAppButton variant={solid ? 'gold' : 'green'} label="Consultar por WhatsApp" />
          </div>

          <button
            type="button"
            aria-label="Abrir menú"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
            className="relative z-50 flex h-10 w-10 items-center justify-center text-warm-white lg:hidden"
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
        <div className="hidden lg:block">
          <MegaMenu categories={categories} open={menuHovered} />
        </div>

        {/* Scroll progress indicator */}
        <div
          className="absolute bottom-0 left-0 h-px bg-gold transition-none"
          style={{ width: `${scrollProgress * 100}%` }}
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
        'font-mono text-[11px] uppercase tracking-nav text-warm-white/70 transition-colors duration-200 hover:text-warm-white relative',
        active && 'text-warm-white after:absolute after:bottom-[-2px] after:left-0 after:w-full after:h-px after:bg-gold',
      )}
    >
      {label}
    </Link>
  )
}
