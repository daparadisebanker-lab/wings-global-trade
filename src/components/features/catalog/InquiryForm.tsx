// src/components/features/catalog/InquiryForm.tsx
'use client'

import type { Product } from '@/types/database'
import { useInquiryForm } from '@/hooks/useInquiryForm'
import { useToast } from '@/components/ui/toast'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, DESTINATION_COUNTRIES } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { InquirySuccess } from '@/components/features/catalog/InquirySuccess'

interface InquiryFormProps {
  product: Product
}

export function InquiryForm({ product }: InquiryFormProps) {
  const { toast } = useToast()
  const { values, errors, status, setField, submit } = useInquiryForm({
    productId: product.id,
    productName: product.name_es,
  })

  if (status === 'success') {
    return <InquirySuccess productName={product.name_es} />
  }

  const disabled = status === 'submitting'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const ok = await submit()
    if (!ok && status !== 'submitting') {
      // Per ENRICHED_SPEC §3.6 — exact error copy
      toast('No pudimos enviar tu solicitud. Intenta nuevamente o escríbenos por WhatsApp.', 'error')
    }
  }

  function validateOnBlur(field: string) {
    // Touch the field to trigger validation display
    setField(field as Parameters<typeof setField>[0], values[field as keyof typeof values])
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-wings-card border border-border-default bg-surface-card p-6"
    >
      {/* Per ENRICHED_SPEC §3.4 — "Solicitar este modelo" context */}
      <h2 className="font-display text-2xl font-semibold text-navy">Solicitar este modelo</h2>
      <p className="mt-1 font-body text-sm text-text-muted">
        Completa tus datos y el equipo de Wings te enviará una cotización detallada.
      </p>

      {/* Trust signal above submit — per ENRICHED_SPEC §4.3 */}
      <p className="mt-1 font-body text-xs text-text-muted">
        Consulta sin compromiso. Sin cuenta requerida.
      </p>

      <div className="mt-5 space-y-4">
        <Field label="Nombre completo" htmlFor="full_name" error={errors.full_name} required>
          <Input
            id="full_name"
            value={values.full_name}
            onChange={(e) => setField('full_name', e.target.value)}
            onBlur={() => validateOnBlur('full_name')}
            hasError={Boolean(errors.full_name)}
            disabled={disabled}
            placeholder="Tu nombre completo"
            autoComplete="name"
          />
        </Field>

        <Field label="Empresa" htmlFor="company">
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
          <Field label="Email" htmlFor="email" error={errors.email} required>
            <Input
              id="email"
              type="email"
              value={values.email}
              onChange={(e) => setField('email', e.target.value)}
              onBlur={() => validateOnBlur('email')}
              hasError={Boolean(errors.email)}
              disabled={disabled}
              placeholder="correo@empresa.com"
              autoComplete="email"
            />
          </Field>
          <Field label="WhatsApp / teléfono" htmlFor="phone" error={errors.phone} required>
            <Input
              id="phone"
              value={values.phone}
              onChange={(e) => setField('phone', e.target.value)}
              onBlur={() => validateOnBlur('phone')}
              hasError={Boolean(errors.phone)}
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
          >
            <Select
              id="destination_country"
              value={values.destination_country}
              onChange={(e) => setField('destination_country', e.target.value)}
              hasError={Boolean(errors.destination_country)}
              disabled={disabled}
            >
              <option value="">Selecciona el país de destino</option>
              {DESTINATION_COUNTRIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Cantidad requerida" htmlFor="quantity" error={errors.quantity} required>
            <Input
              id="quantity"
              value={values.quantity}
              onChange={(e) => setField('quantity', e.target.value)}
              onBlur={() => validateOnBlur('quantity')}
              hasError={Boolean(errors.quantity)}
              disabled={disabled}
              placeholder="Ej: 10 unidades"
            />
          </Field>
        </div>

        <Field label="Producto de interés" htmlFor="product_ref">
          <Input id="product_ref" value={product.name_es} readOnly disabled className="opacity-70" />
        </Field>

        {/* Notes — optional/collapsible per ENRICHED_SPEC §4.4 */}
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

      {/* Per ENRICHED_SPEC §3.4 — exact submit CTA */}
      <Button type="submit" className="mt-6 w-full" isLoading={disabled} size="lg">
        Enviar solicitud de consulta
      </Button>
    </form>
  )
}

function Field({
  label,
  htmlFor,
  error,
  required,
  children,
}: {
  label: string
  htmlFor: string
  error?: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block font-body text-sm font-medium text-navy">
        {label}
        {required && <span className="text-gold"> *</span>}
      </label>
      {children}
      {error && <p className="mt-1 font-body text-xs text-[#DC2626]">{error}</p>}
    </div>
  )
}
