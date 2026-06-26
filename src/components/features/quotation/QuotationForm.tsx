'use client'

// src/components/features/quotation/QuotationForm.tsx
// Structured quotation form with visual catalog category selection and
// context-aware product suggestions.

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useToast } from '@/components/ui/toast'
import { REVEAL } from '@/lib/motion'
import { CategoryIcon } from '@/components/features/homepage/CategoryIcon'

// ---------------------------------------------------------------------------
// Data — category tiles and product suggestions
// ---------------------------------------------------------------------------

const CATEGORIES = [
  { slug: 'maquinaria-agricola', label: 'Maquinaria Agrícola', iconKey: 'tractor'  },
  { slug: 'camiones',            label: 'Camiones',            iconKey: 'truck'    },
  { slug: 'buses',               label: 'Buses',               iconKey: 'bus'      },
  { slug: 'equipo-industrial',   label: 'Equipo Industrial',   iconKey: 'gear'     },
  { slug: 'repuestos',           label: 'Repuestos',           iconKey: 'parts'    },
  { slug: 'otro',                label: 'Otro / No sé',        iconKey: 'plus'     },
] as const

type CategorySlug = typeof CATEGORIES[number]['slug']

const SUGGESTIONS: Record<CategorySlug, string[]> = {
  'maquinaria-agricola': ['Tractor 4WD', 'Cosechadora de arroz', 'Sembradora', 'Pulverizadora', 'Empacadora', 'Motocultor'],
  'camiones': ['Volteo 6×4', 'Camión de carga', 'Camión cisterna', 'Tractocamión', 'Camión especial'],
  'buses': ['Bus urbano', 'Minibús', 'Bus interurbano', 'Bus escolar', 'Furgón'],
  'equipo-industrial': ['Montacargas', 'Generador', 'Compresor', 'Compactador', 'Grúa móvil'],
  'repuestos': ['Repuestos de tractor', 'Repuestos de camión', 'Filtros', 'Motor', 'Transmisión'],
  'otro': [],
}

const DESTINATION_COUNTRIES = [
  'Perú', 'Chile', 'Colombia', 'Panamá', 'Costa Rica', 'Bolivia', 'República Dominicana', 'Otro',
]

const TIMELINES = [
  { value: '0-3', label: 'Menos de 3 meses' },
  { value: '3-6', label: '3 a 6 meses' },
  { value: '6-12', label: '6 a 12 meses' },
  { value: '12+', label: 'Más de 12 meses / sin urgencia' },
]

const UNITS = ['unidades', 'contenedores', 'toneladas', 'juegos']

// ---------------------------------------------------------------------------
// Form state
// ---------------------------------------------------------------------------

interface Values {
  category: CategorySlug | ''
  product: string
  quantity: string
  unit: string
  destination: string
  timeline: string
  full_name: string
  company: string
  email: string
  phone: string
}

const EMPTY: Values = {
  category: '',
  product: '',
  quantity: '',
  unit: 'unidades',
  destination: '',
  timeline: '',
  full_name: '',
  company: '',
  email: '',
  phone: '',
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function QuotationForm() {
  const { toast } = useToast()
  const [values, setValues] = useState<Values>(EMPTY)
  const [errors, setErrors] = useState<Partial<Record<keyof Values, string>>>({})
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle')

  function set<K extends keyof Values>(field: K, value: Values[K]) {
    setValues((p) => ({ ...p, [field]: value }))
    setErrors((p) => ({ ...p, [field]: undefined }))
  }

  function selectCategory(slug: CategorySlug) {
    set('category', slug)
    set('product', '')
  }

  function selectSuggestion(text: string) {
    set('product', text)
  }

  function validate(): boolean {
    const next: Partial<Record<keyof Values, string>> = {}
    if (!values.category) next.category = 'Selecciona una categoría'
    if (values.product.trim().length < 2) next.product = 'Describe el producto'
    if (!values.destination) next.destination = 'Selecciona el destino'
    if (!values.timeline) next.timeline = 'Selecciona un plazo'
    if (values.full_name.trim().length < 2) next.full_name = 'Ingresa tu nombre'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) next.email = 'Email inválido'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate() || status === 'submitting') return
    setStatus('submitting')

    const catLabel = CATEGORIES.find((c) => c.slug === values.category)?.label ?? values.category
    const message = [
      `Categoría: ${catLabel}`,
      `Producto: ${values.product}`,
      values.quantity ? `Cantidad: ${values.quantity} ${values.unit}` : null,
      `Destino: ${values.destination}`,
      `Plazo: ${TIMELINES.find((t) => t.value === values.timeline)?.label ?? values.timeline}`,
      values.company ? `Empresa: ${values.company}` : null,
    ]
      .filter(Boolean)
      .join('\n')

    try {
      const res = await fetch('/api/leads/contact', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          full_name: values.full_name.trim(),
          email: values.email.trim(),
          phone: values.phone.trim() || undefined,
          message,
        }),
      })
      if (!res.ok) throw new Error(`Quotation submit failed: ${res.status}`)
      setStatus('success')
    } catch (error) {
      console.error('[QuotationForm] submit', error)
      setStatus('idle')
      toast('No pudimos enviar tu solicitud. Intenta nuevamente.', 'error')
    }
  }

  if (status === 'success') {
    return (
      <motion.div variants={REVEAL} initial="hidden" animate="visible" className="py-16">
        <div className="wings-rule mb-8" />
        <h3 className="font-display text-display-sm font-light text-navy">
          Cotización recibida.
        </h3>
        <p className="mt-4 max-w-md font-mono text-[10px] uppercase tracking-[0.15em] text-navy/40">
          El equipo de Wings revisará tu solicitud y responderá en menos de 24 horas hábiles.
        </p>
      </motion.div>
    )
  }

  const activeSuggestions = values.category ? SUGGESTIONS[values.category] : []

  return (
    <form onSubmit={handleSubmit} noValidate>

      {/* ── Section A: Categoría ─────────────────────────────────────────── */}
      <FormSection num="01" title="¿Qué necesitas importar?">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {CATEGORIES.map((c) => {
            const active = values.category === c.slug
            return (
              <button
                key={c.slug}
                type="button"
                onClick={() => selectCategory(c.slug)}
                className={cn(
                  'flex flex-col items-start gap-2 border p-4 text-left transition-all duration-150',
                  active
                    ? 'border-gold bg-gold/5 text-navy'
                    : 'border-[rgba(0,30,80,0.10)] text-navy/60 hover:border-gold/30 hover:text-navy',
                )}
              >
                <CategoryIcon iconKey={c.iconKey} className="h-5 w-5 shrink-0" />
                <span className="font-mono text-[10px] uppercase leading-tight tracking-[0.10em]">
                  {c.label}
                </span>
                {active && (
                  <span className="block h-px w-4 bg-gold" aria-hidden />
                )}
              </button>
            )
          })}
        </div>
        {errors.category && (
          <p className="mt-2 font-mono text-[9px] uppercase tracking-[0.12em] text-[#DC2626]/70">
            {errors.category}
          </p>
        )}

        {/* Suggestions */}
        <AnimatePresence>
          {activeSuggestions.length > 0 && (
            <motion.div
              key={values.category}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="mt-6"
            >
              <p className="mb-3 font-mono text-[9px] uppercase tracking-[0.15em] text-navy/35">
                Selección rápida
              </p>
              <div className="flex flex-wrap gap-2">
                {activeSuggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => selectSuggestion(s)}
                    className={cn(
                      'border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.08em] transition-all duration-150',
                      values.product === s
                        ? 'border-gold bg-gold/5 text-navy'
                        : 'border-[rgba(0,30,80,0.10)] text-navy/50 hover:border-gold/30 hover:text-navy',
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Free-text description */}
        <div className="mt-6">
          <LineField label="Descripción del producto" error={errors.product} required>
            <LineInput
              value={values.product}
              onChange={(e) => set('product', e.target.value)}
              hasError={Boolean(errors.product)}
              placeholder={
                values.category === 'maquinaria-agricola'
                  ? 'Ej: Tractor 4WD 100 HP con cabina'
                  : values.category === 'camiones'
                  ? 'Ej: Volteo 6×4 de 20 toneladas'
                  : 'Describe el producto que deseas importar'
              }
            />
          </LineField>
        </div>
      </FormSection>

      {/* ── Section B: Detalles ──────────────────────────────────────────── */}
      <FormSection num="02" title="Detalles técnicos">
        <div className="grid grid-cols-1 gap-0 sm:grid-cols-2 sm:gap-8">
          <LineField label="Cantidad aproximada">
            <div className="flex gap-3">
              <LineInput
                type="number"
                min="1"
                value={values.quantity}
                onChange={(e) => set('quantity', e.target.value)}
                placeholder="1"
                className="w-20 shrink-0"
              />
              <select
                value={values.unit}
                onChange={(e) => set('unit', e.target.value)}
                className="flex-1 min-w-0 bg-transparent font-mono text-[12px] uppercase tracking-[0.08em] text-navy/70 outline-none"
              >
                {UNITS.map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
          </LineField>

          <LineField label="País de destino" error={errors.destination} required>
            <select
              value={values.destination}
              onChange={(e) => set('destination', e.target.value)}
              className={cn(
                'w-full bg-transparent font-body text-base text-navy outline-none',
                !values.destination && 'text-navy/25',
              )}
            >
              <option value="" disabled>Seleccionar país</option>
              {DESTINATION_COUNTRIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </LineField>
        </div>

        <LineField label="Plazo estimado" error={errors.timeline} required>
          <div className="flex flex-wrap gap-2 pt-1">
            {TIMELINES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => set('timeline', t.value)}
                className={cn(
                  'border px-4 py-2 font-mono text-[10px] uppercase tracking-[0.08em] transition-all duration-150',
                  values.timeline === t.value
                    ? 'border-gold bg-gold/5 text-navy'
                    : 'border-[rgba(0,30,80,0.10)] text-navy/50 hover:border-gold/30 hover:text-navy',
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </LineField>
      </FormSection>

      {/* ── Section C: Contacto ──────────────────────────────────────────── */}
      <FormSection num="03" title="Tu información">
        <div className="grid grid-cols-1 gap-0 sm:grid-cols-2 sm:gap-8">
          <LineField label="Nombre completo" error={errors.full_name} required>
            <LineInput
              value={values.full_name}
              onChange={(e) => set('full_name', e.target.value)}
              hasError={Boolean(errors.full_name)}
              autoComplete="name"
              placeholder="Tu nombre"
            />
          </LineField>
          <LineField label="Empresa">
            <LineInput
              value={values.company}
              onChange={(e) => set('company', e.target.value)}
              autoComplete="organization"
              placeholder="Nombre de tu empresa"
            />
          </LineField>
        </div>
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
          <LineField label="Teléfono / WhatsApp">
            <LineInput
              value={values.phone}
              onChange={(e) => set('phone', e.target.value)}
              autoComplete="tel"
              placeholder="+51 999 000 000"
            />
          </LineField>
        </div>
      </FormSection>

      {/* Submit */}
      <div className="pt-10">
        <button
          type="submit"
          disabled={status === 'submitting'}
          className="inline-flex items-center gap-3 bg-gold px-10 py-4 font-mono text-[11px] uppercase tracking-[0.12em] text-navy transition-colors duration-200 hover:bg-gold-hover disabled:opacity-40"
        >
          {status === 'submitting' ? (
            <>
              <span className="h-3.5 w-3.5 animate-spin rounded-full border border-navy/40 border-t-navy" aria-hidden />
              Enviando…
            </>
          ) : (
            <>
              <span className="h-px w-6 bg-current" aria-hidden />
              Solicitar cotización
            </>
          )}
        </button>
        <p className="mt-4 font-mono text-[9px] uppercase tracking-[0.12em] text-navy/30">
          Respuesta en menos de 24 horas hábiles. Sin compromiso.
        </p>
      </div>
    </form>
  )
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function FormSection({ num, title, children }: { num: string; title: string; children: React.ReactNode }) {
  return (
    <div className="mb-12 border-t border-[rgba(0,30,80,0.08)] pt-10 first:border-t-0 first:pt-0">
      <div className="mb-8 flex items-baseline gap-4">
        <span className="font-mono text-[9px] tracking-[0.18em] text-gold/40">{num}</span>
        <h2 className="font-display text-xl font-light text-navy">{title}</h2>
      </div>
      {children}
    </div>
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
    <div className="border-b border-[rgba(0,30,80,0.08)] py-5 first:border-t first:border-t-[rgba(0,30,80,0.08)]">
      <label className="mb-3 block font-mono text-[11px] uppercase tracking-[0.14em] text-navy/55">
        {label}
        {required && <span className="ml-1 text-gold/70">*</span>}
      </label>
      {children}
      {error && (
        <p className="mt-2 font-mono text-[11px] tracking-[0.08em] text-[#DC2626]">{error}</p>
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
      className={cn(
        'w-full bg-transparent font-body text-base text-navy outline-none placeholder:text-navy/25 transition-colors duration-200',
        hasError && 'placeholder:text-[#DC2626]/40',
        className,
      )}
      {...props}
    />
  )
}
