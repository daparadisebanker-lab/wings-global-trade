import { describe, expect, it } from 'vitest'
import {
  whatsappDigits,
  isReachable,
  mapRecipientRow,
  toRecipients,
  filterRecipients,
  personalizedShareText,
  type RawContactRow,
  type ShareRecipient,
} from './share-recipients-logic'

const row = (over: Partial<RawContactRow>): RawContactRow => ({
  id: 'c1',
  full_name: 'María Solís',
  whatsapp: '+51 987 654 321',
  accounts: { name: 'Distribuidora Andina', brands: { name: 'Áladín' } },
  ...over,
})

describe('whatsappDigits / isReachable', () => {
  it('strips +, spaces, dashes and parens to digits', () => {
    expect(whatsappDigits('+51 (987) 654-321')).toBe('51987654321')
    expect(whatsappDigits(null)).toBe('')
    expect(whatsappDigits(undefined)).toBe('')
  })
  it('treats < 8 digits as unreachable junk', () => {
    expect(isReachable('123')).toBe(false)
    expect(isReachable('n/a')).toBe(false)
    expect(isReachable('')).toBe(false)
    expect(isReachable(null)).toBe(false)
    expect(isReachable('+51 987 654 321')).toBe(true)
  })
})

describe('mapRecipientRow', () => {
  it('maps a joined row, unwrapping object nested relations', () => {
    expect(mapRecipientRow(row({}))).toEqual({
      id: 'c1',
      contactName: 'María Solís',
      accountName: 'Distribuidora Andina',
      brandName: 'Áladín',
      whatsapp: '+51 987 654 321',
    })
  })
  it('unwraps array-shaped nested relations too', () => {
    const m = mapRecipientRow(row({ accounts: [{ name: 'Andina', brands: [{ name: 'Áladín' }] }] }))
    expect(m?.accountName).toBe('Andina')
    expect(m?.brandName).toBe('Áladín')
  })
  it('drops a contact with no reachable WhatsApp', () => {
    expect(mapRecipientRow(row({ whatsapp: null }))).toBeNull()
    expect(mapRecipientRow(row({ whatsapp: '12' }))).toBeNull()
  })
  it('drops a contact with no account name (unidentifiable option)', () => {
    expect(mapRecipientRow(row({ accounts: { name: null, brands: null } }))).toBeNull()
  })
  it('falls back to the account name when the contact has no full name', () => {
    const m = mapRecipientRow(row({ full_name: null }))
    expect(m?.contactName).toBe('Distribuidora Andina')
  })
  it('tolerates a missing brand', () => {
    const m = mapRecipientRow(row({ accounts: { name: 'Andina', brands: null } }))
    expect(m?.brandName).toBeNull()
  })
})

describe('toRecipients', () => {
  it('maps, drops unreachable, and sorts by account then contact', () => {
    const out = toRecipients([
      row({ id: 'a', full_name: 'Zoe', accounts: { name: 'Beta', brands: null } }),
      row({ id: 'b', full_name: 'Ana', accounts: { name: 'Alfa', brands: null } }),
      row({ id: 'c', full_name: 'Bob', accounts: { name: 'Alfa', brands: null } }),
      row({ id: 'd', whatsapp: null }), // dropped
    ])
    expect(out.map((r) => r.id)).toEqual(['b', 'c', 'a']) // Alfa/Ana, Alfa/Bob, Beta/Zoe
  })
})

describe('filterRecipients', () => {
  const list: ShareRecipient[] = [
    { id: '1', contactName: 'María Solís', accountName: 'Distribuidora Andina', brandName: null, whatsapp: '51999999999' },
    { id: '2', contactName: 'John Doe', accountName: 'Pacific Foods', brandName: null, whatsapp: '51888888888' },
  ]
  it('returns the list unchanged for an empty query', () => {
    expect(filterRecipients(list, '   ')).toHaveLength(2)
  })
  it('matches account or contact name, diacritic- and case-insensitive', () => {
    expect(filterRecipients(list, 'andina').map((r) => r.id)).toEqual(['1'])
    expect(filterRecipients(list, 'MARIA').map((r) => r.id)).toEqual(['1']) // María ~ MARIA
    expect(filterRecipients(list, 'pacific').map((r) => r.id)).toEqual(['2'])
  })
})

describe('personalizedShareText', () => {
  it('prefixes a first-name greeting in the active locale', () => {
    expect(personalizedShareText('Oferta de contenedor', 'María Solís', 'es')).toBe('Hola María,\n\nOferta de contenedor')
    expect(personalizedShareText('Container offer', 'John Doe', 'en')).toBe('Hi John,\n\nContainer offer')
  })
  it('leaves the base text untouched when there is no name', () => {
    expect(personalizedShareText('Oferta', null, 'es')).toBe('Oferta')
    expect(personalizedShareText('Oferta', '   ', 'es')).toBe('Oferta')
  })
})
