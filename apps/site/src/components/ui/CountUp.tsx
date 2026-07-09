'use client'

import { useEffect, useRef } from 'react'
import { useMotionValue, animate, useReducedMotion } from 'framer-motion'

interface CountUpProps {
  value: number
  duration?: number
  className?: string
  suffix?: string
}

function getDecimalPlaces(n: number): number {
  const str = String(n)
  const dot = str.indexOf('.')
  return dot === -1 ? 0 : str.length - dot - 1
}

export function CountUp({ value, duration, className, suffix = '' }: CountUpProps) {
  const prefersReducedMotion = useReducedMotion()
  const displayRef = useRef<HTMLSpanElement>(null)
  const motionValue = useMotionValue(0)
  const places = getDecimalPlaces(value)

  const resolvedDuration = duration ?? Math.min(1500, Math.max(300, (value / 100) * 200)) / 1000

  useEffect(() => {
    if (prefersReducedMotion) {
      if (displayRef.current) {
        displayRef.current.textContent =
          value.toFixed(places) + suffix
      }
      return
    }

    const controls = animate(motionValue, value, {
      duration: resolvedDuration,
      ease: 'easeOut',
      onUpdate: (v) => {
        if (displayRef.current) {
          displayRef.current.textContent = v.toFixed(places) + suffix
        }
      },
    })

    return () => controls.stop()
  }, [value, resolvedDuration, places, suffix, prefersReducedMotion, motionValue])

  return (
    <span className={className}>
      <span ref={displayRef}>{prefersReducedMotion ? value.toFixed(places) + suffix : '0'}</span>
    </span>
  )
}
