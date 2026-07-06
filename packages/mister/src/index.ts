// @wings/mister — the Mister client surface: the v2 type/data contract (incl. the
// control-block schema types) and the SSE streaming hook. The engine's server
// routes, guardrails/hold-back, and system prompt intentionally STAY in apps/site
// (never moved). The full component shell (MisterDock/MisterSiteWidget) also stays
// app-local — see packages/mister/README.md.
export * from './types'
export { useMisterStream } from './useMisterStream'
export type { StreamCallbacks, StreamOptions } from './useMisterStream'
