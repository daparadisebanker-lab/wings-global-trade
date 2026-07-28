// The LIVE routing eval — the only test here that talks to the real model.
//
// Every other Mister test drives a fake client, which proves the wiring and
// proves nothing about the half that actually failed: whether the classifier,
// given the real prompt and a real transcript, picks the right capability. That
// is probabilistic, so it needs a scored suite rather than an assertion.
//
// Opt-in by design: with no ANTHROPIC_API_KEY it SKIPS, so `pnpm test` stays
// green, offline and free — the same posture as the deterministic Torre evals
// (lib/torre/evals.test.ts), which is why this lives in its own file.
//
//   pnpm exec vitest run src/lib/copilot/routing.eval.test.ts   # with a key set
//
// GATE: every case in evals/routing.jsonl must land on one of its accepted
// capabilities. The two `screenshot-*` cases are the reported bug — if either
// regresses, the operator is back to reading a capability menu.
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { getIntelligenceClient } from '@/lib/ai/client'
import { classify } from './router'
import type { Turn } from './history'

interface RoutingCase {
  id: string
  note: string
  history: Turn[]
  text: string
  /** Accepted capability ids; `null` means "must NOT route" (the reply path).
   *  More than one is listed where two capabilities are both defensible — the
   *  eval scores whether the operator gets a useful answer, not one exact id. */
  expect: (string | null)[]
}

function loadCases(): RoutingCase[] {
  const path = fileURLToPath(new URL('../../../evals/routing.jsonl', import.meta.url))
  return readFileSync(path, 'utf8')
    .split('\n')
    .filter((l) => l.trim().length > 0)
    .map((l) => JSON.parse(l) as RoutingCase)
}

const client = getIntelligenceClient()

describe.skipIf(!client)('routing eval (live model)', () => {
  const cases = loadCases()

  it.each(cases)('$id — $note', async (c) => {
    const { capabilityId, reply } = await classify(client!, c.text, undefined, c.history)
    // Report what it chose on failure — a routing miss is diagnosed by the id it
    // picked instead, so the message has to carry it.
    expect(
      c.expect.includes(capabilityId),
      `"${c.text}" routed to ${capabilityId ?? 'none'}; expected one of ${c.expect.map(String).join(', ')}`,
    ).toBe(true)

    // The fall-through must ANSWER, not fall to the deterministic menu.
    if (capabilityId === null) expect(reply.length).toBeGreaterThan(0)
  }, 30_000)
})

describe('routing eval (suite integrity)', () => {
  it('is loadable and covers both reported failures', () => {
    const cases = loadCases()
    expect(cases.length).toBeGreaterThanOrEqual(10)
    expect(cases.filter((c) => c.id.startsWith('screenshot-'))).toHaveLength(2)
    // Every case must carry a message and at least one accepted outcome.
    for (const c of cases) {
      expect(c.text.trim().length, c.id).toBeGreaterThan(0)
      expect(c.expect.length, c.id).toBeGreaterThan(0)
    }
  })

  it('names only capabilities that exist (a typo would score as a permanent miss)', async () => {
    const { CAPABILITIES } = await import('./registry')
    const ids = new Set(CAPABILITIES.map((c) => c.id))
    for (const c of loadCases()) {
      for (const want of c.expect) {
        if (want !== null) expect(ids.has(want), `${c.id} expects unknown capability "${want}"`).toBe(true)
      }
    }
  })
})
