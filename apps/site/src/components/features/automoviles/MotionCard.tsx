// src/components/features/automoviles/MotionCard.tsx
// Shared hover-lift wrapper for every model/brand/segment tile in the lane —
// one primitive instead of repeating the same whileHover block four times.
// Server-rendered Links/content pass through as children (a Client Component
// can host Server Component children; the page itself stays a server
// component doing the data fetch). Easing is --ease-settle (root CLAUDE.md
// §2's frozen "reveals" curve, cubic-bezier(0.22,1,0.36,1)) — a hover lift
// reads as a small reveal, not a structural move, so it takes that token
// rather than --ease-gantry.
//
// Optional imageUrl: the reference the client sent (a Toyota configurator
// card) breaks the vehicle cutout out over the card's top edge, drop-
// shadowed, rather than boxing it inside the padding. Confirmed with the
// client: incoming photography will be transparent-background cutouts, the
// format this treatment actually requires. `product.images` is empty for
// every nameplate today (programs/automobiles/SCOPE.md §4·1) — this stays
// completely dormant, rendering exactly the prior typography-only card,
// until real image URLs land. Absolutely positioned (not in-flow) so it
// never affects this card's own grid-track height; the caller's grid still
// needs a taller row gap to give the breakout clearance from the row above
// — see the gap-y-8 callers.
'use client'

import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { useReducedMotion } from '@/hooks/useReducedMotion'

const EASE_SETTLE = [0.22, 1, 0.36, 1] as const

interface MotionCardProps {
  className: string
  children: ReactNode
  dataOem?: string
  imageUrl?: string
  imageAlt?: string
}

export function MotionCard({ className, children, dataOem, imageUrl, imageAlt }: MotionCardProps) {
  const reduced = useReducedMotion()
  return (
    <motion.div
      data-oem={dataOem}
      data-reveal
      whileHover={reduced ? undefined : { y: -4 }}
      transition={{ duration: 0.2, ease: EASE_SETTLE }}
      className={imageUrl ? `relative ${className}` : className}
    >
      {imageUrl && (
        <div className="pointer-events-none absolute inset-x-0 -top-6 flex justify-center px-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={imageAlt ?? ''}
            className="h-24 w-auto max-w-[80%] object-contain drop-shadow-[0_14px_12px_rgba(21,22,27,0.28)] sm:h-28"
          />
        </div>
      )}
      <div className={imageUrl ? 'pt-16' : undefined}>{children}</div>
    </motion.div>
  )
}
