import { describe, it, expect } from 'vitest'
import {
  deserializeThread,
  loadThread,
  saveThread,
  serializeThread,
  threadStorageKey,
  MAX_STORED_BYTES,
  MAX_STORED_TURNS,
  THREAD_STORE_VERSION,
  THREAD_TTL_MS,
  type MisterMsg,
} from './thread-store'

const NOW = 1_800_000_000_000

const THREAD: MisterMsg[] = [
  { who: 'op', text: 'Lee esta captura' },
  { who: 'mi', result: { renderer: 'supplier-extract', note: 'Retroexcavadora', data: { unitPrice: 25000 } } },
  { who: 'op', text: 'El precio es 25,000' },
]

/** An in-memory Storage — the store takes one, so no browser is needed. */
function memoryStorage(): Storage & { failOnWrite?: boolean } {
  const map = new Map<string, string>()
  return {
    get length() {
      return map.size
    },
    clear: () => map.clear(),
    key: (i: number) => Array.from(map.keys())[i] ?? null,
    getItem: (k: string) => map.get(k) ?? null,
    setItem(this: { failOnWrite?: boolean }, k: string, v: string) {
      if (this.failOnWrite) throw new DOMException('QuotaExceededError')
      map.set(k, v)
    },
    removeItem: (k: string) => void map.delete(k),
  } as Storage & { failOnWrite?: boolean }
}

describe('threadStorageKey', () => {
  it('gives each operator their own slot', () => {
    expect(threadStorageKey('ana@wings.pe')).not.toBe(threadStorageKey('luis@wings.pe'))
    expect(threadStorageKey(null)).not.toBe(threadStorageKey('ana@wings.pe'))
  })

  it('is stable across case and surrounding whitespace', () => {
    expect(threadStorageKey(' Ana@Wings.PE ')).toBe(threadStorageKey('ana@wings.pe'))
  })

  it('does not put the address itself in the key', () => {
    expect(threadStorageKey('ana@wings.pe')).not.toContain('ana@wings.pe')
  })
})

describe('serializeThread / deserializeThread', () => {
  it('round-trips a conversation', () => {
    expect(deserializeThread(serializeThread(THREAD, NOW), NOW)).toEqual(THREAD)
  })

  it('drops the pasted screenshot dataURL, keeping the turn as its marker', () => {
    const withImage: MisterMsg[] = [{ who: 'op', text: '', image: 'data:image/png;base64,AAAA' }]
    const out = deserializeThread(serializeThread(withImage, NOW), NOW)
    expect(out).toEqual([{ who: 'op', text: '[captura adjunta]' }])
    expect(serializeThread(withImage, NOW)).not.toContain('base64')
  })

  it('returns null when there is nothing worth storing', () => {
    expect(serializeThread([], NOW)).toBeNull()
    expect(serializeThread([{ who: 'op', text: '   ' }], NOW)).toBeNull()
  })

  it('keeps only the newest turns', () => {
    const long: MisterMsg[] = Array.from({ length: MAX_STORED_TURNS + 10 }, (_, i) => ({ who: 'op', text: `t${i}` }))
    const out = deserializeThread(serializeThread(long, NOW), NOW)
    expect(out).toHaveLength(MAX_STORED_TURNS)
    expect((out[out.length - 1] as { text: string }).text).toBe(`t${MAX_STORED_TURNS + 9}`)
  })

  it('sheds the oldest turns until the payload fits the byte ceiling', () => {
    const fat: MisterMsg[] = Array.from({ length: 12 }, (_, i) => ({
      who: 'mi',
      result: { renderer: 'landed-cost', data: { blob: `${i}`.padEnd(30_000, 'x') } },
    }))
    const payload = serializeThread(fat, NOW)!
    expect(payload.length).toBeLessThanOrEqual(MAX_STORED_BYTES)
    // What survives is the tail, and the very last turn is always kept.
    expect(payload).toContain('11'.padEnd(30_000, 'x').slice(0, 40))
  })

  it('discards an envelope from an older version', () => {
    const stale = JSON.stringify({ v: THREAD_STORE_VERSION - 1, savedAt: NOW, turns: THREAD })
    expect(deserializeThread(stale, NOW)).toEqual([])
  })

  it('discards an expired conversation, and one stamped in the future', () => {
    const raw = serializeThread(THREAD, NOW)
    expect(deserializeThread(raw, NOW + THREAD_TTL_MS + 1)).toEqual([])
    expect(deserializeThread(raw, NOW - THREAD_TTL_MS - 1)).toEqual([])
    expect(deserializeThread(raw, NOW + THREAD_TTL_MS - 1)).toHaveLength(THREAD.length)
  })

  it('never throws on a malformed or hostile value', () => {
    for (const bad of [null, '', 'not json', '{}', '[]', JSON.stringify({ v: THREAD_STORE_VERSION, savedAt: 'x' })]) {
      expect(deserializeThread(bad, NOW)).toEqual([])
    }
  })

  it('drops individual turns that no longer parse, keeping the rest', () => {
    const mixed = JSON.stringify({
      v: THREAD_STORE_VERSION,
      savedAt: NOW,
      turns: [{ who: 'op', text: 'válido' }, { who: 'system', text: 'x' }, null, { who: 'mi', result: null }, 7],
    })
    expect(deserializeThread(mixed, NOW)).toEqual([{ who: 'op', text: 'válido' }])
  })
})

describe('loadThread / saveThread', () => {
  it('persists a conversation for the operator it belongs to', () => {
    const storage = memoryStorage()
    const key = threadStorageKey('ana@wings.pe')
    saveThread(storage, key, THREAD, NOW)

    expect(loadThread(storage, key, NOW)).toEqual(THREAD)
    // Another operator on the same workstation sees nothing.
    expect(loadThread(storage, threadStorageKey('luis@wings.pe'), NOW)).toEqual([])
  })

  it('clears the key when the conversation empties', () => {
    const storage = memoryStorage()
    const key = threadStorageKey('ana@wings.pe')
    saveThread(storage, key, THREAD, NOW)
    saveThread(storage, key, [], NOW)
    expect(storage.getItem(key)).toBeNull()
  })

  it('survives a storage that refuses to write (quota, private mode)', () => {
    const storage = memoryStorage()
    storage.failOnWrite = true
    expect(() => saveThread(storage, 'k', THREAD, NOW)).not.toThrow()
  })

  it('treats an absent storage as an empty conversation', () => {
    expect(loadThread(undefined, 'k', NOW)).toEqual([])
    expect(() => saveThread(undefined, 'k', THREAD, NOW)).not.toThrow()
  })
})
