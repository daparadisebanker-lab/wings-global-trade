'use client'

// Scoped TanStack Query provider for /intelligence only — mirrors
// pipeline/PipelineQueryProvider.tsx (the shell root layout doesn't mount a
// QueryClientProvider yet). TriageQueue / SpecExtractReview read through it.
import { useState, type ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

export function IntelligenceQueryProvider({ children }: { children: ReactNode }) {
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
