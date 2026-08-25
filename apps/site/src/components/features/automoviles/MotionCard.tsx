// src/components/features/automoviles/MotionCard.tsx
// Shared hover-lift wrapper for every model/brand/segment tile in the lane —
// one primitive instead of repeating the same whileHover block four times.
// Server-rendered Links/content pass through as children (a Client Component
// can host Server Component children; the page itself stays a server
// component doing the data fetch). Easing is --ease-settle (root CLAUDE.md
// §2's frozen "reveals" curve, cubic-bezier(0.22,1,0.36,1)) — a hover lift
// reads as a small reveal, not a structural move, so it takes that token
// rather than --ease-gantry.
'use client'

import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { useReducedMotion } from '@/hooks/useReducedMotion'

const EASE_SETTLE = [0.22, 1, 0.36, 1] as const

interface MotionCardProps {
  className: string
  children: ReactNode
  dataOem?: string
}

export function MotionCard({ className, children, dataOem }: MotionCardProps) {
  const reduced = useReducedMotion()
  return (
    <motion.div
      data-oem={dataOem}
      data-reveal
      whileHover={reduced ? undefined : { y: -4 }}
      transition={{ duration: 0.2, ease: EASE_SETTLE }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
