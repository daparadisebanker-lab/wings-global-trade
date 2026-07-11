// src/components/features/brands/BrandChoreography.tsx
// The Odd Ritual interaction grammar, ported as grammar not stack (SPEC
// §2.6 / G6 ratified): the clone's data-attribute choreography — kept
// verbatim so the clone stays the living reference — re-implemented with
// useGSAP inside the (brands) canvas.
//
//   data-split        masked line reveal on scroll (splits on <br>)
//   data-split-words  word-by-word opacity scrub (BrandStory pattern)
//   data-reveal       generic fade-up on scroll
//
// Motion law: timings map to Tier-1 eases (--ease-gantry structural,
// --ease-settle reveals). prefers-reduced-motion → no init at all; content
// is fully visible without JS because initial states are set by GSAP only
// (fromTo), never by CSS — full parity, root law §Phase-6.5.
'use client'

import { useRef } from 'react'
import { usePathname } from 'next/navigation'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger, useGSAP)

// Tier-1 eases as GSAP-native cubic beziers.
const EASE_GANTRY = 'cubic-bezier(0.83,0,0.17,1)' // structural moves
const EASE_SETTLE = 'cubic-bezier(0.22,1,0.36,1)' // reveals

function splitLines(el: HTMLElement) {
  if (el.querySelector('.split_line')) return
  const lines = el.innerHTML.split(/<br\s*\/?>/i)
  el.innerHTML = lines
    .map(
      (line) =>
        `<span class="split_line" style="display:block;overflow:hidden"><span class="split_line-inner" style="display:block">${line}</span></span>`,
    )
    .join('')
}

function splitWords(el: HTMLElement) {
  if (el.querySelector('.split_word')) return
  el.innerHTML = (el.textContent ?? '')
    .trim()
    .split(/\s+/)
    .map((w) => `<span class="split_word">${w}</span>`)
    .join(' ')
}

export function BrandChoreography({ children }: { children: React.ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
      const root = rootRef.current
      if (!root) return

      // Masked line reveals
      root.querySelectorAll<HTMLElement>('[data-split]').forEach((el) => {
        splitLines(el)
        gsap.fromTo(
          el.querySelectorAll('.split_line-inner'),
          { yPercent: 110 },
          {
            yPercent: 0,
            duration: 1,
            stagger: 0.08,
            ease: EASE_SETTLE,
            scrollTrigger: { trigger: el, start: 'top 85%' },
          },
        )
      })

      // Generic fade-up
      root.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
        gsap.fromTo(
          el,
          { autoAlpha: 0, y: 30 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.9,
            ease: EASE_SETTLE,
            scrollTrigger: { trigger: el, start: 'top 90%' },
          },
        )
      })

      // Word-by-word opacity scrub (the BrandStory device)
      root.querySelectorAll<HTMLElement>('[data-split-words]').forEach((el) => {
        splitWords(el)
        const words = el.querySelectorAll('.split_word')
        gsap.set(words, { opacity: 0.22 })
        gsap.to(words, {
          opacity: 1,
          stagger: 0.06,
          ease: 'none',
          scrollTrigger: { trigger: el, start: 'top 78%', end: 'bottom 55%', scrub: true },
        })
      })

      ScrollTrigger.refresh()
    },
    // Re-choreograph on every route change inside the canvas; revert cleans
    // all triggers and inline styles from the outgoing page.
    { scope: rootRef, dependencies: [pathname], revertOnUpdate: true },
  )

  return <div ref={rootRef}>{children}</div>
}

/**
 * Route curtain (SPEC §2.6): Barba's curtain is an MPA technique — the App
 * Router equivalent is an arrival wipe on route change WITHIN the canvas.
 * The flood uses --rb-accent, so moving between a brand's pages is a
 * brand-colored moment; /marcas (no brand scope) falls back to Wings navy.
 */
export function BrandCurtain() {
  const pathname = usePathname()
  const curtainRef = useRef<HTMLDivElement>(null)
  const firstRender = useRef(true)

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
      if (firstRender.current) {
        firstRender.current = false
        return
      }
      const el = curtainRef.current
      if (!el) return
      gsap.fromTo(
        el,
        { yPercent: 0, autoAlpha: 1 },
        {
          yPercent: -101,
          duration: 0.8,
          ease: EASE_GANTRY,
          onComplete: () => gsap.set(el, { autoAlpha: 0, yPercent: 101 }),
        },
      )
      // The incoming page arrives under the lifting curtain, already at top.
      window.scrollTo(0, 0)
    },
    { dependencies: [pathname] },
  )

  return (
    <div
      ref={curtainRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-40 opacity-0"
      style={{ background: 'var(--rb-accent, var(--livery-navy))', transform: 'translateY(101%)' }}
    />
  )
}
