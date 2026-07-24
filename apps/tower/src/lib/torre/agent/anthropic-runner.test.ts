// src/lib/torre/agent/anthropic-runner.test.ts
import { describe, it, expect, vi } from 'vitest'
import { runToolLoop, type AgentStep, type AgentTool } from './tool-loop'
import {
  makeAnthropicNextTurn,
  parseAssistantContent,
  stepsToMessages,
  toolToAnthropicSchema,
  type AnthropicLike,
  type RawBlock,
} from './anthropic-runner'

type CreateBody = Parameters<AnthropicLike['messages']['create']>[0]

const readTool: AgentTool = {
  name: 'get_x',
  description: 'reads x',
  access: 'read',
  inputSchema: { type: 'object', properties: { q: { type: 'string' } } },
  run: (i) => `x:${(i as { q?: string }).q ?? ''}`,
}

describe('toolToAnthropicSchema', () => {
  it('maps to {name, description, input_schema}', () => {
    expect(toolToAnthropicSchema(readTool)).toEqual({
      name: 'get_x',
      description: 'reads x',
      input_schema: { type: 'object', properties: { q: { type: 'string' } } },
    })
  })
})

describe('stepsToMessages', () => {
  it('starts with just the user turn when the transcript is empty', () => {
    expect(stepsToMessages('cotiza esto', [])).toEqual([{ role: 'user', content: 'cotiza esto' }])
  })

  it('emits assistant(text+tool_use) then user(tool_result) for an executed step', () => {
    const steps: AgentStep[] = [
      {
        turn: { text: 'pensando', toolCalls: [{ id: 'c1', name: 'get_x', input: { q: 'a' } }] },
        results: [{ id: 'c1', content: 'x:a', isError: false }],
      },
    ]
    const msgs = stepsToMessages('hola', steps)
    expect(msgs).toEqual([
      { role: 'user', content: 'hola' },
      {
        role: 'assistant',
        content: [
          { type: 'text', text: 'pensando' },
          { type: 'tool_use', id: 'c1', name: 'get_x', input: { q: 'a' } },
        ],
      },
      { role: 'user', content: [{ type: 'tool_result', tool_use_id: 'c1', content: 'x:a', is_error: false }] },
    ])
  })

  it('omits an empty assistant text block (API rejects empty text)', () => {
    const steps: AgentStep[] = [
      { turn: { text: '', toolCalls: [{ id: 'c1', name: 'get_x', input: {} }] }, results: [{ id: 'c1', content: 'x:', isError: false }] },
    ]
    const assistant = stepsToMessages('hola', steps)[1]
    expect(assistant.content).toEqual([{ type: 'tool_use', id: 'c1', name: 'get_x', input: {} }])
  })

  it('propagates is_error on tool_result blocks', () => {
    const steps: AgentStep[] = [
      { turn: { text: '', toolCalls: [{ id: 'c1', name: 'get_x', input: {} }] }, results: [{ id: 'c1', content: 'Error: boom', isError: true }] },
    ]
    const user = stepsToMessages('hola', steps)[2]
    expect(user.content).toEqual([{ type: 'tool_result', tool_use_id: 'c1', content: 'Error: boom', is_error: true }])
  })

  it('skips a terminal (no-tool-call) step — nothing to replay', () => {
    const steps: AgentStep[] = [
      { turn: { text: 'final', toolCalls: [] }, results: [] },
    ]
    expect(stepsToMessages('hola', steps)).toEqual([{ role: 'user', content: 'hola' }])
  })

  it('preserves order for a multi-tool_use turn (each call answered in order)', () => {
    const steps: AgentStep[] = [
      {
        turn: {
          text: '',
          toolCalls: [
            { id: 'a', name: 'get_x', input: { q: '1' } },
            { id: 'b', name: 'get_x', input: { q: '2' } },
          ],
        },
        results: [
          { id: 'a', content: 'x:1', isError: false },
          { id: 'b', content: 'x:2', isError: false },
        ],
      },
    ]
    const [, assistant, user] = stepsToMessages('go', steps)
    expect(assistant.content).toEqual([
      { type: 'tool_use', id: 'a', name: 'get_x', input: { q: '1' } },
      { type: 'tool_use', id: 'b', name: 'get_x', input: { q: '2' } },
    ])
    expect(user.content).toEqual([
      { type: 'tool_result', tool_use_id: 'a', content: 'x:1', is_error: false },
      { type: 'tool_result', tool_use_id: 'b', content: 'x:2', is_error: false },
    ])
  })
})

describe('parseAssistantContent', () => {
  it('concatenates text blocks and collects tool_use calls', () => {
    const blocks: RawBlock[] = [
      { type: 'text', text: 'a' },
      { type: 'tool_use', id: 't1', name: 'get_x', input: { q: 'z' } },
      { type: 'text', text: 'b' },
    ]
    const turn = parseAssistantContent(blocks, 'tool_use')
    expect(turn.text).toBe('ab')
    expect(turn.toolCalls).toEqual([{ id: 't1', name: 'get_x', input: { q: 'z' } }])
    expect(turn.stopHint).toBeUndefined()
  })

  it('ignores unknown block types', () => {
    const blocks: RawBlock[] = [{ type: 'thinking', thinking: '…' }, { type: 'text', text: 'hi' }]
    expect(parseAssistantContent(blocks, 'end_turn')).toEqual({ text: 'hi', toolCalls: [] })
  })

  it('drops tool calls and sets stopHint on max_tokens (truncation)', () => {
    const blocks: RawBlock[] = [
      { type: 'text', text: 'partial' },
      { type: 'tool_use', id: 't1', name: 'get_x', input: {} },
    ]
    const turn = parseAssistantContent(blocks, 'max_tokens')
    expect(turn.toolCalls).toEqual([]) // never dispatch a possibly-truncated call
    expect(turn.stopHint).toBe('max_tokens')
    expect(turn.text).toBe('partial')
  })

  it('drops tool calls and sets stopHint on refusal', () => {
    const turn = parseAssistantContent([{ type: 'text', text: 'no' }], 'refusal')
    expect(turn.stopHint).toBe('refusal')
    expect(turn.toolCalls).toEqual([])
  })

  it('treats a context-window-exceeded stop as abnormal', () => {
    const turn = parseAssistantContent(
      [{ type: 'tool_use', id: 't1', name: 'get_x', input: {} }],
      'model_context_window_exceeded',
    )
    expect(turn.stopHint).toBe('model_context_window_exceeded')
    expect(turn.toolCalls).toEqual([])
  })
})

describe('makeAnthropicNextTurn + runToolLoop (scripted fake SDK)', () => {
  it('drives a full round: model calls a tool, sees the result, then finishes', async () => {
    // Two scripted responses: first a tool_use, then a clean end_turn.
    const responses = [
      { content: [{ type: 'tool_use', id: 'c1', name: 'get_x', input: { q: 'hi' } }] as RawBlock[], stop_reason: 'tool_use' },
      { content: [{ type: 'text', text: 'listo' }] as RawBlock[], stop_reason: 'end_turn' },
    ]
    let call = 0
    const create = vi.fn(async (_body: CreateBody) => responses[call++])
    const sdk: AnthropicLike = { messages: { create } }

    const nextTurn = makeAnthropicNextTurn({
      sdk, model: 'claude-sonnet-5', system: 'S', tools: [readTool], userMessage: 'usa get_x',
    })
    const result = await runToolLoop({ nextTurn, tools: [readTool] })

    expect(result.stopReason).toBe('stop')
    expect(result.finalText).toBe('listo')
    expect(result.toolCallCount).toBe(1)
    expect(result.steps[0].results[0].content).toBe('x:hi')

    // Round 2 sent the assistant tool_use + the tool_result back to the model.
    const secondBody = create.mock.calls[1][0]
    expect(secondBody.messages).toHaveLength(3)
    expect(secondBody.messages[2].content).toEqual([
      { type: 'tool_result', tool_use_id: 'c1', content: 'x:hi', is_error: false },
    ])
    expect(secondBody.tools?.[0]).toMatchObject({ name: 'get_x' })
  })

  it('stops honestly with a stopHint when the model truncates', async () => {
    const create = vi.fn(async (_body: CreateBody) => ({
      content: [{ type: 'text', text: 'medio' }, { type: 'tool_use', id: 'c1', name: 'get_x', input: {} }] as RawBlock[],
      stop_reason: 'max_tokens',
    }))
    const sdk: AnthropicLike = { messages: { create } }
    const nextTurn = makeAnthropicNextTurn({ sdk, model: 'm', system: 'S', tools: [readTool], userMessage: 'go' })
    const result = await runToolLoop({ nextTurn, tools: [readTool] })
    expect(result.stopReason).toBe('stop')
    expect(result.stopHint).toBe('max_tokens')
    expect(result.toolCallCount).toBe(0) // the truncated call was never dispatched
    expect(create).toHaveBeenCalledOnce()
  })

  it('applies the default max_tokens and passes system through', async () => {
    const create = vi.fn(async (_body: CreateBody) => ({ content: [{ type: 'text', text: 'ok' }] as RawBlock[], stop_reason: 'end_turn' }))
    const sdk: AnthropicLike = { messages: { create } }
    const nextTurn = makeAnthropicNextTurn({ sdk, model: 'm', system: 'SYS', tools: [], userMessage: 'hi' })
    await runToolLoop({ nextTurn, tools: [] })
    expect(create.mock.calls[0][0].max_tokens).toBe(4096)
    expect(create.mock.calls[0][0].system).toBe('SYS')
  })
})
