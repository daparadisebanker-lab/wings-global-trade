// src/lib/torre/agent/run.test.ts
import { describe, it, expect, vi } from 'vitest'
import type { IntelligenceClient } from '@/lib/ai/client'
import type { AnthropicLike, RawBlock } from './anthropic-runner'
import type { QuoteToolResult, TorreToolProvider } from './tools'
import { runTorreAgent, type TorreAgentEvent } from './run'

type CreateBody = Parameters<AnthropicLike['messages']['create']>[0]

function fakeRouterClient(reply: string): IntelligenceClient {
  return {
    complete: vi.fn(async () => reply),
    async *stream() {
      yield ''
    },
  }
}

function fakeProvider(over: Partial<TorreToolProvider> = {}): TorreToolProvider {
  return {
    getImport: vi.fn(async () => null),
    getParties: vi.fn(async () => []),
    getRates: vi.fn(async () => []),
    getTariff: vi.fn(async () => []),
    getCostingConfig: vi.fn(async () => ({ igvRate: 0.18, percepcionRate: 0.035, insuranceRate: 0.015, exchangeRate: 3.7, adValoremDefault: 0.06, sources: [] })),
    searchKnowledge: vi.fn(async () => []),
    proposeQuote: vi.fn(async () => ({ draftIds: null, approvable: false, blockers: [], persisted: false } as QuoteToolResult)),
    draftMessage: vi.fn(async () => ({ draftId: 'm' })),
    ...over,
  }
}

/** A scripted tool-use SDK: returns the i-th response per call. */
function fakeSdk(responses: { content: RawBlock[]; stop_reason: string }[]): { sdk: AnthropicLike; create: ReturnType<typeof vi.fn> } {
  let call = 0
  const create = vi.fn(async (_body: CreateBody) => responses[Math.min(call++, responses.length - 1)])
  return { sdk: { messages: { create } }, create }
}

describe('runTorreAgent', () => {
  it('routes, scopes the belt to the profile, runs the loop, and emits events in order', async () => {
    // router → cotizador; model calls get_tariff, then finishes.
    const router = fakeRouterClient('{"profile":"cotizador","urgency":"normal","reason":"cotización"}')
    const { sdk, create } = fakeSdk([
      { content: [{ type: 'tool_use', id: 'c1', name: 'get_tariff', input: { productText: 'motor' } }], stop_reason: 'tool_use' },
      { content: [{ type: 'text', text: 'listo' }], stop_reason: 'end_turn' },
    ])
    const getTariff = vi.fn(async () => [])
    const events: TorreAgentEvent[] = []

    const outcome = await runTorreAgent({
      routerClient: router,
      sdk,
      provider: fakeProvider({ getTariff }),
      text: 'Cotiza un motor diésel FOB 10000',
      today: '2026-07-24',
      onEvent: (e) => {
        events.push(e)
      },
    })

    expect(outcome.decision.profile).toBe('cotizador')
    expect(outcome.result.stopReason).toBe('stop')
    expect(outcome.result.finalText).toBe('listo')
    expect(getTariff).toHaveBeenCalledOnce()

    // event order: route → step(get_tariff) → step(terminal) → final
    expect(events[0].type).toBe('route')
    const stepEvents = events.filter((e) => e.type === 'step')
    expect(stepEvents[0]).toMatchObject({ type: 'step', calls: [{ name: 'get_tariff', isError: false }] })
    expect(events[events.length - 1]).toMatchObject({ type: 'final', text: 'listo', stopReason: 'stop' })
  })

  it("enforces the profile's tool scope — the model cannot call a denied tool", async () => {
    // router → redactor (denied compute_landed_cost); model tries it anyway.
    const router = fakeRouterClient('{"profile":"redactor","urgency":"normal"}')
    const { sdk } = fakeSdk([
      { content: [{ type: 'tool_use', id: 'c1', name: 'compute_landed_cost', input: {} }], stop_reason: 'tool_use' },
      { content: [{ type: 'text', text: 'no puedo calcular' }], stop_reason: 'end_turn' },
    ])
    const events: TorreAgentEvent[] = []
    const outcome = await runTorreAgent({
      routerClient: router,
      sdk,
      provider: fakeProvider(),
      text: 'Redacta un correo',
      today: '2026-07-24',
      onEvent: (e) => {
        events.push(e)
      },
    })
    // compute_landed_cost isn't in redactor's belt → dispatched as an unknown-tool error
    const step = events.find((e) => e.type === 'step' && e.calls.length > 0)
    expect(step).toMatchObject({ calls: [{ name: 'compute_landed_cost', isError: true }] })
    expect(outcome.profile.id).toBe('redactor')
  })

  it('falls back to the heuristic router when no router client is configured', async () => {
    const { sdk } = fakeSdk([{ content: [{ type: 'text', text: 'ok' }], stop_reason: 'end_turn' }])
    const outcome = await runTorreAgent({
      routerClient: null,
      sdk,
      provider: fakeProvider(),
      text: 'Redacta un correo al cliente',
      today: '2026-07-24',
    })
    expect(outcome.decision.source).toBe('heuristic')
    expect(outcome.decision.profile).toBe('redactor')
  })

  it('passes the profile system prompt and scoped tools to the model', async () => {
    const router = fakeRouterClient('{"profile":"cotizador","urgency":"normal"}')
    const { sdk, create } = fakeSdk([{ content: [{ type: 'text', text: 'ok' }], stop_reason: 'end_turn' }])
    await runTorreAgent({ routerClient: router, sdk, provider: fakeProvider(), text: 'cotiza', today: '2026-07-24' })
    const body = create.mock.calls[0][0] as CreateBody
    expect(body.system).toContain('PERFIL: COTIZADOR')
    const toolNames = (body.tools ?? []).map((t) => t.name)
    // cotizador scope: has propose_quote, denied draft_message
    expect(toolNames).toContain('propose_quote')
    expect(toolNames).not.toContain('draft_message')
  })
})
