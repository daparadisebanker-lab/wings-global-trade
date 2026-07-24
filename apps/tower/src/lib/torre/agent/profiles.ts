// src/lib/torre/agent/profiles.ts
// Mister Torre — specialism profiles (Foundation B3). Per spec-torre/02, the
// specialisms are NOT separate bots: they are prompt profiles on the SAME loop
// (B1) with the SAME persona. A profile does two things:
//   1. layers a specialism appendix on top of the governance floor (TORRE_TOOL_SYSTEM);
//   2. scopes WHICH tools the run may call (a subset of the belt).
//
// The tool scoping is itself a governance boundary, not a convenience. The clearest
// case: `redactor` (comms) is denied compute_landed_cost / get_rates / get_tariff — the
// message writer literally cannot fabricate a price or a duty; it drafts from state and
// from numbers the cotizador already computed. "Facts-from-state only" becomes structural.
import type { IntelligenceModel } from '@/lib/ai/types'
import { INTELLIGENCE_MODELS } from '@/lib/ai/types'
import type { AgentTool } from './tool-loop'
import { TORRE_TOOL_SYSTEM } from './anthropic-runner'
import { TORRE_TOOL_NAMES, type TorreToolName } from './tools'

export const TORRE_PROFILE_IDS = ['cotizador', 'operaciones', 'redactor', 'analista'] as const
export type TorreProfileId = (typeof TORRE_PROFILE_IDS)[number]

export interface TorreProfile {
  id: TorreProfileId
  label: { es: string; en: string }
  /** One-line role description (routing + UI). */
  purpose: { es: string; en: string }
  /** Specialism prompt, appended to TORRE_TOOL_SYSTEM (never replaces the laws). */
  systemAppendix: string
  /** The tools this profile may call — a subset of the belt (order preserved). */
  tools: TorreToolName[]
  /** Model tier for the orchestrated run (all specialisms reason on Sonnet; router is Haiku). */
  model: IntelligenceModel
  /** Profiles this one may hand off to (e.g. cotizador → redactor for the cover email). */
  chainsTo: TorreProfileId[]
}

const REASON = INTELLIGENCE_MODELS.reason

export const TORRE_PROFILES: Record<TorreProfileId, TorreProfile> = {
  cotizador: {
    id: 'cotizador',
    label: { es: 'Cotizador', en: 'Quoter' },
    purpose: { es: 'Arma cotizaciones (costo puesto + margen).', en: 'Builds quotes (landed cost + margin).' },
    systemAppendix: [
      'PERFIL: COTIZADOR.',
      'Armas cotizaciones. Flujo: resuelve la partida arancelaria con get_tariff (elige el HS correcto) y revisa el flete con get_rates; luego llama a propose_quote con los datos del producto. El SERVIDOR calcula todo (costo puesto, impuestos, margen) y persiste la hoja de costos + la cotización + el mensaje como borradores. Tú NO calculas dinero ni pasas cifras de flete/margen.',
      'Si la partida es ambigua o la tarifa está vencida/ausente, el borrador saldrá con un bloqueo — no inventes una cifra ni un arancel. Cifras estimadas nunca entran a un artefacto de cliente sin marcarse.',
    ].join('\n'),
    // full quoting surface — every read it needs, the money engine, and the server pricer.
    // propose_quote persists the WHOLE linked pair (incl. the cover message), so cotizador
    // needs no draft_message of its own.
    tools: ['get_client', 'get_supplier', 'get_rates', 'get_tariff', 'get_costing_config', 'search_knowledge', 'compute_landed_cost', 'propose_quote'],
    model: REASON,
    chainsTo: ['redactor'],
  },
  operaciones: {
    id: 'operaciones',
    label: { es: 'Operaciones', en: 'Operations' },
    purpose: { es: 'Sigue el estado y las excepciones de importaciones.', en: 'Tracks import status and exceptions.' },
    systemAppendix: [
      'PERFIL: OPERACIONES.',
      'Sigues el estado de las importaciones y detectas excepciones (ETA en riesgo, documento faltante, demora, hito vencido). Propones la siguiente acción y, si corresponde, un borrador. No cotizas: si piden precio, indícalo y deriva al cotizador.',
    ].join('\n'),
    // status + logistics reads (get_rates only to CHECK a freight rate's validity, not to
    // quote); drafts a message when a comm is warranted; no compute, no tariff, no propose_quote
    tools: ['get_import', 'get_client', 'get_supplier', 'get_rates', 'search_knowledge', 'draft_message'],
    model: REASON,
    chainsTo: ['redactor'],
  },
  redactor: {
    id: 'redactor',
    label: { es: 'Redactor', en: 'Writer' },
    purpose: { es: 'Redacta comunicaciones por audiencia e idioma.', en: 'Drafts communications by audience and language.' },
    systemAppendix: [
      'PERFIL: REDACTOR.',
      'Redactas comunicaciones (cliente / proveedor / agente) con el tono correcto por audiencia e idioma: cliente en su idioma, proveedor en inglés por defecto, interno en español.',
      'Usas SOLO hechos del estado y cifras que ya vienen en la solicitud o el artefacto calculado. NUNCA calculas ni inventas números, tarifas ni aranceles — no tienes esas herramientas. Si falta una cifra para escribir el mensaje, NÓMBRALA como pendiente y pide que se genere la cotización primero; no la adivines ni la tomes de un precedente. Emites la comunicación como borrador; el envío lo aprueba un humano y el control nombra el efecto exacto.',
    ].join('\n'),
    // deliberately denied compute/rates/tariff/quote — the writer cannot fabricate a number
    tools: ['get_import', 'get_client', 'get_supplier', 'search_knowledge', 'draft_message'],
    model: REASON,
    chainsTo: [],
  },
  analista: {
    id: 'analista',
    label: { es: 'Analista', en: 'Analyst' },
    purpose: { es: 'Produce reportes de márgenes, pipeline y desempeño.', en: 'Produces margin, pipeline and performance reports.' },
    systemAppendix: [
      'PERFIL: ANALISTA.',
      'Produces reportes y análisis (márgenes, pipeline, desempeño) desde el estado. Cuando un análisis requiere recomputar un costo, usas compute_landed_cost — nunca aritmética propia. Emites el análisis como borrador y citas las fuentes.',
      'Tus comunicaciones (draft_message) son INTERNAS (audiencia agente/interno). Nunca pongas un precio en un mensaje al cliente: una cotización al cliente SIEMPRE pasa por el cotizador (propose_quote), que aplica los bloqueos. Tu compute_landed_cost es para análisis interno, no para cotizar al cliente.',
    ].join('\n'),
    // reads + the money calculator for INTERNAL margin analysis; delivers findings as an
    // internal message draft until the report artifact types land (L3). No propose_quote —
    // analista analyses, never quotes the client (that path, with its blockers, is cotizador's).
    tools: ['get_import', 'get_client', 'get_rates', 'get_tariff', 'get_costing_config', 'search_knowledge', 'compute_landed_cost', 'draft_message'],
    model: REASON,
    chainsTo: ['redactor'],
  },
}

/** Look up a profile (throws on an unknown id — callers pass a validated TorreProfileId). */
export function getProfile(id: TorreProfileId): TorreProfile {
  const p = TORRE_PROFILES[id]
  if (!p) throw new Error(`unknown Torre profile "${id}"`)
  return p
}

/** The full system prompt for a run: the governance floor + the profile's specialism. */
export function profileSystem(profile: TorreProfile, base: string = TORRE_TOOL_SYSTEM): string {
  return `${base}\n\n${profile.systemAppendix}`
}

/**
 * Scope a belt to a profile: return only the tools the profile may call, in the belt's
 * order. Throws if the profile names a tool the belt doesn't provide (a wiring bug, not
 * a runtime condition) — this is what keeps the allow-list honest.
 */
export function selectProfileTools(profile: TorreProfile, belt: AgentTool[]): AgentTool[] {
  const byName = new Map(belt.map((t) => [t.name, t]))
  for (const name of profile.tools) {
    if (!byName.has(name)) throw new Error(`profile "${profile.id}" requires tool "${name}" not present in the belt`)
  }
  const allow = new Set<string>(profile.tools)
  return belt.filter((t) => allow.has(t.name))
}

// Compile-time-ish guard: every profile tool name is a real belt tool name.
const _ALL_NAMES = new Set<string>(TORRE_TOOL_NAMES)
for (const p of Object.values(TORRE_PROFILES)) {
  for (const name of p.tools) {
    if (!_ALL_NAMES.has(name)) throw new Error(`profile "${p.id}" lists unknown tool "${name}"`)
  }
}
