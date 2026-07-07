// src/lib/ai/prompts.ts
// Prompt builders — pure string assembly, no I/O. Each returns { system, user }
// for one Intelligence task. They speak wholesale vocabulary (RFQ, lane,
// archetype, CBM, HS code — never "cart/checkout/buy") and ask for ES + EN where
// copy is produced (Directive 8 + ecosystem law).
//
// Every builder tells the model, in the system prompt, that its output is a
// REVIEWABLE DRAFT a human will edit — so it never phrases anything as a
// committed decision, price guarantee, or published fact (Directive 7).
import type { Archetype } from '@/lib/archetypes'
import type { JsonSchema } from '@/lib/schemas/spec'

const DRAFT_DISCIPLINE =
  'Your output is a DRAFT for a human operator to review and edit — never a final decision, ' +
  'a price guarantee, or a published fact. Return ONLY the requested JSON, no prose around it. ' +
  'Include a numeric `confidence` between 0 and 1.'

// ── (1) Triage ───────────────────────────────────────────────────────────────

export interface TriagePromptLane {
  laneCode: string
  laneName: string
  archetype: Archetype
}
export interface TriagePromptAccount {
  id: string
  name: string
  country?: string | null
}

export function buildTriagePrompt(input: {
  inboundText: string
  lanes: TriagePromptLane[]
  accounts?: TriagePromptAccount[]
}): { system: string; user: string } {
  const laneList = input.lanes
    .map((l) => `- ${l.laneCode} · ${l.laneName} (archetype: ${l.archetype})`)
    .join('\n')
  const accountList =
    input.accounts && input.accounts.length > 0
      ? input.accounts
          .map((a) => `- id=${a.id} · ${a.name}${a.country ? ` (${a.country})` : ''}`)
          .join('\n')
      : '(none supplied)'

  const system = [
    'You triage inbound wholesale trade enquiries (RFQs) for Wings Global Trade.',
    'Classify each enquiry to exactly ONE lane from the candidate list — return its lane CODE verbatim.',
    'Choose the lane whose archetype matches how the buyer buys, not merely the product category.',
    'If the enquiry clearly belongs to one of the listed accounts, return its id as accountMatch; otherwise null.',
    'Draft a short first reply in BOTH Spanish and English — technical, direct, no exclamation marks, no prices.',
    DRAFT_DISCIPLINE,
    '',
    'Return JSON exactly of this shape:',
    '{"laneCode": string, "accountId": string|null, "draftReplyEs": string, "draftReplyEn": string, "confidence": number, "rationale": string}',
  ].join('\n')

  const user = [
    'CANDIDATE LANES:',
    laneList,
    '',
    'KNOWN ACCOUNTS (optional match):',
    accountList,
    '',
    'INBOUND ENQUIRY:',
    input.inboundText,
  ].join('\n')

  return { system, user }
}

// ── (2) Lead score ───────────────────────────────────────────────────────────

export function buildLeadScorePrompt(input: {
  archetype: Archetype
  account: { name: string; country?: string | null; region?: string | null }
  signals: string
}): { system: string; user: string } {
  const system = [
    `You score a wholesale trade account's readiness to transact, 0–100, for a ${input.archetype} lane.`,
    'Weigh behaviour that matches how this archetype buys: enquiry depth, volume/CBM signals, repeat contact,',
    'stage progression, document requests, and fit of destination market.',
    'List the factors that drove the score, each with a signed weight (roughly points) and a bilingual label.',
    DRAFT_DISCIPLINE,
    '',
    'Return JSON exactly of this shape:',
    '{"score": number, "confidence": number, "factors": [{"labelEs": string, "labelEn": string, "weight": number, "detail": string}]}',
  ].join('\n')

  const user = [
    `ACCOUNT: ${input.account.name}${input.account.country ? ` · ${input.account.country}` : ''}${
      input.account.region ? ` · ${input.account.region}` : ''
    }`,
    '',
    'OBSERVED SIGNALS (rollups + pipeline history):',
    input.signals,
  ].join('\n')

  return { system, user }
}

// ── (3) Spec extract ─────────────────────────────────────────────────────────

/**
 * The archetype's JSON-Schema is embedded so the model extracts to the exact
 * field keys SpecForm/SpecView expect — the extracted `specs` object is later
 * validated against `getSpecSchema(archetype)` at approval and written as a DRAFT
 * product (never PUBLISHED).
 */
export function buildSpecExtractPrompt(input: {
  archetype: Archetype
  schema: JsonSchema
  documentText: string
}): { system: string; user: string } {
  const fieldHints = Object.entries(input.schema.properties)
    .map(([key, p]) => {
      const req = input.schema.required.includes(key) ? ' [required]' : ''
      const unit = p['x-unit'] ? ` (${p['x-unit']})` : ''
      return `- ${key}: ${p.type}${unit} — ${p['x-label'].en}${req}`
    })
    .join('\n')

  const system = [
    `You extract a product spec sheet from a supplier document for a ${input.archetype} lane.`,
    'Populate ONLY the fields in the schema below, using the exact JSON keys. Omit a field you cannot find —',
    'never guess a value. Numbers must be numeric (no units in the value). Localized fields take {es, en}.',
    'Give a per-field confidence 0–1 in fieldConfidences so the reviewer knows what to double-check.',
    'Propose a bilingual product name and a kebab-case slug.',
    DRAFT_DISCIPLINE,
    '',
    'SCHEMA FIELDS:',
    fieldHints,
    '',
    'Return JSON exactly of this shape:',
    '{"nameEs": string, "nameEn": string, "suggestedSlug": string, "hsCode": string, ' +
      '"specs": {<schemaKey>: value}, "fieldConfidences": {<schemaKey>: number}, "overallConfidence": number}',
  ].join('\n')

  const user = ['SUPPLIER DOCUMENT:', input.documentText].join('\n')
  return { system, user }
}

// ── (4) Weekly lane brief ────────────────────────────────────────────────────

export function buildWeeklyBriefPrompt(input: {
  laneName: string
  archetype: Archetype
  week: string
  rollupsSummary: string
  pipelineSummary: string
}): { system: string; user: string } {
  const system = [
    `You write a concise weekly operating brief for the "${input.laneName}" lane (${input.archetype}).`,
    'Audience: the lane director. Summarize what moved this week, what needs attention, and what to do next.',
    'Use wholesale vocabulary (RFQs, quotes, containers, CBM, lead times) — never retail language.',
    'Write in Markdown. Include a "## Highlights" section with 3–6 bullet points. Keep it under ~400 words.',
    'This is a DRAFT the director will edit before it is shared — do not assert unverified figures as final.',
    'Write the brief in Spanish, with an English "## Summary (EN)" section of 2–3 lines at the end.',
  ].join('\n')

  const user = [
    `WEEK: ${input.week}`,
    '',
    'METRIC ROLLUPS (this week):',
    input.rollupsSummary,
    '',
    'PIPELINE SNAPSHOT:',
    input.pipelineSummary,
  ].join('\n')

  return { system, user }
}
