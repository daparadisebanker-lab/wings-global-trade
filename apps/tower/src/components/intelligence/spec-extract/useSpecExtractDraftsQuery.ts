'use client'

// Thin TanStack Query wrapper over the `listSpecExtractDrafts` server action
// (mirrors pipeline/useRfqsQuery.ts). Each draft is a supplier-doc extraction
// awaiting review before it becomes a DRAFT product.
import { useQuery } from '@tanstack/react-query'
import { listSpecExtractDrafts } from '@/lib/actions/intelligence'
import type { AiDraftRecord } from '@/lib/ai'

export function useSpecExtractDraftsQuery() {
  return useQuery<AiDraftRecord<'SPEC_EXTRACT'>[], Error>({
    queryKey: ['tower', 'intelligence', 'spec-extract'],
    queryFn: async () => {
      const result = await listSpecExtractDrafts()
      if (result.error) throw new Error(result.error.message)
      return result.data as AiDraftRecord<'SPEC_EXTRACT'>[]
    },
    placeholderData: (previous) => previous,
  })
}
