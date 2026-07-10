// src/components/features/brands/PackingCascade.tsx
// The Costco honesty rule as a live instrument (SPEC §2.7③): whatever the
// selection, the full unit cascade is exhibited — cupos → cajas → paquetes →
// unidades → kg. Display only; the server recomputes on reserve.
'use client'

import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import type { RbContainerTemplate } from '@/lib/rb/fixtures'
import { fmt } from '@/lib/rb/packing'

function useCountUp(target: number, enabled: boolean): number {
  const [value, setValue] = useState(target)
  const fromRef = useRef(target)
  useEffect(() => {
    if (!enabled) {
      fromRef.current = target
      setValue(target)
      return
    }
    const from = fromRef.current
    fromRef.current = target
    if (from === target) return
    const start = performance.now()
    const duration = 400
    let raf = 0
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - t, 3) // --ease-settle approximation
      setValue(Math.round(from + (target - from) * eased))
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, enabled])
  return value
}

interface Props {
  template: RbContainerTemplate
  slots: number
  remainderUnits?: number
}

export function PackingCascade({ template, slots, remainderUnits }: Props) {
  const reduced = useReducedMotion()
  const packages = useCountUp(slots * template.packagesPerSlot, !reduced)
  const packets = useCountUp(slots * template.packagesPerSlot * template.packetsPerPackage, !reduced)
  const units = useCountUp(slots * template.packagesPerSlot * template.unitsPerPackage, !reduced)
  const kg = useCountUp(Math.round(slots * template.packagesPerSlot * template.packageKg), !reduced)

  const rows = [
    { label: 'Cajas máster', value: fmt(packages) },
    { label: 'Paquetes', value: fmt(packets) },
    { label: template.unitNamePlural, value: fmt(units) },
    { label: 'Peso bruto', value: `${fmt(kg)} kg` },
  ]

  return (
    <div className="border border-neutral-200 bg-[var(--rb-surface-tint)] p-5">
      <p className="font-mono text-[11px] uppercase tracking-widest-2 text-neutral-500">
        Equivalencia de {slots} {slots === 1 ? 'cupo' : 'cupos'}
      </p>
      <dl className="mt-3 space-y-1.5">
        {rows.map((row) => (
          <div key={row.label} className="flex items-baseline justify-between gap-4">
            <dt className="text-body-sm capitalize text-neutral-600">{row.label}</dt>
            <dd className="font-mono text-mono-md tabular-nums text-[var(--rb-accent-ink)]">
              {row.value}
            </dd>
          </div>
        ))}
      </dl>
      {typeof remainderUnits === 'number' && remainderUnits > 0 && (
        <p className="mt-3 border-t border-neutral-200 pt-3 text-body-sm text-neutral-600">
          Sobran {fmt(remainderUnits)} {template.unitNamePlural} de capacidad — puede
          completarlos o dejarlos.
        </p>
      )}
    </div>
  )
}
