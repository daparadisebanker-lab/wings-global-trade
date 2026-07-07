'use client'

// Thin TanStack Query wrapper over the `listLanes` server action.
import { useQuery } from '@tanstack/react-query'
import { listLanes, type LaneAdminRow } from '@/lib/actions/admin'

export const ADMIN_LANES_KEY = ['tower', 'admin', 'lanes'] as const

export function useAdminLanesQuery() {
  return useQuery<LaneAdminRow[], Error>({
    queryKey: ADMIN_LANES_KEY,
    queryFn: async () => {
      const result = await listLanes()
      if (result.error) throw new Error(result.error.message)
      return result.data
    },
  })
}
