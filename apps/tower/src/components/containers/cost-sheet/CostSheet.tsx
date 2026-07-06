'use client'

// Landed cost — COMPONENT_TREE §3 <CostSheet>: FOB+freight+insurance+duties+
// free-zone handling → landed/unit, integer-money, server-computed. Inputs
// are entered as decimal currency and parsed to integer minor units
// client-side (containers-logic#parseDecimalToMinor) before the server call
// — the server never receives, trusts, or stores a float.
//
// "margin/container" (COMPONENT_TREE) is deliberately NOT built:
// `landed_costs` has no revenue/sale-price column to diff against — see
// components/containers/README.md's "Deliberately out of scope" note.
import { useEffect, useState, useTransition } from 'react'
import { computeLandedCost, getLandedCost } from '@/lib/actions/containers'
import { landedCostPerUnitMinor, parseDecimalToMinor } from '@/lib/actions/containers-logic'
import type { LandedCostRow } from '@/lib/actions/containers-types'
import { formatMinor } from '@/lib/money'

const EMPTY_FORM = { fob: '', freight: '', insurance: '', duties: '', handling: '' }

const FIELDS: { key: keyof typeof EMPTY_FORM; label: string }[] = [
  { key: 'fob', label: 'FOB' },
  { key: 'freight', label: 'Flete / Freight' },
  { key: 'insurance', label: 'Seguro / Insurance' },
  { key: 'duties', label: 'Aranceles / Duties' },
  { key: 'handling', label: 'Manejo (zona franca) / Handling' },
]

function toDisplay(minor: number): string {
  return (minor / 100).toFixed(2)
}

export function CostSheet({
  containerId,
  capacityCbm,
  committedCbm,
  canWrite,
}: {
  containerId: string
  capacityCbm: number
  committedCbm: number
  canWrite: boolean
}) {
  const [landedCost, setLandedCost] = useState<LandedCostRow | null>(null)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(EMPTY_FORM)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    getLandedCost(containerId).then((result) => {
      if (cancelled) return
      if (result.error) {
        setError(`${result.error.code}: ${result.error.message}`)
      } else if (result.data) {
        setLandedCost(result.data)
        setForm({
          fob: toDisplay(result.data.fobMinor),
          freight: toDisplay(result.data.freightMinor),
          insurance: toDisplay(result.data.insuranceMinor),
          duties: toDisplay(result.data.dutiesMinor),
          handling: toDisplay(result.data.handlingMinor),
        })
      }
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [containerId])

  function submit() {
    setError(null)
    const parsed = {
      fobMinor: parseDecimalToMinor(form.fob || '0'),
      freightMinor: parseDecimalToMinor(form.freight || '0'),
      insuranceMinor: parseDecimalToMinor(form.insurance || '0'),
      dutiesMinor: parseDecimalToMinor(form.duties || '0'),
      handlingMinor: parseDecimalToMinor(form.handling || '0'),
    }
    if (Object.values(parsed).some((v) => v === null)) {
      setError('Montos inválidos / Invalid amounts')
      return
    }
    startTransition(async () => {
      const result = await computeLandedCost(containerId, {
        fobMinor: parsed.fobMinor as number,
        freightMinor: parsed.freightMinor as number,
        insuranceMinor: parsed.insuranceMinor as number,
        dutiesMinor: parsed.dutiesMinor as number,
        handlingMinor: parsed.handlingMinor as number,
        currency: 'USD',
      })
      if (result.error) {
        setError(`${result.error.code}: ${result.error.message}`)
        return
      }
      setLandedCost(result.data)
    })
  }

  const perCbm =
    landedCost && committedCbm > 0 ? landedCostPerUnitMinor(landedCost.totalMinor, committedCbm) : null

  return (
    <div className="flex flex-col gap-3">
      <h2 className="font-mono text-label uppercase tracking-[0.1em] text-ink-secondary">
        Costo de aterrizaje / Landed cost
      </h2>

      {loading ? <p className="font-ui text-t0 text-ink-secondary">Cargando… / Loading…</p> : null}

      {canWrite ? (
        <div className="grid grid-cols-2 gap-3 rounded-card border border-line bg-surface-1 p-3 sm:grid-cols-3 md:grid-cols-5">
          {FIELDS.map(({ key, label }) => (
            <label key={key} className="flex flex-col gap-1">
              <span className="font-mono text-label uppercase tracking-[0.08em] text-ink-secondary">{label}</span>
              <input
                value={form[key]}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                inputMode="decimal"
                placeholder="0.00"
                className="rounded-card border border-line bg-surface-0 px-3 py-1.5 font-mono text-t0 text-ink-primary outline-none focus-visible:border-lane-accent"
              />
            </label>
          ))}
        </div>
      ) : null}

      {error ? (
        <p role="alert" className="font-ui text-t0 text-negative">
          {error}
        </p>
      ) : null}

      {canWrite ? (
        <button
          type="button"
          onClick={submit}
          disabled={isPending}
          className="self-start rounded-card bg-accent px-4 py-2 font-mono text-label uppercase tracking-[0.1em] text-surface-0 disabled:opacity-40"
        >
          {isPending ? 'Calculando… / Computing…' : 'Calcular costo / Compute cost'}
        </button>
      ) : null}

      {landedCost ? (
        <div className="grid grid-cols-2 gap-3 rounded-card border border-line p-3 sm:grid-cols-3">
          <div className="flex flex-col gap-1">
            <span className="font-mono text-label uppercase tracking-[0.08em] text-ink-secondary">
              Total aterrizado / Landed total
            </span>
            <span className="font-mono text-t2 text-ink-primary" data-numeric>
              {formatMinor(landedCost.totalMinor, landedCost.currency)}
            </span>
          </div>
          {perCbm !== null ? (
            <div className="flex flex-col gap-1">
              <span className="font-mono text-label uppercase tracking-[0.08em] text-ink-secondary">
                Por CBM comprometido / Per committed CBM
              </span>
              <span className="font-mono text-t2 text-ink-primary" data-numeric>
                {formatMinor(perCbm, landedCost.currency)}
              </span>
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              <span className="font-mono text-label uppercase tracking-[0.08em] text-ink-secondary">
                Por CBM comprometido / Per committed CBM
              </span>
              <span className="font-mono text-t0 text-ink-secondary">
                Sin compromisos aún / No commitments yet
              </span>
            </div>
          )}
          <div className="flex flex-col gap-1">
            <span className="font-mono text-label uppercase tracking-[0.08em] text-ink-secondary">
              Capacidad / Capacity
            </span>
            <span className="font-mono text-t0 text-ink-secondary" data-numeric>
              {committedCbm.toFixed(1)} / {capacityCbm.toFixed(1)} CBM
            </span>
          </div>
        </div>
      ) : !loading ? (
        <p className="font-ui text-t0 text-ink-secondary">Sin costo calculado todavía / No cost computed yet</p>
      ) : null}
    </div>
  )
}
