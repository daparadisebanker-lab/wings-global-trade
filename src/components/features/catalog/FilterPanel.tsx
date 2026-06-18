'use client'

// FilterPanel.tsx — owns the isOpen state for FilterDrawer on mobile
// Rendered as a sibling to FilterSidebar in the category page.
// The desktop sidebar is a plain server-rendered component; this wrapper
// only adds the mobile bottom-sheet trigger + animation.

import { useState } from 'react'
import { FilterDrawer } from '@/components/features/catalog/FilterDrawer'
import type { FilterSidebarProps } from '@/components/features/catalog/FilterSidebar'

export function FilterPanel({ facets, activeFilters, categorySlug }: FilterSidebarProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <FilterDrawer
      facets={facets}
      activeFilters={activeFilters}
      categorySlug={categorySlug}
      isOpen={isOpen}
      onOpen={() => setIsOpen(true)}
      onClose={() => setIsOpen(false)}
    />
  )
}
