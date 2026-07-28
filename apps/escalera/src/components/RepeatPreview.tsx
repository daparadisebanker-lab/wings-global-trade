'use client'

// El Pasillo · §4.4 — the repeat preview. The sheet's signature.
//
// A single tile face does not tell a buyer what a floor looks like. The supplier
// knows this — that is why their catalogue includes installed room renders. It is
// the most under-served moment in the whole flow, and the fix costs one CSS
// property: tile the face and the buyer sees the joint, the motif alignment, and
// whether the pattern reads as a field or as noise.
//
// So 3×3 is the DEFAULT state, not 1×. That single default is the difference
// between a catalogue and a sourcing tool.

import { useState } from 'react'
import { canRandomiseRepeat, faceAt } from '@/lib/catalogue'
import type { Sku } from '@/types/catalogue'

type Mode = '1x' | '3x3'

export function RepeatPreview({ sku, compact = false }: { sku: Sku; compact?: boolean }) {
  const [mode, setMode] = useState<Mode>('3x3')
  const mixed = canRandomiseRepeat(sku)

  return (
    <div>
      <div className="relative aspect-square w-full overflow-hidden bg-surface-2">
        {mode === '1x' ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={sku.faces[0]}
            alt={`${sku.code} — cara`}
            className="h-full w-full object-cover"
            decoding="async"
          />
        ) : (
          <div className="grid h-full w-full grid-cols-3 grid-rows-3">
            {Array.from({ length: 9 }, (_, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={i}
                src={faceAt(sku, i)}
                alt=""
                className="h-full w-full object-cover"
                decoding="async"
                loading={i === 0 ? 'eager' : 'lazy'}
              />
            ))}
          </div>
        )}
      </div>

      <div className="mt-3 flex items-center gap-2">
        <div role="radiogroup" aria-label="Vista" className="flex rounded-chrome border border-ink/20 p-1">
          {(['1x', '3x3'] as const).map((m) => (
            <button
              key={m}
              type="button"
              role="radio"
              aria-checked={mode === m}
              onClick={() => setMode(m)}
              className={`stamp rounded-chrome px-3 py-1.5 transition-colors ${
                mode === m ? 'bg-ink text-surface' : 'opacity-resting'
              }`}
            >
              {m === '1x' ? '1×' : '3×3'}
            </button>
          ))}
        </div>
        {!compact && (
          <p className="stamp opacity-resting">
            {mode === '1x'
              ? 'Cara individual'
              : mixed
                ? `Campo mixto · ${sku.faces.length} caras`
                : 'Campo repetido'}
          </p>
        )}
      </div>

      {mode === '3x3' && sku.face_kind === 'composite' && (
        <p className="mt-2 text-t0 opacity-resting">
          La cara impresa ya combina {sku.pattern_count} diseños; el proveedor no publica cada
          uno por separado, así que el campo repite esa composición.
        </p>
      )}
      {sku.face_kind === 'review' && (
        <p className="mt-2 text-t0 opacity-resting">
          El catálogo imprime {sku.pattern_count} patrón pero muestra {sku.faces.length} caras.
          Confirmar con el proveedor antes de cotizar.
        </p>
      )}
    </div>
  )
}
