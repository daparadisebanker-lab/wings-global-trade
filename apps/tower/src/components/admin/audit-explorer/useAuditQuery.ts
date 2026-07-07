'use client'

// Thin TanStack Query wrapper over the `listAuditLog` server action.
// Server-paginated (cursor), per ARCHITECTURE "server pagination" — mirrors
// catalog's useProductsQuery.
import { useQuery } from '@tanstack/react-query'
import { listAuditLog, type AuditListPage, type ListAuditInput } from '@/lib/actions/audit'

export function useAuditQuery(input: ListAuditInput) {
  return useQuery<AuditListPage, Error>({
    queryKey: ['tower', 'admin', 'audit', input],
    queryFn: async () => {
      const result = await listAuditLog(input)
      if (result.error) throw new Error(result.error.message)
      return result.data
    },
    placeholderData: (previous) => previous,
  })
}
