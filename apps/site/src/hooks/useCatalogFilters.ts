'use client'

// src/hooks/useCatalogFilters.ts
// Reads and writes catalog filter state via URL query params.
// Preserves ?q search param. No full page reload — uses router.push().

import { useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export type FilterKey = 'sub' | 'hp' | 'traction' | 'transmission' | 'brand' | 'fuel' | 'payload' | 'usage'

export interface CatalogFilterState {
  sub: string | null
  hp: string | null
  traction: string | null
  transmission: string | null
  brand: string | null
  fuel: string | null
  payload: string | null
  usage: string | null
}

export interface UseCatalogFiltersReturn {
  filters: CatalogFilterState
  setFilter: (key: FilterKey, value: string) => void
  clearFilters: () => void
  activeCount: number
}

export function useCatalogFilters(): UseCatalogFiltersReturn {
  const searchParams = useSearchParams()
  const router = useRouter()

  const filters: CatalogFilterState = {
    sub: searchParams.get('sub'),
    hp: searchParams.get('hp'),
    traction: searchParams.get('traction'),
    transmission: searchParams.get('transmission'),
    brand: searchParams.get('brand'),
    fuel: searchParams.get('fuel'),
    payload: searchParams.get('payload'),
    usage: searchParams.get('usage'),
  }

  const activeCount = Object.values(filters).filter(Boolean).length

  const setFilter = useCallback(
    (key: FilterKey, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      // Preserve existing ?q param — toggling a filter must not lose a live search
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      router.push(`?${params.toString()}`, { scroll: false })
    },
    [router, searchParams],
  )

  const clearFilters = useCallback(() => {
    const params = new URLSearchParams()
    // Preserve ?q if it exists
    const q = searchParams.get('q')
    if (q) params.set('q', q)
    router.push(`?${params.toString()}`, { scroll: false })
  }, [router, searchParams])

  return { filters, setFilter, clearFilters, activeCount }
}
