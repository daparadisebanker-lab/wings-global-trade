// src/components/features/accio/AccioSubmitForm.tsx
'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { ConversationTurn } from '@/types/database'
import type { TprState, CifEstimate, AccioSubmitRequest } from '@/types/accio'
import { useToast } from '@/components/ui/toast'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { AccioSuccess } from '@/components/features/accio/AccioSuccess'

interface AccioSubmitFormProps {
  open: boolean
  onClose: () => void
  tpr: TprState
  estimate: CifEstimate | null
  conversation: ConversationTurn[]
  sessionId: string
}

interface Values {
  full_name: string
  company: string
  email: string
  phone: string
}

export function AccioSubmitForm({
  open,
  onClose,
  tpr,
  estimate,
  conversation,
  sessionId,
}: AccioSubmitFormProps) {
  const { toast } = useToast()
  const [values, setValues] = useState<Values>({ full_name: '', company: '', email: '', phone: '' })
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle')
  const [errors, setErrors] = useState<Partial<Record<keyof Values, string>>>({})
  const [leadId, setLeadId] = useState<string | number | undefined>()

  function set(field: keyof Values, value: string) {
    setValues((p) => ({ ...p, [field]: value }))
    setErrors((p) => ({ ...p, [field]: undefined }))
  }

  /** Validate a single field on blur — per ENRICHED_SPEC §4.4 */
  function validateField(field: keyof Values) {
    const next: Partial<Record<keyof Values, string>> = {}
    if (field === 'full_name' && values.full_name.trim().length < 2) {
      next.full_name = 'Este campo es requerido.'
    }
    if (field === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      next.email = 'Ingresa un correo electrónico válido.'
    }
    if (field === 'phone' && values.phone.trim().length < 7) {
      next.phone = 'Ingresa un número de teléfono con código de país (+51, +56...).'
    }
    setErrors((prev) => ({ ...prev, ...next }))
  }

  function validate(): boolean {
    const next: Partial<Record<keyof Values, string>> = {}
    if (values.full_name.trim().length < 2) next.full_name = 'Este campo es requerido.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email))
      next.email = 'Ingresa un correo electrónico válido.'
    if (values.phone.trim().length < 7)
      next.phone = 'Ingresa un número de teléfono con código de país (+51, +56...).'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate() || status === 'submitting') return
    if (!tpr.product_description || !tpr.quantity || !tpr.destination_country) {
      toast('Faltan datos mínimos del requerimiento.', 'error')
      return
    }
    setStatus('submitting')

    const payload: AccioSubmitRequest = {
      full_name: values.full_name.trim(),
      company: values.company.trim() || undefined,
      email: values.email.trim(),
      phone: values.phone.trim(),
      tpr: {
        ...tpr,
        product_description: tpr.product_description,
        quantity: tpr.quantity,
        destination_country: tpr.destination_country,
      },
      estimate: estimate
        ? {
            free_zone: estimate.free_zone,
            cif_total_usd: estimate.cif_total_usd,
            duty_amount_usd: estimate.duty_amount_usd,
            free_zone_savings_pct: estimate.free_zone_savings_pct,
          }
        : undefined,
      conversation_snapshot: conversation.slice(-10),
      session_id: sessionId,
    }

    try {
      const res = await fetch('/api/accio/submit', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error(`Submit failed: ${res.status}`)
      const data = await res.json().catch(() => ({}))
      // Extract lead/project ID for reference number
      setLeadId(data?.id ?? data?.lead_id ?? data?.accio_project_id)
      setStatus('success')
    } catch (error) {
      console.error('[AccioSubmitForm] submit', error)
      setStatus('idle')
      // Per ENRICHED_SPEC §3.6 — exact error copy
      toast('No pudimos enviar tu solicitud. Intenta nuevamente o escríbenos por WhatsApp.', 'error')
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[90] flex items-end justify-center bg-navy/40 p-0 sm:items-center sm:p-6"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0, 0, 0.2, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-wings-card bg-warm-white sm:rounded-wings-card"
          >
            {status === 'success' ? (
              <AccioSuccess tpr={tpr} estimate={estimate} leadId={leadId} />
            ) : (
              <form onSubmit={handleSubmit} className="p-6">
                {/* Per ENRICHED_SPEC §3.3 — Accio submit form heading */}
                <h3 className="font-body text-sm font-medium tracking-tight text-navy">Enviar consulta técnica</h3>
                <p className="mt-1 font-body text-sm text-text-muted">
                  Comparte tus datos de contacto para que el equipo de Wings prepare tu cotización.
                </p>

                {/* Trust signal — per ENRICHED_SPEC §4.3 */}
                <p className="mt-2 font-body text-xs text-text-muted">
                  Consulta sin compromiso. Sin cuenta requerida.
                </p>

                <div className="mt-5 space-y-4">
                  <Field label="Nombre completo" error={errors.full_name} required>
                    <Input
                      value={values.full_name}
                      onChange={(e) => set('full_name', e.target.value)}
                      onBlur={() => validateField('full_name')}
                      hasError={Boolean(errors.full_name)}
                      placeholder="Tu nombre completo"
                      autoComplete="name"
                    />
                  </Field>
                  <Field label="Empresa">
                    <Input
                      value={values.company}
                      onChange={(e) => set('company', e.target.value)}
                      placeholder="Empresa o razón social"
                      autoComplete="organization"
                    />
                  </Field>
                  <Field label="Email" error={errors.email} required>
                    <Input
                      type="email"
                      value={values.email}
                      onChange={(e) => set('email', e.target.value)}
                      onBlur={() => validateField('email')}
                      hasError={Boolean(errors.email)}
                      placeholder="correo@empresa.com"
                      autoComplete="email"
                    />
                  </Field>
                  <Field label="WhatsApp / teléfono" error={errors.phone} required>
                    <Input
                      value={values.phone}
                      onChange={(e) => set('phone', e.target.value)}
                      onBlur={() => validateField('phone')}
                      hasError={Boolean(errors.phone)}
                      placeholder="+51 999 000 000"
                      autoComplete="tel"
                    />
                  </Field>
                </div>

                <div className="mt-6 flex gap-3">
                  <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
                    Cancelar
                  </Button>
                  {/* Per ENRICHED_SPEC §3.4 — exact Accio submit CTA */}
                  <Button type="submit" isLoading={status === 'submitting'} className="flex-1">
                    Enviar consulta técnica
                  </Button>
                </div>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function Field({
  label,
  error,
  required,
  children,
}: {
  label: string
  error?: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="mb-1.5 block font-body text-sm font-medium text-navy">
        {label}
        {required && <span className="text-gold"> *</span>}
      </label>
      {children}
      {error && <p className="mt-1 font-body text-xs text-[#DC2626]">{error}</p>}
    </div>
  )
}
