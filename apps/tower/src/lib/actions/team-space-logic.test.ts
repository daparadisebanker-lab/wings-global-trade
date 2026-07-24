import { describe, expect, it } from 'vitest'
import {
  splitBodyMentions,
  normalizeMentionIds,
  excerpt,
  filterTeammates,
  mapNoteRow,
  mapMentionRow,
  type Teammate,
  type RawMentionRow,
} from './team-space-logic'

describe('splitBodyMentions', () => {
  it('splits @tokens out of the surrounding text', () => {
    expect(splitBodyMentions('hola @maria revisa esto')).toEqual([
      { text: 'hola ', mention: false },
      { text: '@maria', mention: true },
      { text: ' revisa esto', mention: false },
    ])
  })
  it('matches a mention at the start of the string', () => {
    expect(splitBodyMentions('@maria hola')).toEqual([
      { text: '@maria', mention: true },
      { text: ' hola', mention: false },
    ])
  })
  it('treats an email fragment (no boundary before @) as text', () => {
    expect(splitBodyMentions('correo a@b')).toEqual([{ text: 'correo a@b', mention: false }])
  })
  it('highlights only the boundary @token, not a trailing @remainder', () => {
    expect(splitBodyMentions('@maria@gmail.com')).toEqual([
      { text: '@maria', mention: true },
      { text: '@gmail.com', mention: false },
    ])
  })
  it('is empty for an empty body', () => {
    expect(splitBodyMentions('')).toEqual([])
  })
})

describe('normalizeMentionIds', () => {
  it('trims, drops blanks, dedupes, preserves order', () => {
    expect(normalizeMentionIds(['  a ', 'b', '', 'a', '   '])).toEqual(['a', 'b'])
  })
  it('caps at 20', () => {
    const ids = Array.from({ length: 30 }, (_, i) => `id${i}`)
    expect(normalizeMentionIds(ids)).toHaveLength(20)
  })
})

describe('excerpt', () => {
  it('collapses whitespace and passes short bodies through', () => {
    expect(excerpt('  hola   mundo ')).toBe('hola mundo')
  })
  it('truncates with an ellipsis past the max', () => {
    const out = excerpt('x'.repeat(200), 10)
    expect(out).toHaveLength(10)
    expect(out.endsWith('…')).toBe(true)
  })
  it('passes a body exactly at the max through untouched', () => {
    expect(excerpt('x'.repeat(10), 10)).toBe('x'.repeat(10))
  })
})

describe('filterTeammates', () => {
  const list: Teammate[] = [
    { id: '1', name: 'María Solís' },
    { id: '2', name: 'John Doe' },
  ]
  it('returns all for an empty query', () => {
    expect(filterTeammates(list, '  ')).toHaveLength(2)
  })
  it('matches diacritic- and case-insensitively on both sides', () => {
    expect(filterTeammates(list, 'MARÍA').map((t) => t.id)).toEqual(['1'])
    expect(filterTeammates(list, 'maria').map((t) => t.id)).toEqual(['1'])
    expect(filterTeammates(list, 'doe').map((t) => t.id)).toEqual(['2'])
  })
})

describe('mapNoteRow', () => {
  it('maps snake_case → camelCase', () => {
    expect(
      mapNoteRow({ id: 'n1', author_id: 'u1', author_name: 'María', body: 'hola', created_at: '2026-07-24T00:00:00Z' }),
    ).toEqual({ id: 'n1', authorId: 'u1', authorName: 'María', body: 'hola', createdAt: '2026-07-24T00:00:00Z' })
  })
})

describe('mapMentionRow', () => {
  const row = (over: Partial<RawMentionRow>): RawMentionRow => ({
    id: 'm1',
    read_at: null,
    created_at: '2026-07-24T00:00:00Z',
    team_notes: { id: 'n1', author_name: 'María', body: 'revisa esto' },
    ...over,
  })
  it('flattens the joined note and derives read from read_at', () => {
    expect(mapMentionRow(row({}))).toEqual({
      id: 'm1',
      noteId: 'n1',
      authorName: 'María',
      body: 'revisa esto',
      createdAt: '2026-07-24T00:00:00Z',
      read: false,
    })
    expect(mapMentionRow(row({ read_at: '2026-07-24T01:00:00Z' })).read).toBe(true)
  })
  it('unwraps an array-shaped joined note', () => {
    const m = mapMentionRow(row({ team_notes: [{ id: 'n9', author_name: 'Ana', body: 'x' }] }))
    expect(m.noteId).toBe('n9')
    expect(m.authorName).toBe('Ana')
  })
  it('tolerates a missing note join', () => {
    const m = mapMentionRow(row({ team_notes: null }))
    expect(m.noteId).toBe('')
    expect(m.authorName).toBe('')
  })
})
