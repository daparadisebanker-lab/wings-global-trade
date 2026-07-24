'use client'

// review-queries.ts — the review queue's data layer, made cockpit-friendly. Same
// server actions + same TanStack query keys as the light /intelligence workspace,
// so the rail and the full page share ONE cache (a mutation in either refetches
// both). The only addition is `enabled`: the cockpit overlay is always mounted
// (inert when closed), so we must NOT fetch AI drafts until it's actually open —
// callers pass `active` for that.
import { useQuery } from '@tanstack/react-query'
import { listSpecExtractDrafts, listTriageDrafts } from '@/lib/actions/intelligence'
import type { AiDraftRecord } from '@/lib/ai'

export function useTriageReview(enabled: boolean) {
  return useQuery<AiDraftRecord<'TRIAGE'>[], Error>({
    queryKey: ['tower', 'intelligence', 'triage'],
    queryFn: async () => {
      const result = await listTriageDrafts()
      if (result.error) throw new Error(result.error.message)
      return result.data as AiDraftRecord<'TRIAGE'>[]
    },
    enabled,
    placeholderData: (previous) => previous,
  })
}

export function useSpecReview(enabled: boolean) {
  return useQuery<AiDraftRecord<'SPEC_EXTRACT'>[], Error>({
    queryKey: ['tower', 'intelligence', 'spec-extract'],
    queryFn: async () => {
      const result = await listSpecExtractDrafts()
      if (result.error) throw new Error(result.error.message)
      return result.data as AiDraftRecord<'SPEC_EXTRACT'>[]
    },
    enabled,
    placeholderData: (previous) => previous,
  })
}
