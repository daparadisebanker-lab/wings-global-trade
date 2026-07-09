'use client'

import { useEffect, useState } from 'react'

interface CatalogProgressProps {
  categorySlug: string
  totalInCategory: number
  currentSlug: string
}

export default function CatalogProgress({
  categorySlug,
  totalInCategory,
  currentSlug,
}: CatalogProgressProps) {
  const [visitedCount, setVisitedCount] = useState<number | null>(null)

  useEffect(() => {
    const key = `wings_visited_${categorySlug}`
    try {
      const raw = localStorage.getItem(key)
      const visited: string[] = raw ? JSON.parse(raw) : []
      const updated = Array.from(new Set([...visited, currentSlug]))
      localStorage.setItem(key, JSON.stringify(updated))
      setVisitedCount(updated.length)
    } catch {
      // localStorage unavailable
    }
  }, [categorySlug, currentSlug])

  if (visitedCount === null) return null

  // Framed as the buyer's own evaluation, not as tracking. The buyer is
  // conducting a methodical review of the category — expertise, not surveillance.
  const allVisited = visitedCount >= totalInCategory
  const label = allVisited
    ? 'Has revisado toda la gama de esta categoría'
    : visitedCount <= 1
      ? `Estás evaluando esta categoría · ${totalInCategory} modelos disponibles`
      : `Llevas ${visitedCount} de ${totalInCategory} modelos revisados en esta categoría`

  return (
    <p className="font-mono text-[10px] tracking-wide text-[#001E50]/50">
      {label}
    </p>
  )
}
