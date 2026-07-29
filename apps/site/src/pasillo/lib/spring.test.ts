// La Escalera — the deck's integrator under test.
// The swipe feel is the product at Rung 1. A spring that explodes on a dropped
// frame, or that never rests, is a broken card in a buyer's hand.

import { describe, expect, it } from 'vitest'
import { Spring, clamp, mapRange } from './spring'

const SETTLE = { stiffness: 460, damping: 38, mass: 1 }
const THROW = { stiffness: 130, damping: 21, mass: 0.9, restDelta: 2 }

/** Run a spring at a fixed frame rate until it rests, capped so a bug cannot hang. */
function settle(s: Spring, fps = 60, maxSeconds = 12) {
  const dt = 1 / fps
  let frames = 0
  while (s.step(dt) && frames < fps * maxSeconds) frames++
  return { frames, seconds: frames * dt }
}

describe('Spring', () => {
  it('starts at rest', () => {
    const s = new Spring(SETTLE, 0)
    expect(s.animating).toBe(false)
    expect(s.step(1 / 60)).toBe(false)
  })

  it('set() jumps without animating — direct manipulation is never sprung', () => {
    const s = new Spring(SETTLE, 0)
    s.set(120)
    expect(s.value).toBe(120)
    expect(s.velocity).toBe(0)
    expect(s.animating).toBe(false)
  })

  it('converges to its target and then rests exactly on it', () => {
    const s = new Spring(SETTLE, 200)
    s.to(0)
    const { seconds } = settle(s)
    expect(s.animating).toBe(false)
    expect(s.value).toBe(0)
    expect(seconds).toBeLessThan(2) // a card snapping home must feel immediate
  })

  it('carries injected velocity — THE ONE THING', () => {
    // Same target, same spring: the only difference is the throw speed. The
    // fast one must be measurably further along one frame later.
    const slow = new Spring(THROW, 0)
    const fast = new Spring(THROW, 0)
    slow.to(1000, 200)
    fast.to(1000, 3000)
    slow.step(1 / 60)
    fast.step(1 / 60)
    expect(fast.value).toBeGreaterThan(slow.value * 2)
  })

  it('a throw with velocity reaches its target sooner than one from rest', () => {
    const cold = new Spring(THROW, 0)
    const thrown = new Spring(THROW, 0)
    cold.to(900, 0)
    thrown.to(900, 2500)
    expect(settle(thrown).frames).toBeLessThan(settle(cold).frames)
  })

  it('velocity against the target still lands (a flick back home)', () => {
    const s = new Spring(SETTLE, 60)
    s.to(0, 900) // thrown the wrong way
    settle(s)
    expect(s.value).toBe(0)
    expect(s.animating).toBe(false)
  })

  it('is stable across dropped frames — the integrator does not explode', () => {
    // 8fps is worse than any real device; the fixed substep must absorb it.
    const janky = new Spring(SETTLE, 300)
    janky.to(0)
    let frames = 0
    while (janky.step(1 / 8) && frames < 400) {
      expect(Number.isFinite(janky.value)).toBe(true)
      expect(Math.abs(janky.value)).toBeLessThan(1000)
      frames++
    }
    expect(janky.value).toBe(0)
  })

  it('lands in the same place at 30fps as at 120fps', () => {
    const a = new Spring(SETTLE, 250)
    const b = new Spring(SETTLE, 250)
    a.to(0)
    b.to(0)
    settle(a, 30)
    settle(b, 120)
    expect(a.value).toBe(b.value)
  })

  it('ignores an absurd dt instead of teleporting', () => {
    // Tab wake: a multi-second dt must not fling the card across the room.
    const s = new Spring(SETTLE, 100)
    s.to(0)
    s.step(30)
    expect(Number.isFinite(s.value)).toBe(true)
    expect(Math.abs(s.value)).toBeLessThanOrEqual(100)
  })
})

describe('helpers', () => {
  it('clamps', () => {
    expect(clamp(-3, 0, 1)).toBe(0)
    expect(clamp(3, 0, 1)).toBe(1)
    expect(clamp(0.4, 0, 1)).toBe(0.4)
  })

  it('maps and clamps ranges', () => {
    expect(mapRange(0.5, 0, 1, 0, 100)).toBe(50)
    expect(mapRange(-5, 0, 1, 0, 100)).toBe(0)
    expect(mapRange(9, 0, 1, 0, 100)).toBe(100)
    expect(mapRange(5, 5, 5, 7, 9)).toBe(7) // degenerate range, no NaN
  })
})
