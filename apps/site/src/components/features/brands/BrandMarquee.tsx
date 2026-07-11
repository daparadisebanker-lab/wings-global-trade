// src/components/features/brands/BrandMarquee.tsx
// Brand vocabulary strip at --rb-accent (SPEC §2.7⑥ — the clone's marquee
// pattern). Pure transform loop; reduced-motion renders a static strip.
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
      className="overflow-hidden border-y border-[var(--rb-accent-border)] bg-[var(--rb-accent)] py-3"
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
