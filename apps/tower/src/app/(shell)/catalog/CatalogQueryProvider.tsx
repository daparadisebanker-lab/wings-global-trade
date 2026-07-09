'use client'

// Scoped TanStack Query provider for Catalog Studio only. The shell root
// layout (Wave 1, outside this wave's ownership) doesn't mount a
// QueryClientProvider yet, so Catalog Studio brings its own rather than
// widening another agent's file. Pipeline/Containers waves will likely hoist
// this once more than one module needs it.
import { useState, type ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

export function CatalogQueryProvider({ children }: { children: ReactNode }) {
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
