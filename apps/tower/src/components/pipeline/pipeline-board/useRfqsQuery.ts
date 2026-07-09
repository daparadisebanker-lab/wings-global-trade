'use client'

// Thin TanStack Query wrapper over the `listRfqs` server action (mirrors
// catalog/product-table/useProductsQuery.ts). PipelineBoard groups the
// returned rows into archetype stage columns client-side.
import { useQuery } from '@tanstack/react-query'
import { listRfqs, type ListRfqsInput, type RfqRow } from '@/lib/actions/pipeline'

export function useRfqsQuery(input: ListRfqsInput) {
  return useQuery<{ rows: RfqRow[]; nextCursor: string | null }, Error>({
    queryKey: ['tower', 'pipeline', 'rfqs', input],
    queryFn: async () => {
      const result = await listRfqs(input)
      if (result.error) throw new Error(result.error.message)
      return result.data
    },
    // `laneId` is a required uuid server-side (listRfqsInputSchema) — guard
    // against firing (and surfacing a spurious VALIDATION error) before a
    // real lane id is selected.
    enabled: Boolean(input.laneId),
    placeholderData: (previous) => previous,
  })
}
