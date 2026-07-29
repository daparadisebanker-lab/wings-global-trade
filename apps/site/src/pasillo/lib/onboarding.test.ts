// The teaching layer's contract. A tour that re-shows itself, forgets an
// outcome, or ships eight steps is the failure mode; these hold the shape.

import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  AISLE_TOUR,
  readTour,
  replayTour,
  writeTour,
} from '@/pasillo/lib/onboarding'

const store = new Map<string, string>()
beforeEach(() => {
  store.clear()
  vi.stubGlobal('localStorage', {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
  })
})


describe('the tour itself', () => {
  it('stays within the mobile ceiling of three steps', () => {
    // This catalogue is thumb-first at 390px. The hard ceiling is 3 on mobile;
    // a fourth step is a decision to re-open, not a line to add.
    expect(AISLE_TOUR.steps.length).toBeLessThanOrEqual(3)
  })

  it('opens on the task, never on a welcome', () => {
    expect(AISLE_TOUR.steps[0].title).not.toMatch(/bienvenid|hola|welcome/i)
  })

  it('keeps every step within budget and anchored to something', () => {
    for (const s of AISLE_TOUR.steps) {
      expect(s.title.split(/\s+/).length, s.id).toBeLessThanOrEqual(6)
      expect(s.body.split(/\s+/).length, s.id).toBeLessThanOrEqual(25)
      expect(s.target, s.id).toBeTruthy()
    }
  })
})

describe('persistence', () => {
  it('records the OUTCOME and where they left, not merely that it ran', () => {
    writeTour(AISLE_TOUR.id, AISLE_TOUR.version, 'skipped', 1)
    expect(readTour(AISLE_TOUR.id, AISLE_TOUR.version)).toMatchObject({
      status: 'skipped',
      lastStep: 1,
    })
  })

  it('keys by version, so a bump re-shows and an unrelated release does not', () => {
    writeTour(AISLE_TOUR.id, 1, 'completed', 2)
    expect(readTour(AISLE_TOUR.id, 1)).not.toBeNull()
    expect(readTour(AISLE_TOUR.id, 2)).toBeNull()
  })

  it('replays by clearing the record', () => {
    writeTour(AISLE_TOUR.id, AISLE_TOUR.version, 'completed', 2)
    replayTour(AISLE_TOUR.id, AISLE_TOUR.version)
    expect(readTour(AISLE_TOUR.id, AISLE_TOUR.version)).toBeNull()
  })

  it('survives blocked storage rather than throwing into the aisle', () => {
    vi.stubGlobal('localStorage', {
      getItem: () => { throw new Error('blocked') },
      setItem: () => { throw new Error('blocked') },
      removeItem: () => { throw new Error('blocked') },
    })
    expect(() => writeTour('x', 1, 'completed', 0)).not.toThrow()
    expect(readTour('x', 1)).toBeNull()
  })
})
