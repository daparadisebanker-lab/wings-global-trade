// La Escalera · the deck's physics.
//
// Why this exists instead of a library: the deck is the one surface with a hard
// latency budget (LCP < 2s on 4G, spec §QA-4) and the one surface whose whole
// value is how it feels in the hand. A general animation library gives us
// neither the smallest bundle nor the tightest loop.
//
// What this buys, concretely:
//   · The deck route ships no animation library at all — the muestrario keeps
//     framer-motion for its reorder list, and the deck stops paying for it.
//   · Zero React renders during a drag. The gesture writes to springs; one rAF
//     loop writes `transform` straight onto the elements. React never sees a
//     frame, so a 60fps drag cannot be throttled by a reconcile.
//   · The integrator is ours, so the card's weight is a number we tune rather
//     than a preset we accept.
//
// The model is a damped harmonic oscillator integrated semi-implicitly at a
// fixed substep. Fixed substeps matter: a variable dt through an explicit
// integrator visibly changes the spring's character when frames drop, which is
// exactly when the buyer is most likely to notice.

export interface SpringConfig {
  stiffness: number
  damping: number
  mass: number
  /** distance from target below which the spring may rest */
  restDelta?: number
  /** speed below which the spring may rest */
  restSpeed?: number
}

/** Fixed integration substep — 1/240s. Stable well past a 30fps frame. */
const SUBSTEP = 1 / 240
/** Never integrate more than this much time in one frame (tab wake, long task). */
const MAX_FRAME = 0.064

export class Spring {
  value: number
  velocity = 0
  target: number
  /** false once the spring has settled — the loop can stop asking. */
  animating = false

  private stiffness: number
  private damping: number
  private mass: number
  private restDelta: number
  private restSpeed: number
  private carry = 0

  constructor(config: SpringConfig, initial = 0) {
    this.stiffness = config.stiffness
    this.damping = config.damping
    this.mass = config.mass
    this.restDelta = config.restDelta ?? 0.08
    this.restSpeed = config.restSpeed ?? 0.6
    this.value = initial
    this.target = initial
  }

  /** Jump. Used while the thumb is down — direct manipulation is never sprung. */
  set(value: number): void {
    this.value = value
    this.target = value
    this.velocity = 0
    this.animating = false
    this.carry = 0
  }

  /** Release. `velocity` is px/s and is what makes the throw carry. */
  to(target: number, velocity = this.velocity): void {
    this.target = target
    this.velocity = velocity
    this.animating = true
  }

  /** Advance by `dt` seconds. Returns true while still moving. */
  step(dt: number): boolean {
    if (!this.animating) return false

    this.carry += Math.min(dt, MAX_FRAME)
    while (this.carry >= SUBSTEP) {
      const force = -this.stiffness * (this.value - this.target) - this.damping * this.velocity
      this.velocity += (force / this.mass) * SUBSTEP
      this.value += this.velocity * SUBSTEP
      this.carry -= SUBSTEP
    }

    if (
      Math.abs(this.value - this.target) < this.restDelta &&
      Math.abs(this.velocity) < this.restSpeed
    ) {
      this.value = this.target
      this.velocity = 0
      this.animating = false
    }
    return this.animating
  }
}

/**
 * One shared rAF loop. Callbacks return true to stay subscribed; when none
 * remain the loop stops, so an idle deck costs the phone nothing.
 */
type FrameFn = (dt: number) => boolean

const subscribers = new Set<FrameFn>()
let rafId = 0
let lastTime = 0

function tick(now: number): void {
  const dt = (now - lastTime) / 1000
  lastTime = now
  for (const fn of Array.from(subscribers)) {
    if (!fn(dt)) subscribers.delete(fn)
  }
  rafId = subscribers.size > 0 ? requestAnimationFrame(tick) : 0
}

/** Run `fn` every frame until it returns false. Safe to call when already running. */
export function requestFrames(fn: FrameFn): () => void {
  subscribers.add(fn)
  if (!rafId) {
    lastTime = performance.now()
    rafId = requestAnimationFrame(tick)
  }
  return () => subscribers.delete(fn)
}

export const clamp = (v: number, lo: number, hi: number) => (v < lo ? lo : v > hi ? hi : v)

/** Linear map with clamping — the derived-value workhorse. */
export function mapRange(
  v: number,
  inLo: number,
  inHi: number,
  outLo: number,
  outHi: number,
): number {
  if (inHi === inLo) return outLo
  const t = clamp((v - inLo) / (inHi - inLo), 0, 1)
  return outLo + t * (outHi - outLo)
}
