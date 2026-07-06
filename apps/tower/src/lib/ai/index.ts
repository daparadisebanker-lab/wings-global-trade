// src/lib/ai — Tower Intelligence (Claude API) surface.
//
// STUB — filled in Wave 4 (Intelligence). Per ARCHITECTURE.md:
//   claude-haiku-4-5  → triage / classification / nightly account scoring
//   claude-sonnet-4-6 → spec extraction, weekly briefs, Mister supervision
// Directive 7: Intelligence proposes, humans dispose — every AI output lands as a
// reviewable draft with confidence shown; nothing auto-commits to published state.
//
// The MisterConsole (Intelligence module) reviews transcripts against the Mister
// client contract, imported here so @wings/mister is wired from day one.
import type { MisterLocale, MisterArchetype } from '@wings/mister'

/** Confidence-scored draft envelope — the shape every AI action returns. */
export interface AiDraft<T> {
  draft: T
  /** 0–1 model confidence, always shown to the human reviewer. */
  confidence: number
  model: 'claude-haiku-4-5' | 'claude-sonnet-4-6'
}

/** Locale used when Intelligence drafts ES/EN/NL/DE copy. */
export type IntelligenceLocale = MisterLocale

/** Placeholder — real triage lands in Wave 4 (see API_MAP POST /api/ai/triage). */
export type TriageArchetype = MisterArchetype

export {}
