'use client'

import { useQuery } from '@tanstack/react-query'
import { listDocuments } from '@/lib/actions/containers'
import type { TradeDocumentRow } from '@/lib/actions/containers-types'

export function useDocumentsQuery(containerId: string) {
  return useQuery<TradeDocumentRow[], Error>({
    queryKey: ['tower', 'containers', 'documents', containerId],
    queryFn: async () => {
      const result = await listDocuments(containerId)
      if (result.error) throw new Error(result.error.message)
      return result.data
    },
  })
}
