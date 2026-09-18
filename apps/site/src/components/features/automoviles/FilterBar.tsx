// src/components/features/automoviles/FilterBar.tsx
//
// Shared filter-tab bar — brand pages filter by body type, segment pages
// filter by brand, same mechanics either way. Real `tablist`/`tab` ARIA
// (not a bare button row: a filter set is a single-select tab group), full
// arrow-key/Home/End roving-tabindex navigation, and the active choice is
// synced to a URL query param so a filtered view is a shareable/bookmarkable
// link — none of which the brand page's original inline button row had.
'use client'

import { useRef } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface FilterBarOption {
  slug: string
  label: string
  count: number
  icon?: ReactNode
}

interface FilterBarProps {
  options: FilterBarOption[]
  totalLabel: string
  totalCount: number
  /** URL query param this bar reads/writes, e.g. "segmento" or "marca". */
  paramName: string
  ariaLabel: string
  className?: string
}

/** Reads the active slug for a given param straight off the URL — the one
 *  source of truth both this bar and its caller's filtering logic share. */
export function useFilterParam(paramName: string): string | null {
  const searchParams = useSearchParams()
  return searchParams.get(paramName)
}

export function FilterBar({ options, totalLabel, totalCount, paramName, ariaLabel, className }: FilterBarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const active = searchParams.get(paramName)
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])

  const allOptions: FilterBarOption[] = [{ slug: '', label: totalLabel, count: totalCount }, ...options]
  const activeIndex = Math.max(
    0,
    allOptions.findIndex((o) => (o.slug || null) === active),
  )

  function setSlug(slug: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (slug) params.set(paramName, slug)
    else params.delete(paramName)
    const qs = params.toString()
    // replace, not push — filtering shouldn't pile up browser-history
    // entries; scroll:false — a filter click never yanks the viewport.
    router.replace(`${pathname}${qs ? `?${qs}` : ''}`, { scroll: false })
  }

  function onKeyDown(e: React.KeyboardEvent, index: number) {
    let next: number | null = null
    if (e.key === 'ArrowRight') next = (index + 1) % allOptions.length
    else if (e.key === 'ArrowLeft') next = (index - 1 + allOptions.length) % allOptions.length
    else if (e.key === 'Home') next = 0
    else if (e.key === 'End') next = allOptions.length - 1
    if (next === null) return
    e.preventDefault()
    tabRefs.current[next]?.focus()
    setSlug(allOptions[next].slug)
  }

  return (
    <div role="tablist" aria-label={ariaLabel} className={cn('flex flex-wrap gap-2', className)}>
      {allOptions.map((opt, i) => {
        const isActive = i === activeIndex
        return (
          <button
            key={opt.slug || '__all'}
            ref={(el) => {
              tabRefs.current[i] = el
            }}
            role="tab"
            type="button"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            onClick={() => setSlug(opt.slug)}
            onKeyDown={(e) => onKeyDown(e, i)}
            className={cn(
              'flex min-h-11 items-center gap-2 rounded-[var(--radius-control)] border px-4 py-2 font-mono text-[11px] uppercase tracking-widest-2 transition-colors',
              isActive
                ? 'border-[color:var(--oem-accent,_var(--accent-ink))] bg-[color:var(--oem-accent-soft,transparent)] text-[color:var(--oem-accent,_var(--accent-ink))]'
                : 'border-[color:var(--ink-decoration)] text-[color:var(--ink-secondary)] hover:border-[color:var(--oem-accent,_var(--accent-border))]',
            )}
          >
            {opt.icon}
            <span>
              {opt.label} ({opt.count})
            </span>
          </button>
        )
      })}
    </div>
  )
}
