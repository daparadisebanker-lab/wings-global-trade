'use client'

// src/hooks/useFilterPersistence.ts
// Persists last-used catalog filters to sessionStorage per category.
// Key format: wings-catalog-filters:{categorySlug}

import { useCallback, useEffect, useState } from 'react'
import type { CatalogFilterState } from '@/hooks/useCatalogFilters'

const BASE_KEY = 'wings-catalog-filters'

interface UseFilterPersistenceOptions {
  categorySlug: string
  currentFilters: CatalogFilterState
}

interface UseFilterPersistenceReturn {
  savedFilters: CatalogFilterState | null
  clearSaved: () => void
}

function buildKey(categorySlug: string): string {
  return `${BASE_KEY}:${categorySlug}`
}

function readFromStorage(key: string): CatalogFilterState | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = sessionStorage.getItem(key)
    if (!raw) return null
    return JSON.parse(raw) as CatalogFilterState
  } catch {
    return null
  }
}

function writeToStorage(key: string, filters: CatalogFilterState): void {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.setItem(key, JSON.stringify(filters))
  } catch {
    // sessionStorage may be unavailable in some contexts (private mode, storage full)
    // Fail silently — filter persistence is a convenience, not a requirement
  }
}

export function useFilterPersistence({
  categorySlug,
  currentFilters,
}: UseFilterPersistenceOptions): UseFilterPersistenceReturn {
  const storageKey = buildKey(categorySlug)

  const [savedFilters, setSavedFilters] = useState<CatalogFilterState | null>(() =>
    readFromStorage(storageKey),
  )

  // Sync currentFilters to sessionStorage whenever they change
  useEffect(() => {
    writeToStorage(storageKey, currentFilters)
  }, [storageKey, currentFilters])

  // If the category changes, reload saved filters for the new slug
  useEffect(() => {
    setSavedFilters(readFromStorage(storageKey))
  }, [storageKey])

  const clearSaved = useCallback(() => {
    if (typeof window === 'undefined') return
    try {
      sessionStorage.removeItem(storageKey)
    } catch {
      // ignore
    }
    setSavedFilters(null)
  }, [storageKey])

  return { savedFilters, clearSaved }
}
