import { describe, it, expect } from 'vitest'
import { mapClientRow } from './clients-logic'

describe('mapClientRow', () => {
  it('flattens the brand join and keeps client fields', () => {
    const item = mapClientRow({
      id: 'a1',
      name: 'Distribuidora Lima',
      country: 'PE',
      region: 'Lima',
      score: 72,
      created_at: '2026-07-21T00:00:00Z',
      brands: { name: 'Wings' },
    })
    expect(item.name).toBe('Distribuidora Lima')
    expect(item.brandName).toBe('Wings')
    expect(item.country).toBe('PE')
    expect(item.score).toBe(72)
  })

  it('handles an array-shaped brand join and a string score', () => {
    const item = mapClientRow({
      id: 'a2',
      name: 'Andes Corp',
      country: null,
      region: null,
      score: '40',
      created_at: '2026-07-20T00:00:00Z',
      brands: [{ name: 'Wings' }],
    })
    expect(item.brandName).toBe('Wings')
    expect(item.score).toBe(40)
  })

  it('defaults score to 0 and brand to null when missing', () => {
    const item = mapClientRow({
      id: 'a3',
      name: 'No Brand SA',
      country: null,
      region: null,
      score: null,
      created_at: '2026-07-19T00:00:00Z',
      brands: null,
    })
    expect(item.brandName).toBeNull()
    expect(item.score).toBe(0)
  })
})
