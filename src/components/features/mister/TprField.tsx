// src/components/features/mister/TprField.tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { TPR_CAPTURE_DOT } from '@/lib/motion'

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
  const [justCaptured, setJustCaptured] = useState(false)

  useEffect(() => {
    if (captured && !prevCaptured.current) setJustCaptured(true)
    prevCaptured.current = captured
  }, [captured])

  useEffect(() => {
    if (!justCaptured) return
    const id = setTimeout(() => setJustCaptured(false), 600)
    return () => clearTimeout(id)
  }, [justCaptured])

  const dotScale = shouldReduceMotion ? [1, 1.1, 1] : [1, 1.4, 1]
  const dotAnimate = captured
    ? justCaptured
      ? { scale: dotScale, backgroundColor: '#C4933F' }
      : { scale: 1, backgroundColor: '#C4933F' }
    : { scale: 1, backgroundColor: 'rgba(248,246,240,0.2)' }

  const dotTransition = justCaptured
    ? shouldReduceMotion
      ? { duration: 0.01 }
      : { duration: TPR_CAPTURE_DOT.transition.duration, ease: TPR_CAPTURE_DOT.transition.ease }
    : { duration: 0.4 }

  const valueInitial = shouldReduceMotion
    ? { opacity: 1 }
    : justCaptured
      ? { opacity: 0, scale: 1.0 }
      : { opacity: 1 }

  const valueAnimate = shouldReduceMotion
    ? { opacity: 1, scale: 1 }
    : justCaptured
      ? { opacity: 1, scale: [1.0, 0.94, 1.03, 1.0] }
      : { opacity: 1, scale: 1 }

  const valueTransition = shouldReduceMotion
    ? { duration: 0.01 }
    : justCaptured
      ? { type: 'spring' as const, stiffness: 500, damping: 22, duration: 0.35 }
      : { duration: 0 }

  const rowAnimate =
    justCaptured && !shouldReduceMotion
      ? { backgroundColor: ['rgba(196,147,63,0)', 'rgba(196,147,63,0.08)', 'rgba(196,147,63,0)'] }
      : { backgroundColor: 'rgba(196,147,63,0)' }
  const rowTransition =
    justCaptured && !shouldReduceMotion
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
          <motion.p
            className="font-mono text-[10px] tracking-widest uppercase"
            animate={{ color: justCaptured ? '#C4933F' : 'rgba(196,147,63,0.70)' }}
            transition={{ duration: 0.3 }}
          >
            {label}
          </motion.p>
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
