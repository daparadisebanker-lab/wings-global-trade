// src/lib/motion.ts
// Framer Motion variant objects — Phase 2A council-spec motion system.
// Easing signature: enter [0,0,0.2,1] · exit [0.4,0,1,1] · interaction [0.25,0.1,0.25,1]

import type { Variants, Transition } from 'framer-motion'

// ---------------------------------------------------------------------------
// Primary variants — Phase 2A (per ENRICHED_SPEC §5.3 + animator.md)
// ---------------------------------------------------------------------------

export const FADE_UP = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.0, 0.0, 0.2, 1.0] },
}

/** Slower FADE_UP for elements that should enter with deliberate weight (e.g. CIF reveal button). */
export const FADE_UP_SLOW: Variants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.0, 0.0, 0.2, 1.0] } },
}

export const FADE_IN = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.3, ease: [0.0, 0.0, 0.2, 1.0] },
}

export const SCROLL_REVEAL = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.5, ease: [0.0, 0.0, 0.2, 1.0] },
}

export const STAGGER_CONTAINER: Variants = {
  initial: {},
  animate: { transition: { staggerChildren: 0.08 } },
}

export const STAGGER_ITEM: Variants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.0, 0.0, 0.2, 1.0] } },
}

export const SLIDE_FROM_RIGHT = {
  initial: { opacity: 0, x: 32 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.4, ease: [0.0, 0.0, 0.2, 1.0] },
}

export const PAGE_ENTER = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.35, ease: [0.0, 0.0, 0.2, 1.0] },
}

/** TPR field gold dot — scale pulse on capture (Phase 2A Soul Layer). */
export const TPR_CAPTURE_DOT = {
  animate: { scale: [1, 1.4, 1] },
  transition: { duration: 0.25, ease: 'easeOut' },
}

/** TPR captured field value — fade in with slight delay after dot pulse. */
export const TPR_CAPTURE_VALUE = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.3, delay: 0.1 },
}

// ---------------------------------------------------------------------------
// Legacy aliases — kept so existing imports do not cause build failures.
// Re-pointed to enter curve [0,0,0.2,1] per ENRICHED_SPEC §5.3.
// ---------------------------------------------------------------------------

/** @deprecated use FADE_UP.transition instead */
export const FADE_UP_TRANSITION: Transition = { duration: 0.5, ease: [0.0, 0.0, 0.2, 1.0] }

/** @deprecated use FADE_IN.transition instead */
export const FADE_IN_TRANSITION: Transition = { duration: 0.3, ease: [0.0, 0.0, 0.2, 1.0] }

/** @deprecated use STAGGER_CONTAINER */
export const STAGGER_CONTAINER_FAST: Variants = {
  initial: {},
  animate: { transition: { staggerChildren: 0.06 } },
}

/** @deprecated use FADE_UP */
export const SLIDE_UP: Variants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.0, 0.0, 0.2, 1.0] } },
}

/** Mobile menu slide */
export const MENU_SLIDE: Variants = {
  initial: { y: '-100%' },
  animate: { y: 0, transition: { duration: 0.3, ease: [0.0, 0.0, 0.2, 1.0] } },
  exit: { y: '-100%', transition: { duration: 0.3, ease: [0.4, 0.0, 1.0, 1.0] } },
}

/** @deprecated use SCROLL_REVEAL.viewport */
export const VIEWPORT_ONCE = { once: true, amount: 0.2 }
