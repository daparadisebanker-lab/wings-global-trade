'use client'

// src/components/features/catalog/FilterChipRow.tsx
// Horizontal scrollable quick-filter chip strip.
// Visible on all screen sizes — gives fast one-tap filtering before opening the sidebar/drawer.
// Category-smart: camiones shows fuel + payload; maquinaria-agricola shows HP; others show brand.

import { cn } from '@/lib/utils'
import { useCatalogFilters } from '@/hooks/useCatalogFilters'
import type { FilterKey } from '@/hooks/useCatalogFilters'

interface FacetOption {
  value: string
  label: string
  count: number
}

interface FacetGroups {
  hp?: FacetOption[]
  brand?: FacetOption[]
  fuel?: FacetOption[]
  payload?: FacetOption[]
  usage?: FacetOption[]
  traction?: FacetOption[]
  transmission?: FacetOption[]
}

interface FilterChipRowProps {
  categorySlug: string
  facets: FacetGroups
  activeFilters: Record<string, string | undefined>
}

interface ChipGroupConfig {
  paramKey: FilterKey
  label: string
  options: FacetOption[]
}

function getChipGroups(categorySlug: string, facets: FacetGroups): ChipGroupConfig[] {
  if (categorySlug === 'camiones') {
    const groups: ChipGroupConfig[] = []
    if (facets.fuel?.length) groups.push({ paramKey: 'fuel', label: 'Combustible', options: facets.fuel })
    if (facets.payload?.length) groups.push({ paramKey: 'payload', label: 'Tonelaje', options: facets.payload })
    if (facets.usage?.length) groups.push({ paramKey: 'usage', label: 'Aplicación', options: facets.usage })
    return groups
  }
  if (categorySlug === 'maquinaria-agricola') {
    const groups: ChipGroupConfig[] = []
    if (facets.hp?.length) groups.push({ paramKey: 'hp', label: 'Potencia', options: facets.hp })
    if (facets.brand?.length) groups.push({ paramKey: 'brand', label: 'Marca', options: facets.brand })
    return groups
  }
  if (categorySlug === 'buses') {
    const groups: ChipGroupConfig[] = []
    if (facets.fuel?.length) groups.push({ paramKey: 'fuel', label: 'Propulsión', options: facets.fuel })
    if (facets.brand?.length) groups.push({ paramKey: 'brand', label: 'Marca', options: facets.brand })
    return groups
  }
  if (facets.brand?.length) {
    return [{ paramKey: 'brand', label: 'Marca', options: facets.brand }]
  }
  return []
}

interface ChipProps {
  label: string
  count: number
  isActive: boolean
  isDisabled: boolean
  onToggle: () => void
}

function Chip({ label, count, isActive, isDisabled, onToggle }: ChipProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={isDisabled}
      className={cn(
        'flex shrink-0 items-center gap-1.5 border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.10em] transition-all duration-150',
        isActive
          ? 'border-gold bg-gold/10 text-navy'
          : 'border-[rgba(0,30,80,0.12)] text-navy/50 hover:border-gold/40 hover:text-navy',
        isDisabled && 'cursor-not-allowed opacity-40',
      )}
    >
      <span>{label}</span>
      {isActive && <span className="text-gold/60">×</span>}
      {!isActive && (
        <span className="text-[10px] text-navy/50">{count}</span>
      )}
    </button>
  )
}

export function FilterChipRow({ categorySlug, facets, activeFilters }: FilterChipRowProps) {
  const { setFilter, clearFilters, activeCount } = useCatalogFilters()

  const groups = getChipGroups(categorySlug, facets)
  if (groups.length === 0) return null

  function handleToggle(paramKey: FilterKey, value: string) {
    const current = activeFilters[paramKey]
    setFilter(paramKey, current === value ? '' : value)
  }

  return (
    <div className="mb-6 flex flex-col gap-2">
      {groups.map((group) => (
        <div key={group.paramKey} className="relative -mx-6 md:mx-0">
          <div className="no-scrollbar overflow-x-auto px-6 md:px-0">
            <div className="flex items-center gap-0">
              <span className="mr-2.5 shrink-0 font-mono text-[9px] uppercase tracking-[0.18em] text-navy/40">
                {group.label}:
              </span>
              <div className="flex items-center gap-1.5">
                {group.options.map((opt) => {
                  const isActive = activeFilters[group.paramKey] === opt.value
                  return (
                    <Chip
                      key={opt.value}
                      label={opt.label}
                      count={opt.count}
                      isActive={isActive}
                      isDisabled={false}
                      onToggle={() => handleToggle(group.paramKey, opt.value)}
                    />
                  )
                })}
              </div>
            </div>
          </div>
          <div
            className="pointer-events-none absolute right-0 top-0 h-full w-12 bg-gradient-to-l from-warm-white to-transparent md:hidden"
            aria-hidden
          />
        </div>
      ))}

      {/* Clear all — only when filters active */}
      {activeCount > 0 && (
        <button
          type="button"
          onClick={clearFilters}
          className="self-start font-mono text-[10px] uppercase tracking-[0.10em] text-navy/35 transition-colors hover:text-navy"
        >
          Limpiar filtros
        </button>
      )}
    </div>
  )
}
