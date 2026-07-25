// La Escalera · the motion signature.
//
// This file IS the deck's personality. Every number that decides how a card
// feels lives here and nowhere else, so the feel can be tuned in one place
// instead of being reverse-engineered out of five components.
//
// THE ONE THING: a card carries the velocity of the throw all the way off
// screen, and the stack behind rises to meet the thumb before the card lands.
// Everything below serves that. A card that leaves on a fixed 280ms tween is a
// div sliding. A card that leaves at the speed you threw it is a fired ceramic
// chip. That difference is the whole product at Rung 1.
//
// The physical model: a sample chip resting on a stack, pivoting around a point
// below its bottom edge — which is why the rotation origin sits below centre.
// Cards in the real world rotate about the hand holding them.
//
// Springs are described here as physical constants and integrated by
// lib/spring.ts. Purely decorative motion (the entrance, the counter tick, the
// toast) is CSS, in globals.css — it needs no runtime.

import type { SpringConfig } from '@/lib/spring'

// ── Commit thresholds ──────────────────────────────────────────────────────
// A throw commits on EITHER distance or speed. Distance alone punishes the fast
// flick a warehouse buyer actually uses; speed alone makes a slow, deliberate
// drag impossible to land.

/** Fraction of card width that counts as a committed drag. */
export const COMMIT_DISTANCE_RATIO = 0.26
/** px/ms — a flick above this commits regardless of how far it travelled. */
export const COMMIT_VELOCITY = 0.45
/** Minimum travel before a flick counts, so a tap can never fling a card. */
export const FLICK_MIN_TRAVEL = 24

// ── Geometry ───────────────────────────────────────────────────────────────

/** Degrees at full commit distance. Past ~12° a card reads as a falling leaf. */
export const MAX_ROTATION_DEG = 11
/** How far past the commit angle a card keeps turning while it flies. */
export const FLIGHT_ROTATION_MULTIPLIER = 1.7
/** How much of the vertical drag the card follows. Not 0 (dead), not 1 (loose). */
export const VERTICAL_FOLLOW = 0.22
/** Drag progress at which the verdict wash starts and reaches full strength. */
export const WASH_IN = 0.12
export const WASH_FULL = 0.9

// ── Springs ────────────────────────────────────────────────────────────────

/** Release without commit: the card snaps home. Fast, tight, no wobble. */
export const SETTLE_SPRING: SpringConfig = {
  stiffness: 460,
  damping: 38,
  mass: 1,
}

/**
 * The throw. Deliberately loose — low stiffness and light damping — so the
 * injected release velocity dominates the motion instead of being overwritten
 * by the spring. That is what makes the exit speed match the thumb.
 * A generous restDelta lets it finish as soon as the card is off screen.
 */
export const THROW_SPRING: SpringConfig = {
  stiffness: 130,
  damping: 21,
  mass: 0.9,
  restDelta: 2,
  restSpeed: 4,
}

/** px/s for a throw with no measured speed — a slow, deliberate drag past the line. */
export const FALLBACK_THROW_VELOCITY = 900
/** px/s for the buttons and the arrow keys. Decisive, never languid. */
export const KEYBOARD_THROW_VELOCITY = 1400

// ── The commit rule ────────────────────────────────────────────────────────
// Kept as a pure function, away from the component, for the same reason the
// carton rule is: it is product logic, it decides what happens to a buyer's
// choice, and it must be provable without a browser. Synthetic pointer events
// cannot reach real flick speeds, so this rule can only be trusted if it is
// unit-tested directly.

export interface ThrowInput {
  /** signed horizontal travel since the drag started, px */
  movementX: number
  /** speed magnitude as reported by the gesture layer, px/ms (never negative) */
  speedX: number
  /** −1, 0 or 1 — the gesture's own idea of which way the thumb was going */
  directionX: number
  /** the distance that counts as a committed drag for this card size */
  commitDistance: number
}

export interface ThrowVerdict {
  commit: boolean
  dir: 1 | -1
  /** signed px/s to hand to the spring — 0 when nothing was committed */
  velocity: number
  /** which rule fired, for tests and for reasoning about feel */
  reason: 'distance' | 'flick' | 'none'
}

/**
 * Decide what a released drag meant.
 *
 * A throw commits on EITHER distance or speed. Distance alone punishes the fast
 * flick a warehouse buyer actually uses; speed alone makes a slow, deliberate
 * drag impossible to land. Direction always comes from the gesture, so a fast
 * flick back to the left can never commit a card to the right just because the
 * drag happened to start that way.
 */
export function judgeThrow({
  movementX,
  speedX,
  directionX,
  commitDistance,
}: ThrowInput): ThrowVerdict {
  const travelled = Math.abs(movementX)
  const dir: 1 | -1 = (directionX || Math.sign(movementX) || 1) > 0 ? 1 : -1
  const speed = Math.abs(speedX)

  const dragged = travelled > commitDistance
  const flicked = speed > COMMIT_VELOCITY && travelled > FLICK_MIN_TRAVEL

  if (!dragged && !flicked) return { commit: false, dir, velocity: 0, reason: 'none' }

  // px/ms → px/s, signed by the gesture's direction.
  const measured = dir * speed * 1000
  return {
    commit: true,
    dir,
    velocity: measured || dir * FALLBACK_THROW_VELOCITY,
    reason: dragged ? 'distance' : 'flick',
  }
}

// ── Stack depth ────────────────────────────────────────────────────────────
// Three cards mounted, never more: two visible tiers plus the live one. Depth
// is scale + offset only — no blur, no animated shadow, nothing that forces a
// repaint mid-drag.

/** Resting scale of the cards behind, nearest first. */
export const STACK_SCALE = [0.955, 0.915] as const
/** Resting y offset (px) of the cards behind, nearest first. */
export const STACK_OFFSET_Y = [14, 26] as const
/** Where each tier travels as the live card is dragged clear. */
export const STACK_SCALE_ADVANCED = [0.99, 0.95] as const
export const STACK_OFFSET_Y_ADVANCED = [5, 16] as const

// ── Haptics ────────────────────────────────────────────────────────────────
// The tactile channel. A phone in a warehouse is held, not listened to — this
// is why the deck has haptics and no audio. Patterns are distinct enough to be
// told apart through a glove, short enough never to buzz.

const PATTERNS = {
  /** Kept — a double tick, the "it landed" confirmation. */
  commit: [7, 22, 11],
  /** Skipped — one soft tick, deliberately lighter than a keep. */
  skip: 4,
  /** Restored — reversed rhythm, so undo feels like the opposite of a keep. */
  undo: [11, 22, 7],
} as const

export function haptic(kind: keyof typeof PATTERNS): void {
  if (typeof navigator === 'undefined' || !('vibrate' in navigator)) return
  try {
    navigator.vibrate(PATTERNS[kind] as number | number[])
  } catch {
    /* Vibration is a nicety. It never blocks a swipe. */
  }
}
