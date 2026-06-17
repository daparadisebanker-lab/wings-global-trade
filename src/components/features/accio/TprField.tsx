// src/components/features/accio/TprField.tsx
'use client'

import { useEffect, useRef } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { TPR_CAPTURE_DOT, TPR_CAPTURE_VALUE } from '@/lib/motion'
import { cn } from '@/lib/utils'

interface TprFieldProps {
  label: string
  value?: string
  status: 'captured' | 'pending'
  onEdit?: () => void
}

export function TprField({ label, value, status, onEdit }: TprFieldProps) {
  const captured = status === 'captured'
  const shouldReduceMotion = useReducedMotion()

  // Track previous captured state to detect false→true transition.
  const prevCaptured = useRef(false)
  const justCaptured = useRef(false)

  useEffect(() => {
    if (captured && !prevCaptured.current) {
      justCaptured.current = true
    } else {
      justCaptured.current = false
    }
    prevCaptured.current = captured
  }, [captured])

  // Dot scale pulse — reduced to [1, 1.1, 1] when prefers-reduced-motion.
  const dotScale = shouldReduceMotion ? [1, 1.1, 1] : [1, 1.4, 1]

  // Dot animation: only trigger on false→true, then settle to final color.
  const dotAnimate = captured
    ? justCaptured.current
      ? { scale: dotScale, backgroundColor: '#C4933F' }
      : { scale: 1, backgroundColor: '#C4933F' }
    : { scale: 1, backgroundColor: '#D1D5DB' }

  const dotTransition = justCaptured.current
    ? (shouldReduceMotion
        ? { duration: 0.01 }
        : { duration: TPR_CAPTURE_DOT.transition.duration, ease: TPR_CAPTURE_DOT.transition.ease })
    : { duration: 0.4 }

  // Value fade-in: only animate on just-captured, else show immediately if already captured.
  const valueInitial = justCaptured.current && !shouldReduceMotion ? { opacity: 0 } : { opacity: 1 }
  const valueAnimate = { opacity: 1 }
  const valueTransition = justCaptured.current
    ? (shouldReduceMotion
        ? { duration: 0.01 }
        : { duration: TPR_CAPTURE_VALUE.transition.duration, delay: TPR_CAPTURE_VALUE.transition.delay })
    : { duration: 0 }

  // Row shimmer: animate backgroundColor on just-captured.
  const rowAnimate = justCaptured.current && !shouldReduceMotion
    ? {
        backgroundColor: [
          'rgba(196,147,63,0)',
          'rgba(196,147,63,0.08)',
          'rgba(196,147,63,0)',
        ],
      }
    : { backgroundColor: 'rgba(196,147,63,0)' }

  const rowTransition = justCaptured.current && !shouldReduceMotion
    ? { duration: 0.4, ease: 'easeInOut' as const }
    : { duration: 0 }

  return (
    <motion.div
      className="group flex items-start justify-between gap-3 py-2"
      animate={rowAnimate}
      transition={rowTransition}
    >
      <div className="flex items-start gap-2.5">
        <motion.span
          initial={false}
          animate={dotAnimate}
          transition={dotTransition}
          className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
          aria-hidden
        />
        <div>
          <p
            className={cn(
              'font-body text-[13px]',
              captured ? 'font-medium text-text-muted' : 'text-[#9CA3AF]',
            )}
          >
            {label}
          </p>
          {captured ? (
            <motion.p
              className="mt-0.5 text-sm font-mono text-navy"
              initial={valueInitial}
              animate={valueAnimate}
              transition={valueTransition}
            >
              {value}
            </motion.p>
          ) : (
            <p className="mt-0.5 text-sm font-body italic text-[#9CA3AF]">
              Pendiente
            </p>
          )}
        </div>
      </div>
      {captured && onEdit && (
        <button
          type="button"
          onClick={onEdit}
          className="font-body text-xs text-gold opacity-0 transition-opacity hover:text-gold-hover group-hover:opacity-100"
        >
          Editar
        </button>
      )}
    </motion.div>
  )
}
