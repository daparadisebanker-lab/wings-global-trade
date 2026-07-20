'use client'

// Document-details editor — the operator-facing panel that fills the parts of
// the official quotation the pricing engine doesn't own: the bill-to block
// (incl. RUC), the tax rate/label, the commercial conditions, and the
// observations. Reads the current document via getQuotationDocument, writes via
// saveQuotationDetails (server recomputes the tax split). Lives in the dark
// composer, so it wears TOWER's control-room tokens — never the document's light
// styling.
import { useEffect, useState, useTransition } from 'react'
import { getQuotationDocument, saveQuotationDetails } from '@/lib/actions/quotation'
import type { QuotationDocument } from '@/lib/quotation/document'

interface FormState {
  company: string
  taxId: string
  attention: string
  contact: string
  taxLabel: string
  taxPct: string
  paymentTerms: string
  deliveryTime: string
  incoterm: string
  warranty: string
  validityText: string
  observations: string
}

function formFromDoc(doc: QuotationDocument): FormState {
  return {
    company: doc.billTo.company ?? '',
    taxId: doc.billTo.taxId ?? '',
    attention: doc.billTo.attention ?? '',
    contact: doc.billTo.contact ?? '',
    taxLabel: doc.totals.taxLabel ?? '',
    taxPct: (doc.totals.taxBps / 100).toString(),
    paymentTerms: doc.terms.paymentTerms ?? '',
    deliveryTime: doc.terms.deliveryTime ?? '',
    incoterm: doc.terms.incoterm ?? '',
    warranty: doc.terms.warranty ?? '',
    validityText: doc.terms.validityText ?? '',
    observations: doc.observations.join('\n'),
  }
}

const LABEL_CLS = 'font-mono text-label uppercase tracking-[0.08em] text-ink-secondary'
const INPUT_CLS =
  'rounded-card border border-line bg-surface-0 px-2 py-1.5 font-ui text-t0 text-ink-primary outline-none focus-visible:border-lane-accent'

function Field({
  label,
  value,
  onChange,
  placeholder,
  className = '',
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  className?: string
}) {
  return (
    <label className={`flex flex-col gap-1 ${className}`}>
      <span className={LABEL_CLS}>{label}</span>
      <input
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={INPUT_CLS}
      />
    </label>
  )
}

export function QuotationDetailsEditor({
  quoteId,
  onSaved,
}: {
  quoteId: string
  onSaved?: (doc: QuotationDocument) => void
}) {
  const [form, setForm] = useState<FormState | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    let active = true
    startTransition(async () => {
      const result = await getQuotationDocument(quoteId)
      if (!active) return
      if (result.error) {
        setError(result.error.message)
        return
      }
      setForm(formFromDoc(result.data))
    })
    return () => {
      active = false
    }
  }, [quoteId])

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => (f ? { ...f, [key]: value } : f))
    setSaved(false)
  }

  function handleSave() {
    if (!form) return
    setError(null)
    const pct = Number(form.taxPct)
    if (Number.isNaN(pct) || pct < 0 || pct > 100) {
      setError('Impuesto inválido (0–100%) / Invalid tax (0–100%)')
      return
    }
    startTransition(async () => {
      const result = await saveQuotationDetails(quoteId, {
        billTo: {
          company: form.company.trim(),
          taxId: form.taxId.trim() || null,
          attention: form.attention.trim() || null,
          contact: form.contact.trim() || null,
        },
        taxLabel: form.taxLabel.trim() || undefined,
        taxBps: Math.round(pct * 100),
        terms: {
          paymentTerms: form.paymentTerms.trim() || null,
          deliveryTime: form.deliveryTime.trim() || null,
          incoterm: form.incoterm.trim() || null,
          warranty: form.warranty.trim() || null,
          validityText: form.validityText.trim() || null,
        },
        observations: form.observations
          .split('\n')
          .map((l) => l.trim())
          .filter(Boolean),
      })
      if (result.error) {
        setError(result.error.message)
        return
      }
      setForm(formFromDoc(result.data))
      setSaved(true)
      onSaved?.(result.data)
    })
  }

  if (!form) {
    return (
      <div className="rounded-card border border-line bg-surface-1 p-4">
        <p className="font-ui text-t0 text-ink-secondary">
          {error ?? 'Cargando detalles / Loading details…'}
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 rounded-card border border-line bg-surface-1 p-4">
      {/* Bill-to */}
      <div className="flex flex-col gap-2">
        <h4 className="font-mono text-label uppercase tracking-[0.1em] text-ink-secondary">
          Señores / Bill-to
        </h4>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <Field label="Empresa / Company" value={form.company} onChange={(v) => set('company', v)} />
          <Field label="RUC" value={form.taxId} onChange={(v) => set('taxId', v)} placeholder="20455678900" />
          <Field
            label="Atención / Attention"
            value={form.attention}
            onChange={(v) => set('attention', v)}
          />
          <Field label="Contacto / Contact" value={form.contact} onChange={(v) => set('contact', v)} />
        </div>
      </div>

      {/* Tax */}
      <div className="flex flex-col gap-2">
        <h4 className="font-mono text-label uppercase tracking-[0.1em] text-ink-secondary">
          Impuesto / Tax
        </h4>
        <div className="flex flex-wrap items-end gap-2">
          <Field
            label="Etiqueta / Label"
            value={form.taxLabel}
            onChange={(v) => set('taxLabel', v)}
            placeholder="IGV 18%"
            className="w-40"
          />
          <label className="flex flex-col gap-1">
            <span className={LABEL_CLS}>Tasa % / Rate</span>
            <input
              type="number"
              min={0}
              max={100}
              step="0.01"
              value={form.taxPct}
              onChange={(e) => set('taxPct', e.target.value)}
              data-numeric
              className={`w-24 ${INPUT_CLS} font-mono`}
            />
          </label>
        </div>
      </div>

      {/* Commercial conditions */}
      <div className="flex flex-col gap-2">
        <h4 className="font-mono text-label uppercase tracking-[0.1em] text-ink-secondary">
          Condiciones comerciales
        </h4>
        <div className="grid grid-cols-1 gap-2">
          <Field
            label="Formas de pago"
            value={form.paymentTerms}
            onChange={(v) => set('paymentTerms', v)}
          />
          <Field
            label="Tiempos de entrega"
            value={form.deliveryTime}
            onChange={(v) => set('deliveryTime', v)}
          />
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <Field label="Incoterm" value={form.incoterm} onChange={(v) => set('incoterm', v)} />
            <Field label="Garantía" value={form.warranty} onChange={(v) => set('warranty', v)} />
          </div>
          <Field
            label="Validez de la cotización"
            value={form.validityText}
            onChange={(v) => set('validityText', v)}
          />
        </div>
      </div>

      {/* Observations */}
      <label className="flex flex-col gap-1">
        <span className={LABEL_CLS}>Observaciones (una por línea)</span>
        <textarea
          rows={3}
          value={form.observations}
          onChange={(e) => set('observations', e.target.value)}
          className={`${INPUT_CLS} resize-y`}
        />
      </label>

      {error ? (
        <p role="alert" className="font-ui text-t0 text-negative">
          {error}
        </p>
      ) : null}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          className="w-fit rounded-card bg-accent px-4 py-2 font-mono text-label uppercase tracking-[0.1em] text-surface-0 disabled:opacity-40"
        >
          Guardar detalles / Save details
        </button>
        {saved ? (
          <span className="font-mono text-label uppercase tracking-[0.08em] text-positive">
            Guardado / Saved
          </span>
        ) : null}
      </div>
    </div>
  )
}
