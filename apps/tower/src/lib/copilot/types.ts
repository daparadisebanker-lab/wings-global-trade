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
import type { ImportInputs } from '@/lib/costing/types'
import type { ContainerFitInput } from './container-fit'

/** An attachment the operator sends with a message — currently a pasted/added image. */
export type Attachment = ImageInput

/**
 * Canvas working memory, fed back into a CHAINED ask (Phase E round 3 / Part B).
 * When the operator has an artifact open on the canvas and types a follow-up
 * ("y si el flete sube a 2,500?"), the currently-mounted editor's normalized
 * inputs travel with the message so the capability seeds from what the operator
 * already tuned instead of engine defaults. Plain JSON (crosses the server-action
 * boundary). The costing capabilities (landed-cost, reverse-quote) share
 * ImportInputs, so one 'costing' kind covers both.
 */
export type CanvasContext =
  | { kind: 'costing'; inputs: ImportInputs }
  | { kind: 'fit'; input: ContainerFitInput }

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
   * optional attachment is present only for image-accepting capabilities. The
   * optional `context` is the canvas working memory of the artifact the operator
   * had open — a capability may seed unspecified fields from it (Part B); ignoring
   * it is fine (a fewer-param run still satisfies this contract).
   */
  run(client: IntelligenceClient, text: string, attachment?: Attachment, context?: CanvasContext): Promise<CopilotResult>
}

/** A plain-text result — the graceful fallback every capability can return. */
export function textResult(text: string, note?: string): CopilotResult {
  return { renderer: 'text', text, note }
}
