// @wings/trade-ui — RFQ form controller. Ported verbatim from apps/site
// hooks/useInquiryForm.ts (M3b); the submit endpoint is injected so the organ is
// lane-agnostic. Behavior byte-identical to the app hook.
'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

interface RFQFormState {
  full_name: string
  company: string
  email: string
  phone: string
  destination_country: string
  quantity: string
  message: string
}

const EMPTY: RFQFormState = {
  full_name: '',
  company: '',
  email: '',
  phone: '',
  destination_country: '',
  quantity: '',
  message: '',
}

/** Request body posted to the RFQ endpoint. Structurally matches the app's
 *  CatalogLeadRequest; kept local so the package carries no app type import. */
export interface RFQLeadRequest {
  full_name: string
  company?: string
  email: string
  phone: string
  destination_country: string
  product_id?: string
  product_name: string
  quantity: string
  message?: string
  source_url?: string
}

interface UseRFQFormArgs {
  productId?: string
  productName: string
  selectedModel?: string
  /** Endpoint the RFQ posts to (e.g. '/api/leads/catalog'). Injected by the lane. */
  endpoint: string
}

/** 'invalid' = client validation failed (guide to field, no toast);
 *  'network_error' = request failed (show fallback toast). */
export type RFQSubmitResult = 'ok' | 'invalid' | 'network_error'

export function useRFQForm({ productId, productName, selectedModel, endpoint }: UseRFQFormArgs) {
  const [values, setValues] = useState<RFQFormState>(EMPTY)
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [errors, setErrors] = useState<Partial<Record<keyof RFQFormState, string>>>({})
  const selectedModelRef = useRef(selectedModel)
  useEffect(() => {
    selectedModelRef.current = selectedModel
  }, [selectedModel])

  const setField = useCallback((field: keyof RFQFormState, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: undefined }))
  }, [])

  const validate = useCallback((): boolean => {
    const next: Partial<Record<keyof RFQFormState, string>> = {}
    if (values.full_name.trim().length < 2) next.full_name = 'Ingresa tu nombre completo'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) next.email = 'Email inválido'
    if (values.phone.trim().length < 7) next.phone = 'Ingresa un número válido'
    if (!values.destination_country) next.destination_country = 'Selecciona un país'
    if (values.quantity.trim().length < 1) next.quantity = 'Indica la cantidad requerida'
    setErrors(next)
    return Object.keys(next).length === 0
  }, [values])

  const submit = useCallback(async (): Promise<RFQSubmitResult> => {
    if (status === 'submitting') return 'invalid'
    if (!validate()) return 'invalid'
    setStatus('submitting')

    const effectiveName = selectedModelRef.current
      ? `${productName} — ${selectedModelRef.current}`
      : productName

    const payload: RFQLeadRequest = {
      full_name: values.full_name.trim(),
      company: values.company.trim() || undefined,
      email: values.email.trim(),
      phone: values.phone.trim(),
      destination_country: values.destination_country,
      product_id: productId,
      product_name: effectiveName,
      quantity: values.quantity.trim(),
      message: values.message.trim() || undefined,
      source_url: typeof window !== 'undefined' ? window.location.href : undefined,
    }

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error(`Request failed: ${res.status}`)
      setStatus('success')
      return 'ok'
    } catch (error) {
      console.error('[useRFQForm] submit', error)
      setStatus('error')
      return 'network_error'
    }
  }, [status, validate, values, productId, productName, endpoint])

  return { values, errors, status, setField, submit }
}
