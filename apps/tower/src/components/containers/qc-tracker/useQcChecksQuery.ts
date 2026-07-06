'use client'

import { useQuery } from '@tanstack/react-query'
import { listQcChecks } from '@/lib/actions/containers'
import type { QcCheckRow } from '@/lib/actions/containers-types'

export function useQcChecksQuery(purchaseOrderId: string | null) {
  return useQuery<QcCheckRow[], Error>({
    queryKey: ['tower', 'containers', 'qc-checks', purchaseOrderId],
    queryFn: async () => {
      if (!purchaseOrderId) return []
      const result = await listQcChecks(purchaseOrderId)
      if (result.error) throw new Error(result.error.message)
      return result.data
    },
    enabled: purchaseOrderId !== null,
  })
}
