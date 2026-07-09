// src/lib/ai — TOWER Intelligence (the Claude API layer, Wave 4).
//
//   claude-haiku-4-5-20251001 → triage / lead scoring (classify tier)
//   claude-sonnet-5           → spec extraction, weekly briefs (reason tier)
//
// Directive 7 (CLAUDE.md core law): Intelligence proposes, humans dispose. Every
// output here is an AiDraft with its confidence shown; it lands as an
// AiDraftRecord (status DRAFT) and NEVER auto-commits to published state, quotes,
// or knowledge packs. Approval is a separate human server action —
// lib/actions/intelligence.ts (the contract W4.C's review UI consumes).
//
// Layers: parse.ts (pure) ← {triage,score,spec-extract,brief}.ts (orchestrators,
// take an IntelligenceClient) ← client.ts (the SDK wrapper). Routes under
// app/api/intelligence/** call the orchestrators and persist the drafts.
export * from './types'
export {
  getIntelligenceClient,
  isIntelligenceConfigured,
  type IntelligenceClient,
  type CompletionRequest,
} from './client'
export {
  clampConfidence,
  clampScore,
  extractJsonObject,
  slugify,
  parseTriageDraft,
  parseLeadScoreDraft,
  parseSpecExtractDraft,
  parseWeeklyBriefDraft,
  WEEKLY_BRIEF_CONFIDENCE,
  type ParseResult,
  type TriageLaneCandidate,
  type SpecExtractDraftCore,
} from './parse'
export {
  buildTriagePrompt,
  buildLeadScorePrompt,
  buildSpecExtractPrompt,
  buildWeeklyBriefPrompt,
  type TriagePromptLane,
  type TriagePromptAccount,
} from './prompts'
export { runTriage, type TriageContext, type TriageLane } from './triage'
export { runLeadScore, type LeadScoreContext } from './score'
export {
  streamSpecExtract,
  finalizeSpecExtract,
  runSpecExtract,
  type SpecExtractContext,
} from './spec-extract'
export { runWeeklyBrief, type WeeklyBriefContext } from './brief'
