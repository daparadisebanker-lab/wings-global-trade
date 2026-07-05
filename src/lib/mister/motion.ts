// src/lib/mister/motion.ts
// Mister Motion System — Animator Contribution, June 2026
// Every animation constant, easing value, and variant object in this file.
// Components import from here only. No inline animation values.
// Source: spec/contributions/animator.md §13

import type { Variants, Transition } from 'framer-motion'

// ─── Duration Scale ──────────────────────────────────────────────────────────

export const DURATION = {
  instant:    0.080,
  micro:      0.120,
  quick:      0.160,
  standard:   0.220,
  deliberate: 0.300,
  window:     0.380,
  waterfall:  0.480,
  stagger:    0.040,
} as const

// ─── Easing Signature ────────────────────────────────────────────────────────

export const EASE = {
  messageAppear:     [0.20, 0.00, 0.00, 1.00] as const,
  quickAction:       [0.16, 1.00, 0.30, 1.00] as const,
  windowOpen:        [0.22, 1.00, 0.36, 1.00] as const,
  windowClose:       [0.55, 0.00, 1.00, 0.45] as const,
  surfaceSlide:      [0.20, 0.00, 0.00, 1.00] as const,
  typingIndicator:   [0.45, 0.05, 0.55, 0.95] as const,
  streamingText:     [0.00, 0.00, 0.20, 1.00] as const,
} as const

// ─── Launcher ────────────────────────────────────────────────────────────────

export const launcherVariants: Variants = {
  hidden:        { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.deliberate, ease: [...EASE.messageAppear], delay: 0.8 },
  },
  visibleReduced: { opacity: 1, y: 0, transition: { duration: 0 } },
}

// ─── Window — Floating ───────────────────────────────────────────────────────

export const windowFloatingVariants: Variants = {
  closed:        { opacity: 0, y: 20, pointerEvents: 'none' as const },
  open: {
    opacity: 1,
    y: 0,
    pointerEvents: 'auto' as const,
    transition: { duration: DURATION.window, ease: [...EASE.windowOpen] },
  },
  openReduced:   { opacity: 1, y: 0, pointerEvents: 'auto' as const, transition: { duration: DURATION.instant } },
  closedReduced: { opacity: 0, y: 0, pointerEvents: 'none' as const, transition: { duration: DURATION.instant } },
  exit: {
    opacity: 0,
    y: 16,
    transition: { duration: DURATION.window, ease: [...EASE.windowClose] },
  },
  exitReduced:   { opacity: 0, y: 0, transition: { duration: DURATION.instant } },
}

// ─── Fullscreen Overlay ──────────────────────────────────────────────────────

export const overlayBackdropVariants: Variants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: DURATION.deliberate, ease: 'easeOut' } },
  exit:    { opacity: 0, transition: { duration: DURATION.standard,   ease: 'easeIn'  } },
}

export const overlayPanelVariants: Variants = {
  hidden:  { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.window, ease: [...EASE.windowOpen] },
  },
  exit: {
    opacity: 0,
    y: 16,
    transition: { duration: DURATION.standard, ease: [...EASE.windowClose] },
  },
  hiddenReduced:  { opacity: 0, y: 0 },
  visibleReduced: { opacity: 1, y: 0, transition: { duration: DURATION.instant } },
  exitReduced:    { opacity: 0, y: 0, transition: { duration: DURATION.instant } },
}

// ─── Mobile Progress Brief (bottom sheet) ────────────────────────────────────
// Backdrop reuses overlayBackdropVariants (opacity-only fades are exempt from
// reduced-motion, matching the fullscreen overlay's own precedent).

export const mobileBriefSheetVariants: Variants = {
  hidden:  { y: '100%' },
  visible: {
    y: 0,
    transition: { duration: DURATION.window, ease: [...EASE.windowOpen] },
  },
  exit: {
    y: '100%',
    transition: { duration: DURATION.standard, ease: [...EASE.windowClose] },
  },
  hiddenReduced:  { y: 0 },
  visibleReduced: { y: 0, transition: { duration: DURATION.instant } },
  exitReduced:    { y: 0, transition: { duration: DURATION.instant } },
}

// ─── Window — Embedded ───────────────────────────────────────────────────────

export const windowEmbeddedVariants: Variants = {
  collapsed:       { opacity: 0, scaleY: 0.96 },
  expanded: {
    opacity: 1,
    scaleY: 1,
    transition: { duration: DURATION.deliberate, ease: [...EASE.messageAppear] },
  },
  expandedReduced: { opacity: 1, scaleY: 1, transition: { duration: DURATION.instant } },
}

// ─── Messages ─────────────────────────────────────────────────────────────────

export const userMessageVariants: Variants = {
  hidden:        { opacity: 0, y: 6 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.standard, ease: [...EASE.messageAppear] },
  },
  visibleReduced: { opacity: 1, y: 0, transition: { duration: 0 } },
}

export const assistantMessageVariants: Variants = {
  hidden:        { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.deliberate, ease: [...EASE.messageAppear] },
  },
  visibleReduced: { opacity: 1, y: 0, transition: { duration: 0 } },
}

// ─── Streaming Container ──────────────────────────────────────────────────────

export const streamingContainerVariants: Variants = {
  hidden:          { opacity: 0, y: 8 },
  streaming: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.standard, ease: [...EASE.streamingText] },
  },
  streamingReduced: { opacity: 1, y: 0, transition: { duration: 0 } },
}

// ─── Quick Actions ────────────────────────────────────────────────────────────

export const quickActionsContainerVariants: Variants = {
  hidden:          { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: DURATION.stagger, delayChildren: 0.06 },
  },
  visibleReduced: { opacity: 1, transition: { staggerChildren: 0, delayChildren: 0 } },
  exit: {
    opacity: 0,
    y: -4,
    transition: { duration: DURATION.quick, ease: [...EASE.windowClose] },
  },
  exitReduced:     { opacity: 0, transition: { duration: DURATION.instant } },
}

export const quickActionItemVariants: Variants = {
  hidden:          { opacity: 0, y: 4 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.standard, ease: [...EASE.quickAction] },
  },
  visibleReduced:  { opacity: 1, y: 0, transition: { duration: 0 } },
}

export const quickActionTapTransition: Transition = {
  duration: DURATION.quick,
  ease: [...EASE.windowClose],
}

// ─── Surface Cards ────────────────────────────────────────────────────────────

export const surfaceCardVariants: Variants = {
  hidden:          { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.deliberate, ease: [...EASE.surfaceSlide] },
  },
  visibleReduced:  { opacity: 1, y: 0, transition: { duration: 0 } },
}

// ─── LandedCostWaterfall ──────────────────────────────────────────────────────

// Returns per-segment variants with staggered delay baked in.
// index: 0=product, 1=freight, 2=insurance, 3=duties, 4=lastmile
export function getWaterfallStripSegmentVariants(index: number): Variants {
  const OVERLAP = 0.55
  return {
    hidden:         { scaleX: 0, opacity: 0 },
    visible: {
      scaleX: 1,
      opacity: 1,
      transition: {
        duration: DURATION.waterfall,
        ease: [...EASE.surfaceSlide],
        delay: index * DURATION.waterfall * OVERLAP,
      },
    },
    visibleReduced: { scaleX: 1, opacity: 1, transition: { duration: 0 } },
  }
}

export const waterfallTableContainerVariants: Variants = {
  hidden:          { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: DURATION.waterfall * 0.55,
      delayChildren: DURATION.waterfall * 0.25,
    },
  },
  visibleReduced:  { opacity: 1, transition: { staggerChildren: 0, delayChildren: 0 } },
}

export const waterfallTableRowVariants: Variants = {
  hidden:          { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.deliberate, ease: [...EASE.messageAppear] },
  },
  visibleReduced:  { opacity: 1, y: 0, transition: { duration: 0 } },
}

export const waterfallTotalVariants: Variants = {
  hidden:          { opacity: 0, y: 4 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: DURATION.standard,
      ease: [...EASE.messageAppear],
      delay: DURATION.waterfall * 0.55 * 5 + 0.1,
    },
  },
  visibleReduced:  { opacity: 1, y: 0, transition: { duration: 0 } },
}

// Duties segment: one opacity pulse after its strip bar arrives (~1.3s)
// Apply to a motion.div wrapper around the duties segment fill only.
export const waterfallDutiesPulse = {
  animate: { opacity: [0.08, 0.20, 0.08] as number[] },
  transition: {
    duration: 0.60,
    ease: [...EASE.typingIndicator],
    delay: 1.30,
    times: [0, 0.5, 1],
    repeat: 0,
  } satisfies Transition,
}
