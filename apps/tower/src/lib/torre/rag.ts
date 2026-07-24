// src/lib/torre/rag.ts
// Mister Torre — company memory / RAG (Loop L6). PURE + unit-tested. The retrieval math
// and governance are pure and injectable; the embeddings + pgvector queries are wiring.
//
// Governance (spec-torre non-negotiables 4):
//  · Rates and tariffs are NEVER answered from RAG memory — `isRateOrPriceQuery` flags a
//    price/rate question so the answer redirects to get_rates/get_tariff; `annotatePrecedent`
//    stamps a retrieved chunk that looks like a rate/price with a "verify current" caution.
//  · Every answer must cite its sources (interaction law 3) — `citationsFor` derives the
//    clickable citations for the hits an answer used.
export interface CorpusDoc {
  id: string
  title: string
  /** 'quote' | 'precedent' | 'sop' | 'email' | 'acta' | … */
  docType: string
  date: string | null
  text: string
  /** Linked entities (account/import/hs ids) for the entity-filter retrieval leg. */
  entityRefs?: string[]
}

export interface Chunk {
  docId: string
  title: string
  ord: number
  heading: string | null
  text: string
  docType: string
  date: string | null
  entityRefs: string[]
}

// ── Chunking by STRUCTURE (not blind fixed windows) ──────────────────────────

interface Section {
  heading: string | null
  body: string
}

/** Split text into sections at Markdown headings, keeping each section's heading context. */
function splitSections(text: string): Section[] {
  const lines = text.split(/\r?\n/)
  const sections: Section[] = []
  let heading: string | null = null
  let body: string[] = []
  const flush = () => {
    const joined = body.join('\n').trim()
    // keep a heading-only section too, so a heading with no body is never silently lost
    if (joined || heading !== null) sections.push({ heading, body: joined })
    body = []
  }
  for (const line of lines) {
    const m = /^#{1,6}\s+(.*)$/.exec(line)
    if (m) {
      flush()
      heading = m[1].trim()
    } else {
      body.push(line)
    }
  }
  flush()
  return sections
}

/** Hard-split an oversized paragraph at sentence boundaries (then wrap a giant sentence). */
function splitLongParagraph(p: string, maxChars: number): string[] {
  if (p.length <= maxChars) return [p]
  const sentences = p.match(/[^.!?]+[.!?]+(?:\s|$)|[^.!?]+$/g) ?? [p]
  const out: string[] = []
  let cur = ''
  for (const raw of sentences) {
    let piece = raw.trim()
    if (!piece) continue
    // a single sentence longer than maxChars → hard-wrap it
    while (piece.length > maxChars) {
      if (cur) {
        out.push(cur)
        cur = ''
      }
      out.push(piece.slice(0, maxChars))
      piece = piece.slice(maxChars)
    }
    if (!cur) cur = piece
    else if (cur.length + 1 + piece.length <= maxChars) cur = `${cur} ${piece}`
    else {
      out.push(cur)
      cur = piece
    }
  }
  if (cur) out.push(cur)
  return out
}

/** Pack a section body's paragraphs greedily into chunks no larger than maxChars. */
function packParagraphs(body: string, maxChars: number): string[] {
  const paras = body
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
    .flatMap((p) => splitLongParagraph(p, maxChars)) // no chunk exceeds maxChars, ever
  const out: string[] = []
  let cur = ''
  for (const p of paras) {
    if (!cur) cur = p
    else if (cur.length + 2 + p.length <= maxChars) cur = `${cur}\n\n${p}`
    else {
      out.push(cur)
      cur = p
    }
  }
  if (cur) out.push(cur)
  return out
}

/**
 * PURE: chunk a document by its structure — sections at headings, paragraphs packed up to
 * `maxChars` (default 800), each chunk carrying its heading + metadata (docType, date,
 * entity links) for filtered retrieval. Blind fixed-window chunking is exactly what this avoids.
 */
export function chunkByStructure(doc: CorpusDoc, opts: { maxChars?: number } = {}): Chunk[] {
  const maxChars = opts.maxChars ?? 800
  const chunks: Chunk[] = []
  let ord = 0
  for (const section of splitSections(doc.text)) {
    const packed = packParagraphs(section.body, maxChars)
    // a heading with no body still yields a chunk (the heading text) — never dropped
    const texts = packed.length ? packed : section.heading ? [section.heading] : []
    for (const text of texts) {
      chunks.push({
        docId: doc.id,
        title: doc.title,
        ord: ord++,
        heading: section.heading,
        text,
        docType: doc.docType,
        date: doc.date,
        entityRefs: doc.entityRefs ?? [],
      })
    }
  }
  return chunks
}

// ── Hybrid retrieval ranking ─────────────────────────────────────────────────

export interface RetrievalCandidate {
  chunk: Chunk
  /** Cosine similarity 0–1 (from pgvector; injected). */
  vectorScore: number
  /** Keyword/BM25 match 0–1 (injected). */
  keywordScore: number
}

export interface ScoredHit extends RetrievalCandidate {
  score: number
  entityMatch: boolean
}

export interface HybridOptions {
  queryEntities?: string[]
  topK?: number
  weights?: { vector: number; keyword: number }
  /** Additive boost when a chunk's entity links intersect the query entities. */
  entityBoost?: number
}

/**
 * PURE: hybrid rank (vector + keyword + entity-filter boost), deterministic. Combines the
 * two scores by weight, boosts chunks whose entities match the query, sorts by score then a
 * total tiebreak (recency, then docId, then ord), and returns the top-k (default 8).
 */
export function hybridRank(candidates: RetrievalCandidate[], opts: HybridOptions = {}): ScoredHit[] {
  const wv = opts.weights?.vector ?? 0.6
  const wk = opts.weights?.keyword ?? 0.4
  const boost = opts.entityBoost ?? 0.15
  const topK = opts.topK ?? 8
  const qEntities = new Set(opts.queryEntities ?? [])

  const scored: ScoredHit[] = candidates.map((c) => {
    const entityMatch = c.chunk.entityRefs.some((e) => qEntities.has(e))
    const score = wv * c.vectorScore + wk * c.keywordScore + (entityMatch ? boost : 0)
    return { ...c, score, entityMatch }
  })

  scored.sort(
    (a, b) =>
      b.score - a.score ||
      (b.chunk.date ?? '').localeCompare(a.chunk.date ?? '') || // recency
      a.chunk.docId.localeCompare(b.chunk.docId) ||
      a.chunk.ord - b.chunk.ord,
  )
  return scored.slice(0, Math.max(0, topK)) // a negative topK must empty, not slice from the end
}

// ── Citations + the freshness guard ──────────────────────────────────────────

export interface Citation {
  docId: string
  title: string
  docType: string
  date: string | null
  heading: string | null
}

/** PURE: the clickable citations for the hits an answer used (de-duped by doc+heading). */
export function citationsFor(hits: ScoredHit[]): Citation[] {
  const seen = new Set<string>()
  const cites: Citation[] = []
  for (const h of hits) {
    const key = `${h.chunk.docId}:${h.chunk.heading ?? ''}`
    if (seen.has(key)) continue
    seen.add(key)
    cites.push({ docId: h.chunk.docId, title: h.chunk.title, docType: h.chunk.docType, date: h.chunk.date, heading: h.chunk.heading })
  }
  return cites
}

function norm(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
}

const RATE_PRICE_TERMS = [
  // ES (stems: 'costa' catches costo/costará; 'cotiz' left OUT — a quote-precedent lookup is legit)
  'tarifa', 'flete', 'arancel', 'precio', 'costo', 'costa',
  // EN
  'rate', 'duty', 'freight', 'landed', 'price', 'cost', 'tariff',
]

/**
 * PURE: does the query ask for a rate/price? RAG must NOT answer these from memory — the
 * caller redirects to get_rates/get_tariff (the freshness law). Precedent is fine; prices
 * are not.
 */
export function isRateOrPriceQuery(query: string): boolean {
  const hay = ` ${norm(query)} `
  return RATE_PRICE_TERMS.some((t) => hay.includes(` ${t}`))
}

export interface PrecedentAnswer {
  /** True when the query was a rate/price ask — the answer must not quote a number from RAG. */
  rateGuarded: boolean
  /** Bilingual caution shown when rate-guarded. */
  caution?: { es: string; en: string }
  citations: Citation[]
}

/**
 * PURE: shape a precedent answer with citations, enforcing the freshness law. If the query
 * is a rate/price ask, it is flagged (`rateGuarded`) with a caution redirecting to the
 * dated tools — the retrieved precedent is context, never the live number.
 */
export function precedentAnswer(query: string, hits: ScoredHit[]): PrecedentAnswer {
  const rateGuarded = isRateOrPriceQuery(query)
  return {
    rateGuarded,
    caution: rateGuarded
      ? {
          es: 'Los precedentes NO dan tarifas ni aranceles vigentes. Usa get_rates / get_tariff para el número actual.',
          en: 'Precedents do NOT give current rates or duties. Use get_rates / get_tariff for the live number.',
        }
      : undefined,
    citations: citationsFor(hits),
  }
}
