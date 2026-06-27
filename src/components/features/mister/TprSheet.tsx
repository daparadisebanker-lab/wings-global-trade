// src/components/features/mister/TprSheet.tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence, useAnimationControls } from 'framer-motion'
import type { TprState, TprFieldKey, CifEstimate } from '@/types/mister'
import type { TprCompleteness } from '@/types/database'
import { formatCurrency } from '@/lib/utils'
import { TprField } from '@/components/features/mister/TprField'
import { CifEstimateCard } from '@/components/features/mister/CifEstimateCard'
import { CifBreakdownChart } from '@/components/features/mister/CifBreakdownChart'
import { Button } from '@/components/ui/button'

interface TprSheetProps {
  tprState: TprState
  completeness: TprCompleteness
  estimate: CifEstimate | null
  estimateLoading: boolean
  onEditField: (field: TprFieldKey) => void
  onGenerateEstimate: () => void
  onSubmit: () => void
  sessionId: string
  sheetStatus: 'active' | 'sent'
  sentTimestamp: string | null
  submitted: boolean
}

const FIELD_LABELS: Record<TprFieldKey, string> = {
  product_description: 'Descripción del producto',
  hs_code: 'Código HS',
  quantity: 'Cantidad',
  target_price_usd: 'Precio objetivo (USD)',
  destination_country: 'País de destino',
  destination_port: 'Puerto de destino',
  certifications: 'Certificaciones',
  tech_specs: 'Especificaciones técnicas',
  packaging_requirements: 'Empaque y etiquetado',
  delivery_timeline: 'Plazo de entrega',
}

const REQUIRED_FIELDS: TprFieldKey[] = [
  'product_description',
  'quantity',
  'target_price_usd',
  'destination_country',
]

const GROUPS: { title: string; fields: TprFieldKey[] }[] = [
  {
    title: 'Información básica',
    fields: ['product_description', 'hs_code', 'quantity', 'destination_country'],
  },
  {
    title: 'Términos comerciales',
    fields: ['target_price_usd', 'destination_port', 'delivery_timeline'],
  },
  {
    title: 'Especificaciones',
    fields: ['tech_specs', 'packaging_requirements', 'certifications'],
  },
]

function formatValue(field: TprFieldKey, value: unknown): string {
  if (value == null) return ''
  if (field === 'target_price_usd' && typeof value === 'number') return formatCurrency(value)
  if (field === 'certifications' && Array.isArray(value)) return value.join(', ')
  if (field === 'tech_specs' && typeof value === 'object') {
    return Object.entries(value as Record<string, string>)
      .map(([k, v]) => `${k}: ${v}`)
      .join(' · ')
  }
  return String(value)
}

function isCaptured(field: TprFieldKey, tprState: TprState): boolean {
  const raw = tprState[field]
  if (raw == null) return false
  if (Array.isArray(raw)) return raw.length > 0
  if (typeof raw === 'object') return Object.keys(raw).length > 0
  return String(raw).length > 0
}

function countCaptured(tprState: TprState): number {
  return (Object.keys(FIELD_LABELS) as TprFieldKey[]).filter((f) => isCaptured(f, tprState)).length
}

export function TprSheet({
  tprState,
  completeness,
  estimate,
  estimateLoading,
  onEditField,
  onGenerateEstimate,
  onSubmit,
  sessionId,
  sheetStatus,
  sentTimestamp,
  submitted,
}: TprSheetProps) {
  const canSubmit = completeness === 'minimum' || completeness === 'complete'
  const capturedCount = countCaptured(tprState)
  const totalFields = Object.keys(FIELD_LABELS).length
  const missingRequired = REQUIRED_FIELDS.filter((f) => !isCaptured(f, tprState))
  const watermarkState = canSubmit ? 'confirmed' : 'draft'
  const progressPct = Math.round((capturedCount / totalFields) * 100)

  // Watermark transition — opacity dip, text swap, fade back
  const watermarkControls = useAnimationControls()
  const [watermarkText, setWatermarkText] = useState('BORRADOR — WINGS GLOBAL TRADE')
  const [watermarkGold, setWatermarkGold] = useState(false)
  const isFirstRender = useRef(true)
  const isMountedRef = useRef(true)
  const runIdRef = useRef(0)

  useEffect(() => {
    return () => { isMountedRef.current = false }
  }, [])

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    const myId = ++runIdRef.current
    const isStale = () => !isMountedRef.current || runIdRef.current !== myId
    const run = async () => {
      watermarkControls.stop()
      await watermarkControls.start({ opacity: 0, transition: { duration: 0.2 } })
      if (isStale()) return
      setWatermarkText(watermarkState === 'confirmed' ? 'CONFIRMADO' : 'BORRADOR — WINGS GLOBAL TRADE')
      setWatermarkGold(watermarkState === 'confirmed')
      await watermarkControls.start({ opacity: 0.03, transition: { duration: 0.2 } })
    }
    void run()
  }, [watermarkState, watermarkControls])

  // Perforated edge glow on submit
  const edgeControls = useAnimationControls()
  const submittedRef = useRef(false)
  useEffect(() => {
    if (submitted && !submittedRef.current) {
      submittedRef.current = true
      void edgeControls.start({
        boxShadow: ['0 2px 0 rgba(196,147,63,0)', '0 2px 12px rgba(196,147,63,0.3)', '0 2px 0 rgba(196,147,63,0)'],
        transition: { duration: 0.6, ease: 'easeOut' },
      })
    }
  }, [submitted, edgeControls])

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-navy-900">
      {/* Perforated top edge */}
      <motion.div
        animate={edgeControls}
        style={{
          height: 3,
          backgroundImage:
            'repeating-linear-gradient(90deg, transparent, transparent 6px, rgba(196,147,63,0.125) 6px, rgba(196,147,63,0.125) 8px)',
        }}
        aria-hidden
      />

      {/* Watermark */}
      <motion.p
        animate={watermarkControls}
        initial={{ opacity: 0.03 }}
        className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center select-none font-display text-4xl"
        style={{
          transform: 'rotate(45deg)',
          color: watermarkGold ? '#C4933F' : '#F8F6F0',
          textAlign: 'center',
          lineHeight: 1.2,
        }}
        aria-hidden
      >
        {watermarkText}
      </motion.p>

      {/* Progress bar */}
      <div className="relative h-px w-full bg-[#F8F6F0]/[0.06]" aria-hidden>
        <motion.div
          className="absolute inset-y-0 left-0 bg-gold"
          animate={{ width: `${progressPct}%` }}
          transition={{ duration: 0.6, ease: [0, 0, 0.2, 1] }}
        />
      </div>

      {/* Sheet header */}
      <div className="relative z-10 flex items-start justify-between border-b border-[#C4933F]/15 px-5 py-4">
        <div>
          <motion.p
            className="font-mono text-[10px] tracking-widest uppercase"
            animate={{ color: sheetStatus === 'sent' ? '#C4933F' : 'rgba(196,147,63,0.6)' }}
            transition={{ duration: 0.4 }}
          >
            {sheetStatus === 'sent' ? 'CONSULTA ENVIADA' : 'TPR EN PROGRESO'}
          </motion.p>
          <span className="mt-1 block font-mono text-sm text-[#F8F6F0]/50">
            {capturedCount} / {totalFields} campos
          </span>
        </div>
        <span className="font-mono text-[9px] text-[#F8F6F0]/40 pt-0.5">{sessionId}</span>
      </div>

      {/* Fields */}
      <div className="no-scrollbar relative z-10 flex-1 overflow-y-auto px-5 py-4">
        {GROUPS.map((group) => (
          <div key={group.title} className="mb-5">
            <p className="mb-2 font-mono text-[10px] tracking-widest uppercase text-[#F8F6F0]/25">
              {group.title}
            </p>
            <div>
              {group.fields.map((field) => {
                const raw = tprState[field]
                const captured = isCaptured(field, tprState)
                return (
                  <TprField
                    key={field}
                    label={FIELD_LABELS[field]}
                    value={captured ? formatValue(field, raw) : undefined}
                    status={captured ? 'captured' : 'pending'}
                    onEdit={captured ? () => onEditField(field) : undefined}
                  />
                )
              })}
            </div>
          </div>
        ))}

        {estimate && !estimateLoading && (
          <CifBreakdownChart
            fob={estimate.fob_estimate_usd}
            freight={estimate.freight_estimate_usd}
            insurance={estimate.insurance_estimate_usd}
            duty={estimate.duty_amount_usd}
            total={estimate.cif_total_usd}
          />
        )}

        {estimate && (
          <div className="mb-4">
            <CifEstimateCard estimate={estimate} />
          </div>
        )}

        <AnimatePresence>
          {!estimate && canSubmit && (
            <motion.div
              key="cif-btn"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              transition={{ duration: 0.4, ease: [0, 0, 0.2, 1] }}
            >
              <Button type="button" className="w-full" onClick={onGenerateEstimate} isLoading={estimateLoading}>
                Ver mi estimado CIF
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Beat 4: sent timestamp */}
        <AnimatePresence>
          {sentTimestamp && (
            <motion.p
              key="sent-ts"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="mt-4 font-mono text-[9px] text-[#F8F6F0]/40"
            >
              Enviado — {sentTimestamp}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      {sheetStatus === 'active' && (
        <div className="relative z-10 border-t border-[#C4933F]/15 p-4">
          <Button type="button" className="w-full" disabled={!canSubmit} onClick={onSubmit}>
            Enviar consulta técnica
          </Button>
          {!canSubmit && missingRequired.length > 0 && (
            <div className="mt-2">
              <p className="font-mono text-[10px] text-[#F8F6F0]/40">Faltan los siguientes campos:</p>
              <ul className="mt-1 space-y-0.5">
                {missingRequired.map((f) => (
                  <li key={f} className="font-mono text-[10px] text-[#DC2626]/70">
                    · {FIELD_LABELS[f]}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {canSubmit && (
            <p className="mt-2 text-center font-mono text-[10px] text-[#F8F6F0]/30">
              Consulta sin compromiso. Sin cuenta requerida.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
