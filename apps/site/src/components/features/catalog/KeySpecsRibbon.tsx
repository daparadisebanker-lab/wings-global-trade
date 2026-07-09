'use client'

import { cn } from '@/lib/utils'

interface KeySpecsRibbonProps {
  specs: Record<string, unknown>
}

function getString(specs: Record<string, unknown>, ...keys: string[]): string | null {
  for (const key of keys) {
    const val = specs[key]
    if (typeof val === 'string' && val.trim()) return val.trim()
  }
  return null
}

interface StatItem {
  label: string
  value: string
}

export function KeySpecsRibbon({ specs }: KeySpecsRibbonProps) {
  const items: StatItem[] = []

  // HP
  const hp = getString(specs, 'Potencia del motor', 'Potencia', 'HP', 'CV')
  if (hp) items.push({ label: 'Potencia', value: hp })

  // RPM
  const rpm = getString(specs, 'RPM motor', 'RPM')
  if (rpm) items.push({ label: 'Motor', value: rpm })

  // Gears: "Marchas adelante" + "Marchas atrás"
  const fwd = getString(specs, 'Marchas adelante')
  const rev = getString(specs, 'Marchas atrás')
  if (fwd && rev) {
    // Extract just the numbers from values like "8" or "8 vel"
    const fwdNum = fwd.match(/^(\d+)/)?.[1] ?? fwd
    const revNum = rev.match(/^(\d+)/)?.[1] ?? rev
    items.push({ label: 'Marchas', value: `${fwdNum}+${revNum}` })
  }

  // PTO
  const pto = getString(specs, 'PTO RPM')
  if (pto) items.push({ label: 'PTO', value: pto })

  if (items.length === 0) return null

  return (
    <div className="border-y border-navy/10 py-6">
      <div className="grid grid-cols-2 gap-x-6 gap-y-5 sm:flex sm:items-stretch sm:divide-x sm:divide-navy/10">
        {items.map((item) => (
          <div
            key={item.label}
            className="flex flex-col gap-2 sm:px-8 sm:first:pl-0 sm:last:pr-0"
          >
            <span className="font-display text-2xl font-light leading-none text-[#062663]">
              {item.value}
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-gold">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
