// src/hooks/useCifEstimate.ts
'use client'

import { useCallback, useRef, useState } from 'react'
import type { TprState, CifEstimate } from '@/types/mister'

export function useCifEstimate() {
  const [estimate, setEstimate] = useState<CifEstimate | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inFlight = useRef(false)

  const generate = useCallback(async (tpr: TprState): Promise<CifEstimate | null> => {
    if (inFlight.current) return null
    if (!tpr.product_description || !tpr.quantity || !tpr.destination_country || tpr.target_price_usd == null) {
      return null
    }

    inFlight.current = true
    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/mister/estimate', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          product_description: tpr.product_description,
          hs_code: tpr.hs_code,
          quantity: tpr.quantity,
          target_price_usd: tpr.target_price_usd,
          destination_country: tpr.destination_country,
          destination_port: tpr.destination_port,
          certifications: tpr.certifications,
        }),
      })
      if (!res.ok) throw new Error(`Estimate failed: ${res.status}`)
      const data = (await res.json()) as { estimate: CifEstimate }
      setEstimate(data.estimate)
      return data.estimate
    } catch (err) {
      console.error('[useCifEstimate] generate', err)
      setError('No pudimos generar el estimado en este momento.')
      return null
    } finally {
      inFlight.current = false
      setIsLoading(false)
    }
  }, [])

  const reset = useCallback(() => {
    setEstimate(null)
    setError(null)
  }, [])

  return { estimate, isLoading, error, generate, reset }
}
