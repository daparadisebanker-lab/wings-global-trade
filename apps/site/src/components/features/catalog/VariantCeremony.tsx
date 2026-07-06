'use client'

/**
 * Integration wiring for the Variant Selection Ceremony:
 *
 * 1. Wrap the product detail page with <VariantCeremonyProvider>
 * 2. In ProductSpecTable (or wherever variant selection happens), call:
 *      const { triggerCeremony } = useVariantCeremony()
 *      triggerCeremony(newVariant.specs, `variant-${newVariant.model}`)
 *    on every variant change.
 * 3. In each animated spec cell, read `ceremonyKey` — when it changes, run the
 *    exit-up / enter-from-below AnimatePresence transition keyed to ceremonyKey.
 * 4. ProductHpMeter and any authentication badge components read `ceremonyKey`
 *    to retrigger their own animations.
 */

import { createContext, useContext, useState, useCallback } from 'react'

interface VariantCeremonyContextValue {
  ceremonyKey: string
  previousSpecs: Record<string, unknown> | null
  currentSpecs: Record<string, unknown> | null
  triggerCeremony: (newSpecs: Record<string, unknown>, key: string) => void
}

const VariantCeremonyContext = createContext<VariantCeremonyContextValue>({
  ceremonyKey: 'initial',
  previousSpecs: null,
  currentSpecs: null,
  triggerCeremony: () => {},
})

export function VariantCeremonyProvider({ children }: { children: React.ReactNode }) {
  const [ceremonyKey, setCeremonyKey] = useState('initial')
  const [previousSpecs, setPreviousSpecs] = useState<Record<string, unknown> | null>(null)
  const [currentSpecs, setCurrentSpecs] = useState<Record<string, unknown> | null>(null)

  const triggerCeremony = useCallback(
    (newSpecs: Record<string, unknown>, key: string) => {
      setCurrentSpecs((prev) => {
        setPreviousSpecs(prev)
        return newSpecs
      })
      setCeremonyKey(key)
    },
    [],
  )

  return (
    <VariantCeremonyContext.Provider
      value={{ ceremonyKey, previousSpecs, currentSpecs, triggerCeremony }}
    >
      {children}
    </VariantCeremonyContext.Provider>
  )
}

export function useVariantCeremony(): VariantCeremonyContextValue {
  return useContext(VariantCeremonyContext)
}
