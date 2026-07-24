'use client'

// TanStack Query wrapper over listTorreDrafts (mirrors useTriageDraftsQuery). The
// queue is the working set of pending Torre artifacts (cotizacion / hoja_costos /
// comunicacion) awaiting an operator's approve/reject.
import { useQuery } from '@tanstack/react-query'
import { listTorreDrafts } from '@/lib/actions/torre-review'
import type { TorreDraftRecord } from '@/lib/torre/drafts'

export function useTorreDraftsQuery() {
  return useQuery<TorreDraftRecord[], Error>({
    queryKey: ['tower', 'intelligence', 'torre'],
    queryFn: async () => {
      const result = await listTorreDrafts()
      if (result.error) throw new Error(result.error.message)
      return result.data
    },
    placeholderData: (previous) => previous,
  })
}
