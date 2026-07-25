// La Escalera — what a released drag meant.
//
// This rule decides whether a buyer's swipe kept a tile or discarded it, so it
// is tested here rather than only in a browser: synthetic pointer events cannot
// reach the speeds a real thumb produces (a CDP-driven mouse tops out near the
// flick threshold), which means the velocity path is unprovable end-to-end.
// The pure function is provable, and the component does nothing but call it.

import { describe, expect, it } from 'vitest'
import { COMMIT_VELOCITY, FALLBACK_THROW_VELOCITY, FLICK_MIN_TRAVEL, judgeThrow } from './motion'

/** A 388px-wide card on a 420px phone. */
const COMMIT_DISTANCE = 101

const judge = (movementX: number, speedX: number, directionX = Math.sign(movementX)) =>
  judgeThrow({ movementX, speedX, directionX, commitDistance: COMMIT_DISTANCE })

describe('judgeThrow — distance', () => {
  it('commits a slow drag past the line', () => {
    const v = judge(150, 0.05)
    expect(v.commit).toBe(true)
    expect(v.reason).toBe('distance')
    expect(v.dir).toBe(1)
  })

  it('does not commit a slow drag short of the line', () => {
    const v = judge(70, 0.05)
    expect(v.commit).toBe(false)
    expect(v.reason).toBe('none')
    expect(v.velocity).toBe(0)
  })

  it('is symmetrical to the left', () => {
    expect(judge(-150, 0.05).commit).toBe(true)
    expect(judge(-150, 0.05).dir).toBe(-1)
  })
})

describe('judgeThrow — the flick', () => {
  it('commits a short fast flick that never reaches the line', () => {
    // The warehouse gesture: 60px, gone in a blink.
    const v = judge(60, 2.4)
    expect(v.commit).toBe(true)
    expect(v.reason).toBe('flick')
    expect(v.velocity).toBe(2400) // px/ms → px/s
  })

  it('ignores speed on a travel too short to be intentional', () => {
    const v = judge(FLICK_MIN_TRAVEL - 1, 5)
    expect(v.commit).toBe(false)
  })

  it('needs real speed, not just movement', () => {
    expect(judge(60, COMMIT_VELOCITY - 0.01).commit).toBe(false)
    expect(judge(60, COMMIT_VELOCITY + 0.01).commit).toBe(true)
  })

  it('a fast flick LEFT never commits right, whichever way the drag began', () => {
    // Thumb pushed right, then whipped back left past the origin and released.
    const v = judgeThrow({
      movementX: -40,
      speedX: 3,
      directionX: -1,
      commitDistance: COMMIT_DISTANCE,
    })
    expect(v.commit).toBe(true)
    expect(v.dir).toBe(-1)
    expect(v.velocity).toBeLessThan(0)
  })
})

describe('judgeThrow — the velocity handed to the spring', () => {
  it('is signed by direction, so the card leaves the way it was thrown', () => {
    expect(judge(200, 1.2).velocity).toBeGreaterThan(0)
    expect(judge(-200, 1.2).velocity).toBeLessThan(0)
  })

  it('is the measured speed, not a constant — THE ONE THING', () => {
    const gentle = judge(200, 0.6)
    const hard = judge(200, 3.1)
    expect(hard.velocity).toBeGreaterThan(gentle.velocity * 4)
  })

  it('falls back to a usable speed when the drag was committed but motionless', () => {
    // Dragged past the line and held still before releasing: speed reads ~0,
    // but the card must still leave rather than hang off the edge.
    const v = judge(160, 0)
    expect(v.commit).toBe(true)
    expect(v.velocity).toBe(FALLBACK_THROW_VELOCITY)
  })

  it('falls back leftward too', () => {
    expect(judge(-160, 0).velocity).toBe(-FALLBACK_THROW_VELOCITY)
  })
})

describe('judgeThrow — degenerate input', () => {
  it('never returns a zero direction', () => {
    const v = judgeThrow({ movementX: 0, speedX: 0, directionX: 0, commitDistance: COMMIT_DISTANCE })
    expect([1, -1]).toContain(v.dir)
    expect(v.commit).toBe(false)
  })

  it('treats a negative reported speed as a magnitude', () => {
    // Defensive: the gesture layer reports magnitudes, but the rule must not
    // silently invert if that ever changes.
    const v = judgeThrow({
      movementX: 60,
      speedX: -2.4,
      directionX: 1,
      commitDistance: COMMIT_DISTANCE,
    })
    expect(v.commit).toBe(true)
    expect(v.velocity).toBe(2400)
  })

  it('scales with the card: the same swipe on a tablet may not commit', () => {
    const phone = judgeThrow({ movementX: 120, speedX: 0.05, directionX: 1, commitDistance: 101 })
    const tablet = judgeThrow({ movementX: 120, speedX: 0.05, directionX: 1, commitDistance: 210 })
    expect(phone.commit).toBe(true)
    expect(tablet.commit).toBe(false)
  })
})
