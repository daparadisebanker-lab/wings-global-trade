// Mister copilot — the plugin contract.
//
// Each capability is a self-contained module: it owns its extraction prompt, its
// deterministic compute, and declares which renderer draws its result. The dock
// routes a message to at most one capability (see router.ts) and renders the
// result through a renderer keyed by `renderer`. This is what lets capabilities
// be built in parallel without touching each other — a new capability is a new
// file plus one registry line and one renderer-map line.
//
// Governance is unchanged: capabilities that only read/compute return a result
// directly; a capability that mutates state must go through a server action that
// writes an ai_draft (CLAUDE.md Directive 7 — propose, then dispose).

import type { IntelligenceClient, ImageInput } from '@/lib/ai/client'

/** An attachment the operator sends with a message — currently a pasted/added image. */
export type Attachment = ImageInput

/** The result a capability returns; the dock renders it via `renderer`. */
export interface CopilotResult {
  /** Renderer key the dock maps to a component. 'text' is built-in. */
  renderer: string
  /** Optional short note (Spanish) shown above the rendered payload. */
  note?: string
  /** Plain-text reply — used by the built-in 'text' renderer. */
  text?: string
  /** Renderer-specific payload; each renderer casts to its own type. */
  data?: unknown
}

/** A Mister capability — one thing the copilot can do. */
export interface Capability {
  /** Stable id; also the router's label for this capability. */
  id: string
  /** Routing hints for the classifier — a one-line ES description + example phrasings. */
  router: { description: string; examples: string[] }
  /** True if this capability consumes an image attachment (vision). Router uses it. */
  acceptsImage?: boolean
  /**
   * Parse the message and produce a result. Throws only on a transport error
   * from the client; an unparseable message should return a `text` result. The
   * optional attachment is present only for image-accepting capabilities.
   */
  run(client: IntelligenceClient, text: string, attachment?: Attachment): Promise<CopilotResult>
}

/** A plain-text result — the graceful fallback every capability can return. */
export function textResult(text: string, note?: string): CopilotResult {
  return { renderer: 'text', text, note }
}
