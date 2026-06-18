// src/hooks/useComparison.ts
'use client'

import { useState, useEffect, useCallback } from 'react'

export interface ComparisonItem {
  id: string
  name_es: string
  slug: string
  category_slug: string
  image: string
}

export interface UseComparison {
  items: ComparisonItem[]
  add: (item: ComparisonItem) => void
  remove: (id: string) => void
  clear: () => void
  isInComparison: (id: string) => boolean
  isFull: boolean
}

const STORAGE_KEY = 'wings-comparison'
const MAX_ITEMS = 3

function readStorage(): ComparisonItem[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed as ComparisonItem[]
  } catch {
    return []
  }
}

function writeStorage(items: ComparisonItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {
    // localStorage quota exceeded or unavailable — degrade silently
  }
}

export function useComparison(): UseComparison {
  const [items, setItems] = useState<ComparisonItem[]>([])

  // Initialise from localStorage after hydration
  useEffect(() => {
    setItems(readStorage())
  }, [])

  const add = useCallback((item: ComparisonItem) => {
    setItems((prev) => {
      if (prev.length >= MAX_ITEMS) return prev
      if (prev.some((i) => i.id === item.id)) return prev
      const next = [...prev, item]
      writeStorage(next)
      return next
    })
  }, [])

  const remove = useCallback((id: string) => {
    setItems((prev) => {
      const next = prev.filter((i) => i.id !== id)
      writeStorage(next)
      return next
    })
  }, [])

  const clear = useCallback(() => {
    writeStorage([])
    setItems([])
  }, [])

  const isInComparison = useCallback(
    (id: string) => items.some((i) => i.id === id),
    [items],
  )

  return {
    items,
    add,
    remove,
    clear,
    isInComparison,
    isFull: items.length >= MAX_ITEMS,
  }
}
