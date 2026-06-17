// src/components/features/shared/ContactForm.tsx
'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useToast } from '@/components/ui/toast'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { SLIDE_UP } from '@/lib/motion'

interface Values {
  full_name: string
  email: string
  phone: string
  message: string
}

export function ContactForm() {
  const { toast } = useToast()
  const [values, setValues] = useState<Values>({ full_name: '', email: '', phone: '', message: '' })
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle')
  const [errors, setErrors] = useState<Partial<Record<keyof Values, string>>>({})

  function set(field: keyof Values, value: string) {
    setValues((p) => ({ ...p, [field]: value }))
    setErrors((p) => ({ ...p, [field]: undefined }))
  }

  function validate(): boolean {
    const next: Partial<Record<keyof Values, string>> = {}
    if (values.full_name.trim().length < 2) next.full_name = 'Ingresa tu nombre'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) next.email = 'Email inválido'
    if (values.message.trim().length < 1) next.message = 'Escribe un mensaje'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate() || status === 'submitting') return
    setStatus('submitting')
    try {
      const res = await fetch('/api/leads/contact', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          full_name: values.full_name.trim(),
          email: values.email.trim(),
          phone: values.phone.trim() || undefined,
          message: values.message.trim(),
        }),
      })
      if (!res.ok) throw new Error(`Contact submit failed: ${res.status}`)
      setStatus('success')
    } catch (error) {
      console.error('[ContactForm] submit', error)
      setStatus('idle')
      toast('No pudimos enviar tu mensaje. Intenta nuevamente.', 'error')
    }
  }

  if (status === 'success') {
    return (
      <motion.div
        variants={SLIDE_UP}
        initial="initial"
        animate="animate"
        className="rounded-wings-card border border-border-default bg-surface-card p-8 text-center"
      >
        <h3 className="font-display text-2xl font-semibold text-navy">Mensaje recibido.</h3>
        <p className="mt-2 font-body text-base text-text-muted">
          El equipo de Wings te responderá pronto.
        </p>
      </motion.div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-wings-card border border-border-default bg-surface-card p-6">
      <div className="space-y-4">
        <Field label="Nombre completo" error={errors.full_name} required>
          <Input value={values.full_name} onChange={(e) => set('full_name', e.target.value)} hasError={Boolean(errors.full_name)} autoComplete="name" />
        </Field>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Email" error={errors.email} required>
            <Input type="email" value={values.email} onChange={(e) => set('email', e.target.value)} hasError={Boolean(errors.email)} autoComplete="email" />
          </Field>
          <Field label="Teléfono">
            <Input value={values.phone} onChange={(e) => set('phone', e.target.value)} autoComplete="tel" />
          </Field>
        </div>
        <Field label="Mensaje" error={errors.message} required>
          <Textarea value={values.message} onChange={(e) => set('message', e.target.value)} hasError={Boolean(errors.message)} />
        </Field>
      </div>
      <Button type="submit" className="mt-6 w-full" isLoading={status === 'submitting'} size="lg">
        Enviar mensaje
      </Button>
    </form>
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
