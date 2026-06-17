// src/components/features/catalog/InquirySuccess.tsx
'use client'

import { motion } from 'framer-motion'
import { SLIDE_UP } from '@/lib/motion'
import { WhatsAppButton } from '@/components/features/shared/WhatsAppButton'

interface InquirySuccessProps {
  productName: string
}

export function InquirySuccess({ productName }: InquirySuccessProps) {
  return (
    <motion.div
      variants={SLIDE_UP}
      initial="initial"
      animate="animate"
      className="rounded-wings-card border border-border-default bg-surface-card p-8 text-center"
    >
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gold/[0.12]">
        <svg viewBox="0 0 24 24" className="h-6 w-6 text-gold" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      {/* Per ENRICHED_SPEC §3.6 — exact catalog confirm copy */}
      <h3 className="font-display text-2xl font-semibold text-navy">Solicitud enviada.</h3>
      <p className="mt-2 font-body text-base text-text-muted">
        El equipo Wings te contactará en menos de 24 horas.
      </p>
      <p className="mt-1 font-body text-sm text-text-muted">
        Tu consulta sobre <span className="font-medium text-navy">{productName}</span> fue registrada.
        Si tu requerimiento es urgente, escríbenos directamente.
      </p>
      <div className="mt-6 flex justify-center">
        <WhatsAppButton
          message={`Hola, acabo de enviar una consulta por ${productName} en el catálogo de Wings.`}
          label="Consultar por WhatsApp"
        />
      </div>
    </motion.div>
  )
}
