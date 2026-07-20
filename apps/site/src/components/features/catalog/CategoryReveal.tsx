// src/components/features/catalog/CategoryReveal.tsx
// The catalog port of BrandReveal (the Áladín shelf preloader): count-up
// 0→100 → category mark rises out of a clip → curtain lift. Here the mark is
// the category's own SVG motif, in the family Wings gold on the navy ground —
// no per-category hue (site decision 2026-07-20).
//
// Rendered through a portal on document.body so it escapes the route
// PageTransition fade and the fixed header, owning the full screen. It is a
// brand ENTRY moment, not a per-page tax: it plays once per browser session
// (sessionStorage gate) and never mounts under reduced-motion — this keeps the
// category LCP gate (root §4 QA-4: <2s on 4G) intact on subsequent views.
'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { CategoryIcon } from '@/components/features/homepage/CategoryIcon'

gsap.registerPlugin(useGSAP)

const EASE_GANTRY = 'cubic-bezier(0.83,0,0.17,1)'
const EASE_SETTLE = 'cubic-bezier(0.22,1,0.36,1)'
const SESSION_KEY = 'wgt_category_reveal_seen'

interface CategoryRevealProps {
  name: string
  tagline: string
  iconKey: string | null
}

export function CategoryReveal({ name, tagline, iconKey }: CategoryRevealProps) {
  const [phase, setPhase] = useState<'idle' | 'playing' | 'done'>('idle')

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setPhase('done')
      return
    }
    // Play once per session — the catalog entry moment, not every page.
    try {
      if (sessionStorage.getItem(SESSION_KEY)) {
        setPhase('done')
        return
      }
      sessionStorage.setItem(SESSION_KEY, '1')
    } catch {
      // sessionStorage blocked (private mode / SSR guard) — play anyway.
    }
    setPhase('playing')
  }, [])

  if (phase === 'done') return null
  return (
    <>
      {phase === 'playing' &&
        createPortal(
          <RevealOverlay
            name={name}
            tagline={tagline}
            iconKey={iconKey}
            onDone={() => setPhase('done')}
          />,
          document.body,
        )}
    </>
  )
}

function RevealOverlay({
  name,
  tagline,
  iconKey,
  onDone,
}: CategoryRevealProps & { onDone: () => void }) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const countRef = useRef<HTMLParagraphElement>(null)

  useGSAP(
    () => {
      const wrap = wrapRef.current
      if (!wrap) return

      // Scroll is held while the reveal owns the screen.
      document.documentElement.style.overflow = 'hidden'

      const counter = { value: 0 }
      const tl = gsap.timeline({
        onComplete: () => {
          document.documentElement.style.overflow = ''
          onDone()
        },
      })

      tl.to(counter, {
        value: 100,
        duration: 1.1,
        ease: 'power2.out',
        onUpdate: () => {
          if (countRef.current) countRef.current.textContent = String(Math.round(counter.value))
        },
      })
        // The category mark rises out of the clip — the reveal itself.
        .fromTo(
          '[data-reveal-mark]',
          { clipPath: 'inset(100% 0% 0% 0%)', y: 36, scale: 1.05 },
          { clipPath: 'inset(0% 0% 0% 0%)', y: 0, scale: 1, duration: 1.0, ease: EASE_SETTLE },
          0.1,
        )
        .fromTo(
          '[data-reveal-label]',
          { autoAlpha: 0, y: 12 },
          { autoAlpha: 1, y: 0, duration: 0.6, ease: EASE_SETTLE },
          0.7,
        )
        // The navy curtain lifts, exposing the catalog beneath.
        .to('[data-reveal-inner]', { yPercent: -24, autoAlpha: 0, duration: 0.45, ease: EASE_GANTRY }, '+=0.12')
        .to('[data-reveal-curtain]', { yPercent: -101, duration: 0.85, ease: EASE_GANTRY }, '-=0.35')

      return () => {
        document.documentElement.style.overflow = ''
      }
    },
    { scope: wrapRef },
  )

  return (
    <div ref={wrapRef} aria-hidden className="fixed inset-0 z-[100]">
      {/* Navy ground — the family curtain (matches the site hero ground) */}
      <div data-reveal-curtain className="hero-mesh absolute inset-0 bg-[#000C1F]" />
      {/* Inner — mark, label, count */}
      <div
        data-reveal-inner
        className="absolute inset-0 flex flex-col items-center justify-center gap-6"
      >
        <div data-reveal-mark style={{ clipPath: 'inset(100% 0% 0% 0%)' }}>
          <CategoryIcon iconKey={iconKey} className="h-28 w-28 text-gold md:h-36 md:w-36" />
        </div>
        <p
          data-reveal-label
          className="max-w-md px-8 text-center font-mono text-[11px] uppercase tracking-widest-3 text-warm-white/45 opacity-0"
        >
          {name} · {tagline}
        </p>
        <p ref={countRef} className="font-mono text-mono-lg tabular-nums text-gold">
          0
        </p>
      </div>
    </div>
  )
}
