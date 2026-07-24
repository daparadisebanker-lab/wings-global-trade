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
// implementations carry that law. `AgentTool.access` marks read-vs-draft structurally so
// the belt/audit layer (B2) can GATE on it rather than trusting convention inside `run`.

/** Read tools return data; `draft` tools terminate in an ai_drafts DRAFT write. */
export type ToolAccess = 'read' | 'draft'

/** One tool the model may call. `run` returns the result text (or throws → captured). */
export interface AgentTool {
  name: string
  description: string
  /** Read-only vs draft-writing — the loop ignores this; B2's belt/audit gates on it. */
  access: ToolAccess
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
  /**
   * Set by the adapter when the model terminated abnormally (e.g. 'max_tokens' —
   * truncated mid-call, 'refusal'). Carried into AgentResult so a truncated run is
   * never silently reported as a clean `stop`. The adapter should also drop any
   * partial tool call on an abnormal stop rather than dispatch a truncated one.
   */
  stopHint?: string
}

export interface AgentStep {
  turn: ModelTurn
  results: ToolResult[]
}

export type StopReason = 'stop' | 'max_steps' | 'aborted'

export interface AgentResult {
  finalText: string
  /** The full transcript INCLUDING the terminal (stop) turn — complete for audit/evals. */
  steps: AgentStep[]
  toolCallCount: number
  stopReason: StopReason
  /** The last turn's abnormal-termination hint, if any (see ModelTurn.stopHint). */
  stopHint?: string
}

/** Produce the next model turn given the steps so far (the read-only transcript). */
export type NextTurn = (steps: readonly AgentStep[]) => Promise<ModelTurn>

export interface RunToolLoopOptions {
  nextTurn: NextTurn
  tools: AgentTool[]
  /** Hard cap on model↔tool round-trips (safety — a runaway loop can't spin forever). */
  maxSteps?: number
  /** Cancellation between steps (C1 SSE) — checked before each model call. */
  signal?: AbortSignal
  /**
   * Streaming side-channel (C1 SSE): called after each step is appended, including the
   * terminal stop turn. Purely observational — a throwing/rejecting onStep is swallowed
   * so a broken emitter (aborted client) can never crash the run.
   */
  onStep?: (step: AgentStep, index: number) => void | Promise<void>
}

/**
 * PURE orchestration: call the model, dispatch its tool calls, feed results back, loop
 * until the model stops (no tool calls) or maxSteps is hit. Unknown tools and tool
 * throws become error results the model sees (it can recover), never crashes the run.
 * If `nextTurn` itself rejects, that propagates (the pure loop can't retry the model).
 */
export async function runToolLoop({ nextTurn, tools, maxSteps = 8, signal, onStep }: RunToolLoopOptions): Promise<AgentResult> {
  if (maxSteps < 1) throw new Error(`runToolLoop: maxSteps must be >= 1 (got ${maxSteps})`)
  const byName = new Map<string, AgentTool>()
  for (const t of tools) {
    if (byName.has(t.name)) throw new Error(`runToolLoop: duplicate tool name "${t.name}"`)
    byName.set(t.name, t)
  }

  const steps: AgentStep[] = []
  let toolCallCount = 0
  let lastText = ''
  let lastStopHint: string | undefined

  // Emit a completed step to the observer, swallowing any emitter error (streaming law).
  const emit = async (step: AgentStep, index: number) => {
    if (!onStep) return
    try {
      await onStep(step, index)
    } catch {
      // a broken/aborted emitter must never crash the run
    }
  }

  for (let i = 0; i < maxSteps; i++) {
    if (signal?.aborted) {
      return { finalText: lastText, steps, toolCallCount, stopReason: 'aborted', stopHint: lastStopHint }
    }
    const turn = await nextTurn(steps)
    lastText = turn.text || lastText
    lastStopHint = turn.stopHint ?? lastStopHint
    if (turn.toolCalls.length === 0) {
      // Terminal turn — append it so `steps` is a complete transcript, then stop.
      const step: AgentStep = { turn, results: [] }
      steps.push(step)
      await emit(step, steps.length - 1)
      return { finalText: turn.text, steps, toolCallCount, stopReason: 'stop', stopHint: turn.stopHint }
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
        // Armor: a JS/`as any` tool that returns a non-string can't detonate downstream.
        results.push({ id: call.id, content: String(content), isError: false })
      } catch (e) {
        results.push({ id: call.id, content: `Error: ${e instanceof Error ? e.message : String(e)}`, isError: true })
      }
    }
    const step: AgentStep = { turn, results }
    steps.push(step)
    await emit(step, steps.length - 1)
  }

  // Hit the cap with the model still wanting tools — return honestly, don't pretend done.
  return { finalText: lastText, steps, toolCallCount, stopReason: 'max_steps', stopHint: lastStopHint }
}
