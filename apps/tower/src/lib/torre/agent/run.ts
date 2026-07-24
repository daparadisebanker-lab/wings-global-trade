// src/lib/torre/agent/run.ts
// Mister Torre — the run orchestrator (Foundation C1 core). Composes the pieces into
// one streamable run:
//   route intent (router.ts) → pick profile (profiles.ts) → scope the belt (tools.ts)
//   → drive the tool loop (tool-loop.ts) with the Anthropic adapter (anthropic-runner.ts)
// emitting typed events as it goes. It is INJECTED with both model seams and the data
// provider, so it runs fully under fakes in tests (no key, no DB) and the SSE route
// (route.ts) is a thin wrapper that turns these events into `text/event-stream` frames.
//
// Two model seams, deliberately: the router is a fast single-shot classifier
// (IntelligenceClient), the loop needs tool_use (AnthropicLike). One run, two tiers.
import type { IntelligenceClient } from '@/lib/ai/client'
import { runToolLoop, type AgentResult, type AgentStep } from './tool-loop'
import { makeAnthropicNextTurn, type AnthropicLike } from './anthropic-runner'
import { buildTorreToolBelt, type TorreToolProvider } from './tools'
import { getProfile, profileSystem, selectProfileTools, type TorreProfile } from './profiles'
import { routeIntent, type RouterDecision } from './router'

/** The typed events a run emits (the SSE route maps 1:1 to `event:`/`data:` frames). */
export type TorreAgentEvent =
  | { type: 'route'; decision: RouterDecision; profile: { id: string; label: { es: string; en: string } } }
  | {
      type: 'step'
      index: number
      /** The model's narration for this turn (may be empty). */
      text: string
      /** Tool calls the model made this turn (name + whether the result errored). */
      calls: { name: string; isError: boolean }[]
    }
  | { type: 'final'; text: string; stopReason: AgentResult['stopReason']; stopHint?: string; toolCallCount: number }

export interface RunTorreAgentInput {
  /** Router seam (fast classify). Null → the deterministic heuristic router is used. */
  routerClient: IntelligenceClient | null
  /** Tool-use seam for the orchestrated loop (wrap the real SDK with wrapAnthropic). */
  sdk: AnthropicLike
  /** The data layer (RLS-scoped in production; a fake in tests). */
  provider: TorreToolProvider
  /** The operator's request. */
  text: string
  /** ISO date for freshness views. */
  today: string
  maxSteps?: number
  signal?: AbortSignal
  /** Streaming observer — receives each event as it happens. */
  onEvent?: (e: TorreAgentEvent) => void | Promise<void>
}

export interface TorreAgentOutcome {
  decision: RouterDecision
  profile: TorreProfile
  result: AgentResult
}

/** Map a completed loop step into the compact `step` event payload. */
function stepEvent(step: AgentStep, index: number): TorreAgentEvent {
  const errById = new Map(step.results.map((r) => [r.id, r.isError]))
  return {
    type: 'step',
    index,
    text: step.turn.text,
    calls: step.turn.toolCalls.map((c) => ({ name: c.name, isError: errById.get(c.id) ?? false })),
  }
}

/**
 * Run one Mister Torre turn end-to-end, streaming events. Returns the router decision,
 * the chosen profile, and the loop result. Never sends/commits — any mutation happens
 * inside the profile's scoped tools, which terminate in ai_drafts DRAFTs.
 */
export async function runTorreAgent(input: RunTorreAgentInput): Promise<TorreAgentOutcome> {
  const emit = async (e: TorreAgentEvent) => {
    if (!input.onEvent) return
    try {
      await input.onEvent(e)
    } catch {
      // a broken/aborted emitter must never crash the run
    }
  }

  // 1) Route → profile.
  const decision = await routeIntent(input.routerClient, input.text)
  const profile = getProfile(decision.profile)
  await emit({ type: 'route', decision, profile: { id: profile.id, label: profile.label } })

  // 2) Scope the belt to the profile (the allow-list is a governance boundary).
  const belt = buildTorreToolBelt(input.provider, { today: input.today })
  const tools = selectProfileTools(profile, belt)

  // 3) Drive the loop with the profile's system prompt, streaming each step.
  const nextTurn = makeAnthropicNextTurn({
    sdk: input.sdk,
    model: profile.model,
    system: profileSystem(profile),
    tools,
    userMessage: input.text,
    signal: input.signal, // abort the in-flight model call on client disconnect, not just between steps
  })
  const result = await runToolLoop({
    nextTurn,
    tools,
    maxSteps: input.maxSteps,
    signal: input.signal,
    onStep: (step, index) => emit(stepEvent(step, index)),
  })

  await emit({
    type: 'final',
    text: result.finalText,
    stopReason: result.stopReason,
    stopHint: result.stopHint,
    toolCallCount: result.toolCallCount,
  })

  return { decision, profile, result }
}
