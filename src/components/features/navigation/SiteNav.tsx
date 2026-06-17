// src/components/features/navigation/SiteNav.tsx
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { Category } from '@/types/database'
import { cn } from '@/lib/utils'
import { NavCategoryDropdown } from '@/components/features/navigation/NavCategoryDropdown'
import { MobileMenu } from '@/components/features/navigation/MobileMenu'
import { WhatsAppButton } from '@/components/features/shared/WhatsAppButton'

interface SiteNavProps {
  categories: Category[]
}

// Per ENRICHED_SPEC §3.2 — exact nav labels
const LINKS = [
  { href: '/', label: 'Inicio' },
  { href: '/accio', label: 'Motor Accio' },
  { href: '/nosotros', label: 'Nosotros' },
]

export function SiteNav({ categories }: SiteNavProps) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Accio page has its own full-height layout; keep nav solid there.
  const forceSolid = pathname?.startsWith('/accio') || pathname?.startsWith('/catalogo')
  const solid = scrolled || forceSolid

  return (
    <>
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-50 transition-colors duration-200',
          solid ? 'bg-navy/95 backdrop-blur-sm' : 'bg-transparent',
        )}
      >
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6 md:h-16 md:px-10">
          <Link href="/" className="font-display text-xl font-semibold text-warm-white">
            Wings<span className="text-gold"> Global Trade</span>
          </Link>

          <nav className="hidden items-center gap-8 lg:flex">
            {LINKS.slice(0, 1).map((l) => (
              <NavLink key={l.href} {...l} active={pathname === l.href} />
            ))}
            <NavCategoryDropdown categories={categories} />
            {LINKS.slice(1).map((l) => (
              <NavLink key={l.href} {...l} active={pathname === l.href} />
            ))}
          </nav>

          <div className="hidden items-center gap-4 lg:flex">
            <Link
              href="/contacto"
              className="font-body text-sm text-warm-white transition-colors hover:text-gold"
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
        'font-body text-sm text-warm-white transition-colors hover:text-gold',
        active && 'underline decoration-gold decoration-2 underline-offset-4',
      )}
    >
      {label}
    </Link>
  )
}
