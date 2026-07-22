import { QueryClient } from '@tanstack/react-query'

/**
 * The single TOWER QueryClient config, hoisted to the shell (TowerQueryProvider)
 * so every module shares one cache. This is what lets the global activity rail
 * (RouteProgress) observe *all* in-flight queries with one useIsFetching() —
 * and it retires the six byte-identical per-module providers that predated a
 * shell-level client (Wave-1/2 precedent noted in those files).
 *
 * Defaults preserved verbatim from the module providers: a 15s stale window so
 * fast lane-switching doesn't refetch, no refetch-on-focus (an ops surface is
 * watched continuously; a focus refetch would flicker the room), one retry.
 */
export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 15_000,
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  })
}
