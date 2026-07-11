// src/components/features/brands/BrandMarquee.tsx
// Brand vocabulary strip on --rb-accent-ink (SPEC §2.7⑥ — the clone's marquee
// pattern). Uses the -ink, not --rb-accent: white on the lighter accent is only
// ~4.1:1 at 13px (Áladín green); --rb-accent-ink pairs with white ≥4.5:1 for
// every conformant brand. Pure transform loop; reduced-motion renders a static strip.
'use client'

import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(useGSAP)

interface Props {
  items: string[]
}

export function BrandMarquee({ items }: Props) {
  const trackRef = useRef<HTMLDivElement>(null)
  const strip = items.join('  ·  ')

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
      const track = trackRef.current
      if (!track) return
      gsap.to(track, { xPercent: -50, duration: 28, ease: 'none', repeat: -1 })
    },
    { scope: trackRef },
  )

  return (
    <div
      aria-hidden
      className="overflow-hidden border-y border-[var(--rb-accent-border)] bg-[var(--rb-accent-ink)] py-3"
    >
      <div ref={trackRef} className="flex w-max whitespace-nowrap will-change-transform">
        {[0, 1].map((copy) => (
          <span
            key={copy}
            className="pr-8 font-mono text-[13px] uppercase tracking-widest-2 text-white"
          >
            {strip} ·{' '}
          </span>
        ))}
      </div>
    </div>
  )
}
