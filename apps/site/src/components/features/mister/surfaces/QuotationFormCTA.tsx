// src/components/features/mister/surfaces/QuotationFormCTA.tsx
// The conversion moment. Designed as a document action, not a marketing button.
// Pre-fill summary strip + full-width gold button.
// designer.md §4, copywriter.md A1/A2/A3/A4/A5 pre-qual CTAs.
'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useMister } from '@/components/features/mister/MisterProvider'
import { HAPTIC } from '@/lib/mister/haptics'
import type { MisterLeadSubmitRequest } from '@/types/mister'
import { surfaceCardVariants } from '@/lib/mister/motion'
import { useReducedMotion } from '@/hooks/useReducedMotion'

interface Props {
  /** Pre-filled summary fields to display */
  summaryFields?: Record<string, string>
}

export function QuotationFormCTA({ summaryFields }: Props) {
  const reduced = useReducedMotion()
  const { sessionId } = useMister()

  const [name, setName] = useState('')
  const [company, setCompany] = useState('')
  const [country, setCountry] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const isValid = name.trim().length > 0 && email.trim().length > 0 && phone.trim().length > 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid || status === 'submitting') return

    setStatus('submitting')
    setErrorMsg('')

    const body: MisterLeadSubmitRequest = {
      sessionId,
      full_name: name.trim(),
      ...(company.trim() && { company: company.trim() }),
      email: email.trim(),
      phone: phone.trim(),
    }

    try {
      const res = await fetch('/api/mister/submit', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const data = (await res.json()) as { error?: string }
        throw new Error(data.error ?? `Error ${res.status}`)
      }

      HAPTIC.formSubmit()
      setStatus('success')
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Error al enviar. Intente nuevamente.',
      )
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <motion.div
        variants={surfaceCardVariants}
        initial="hidden"
        animate={reduced ? 'visibleReduced' : 'visible'}
        className="rounded-none border border-[var(--mister-border-surface)] bg-[var(--mister-bg-inset)] px-5 py-4 mister-shadow-surface"
      >
        <p className="font-body text-[14px] font-[400] text-[var(--mister-text-primary)]">
          Consulta registrada bajo la referencia {sessionId}.
        </p>
        <p className="mt-1 font-body text-[12px] font-[300] text-[var(--mister-text-secondary)]">
          El equipo Wings responderá en menos de 24h con un análisis preliminar.
        </p>
      </motion.div>
    )
  }

  const hasSummary = summaryFields && Object.keys(summaryFields).length > 0

  return (
    <motion.div
      variants={surfaceCardVariants}
      initial="hidden"
      animate={reduced ? 'visibleReduced' : 'visible'}
      className="rounded-none border border-[var(--mister-border-surface)] bg-[var(--mister-bg-inset)] mister-shadow-surface"
    >
      {/* Pre-fill summary strip */}
      {hasSummary && (
        <div className="flex min-h-[36px] flex-wrap items-center gap-x-4 gap-y-1 border-b border-[var(--mister-border-row)] bg-[rgba(248,246,240,0.04)] px-5 py-2">
          {Object.entries(summaryFields).map(([k, v]) => (
            <span key={k} className="font-mono text-[11px] font-[400] text-[var(--mister-text-secondary)]">
              <span className="text-[9px] uppercase tracking-[0.08em] text-[var(--mister-text-ghost)]">
                {k}:{' '}
              </span>
              {v}
            </span>
          ))}
        </div>
      )}

      {/* Form */}
      <form onSubmit={(e) => { void handleSubmit(e) }} className="px-5 pb-5 pt-4">
        <div className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Nombre completo"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full border-b border-[var(--mister-border-input)] bg-transparent pb-2 font-body text-[16px] text-[var(--mister-text-primary)] placeholder-[var(--mister-text-muted)] outline-none focus:border-[var(--mister-gold)] md:text-[14px]"
          />
          <input
            type="text"
            placeholder="Empresa (opcional)"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="w-full border-b border-[var(--mister-border-input)] bg-transparent pb-2 font-body text-[16px] text-[var(--mister-text-primary)] placeholder-[var(--mister-text-muted)] outline-none focus:border-[var(--mister-gold)] md:text-[14px]"
          />
          <input
            type="text"
            placeholder="País"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="w-full border-b border-[var(--mister-border-input)] bg-transparent pb-2 font-body text-[16px] text-[var(--mister-text-primary)] placeholder-[var(--mister-text-muted)] outline-none focus:border-[var(--mister-gold)] md:text-[14px]"
          />
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border-b border-[var(--mister-border-input)] bg-transparent pb-2 font-body text-[16px] text-[var(--mister-text-primary)] placeholder-[var(--mister-text-muted)] outline-none focus:border-[var(--mister-gold)] md:text-[14px]"
          />
          <input
            type="tel"
            placeholder="Teléfono / WhatsApp"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            className="w-full border-b border-[var(--mister-border-input)] bg-transparent pb-2 font-body text-[16px] text-[var(--mister-text-primary)] placeholder-[var(--mister-text-muted)] outline-none focus:border-[var(--mister-gold)] md:text-[14px]"
          />
        </div>

        {errorMsg && (
          <p className="mt-2 font-body text-[12px] text-red-400">{errorMsg}</p>
        )}

        {/* Gold CTA button */}
        <button
          type="submit"
          disabled={!isValid || status === 'submitting'}
          className="mt-4 h-11 w-full rounded-[2px] bg-[#C4933F] font-body text-[13px] font-[600] text-[#001E50] transition-colors duration-[150ms] hover:bg-[#D4A84F] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {status === 'submitting' ? 'Enviando…' : 'Enviar solicitud →'}
        </button>

        <p className="mt-2 text-center font-body text-[10px] font-[300] text-[var(--mister-text-muted)]">
          La cotización se envía directamente al equipo Wings · Respuesta &lt; 24h
        </p>
      </form>
    </motion.div>
  )
}
