// src/components/features/shared/TechDraw.tsx
// Drafting-table animation for the platform's technical drawings — one client
// wrapper, attribute-driven (the Odd Ritual grammar approach applied to
// SVG): the figure DRAFTS ITSELF when scrolled into view.
//
//   data-td-fade   ground elements (faces, deck) — settle in first
//   data-td-draw   stroke shapes with pathLength="1" — line-drawn
//   data-td-pop    detail marks (roll ends, boxes) — scale-settle, stagger
//   data-td-slab   exploded groups; data-td-dx/dy = screen offset to fly to
//   data-td-late   dimensions, leaders, hidden edges — appear last
//
// Reduced-motion: no drafting — the finished drawing, slabs set to their
// exploded positions instantly. No JS: everything visible, slabs assembled.
'use client'

import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger, useGSAP)

const EASE_GANTRY = 'cubic-bezier(0.83,0,0.17,1)'
const EASE_SETTLE = 'cubic-bezier(0.22,1,0.36,1)'

export function TechDraw({ children }: { children: React.ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const root = rootRef.current
      if (!root) return

      const slabs = gsap.utils.toArray<SVGGElement>('[data-td-slab]', root)
      const slabVars = (el: SVGGElement) => ({
        x: Number(el.dataset.tdDx ?? 0),
        y: Number(el.dataset.tdDy ?? 0),
      })

      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        // Finished drawing, exploded state, no motion.
        slabs.forEach((el) => gsap.set(el, slabVars(el)))
        return
      }

      const fades = gsap.utils.toArray<Element>('[data-td-fade]', root)
      const draws = gsap.utils.toArray<Element>('[data-td-draw]', root)
      const pops = gsap.utils.toArray<Element>('[data-td-pop]', root)
      const lates = gsap.utils.toArray<Element>('[data-td-late]', root)

      // Pre-hide (JS-on only, so the no-JS document stays complete).
      gsap.set(fades, { autoAlpha: 0, y: 10 })
      gsap.set(draws, { strokeDasharray: 1, strokeDashoffset: 1 })
      gsap.set(pops, { autoAlpha: 0, scale: 0.5, transformOrigin: '50% 50%' })
      gsap.set(lates, { autoAlpha: 0 })

      const tl = gsap.timeline({
        scrollTrigger: { trigger: root, start: 'top 82%', once: true },
      })
      tl.to(fades, { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.06, ease: EASE_SETTLE })
      if (draws.length) {
        tl.to(draws, { strokeDashoffset: 0, duration: 0.7, stagger: 0.035, ease: 'none' }, '-=0.25')
      }
      if (pops.length) {
        tl.to(pops, { autoAlpha: 1, scale: 1, duration: 0.4, stagger: 0.03, ease: EASE_SETTLE }, '-=0.3')
      }
      if (slabs.length) {
        slabs.forEach((el, i) => {
          tl.to(el, { ...slabVars(el), duration: 0.8, ease: EASE_GANTRY }, `-=${i === 0 ? 0 : 0.62}`)
        })
      }
      tl.to(lates, { autoAlpha: 1, duration: 0.5, ease: EASE_SETTLE }, '-=0.15')
    },
    { scope: rootRef },
  )

  return <div ref={rootRef}>{children}</div>
}
