'use client'

// El umbral — the threshold.
//
// The catalogue is achromatic because the product IS colour: a lane accent would
// vanish on the terracotta tiles and clash with the cobalt ones, and a warm
// ground shifts perceived hue on a purchase buyers reject over colour variance.
// That is filed in packages/liveries/registry.md as an exception. It is really
// this lane's proudest act — the brand takes its own colour off rather than
// falsify a tile — and it happened silently on route change.
//
// So: on the way in, the lane drains. Chroma leaves; nothing dims and nothing
// moves, because --accent-drained is oxblood's achromatic twin at equal
// luminance (ΔL 0.0002). The stamp drains last, so the final colour on screen is
// the oxblood seal going grey.
//
// IT NEVER BLOCKS NAVIGATION. The Link's default behaviour is untouched — the
// route change is issued immediately and the drain plays on the outgoing page
// while it resolves. Making a buyer wait 700ms on an animation is exactly the
// tax a procurement tool must not levy; if the route wins the race the moment
// simply is not seen, which is the correct trade. Tier-1 law already collapses
// the transition under prefers-reduced-motion.

import { useCallback } from 'react'

/** Stamps the crossing state on the lane root. Safe to call from any handler. */
export function useUmbral() {
  return useCallback(() => {
    const lane = document.querySelector('[data-lane="interiores"]')
    lane?.setAttribute('data-threshold', 'crossing')
  }, [])
}

/**
 * Wraps the lane's primary actions. Children are rendered as-is; the only thing
 * this adds is the drain on the way out.
 */
export function Umbral({ children }: { children: React.ReactNode }) {
  const cross = useUmbral()
  return (
    // onPointerDown rather than onClick: the drain starts as the thumb lands,
    // which buys it the pointer-to-navigation gap for free.
    <span onPointerDown={cross} onKeyDown={(e) => e.key === 'Enter' && cross()}>
      {children}
    </span>
  )
}
