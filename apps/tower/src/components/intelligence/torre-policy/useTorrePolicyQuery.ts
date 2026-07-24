'use client'

// TanStack Query wrappers for the Ajustes-lite policy panel (Mister Torre A4): the
// operator's lanes (for the picker) and the selected lane's policy (rate tables +
// tariff positions + org rules).
import { useQuery } from '@tanstack/react-query'
import { getTorrePolicy, listPolicyLanes, type PolicyLane, type TorrePolicy } from '@/lib/actions/torre-policy'

export function useTorrePolicyLanesQuery() {
  return useQuery<PolicyLane[], Error>({
    queryKey: ['tower', 'intelligence', 'torre-policy', 'lanes'],
    queryFn: async () => {
      const r = await listPolicyLanes()
      if (r.error) throw new Error(r.error.message)
      return r.data
    },
  })
}

export function useTorrePolicyQuery(laneId: string | null) {
  return useQuery<TorrePolicy | null, Error>({
    queryKey: ['tower', 'intelligence', 'torre-policy', laneId],
    queryFn: async () => {
      if (!laneId) return null
      const r = await getTorrePolicy(laneId)
      if (r.error) throw new Error(r.error.message)
      return r.data
    },
    enabled: !!laneId,
    placeholderData: (p) => p,
  })
}
