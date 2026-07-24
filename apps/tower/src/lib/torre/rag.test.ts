// src/lib/torre/rag.test.ts
import { describe, it, expect } from 'vitest'
import {
  chunkByStructure,
  citationsFor,
  hybridRank,
  isRateOrPriceQuery,
  precedentAnswer,
  type Chunk,
  type CorpusDoc,
  type RetrievalCandidate,
} from './rag'

const doc: CorpusDoc = {
  id: 'q-88',
  title: 'Cotización 2025-88',
  docType: 'quote',
  date: '2025-05-01',
  entityRefs: ['acc-1', 'imp-9'],
  text: '# Resumen\nGrupo electrógeno 250kVA.\n\nCliente Clínica Sur.\n\n## Términos\n50% adelanto.\n\nEntrega 60 días.',
}

describe('chunkByStructure', () => {
  it('splits by headings and carries the heading + metadata', () => {
    const chunks = chunkByStructure(doc)
    expect(chunks.length).toBeGreaterThanOrEqual(2)
    expect(chunks[0].heading).toBe('Resumen')
    const terms = chunks.find((c) => c.heading === 'Términos')
    expect(terms?.text).toContain('50% adelanto')
    expect(chunks.every((c) => c.docId === 'q-88' && c.docType === 'quote' && c.entityRefs.includes('acc-1'))).toBe(true)
  })

  it('assigns sequential ord and packs small paragraphs up to maxChars', () => {
    const chunks = chunkByStructure(doc, { maxChars: 1000 })
    expect(chunks.map((c) => c.ord)).toEqual(chunks.map((_, i) => i))
    // under a big maxChars, the Resumen section's two paragraphs pack into one chunk
    expect(chunks[0].text).toContain('Grupo electrógeno')
    expect(chunks[0].text).toContain('Clínica Sur')
  })

  it('handles text with no headings (single section)', () => {
    const chunks = chunkByStructure({ ...doc, text: 'Solo un párrafo suelto.' })
    expect(chunks).toHaveLength(1)
    expect(chunks[0].heading).toBeNull()
  })

  it('hard-splits an oversized paragraph at sentence boundaries (no chunk exceeds maxChars)', () => {
    const long = Array.from({ length: 40 }, (_, i) => `Oración número ${i} sobre el flete.`).join(' ')
    const chunks = chunkByStructure({ ...doc, text: long }, { maxChars: 200 })
    expect(chunks.length).toBeGreaterThan(1)
    expect(chunks.every((c) => c.text.length <= 200)).toBe(true)
  })

  it('does not drop a heading that has no body', () => {
    const chunks = chunkByStructure({ ...doc, text: '# Términos\n## Anexos\nContenido.' })
    // 'Términos' has no body but must survive as its own chunk
    expect(chunks.some((c) => c.heading === 'Términos')).toBe(true)
  })
})

function cand(docId: string, over: Partial<Chunk> & { vectorScore: number; keywordScore: number }): RetrievalCandidate {
  const { vectorScore, keywordScore, ...chunk } = over
  return {
    vectorScore,
    keywordScore,
    chunk: { docId, title: docId, ord: 0, heading: null, text: '', docType: 'quote', date: null, entityRefs: [], ...chunk },
  }
}

describe('hybridRank', () => {
  it('combines vector + keyword by weight and sorts descending', () => {
    const hits = hybridRank([
      cand('a', { vectorScore: 0.9, keywordScore: 0.1 }),
      cand('b', { vectorScore: 0.2, keywordScore: 0.9 }),
    ])
    // a: .6*.9+.4*.1=.58 ; b: .6*.2+.4*.9=.48 → a first
    expect(hits.map((h) => h.chunk.docId)).toEqual(['a', 'b'])
  })

  it('boosts a chunk whose entities match the query', () => {
    const hits = hybridRank(
      [
        cand('a', { vectorScore: 0.5, keywordScore: 0.5 }),
        cand('b', { vectorScore: 0.5, keywordScore: 0.5, entityRefs: ['imp-9'] }),
      ],
      { queryEntities: ['imp-9'] },
    )
    expect(hits[0].chunk.docId).toBe('b')
    expect(hits[0].entityMatch).toBe(true)
  })

  it('respects topK and empties on a negative topK (never slices from the end)', () => {
    const many = Array.from({ length: 20 }, (_, i) => cand(`d${i}`, { vectorScore: i / 20, keywordScore: 0 }))
    expect(hybridRank(many, { topK: 5 })).toHaveLength(5)
    expect(hybridRank(many, { topK: -1 })).toEqual([])
  })

  it('is deterministic on a score tie (recency then docId)', () => {
    const hits = hybridRank([
      cand('a', { vectorScore: 0.5, keywordScore: 0.5, date: '2024-01-01' }),
      cand('b', { vectorScore: 0.5, keywordScore: 0.5, date: '2026-01-01' }),
    ])
    expect(hits.map((h) => h.chunk.docId)).toEqual(['b', 'a']) // newer first
  })
})

describe('citationsFor', () => {
  it('de-dups by doc + heading', () => {
    const hits = hybridRank([
      cand('a', { vectorScore: 0.9, keywordScore: 0, heading: 'X' }),
      cand('a', { vectorScore: 0.8, keywordScore: 0, heading: 'X' }),
      cand('a', { vectorScore: 0.7, keywordScore: 0, heading: 'Y' }),
    ])
    expect(citationsFor(hits)).toHaveLength(2) // X and Y, not three
  })
})

describe('freshness guard', () => {
  it('flags rate/price queries (ES + EN, incl. costará and tariff)', () => {
    expect(isRateOrPriceQuery('¿Cuál fue la tarifa de flete a Callao?')).toBe(true)
    expect(isRateOrPriceQuery('What duty applied to the genset?')).toBe(true)
    expect(isRateOrPriceQuery('What was the price on that quote?')).toBe(true) // 'price'
    expect(isRateOrPriceQuery('Which tariff applied?')).toBe(true) // 'tariff'
    expect(isRateOrPriceQuery('¿Cuánto costará el envío?')).toBe(true) // 'costa' stem
    expect(isRateOrPriceQuery('¿Qué acordamos sobre la entrega?')).toBe(false)
  })

  it('precedentAnswer guards a price query and still returns citations', () => {
    const hits = hybridRank([cand('q-88', { vectorScore: 0.9, keywordScore: 0.2 })])
    const priced = precedentAnswer('¿tarifa de flete anterior?', hits)
    expect(priced.rateGuarded).toBe(true)
    expect(priced.caution?.es).toMatch(/get_rates \/ get_tariff/)
    expect(priced.citations).toHaveLength(1)

    const factual = precedentAnswer('¿términos de pago acordados?', hits)
    expect(factual.rateGuarded).toBe(false)
    expect(factual.caution).toBeUndefined()
  })
})
