'use client'

import { useQuery } from '@tanstack/react-query'
import { listCommitments } from '@/lib/actions/containers'
import type { ContainerCommitmentRow } from '@/lib/actions/containers-types'

export function useCommitmentsQuery(containerId: string) {
  return useQuery<ContainerCommitmentRow[], Error>({
    queryKey: ['tower', 'containers', 'commitments', containerId],
    queryFn: async () => {
      const result = await listCommitments(containerId)
      if (result.error) throw new Error(result.error.message)
      return result.data
    },
  })
}
