// src/components/features/mister/TprField.tsx
'use client'

import { useEffect, useRef } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { TPR_CAPTURE_DOT, TPR_CAPTURE_VALUE } from '@/lib/motion'

interface TprFieldProps {
  label: string
  value?: string
  status: 'captured' | 'pending'
  onEdit?: () => void
}

export function TprField({ label, value, status, onEdit }: TprFieldProps) {
  const captured = status === 'captured'
  const shouldReduceMotion = useReducedMotion()

  const prevCaptured = useRef(false)
  const justCaptured = useRef(false)

  useEffect(() => {
    justCaptured.current = captured && !prevCaptured.current
    prevCaptured.current = captured
  }, [captured])

  const dotScale = shouldReduceMotion ? [1, 1.1, 1] : [1, 1.4, 1]
  const dotAnimate = captured
    ? justCaptured.current
      ? { scale: dotScale, backgroundColor: '#C4933F' }
      : { scale: 1, backgroundColor: '#C4933F' }
    : { scale: 1, backgroundColor: 'rgba(248,246,240,0.2)' }

  const dotTransition = justCaptured.current
    ? shouldReduceMotion
      ? { duration: 0.01 }
      : { duration: TPR_CAPTURE_DOT.transition.duration, ease: TPR_CAPTURE_DOT.transition.ease }
    : { duration: 0.4 }

  const valueInitial = justCaptured.current && !shouldReduceMotion ? { opacity: 0 } : { opacity: 1 }
  const valueAnimate = { opacity: 1 }
  const valueTransition = justCaptured.current
    ? shouldReduceMotion
      ? { duration: 0.01 }
      : { duration: TPR_CAPTURE_VALUE.transition.duration, delay: TPR_CAPTURE_VALUE.transition.delay }
    : { duration: 0 }

  const rowAnimate =
    justCaptured.current && !shouldReduceMotion
      ? { backgroundColor: ['rgba(196,147,63,0)', 'rgba(196,147,63,0.08)', 'rgba(196,147,63,0)'] }
      : { backgroundColor: 'rgba(196,147,63,0)' }
  const rowTransition =
    justCaptured.current && !shouldReduceMotion
      ? { duration: 0.4, ease: 'easeInOut' as const }
      : { duration: 0 }

  return (
    <motion.div
      className="group flex items-start justify-between gap-3 border-b border-[#F8F6F0]/[0.08] py-2.5"
      animate={rowAnimate}
      transition={rowTransition}
    >
      <div className="flex items-start gap-2.5 min-w-0">
        <motion.span
          initial={false}
          animate={dotAnimate}
          transition={dotTransition}
          className="mt-[5px] h-1.5 w-1.5 shrink-0 rounded-full"
          aria-hidden
        />
        <div className="min-w-0">
          <p className="font-mono text-[10px] tracking-widest uppercase text-[#C4933F]/70">
            {label}
          </p>
          {captured ? (
            <motion.p
              className="mt-0.5 font-body text-sm text-[#F8F6F0] break-words"
              initial={valueInitial}
              animate={valueAnimate}
              transition={valueTransition}
            >
              {value}
            </motion.p>
          ) : (
            <p className="mt-0.5 font-body text-sm italic text-[#F8F6F0]/25">Pendiente</p>
          )}
        </div>
      </div>
      {captured && onEdit && (
        <button
          type="button"
          onClick={onEdit}
          className="shrink-0 font-mono text-[10px] text-gold opacity-0 transition-opacity hover:text-gold-hover group-hover:opacity-100"
        >
          Editar
        </button>
      )}
    </motion.div>
  )
}
