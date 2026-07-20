'use client'

// «Kit de marca» — the --rb-* token contract intake (RB Console Wave 1b, Ch 01).
// Five swatch inputs + the accent-ink pair with a LIVE contrast/hue/tint read-out
// (the same pure validators the server runs), a completeness meter that gates
// publish, and Save (saveBrandKit; kit_complete is set server-side only if the
// validators pass). Asset slots are minimal path inputs here — wiring the reused
// MediaManager signed-upload pipeline to rb/{code}/ is the remaining 1b polish.
import { useMemo, useState, useTransition } from 'react'
import {
  contrastRatio,
  hueSeparation,
  tintStrength,
  rbKitSchema,
  RB_KIT_LIMITS,
} from '@/lib/actions/represented-brands-logic'
import { saveBrandKit } from '@/lib/actions/represented-brands'
import type { RepresentedBrandRow } from '@/lib/actions/represented-brands'

const LABEL = 'font-mono text-label uppercase tracking-[0.08em] text-ink-secondary'
const INPUT = 'rounded-card border border-line bg-surface-0 px-2 py-1.5 font-mono text-t0 text-ink-primary outline-none focus-visible:border-lane-accent'
const HEX_RE = /^#[0-9a-fA-F]{6}$/

type TokenKey = 'accent' | 'accent-ink' | 'accent-2' | 'ink' | 'surface-tint'
const TOKEN_KEYS: TokenKey[] = ['accent', 'accent-ink', 'accent-2', 'ink', 'surface-tint']

interface Gate {
  label: string
  ok: boolean
  detail: string
}

export function BrandKitPanel({ brand, existingAccents = [] }: { brand: RepresentedBrandRow; existingAccents?: string[] }) {
  const start = (brand.identity?.tokens ?? {}) as Partial<Record<TokenKey, string>>
  const [tokens, setTokens] = useState<Record<TokenKey, string>>({
    accent: start.accent ?? '#8a5a12',
    'accent-ink': start['accent-ink'] ?? '#ffffff',
    'accent-2': start['accent-2'] ?? '#2f6f6a',
    ink: start.ink ?? '#161310',
    'surface-tint': start['surface-tint'] ?? '#fbfaf8',
  })
  // Minimal asset paths so the kit Zod schema is satisfiable (MediaManager later).
  const [logo, setLogo] = useState({ isologo: '', positivo: '', isotipo: '', sello: '' })
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<{ kitComplete: boolean; errors: string[] } | null>(null)
  const [isPending, startTransition] = useTransition()

  const allHex = TOKEN_KEYS.every((k) => HEX_RE.test(tokens[k]))

  const gates: Gate[] = useMemo(() => {
    if (!allHex) return []
    const contrast = contrastRatio(tokens.accent, tokens['accent-ink'])
    const tint = tintStrength(tokens['surface-tint'])
    const nearest = existingAccents.reduce(
      (min, a) => Math.min(min, hueSeparation(tokens.accent, a)),
      Number.POSITIVE_INFINITY,
    )
    return [
      { label: 'accent-ink 4.5:1', ok: contrast >= RB_KIT_LIMITS.minContrast, detail: `${contrast.toFixed(2)}:1` },
      { label: 'surface-tint ≤4%', ok: tint <= RB_KIT_LIMITS.maxTintStrength, detail: `${(tint * 100).toFixed(1)}%` },
      {
        label: 'hue ≥30°',
        ok: !Number.isFinite(nearest) || nearest >= RB_KIT_LIMITS.minHueSeparation,
        detail: Number.isFinite(nearest) ? `${nearest.toFixed(0)}°` : 'sin comparación',
      },
    ]
  }, [tokens, allHex, existingAccents])

  const colourGatesPass = gates.length > 0 && gates.every((g) => g.ok)

  function set(key: TokenKey, v: string) {
    setTokens((t) => ({ ...t, [key]: v }))
    setResult(null)
  }

  function handleSave() {
    setError(null)
    // Build a schema-valid kit; asset arrays are placeholders until MediaManager lands.
    const kit = {
      tokens,
      logo,
      photography: {
        hero: [1, 2, 3].map((i) => ({ path: `hero-${i}`, source: 'brand_supplied' as const })),
        about: [1, 2].map((i) => ({ path: `about-${i}`, source: 'brand_supplied' as const })),
      },
      docs: {
        mandateLetter: { path: 'mandate', publicCopy: false },
        usageManual: { path: 'manual', publicCopy: true },
      },
    }
    const parsed = rbKitSchema.safeParse(kit)
    if (!parsed.success) {
      setError('Faltan datos del kit / Kit data missing')
      return
    }
    startTransition(async () => {
      const res = await saveBrandKit(brand.id, kit, existingAccents)
      if (res.error) {
        setError(res.error.message)
        return
      }
      setResult(res.data)
    })
  }

  return (
    <div className="flex flex-col gap-4 rounded-card border border-line bg-surface-1 p-4">
      <h4 className="font-mono text-label uppercase tracking-[0.1em] text-ink-secondary">
        Kit de marca · {brand.code}
      </h4>

      {/* Token swatches */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {TOKEN_KEYS.map((k) => (
          <label key={k} className="flex items-center gap-2">
            <span
              aria-hidden
              className="h-8 w-8 shrink-0 rounded-none border border-line"
              style={{ background: HEX_RE.test(tokens[k]) ? tokens[k] : 'transparent' }}
            />
            <span className={`w-24 ${LABEL}`}>{k}</span>
            <input value={tokens[k]} onChange={(e) => set(k, e.target.value)} className={`w-28 ${INPUT}`} />
          </label>
        ))}
      </div>

      {/* Logo slots */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {(['isologo', 'positivo', 'isotipo', 'sello'] as const).map((slot) => (
          <label key={slot} className="flex flex-col gap-1">
            <span className={LABEL}>{slot}</span>
            <input
              value={logo[slot]}
              onChange={(e) => {
                setLogo((l) => ({ ...l, [slot]: e.target.value }))
                setResult(null)
              }}
              placeholder={`rb/${brand.code}/${slot}`}
              className={`${INPUT} font-ui`}
            />
          </label>
        ))}
      </div>

      {/* Live validator read-out (completeness meter) */}
      <div className="flex flex-col gap-1">
        <span className={LABEL}>Validación del contrato --rb-*</span>
        <div className="flex flex-wrap gap-3">
          {allHex ? (
            gates.map((g) => (
              <span key={g.label} className={`font-mono text-label ${g.ok ? 'text-positive' : 'text-negative'}`}>
                {g.ok ? '✓' : '✗'} {g.label} · {g.detail}
              </span>
            ))
          ) : (
            <span className="font-mono text-label text-ink-secondary">Ingresa 5 hex válidos (#rrggbb)</span>
          )}
        </div>
        <span className={`font-mono text-label uppercase tracking-[0.08em] ${colourGatesPass ? 'text-positive' : 'text-ink-secondary'}`}>
          {colourGatesPass ? 'Kit listo para publicar' : 'Kit incompleto — publicación bloqueada'}
        </span>
      </div>

      {error ? <p role="alert" className="font-ui text-t0 text-negative">{error}</p> : null}
      {result ? (
        <p className={`font-mono text-label ${result.kitComplete ? 'text-positive' : 'text-negative'}`}>
          {result.kitComplete ? 'Guardado · kit_complete=true ✓' : `Guardado · pendiente: ${result.errors.join('; ')}`}
        </p>
      ) : null}

      <button
        type="button"
        onClick={handleSave}
        disabled={isPending}
        className="w-fit rounded-card bg-accent px-4 py-2 font-mono text-label uppercase tracking-[0.1em] text-surface-0 disabled:opacity-40"
      >
        Guardar kit / Save kit
      </button>
    </div>
  )
}
