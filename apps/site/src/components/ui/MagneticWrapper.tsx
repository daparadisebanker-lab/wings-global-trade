'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'

interface MagneticWrapperProps {
  children: React.ReactNode
  /** How far the element travels toward the cursor (0–1 scale of delta). */
  strength?: number
  /** Pull radius as a multiplier of the element's larger dimension. */
  radius?: number
  /** Lerp smoothing factor per frame — lower = slower/dreamier. */
  lerpFactor?: number
  className?: string
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t

export function MagneticWrapper({
  children,
  strength = 0.38,
  radius = 1.4,
  lerpFactor = 0.12,
  className,
}: MagneticWrapperProps) {
  const outerRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const outer = outerRef.current
    const inner = innerRef.current
    if (!outer || !inner) return
    if (window.matchMedia('(pointer: coarse)').matches) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let tx = 0, ty = 0   // target
    let cx = 0, cy = 0   // current (lerped)

    const handleMouseMove = (e: MouseEvent) => {
      const rect = outer.getBoundingClientRect()
      const mx = rect.left + rect.width / 2
      const my = rect.top + rect.height / 2
      const dx = e.clientX - mx
      const dy = e.clientY - my
      const dist = Math.sqrt(dx * dx + dy * dy)
      const pullRadius = Math.max(rect.width, rect.height) * radius

      if (dist < pullRadius) {
        // Stronger pull the closer the cursor is
        const t = 1 - dist / pullRadius
        tx = dx * strength * t
        ty = dy * strength * t
      } else {
        tx = 0
        ty = 0
      }
    }

    const tick = () => {
      cx = lerp(cx, tx, lerpFactor)
      cy = lerp(cy, ty, lerpFactor)
      // Outer shell moves toward cursor
      gsap.set(outer, { x: cx, y: cy })
      // Inner content counter-moves — text lags behind, creating depth
      gsap.set(inner, { x: cx * -0.15, y: cy * -0.15 })
    }

    document.addEventListener('mousemove', handleMouseMove, { passive: true })
    gsap.ticker.add(tick)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      gsap.ticker.remove(tick)
      gsap.set(outer, { x: 0, y: 0 })
      gsap.set(inner, { x: 0, y: 0 })
    }
  }, [strength, radius, lerpFactor])

  return (
    <div ref={outerRef} className={className}>
      <div ref={innerRef}>{children}</div>
    </div>
  )
}
