// src/components/features/shared/ContactForm.tsx
'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useToast } from '@/components/ui/toast'
import { REVEAL } from '@/lib/motion'

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
        variants={REVEAL}
        initial="hidden"
        animate="visible"
        className="py-12"
      >
        <div className="wings-rule mb-8" />
        <h3 className="font-display text-display-sm font-light text-navy leading-tight">
          Mensaje recibido.
        </h3>
        <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.15em] text-navy/40">
          El equipo de Wings responderá en menos de 24 horas.
        </p>
      </motion.div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-0">
      <LineField label="Nombre completo" error={errors.full_name} required>
        <LineInput
          value={values.full_name}
          onChange={(e) => set('full_name', e.target.value)}
          hasError={Boolean(errors.full_name)}
          autoComplete="name"
          placeholder="Tu nombre"
        />
      </LineField>

      <div className="grid grid-cols-1 gap-0 sm:grid-cols-2 sm:gap-8">
        <LineField label="Email" error={errors.email} required>
          <LineInput
            type="email"
            value={values.email}
            onChange={(e) => set('email', e.target.value)}
            hasError={Boolean(errors.email)}
            autoComplete="email"
            placeholder="correo@empresa.com"
          />
        </LineField>
        <LineField label="Teléfono">
          <LineInput
            value={values.phone}
            onChange={(e) => set('phone', e.target.value)}
            autoComplete="tel"
            placeholder="+51 999 000 000"
          />
        </LineField>
      </div>

      <LineField label="Mensaje" error={errors.message} required>
        <LineTextarea
          value={values.message}
          onChange={(e) => set('message', e.target.value)}
          hasError={Boolean(errors.message)}
          placeholder="Describe brevemente tu consulta de importación…"
          rows={4}
        />
      </LineField>

      <div className="pt-10">
        <button
          type="submit"
          disabled={status === 'submitting'}
          className="inline-flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.12em] text-navy disabled:opacity-40 transition-opacity group"
        >
          {status === 'submitting' ? (
            <>
              <span className="h-3.5 w-3.5 animate-spin rounded-full border border-navy/40 border-t-navy" aria-hidden />
              Enviando…
            </>
          ) : (
            <>
              <span className="h-px w-8 bg-gold transition-all duration-300 group-hover:w-12" aria-hidden />
              Enviar mensaje
            </>
          )}
        </button>
      </div>
    </form>
  )
}

function LineField({
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
    <div className="py-6 border-b border-[rgba(0,30,80,0.08)] first:border-t first:border-t-[rgba(0,30,80,0.08)]">
      <label className="block font-mono text-[9px] uppercase tracking-[0.18em] text-navy/40 mb-3">
        {label}
        {required && <span className="text-gold/60 ml-1">*</span>}
      </label>
      {children}
      {error && (
        <p className="mt-2 font-mono text-[9px] uppercase tracking-[0.12em] text-[#DC2626]/70">{error}</p>
      )}
    </div>
  )
}

function LineInput({
  hasError,
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { hasError?: boolean }) {
  return (
    <input
      className={[
        'w-full bg-transparent font-body text-base text-navy outline-none placeholder:text-navy/25',
        'transition-colors duration-200',
        hasError ? 'placeholder:text-[#DC2626]/40' : '',
        className ?? '',
      ].join(' ')}
      {...props}
    />
  )
}

function LineTextarea({
  hasError,
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { hasError?: boolean }) {
  return (
    <textarea
      className={[
        'w-full resize-none bg-transparent font-body text-base text-navy outline-none placeholder:text-navy/25',
        'transition-colors duration-200',
        hasError ? 'placeholder:text-[#DC2626]/40' : '',
        className ?? '',
      ].join(' ')}
      {...props}
    />
  )
}
