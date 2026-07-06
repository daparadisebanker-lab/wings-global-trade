// src/hooks/useMisterStream.ts
// The Mister SSE streaming hook moved to @wings/mister (M3c). Re-exported here so
// its importer (MisterProvider) is unchanged. The /api/mister endpoint, guardrails,
// and hold-back logic stay in apps/site.
export { useMisterStream } from '@wings/mister'
export type { StreamCallbacks, StreamOptions } from '@wings/mister'
