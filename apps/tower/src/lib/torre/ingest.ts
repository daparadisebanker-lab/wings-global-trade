// src/lib/torre/ingest.ts
// Mister Torre — ingest-on-approval (Loop L6, learned-on-approval). PURE row-building +
// unit-tested. When a human APPROVES a Torre artifact, its content becomes precedent in the
// company corpus (knowledge_chunks). Only approved facts enter memory — never a DRAFT.
//
// Governance: this renders an artifact into corpus chunks; it does NOT store live rates as
// answers (the freshness guard on retrieval, rag.ts, keeps a stored precedent price from
// ever being served as the current number). HOJA_COSTOS (an internal raw-number cost sheet)
// is deliberately NOT ingested — it isn't reusable precedent and would just be number noise.
import { chunkByStructure, type CorpusDoc } from './rag'
import { documentMarkdown } from './documents'
import { CONFIDENCE_LABEL, type TorreArtifactPayload } from './artifacts'

export interface IngestMeta {
  brandId: string
  laneId: string | null
  /** Stable source id for citations (the ai_drafts row id). */
  docId: string
  date?: string | null
  /** Entity links (account/import/hs ids) for the entity-filter retrieval leg. */
  entityRefs?: string[]
}

/** A knowledge_chunks insert row (snake_case; embedding null until the embed job runs). */
export interface KnowledgeChunkInsert {
  brand_id: string
  lane_id: string | null
  doc_id: string
  title: string
  doc_type: string
  chunk_ord: number
  heading: string | null
  content: string
  entity_refs: string[]
  doc_date: string | null
}

function cotizacionText(p: Extract<TorreArtifactPayload, { kind: 'COTIZACION' }>): { title: string; text: string } {
  const lines = [
    `# Cotización ${p.machine.productName}`,
    `Cliente: ${p.clientName ?? '—'} · Lane: ${p.laneCode ?? '—'} · Válida hasta ${p.validityUntil}`,
    '',
    '## Escenarios',
    ...p.scenarios.map(
      (s) =>
        `- ${s.incoterm}: costo puesto ${s.landedCostMinor === null ? '—' : (s.landedCostMinor / 100).toFixed(2)}, ` +
        `precio unitario ${s.unitPriceMinor === null ? '—' : (s.unitPriceMinor / 100).toFixed(2)} (${CONFIDENCE_LABEL[s.confidence].es})`,
    ),
    p.terms.length ? '\n## Términos' : '',
    ...p.terms.map((t) => `- ${t}`),
  ]
  return { title: `Cotización ${p.machine.productName}${p.clientName ? ` · ${p.clientName}` : ''}`, text: lines.filter(Boolean).join('\n') }
}

/**
 * PURE: render an approved artifact into a corpus doc (precedent). Returns null for kinds
 * we don't ingest (HOJA_COSTOS). docType is the lowercased kind; date/entities from meta.
 */
export function artifactToCorpusDoc(p: TorreArtifactPayload, meta: IngestMeta): CorpusDoc | null {
  const base = { id: meta.docId, date: meta.date ?? null, entityRefs: meta.entityRefs ?? [] }
  switch (p.kind) {
    case 'HOJA_COSTOS':
      return null // internal cost sheet — not reusable precedent
    case 'COTIZACION': {
      const { title, text } = cotizacionText(p)
      return { ...base, title, docType: 'cotizacion', text }
    }
    case 'COMUNICACION':
      return { ...base, title: p.subject ?? 'Comunicación', docType: 'comunicacion', text: `# ${p.subject ?? 'Comunicación'}\n${p.body}` }
    case 'REPORTE_ESTADO':
    case 'CHECKLIST_DOCS':
    case 'ACTA':
    case 'SOP':
      return { ...base, title: p.title, docType: p.kind.toLowerCase(), text: documentMarkdown(p) }
  }
}

/**
 * PURE: the knowledge_chunks insert rows for an approved artifact (empty if the kind isn't
 * ingested). Chunks by structure; embedding is omitted (the embed job fills it later).
 */
export function corpusRowsFromArtifact(p: TorreArtifactPayload, meta: IngestMeta): KnowledgeChunkInsert[] {
  const doc = artifactToCorpusDoc(p, meta)
  if (!doc) return []
  return chunkByStructure(doc).map((c) => ({
    brand_id: meta.brandId,
    lane_id: meta.laneId,
    doc_id: c.docId,
    title: c.title,
    doc_type: c.docType,
    chunk_ord: c.ord,
    heading: c.heading,
    content: c.text,
    entity_refs: c.entityRefs,
    doc_date: c.date,
  }))
}
