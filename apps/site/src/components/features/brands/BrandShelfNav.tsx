// src/components/features/brands/BrandShelfNav.tsx
// Shelf-local section nav: About · Productos · Comprar en contenedor.
// Sits under the Wings chrome; themes via --rb-* tokens only.
// Carries the same scroll-progress line device as the site header's gold
// bottom rule — here in the brand accent, on the shelf nav's TOP edge:
// the brand space has its own pulse.
'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

interface Props {
  brand: { slug: string; name: string; code: string; isologo: string }
}

export function BrandShelfNav({ brand }: Props) {
  const pathname = usePathname()
  const progressRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Same pattern as SiteNav's gold rule: drive the transform via ref —
    // no re-render per scrolled pixel.
    const onScroll = () => {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const progress = docHeight > 0 ? window.scrollY / docHeight : 0
      if (progressRef.current) {
        progressRef.current.style.transform = `scaleX(${progress})`
      }
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [pathname])

  const base = `/marcas/${brand.slug}`
  const tabs = [
    { href: base, label: 'La marca' },
    { href: `${base}/productos`, label: 'Productos' },
    { href: `${base}/contenedor`, label: 'Comprar en contenedor' },
  ]

  return (
    <nav
      aria-label={`Secciones de ${brand.name}`}
      // Sticks below the fixed site header (h-16 / md:h-18), never under it.
      className="sticky top-16 z-20 border-b border-neutral-200 bg-white/95 backdrop-blur md:top-18"
    >
      {/* The header-height strip above the tabs: instead of an empty white
          mask, it is the brand's band — isologo centered — so when the site
          header auto-hides, the space reads unmistakably as Áladín's
          (Muaaz 2026-07-11). Sits under the fixed header when visible. */}
      <div className="absolute inset-x-0 -top-16 flex h-16 items-center justify-center bg-white md:-top-18 md:h-18">
        <Image src={brand.isologo} alt="" aria-hidden width={120} height={44} className="h-9 w-auto md:h-10" />
      </div>
      {/* Brand-accent scroll progress — the shelf's own pulse line */}
      <div
        ref={progressRef}
        aria-hidden
        className="absolute left-0 top-0 z-10 h-[2px] w-full origin-left bg-[var(--rb-accent)]"
        style={{ transform: 'scaleX(0)' }}
      />
      <div className="mx-auto flex max-w-6xl items-center gap-1 overflow-x-auto px-5 md:px-8">
        <Link
          href="/marcas"
          className="mr-3 shrink-0 py-4 font-mono text-[11px] uppercase tracking-widest-2 text-neutral-400 transition-colors hover:text-neutral-700"
        >
          ← Marcas
        </Link>
        {tabs.map((tab) => {
          const active = pathname === tab.href
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'shrink-0 border-b-2 px-4 py-4 text-label-md font-medium transition-colors',
                active
                  ? 'border-[var(--rb-accent)] text-[var(--rb-accent-ink)]'
                  : 'border-transparent text-neutral-500 hover:text-neutral-800',
              )}
            >
              {tab.label}
            </Link>
          )
        })}
        <span className="ml-auto hidden shrink-0 font-mono text-[11px] uppercase tracking-widest-2 text-neutral-400 md:block">
          {brand.code}
        </span>
      </div>
    </nav>
  )
}
