// @wings/trade-ui — shared surface-card motion.
// Byte-identical extract of the constants the shared organs animate with
// (apps/site src/lib/mister/motion.ts). Values must stay identical to preserve
// animation behavior; do not "harmonize" against the Tier-1 eases here.
import type { Variants } from 'framer-motion'

const DURATION_DELIBERATE = 0.3
const EASE_SURFACE_SLIDE = [0.2, 0.0, 0.0, 1.0] as const

export const surfaceCardVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION_DELIBERATE, ease: [...EASE_SURFACE_SLIDE] },
  },
  visibleReduced: { opacity: 1, y: 0, transition: { duration: 0 } },
}
