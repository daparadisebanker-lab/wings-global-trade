// src/components/features/catalog/CategoryShelfNav.tsx
// Category-local sticky subheader — the catalog port of BrandShelfNav
// (represented-brands shelf). Structure is identical to the brand shelf; the
// only differences are content (category icon + name) and that it carries the
// Wings GOLD progress line rather than a per-brand accent (site decision
// 2026-07-20: categories keep the family gold, no new hue).
//
// Hosts the subcategory horizontal-scroll nav — the "bottom navigation of
// subcategories" — as a single sticky identity bar under the Wings chrome.
// Filter params are preserved when switching subcategory (mirrors the server
// page's buildSubUrl, read client-side from the live query string).
'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { CategoryIcon } from '@/components/features/homepage/CategoryIcon'
import { cn } from '@/lib/utils'

interface ShelfSubcategory {
  id: string
  slug: string
  name_es: string
}

interface Props {
  category: { slug: string; name_es: string; iconKey: string | null }
  subcategories: ShelfSubcategory[]
  /** Product count shown as the shelf's right-edge label (like the brand code). */
  count: number
}

export function CategoryShelfNav({ category, subcategories, count }: Props) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const progressRef = useRef<HTMLDivElement>(null)

  const activeSub = searchParams.get('sub')

  useEffect(() => {
    // Same device as SiteNav's gold rule and BrandShelfNav's accent line:
    // drive the transform via ref — no re-render per scrolled pixel.
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

  /** Build a subcategory href that preserves every active filter param. */
  function buildSubUrl(subSlug: string | null): string {
    const params = new URLSearchParams(searchParams.toString())
    if (subSlug) params.set('sub', subSlug)
    else params.delete('sub')
    const qs = params.toString()
    return `/catalogo/${category.slug}${qs ? `?${qs}` : ''}`
  }

  return (
    <nav
      aria-label={`Secciones de ${category.name_es}`}
      // Sticks below the fixed site header (h-16 / md:h-18), never under it.
      className="sticky top-16 z-20 border-b border-[rgba(0,30,80,0.08)] bg-warm-white/95 backdrop-blur md:top-18"
    >
      {/* Wings-gold scroll-progress line — the category shelf's own pulse,
          on the top edge (matches BrandShelfNav's accent line placement). */}
      <div
        ref={progressRef}
        aria-hidden
        className="absolute left-0 top-0 z-10 h-[2px] w-full origin-left bg-gold"
        style={{ transform: 'scaleX(0)' }}
      />

      <div className="mx-auto flex max-w-6xl items-center gap-1 overflow-x-auto px-6 md:px-10">
        {/* Back to the gateway + category identity (icon + name) */}
        <Link
          href="/catalogo"
          className="mr-2 flex shrink-0 items-center gap-2 py-4 font-mono text-[11px] uppercase tracking-nav text-navy/45 transition-colors hover:text-navy"
        >
          <span aria-hidden>←</span>
          <span className="hidden sm:inline">Catálogo</span>
        </Link>

        <span className="mr-3 flex shrink-0 items-center gap-2 border-l border-[rgba(0,30,80,0.10)] py-4 pl-3">
          <CategoryIcon iconKey={category.iconKey} className="h-4 w-4 text-gold" />
          <span className="font-mono text-[11px] uppercase tracking-nav text-navy">
            {category.name_es}
          </span>
        </span>

        {/* Subcategory horizontal-scroll nav */}
        {subcategories.length > 0 && (
          <span className="flex items-center gap-0">
            <Link
              href={buildSubUrl(null)}
              aria-current={!activeSub ? 'page' : undefined}
              className={cn(
                'shrink-0 border-b-2 px-3 py-4 font-mono text-[11px] uppercase tracking-nav transition-colors',
                !activeSub
                  ? 'border-gold text-gold'
                  : 'border-transparent text-navy/45 hover:text-navy',
              )}
            >
              Todos
            </Link>
            {subcategories.map((sc) => {
              const active = activeSub === sc.slug
              return (
                <Link
                  key={sc.id}
                  href={buildSubUrl(sc.slug)}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'shrink-0 border-b-2 px-3 py-4 font-mono text-[11px] uppercase tracking-nav transition-colors',
                    active
                      ? 'border-gold text-gold'
                      : 'border-transparent text-navy/45 hover:text-navy',
                  )}
                >
                  {sc.name_es}
                </Link>
              )
            })}
          </span>
        )}

        {/* Right-edge count label — the category shelf's answer to the brand code */}
        <span className="ml-auto hidden shrink-0 py-4 pl-4 font-mono text-[11px] uppercase tracking-nav tabular-nums text-navy/40 md:block">
          {count} modelos
        </span>
      </div>
    </nav>
  )
}
