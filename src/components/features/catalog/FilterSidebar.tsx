'use client'

// src/components/features/catalog/FilterSidebar.tsx
// Desktop filter sidebar. Hidden on mobile (md:block).
// Receives facets as props — no internal fetching.

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { useCatalogFilters } from '@/hooks/useCatalogFilters'
import type { FilterKey } from '@/hooks/useCatalogFilters'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface FacetOption {
  label: string
  value: string
  count: number
}

interface FacetGroups {
  hp?: FacetOption[]
  traction?: FacetOption[]
  transmission?: FacetOption[]
  brand?: FacetOption[]
  subcategories?: FacetOption[]
}

export interface FilterSidebarProps {
  categorySlug: string
  facets: FacetGroups
  // URL searchParams may be undefined when a filter is not present
  activeFilters: Record<string, string | undefined>
}

// ---------------------------------------------------------------------------
// Label → param key mapping
// ---------------------------------------------------------------------------

const FACET_PARAM_MAP: Record<keyof FacetGroups, FilterKey> = {
  hp: 'hp',
  traction: 'traction',
  transmission: 'transmission',
  brand: 'brand',
  subcategories: 'sub',
}

const FACET_LABELS: Record<keyof FacetGroups, string> = {
  hp: 'Potencia',
  traction: 'Tracción',
  transmission: 'Transmisión',
  brand: 'Marca',
  subcategories: 'Categoría',
}

// Display order
const FACET_ORDER: (keyof FacetGroups)[] = [
  'subcategories',
  'hp',
  'traction',
  'transmission',
  'brand',
]

// ---------------------------------------------------------------------------
// CollapsibleSection
// ---------------------------------------------------------------------------

interface CollapsibleSectionProps {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}

function CollapsibleSection({ title, children, defaultOpen = true }: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="border-b border-[rgba(0,30,80,0.06)]">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between py-3 text-left"
        aria-expanded={open}
      >
        <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-text-muted">
          {title}
        </span>
        <span
          className={cn(
            'font-mono text-[10px] text-text-muted transition-transform duration-200',
            open ? 'rotate-180' : 'rotate-0',
          )}
          aria-hidden
        >
          ▾
        </span>
      </button>

      {open && <div className="pb-3">{children}</div>}
    </div>
  )
}

// ---------------------------------------------------------------------------
// FilterOption — individual checkbox-style row
// ---------------------------------------------------------------------------

interface FilterOptionProps {
  label: string
  count: number
  isActive: boolean
  onToggle: () => void
}

function FilterOption({ label, count, isActive, onToggle }: FilterOptionProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        'flex w-full items-center justify-between rounded-wings px-2 py-1.5 text-left transition-colors duration-150',
        isActive
          ? 'bg-gold/10 text-navy'
          : 'text-text-muted hover:bg-[rgba(0,30,80,0.04)] hover:text-navy',
      )}
    >
      <span className="flex items-center gap-2">
        {/* Checkbox indicator */}
        <span
          className={cn(
            'flex h-3.5 w-3.5 flex-shrink-0 items-center justify-center rounded-wings border transition-colors duration-150',
            isActive ? 'border-gold bg-gold' : 'border-[rgba(0,30,80,0.18)] bg-white',
          )}
          aria-hidden
        >
          {isActive && (
            <svg
              width="8"
              height="6"
              viewBox="0 0 8 6"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-white"
            >
              <path
                d="M1 3L3 5L7 1"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </span>
        <span className="font-body text-[13px] leading-tight">{label}</span>
      </span>
      <span className="font-mono text-[11px] text-text-muted">{count}</span>
    </button>
  )
}

// ---------------------------------------------------------------------------
// FilterSidebar (main export)
// ---------------------------------------------------------------------------

export function FilterSidebar({ facets, activeFilters }: FilterSidebarProps) {
  const { setFilter, clearFilters, activeCount } = useCatalogFilters()

  const hasActiveFacets = activeCount > 0

  return (
    <aside className="hidden w-56 flex-shrink-0 md:block">
      {/* Header row */}
      <div className="flex items-center justify-between pb-3 border-b border-[rgba(0,30,80,0.06)]">
        <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-text-muted">
          Filtrar
        </span>
        {hasActiveFacets && (
          <button
            type="button"
            onClick={clearFilters}
            className="font-mono text-[10px] uppercase tracking-[0.10em] text-gold hover:text-gold-hover transition-colors duration-150"
          >
            Limpiar
          </button>
        )}
      </div>

      {/* Facet sections */}
      <div className="mt-1">
        {FACET_ORDER.map((facetKey) => {
          const options = facets[facetKey]
          if (!options || options.length === 0) return null

          const paramKey = FACET_PARAM_MAP[facetKey]
          const sectionLabel = FACET_LABELS[facetKey]

          return (
            <CollapsibleSection key={facetKey} title={sectionLabel}>
              <div className="flex flex-col gap-0.5">
                {options.map((opt) => {
                  const currentValue = activeFilters[paramKey] ?? null
                  const isActive = currentValue === opt.value

                  return (
                    <FilterOption
                      key={opt.value}
                      label={opt.label}
                      count={opt.count}
                      isActive={isActive}
                      onToggle={() => {
                        // Toggle: if already active, clear this param; otherwise set it
                        if (isActive) {
                          setFilter(paramKey, '')
                        } else {
                          setFilter(paramKey, opt.value)
                        }
                      }}
                    />
                  )
                })}
              </div>
            </CollapsibleSection>
          )
        })}
      </div>

      {/* Limpiar filtros — full link variant, bottom of panel */}
      {hasActiveFacets && (
        <button
          type="button"
          onClick={clearFilters}
          className="mt-4 font-mono text-[10px] uppercase tracking-[0.10em] text-text-muted hover:text-navy transition-colors duration-150"
        >
          Limpiar filtros
        </button>
      )}
    </aside>
  )
}
