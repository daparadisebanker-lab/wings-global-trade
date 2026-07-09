'use client'

// Thin TanStack Query wrapper over the `listTriageDrafts` server action
// (mirrors pipeline/useRfqsQuery.ts). The queue is the working set of
// unclassified inbound awaiting an operator's approve/reject.
import { useQuery } from '@tanstack/react-query'
import { listTriageDrafts } from '@/lib/actions/intelligence'
import type { AiDraftRecord } from '@/lib/ai'

export function useTriageDraftsQuery() {
  return useQuery<AiDraftRecord<'TRIAGE'>[], Error>({
    queryKey: ['tower', 'intelligence', 'triage'],
    queryFn: async () => {
      const result = await listTriageDrafts()
      if (result.error) throw new Error(result.error.message)
      return result.data as AiDraftRecord<'TRIAGE'>[]
    },
    placeholderData: (previous) => previous,
  })
}
