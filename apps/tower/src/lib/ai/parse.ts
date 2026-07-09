// src/lib/ai/parse.ts
// PURE parsers: model text → typed draft. No SDK, no Supabase, no `fetch` — every
// function here is deterministic and unit-tested (intelligence.test.ts). The
// orchestrators (triage.ts, score.ts, …) call the Claude client and hand the raw
// text to these; keeping the parse layer pure is what makes the engine testable
// without a network or a key.
//
// Two invariants live here:
//   • confidence is ALWAYS clamped to 0–1 before it reaches a reviewer;
//   • the model never invents identifiers — a proposed lane must resolve against a
//     candidate the caller supplied, or the parse fails (no draft is fabricated).
import { ARCHETYPE_CODES, type Archetype } from '@/lib/archetypes'
import type {
  LeadScoreFactor,
  LeadScorePayload,
  SpecExtractPayload,
  TriagePayload,
} from './types'

export type ParseResult<T> = { ok: true; value: T } | { ok: false; reason: string }

// ── Numeric guards ───────────────────────────────────────────────────────────

/** Clamp any model number to a 0–1 confidence. Accepts 0–1 or a 0–100 percentage. */
export function clampConfidence(raw: unknown): number {
  const n = typeof raw === 'string' ? Number(raw) : (raw as number)
  if (typeof n !== 'number' || !Number.isFinite(n)) return 0
  const unit = n > 1 && n <= 100 ? n / 100 : n
  return Math.min(1, Math.max(0, unit))
}

/** Clamp any model number to an integer 0–100 lead score. Accepts 0–1 or 0–100. */
export function clampScore(raw: unknown): number {
  const n = typeof raw === 'string' ? Number(raw) : (raw as number)
  if (typeof n !== 'number' || !Number.isFinite(n)) return 0
  const scaled = n > 0 && n <= 1 ? n * 100 : n
  return Math.min(100, Math.max(0, Math.round(scaled)))
}

// ── JSON extraction ──────────────────────────────────────────────────────────

/** Pull the first JSON object out of model text, tolerating ```json fences. */
export function extractJsonObject(text: string): Record<string, unknown> | null {
  if (typeof text !== 'string') return null
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i)
  const body = fenced ? fenced[1] : text
  const start = body.indexOf('{')
  const end = body.lastIndexOf('}')
  if (start === -1 || end === -1 || end < start) return null
  try {
    const parsed = JSON.parse(body.slice(start, end + 1))
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : null
  } catch {
    return null
  }
}

function isArchetype(v: unknown): v is Archetype {
  return typeof v === 'string' && (ARCHETYPE_CODES as readonly string[]).includes(v)
}

/** kebab-case slug fallback when the model omits one. */
export function slugify(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

function localized(es: unknown, en: unknown): { es: string; en: string } {
  const e = typeof es === 'string' ? es.trim() : ''
  const n = typeof en === 'string' ? en.trim() : ''
  // Never leave a side empty — mirror across when the model gives only one.
  return { es: e || n, en: n || e }
}

// ── (1) Triage ───────────────────────────────────────────────────────────────

/** A lane the caller offers the model as a triage target (resolved, not hallucinated). */
export interface TriageLaneCandidate {
  laneId: string
  laneCode: string
  archetype: Archetype
  /** The archetype's first stage — where a freshly-triaged RFQ lands. */
  defaultStage: string
}

/**
 * Parse a triage classification. The model returns a lane *code* (from the
 * candidate set the prompt listed); we resolve it to the real lane uuid here. An
 * unresolvable code fails the parse rather than drafting an RFQ pointed at a lane
 * that does not exist.
 */
export function parseTriageDraft(
  text: string,
  candidates: TriageLaneCandidate[],
): ParseResult<{ payload: TriagePayload; confidence: number }> {
  const obj = extractJsonObject(text)
  if (!obj) return { ok: false, reason: 'No JSON object in triage response' }
  if (candidates.length === 0) return { ok: false, reason: 'No candidate lanes supplied' }

  const code = typeof obj.laneCode === 'string' ? obj.laneCode.trim().toUpperCase() : ''
  const match = candidates.find((c) => c.laneCode.toUpperCase() === code)
  if (!match) return { ok: false, reason: `Lane code "${code}" not among candidates` }

  const accountId =
    typeof obj.accountId === 'string' && obj.accountId.trim().length > 0 ? obj.accountId.trim() : null

  const payload: TriagePayload = {
    proposedLaneId: match.laneId,
    proposedLaneCode: match.laneCode,
    proposedArchetype: match.archetype,
    proposedStage: match.defaultStage,
    accountId,
    draftReply: localized(obj.draftReplyEs, obj.draftReplyEn),
    ...(typeof obj.rationale === 'string' ? { rationale: obj.rationale.trim() } : {}),
  }
  return { ok: true, value: { payload, confidence: clampConfidence(obj.confidence) } }
}

// ── (2) Lead score ───────────────────────────────────────────────────────────

export function parseLeadScoreDraft(
  text: string,
): ParseResult<{ payload: LeadScorePayload; confidence: number }> {
  const obj = extractJsonObject(text)
  if (!obj) return { ok: false, reason: 'No JSON object in score response' }

  const rawFactors = Array.isArray(obj.factors) ? obj.factors : []
  const factors: LeadScoreFactor[] = rawFactors
    .filter((f): f is Record<string, unknown> => Boolean(f) && typeof f === 'object')
    .map((f) => {
      const w = typeof f.weight === 'string' ? Number(f.weight) : (f.weight as number)
      return {
        label: localized(
          (f.labelEs ?? (f.label as Record<string, unknown> | undefined)?.es) as unknown,
          (f.labelEn ?? (f.label as Record<string, unknown> | undefined)?.en) as unknown,
        ),
        weight: Number.isFinite(w) ? Math.round(w as number) : 0,
        ...(typeof f.detail === 'string' ? { detail: f.detail.trim() } : {}),
      }
    })

  const payload: LeadScorePayload = { score: clampScore(obj.score), factors }
  return { ok: true, value: { payload, confidence: clampConfidence(obj.confidence) } }
}

// ── (3) Spec extract ─────────────────────────────────────────────────────────

/** The document-side of a spec-extract draft — lane/source are added by the orchestrator. */
export type SpecExtractDraftCore = Pick<
  SpecExtractPayload,
  'archetype' | 'name' | 'suggestedSlug' | 'specs' | 'fieldConfidences' | 'hsCode'
>

/**
 * Parse a supplier-doc extraction against a KNOWN archetype (resolved from the
 * lane/schema by the caller — the document does not get to choose it). Specs are
 * kept verbatim and validated against the archetype JSON-Schema only at approval,
 * when they become a DRAFT product.
 */
export function parseSpecExtractDraft(
  text: string,
  archetype: Archetype,
): ParseResult<{ core: SpecExtractDraftCore; confidence: number }> {
  const obj = extractJsonObject(text)
  if (!obj) return { ok: false, reason: 'No JSON object in spec-extract response' }

  const specs =
    obj.specs && typeof obj.specs === 'object' && !Array.isArray(obj.specs)
      ? (obj.specs as Record<string, unknown>)
      : {}

  const rawFieldConf =
    obj.fieldConfidences && typeof obj.fieldConfidences === 'object'
      ? (obj.fieldConfidences as Record<string, unknown>)
      : {}
  const fieldConfidences: Record<string, number> = {}
  for (const [k, v] of Object.entries(rawFieldConf)) fieldConfidences[k] = clampConfidence(v)

  const name = localized(
    obj.nameEs ?? (obj.name as Record<string, unknown> | undefined)?.es,
    obj.nameEn ?? (obj.name as Record<string, unknown> | undefined)?.en,
  )
  const suggestedSlug =
    typeof obj.suggestedSlug === 'string' && obj.suggestedSlug.trim()
      ? slugify(obj.suggestedSlug)
      : slugify(name.en || name.es || 'producto')

  // The archetype the caller resolved wins; a model-supplied one is only a sanity check.
  const resolvedArchetype = isArchetype(obj.archetype) ? obj.archetype : archetype

  const confValues = Object.values(fieldConfidences)
  const overall =
    obj.overallConfidence !== undefined
      ? clampConfidence(obj.overallConfidence)
      : confValues.length > 0
        ? confValues.reduce((a, b) => a + b, 0) / confValues.length
        : 0.5

  return {
    ok: true,
    value: {
      core: {
        archetype: resolvedArchetype,
        name,
        suggestedSlug,
        specs,
        fieldConfidences,
        ...(typeof obj.hsCode === 'string' && obj.hsCode.trim() ? { hsCode: obj.hsCode.trim() } : {}),
      },
      confidence: overall,
    },
  }
}

// ── (4) Weekly brief ─────────────────────────────────────────────────────────

/** Advisory confidence for a generated summary — it is edited by a human before use. */
export const WEEKLY_BRIEF_CONFIDENCE = 0.7

/**
 * A brief is prose, not a record. The model returns markdown (optionally with a
 * `## Highlights` bullet list we lift out). No JSON contract to fail on — an
 * empty body is the only failure.
 */
export function parseWeeklyBriefDraft(
  text: string,
): ParseResult<{ markdown: string; highlights: string[] }> {
  const markdown = typeof text === 'string' ? text.trim() : ''
  if (!markdown) return { ok: false, reason: 'Empty brief' }

  const highlights: string[] = []
  const section = markdown.match(/##\s*(?:highlights|destacados)[^\n]*\n([\s\S]*?)(?:\n##\s|$)/i)
  if (section) {
    for (const line of section[1].split('\n')) {
      const m = line.match(/^\s*[-*]\s+(.*\S)\s*$/)
      if (m) highlights.push(m[1])
    }
  }
  return { ok: true, value: { markdown, highlights } }
}
