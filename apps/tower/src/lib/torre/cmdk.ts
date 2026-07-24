// src/lib/torre/cmdk.ts
// Mister Torre — the Cmd+K verb registry (Loop L7, Surfaces). PURE + unit-tested. The
// command palette's verbs cover the loops that have a reachable surface today (cotizar ·
// comunicar via the redactor · reportar/analizar · plus the review/policy/triage panels).
// Vigilar and Documentar get their own verbs once their surfaces land (their UIs are the
// remaining L4/L3 wiring). Each verb declares WHERE it goes (start a run with a profile,
// open a panel, or navigate) so the palette component is a thin renderer over this data.
import type { TorreProfileId } from './agent/profiles'

export type VerbTarget =
  | { kind: 'run'; profile: TorreProfileId } // start a Mister Torre run with this profile
  | { kind: 'panel'; panel: 'torre' | 'triage' | 'reglas' | 'spec-extract' } // Intelligence workspace panel
  | { kind: 'route'; href: string } // navigate

export interface TorreVerb {
  id: string
  label: { es: string; en: string }
  hint: { es: string; en: string }
  target: VerbTarget
  /** Extra match terms (the label already matches). */
  keywords: string[]
}

export const TORRE_VERBS: TorreVerb[] = [
  {
    id: 'cotizar',
    label: { es: 'Cotizar', en: 'Quote' },
    hint: { es: 'Armar una cotización (costo puesto + margen)', en: 'Build a quote (landed cost + margin)' },
    target: { kind: 'run', profile: 'cotizador' },
    keywords: ['cotizacion', 'precio', 'costo', 'landed', 'margen', 'fob', 'cif'],
  },
  {
    id: 'redactar',
    label: { es: 'Redactar mensaje', en: 'Draft message' },
    hint: { es: 'Redactar un correo o WhatsApp por audiencia', en: 'Draft an email or WhatsApp by audience' },
    target: { kind: 'run', profile: 'redactor' },
    keywords: ['correo', 'email', 'whatsapp', 'mensaje', 'comunicar', 'responder'],
  },
  {
    id: 'estado',
    label: { es: 'Estado de importación', en: 'Import status' },
    hint: { es: 'Seguir estado, excepciones y documentos', en: 'Track status, exceptions and documents' },
    target: { kind: 'run', profile: 'operaciones' },
    keywords: ['estado', 'eta', 'contenedor', 'demora', 'documento', 'aduana', 'operaciones', 'customs', 'status'],
  },
  {
    id: 'analizar',
    label: { es: 'Reporte / análisis', en: 'Report / analysis' },
    hint: { es: 'Márgenes, pipeline, desempeño', en: 'Margins, pipeline, performance' },
    target: { kind: 'run', profile: 'analista' },
    keywords: ['reporte', 'analisis', 'margen', 'pipeline', 'brief', 'informe'],
  },
  {
    id: 'precedente',
    label: { es: 'Buscar precedente', en: 'Search precedent' },
    hint: { es: 'Cotizaciones y decisiones pasadas (con citas)', en: 'Past quotes and decisions (cited)' },
    target: { kind: 'run', profile: 'analista' },
    keywords: ['buscar', 'precedente', 'memoria', 'historial', 'corpus', 'rag'],
  },
  {
    id: 'cola',
    label: { es: 'Cola de revisión', en: 'Review queue' },
    hint: { es: 'Aprobar o rechazar borradores', en: 'Approve or reject drafts' },
    target: { kind: 'panel', panel: 'torre' },
    keywords: ['revisar', 'aprobar', 'borradores', 'cola', 'queue', 'review'],
  },
  {
    id: 'triage',
    label: { es: 'Triage de solicitudes', en: 'RFQ triage' },
    hint: { es: 'Clasificar solicitudes entrantes', en: 'Classify inbound requests' },
    target: { kind: 'panel', panel: 'triage' },
    keywords: ['triage', 'rfq', 'entrante', 'clasificar', 'lead', 'inbound'],
  },
  {
    id: 'reglas',
    label: { es: 'Reglas y tarifas', en: 'Rules & rates' },
    hint: { es: 'Márgenes, incoterms, tarifas de flete', en: 'Margins, incoterms, freight rates' },
    target: { kind: 'panel', panel: 'reglas' },
    keywords: ['reglas', 'tarifas', 'flete', 'margen', 'incoterm', 'ajustes', 'config', 'freight', 'duty', 'rates'],
  },
]

function norm(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
}

/**
 * PURE: filter + rank verbs for a palette query. Empty query → all verbs (registry order).
 * A verb matches when the query token is a word-prefix of its label OR any keyword; verbs
 * whose LABEL matches rank above keyword-only matches (deterministic, accent-insensitive).
 */
export function filterVerbs(query: string, verbs: TorreVerb[] = TORRE_VERBS): TorreVerb[] {
  const q = norm(query).trim()
  if (!q) return [...verbs]
  const wordPrefix = (hay: string) => new RegExp(`\\b${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`).test(norm(hay))
  const scored = verbs
    .map((v) => {
      const labelHit = wordPrefix(v.label.es) || wordPrefix(v.label.en)
      const keywordHit = v.keywords.some((k) => wordPrefix(k))
      return { v, rank: labelHit ? 0 : keywordHit ? 1 : 2 }
    })
    .filter((x) => x.rank < 2)
  // stable sort by rank, preserving registry order within a rank
  return scored.sort((a, b) => a.rank - b.rank).map((x) => x.v)
}
