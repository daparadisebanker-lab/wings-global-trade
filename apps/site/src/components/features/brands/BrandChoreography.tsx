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

// innerHTML mutation destroys the nodes React rendered; if React later
// reconciles that subtree (router-cache revisit, client re-render) against
// stale references it throws NotFoundError → the "Application error"
// screen. Every split therefore records the original markup and the
// cleanup below RESTORES it before the next route's children reconcile
// (incident fix 2026-07-11, confirmed by the code-audit agent).
const ORIGINAL_KEY = 'tdOriginalHtml'

function splitLines(el: HTMLElement) {
  if (el.querySelector('.split_line')) return
  el.dataset[ORIGINAL_KEY] = el.innerHTML
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
  el.dataset[ORIGINAL_KEY] = el.innerHTML
  el.innerHTML = (el.textContent ?? '')
    .trim()
    .split(/\s+/)
    .map((w) => `<span class="split_word">${w}</span>`)
    .join(' ')
}

function restoreSplits(root: HTMLElement) {
  root.querySelectorAll<HTMLElement>('[data-td-original-html]').forEach((el) => {
    const original = el.dataset[ORIGINAL_KEY]
    if (typeof original === 'string') {
      el.innerHTML = original
      delete el.dataset[ORIGINAL_KEY]
    }
  })
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

      // Cleanup: gsap context reverts styles/triggers automatically; the
      // innerHTML splits must be restored by hand or React reconciles
      // against destroyed nodes (the /marcas navigation crash).
      return () => {
        if (rootRef.current) restoreSplits(rootRef.current)
      }
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
 *
 * Color + mark resolve AT TRANSITION TIME from the [data-brand] scope the
 * page is arriving into (the curtain itself mounts outside that scope, so
 * a static var() lookup always fell back to navy — the bug Muaaz caught).
 * Inside a brand space the flood is the brand accent and carries the
 * brand's isotipo centered near the top edge of the block (the odd-ritual
 * image-wrapped wipe): «right now, you are in an Áladín space». On the
 * /marcas roster (no brand scope) it stays Wings navy, mark-less.
 */
export function BrandCurtain() {
  const pathname = usePathname()
  const curtainRef = useRef<HTMLDivElement>(null)
  const markRef = useRef<HTMLImageElement>(null)
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

      // The new page has committed by effect time — read ITS brand scope.
      const brandEl = document.querySelector<HTMLElement>('[data-brand]')
      const accent = brandEl
        ? getComputedStyle(brandEl).getPropertyValue('--rb-accent').trim()
        : ''
      el.style.background = accent || 'var(--livery-navy)'

      const isotipo = brandEl?.dataset.brandIsotipo ?? ''
      if (markRef.current) {
        if (isotipo) {
          markRef.current.src = isotipo
          markRef.current.style.display = 'block'
        } else {
          markRef.current.style.display = 'none'
        }
      }

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
      style={{ background: 'var(--livery-navy)', transform: 'translateY(101%)' }}
    >
      {/* The mark rides the flood — dead center, generously sized */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={markRef}
        alt=""
        className="absolute left-1/2 top-1/2 h-40 w-auto -translate-x-1/2 -translate-y-1/2 md:h-56"
        style={{ display: 'none' }}
      />
    </div>
  )
}
