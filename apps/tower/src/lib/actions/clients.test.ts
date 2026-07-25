import { describe, it, expect } from 'vitest'
import {
  mapClientRow,
  pickPrimaryContact,
  sourceLabel,
  stageLabel,
  archetypeLabel,
  groupClientsByStage,
  type ClientListItem,
  type RawClientRow,
} from './clients-logic'

const base: RawClientRow = {
  id: 'a1',
  name: 'Distribuidora Lima',
  country: 'PE',
  region: 'Lima',
  city: 'Lima',
  source: 'referral',
  category: 'Molduras',
  archetype_profile: 'PROJECT',
  demand: '2 contenedores/mes',
  stage: 'negotiating',
  currency: 'USD',
  owner_id: 'u9',
  notes: null,
  score: 72,
  media: [{ path: 'u1/f1.jpg', kind: 'image', name: 'foto.jpg' }],
  created_at: '2026-07-21T00:00:00Z',
  brands: { name: 'Wings' },
  contacts: [{ full_name: 'Renata Revol', whatsapp: '+591 68173247', email: null, role: 'Compras', is_primary: true }],
}

describe('mapClientRow', () => {
  it('flattens brand + primary contact and keeps the CRM profile', () => {
    const item = mapClientRow(base)
    expect(item.name).toBe('Distribuidora Lima')
    expect(item.brandName).toBe('Wings')
    expect(item.source).toBe('referral')
    expect(item.category).toBe('Molduras')
    expect(item.archetype).toBe('PROJECT')
    expect(item.stage).toBe('negotiating')
    expect(item.city).toBe('Lima')
    expect(item.currency).toBe('USD')
    expect(item.ownerId).toBe('u9')
    expect(item.score).toBe(72)
    expect(item.primaryContact).toEqual({
      name: 'Renata Revol',
      whatsapp: '+591 68173247',
      email: null,
      role: 'Compras',
    })
    expect(item.media).toEqual([{ path: 'u1/f1.jpg', kind: 'image', name: 'foto.jpg' }])
  })

  it('array-shaped brand join, string score, and picks the primary among many contacts', () => {
    const item = mapClientRow({
      ...base,
      score: '40',
      brands: [{ name: 'Wings' }],
      contacts: [
        { full_name: 'Assistant', whatsapp: null, email: null, role: null, is_primary: false },
        { full_name: 'Jefe', whatsapp: '+1', email: 'j@x.co', role: 'CEO', is_primary: true },
      ],
    })
    expect(item.brandName).toBe('Wings')
    expect(item.score).toBe(40)
    expect(item.primaryContact?.name).toBe('Jefe')
  })

  it('defaults: score 0, stage lead, currency USD, brand/contact null; invalid enums drop to null', () => {
    const item = mapClientRow({
      ...base,
      score: null,
      stage: null,
      currency: null,
      source: 'garbage',
      archetype_profile: 'NOPE',
      brands: null,
      contacts: null,
    })
    expect(item.score).toBe(0)
    expect(item.stage).toBe('lead')
    expect(item.currency).toBe('USD')
    expect(item.source).toBeNull()
    expect(item.archetype).toBeNull()
    expect(item.brandName).toBeNull()
    expect(item.primaryContact).toBeNull()
  })
})

describe('pickPrimaryContact', () => {
  it('returns null when there is no primary or no contacts', () => {
    expect(pickPrimaryContact(null)).toBeNull()
    expect(pickPrimaryContact([])).toBeNull()
    expect(
      pickPrimaryContact([{ full_name: 'X', whatsapp: null, email: null, role: null, is_primary: false }]),
    ).toBeNull()
  })
  it('accepts a single (non-array) primary object', () => {
    expect(
      pickPrimaryContact({ full_name: 'Solo', whatsapp: null, email: null, role: null, is_primary: true }),
    ).toEqual({ name: 'Solo', whatsapp: null, email: null, role: null })
  })
})

describe('label helpers', () => {
  it('resolve ES/EN and fall back to the raw id for unknowns', () => {
    expect(sourceLabel('trade_fair', 'es')).toBe('Feria')
    expect(sourceLabel('trade_fair', 'en')).toBe('Trade fair')
    expect(stageLabel('won', 'es')).toBe('Ganado')
    expect(archetypeLabel('ALLOCATION', 'es')).toBe('Asignación')
    expect(sourceLabel(null, 'es')).toBeNull()
    expect(stageLabel('mystery', 'en')).toBe('mystery')
  })
})

describe('groupClientsByStage', () => {
  const mk = (id: string, stage: ClientListItem['stage']): ClientListItem => ({
    id,
    name: id,
    brandName: null,
    source: null,
    category: null,
    archetype: null,
    demand: null,
    stage,
    country: null,
    region: null,
    city: null,
    currency: 'USD',
    ownerId: null,
    notes: null,
    score: 0,
    primaryContact: null,
    media: [],
    createdAt: '2026-07-25T00:00:00Z',
  })

  it('returns all 6 stage columns in fixed order, even when empty', () => {
    const cols = groupClientsByStage([mk('a', 'lead'), mk('b', 'won'), mk('c', 'lead')])
    expect(cols.map((c) => c.stage)).toEqual(['lead', 'qualified', 'quoted', 'negotiating', 'won', 'dormant'])
    expect(cols[0].items.map((i) => i.id)).toEqual(['a', 'c'])
    expect(cols[4].items.map((i) => i.id)).toEqual(['b'])
    expect(cols[1].items).toEqual([])
  })
})
