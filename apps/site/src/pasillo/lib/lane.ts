// El Pasillo — the lane's motion signature.
//
// This is a lane, not a deck. Nothing flies off it. A swipe left is a PASS: the
// series dims to --pas-dimmed, the lane advances, and the series stays in position,
// stays on the scrubber, and re-lights on scroll-back. A destructive skip would
// fight the edge scrubber directly — the aisle is finite and revisiting is the
// point.
//
// Rotation is capped low on purpose. Eleven degrees reads as a dating app;
// four degrees reads as a physical object being pushed aside.

import type { SpringConfig } from '@/pasillo/lib/spring'

/** Fraction of card width that commits a swipe. */
export const COMMIT_DISTANCE_RATIO = 0.25
/** px/ms — a flick above this commits regardless of distance. */
export const COMMIT_VELOCITY = 0.4
/** Below this travel a fast movement is a tap, not a flick. */
export const FLICK_MIN_TRAVEL = 24
/** Degrees at full commit. Physical, not playful. */
export const MAX_ROTATION_DEG = 4
/** How much of a vertical drag the card follows. */
export const VERTICAL_FOLLOW = 0.16
/** Drag progress at which the verdict wash starts and reaches full. */
export const WASH_IN = 0.14
export const WASH_FULL = 0.85

/**
 * Spring for the return home. The spec asks for damping ratio 0.8 —
 * pleasantly under-damped, settles without wobble. c = ratio × 2√(k·m).
 */
export function springAtRatio(stiffness: number, ratio: number, mass = 1): SpringConfig {
  return { stiffness, mass, damping: ratio * 2 * Math.sqrt(stiffness * mass) }
}

export const SETTLE_SPRING: SpringConfig = springAtRatio(420, 0.8)

/** The lane's travel between booths. Structural, so it moves decisively. */
export const ADVANCE_SPRING: SpringConfig = { stiffness: 260, damping: 30, mass: 1 }

export type SwipeAction = 'collect' | 'pass' | 'none'

export interface SwipeInput {
  movementX: number
  /** speed magnitude from the pointer layer, px/ms (never negative) */
  speedX: number
  directionX: number
  commitDistance: number
}

export interface SwipeVerdict {
  action: SwipeAction
  dir: 1 | -1
  reason: 'distance' | 'flick' | 'none'
}

/**
 * What a released swipe meant.
 *
 * Right collects the series as a folder with every SKU pre-checked. Left passes.
 * Direction always comes from the gesture itself, so a fast flick back to the
 * left can never collect a series just because the drag started rightwards —
 * collecting something a buyer pushed away is the one error this rule must
 * never make.
 *
 * Kept pure and away from the component because it decides what happens to a
 * buyer's choice, and because synthetic pointer events cannot reach real flick
 * speeds — the velocity path is only provable as a unit test.
 */
export function judgeSwipe({
  movementX,
  speedX,
  directionX,
  commitDistance,
}: SwipeInput): SwipeVerdict {
  const travelled = Math.abs(movementX)
  const dir: 1 | -1 = (directionX || Math.sign(movementX) || 1) > 0 ? 1 : -1
  const speed = Math.abs(speedX)

  const dragged = travelled > commitDistance
  const flicked = speed > COMMIT_VELOCITY && travelled > FLICK_MIN_TRAVEL

  if (!dragged && !flicked) return { action: 'none', dir, reason: 'none' }
  return {
    action: dir > 0 ? 'collect' : 'pass',
    dir,
    reason: dragged ? 'distance' : 'flick',
  }
}
