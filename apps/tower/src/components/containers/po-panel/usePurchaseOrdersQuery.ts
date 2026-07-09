'use client'

import { useQuery } from '@tanstack/react-query'
import { listPurchaseOrders } from '@/lib/actions/containers'
import type { PurchaseOrderRow } from '@/lib/actions/containers-types'

export function usePurchaseOrdersQuery(containerId: string) {
  return useQuery<PurchaseOrderRow[], Error>({
    queryKey: ['tower', 'containers', 'purchase-orders', containerId],
    queryFn: async () => {
      const result = await listPurchaseOrders(containerId)
      if (result.error) throw new Error(result.error.message)
      return result.data
    },
  })
}
