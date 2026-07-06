'use client'

// src/hooks/useMultiInquiry.ts
// localStorage-based multi-product inquiry cart.
// Key: 'wings-multi-inquiry' — stores MultiInquiryItem[]

import { useCallback, useEffect, useState } from 'react'

export interface MultiInquiryItem {
  id: string
  name_es: string
  slug: string
  category_slug: string
}

const STORAGE_KEY = 'wings-multi-inquiry'

function readStorage(): MultiInquiryItem[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed as MultiInquiryItem[]
  } catch {
    return []
  }
}

function writeStorage(items: MultiInquiryItem[]): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {
    // Storage might be full or unavailable — fail silently.
  }
}

export function useMultiInquiry() {
  const [items, setItems] = useState<MultiInquiryItem[]>([])

  // Hydrate from localStorage on mount.
  useEffect(() => {
    setItems(readStorage())
  }, [])

  const add = useCallback((item: MultiInquiryItem) => {
    setItems((prev) => {
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
    setItems([])
    writeStorage([])
  }, [])

  const isAdded = useCallback(
    (id: string) => items.some((i) => i.id === id),
    [items],
  )

  return { items, add, remove, clear, isAdded }
}
