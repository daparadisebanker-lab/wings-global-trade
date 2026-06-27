'use client'

import { useRef, useEffect } from 'react'
import { useMotionValue, animate, useReducedMotion, useInView } from 'framer-motion'

interface CountUpStatProps {
  value: string
  label: string
  prefix?: string
  suffix?: string
}

/**
 * Parses a stat string like "32", "+500", "24h", "$2.1M" into its parts.
 * Returns null for `num` if no parseable number is found.
 */
function parseStatValue(raw: string): {
  num: number | null
  prefix: string
  suffix: string
  isDecimal: boolean
  zeroPad: number
} {
  const trimmed = raw.trim()

  // Match optional prefix chars, then a number (int or decimal), then optional suffix
  // Prefix: any non-digit, non-dot chars at the start (e.g. "+", "$")
  // Number: integer or decimal
  // Suffix: remaining chars (e.g. "h", "M", "%")
  const match = trimmed.match(/^([^0-9]*)(\d+(?:\.\d+)?)(.*)$/)

  if (!match) {
    return { num: null, prefix: '', suffix: trimmed, isDecimal: false, zeroPad: 0 }
  }

  const [, pre, numStr, suf] = match
  const num = parseFloat(numStr)
  const isDecimal = numStr.includes('.')
  // Detect zero-padded values like "05" or "02"
  const zeroPad = numStr.startsWith('0') && numStr.length > 1 ? numStr.length : 0

  return { num, prefix: pre, suffix: suf, isDecimal, zeroPad }
}

export function CountUpStat({ value, label, prefix: prefixProp, suffix: suffixProp }: CountUpStatProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true })
  const shouldReduceMotion = useReducedMotion()

  const { num, prefix: parsedPrefix, suffix: parsedSuffix, isDecimal, zeroPad } = parseStatValue(value)

  // Allow prop overrides for prefix/suffix, else use parsed values
  const displayPrefix = prefixProp ?? parsedPrefix
  const displaySuffix = suffixProp ?? parsedSuffix

  const motionValue = useMotionValue(0)
  const displayRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (num === null) return

    // If reduced motion, jump straight to final value
    if (shouldReduceMotion) {
      if (displayRef.current) {
        const rounded = Math.round(num)
        displayRef.current.textContent = isDecimal
          ? num.toFixed(1)
          : zeroPad
            ? String(rounded).padStart(zeroPad, '0')
            : String(rounded)
      }
      return
    }

    if (!isInView) return

    const controls = animate(motionValue, num, {
      duration: 1.2,
      ease: [0.16, 1, 0.3, 1],
      onUpdate(latest) {
        if (displayRef.current) {
          const rounded = Math.round(latest)
          displayRef.current.textContent = isDecimal
            ? latest.toFixed(1)
            : zeroPad
              ? String(rounded).padStart(zeroPad, '0')
              : String(rounded)
        }
      },
    })

    return () => controls.stop()
  }, [isInView, num, isDecimal, zeroPad, motionValue, shouldReduceMotion])

  // If no parseable number, render value as-is
  if (num === null) {
    return (
      <div ref={ref}>
        <div className="font-display text-[2.5rem] font-light text-gold leading-none tracking-tight">
          {value}
        </div>
        <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.15em] text-warm-white/40">
          {label}
        </p>
      </div>
    )
  }

  const initialDisplay = shouldReduceMotion
    ? (isDecimal ? num.toFixed(1) : String(Math.round(num)))
    : '0'

  return (
    <div ref={ref}>
      <div className="font-display text-[2.5rem] font-light text-gold leading-none tracking-tight">
        {displayPrefix}
        <span ref={displayRef}>{initialDisplay}</span>
        {displaySuffix}
      </div>
      <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.15em] text-warm-white/40">
        {label}
      </p>
    </div>
  )
}
