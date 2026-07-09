'use client'

// Scoped TanStack Query provider for Container Desk — mirrors Catalog
// Studio's CatalogQueryProvider (Wave 2 precedent: the shell root layout
// doesn't mount one yet, so each module brings its own until a module hoists it).
import { useState, type ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

export function ContainersQueryProvider({ children }: { children: ReactNode }) {
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
