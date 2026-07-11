// src/components/features/brands/ContainerConfigurator.tsx
// The ALLOCATION instrument (SPEC §4 / §2.7⑤) — one orchestrated screen,
// three zones: container selection → allocation (por cupos | por cantidad) →
// commitment. No cart, no checkout: the outcome is a documented reservation
// lead with 72 h validity. All authoritative math is server-side; everything
// rendered here is display.
'use client'

import { useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { FillMeter } from '@wings/trade-ui'
import { cn } from '@/lib/utils'
import type { RbContainerTemplate, RbPublicBrand, RbPublicContainer } from '@/lib/rb/fixtures'
import { fmt } from '@/lib/rb/packing'
import { PackingCascade } from '@/components/features/brands/PackingCascade'
import { SlotGrid } from '@/components/features/brands/SlotGrid'
import { CupoContainerDiagram } from '@/components/features/brands/CupoContainerDiagram'

type Allocation = 'shared' | 'dedicated'
type Mode = 'slots' | 'quantity'
type Phase = 'configuring' | 'submitting' | 'reserved' | 'waitlisted'

interface Conversion {
  slots: number
  remainderUnits: number
}

interface Props {
  brand: Pick<RbPublicBrand, 'code' | 'slug' | 'name'>
  containers: RbPublicContainer[]
  template: RbContainerTemplate
  /** slug → display name, to resolve the ?producto= deep link client-side. */
  productNames?: Record<string, string>
}

export function ContainerConfigurator({ brand, containers, template, productNames }: Props) {
  const searchParams = useSearchParams()
  const productName = productNames?.[searchParams.get('producto') ?? '']
  const [allocation, setAllocation] = useState<Allocation>('shared')
  const [containerId, setContainerId] = useState(containers[0]?.id ?? '')
  const [mode, setMode] = useState<Mode>('slots')
  const [slots, setSlots] = useState(1)
  const [quantity, setQuantity] = useState('')
  const [level, setLevel] = useState<'units' | 'packets' | 'packages'>('units')
  const [conversion, setConversion] = useState<Conversion | null>(null)
  const [converting, setConverting] = useState(false)
  const [phase, setPhase] = useState<Phase>('configuring')
  const [errorMsg, setErrorMsg] = useState('')
  const [leadId, setLeadId] = useState('')
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', company: '', message: '' })

  const container = useMemo(
    () => containers.find((c) => c.id === containerId) ?? containers[0],
    [containers, containerId],
  )
  const remaining = container
    ? Math.max(0, container.slots.total - container.slots.committed - container.slots.reserved)
    : 0

  const effectiveSlots =
    allocation === 'dedicated'
      ? template.totalSlots
      : mode === 'quantity' && conversion
        ? conversion.slots
        : slots

  async function handleConvert() {
    const q = Number(quantity)
    if (!Number.isFinite(q) || q <= 0) {
      setErrorMsg('Ingrese una cantidad válida.')
      return
    }
    setErrorMsg('')
    setConverting(true)
    try {
      const res = await fetch('/api/rb/convert', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ templateRef: template.ref, quantity: q, level }),
      })
      if (!res.ok) throw new Error('No se pudo convertir la cantidad.')
      const data = (await res.json()) as { conversion: Conversion }
      setConversion(data.conversion)
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'No se pudo convertir la cantidad.')
    } finally {
      setConverting(false)
    }
  }

  async function handleReserve(e: React.FormEvent) {
    e.preventDefault()
    if (phase === 'submitting' || !container) return
    setPhase('submitting')
    setErrorMsg('')
    try {
      const res = await fetch('/api/rb/reserve', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          brand: brand.slug,
          containerId: container.id,
          allocation,
          slots: effectiveSlots,
          full_name: form.full_name,
          email: form.email,
          phone: form.phone,
          company: form.company || undefined,
          message: form.message || undefined,
        }),
      })
      if (res.status === 409) {
        setPhase('waitlisted')
        return
      }
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string }
        throw new Error(data.error ?? `Error ${res.status}`)
      }
      const data = (await res.json()) as { lead_id: string }
      setLeadId(data.lead_id)
      setPhase('reserved')
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'No se pudo registrar la reserva.')
      setPhase('configuring')
    }
  }

  if (!container) {
    return (
      <p className="border border-neutral-200 bg-[var(--rb-surface-tint)] p-6 text-body-md text-neutral-600">
        No hay contenedores activos en este momento. Escríbanos por WhatsApp y le
        avisamos cuando abra el siguiente.
      </p>
    )
  }

  // ── Terminal states ────────────────────────────────────────────────
  if (phase === 'reserved') {
    return (
      <div className="border-2 border-[var(--rb-accent)] bg-[var(--rb-surface-tint)] p-8">
        <p className="font-mono text-[11px] uppercase tracking-widest-2 text-[var(--rb-accent-ink)]">
          Reserva registrada · Ref {leadId.slice(0, 8)}
        </p>
        <h3 className="mt-2 font-display text-display-sm text-neutral-900">
          Sus cupos quedan reservados por 72 horas
        </h3>
        <p className="mt-3 max-w-xl text-body-md text-neutral-700">
          {allocation === 'dedicated'
            ? `Contenedor completo ${template.kindLabel}: `
            : `${effectiveSlots} ${effectiveSlots === 1 ? 'cupo' : 'cupos'}: `}
          {fmt(effectiveSlots * template.packagesPerSlot)} cajas ·{' '}
          {fmt(effectiveSlots * template.packagesPerSlot * template.unitsPerPackage)}{' '}
          {template.unitNamePlural}. Un asesor de Wings le contacta para confirmar
          condiciones, precio a cotizar y entrega en Callao. Sin pago en línea.
        </p>
      </div>
    )
  }

  if (phase === 'waitlisted') {
    return (
      <div className="border border-[var(--rb-accent-2)] bg-white p-8">
        <p className="font-mono text-[11px] uppercase tracking-widest-2 text-[var(--rb-accent-2)]">
          Lista de espera
        </p>
        <h3 className="mt-2 font-display text-display-sm text-neutral-900">
          Los cupos solicitados ya no están disponibles
        </h3>
        <p className="mt-3 max-w-xl text-body-md text-neutral-700">
          Otro comprador tomó cupos de este contenedor mientras configuraba su reserva.
          Su solicitud quedó registrada con sus datos de contacto; podemos priorizarlo
          en lista de espera o avisarle cuando abra el siguiente contenedor de {brand.name}.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setPhase('configuring')}
            className="inline-flex h-11 items-center rounded-wings border border-neutral-300 px-5 text-label-md font-medium text-neutral-800"
          >
            Ajustar mi selección
          </button>
          <a
            href="https://wa.me/50760250735"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-11 items-center rounded-wings bg-[var(--rb-accent-ink)] px-5 text-label-md font-semibold text-white"
          >
            Lista de espera por WhatsApp
          </a>
        </div>
      </div>
    )
  }

  // ── Zone 1–3 ───────────────────────────────────────────────────────
  return (
    <form onSubmit={handleReserve} className="space-y-10">
      {productName && (
        <p className="border-l-2 border-[var(--rb-accent)] pl-4 text-body-sm text-neutral-600">
          Producto seleccionado: <span className="font-medium text-neutral-900">{productName}</span>
        </p>
      )}

      {/* ZONE 1 — container */}
      <fieldset>
        <legend className="font-mono text-[11px] uppercase tracking-widest-2 text-neutral-500">
          1 · Contenedor
        </legend>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {containers.map((c) => (
            <label
              key={c.id}
              className={cn(
                'cursor-pointer border p-5 transition-colors',
                allocation === 'shared' && containerId === c.id
                  ? 'border-[var(--rb-accent-ink)] bg-[var(--rb-surface-tint)]'
                  : 'border-neutral-200 bg-white hover:border-[var(--rb-accent)]',
              )}
            >
              <input
                type="radio"
                name="container"
                className="sr-only"
                checked={allocation === 'shared' && containerId === c.id}
                onChange={() => {
                  setAllocation('shared')
                  setContainerId(c.id)
                }}
              />
              <div className="flex items-baseline justify-between gap-3">
                <span className="font-mono text-mono-sm tabular-nums text-neutral-900">
                  {template.kindLabel}
                </span>
                <span className="font-mono text-[11px] uppercase tracking-widest-2 text-neutral-500">
                  Cierra {new Date(`${c.closesAt}T12:00:00`).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })}
                </span>
              </div>
              <p className="mt-1 text-body-sm text-neutral-600">
                {c.route.origin} → {c.route.destination}
              </p>
              <div className="mt-3">
                <FillMeter
                  totalSlots={c.slots.total}
                  committedSlots={c.slots.committed}
                  reservedSlots={c.slots.reserved}
                  size="sm"
                />
              </div>
            </label>
          ))}

          <label
            className={cn(
              'cursor-pointer border border-dashed p-5 transition-colors',
              allocation === 'dedicated'
                ? 'border-[var(--rb-accent-ink)] bg-[var(--rb-surface-tint)]'
                : 'border-neutral-300 bg-white hover:border-[var(--rb-accent)]',
            )}
          >
            <input
              type="radio"
              name="container"
              className="sr-only"
              checked={allocation === 'dedicated'}
              onChange={() => setAllocation('dedicated')}
            />
            <span className="font-mono text-mono-sm text-neutral-900">Contenedor completo</span>
            <p className="mt-1 text-body-sm text-neutral-600">
              {template.kindLabel} dedicado · {fmt(template.totalPackages)} cajas ·{' '}
              {fmt(template.totalPackages * template.unitsPerPackage)} {template.unitNamePlural}
            </p>
            <p className="mt-3 font-mono text-[11px] uppercase tracking-widest-2 text-[var(--rb-accent-ink)]">
              Programación a coordinar
            </p>
          </label>
        </div>
      </fieldset>

      {/* ZONE 2 — allocation */}
      {allocation === 'shared' && (
        <fieldset>
          <legend className="font-mono text-[11px] uppercase tracking-widest-2 text-neutral-500">
            2 · Asignación
          </legend>

          <div className="mt-4 inline-flex border border-neutral-300" role="tablist" aria-label="Modo de asignación">
            {(
              [
                ['slots', 'Por cupos'],
                ['quantity', 'Por cantidad'],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                role="tab"
                aria-selected={mode === value}
                onClick={() => {
                  setMode(value)
                  setErrorMsg('')
                }}
                className={cn(
                  'px-5 py-2.5 text-label-md font-medium transition-colors',
                  mode === value
                    ? 'bg-[var(--rb-accent-ink)] text-white'
                    : 'bg-white text-neutral-600 hover:text-neutral-900',
                )}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_minmax(280px,360px)]">
            <div>
              {mode === 'slots' ? (
                <div className="space-y-6">
                  {/* The container itself, sliced into cupos — same states
                      and selection semantics as the grid below it */}
                  <CupoContainerDiagram
                    container={container}
                    template={template}
                    selected={slots}
                    onSelect={(n) => setSlots(Math.max(1, Math.min(n, remaining)))}
                  />
                  <SlotGrid
                    container={container}
                    template={template}
                    selected={slots}
                    onSelect={(n) => setSlots(Math.max(1, Math.min(n, remaining)))}
                  />
                </div>
              ) : (
                <div className="max-w-md space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min={1}
                      inputMode="numeric"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      placeholder="Cantidad"
                      className="h-11 w-36 border border-neutral-300 px-3 font-mono tabular-nums text-neutral-900 focus:border-[var(--rb-accent-ink)] focus:outline-none"
                    />
                    <select
                      value={level}
                      onChange={(e) => setLevel(e.target.value as typeof level)}
                      className="h-11 border border-neutral-300 bg-white px-3 text-body-sm text-neutral-800 focus:border-[var(--rb-accent-ink)] focus:outline-none"
                    >
                      <option value="units">{template.unitNamePlural}</option>
                      <option value="packets">paquetes</option>
                      <option value="packages">cajas</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => void handleConvert()}
                      disabled={converting}
                      className="h-11 rounded-wings border border-[var(--rb-accent-ink)] px-5 text-label-md font-semibold text-[var(--rb-accent-ink)] transition-colors hover:bg-[var(--rb-accent-soft)] disabled:opacity-50"
                    >
                      {converting ? 'Calculando…' : 'Convertir'}
                    </button>
                  </div>
                  {conversion && (
                    <p className="text-body-sm text-neutral-700">
                      Su cantidad requiere{' '}
                      <span className="font-mono font-semibold tabular-nums text-[var(--rb-accent-ink)]">
                        {conversion.slots} {conversion.slots === 1 ? 'cupo' : 'cupos'}
                      </span>
                      {conversion.slots > remaining &&
                        ' — supera los cupos disponibles de este contenedor; considere el contenedor completo'}
                      .
                    </p>
                  )}
                </div>
              )}
            </div>
            <PackingCascade
              template={template}
              slots={effectiveSlots}
              remainderUnits={mode === 'quantity' ? conversion?.remainderUnits : undefined}
            />
          </div>
          <p className="mt-4 font-mono text-[12px] tabular-nums text-neutral-500">
            Restante en contenedor: {remaining} {remaining === 1 ? 'cupo' : 'cupos'} · Precio por cupo: a cotizar
          </p>
        </fieldset>
      )}

      {allocation === 'dedicated' && (
        <div className="grid gap-6 lg:grid-cols-[1fr_minmax(280px,360px)]">
          <p className="text-body-md text-neutral-700">
            El contenedor dedicado se programa contra producción: composición fija de{' '}
            {fmt(template.totalPackages)} cajas. Un asesor coordina fecha de embarque,
            condiciones y precio a cotizar.
          </p>
          <PackingCascade template={template} slots={template.totalSlots} />
        </div>
      )}

      {/* ZONE 3 — commitment */}
      <fieldset className="border-t border-neutral-200 pt-8">
        <legend className="sr-only">Datos de contacto</legend>
        <p className="font-mono text-[11px] uppercase tracking-widest-2 text-neutral-500">
          3 · Reserva documentada
        </p>
        <div className="mt-4 grid max-w-2xl gap-3 sm:grid-cols-2">
          <input
            required
            value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            placeholder="Nombre y apellido"
            autoComplete="name"
            className="h-11 border border-neutral-300 px-3 text-body-sm text-neutral-900 focus:border-[var(--rb-accent-ink)] focus:outline-none"
          />
          <input
            value={form.company}
            onChange={(e) => setForm({ ...form, company: e.target.value })}
            placeholder="Empresa (opcional)"
            autoComplete="organization"
            className="h-11 border border-neutral-300 px-3 text-body-sm text-neutral-900 focus:border-[var(--rb-accent-ink)] focus:outline-none"
          />
          <input
            required
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="Correo"
            autoComplete="email"
            className="h-11 border border-neutral-300 px-3 text-body-sm text-neutral-900 focus:border-[var(--rb-accent-ink)] focus:outline-none"
          />
          <input
            required
            type="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="WhatsApp / teléfono"
            autoComplete="tel"
            className="h-11 border border-neutral-300 px-3 text-body-sm text-neutral-900 focus:border-[var(--rb-accent-ink)] focus:outline-none"
          />
          <textarea
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            placeholder="Mensaje (opcional)"
            rows={3}
            className="border border-neutral-300 px-3 py-2 text-body-sm text-neutral-900 focus:border-[var(--rb-accent-ink)] focus:outline-none sm:col-span-2"
          />
        </div>

        {errorMsg && <p className="mt-3 text-body-sm text-[var(--error)]">{errorMsg}</p>}

        <div className="mt-5 flex flex-wrap items-center gap-4">
          <button
            type="submit"
            disabled={phase === 'submitting' || (allocation === 'shared' && remaining === 0)}
            className="inline-flex h-12 items-center justify-center rounded-wings bg-[var(--rb-accent-ink)] px-8 text-label-lg font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {phase === 'submitting'
              ? 'Registrando reserva…'
              : allocation === 'dedicated'
                ? 'Solicitar contenedor completo'
                : 'Reservar cupos'}
          </button>
          <p className="text-body-sm text-neutral-500">
            Sin pago en línea — reserva documentada, vigencia 72 horas.
          </p>
        </div>
      </fieldset>
    </form>
  )
}
