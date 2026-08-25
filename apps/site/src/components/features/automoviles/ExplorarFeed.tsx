// src/components/features/automoviles/ExplorarFeed.tsx
//
// WGT/07's vertical discovery feed — one nameplate per full-screen card,
// scroll/swipe/keyboard to the next. A new entry point alongside the
// existing brand/segment grids (never a replacement — see
// programs/automobiles/SCOPE.md §0h), so it owns its own scroll region
// rather than the page body: site chrome (SiteNav, AutoLaneNav) stays put
// above it, exactly like every other lane page — this is the one subtree
// that behaves like a feed, not the one subtree that drops chrome (that's
// still only src/pasillo, per apps/site/CLAUDE.md).
//
// Card unit = nameplate (not trim): each `Product` row already models one
// nameplate with its trims nested in `models[]`, so no reshaping needed —
// swiping past 5 near-identical trims in a row was the thing worth avoiding.
'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import type { Product } from '@/types/database'
import { getOemBrandByName } from '@/lib/automoviles/oem-brands'
import { lane } from '@wings/liveries/automoviles/lane.config'
import { useReducedMotion } from '@/hooks/useReducedMotion'

const EASE_SETTLE = [0.22, 1, 0.36, 1] as const

interface ExplorarFeedProps {
  products: Product[]
}

export function ExplorarFeed({ products }: ExplorarFeedProps) {
  const reduced = useReducedMotion()
  const scrollerRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<(HTMLElement | null)[]>([])
  // True while a programmatic scroll is animating — see goTo/onKeyDown.
  const isScrollingRef = useRef(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const [hasScrolled, setHasScrolled] = useState(false)

  useEffect(() => {
    const scroller = scrollerRef.current
    if (!scroller) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const idx = cardRefs.current.findIndex((el) => el === entry.target)
            if (idx !== -1) setActiveIndex(idx)
          }
        }
      },
      { root: scroller, threshold: 0.6 },
    )
    cardRefs.current.forEach((el) => el && observer.observe(el))
    return () => observer.disconnect()
  }, [products.length])

  useEffect(() => {
    const scroller = scrollerRef.current
    if (!scroller) return
    const onScroll = () => {
      if (scroller.scrollTop > 40) setHasScrolled(true)
    }
    scroller.addEventListener('scroll', onScroll, { passive: true })
    return () => scroller.removeEventListener('scroll', onScroll)
  }, [])

  function goTo(index: number) {
    const scroller = scrollerRef.current
    const target = cardRefs.current[index]
    if (!scroller || !target) return
    // scroller.scrollTo, not target.scrollIntoView: scrollIntoView walks up
    // every scrollable ancestor (including the page itself) to bring the
    // target fully into view, which nudged the outer page down and bled
    // the site footer into frame beneath the card. Scrolling the container
    // directly keeps the interaction contained to the feed, as intended.
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    isScrollingRef.current = true
    scroller.scrollTo({ top: target.offsetTop, behavior: reduced ? 'auto' : 'smooth' })
    // Retargeting scroller.scrollTo mid-animation fights the container's own
    // scroll-snap-mandatory: a burst of overlapping calls left the browser's
    // snap machinery stuck (verified — scrollTop genuinely stopped advancing,
    // not just a display lag). One press = one card, and a press mid-
    // transition is ignored until it settles — also just the correct,
    // predictable feel for a paginated feed. 550ms comfortably outlasts the
    // native smooth-scroll duration for one card at any viewport height.
    window.setTimeout(() => {
      isScrollingRef.current = false
    }, 550)
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key !== 'ArrowDown' && e.key !== 'PageDown' && e.key !== 'ArrowUp' && e.key !== 'PageUp') return
    e.preventDefault()
    if (isScrollingRef.current) return
    if (e.key === 'ArrowDown' || e.key === 'PageDown') {
      goTo(Math.min(activeIndex + 1, products.length - 1))
    } else {
      goTo(Math.max(activeIndex - 1, 0))
    }
  }

  return (
    <div className="relative">
      {/* Register — same "01 / 31" document-position idiom as JumpNavigation,
          the house's existing pattern for "where am I" in a long scroll. */}
      <div
        aria-hidden
        className="pointer-events-none absolute right-5 top-4 z-10 overflow-hidden font-mono text-[11px] uppercase tracking-widest-2 tabular-nums text-[color:var(--ink-secondary)] md:right-8"
      >
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={activeIndex}
            initial={reduced ? false : { y: 8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={reduced ? undefined : { y: -8, opacity: 0 }}
            transition={{ duration: 0.2, ease: EASE_SETTLE }}
            className="inline-block"
          >
            {String(activeIndex + 1).padStart(2, '0')}
          </motion.span>
        </AnimatePresence>{' '}
        / {String(products.length).padStart(2, '0')}
      </div>

      <div
        ref={scrollerRef}
        tabIndex={0}
        onKeyDown={onKeyDown}
        role="region"
        aria-label="Explorador vertical de modelos"
        // snap-proximity, not snap-mandatory: mandatory snapping is a known
        // friction point against discrete mouse-wheel ticks (as opposed to
        // a continuous trackpad gesture) — it can require a stronger scroll
        // than a single tick to break past a snap point. Proximity still
        // snaps cleanly once a scroll settles near a card, without imposing
        // a hard threshold to fight against on the way there.
        className="h-[calc(100svh-8rem)] snap-y snap-proximity overflow-y-auto overscroll-y-contain outline-none md:h-[calc(100svh-8.5rem)]"
      >
        {products.map((p, i) => {
          const rawBrand = p.filter_attrs?.brand
          const brandName = typeof rawBrand === 'string' ? rawBrand : undefined
          const oem = brandName ? getOemBrandByName(brandName) : undefined
          const rawSegment = p.filter_attrs?.segment
          const segment =
            typeof rawSegment === 'string' ? lane.taxonomy.find((s) => s.slug === rawSegment) : undefined

          return (
            <section
              key={p.id}
              ref={(el) => {
                cardRefs.current[i] = el
              }}
              data-oem={oem?.slug}
              className="flex h-full snap-start flex-col justify-center border-b border-[color:var(--ink-decoration)] px-5 py-10 md:px-8"
            >
              <motion.div
                animate={reduced ? undefined : { opacity: activeIndex === i ? 1 : 0.35, scale: activeIndex === i ? 1 : 0.97 }}
                transition={{ duration: 0.3, ease: EASE_SETTLE }}
                className="mx-auto flex w-full max-w-2xl flex-col"
              >
                <div className="flex items-center gap-2">
                  <span
                    aria-hidden
                    className="h-2 w-2 shrink-0 rounded-[2px] bg-[color:var(--oem-accent,_var(--accent-ink))]"
                  />
                  <span className="font-mono text-[11px] uppercase tracking-widest-2 text-[color:var(--oem-accent,_var(--accent-ink))]">
                    {oem?.name ?? brandName}
                  </span>
                  {segment && (
                    <>
                      <span className="text-[color:var(--ink-decoration)]" aria-hidden>
                        ·
                      </span>
                      <Link
                        href={`/automoviles/${segment.slug}`}
                        className="font-mono text-[11px] uppercase tracking-widest-2 text-[color:var(--ink-secondary)] transition-colors hover:text-[color:var(--ink-primary)]"
                      >
                        {segment.name.es}
                      </Link>
                    </>
                  )}
                </div>

                <h2 className="mt-4 font-display text-display-lg text-[color:var(--ink-primary)]">
                  {oem ? p.name_es.replace(`${oem.name} `, '') : p.name_es}
                </h2>

                {p.description_es && (
                  <p className="mt-4 max-w-lg text-body-md text-[color:var(--ink-secondary)]">{p.description_es}</p>
                )}

                <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-3 font-mono text-[12px] text-[color:var(--ink-secondary)] sm:grid-cols-4">
                  {(['Motor', 'Transmisión', 'Tracción', 'Plazas'] as const).map((key) =>
                    p.specs?.[key] ? (
                      <div key={key}>
                        <dt className="text-[10px] uppercase tracking-widest-2 text-[color:var(--ink-decoration)]">
                          {key}
                        </dt>
                        <dd className="mt-1 text-[color:var(--ink-primary)]">{p.specs[key]}</dd>
                      </div>
                    ) : null,
                  )}
                </dl>

                {p.models?.length > 0 && (
                  <div className="mt-6 flex flex-wrap gap-2">
                    {p.models.map((m) => (
                      <span
                        key={m.name}
                        className="rounded-[var(--radius-control)] border border-[color:var(--ink-decoration)] px-3 py-1.5 font-mono text-[10px] uppercase tracking-wide text-[color:var(--ink-secondary)]"
                      >
                        {m.name}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <Link
                    href="/cotizar"
                    className="inline-flex h-12 items-center justify-center rounded-[var(--radius-control)] bg-[color:var(--oem-accent,_var(--btn-primary-bg))] px-8 font-mono text-sm uppercase tracking-wide text-white transition-opacity hover:opacity-90"
                  >
                    Solicitar cotización — {oem ? p.name_es.replace(`${oem.name} `, '') : p.name_es}
                  </Link>
                  <Link
                    href={`/automoviles/ficha/${p.slug}`}
                    className="font-mono text-[11px] uppercase tracking-widest-2 text-[color:var(--ink-secondary)] transition-colors hover:text-[color:var(--ink-primary)]"
                  >
                    Ficha técnica ↓
                  </Link>
                </div>
              </motion.div>

              {i === 0 && (
                <p
                  aria-hidden
                  className={[
                    'pointer-events-none absolute inset-x-0 bottom-6 text-center font-mono text-[11px] uppercase tracking-widest-2 text-[color:var(--ink-decoration)] transition-opacity duration-500',
                    hasScrolled ? 'opacity-0' : 'opacity-100',
                  ].join(' ')}
                >
                  Desliza para ver más ↓
                </p>
              )}
            </section>
          )
        })}
      </div>
    </div>
  )
}
