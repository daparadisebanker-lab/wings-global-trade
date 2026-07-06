'use client'

import { createContext, useCallback, useContext, useEffect, useState } from 'react'

export interface ComparisonItem {
  id: string
  name_es: string
  slug: string
  category_slug: string
  image: string
  specs?: Record<string, unknown>
}

interface ComparisonContextValue {
  items: ComparisonItem[]
  add: (item: ComparisonItem) => void
  remove: (id: string) => void
  clear: () => void
  isInComparison: (id: string) => boolean
  isFull: boolean
}

const ComparisonContext = createContext<ComparisonContextValue | null>(null)

const STORAGE_KEY = 'wings-comparison'
const MAX_ITEMS = 3

function readStorage(): ComparisonItem[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as ComparisonItem[]) : []
  } catch {
    return []
  }
}

function writeStorage(items: ComparisonItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {
    // quota exceeded — degrade silently
  }
}

export function ComparisonProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ComparisonItem[]>([])

  useEffect(() => {
    setItems(readStorage())
  }, [])

  const add = useCallback((item: ComparisonItem) => {
    setItems((prev) => {
      if (prev.length >= MAX_ITEMS || prev.some((i) => i.id === item.id)) return prev
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

  const isInComparison = useCallback((id: string) => items.some((i) => i.id === id), [items])

  return (
    <ComparisonContext.Provider
      value={{ items, add, remove, clear, isInComparison, isFull: items.length >= MAX_ITEMS }}
    >
      {children}
    </ComparisonContext.Provider>
  )
}

export function useComparisonContext(): ComparisonContextValue {
  const ctx = useContext(ComparisonContext)
  if (!ctx) throw new Error('useComparisonContext must be used within ComparisonProvider')
  return ctx
}
