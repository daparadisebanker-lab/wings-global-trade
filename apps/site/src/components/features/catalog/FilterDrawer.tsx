'use client'

// src/components/features/catalog/FilterDrawer.tsx
// Mobile-only bottom-sheet filter drawer.
// Shown on lg:hidden. Trigger: fixed floating button at bottom-right.
// Uses Framer Motion AnimatePresence for slide-up animation.

import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useCatalogFilters } from '@/hooks/useCatalogFilters'
import type { FilterKey } from '@/hooks/useCatalogFilters'
import type { FilterSidebarProps } from '@/components/features/catalog/FilterSidebar'

// ---------------------------------------------------------------------------
// Animation constants — drawn from src/lib/motion.ts easing signature
// ---------------------------------------------------------------------------

const DRAWER_VARIANTS = {
  hidden: { y: '100%', opacity: 0 },
  visible: {
    y: '0%',
    opacity: 1,
    transition: { duration: 0.35, ease: [0.0, 0.0, 0.2, 1.0] },
  },
  exit: {
    y: '100%',
    opacity: 0,
    transition: { duration: 0.28, ease: [0.4, 0.0, 1.0, 1.0] },
  },
}

const OVERLAY_VARIANTS = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.25, ease: [0.0, 0.0, 0.2, 1.0] } },
  exit: { opacity: 0, transition: { duration: 0.22, ease: [0.4, 0.0, 1.0, 1.0] } },
}

// ---------------------------------------------------------------------------
// Local types — extends FilterSidebarProps with drawer state
// ---------------------------------------------------------------------------

interface FilterDrawerProps extends FilterSidebarProps {
  isOpen: boolean
  onOpen: () => void
  onClose: () => void
}

// ---------------------------------------------------------------------------
// FilterGroup — collapsible section (shared between sidebar and drawer)
// ---------------------------------------------------------------------------

interface FacetOption {
  label: string
  value: string
  count: number
}

interface FilterGroupProps {
  title: string
  options: FacetOption[]
  paramKey: FilterKey
  activeValue: string | null
  onToggle: (paramKey: FilterKey, value: string, isActive: boolean) => void
}

function FilterGroup({ title, options, paramKey, activeValue, onToggle }: FilterGroupProps) {
  return (
    <div className="border-b border-[rgba(0,30,80,0.06)]">
      <p className="py-3 font-mono text-[10px] uppercase tracking-[0.15em] text-navy/65">
        {title}
      </p>
      <div className="flex flex-col gap-0.5 pb-3">
        {options.map((opt) => {
          const isActive = activeValue === opt.value
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onToggle(paramKey, opt.value, isActive)}
              className={cn(
                'flex w-full items-center justify-between rounded-wings px-2 py-2 text-left transition-colors duration-150',
                isActive
                  ? 'bg-gold/10 text-navy'
                  : 'text-navy/70 hover:bg-[rgba(0,30,80,0.04)] hover:text-navy',
              )}
            >
              <span className="flex items-center gap-2">
                <span
                  className={cn(
                    'flex h-3.5 w-3.5 flex-shrink-0 items-center justify-center rounded-wings border transition-colors duration-150',
                    isActive
                      ? 'border-gold bg-gold'
                      : 'border-[rgba(0,30,80,0.18)] bg-white',
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
                <span className="font-body text-[14px] leading-tight">{opt.label}</span>
              </span>
              <span className="font-mono text-[11px] text-navy/55">{opt.count}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// FACET_ORDER and mapping — mirrors FilterSidebar
// ---------------------------------------------------------------------------

type FacetGroups = FilterSidebarProps['facets']
type FacetKey = keyof FacetGroups

const FACET_PARAM_MAP: Record<FacetKey, FilterKey> = {
  hp: 'hp',
  traction: 'traction',
  transmission: 'transmission',
  brand: 'brand',
  subcategories: 'sub',
  fuel: 'fuel',
  payload: 'payload',
  usage: 'usage',
}

const FACET_LABELS: Record<FacetKey, string> = {
  hp: 'Potencia',
  traction: 'Tracción',
  transmission: 'Transmisión',
  brand: 'Marca',
  subcategories: 'Categoría',
  fuel: 'Combustible',
  payload: 'Tonelaje',
  usage: 'Aplicación',
}

const CATEGORY_FACET_LABELS: Partial<Record<string, Partial<Record<FacetKey, string>>>> = {
  buses: { fuel: 'Propulsión' },
}

function getFacetLabel(categorySlug: string, facetKey: FacetKey): string {
  return CATEGORY_FACET_LABELS[categorySlug]?.[facetKey] ?? FACET_LABELS[facetKey]
}

function getFacetOrder(categorySlug: string): FacetKey[] {
  if (categorySlug === 'camiones') {
    return ['subcategories', 'fuel', 'payload', 'usage', 'hp', 'traction', 'transmission', 'brand']
  }
  if (categorySlug === 'buses') {
    return ['fuel', 'brand']
  }
  return ['subcategories', 'hp', 'traction', 'transmission', 'brand']
}

// ---------------------------------------------------------------------------
// FloatingTriggerButton — fixed at bottom-right, always rendered
// ---------------------------------------------------------------------------

interface FloatingTriggerProps {
  activeCount: number
  onClick: () => void
}

function FloatingTriggerButton({ activeCount, onClick }: FloatingTriggerProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'fixed bottom-[84px] right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-navy shadow-lg lg:hidden',
        'transition-colors duration-200 hover:bg-navy-light',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold',
      )}
      aria-label={`Filtros${activeCount > 0 ? `, ${activeCount} activos` : ''}`}
    >
      <svg width="16" height="14" viewBox="0 0 16 14" fill="none" aria-hidden>
        <path d="M1 1h14M4 7h8M6.5 13h3" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      {activeCount > 0 && (
        <span
          className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-gold text-[9px] font-bold leading-none text-navy"
          aria-hidden
        >
          {activeCount}
        </span>
      )}
    </button>
  )
}

// ---------------------------------------------------------------------------
// FilterDrawer (main export)
// ---------------------------------------------------------------------------

export function FilterDrawer({
  facets,
  activeFilters,
  categorySlug,
  isOpen,
  onOpen,
  onClose,
}: FilterDrawerProps) {
  const { setFilter, clearFilters, activeCount } = useCatalogFilters()

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  function handleToggle(paramKey: FilterKey, value: string, isActive: boolean) {
    if (isActive) {
      setFilter(paramKey, '')
    } else {
      setFilter(paramKey, value)
    }
  }

  function handleClearAll() {
    clearFilters()
    onClose()
  }

  return (
    <>
      {/* Floating trigger button — always visible on mobile */}
      <FloatingTriggerButton activeCount={activeCount} onClick={onOpen} />

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop overlay */}
            <motion.div
              key="filter-drawer-overlay"
              variants={OVERLAY_VARIANTS}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={onClose}
              className="fixed inset-0 z-50 bg-[rgba(0,30,80,0.48)] lg:hidden"
              aria-hidden
            />

            {/* Drawer panel */}
            <motion.div
              key="filter-drawer-panel"
              variants={DRAWER_VARIANTS}
              initial="hidden"
              animate="visible"
              exit="exit"
              className={cn(
                'fixed bottom-0 left-0 right-0 z-50 max-h-[85vh] overflow-y-auto',
                'rounded-t-[8px] bg-warm-white px-5 pb-8 pt-4 lg:hidden',
              )}
              role="dialog"
              aria-modal="true"
              aria-label="Filtros"
            >
              {/* Drag handle indicator */}
              <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-[rgba(0,30,80,0.12)]" aria-hidden />

              {/* Header */}
              <div className="mb-4 flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-navy/65">
                  Filtrar
                </span>
                <button
                  type="button"
                  onClick={onClose}
                  className="font-mono text-[10px] uppercase tracking-[0.10em] text-navy/55 hover:text-navy transition-colors duration-150"
                  aria-label="Cerrar filtros"
                >
                  Cerrar
                </button>
              </div>

              {/* Facet groups */}
              <div>
                {getFacetOrder(categorySlug).map((facetKey) => {
                  const options = facets[facetKey]
                  if (!options || options.length === 0) return null

                  const paramKey = FACET_PARAM_MAP[facetKey]
                  const activeValue = activeFilters[paramKey] ?? null

                  return (
                    <FilterGroup
                      key={facetKey}
                      title={getFacetLabel(categorySlug, facetKey)}
                      options={options}
                      paramKey={paramKey}
                      activeValue={activeValue}
                      onToggle={handleToggle}
                    />
                  )
                })}
              </div>

              {/* Footer actions */}
              <div className="mt-5 flex items-center justify-between">
                {activeCount > 0 ? (
                  <button
                    type="button"
                    onClick={handleClearAll}
                    className="font-mono text-[10px] uppercase tracking-[0.10em] text-navy/55 hover:text-navy transition-colors duration-150"
                  >
                    Limpiar filtros
                  </button>
                ) : (
                  <span />
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className={cn(
                    'rounded-wings bg-navy px-6 py-2.5',
                    'font-mono text-[11px] uppercase tracking-[0.12em] text-warm-white',
                    'transition-colors duration-200 hover:bg-navy-light',
                    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold',
                  )}
                >
                  {activeCount > 0 ? `Ver resultados (${activeCount})` : 'Ver resultados'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

// ---------------------------------------------------------------------------
// Re-export the trigger separately so the parent can control isOpen state
// ---------------------------------------------------------------------------

export { FloatingTriggerButton }
