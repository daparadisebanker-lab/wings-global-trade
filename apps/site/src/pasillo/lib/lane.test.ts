// El Pasillo — the swipe rule under test.
// It decides whether a buyer's gesture collected a series or passed it, and
// synthetic pointer events cannot reach real flick speeds, so the rule is
// proved here rather than in a browser.

import { describe, expect, it } from 'vitest'
import { COMMIT_VELOCITY, FLICK_MIN_TRAVEL, judgeSwipe, springAtRatio } from './lane'

const D = 100
const swipe = (movementX: number, speedX: number, directionX = Math.sign(movementX)) =>
  judgeSwipe({ movementX, speedX, directionX, commitDistance: D })

describe('judgeSwipe', () => {
  it('collects on a deliberate drag right', () => {
    expect(swipe(140, 0.05)).toMatchObject({ action: 'collect', reason: 'distance' })
  })

  it('passes on a deliberate drag left', () => {
    expect(swipe(-140, 0.05)).toMatchObject({ action: 'pass', dir: -1 })
  })

  it('does nothing below both thresholds', () => {
    expect(swipe(60, 0.05)).toMatchObject({ action: 'none', reason: 'none' })
  })

  it('collects on a short fast flick that never reaches the line', () => {
    expect(swipe(50, 2.2)).toMatchObject({ action: 'collect', reason: 'flick' })
  })

  it('needs real speed, not just movement', () => {
    expect(swipe(50, COMMIT_VELOCITY - 0.01).action).toBe('none')
    expect(swipe(50, COMMIT_VELOCITY + 0.01).action).toBe('collect')
  })

  it('ignores speed on a travel too short to be intentional', () => {
    expect(swipe(FLICK_MIN_TRAVEL - 1, 5).action).toBe('none')
  })

  it('never collects a series the buyer flicked away', () => {
    // Pushed right, then whipped back left past the origin and released.
    // Collecting here would put something in the record against intent.
    const v = judgeSwipe({ movementX: -40, speedX: 3, directionX: -1, commitDistance: D })
    expect(v.action).toBe('pass')
    expect(v.dir).toBe(-1)
  })

  it('scales with the card, so the gesture means the same on any screen', () => {
    expect(judgeSwipe({ movementX: 120, speedX: 0.05, directionX: 1, commitDistance: 100 }).action)
      .toBe('collect')
    expect(judgeSwipe({ movementX: 120, speedX: 0.05, directionX: 1, commitDistance: 200 }).action)
      .toBe('none')
  })

  it('treats a negative reported speed as a magnitude', () => {
    expect(judgeSwipe({ movementX: 50, speedX: -2.2, directionX: 1, commitDistance: D }).action)
      .toBe('collect')
  })
})

describe('springAtRatio', () => {
  it('produces the requested damping ratio', () => {
    const s = springAtRatio(400, 0.8, 1)
    // critical damping for k=400, m=1 is 2√400 = 40; 0.8 of that is 32
    expect(s.damping).toBeCloseTo(32, 6)
  })

  it('is under-damped at 0.8, so it settles without sitting down slowly', () => {
    const s = springAtRatio(400, 0.8, 1)
    expect(s.damping).toBeLessThan(2 * Math.sqrt(s.stiffness * s.mass))
  })
})
