// src/components/features/accio/TprSheet.tsx
'use client'

import type { TprState, TprFieldKey, CifEstimate } from '@/types/accio'
import type { TprCompleteness } from '@/types/database'
import { formatCurrency } from '@/lib/utils'
import { TprField } from '@/components/features/accio/TprField'
import { CifEstimateCard } from '@/components/features/accio/CifEstimateCard'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'
import { FADE_UP_SLOW } from '@/lib/motion'

interface TprSheetProps {
  tprState: TprState
  completeness: TprCompleteness
  estimate: CifEstimate | null
  estimateLoading: boolean
  onEditField: (field: TprFieldKey) => void
  onGenerateEstimate: () => void
  onSubmit: () => void
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

// Required fields to reach "minimum" completeness — per ai-engineer.md §REGLAS DE COMPLETENESS
const REQUIRED_FIELDS: TprFieldKey[] = [
  'product_description',
  'quantity',
  'target_price_usd',
  'destination_country',
]

const GROUPS: { title: string; fields: TprFieldKey[] }[] = [
  { title: 'Información básica', fields: ['product_description', 'hs_code', 'quantity', 'destination_country'] },
  { title: 'Términos comerciales', fields: ['target_price_usd', 'destination_port', 'delivery_timeline'] },
  { title: 'Especificaciones', fields: ['tech_specs', 'packaging_requirements', 'certifications'] },
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

/** Count captured fields across all 10 TPR fields. */
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
}: TprSheetProps) {
  const canSubmit = completeness === 'minimum' || completeness === 'complete'
  const capturedCount = countCaptured(tprState)
  const totalFields = Object.keys(FIELD_LABELS).length // 10

  // Missing required fields for submit disabled state — per ENRICHED_SPEC §4.4
  const missingRequired = REQUIRED_FIELDS.filter((f) => !isCaptured(f, tprState))

  // Header state labels — per game-designer.md §1 + ENRICHED_SPEC §4.5
  const headerLabel =
    completeness === 'complete' || completeness === 'standard'
      ? 'Requisito completo'
      : completeness === 'minimum'
        ? 'Listo para estimar'
        : 'Requisito técnico'

  const headerGold = completeness === 'minimum' || completeness === 'complete' || completeness === 'standard'

  // TPR progress percentage — drives the animated bar.
  const progressPct = Math.round((capturedCount / totalFields) * 100)

  // Sheet border turns gold at complete — per game-designer.md §State3
  const sheetGoldBorder = completeness === 'complete'

  return (
    <div
      className={`flex h-full flex-col bg-warm-white ${sheetGoldBorder ? 'ring-1 ring-gold' : ''}`}
    >
      {/* 2px gold progress track — Framer Motion animated width — per ENRICHED_SPEC §2.6 */}
      <div className="relative h-0.5 w-full bg-border-default" aria-hidden>
        <motion.div
          className="absolute inset-y-0 left-0 bg-gold"
          animate={{ width: `${progressPct}%` }}
          transition={{ duration: 0.6, ease: [0.0, 0.0, 0.2, 1.0] }}
        />
      </div>

      <div className="border-b border-border-default px-6 py-5">
        {/* Field count in DM Mono — per game-designer.md §1 */}
        <p className={`font-mono text-xs uppercase tracking-widest-2 ${headerGold ? 'text-gold' : 'text-text-muted'}`}>
          {headerLabel}
        </p>
        <div className="mt-1 flex items-center justify-between">
          <span className="font-mono text-sm text-text-muted">
            {capturedCount} / {totalFields} campos
          </span>
          <span
            className="h-2 w-2 rounded-full"
            style={{
              backgroundColor:
                completeness === 'complete'
                  ? '#16A34A'
                  : completeness === 'minimum'
                    ? '#C4933F'
                    : '#D1D5DB',
            }}
          />
        </div>
      </div>

      <div className="no-scrollbar flex-1 overflow-y-auto px-6 py-4">
        {GROUPS.map((group) => (
          <div key={group.title} className="mb-6">
            <p className="mb-2 border-b border-border-default pb-2 font-body text-xs font-medium uppercase tracking-widest-2 text-text-muted">
              {group.title}
            </p>
            <div className="divide-y divide-border-default/60">
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

        {/* CIF estimate card */}
        {estimate && (
          <div className="mb-4">
            <CifEstimateCard estimate={estimate} />
          </div>
        )}

        {/* "Ver mi estimado CIF" button — appears at minimum, animated in per ENRICHED_SPEC §4.2 */}
        <AnimatePresence>
          {!estimate && canSubmit && (
            <motion.div
              key="cif-btn"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              transition={{ duration: 0.4, ease: [0.0, 0.0, 0.2, 1.0] }}
            >
              <Button
                type="button"
                className="w-full"
                onClick={onGenerateEstimate}
                isLoading={estimateLoading}
              >
                Ver mi estimado CIF
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="border-t border-border-default p-4">
        {/* Per ENRICHED_SPEC §3.4 — exact submit CTA string */}
        <Button type="button" className="w-full" disabled={!canSubmit} onClick={onSubmit}>
          Enviar consulta técnica
        </Button>
        {/* Disabled state must list missing fields — per ENRICHED_SPEC §4.4 + game-designer §Risk5 */}
        {!canSubmit && missingRequired.length > 0 && (
          <div className="mt-2">
            <p className="font-body text-xs text-text-muted">Faltan los siguientes campos:</p>
            <ul className="mt-1 space-y-0.5">
              {missingRequired.map((f) => (
                <li key={f} className="font-mono text-xs text-[#DC2626]">
                  · {FIELD_LABELS[f]}
                </li>
              ))}
            </ul>
          </div>
        )}
        {/* Trust signal above submit per ENRICHED_SPEC §4.3 */}
        {canSubmit && (
          <p className="mt-2 text-center font-body text-xs text-text-muted">
            Consulta sin compromiso. Sin cuenta requerida.
          </p>
        )}
      </div>
    </div>
  )
}
