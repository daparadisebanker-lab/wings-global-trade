'use client'

import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'framer-motion'

interface SpecScannerLineProps {
  rowCount: number
  isVisible: boolean
  rowHeight?: number
}

export function SpecScannerLine({
  rowCount,
  isVisible,
  rowHeight = 44,
}: SpecScannerLineProps) {
  const prefersReducedMotion = useReducedMotion()
  const lineRef = useRef<HTMLDivElement>(null)
  const hasRunRef = useRef(false)

  useEffect(() => {
    if (!isVisible || hasRunRef.current) return
    hasRunRef.current = true

    const line = lineRef.current
    if (!line) return

    if (prefersReducedMotion) {
      line.style.opacity = '0'
      return
    }

    const totalDuration = rowCount * 20
    const startTime = performance.now()

    line.style.opacity = '0.6'
    line.style.transform = 'translateY(0px)'

    let raf: number

    function tick(now: number) {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / totalDuration, 1)
      const y = progress * rowCount * rowHeight

      if (line) {
        line.style.transform = `translateY(${y}px)`
      }

      if (progress < 1) {
        raf = requestAnimationFrame(tick)
      } else {
        // Fade out when scan completes
        if (line) {
          line.style.transition = 'opacity 300ms ease-out'
          line.style.opacity = '0'
        }
      }
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [isVisible, rowCount, rowHeight, prefersReducedMotion])

  return (
    <div
      className="pointer-events-none absolute left-0 right-0 top-0"
      aria-hidden="true"
    >
      <div
        ref={lineRef}
        className="h-px w-full bg-gold"
        style={{ opacity: 0, willChange: 'transform, opacity' }}
      />
    </div>
  )
}
