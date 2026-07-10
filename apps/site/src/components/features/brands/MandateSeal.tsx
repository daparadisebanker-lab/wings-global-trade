// src/components/features/brands/MandateSeal.tsx
// The Alibaba-style trust artifact (SPEC §2.7②): the official-partner mandate
// as a first-class, expandable UI element. The Wings navy/gold here is the
// ONLY Wings color inside the brand canvas (root law §5-bis).
'use client'

import { useId, useState } from 'react'

interface Props {
  brandName: string
  territory: string
  scope: string[]
  since: number
}

export function MandateSeal({ brandName, territory, scope, since }: Props) {
  const [open, setOpen] = useState(false)
  const panelId = useId()

  return (
    <div className="border border-navy/20 bg-white">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-4 p-5 text-left transition-colors hover:bg-neutral-50"
      >
        {/* Wings seal — deliberate navy/gold exception inside the brand canvas */}
        <span
          aria-hidden
          className="flex h-11 w-11 shrink-0 items-center justify-center border-2 border-gold bg-navy font-mono text-[13px] font-semibold text-gold"
        >
          W
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-mono text-[11px] uppercase tracking-widest-2 text-navy/60">
            Socio comercial oficial · desde {since}
          </span>
          <span className="mt-1 block text-body-md font-semibold text-navy">
            Wings Global Trade × {brandName}
          </span>
        </span>
        <span aria-hidden className="font-mono text-[18px] leading-none text-navy/40">
          {open ? '−' : '+'}
        </span>
      </button>
      <div
        id={panelId}
        hidden={!open}
        className="border-t border-navy/10 px-5 py-4"
      >
        <p className="font-mono text-[11px] uppercase tracking-widest-2 text-navy/60">
          Alcance del mandato · Territorio: {territory}
        </p>
        <ul className="mt-3 space-y-1.5">
          {scope.map((item) => (
            <li key={item} className="flex gap-2 text-body-sm text-navy/80">
              <span aria-hidden className="text-gold">▸</span>
              {item}
            </li>
          ))}
        </ul>
        <p className="mt-4 text-body-sm text-navy/60">
          Carta de representación disponible en el proceso de reserva.
        </p>
      </div>
    </div>
  )
}
