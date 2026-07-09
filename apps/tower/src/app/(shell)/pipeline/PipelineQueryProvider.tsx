'use client'

// Scoped TanStack Query provider for Pipeline only — mirrors
// catalog/CatalogQueryProvider.tsx (the shell root layout doesn't mount a
// QueryClientProvider yet). PipelineBoard/RfqDetail's queries read through it.
import { useState, type ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

export function PipelineQueryProvider({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 15_000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      }),
  )

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}
