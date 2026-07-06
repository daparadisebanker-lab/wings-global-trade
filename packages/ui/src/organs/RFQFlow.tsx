// @wings/trade-ui · RFQFlow — the product request-for-quote form (ecosystem §2).
// Ported verbatim from apps/site catalog/InquiryForm (M3b). Markup/behavior are
// byte-identical; lane-specific bits are injected as props (product, destination
// countries, submit endpoint, localStorage key prefix, toast notify, success
// renderer). Spanish copy is kept as organ defaults — copy-debt to parameterize
// when a non-Wings lane consumes this.
'use client'

import { useEffect, useRef, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { motion, useAnimation } from 'framer-motion'
import { useRFQForm } from '../hooks/useRFQForm'
import { Input } from '../primitives/Input'
import { Textarea } from '../primitives/Textarea'
import { Select } from '../primitives/Select'
import { Button } from '../primitives/Button'
import { cn } from '../lib/cn'

interface SavedInquiry {
  variantSlug: string | undefined
  variantName: string | undefined
  formData: {
    full_name: string
    company: string
    email: string
    phone: string
    destination_country: string
    quantity: string
    message: string
  }
  savedAt: number
}

export interface RFQFlowProps {
  productId?: string
  productName: string
  productSlug: string
  selectedVariant?: string
  /** Destination country options for the select (lane content). */
  countries: readonly string[]
  /** Endpoint the RFQ posts to (e.g. '/api/leads/catalog'). */
  endpoint: string
  /** localStorage key prefix for draft persistence (e.g. 'wings_inquiry_'). */
  storageKeyPrefix: string
  /** Toast on network error (injected so the organ carries no toast dependency). */
  notify: (message: string, type: 'error') => void
  /** Success state renderer (injected, e.g. Wings InquirySuccess). */
  renderSuccess: () => ReactNode
  onSuccess?: () => void
}

const FIELD_SEQUENCE = ['full_name', 'company', 'email', 'phone', 'destination_country', 'quantity']

function getNextField(current: string): string | null {
  const idx = FIELD_SEQUENCE.indexOf(current)
  if (idx === -1 || idx === FIELD_SEQUENCE.length - 1) return null
  return FIELD_SEQUENCE[idx + 1]
}

function checkFieldValid(field: string, value: string): boolean {
  switch (field) {
    case 'full_name': return value.trim().length >= 2
    case 'email': return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
    case 'phone': return value.trim().length >= 7
    case 'destination_country': return Boolean(value)
    case 'quantity': return value.trim().length >= 1
    default: return true
  }
}

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

export function RFQFlow({
  productId,
  productName,
  productSlug,
  selectedVariant,
  countries,
  endpoint,
  storageKeyPrefix,
  notify,
  renderSuccess,
  onSuccess,
}: RFQFlowProps) {
  const { values, errors, status, setField, submit } = useRFQForm({
    productId,
    productName,
    selectedModel: selectedVariant,
    endpoint,
  })

  const slug = productSlug
  const storageKey = (s: string) => `${storageKeyPrefix}${s}`
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const firstFieldRef = useRef<HTMLInputElement>(null)

  const [pulseField, setPulseField] = useState<string | null>(null)

  const borderControls = useAnimation()
  const buttonControls = useAnimation()

  const allRequiredValid =
    values.full_name.trim().length >= 2 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email) &&
    values.phone.trim().length >= 7 &&
    Boolean(values.destination_country) &&
    values.quantity.trim().length >= 1

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey(slug))
      if (!raw) return
      const saved: SavedInquiry = JSON.parse(raw)
      if (Date.now() - saved.savedAt > 7 * 24 * 60 * 60 * 1000) {
        localStorage.removeItem(storageKey(slug))
        return
      }
      const d = saved.formData
      if (d.full_name) setField('full_name', d.full_name)
      if (d.company) setField('company', d.company)
      if (d.email) setField('email', d.email)
      if (d.phone) setField('phone', d.phone)
      if (d.destination_country) setField('destination_country', d.destination_country)
      if (d.quantity) setField('quantity', d.quantity)
      if (d.message) setField('message', d.message)
    } catch {
      // localStorage unavailable or corrupt — continue silently
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const isMobile = window.matchMedia('(max-width: 768px)').matches
    if (!isMobile && firstFieldRef.current) {
      firstFieldRef.current.focus()
    }
  }, [])

  useEffect(() => {
    if (status === 'success') return
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(() => {
      try {
        const payload: SavedInquiry = {
          variantSlug: selectedVariant,
          variantName: selectedVariant,
          formData: { ...values },
          savedAt: Date.now(),
        }
        localStorage.setItem(storageKey(slug), JSON.stringify(payload))
      } catch {
        // localStorage unavailable — continue silently
      }
    }, 800)
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values, selectedVariant, slug, status])

  useEffect(() => {
    if (allRequiredValid && !prefersReducedMotion()) {
      borderControls.start({
        pathLength: 1,
        transition: { duration: 0.6, ease: 'easeInOut' },
      })
    } else {
      borderControls.set({ pathLength: 0 })
    }
  }, [allRequiredValid, borderControls])

  useEffect(() => {
    if (status === 'success') {
      try {
        localStorage.removeItem(storageKey(slug))
      } catch {
        // ignore
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, slug])

  if (status === 'success') {
    return <>{renderSuccess()}</>
  }

  const disabled = status === 'submitting'

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const result = await submit()
    if (result === 'ok') {
      if (!prefersReducedMotion()) {
        await buttonControls.start({
          scale: [1, 0.96, 1],
          rotate: [0, -1, 0],
          transition: { duration: 0.4, ease: 'easeInOut' },
        })
      }
      onSuccess?.()
    } else if (result === 'invalid') {
      focusFirstInvalidField()
    } else {
      notify('No pudimos enviar tu solicitud. Intenta nuevamente o escríbenos por WhatsApp.', 'error')
    }
  }

  function focusFirstInvalidField() {
    for (const field of FIELD_SEQUENCE) {
      if (checkFieldValid(field, values[field as keyof typeof values])) continue
      const el = document.getElementById(field)
      if (el instanceof HTMLElement) {
        el.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'center' })
        el.focus()
      }
      return
    }
  }

  function handleBlur(field: string) {
    setField(field as Parameters<typeof setField>[0], values[field as keyof typeof values])
    if (prefersReducedMotion()) return
    const isValid = checkFieldValid(field, values[field as keyof typeof values])
    if (isValid) {
      const next = getNextField(field)
      if (next) {
        setPulseField(next)
        setTimeout(() => setPulseField(null), 200)
      }
    }
  }

  function triggerSelectPulse(nextField: string) {
    if (prefersReducedMotion()) return
    setPulseField(nextField)
    setTimeout(() => setPulseField(null), 200)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-wings-card border border-border-default bg-surface-card p-6"
    >
      <h2 className="font-body text-sm font-medium tracking-tight text-navy">Solicitar este modelo</h2>
      <p className="mt-1 font-body text-sm text-text-muted">
        Completa tus datos y el equipo de Wings te enviará una cotización detallada.
      </p>

      <div className="mt-5 space-y-4">
        <Field label="Nombre completo" htmlFor="full_name" error={errors.full_name} required pulse={pulseField === 'full_name'}>
          <Input
            ref={firstFieldRef}
            id="full_name"
            value={values.full_name}
            onChange={(e) => setField('full_name', e.target.value)}
            onBlur={() => handleBlur('full_name')}
            hasError={Boolean(errors.full_name)}
            aria-invalid={errors.full_name ? true : undefined}
            aria-describedby={errors.full_name ? 'full_name-error' : undefined}
            disabled={disabled}
            placeholder="Tu nombre completo"
            autoComplete="name"
          />
        </Field>

        <Field label="Empresa" htmlFor="company" pulse={pulseField === 'company'}>
          <Input
            id="company"
            value={values.company}
            onChange={(e) => setField('company', e.target.value)}
            placeholder="Empresa o razón social"
            disabled={disabled}
            autoComplete="organization"
          />
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Email" htmlFor="email" error={errors.email} required pulse={pulseField === 'email'}>
            <Input
              id="email"
              type="email"
              value={values.email}
              onChange={(e) => setField('email', e.target.value)}
              onBlur={() => handleBlur('email')}
              hasError={Boolean(errors.email)}
              aria-invalid={errors.email ? true : undefined}
              aria-describedby={errors.email ? 'email-error' : undefined}
              disabled={disabled}
              placeholder="correo@empresa.com"
              autoComplete="email"
            />
          </Field>
          <Field label="WhatsApp / teléfono" htmlFor="phone" error={errors.phone} required pulse={pulseField === 'phone'}>
            <Input
              id="phone"
              value={values.phone}
              onChange={(e) => setField('phone', e.target.value)}
              onBlur={() => handleBlur('phone')}
              hasError={Boolean(errors.phone)}
              aria-invalid={errors.phone ? true : undefined}
              aria-describedby={errors.phone ? 'phone-error' : undefined}
              disabled={disabled}
              placeholder="+51 999 000 000"
              autoComplete="tel"
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field
            label="País de destino"
            htmlFor="destination_country"
            error={errors.destination_country}
            required
            pulse={pulseField === 'destination_country'}
          >
            <Select
              id="destination_country"
              value={values.destination_country}
              onChange={(e) => {
                setField('destination_country', e.target.value)
                if (e.target.value) triggerSelectPulse('quantity')
              }}
              hasError={Boolean(errors.destination_country)}
              aria-invalid={errors.destination_country ? true : undefined}
              aria-describedby={errors.destination_country ? 'destination_country-error' : undefined}
              disabled={disabled}
            >
              <option value="">Selecciona el país de destino</option>
              {countries.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Cantidad requerida" htmlFor="quantity" error={errors.quantity} required pulse={pulseField === 'quantity'}>
            <Input
              id="quantity"
              value={values.quantity}
              onChange={(e) => setField('quantity', e.target.value)}
              onBlur={() => handleBlur('quantity')}
              hasError={Boolean(errors.quantity)}
              aria-invalid={errors.quantity ? true : undefined}
              aria-describedby={errors.quantity ? 'quantity-error' : undefined}
              disabled={disabled}
              placeholder="Ej: 10 unidades"
            />
          </Field>
        </div>

        <Field label="Producto de interés" htmlFor="product_ref">
          <Input
            id="product_ref"
            value={selectedVariant ? `${productName} — ${selectedVariant}` : productName}
            readOnly
            disabled
            className="opacity-70"
          />
        </Field>

        {selectedVariant && (
          <div className="flex items-center gap-2 rounded-none border border-gold/25 bg-gold/[0.04] px-3 py-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-gold/60">Modelo seleccionado</span>
            <span className="font-mono text-[11px] font-medium text-navy">{selectedVariant}</span>
          </div>
        )}

        <Field label="Especificaciones adicionales (opcional)" htmlFor="message">
          <Textarea
            id="message"
            value={values.message}
            onChange={(e) => setField('message', e.target.value)}
            disabled={disabled}
            placeholder="Especificaciones adicionales, certificaciones, plazos..."
          />
        </Field>
      </div>

      <p className="mt-5 font-mono text-[10px] text-navy/50">
        Respuesta en 24 horas · Sin compromiso de compra
      </p>

      <div className="relative mt-2">
        <svg
          aria-hidden
          className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
        >
          <motion.rect
            x="1"
            y="1"
            width="calc(100% - 2px)"
            height="calc(100% - 2px)"
            rx="4"
            fill="none"
            stroke="#C4933F"
            strokeWidth="2"
            initial={{ pathLength: 0 }}
            animate={borderControls}
          />
        </svg>

        <motion.div animate={buttonControls}>
          <Button type="submit" className="w-full" isLoading={disabled} size="lg">
            Enviar solicitud de consulta
          </Button>
        </motion.div>
      </div>
    </form>
  )
}

function Field({
  label,
  htmlFor,
  error,
  required,
  pulse,
  children,
}: {
  label: string
  htmlFor: string
  error?: string
  required?: boolean
  pulse?: boolean
  children: ReactNode
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block font-body text-sm font-medium text-navy">
        {label}
        {required && <span className="text-gold"> *</span>}
      </label>
      <div
        className={cn(
          'rounded-wings transition-shadow duration-200',
          pulse && 'shadow-[0_0_0_2px_rgba(196,147,63,0.5)]',
        )}
      >
        {children}
      </div>
      {error && (
        <p id={`${htmlFor}-error`} className="mt-1 font-body text-xs text-[#DC2626]">
          {error}
        </p>
      )}
    </div>
  )
}
