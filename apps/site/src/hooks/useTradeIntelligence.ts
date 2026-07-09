'use client'

import { useState, useEffect } from 'react'

export function useTradeIntelligence(slug: string): {
  intelligence: string | null
  isLoading: boolean
} {
  const [intelligence, setIntelligence] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!slug) {
      setIsLoading(false)
      return
    }

    let cancelled = false

    fetch(`/api/products/${encodeURIComponent(slug)}/intelligence`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json() as Promise<{ intelligence: string }>
      })
      .then((data) => {
        if (!cancelled) setIntelligence(data.intelligence ?? null)
      })
      .catch(() => {
        // Caller shows static fallback on null.
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [slug])

  return { intelligence, isLoading }
}
