'use client'

import { useState, useEffect } from 'react'

export function useFieldReport(slug: string): {
  report: string | null
  isLoading: boolean
} {
  const [report, setReport] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!slug) return
    let cancelled = false
    setIsLoading(true)
    fetch(`/api/products/${encodeURIComponent(slug)}/field-report`)
      .then(res => res.json())
      .then(data => { if (!cancelled) setReport(data.report ?? null) })
      .catch(() => { if (!cancelled) setReport(null) })
      .finally(() => { if (!cancelled) setIsLoading(false) })
    return () => { cancelled = true }
  }, [slug])

  return { report, isLoading }
}
