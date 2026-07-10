// src/components/features/brands/SlotGrid.tsx
// Interactive slot cells (SPEC §2.7④): vendido solid · reservado hatched ·
// disponible outline; available cells toggle selection and feed the cascade.
// Fill state is display — availability is re-validated server-side on reserve.
'use client'

import { cn } from '@/lib/utils'
import type { RbContainerTemplate, RbPublicContainer } from '@/lib/rb/fixtures'
import { fmt } from '@/lib/rb/packing'

const HATCH =
  'repeating-linear-gradient(45deg, var(--rb-accent-soft), var(--rb-accent-soft) 4px, transparent 4px, transparent 8px)'

interface Props {
  container: RbPublicContainer
  template: RbContainerTemplate
  selected: number
  onSelect: (slots: number) => void
}

export function SlotGrid({ container, template, selected, onSelect }: Props) {
  const { total, committed, reserved } = container.slots
  const unitsPerSlot = template.packagesPerSlot * template.unitsPerPackage
  const kgPerSlot = Math.round(template.packagesPerSlot * template.packageKg)

  return (
    <div>
      <div role="group" aria-label="Cupos del contenedor" className="flex flex-wrap gap-1.5">
        {Array.from({ length: total }, (_, i) => {
          const isCommitted = i < committed
          const isReserved = !isCommitted && i < committed + reserved
          const availIndex = i - committed - reserved // 0-based among available
          const isSelected = availIndex >= 0 && availIndex < selected
          const isAvailable = availIndex >= 0

          const tooltip = isAvailable
            ? `Cupo ${i + 1} · ${template.packagesPerSlot} cajas · ${fmt(unitsPerSlot)} ${template.unitNamePlural} · ${fmt(kgPerSlot)} kg`
            : isCommitted
              ? `Cupo ${i + 1} · vendido`
              : `Cupo ${i + 1} · reservado`

          return (
            <button
              key={i}
              type="button"
              disabled={!isAvailable}
              title={tooltip}
              aria-label={tooltip}
              aria-pressed={isAvailable ? isSelected : undefined}
              onClick={() => {
                if (!isAvailable) return
                // Clicking cell N selects slots 1..N among available; clicking
                // the last selected cell deselects down to it.
                onSelect(availIndex + 1 === selected ? availIndex : availIndex + 1)
              }}
              className={cn(
                'h-10 w-10 border transition-colors md:h-11 md:w-11',
                isCommitted && 'cursor-default border-[var(--rb-accent-ink)] bg-[var(--rb-accent)]',
                isReserved && 'cursor-default border-[var(--rb-accent-border)]',
                isAvailable && !isSelected && 'border-neutral-300 bg-white hover:border-[var(--rb-accent)]',
                isAvailable && isSelected && 'border-[var(--rb-accent-ink)] bg-[var(--rb-accent-soft)]',
              )}
              style={isReserved ? { backgroundImage: HATCH } : undefined}
            />
          )
        })}
      </div>
      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 font-mono text-[11px] uppercase tracking-widest-2 text-neutral-500">
        <span className="flex items-center gap-1.5">
          <i aria-hidden className="inline-block h-3 w-3 bg-[var(--rb-accent)]" /> Vendido
        </span>
        <span className="flex items-center gap-1.5">
          <i
            aria-hidden
            className="inline-block h-3 w-3 border border-[var(--rb-accent-border)]"
            style={{ backgroundImage: HATCH }}
          />
          Reservado
        </span>
        <span className="flex items-center gap-1.5">
          <i aria-hidden className="inline-block h-3 w-3 border border-neutral-300 bg-white" /> Disponible
        </span>
      </div>
    </div>
  )
}
