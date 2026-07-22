'use client'

import { useState, type ReactNode } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { makeQueryClient } from '@/lib/query/client'

/**
 * The one shell-wide TanStack Query provider. Mounted a single time in
 * (shell)/layout so all modules share one cache and RouteProgress can read
 * useIsFetching() beneath it to drive the global activity rail. Replaces the
 * per-module providers (CatalogQueryProvider, ContainersQueryProvider, …).
 */
export function TowerQueryProvider({ children }: { children: ReactNode }) {
  const [client] = useState(makeQueryClient)
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}
