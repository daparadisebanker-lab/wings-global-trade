// src/hooks/useInquiryForm.ts
'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { CatalogLeadRequest } from '@/types/api'

interface InquiryFormState {
  full_name: string
  company: string
  email: string
  phone: string
  destination_country: string
  quantity: string
  message: string
}

const EMPTY: InquiryFormState = {
  full_name: '',
  company: '',
  email: '',
  phone: '',
  destination_country: '',
  quantity: '',
  message: '',
}

interface UseInquiryFormArgs {
  productId?: string
  productName: string
  selectedModel?: string
}

export function useInquiryForm({ productId, productName, selectedModel }: UseInquiryFormArgs) {
  const [values, setValues] = useState<InquiryFormState>(EMPTY)
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [errors, setErrors] = useState<Partial<Record<keyof InquiryFormState, string>>>({})
  // Ref so submit callback always reads the latest model without needing it in deps
  const selectedModelRef = useRef(selectedModel)
  useEffect(() => { selectedModelRef.current = selectedModel }, [selectedModel])

  const setField = useCallback(
    (field: keyof InquiryFormState, value: string) => {
      setValues((prev) => ({ ...prev, [field]: value }))
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    },
    [],
  )

  const validate = useCallback((): boolean => {
    const next: Partial<Record<keyof InquiryFormState, string>> = {}
    if (values.full_name.trim().length < 2) next.full_name = 'Ingresa tu nombre completo'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) next.email = 'Email inválido'
    if (values.phone.trim().length < 7) next.phone = 'Ingresa un número válido'
    if (!values.destination_country) next.destination_country = 'Selecciona un país'
    if (values.quantity.trim().length < 1) next.quantity = 'Indica la cantidad requerida'
    setErrors(next)
    return Object.keys(next).length === 0
  }, [values])

  const submit = useCallback(async (): Promise<boolean> => {
    if (status === 'submitting') return false
    if (!validate()) return false
    setStatus('submitting')

    const effectiveName = selectedModelRef.current
      ? `${productName} — ${selectedModelRef.current}`
      : productName

    const payload: CatalogLeadRequest = {
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
      const res = await fetch('/api/leads/catalog', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error(`Request failed: ${res.status}`)
      setStatus('success')
      return true
    } catch (error) {
      console.error('[useInquiryForm] submit', error)
      setStatus('error')
      return false
    }
  }, [status, validate, values, productId, productName])

  return { values, errors, status, setField, submit }
}
