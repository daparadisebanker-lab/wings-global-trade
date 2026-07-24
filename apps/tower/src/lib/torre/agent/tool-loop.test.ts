// src/lib/torre/agent/tool-loop.test.ts
import { describe, it, expect, vi } from 'vitest'
import { runToolLoop, type AgentStep, type AgentTool, type ModelTurn } from './tool-loop'

const echoTool: AgentTool = {
  name: 'echo',
  description: 'echo',
  access: 'read',
  inputSchema: {},
  run: (input) => `echoed:${(input as { v?: string }).v ?? ''}`,
}

/** A scripted nextTurn: returns the i-th turn from a fixed list. */
function scripted(turns: ModelTurn[]) {
  return async (steps: readonly AgentStep[]) => turns[steps.length] ?? { text: 'done', toolCalls: [] }
}

describe('runToolLoop', () => {
  it('returns immediately when the model makes no tool calls', async () => {
    const r = await runToolLoop({ nextTurn: scripted([{ text: 'hola', toolCalls: [] }]), tools: [] })
    expect(r.finalText).toBe('hola')
    expect(r.stopReason).toBe('stop')
    expect(r.toolCallCount).toBe(0)
    // The terminal turn is appended so `steps` is a complete transcript.
    expect(r.steps).toHaveLength(1)
    expect(r.steps[0].results).toEqual([])
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
    // tool step + terminal step
    expect(r.steps).toHaveLength(2)
    expect(r.steps[1].turn.text).toBe('final')
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
      access: 'read',
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

  it('captures a non-Error throw via String(e)', async () => {
    const rude: AgentTool = {
      name: 'rude',
      description: 'throws a string',
      access: 'read',
      inputSchema: {},
      run: () => {
        const boom: unknown = 'plain-string-boom' // non-Error throw → exercises String(e)
        throw boom
      },
    }
    const r = await runToolLoop({
      nextTurn: scripted([
        { text: '', toolCalls: [{ id: 't1', name: 'rude', input: {} }] },
        { text: 'ok', toolCalls: [] },
      ]),
      tools: [rude],
    })
    expect(r.steps[0].results[0].isError).toBe(true)
    expect(r.steps[0].results[0].content).toMatch(/plain-string-boom/)
  })

  it('awaits async tools (resolve and reject)', async () => {
    const slow: AgentTool = {
      name: 'slow',
      description: 'async',
      access: 'read',
      inputSchema: {},
      run: async (input) => Promise.resolve(`async:${(input as { v?: string }).v ?? ''}`),
    }
    const slowBoom: AgentTool = {
      name: 'slowBoom',
      description: 'async reject',
      access: 'read',
      inputSchema: {},
      run: async () => Promise.reject(new Error('async-kaboom')),
    }
    const r = await runToolLoop({
      nextTurn: scripted([
        {
          text: '',
          toolCalls: [
            { id: 'a', name: 'slow', input: { v: 'y' } },
            { id: 'b', name: 'slowBoom', input: {} },
          ],
        },
        { text: 'done', toolCalls: [] },
      ]),
      tools: [slow, slowBoom],
    })
    expect(r.steps[0].results[0]).toMatchObject({ content: 'async:y', isError: false })
    expect(r.steps[0].results[1].isError).toBe(true)
    expect(r.steps[0].results[1].content).toMatch(/async-kaboom/)
  })

  it('coerces a non-string tool return to a string (armor)', async () => {
    const objy = {
      name: 'objy',
      description: 'returns an object',
      access: 'read' as const,
      inputSchema: {},
      // Force the JS-caller footgun the loop must survive.
      run: () => ({ nope: true }) as unknown as string,
    }
    const r = await runToolLoop({
      nextTurn: scripted([
        { text: '', toolCalls: [{ id: 't1', name: 'objy', input: {} }] },
        { text: 'ok', toolCalls: [] },
      ]),
      tools: [objy],
    })
    expect(typeof r.steps[0].results[0].content).toBe('string')
    expect(r.steps[0].results[0].isError).toBe(false)
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
    // a nextTurn that ALWAYS wants a tool, with text to prove the finalText fallback
    const always = async () => ({ text: 'more', toolCalls: [{ id: 't', name: 'echo', input: {} }] })
    const r = await runToolLoop({ nextTurn: always, tools: [echoTool], maxSteps: 3 })
    expect(r.stopReason).toBe('max_steps')
    expect(r.steps).toHaveLength(3)
    expect(r.toolCallCount).toBe(3)
    expect(r.finalText).toBe('more') // lastText fallback is real, not empty
  })

  it('preserves earlier text when a later turn has empty text', async () => {
    // turn0: text 'thinking' + tool; turn1: empty text + tool; turn2 (cap) — finalText should be 'thinking'
    const nextTurn = async (steps: readonly AgentStep[]) =>
      steps.length === 0
        ? { text: 'thinking', toolCalls: [{ id: 't0', name: 'echo', input: {} }] }
        : { text: '', toolCalls: [{ id: `t${steps.length}`, name: 'echo', input: {} }] }
    const r = await runToolLoop({ nextTurn, tools: [echoTool], maxSteps: 2 })
    expect(r.stopReason).toBe('max_steps')
    expect(r.finalText).toBe('thinking')
  })

  it('passes the accumulating transcript to nextTurn each round', async () => {
    const seen: number[] = []
    const nextTurn = vi.fn(async (steps: readonly AgentStep[]) => {
      seen.push(steps.length)
      return steps.length < 2
        ? { text: '', toolCalls: [{ id: `t${steps.length}`, name: 'echo', input: {} }] }
        : { text: 'end', toolCalls: [] }
    })
    await runToolLoop({ nextTurn, tools: [echoTool], maxSteps: 5 })
    expect(seen).toEqual([0, 1, 2]) // transcript grows each round
  })

  it('carries an abnormal stopHint through to the result', async () => {
    const r = await runToolLoop({
      nextTurn: scripted([{ text: 'partial', toolCalls: [], stopHint: 'max_tokens' }]),
      tools: [],
    })
    expect(r.stopReason).toBe('stop')
    expect(r.stopHint).toBe('max_tokens')
  })

  it('propagates a nextTurn rejection (the loop cannot retry the model)', async () => {
    const nextTurn = async () => {
      throw new Error('model-down')
    }
    await expect(runToolLoop({ nextTurn, tools: [echoTool] })).rejects.toThrow('model-down')
  })

  it('stops with reason "aborted" when the signal is already aborted', async () => {
    const ac = new AbortController()
    ac.abort()
    const nextTurn = vi.fn(async () => ({ text: 'never', toolCalls: [] }))
    const r = await runToolLoop({ nextTurn, tools: [], signal: ac.signal })
    expect(r.stopReason).toBe('aborted')
    expect(nextTurn).not.toHaveBeenCalled()
  })

  it('stops mid-run when the signal aborts between steps', async () => {
    const ac = new AbortController()
    let calls = 0
    const nextTurn = async () => {
      calls++
      if (calls === 1) ac.abort() // abort after the first turn is produced
      return { text: `t${calls}`, toolCalls: [{ id: `t${calls}`, name: 'echo', input: {} }] }
    }
    const r = await runToolLoop({ nextTurn, tools: [echoTool], signal: ac.signal, maxSteps: 10 })
    expect(r.stopReason).toBe('aborted')
    expect(calls).toBe(1) // second iteration's abort check short-circuits before nextTurn
  })

  it('throws on maxSteps < 1', async () => {
    await expect(runToolLoop({ nextTurn: scripted([]), tools: [], maxSteps: 0 })).rejects.toThrow(/maxSteps/)
  })

  it('throws on duplicate tool names', async () => {
    await expect(
      runToolLoop({ nextTurn: scripted([{ text: 'x', toolCalls: [] }]), tools: [echoTool, { ...echoTool }] }),
    ).rejects.toThrow(/duplicate tool name "echo"/)
  })

  it('streams each step to onStep, including the terminal step', async () => {
    const seen: { index: number; calls: number; terminal: boolean }[] = []
    await runToolLoop({
      nextTurn: scripted([
        { text: '', toolCalls: [{ id: 't1', name: 'echo', input: {} }] },
        { text: 'done', toolCalls: [] },
      ]),
      tools: [echoTool],
      onStep: (step, index) => {
        seen.push({ index, calls: step.turn.toolCalls.length, terminal: step.turn.toolCalls.length === 0 })
      },
    })
    expect(seen).toEqual([
      { index: 0, calls: 1, terminal: false },
      { index: 1, calls: 0, terminal: true },
    ])
  })

  it('swallows a throwing onStep — the run still completes', async () => {
    const r = await runToolLoop({
      nextTurn: scripted([{ text: 'ok', toolCalls: [] }]),
      tools: [],
      onStep: () => {
        throw new Error('emitter-broke')
      },
    })
    expect(r.stopReason).toBe('stop')
    expect(r.finalText).toBe('ok')
  })
})
