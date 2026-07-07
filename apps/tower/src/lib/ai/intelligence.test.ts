import { describe, expect, it } from 'vitest'
import {
  clampConfidence,
  clampScore,
  extractJsonObject,
  slugify,
  parseTriageDraft,
  parseLeadScoreDraft,
  parseSpecExtractDraft,
  parseWeeklyBriefDraft,
  type TriageLaneCandidate,
} from './parse'
import { runTriage, type TriageLane } from './triage'
import { runSpecExtract } from './spec-extract'
import type { IntelligenceClient } from './client'

// ── Fake model client (no SDK, no network) ───────────────────────────────────
function fakeClient(opts: { complete?: string; stream?: string }): IntelligenceClient {
  return {
    async complete() {
      return opts.complete ?? ''
    },
    async *stream() {
      const chunks = (opts.stream ?? '').match(/[\s\S]{1,12}/g) ?? []
      for (const c of chunks) yield c
    },
  }
}

// ── Numeric clamps ────────────────────────────────────────────────────────────
describe('clampConfidence', () => {
  it('passes through a 0–1 value', () => {
    expect(clampConfidence(0.42)).toBe(0.42)
  })
  it('scales a 0–100 percentage to 0–1', () => {
    expect(clampConfidence(87)).toBeCloseTo(0.87)
  })
  it('floors non-numbers and clamps out-of-range', () => {
    expect(clampConfidence('nope')).toBe(0)
    expect(clampConfidence(-3)).toBe(0)
    expect(clampConfidence(150)).toBe(1)
  })
})

describe('clampScore', () => {
  it('scales 0–1 to a 0–100 integer', () => {
    expect(clampScore(0.8)).toBe(80)
  })
  it('rounds and clamps 0–100 input', () => {
    expect(clampScore(84.6)).toBe(85)
    expect(clampScore(120)).toBe(100)
    expect(clampScore(-5)).toBe(0)
  })
})

describe('extractJsonObject', () => {
  it('reads a fenced ```json block', () => {
    expect(extractJsonObject('prose\n```json\n{"a":1}\n```\nmore')).toEqual({ a: 1 })
  })
  it('reads a bare object embedded in prose', () => {
    expect(extractJsonObject('here: {"laneCode":"WGT/01"} ok')).toEqual({ laneCode: 'WGT/01' })
  })
  it('returns null when there is no object', () => {
    expect(extractJsonObject('no json here')).toBeNull()
  })
})

describe('slugify', () => {
  it('produces a kebab slug without accents', () => {
    expect(slugify('Excavadora Hidráulica 320D')).toBe('excavadora-hidraulica-320d')
  })
})

// ── (1) Triage parser ─────────────────────────────────────────────────────────
const candidates: TriageLaneCandidate[] = [
  { laneId: 'lane-uuid-1', laneCode: 'WGT/01', archetype: 'EQUIPMENT', defaultStage: 'inquiry' },
  { laneId: 'lane-uuid-3', laneCode: 'WGT/03', archetype: 'COMMODITY', defaultStage: 'inquiry' },
]

describe('parseTriageDraft', () => {
  it('resolves the model lane code to a real lane id and clamps confidence', () => {
    const text = JSON.stringify({
      laneCode: 'wgt/03',
      accountId: null,
      draftReplyEs: 'Hola',
      draftReplyEn: 'Hello',
      confidence: 92,
      rationale: 'grain volume enquiry',
    })
    const res = parseTriageDraft(text, candidates)
    expect(res.ok).toBe(true)
    if (!res.ok) return
    expect(res.value.payload.proposedLaneId).toBe('lane-uuid-3')
    expect(res.value.payload.proposedArchetype).toBe('COMMODITY')
    expect(res.value.payload.proposedStage).toBe('inquiry')
    expect(res.value.payload.draftReply).toEqual({ es: 'Hola', en: 'Hello' })
    expect(res.value.confidence).toBeCloseTo(0.92)
  })
  it('fails (drafts nothing) when the lane code is not a candidate', () => {
    const res = parseTriageDraft(JSON.stringify({ laneCode: 'WGT/99' }), candidates)
    expect(res.ok).toBe(false)
  })
  it('mirrors a single-language reply across both sides', () => {
    const res = parseTriageDraft(JSON.stringify({ laneCode: 'WGT/01', draftReplyEn: 'Only EN' }), candidates)
    expect(res.ok).toBe(true)
    if (!res.ok) return
    expect(res.value.payload.draftReply).toEqual({ es: 'Only EN', en: 'Only EN' })
  })
})

// ── (2) Lead-score parser ─────────────────────────────────────────────────────
describe('parseLeadScoreDraft', () => {
  it('clamps the score and normalizes factor weights', () => {
    const text = JSON.stringify({
      score: 73,
      confidence: 0.6,
      factors: [{ labelEs: 'Volumen', labelEn: 'Volume', weight: 30.4, detail: 'multiple containers' }],
    })
    const res = parseLeadScoreDraft(text)
    expect(res.ok).toBe(true)
    if (!res.ok) return
    expect(res.value.payload.score).toBe(73)
    expect(res.value.payload.factors[0]).toEqual({
      label: { es: 'Volumen', en: 'Volume' },
      weight: 30,
      detail: 'multiple containers',
    })
  })
})

// ── (3) Spec-extract parser ───────────────────────────────────────────────────
describe('parseSpecExtractDraft', () => {
  it('keeps specs verbatim, averages field confidence, and forces the resolved archetype', () => {
    const text = JSON.stringify({
      nameEs: 'Tractor', nameEn: 'Tractor',
      suggestedSlug: 'YTO-X904',
      hsCode: '8701.92',
      specs: { model: 'X904', powerRatingKw: 66 },
      fieldConfidences: { model: 0.9, powerRatingKw: 0.7 },
    })
    const res = parseSpecExtractDraft(text, 'EQUIPMENT')
    expect(res.ok).toBe(true)
    if (!res.ok) return
    expect(res.value.core.archetype).toBe('EQUIPMENT')
    expect(res.value.core.specs).toEqual({ model: 'X904', powerRatingKw: 66 })
    expect(res.value.core.suggestedSlug).toBe('yto-x904')
    expect(res.value.confidence).toBeCloseTo(0.8) // (0.9 + 0.7) / 2
  })
})

// ── (4) Weekly-brief parser ───────────────────────────────────────────────────
describe('parseWeeklyBriefDraft', () => {
  it('lifts highlight bullets out of the markdown', () => {
    const md = '# Brief\n\n## Highlights\n- Two new RFQs\n- One container booked\n\n## Summary (EN)\nGood week.'
    const res = parseWeeklyBriefDraft(md)
    expect(res.ok).toBe(true)
    if (!res.ok) return
    expect(res.value.highlights).toEqual(['Two new RFQs', 'One container booked'])
    expect(res.value.markdown).toContain('# Brief')
  })
  it('fails on an empty brief', () => {
    expect(parseWeeklyBriefDraft('   ').ok).toBe(false)
  })
})

// ── Orchestrators against a fake client (Claude client mocked) ────────────────
describe('runTriage (fake client)', () => {
  const lanes: TriageLane[] = candidates.map((c, i) => ({ ...c, laneName: `Lane ${i}` }))

  it('produces a confidence-scored draft envelope from model text', async () => {
    const client = fakeClient({
      complete: JSON.stringify({ laneCode: 'WGT/01', draftReplyEs: 'a', draftReplyEn: 'b', confidence: 0.55 }),
    })
    const draft = await runTriage(client, { inboundText: 'need 2 excavators', lanes })
    expect(draft.model).toBe('claude-haiku-4-5-20251001')
    expect(draft.draft.proposedLaneId).toBe('lane-uuid-1')
    expect(draft.confidence).toBeCloseTo(0.55)
  })

  it('throws (no draft) when the model returns unusable text', async () => {
    const client = fakeClient({ complete: 'sorry, no idea' })
    await expect(runTriage(client, { inboundText: 'x', lanes })).rejects.toThrow(/triage parse failed/)
  })
})

describe('runSpecExtract (fake streaming client)', () => {
  it('buffers the stream then finalizes a typed draft', async () => {
    const client = fakeClient({
      stream: JSON.stringify({
        nameEs: 'Bomba', nameEn: 'Pump', suggestedSlug: 'pump-1',
        specs: { model: 'P1' }, fieldConfidences: { model: 0.95 }, overallConfidence: 0.9,
      }),
    })
    const draft = await runSpecExtract(client, {
      archetype: 'EQUIPMENT',
      laneId: 'lane-uuid-1',
      documentText: 'datasheet…',
      sourcePath: 'brand/lane/doc.pdf',
    })
    expect(draft.model).toBe('claude-sonnet-5')
    expect(draft.draft.laneId).toBe('lane-uuid-1')
    expect(draft.draft.sourcePath).toBe('brand/lane/doc.pdf')
    expect(draft.draft.specs).toEqual({ model: 'P1' })
    expect(draft.confidence).toBeCloseTo(0.9)
  })
})
