// src/lib/torre/agent/tool-loop.ts
// The Mister Torre agentic loop (Foundation B1). The repo's AI layer is single-shot
// (lib/ai/client.ts — no tool_use); this adds a bounded, model-driven tool loop for
// multi-step runs (a quote that fetches rates → checks tariff → computes → drafts).
//
// The RISKY part — dispatch, error capture, termination — is a PURE function driven by
// a `nextTurn` provider, so it is fully unit-tested with a scripted fake and NO network
// or key. The Anthropic SDK adapter (anthropic-runner.ts) supplies the real `nextTurn`.
//
// Governance (CLAUDE.md): read tools return data; a MUTATING tool must terminate in an
// ai_drafts write — nothing here sends/commits. The loop just orchestrates; the tool
// implementations carry that law (enforced where they're defined, B2).

/** One tool the model may call. `run` returns the result text (or throws → captured). */
export interface AgentTool {
  name: string
  description: string
  /** JSON Schema for the tool input (passed to the model). */
  inputSchema: Record<string, unknown>
  run: (input: unknown) => Promise<string> | string
}

export interface ToolCall {
  id: string
  name: string
  input: unknown
}

export interface ToolResult {
  id: string
  content: string
  isError: boolean
}

/** A model turn: assistant text plus any tool calls. Zero tool calls = the loop stops. */
export interface ModelTurn {
  text: string
  toolCalls: ToolCall[]
}

export interface AgentStep {
  turn: ModelTurn
  results: ToolResult[]
}

export type StopReason = 'stop' | 'max_steps'

export interface AgentResult {
  finalText: string
  steps: AgentStep[]
  toolCallCount: number
  stopReason: StopReason
}

/** Produce the next model turn given the steps so far (the transcript). */
export type NextTurn = (steps: AgentStep[]) => Promise<ModelTurn>

export interface RunToolLoopOptions {
  nextTurn: NextTurn
  tools: AgentTool[]
  /** Hard cap on model↔tool round-trips (safety — a runaway loop can't spin forever). */
  maxSteps?: number
}

/**
 * PURE orchestration: call the model, dispatch its tool calls, feed results back, loop
 * until the model stops (no tool calls) or maxSteps is hit. Unknown tools and tool
 * throws become error results the model sees (it can recover), never crashes the run.
 */
export async function runToolLoop({ nextTurn, tools, maxSteps = 8 }: RunToolLoopOptions): Promise<AgentResult> {
  const byName = new Map(tools.map((t) => [t.name, t]))
  const steps: AgentStep[] = []
  let toolCallCount = 0
  let lastText = ''

  for (let i = 0; i < maxSteps; i++) {
    const turn = await nextTurn(steps)
    lastText = turn.text || lastText
    if (turn.toolCalls.length === 0) {
      return { finalText: turn.text, steps, toolCallCount, stopReason: 'stop' }
    }
    const results: ToolResult[] = []
    for (const call of turn.toolCalls) {
      toolCallCount++
      const tool = byName.get(call.name)
      if (!tool) {
        results.push({ id: call.id, content: `Error: unknown tool "${call.name}"`, isError: true })
        continue
      }
      try {
        const content = await tool.run(call.input)
        results.push({ id: call.id, content, isError: false })
      } catch (e) {
        results.push({ id: call.id, content: `Error: ${e instanceof Error ? e.message : String(e)}`, isError: true })
      }
    }
    steps.push({ turn, results })
  }

  // Hit the cap with the model still wanting tools — return honestly, don't pretend done.
  return { finalText: lastText, steps, toolCallCount, stopReason: 'max_steps' }
}
