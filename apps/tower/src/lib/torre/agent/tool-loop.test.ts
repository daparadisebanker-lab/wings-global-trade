// src/lib/torre/agent/tool-loop.test.ts
import { describe, it, expect, vi } from 'vitest'
import { runToolLoop, type AgentStep, type AgentTool, type ModelTurn } from './tool-loop'

const echoTool: AgentTool = {
  name: 'echo',
  description: 'echo',
  inputSchema: {},
  run: (input) => `echoed:${(input as { v?: string }).v ?? ''}`,
}

/** A scripted nextTurn: returns the i-th turn from a fixed list. */
function scripted(turns: ModelTurn[]) {
  return async (steps: AgentStep[]) => turns[steps.length] ?? { text: 'done', toolCalls: [] }
}

describe('runToolLoop', () => {
  it('returns immediately when the model makes no tool calls', async () => {
    const r = await runToolLoop({ nextTurn: scripted([{ text: 'hola', toolCalls: [] }]), tools: [] })
    expect(r.finalText).toBe('hola')
    expect(r.stopReason).toBe('stop')
    expect(r.toolCallCount).toBe(0)
  })

  it('dispatches a tool call, feeds the result back, and finishes', async () => {
    const r = await runToolLoop({
      nextTurn: scripted([
        { text: '', toolCalls: [{ id: 't1', name: 'echo', input: { v: 'x' } }] },
        { text: 'final', toolCalls: [] },
      ]),
      tools: [echoTool],
    })
    expect(r.stopReason).toBe('stop')
    expect(r.finalText).toBe('final')
    expect(r.toolCallCount).toBe(1)
    expect(r.steps[0].results[0].content).toBe('echoed:x')
    expect(r.steps[0].results[0].isError).toBe(false)
  })

  it('captures an unknown tool as an error result (no crash)', async () => {
    const r = await runToolLoop({
      nextTurn: scripted([
        { text: '', toolCalls: [{ id: 't1', name: 'nope', input: {} }] },
        { text: 'ok', toolCalls: [] },
      ]),
      tools: [echoTool],
    })
    expect(r.steps[0].results[0].isError).toBe(true)
    expect(r.steps[0].results[0].content).toMatch(/unknown tool "nope"/)
    expect(r.finalText).toBe('ok')
  })

  it('captures a throwing tool as an error result the model can recover from', async () => {
    const boom: AgentTool = {
      name: 'boom',
      description: 'throws',
      inputSchema: {},
      run: () => {
        throw new Error('kaboom')
      },
    }
    const r = await runToolLoop({
      nextTurn: scripted([
        { text: '', toolCalls: [{ id: 't1', name: 'boom', input: {} }] },
        { text: 'recovered', toolCalls: [] },
      ]),
      tools: [boom],
    })
    expect(r.steps[0].results[0].isError).toBe(true)
    expect(r.steps[0].results[0].content).toMatch(/kaboom/)
    expect(r.finalText).toBe('recovered')
  })

  it('runs multiple tool calls in one turn', async () => {
    const r = await runToolLoop({
      nextTurn: scripted([
        {
          text: '',
          toolCalls: [
            { id: 'a', name: 'echo', input: { v: '1' } },
            { id: 'b', name: 'echo', input: { v: '2' } },
          ],
        },
        { text: 'both', toolCalls: [] },
      ]),
      tools: [echoTool],
    })
    expect(r.toolCallCount).toBe(2)
    expect(r.steps[0].results.map((x) => x.content)).toEqual(['echoed:1', 'echoed:2'])
  })

  it('stops at maxSteps if the model keeps calling tools (runaway guard)', async () => {
    // a nextTurn that ALWAYS wants a tool
    const always = async () => ({ text: 'more', toolCalls: [{ id: 't', name: 'echo', input: {} }] })
    const r = await runToolLoop({ nextTurn: always, tools: [echoTool], maxSteps: 3 })
    expect(r.stopReason).toBe('max_steps')
    expect(r.steps).toHaveLength(3)
    expect(r.toolCallCount).toBe(3)
  })

  it('passes the accumulating transcript to nextTurn each round', async () => {
    const seen: number[] = []
    const nextTurn = vi.fn(async (steps: AgentStep[]) => {
      seen.push(steps.length)
      return steps.length < 2
        ? { text: '', toolCalls: [{ id: `t${steps.length}`, name: 'echo', input: {} }] }
        : { text: 'end', toolCalls: [] }
    })
    await runToolLoop({ nextTurn, tools: [echoTool], maxSteps: 5 })
    expect(seen).toEqual([0, 1, 2]) // transcript grows each round
  })
})
