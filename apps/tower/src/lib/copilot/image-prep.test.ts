import { describe, it, expect } from 'vitest'
import { base64Bytes, fitWithin, MAX_IMAGE_EDGE_PX } from './image-prep'

describe('fitWithin', () => {
  it('leaves an image that already fits untouched, and says so', () => {
    expect(fitWithin(800, 600)).toEqual({ width: 800, height: 600, scaled: false })
    expect(fitWithin(MAX_IMAGE_EDGE_PX, 900)).toEqual({ width: MAX_IMAGE_EDGE_PX, height: 900, scaled: false })
  })

  it('scales a tall phone screenshot by its LONGEST edge, keeping aspect ratio', () => {
    // A 1080×2400 capture — portrait, so height is the constrained edge.
    const out = fitWithin(1080, 2400)
    expect(out.scaled).toBe(true)
    expect(out.height).toBe(MAX_IMAGE_EDGE_PX)
    expect(out.width).toBe(720) // 1080 × (1600/2400)
    expect(out.width / out.height).toBeCloseTo(1080 / 2400, 3)
  })

  it('scales a landscape capture by its width', () => {
    const out = fitWithin(3840, 2160)
    expect(out).toEqual({ width: MAX_IMAGE_EDGE_PX, height: 900, scaled: true })
  })

  it('never upscales — that would add bytes and no detail', () => {
    expect(fitWithin(320, 200).scaled).toBe(false)
  })

  it('never yields a zero dimension (a 0-wide canvas throws)', () => {
    const out = fitWithin(20000, 1, 1600)
    expect(out.width).toBe(1600)
    expect(out.height).toBeGreaterThanOrEqual(1)
  })

  it('degrades safely on nonsense dimensions instead of throwing', () => {
    for (const [w, h] of [
      [0, 0],
      [-5, 100],
      [NaN, 100],
      [Infinity, 100],
    ]) {
      expect(() => fitWithin(w, h)).not.toThrow()
      expect(fitWithin(w, h).width).toBeGreaterThan(0)
    }
  })

  it('honours a caller-supplied edge', () => {
    expect(fitWithin(2000, 1000, 500)).toEqual({ width: 500, height: 250, scaled: true })
  })
})

describe('base64Bytes', () => {
  it('reports the DECODED size, accounting for padding', () => {
    // 'AAAA' → 3 bytes; 'AAA=' → 2; 'AA==' → 1.
    expect(base64Bytes('AAAA')).toBe(3)
    expect(base64Bytes('AAA=')).toBe(2)
    expect(base64Bytes('AA==')).toBe(1)
    expect(base64Bytes('')).toBe(0)
  })

  it('shows the 4/3 inflation that makes the payload ceilings bite', () => {
    // A 3 MB image is 4 MB on the wire — the reason the limits are aligned.
    expect(base64Bytes('A'.repeat(4_000_000))).toBe(3_000_000)
  })
})
