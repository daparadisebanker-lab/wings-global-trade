// src/components/features/automoviles/AutoLaneNav.tsx
//
// WGT/07's persistent in-lane navigation — one sticky bar for every
// automóviles page, contextually aware rather than stacking a second sticky
// header on top of it (the brand sub-page previously had its own separate
// sticky header; folded in here as a breadcrumb mode instead, so there's
// never more than one extra bar below the global SiteNav).
//
// Two modes, self-detected from the URL (no prop-drilling from the layout,
// which doesn't have easy access to the nested [oem] param anyway):
//   default   — lane root / segment / roster pages: segment links + Marcas
//               + Cotizar, everything in the lane's own ion-blue accent.
//   brand     — /automoviles/marcas/{oem} pages: breadcrumb (Automóviles /
//               Marcas / {brand}) in the BRAND's own --oem-accent, so the
//               curtain flood's color carries through into the chrome the
//               visitor keeps looking at while they scroll, not just the
//               arrival moment.
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { lane } from '@wings/liveries/automoviles/lane.config'
import { getOemBrand } from '@/lib/automoviles/oem-brands'

export function AutoLaneNav() {
  const pathname = usePathname()
  const oemMatch = pathname?.match(/^\/automoviles\/marcas\/([^/]+)$/)
  const brand = oemMatch ? getOemBrand(oemMatch[1]) : undefined

  return (
    <nav
      aria-label="Navegación de Automóviles"
      className="sticky top-16 z-20 border-b border-[color:var(--ink-decoration)] bg-[color:var(--surface-0)]/95 backdrop-blur md:top-18"
    >
      {/* Accent pulse — lane blue by default, brand accent on a brand page.
          Static (not scroll-driven): the curtain flood already carried the
          arrival moment; a second animated device here would be noise. */}
      <div
        aria-hidden
        className={cn('h-[2px] w-full', brand ? 'bg-[color:var(--oem-accent)]' : 'bg-[color:var(--accent-ink)]')}
      />

      <div className="mx-auto flex max-w-6xl items-center px-5 md:px-8">
        {brand ? (
          // Breadcrumb mode — three short segments, never overflows in
          // practice, but scrolls rather than wraps/clips if a very long
          // brand name ever pushes it past the viewport.
          <div className="flex items-center gap-2 overflow-x-auto py-3.5 font-mono text-[11px] uppercase tracking-widest-2">
            <Link href="/automoviles" className="shrink-0 text-[color:var(--ink-decoration)] transition-colors hover:text-[color:var(--ink-primary)]">
              Automóviles
            </Link>
            <span className="text-[color:var(--ink-decoration)]" aria-hidden>/</span>
            <Link href="/automoviles/marcas" className="shrink-0 text-[color:var(--ink-decoration)] transition-colors hover:text-[color:var(--ink-primary)]">
              Marcas
            </Link>
            <span className="text-[color:var(--ink-decoration)]" aria-hidden>/</span>
            <span className="shrink-0 text-[color:var(--oem-accent)]">{brand.name}</span>
          </div>
        ) : (
          <>
            {/* Scrollable zone only — the tab strip can outgrow the
                viewport (5 segments + Marcas) well before "Cotizar" should
                ever be at risk of clipping, so the CTA lives outside this
                container instead of being the item pushed off-screen. The
                right-edge fade signals there's more to scroll to; harmless
                dead space when everything already fits (desktop). */}
            <div className="relative min-w-0 flex-1 overflow-hidden">
              <div className="flex items-center gap-1 overflow-x-auto">
                <Link
                  href="/automoviles"
                  className="mr-2 shrink-0 py-3.5 font-mono text-[11px] uppercase tracking-widest-2 text-[color:var(--ink-primary)]"
                >
                  {lane.code}
                </Link>
                {lane.taxonomy.map((seg) => {
                  const href = `/automoviles/${seg.slug}`
                  const active = pathname === href
                  return (
                    <Link
                      key={seg.slug}
                      href={href}
                      aria-current={active ? 'page' : undefined}
                      className={cn(
                        'shrink-0 border-b-2 px-3 py-3.5 font-mono text-[11px] uppercase tracking-widest-2 transition-colors',
                        active
                          ? 'border-[color:var(--accent-ink)] text-[color:var(--accent-ink)]'
                          : 'border-transparent text-[color:var(--ink-secondary)] hover:text-[color:var(--ink-primary)]',
                      )}
                    >
                      {seg.name.es}
                    </Link>
                  )
                })}
                <Link
                  href="/automoviles/marcas"
                  aria-current={pathname?.startsWith('/automoviles/marcas') ? 'page' : undefined}
                  className={cn(
                    'shrink-0 border-b-2 px-3 py-3.5 font-mono text-[11px] uppercase tracking-widest-2 transition-colors',
                    pathname?.startsWith('/automoviles/marcas')
                      ? 'border-[color:var(--accent-ink)] text-[color:var(--accent-ink)]'
                      : 'border-transparent text-[color:var(--ink-secondary)] hover:text-[color:var(--ink-primary)]',
                  )}
                >
                  Marcas
                </Link>
              </div>
              <div
                aria-hidden
                className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-[color:var(--surface-0)] to-transparent"
              />
            </div>
            <Link
              href="/cotizar"
              className="ml-3 shrink-0 whitespace-nowrap py-3.5 pl-3 font-mono text-[11px] uppercase tracking-widest-2 text-[color:var(--accent-ink)]"
            >
              Cotizar →
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}
