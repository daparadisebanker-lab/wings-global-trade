'use client'

// The chrome gate.
//
// Every route on this site gets SiteNav, Footer, CompareBar, MultiInquiryPanel,
// the Mister launcher, Lenis smooth scroll and the page-transition fade. Exactly
// one subtree must not: the Azulejos aisle (/interiores/azulejos), which is a
// full-viewport sourcing tool rather than a page.
//
// Why a client gate instead of parallel root layouts: removing chrome the App
// Router way means two root layouts, which means relocating every existing route
// into a (site) group — ~70 routes moved to suppress a header on four. The repo
// has already made this exact call once (DECISIONS.md: "Legacy chrome gated, not
// removed"), and this follows it.
//
// What the aisle specifically cannot tolerate:
//   · a fixed header — it takes the bottom bar the muestrario tab lives in
//   · Lenis — it hijacks document scroll and fights the drag loop
//   · PageTransition — a framer opacity animation on top of a 240Hz spring
//     integrator is two animation systems arguing over the same pixels
//
// The lane page at /interiores is NOT gated. It is an ordinary Wings page.

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { isAislePath } from '@/pasillo/lib/routes'
import { laneFromPath } from '@/lib/lanes/registry'
import { PageTransition } from '@/components/features/shared/PageTransition'
import { SmoothScroll } from '@/components/features/shared/SmoothScroll'

/**
 * Stamps the current lane on <html>, so the site chrome can theme itself.
 *
 * SiteNav and the footer are SIBLINGS of the lane wrapper in the root layout —
 * they sit outside `[data-lane]` and cannot see it through the cascade, which is
 * why the header and footer stayed machinery navy on a bone lane. Putting the
 * attribute at the document root lets one nav serve every lane. The alternative
 * was a forked navigation per lane, which root §1.1 forbids outright.
 */
export function LaneScope() {
  const path = usePathname()
  // The aisle is excluded on purpose. It drops the chrome entirely, so it has
  // nothing to theme — and stamping the lane on <html> would paint bone behind a
  // deliberately achromatic near-black tool, which shows on overscroll bounce.
  const lane = isAislePath(path) ? null : laneFromPath(path)
  useEffect(() => {
    const el = document.documentElement
    if (lane) el.setAttribute('data-lane', lane)
    else el.removeAttribute('data-lane')
    return () => el.removeAttribute('data-lane')
  }, [lane])
  return null
}

/** Renders its children on every route except the aisle. */
export function ChromeGate({ children }: { children: React.ReactNode }) {
  return isAislePath(usePathname()) ? null : <>{children}</>
}

/**
 * The main frame. On the aisle it is a bare <main> — no scroll hijack, no
 * transition, no min-height that would fight `h-dvh`. Everywhere else it is
 * exactly what the root layout rendered before this gate existed.
 */
export function MainFrame({ children }: { children: React.ReactNode }) {
  if (isAislePath(usePathname())) return <main>{children}</main>

  return (
    <SmoothScroll>
      <main className="min-h-screen overflow-x-clip">
        <PageTransition>{children}</PageTransition>
      </main>
    </SmoothScroll>
  )
}
