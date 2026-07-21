'use client'

// «Kit de marca» — the --rb-* token contract intake (RB Console Wave 1b, Ch 01).
// Five swatch inputs + the accent-ink pair with a LIVE contrast/hue/tint read-out
// (the same pure validators the server runs), a completeness meter that gates
// publish, and Save (saveBrandKit; kit_complete is set server-side only if the
// validators pass). Asset slots (logos, photography, mandate/usage docs) upload
// through the reused signed-upload pipeline into the private `brand-kits` bucket
// at rb/{slug}/{slot}/… — the kit JSON stores only the returned storage path.
import { useMemo, useRef, useState, useTransition } from 'react'
import {
  contrastRatio,
  hueSeparation,
  tintStrength,
  rbKitSchema,
  RB_KIT_LIMITS,
  RB_LOGO_SLOTS,
  type RbAssetSlot,
  type RbKit,
  type RbLogoSlot,
} from '@/lib/actions/represented-brands-logic'
import { saveBrandKit } from '@/lib/actions/represented-brands'
import { createRbAssetUploadUrl } from '@/lib/actions/represented-brands-media'
import type { RepresentedBrandRow } from '@/lib/actions/represented-brands'

const LABEL = 'font-mono text-label uppercase tracking-[0.08em] text-ink-secondary'
const INPUT = 'rounded-card border border-line bg-surface-0 px-2 py-1.5 font-mono text-t0 text-ink-primary outline-none focus-visible:border-lane-accent'
const HEX_RE = /^#[0-9a-fA-F]{6}$/

type TokenKey = 'accent' | 'accent-ink' | 'accent-2' | 'ink' | 'surface-tint'
const TOKEN_KEYS: TokenKey[] = ['accent', 'accent-ink', 'accent-2', 'ink', 'surface-tint']

const HERO_SLOTS = 3 // rbKitSchema requires ≥3 hero photos
const ABOUT_SLOTS = 2 // …and ≥2 about photos
const IMAGE_ACCEPT = 'image/png,image/jpeg,image/webp,image/avif,image/svg+xml'
const DOC_ACCEPT = 'application/pdf'

interface Gate {
  label: string
  ok: boolean
  detail: string
}
interface DocState {
  path: string
  publicCopy: boolean
}

/** Read the paths a previously-saved kit stored, padded to a fixed slot count. */
function padPaths(items: { path: string }[] | undefined, count: number): string[] {
  const paths = (items ?? []).map((i) => i.path)
  return Array.from({ length: count }, (_, i) => paths[i] ?? '')
}

// ── One signed-upload asset slot ─────────────────────────────────────────────
function AssetSlot({
  brandId,
  slot,
  label,
  accept,
  value,
  disabled,
  onUploaded,
}: {
  brandId: string
  slot: RbAssetSlot
  label: string
  accept: string
  value: string
  disabled?: boolean
  onUploaded: (path: string) => void
}) {
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const ref = useRef<HTMLInputElement>(null)

  async function handle(files: FileList | null) {
    const file = files?.[0]
    if (!file) return
    setBusy(true)
    setErr(null)
    try {
      const ticket = await createRbAssetUploadUrl(brandId, { slot, fileName: file.name })
      if (ticket.error) {
        setErr(ticket.error.message)
        return
      }
      const res = await fetch(ticket.data.signedUrl, { method: 'PUT', body: file })
      if (!res.ok) {
        setErr('No se pudo subir / Upload failed')
        return
      }
      setPreview(file.type.startsWith('image/') ? URL.createObjectURL(file) : null)
      onUploaded(ticket.data.path)
    } catch (e) {
      console.error('[rb-asset:upload]', e)
      setErr('Error inesperado / Unexpected error')
    } finally {
      setBusy(false)
      if (ref.current) ref.current.value = ''
    }
  }

  const fileName = value ? value.split('/').pop() : null

  return (
    <div className="flex flex-col gap-1 rounded-card border border-line bg-surface-0 p-2">
      <div className="flex items-center justify-between gap-2">
        <span className={LABEL}>{label}</span>
        {value ? <span className="font-mono text-label text-positive">✓</span> : null}
      </div>
      {preview ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={preview} alt="" className="h-16 w-full rounded-none border border-line object-contain" />
      ) : null}
      {fileName ? (
        <span className="truncate font-ui text-t0 text-ink-primary" title={value}>
          {fileName}
        </span>
      ) : (
        <span className="font-ui text-t0 text-ink-secondary">Sin archivo / No file</span>
      )}
      <input
        ref={ref}
        type="file"
        accept={accept}
        disabled={disabled || busy}
        onChange={(e) => handle(e.target.files)}
        className="font-ui text-label text-ink-secondary file:mr-2 file:rounded-card file:border file:border-line file:bg-surface-1 file:px-2 file:py-1 file:font-mono file:text-label file:uppercase file:tracking-[0.08em] file:text-ink-primary"
      />
      {busy ? <span className="font-mono text-label text-ink-secondary">Subiendo… / Uploading…</span> : null}
      {err ? (
        <span role="alert" className="font-mono text-label text-negative">
          {err}
        </span>
      ) : null}
    </div>
  )
}

export function BrandKitPanel({ brand, existingAccents = [] }: { brand: RepresentedBrandRow; existingAccents?: string[] }) {
  const saved = (brand.identity ?? {}) as Partial<RbKit>
  const startTokens = (saved.tokens ?? {}) as Partial<Record<TokenKey, string>>
  const [tokens, setTokens] = useState<Record<TokenKey, string>>({
    accent: startTokens.accent ?? '#8a5a12',
    'accent-ink': startTokens['accent-ink'] ?? '#ffffff',
    'accent-2': startTokens['accent-2'] ?? '#2f6f6a',
    ink: startTokens.ink ?? '#161310',
    'surface-tint': startTokens['surface-tint'] ?? '#fbfaf8',
  })

  // Asset paths — seeded from any previously-saved kit so editing round-trips.
  const [logo, setLogo] = useState<Record<RbLogoSlot, string>>({
    isologo: saved.logo?.isologo ?? '',
    positivo: saved.logo?.positivo ?? '',
    isotipo: saved.logo?.isotipo ?? '',
    sello: saved.logo?.sello ?? '',
  })
  const [hero, setHero] = useState<string[]>(padPaths(saved.photography?.hero, HERO_SLOTS))
  const [about, setAbout] = useState<string[]>(padPaths(saved.photography?.about, ABOUT_SLOTS))
  const [mandate, setMandate] = useState<DocState>({
    path: saved.docs?.mandateLetter?.path ?? '',
    publicCopy: saved.docs?.mandateLetter?.publicCopy ?? false,
  })
  const [manual, setManual] = useState<DocState>({
    path: saved.docs?.usageManual?.path ?? '',
    publicCopy: saved.docs?.usageManual?.publicCopy ?? true,
  })

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

  const logoComplete = RB_LOGO_SLOTS.every((s) => logo[s])
  const heroComplete = hero.filter(Boolean).length >= HERO_SLOTS
  const aboutComplete = about.filter(Boolean).length >= ABOUT_SLOTS
  const docsComplete = Boolean(mandate.path) && Boolean(manual.path)
  const assetsComplete = logoComplete && heroComplete && aboutComplete && docsComplete

  function set(key: TokenKey, v: string) {
    setTokens((t) => ({ ...t, [key]: v }))
    setResult(null)
  }
  function setHeroAt(i: number, path: string) {
    setHero((h) => h.map((p, idx) => (idx === i ? path : p)))
    setResult(null)
  }
  function setAboutAt(i: number, path: string) {
    setAbout((h) => h.map((p, idx) => (idx === i ? path : p)))
    setResult(null)
  }

  function handleSave() {
    setError(null)
    const kit = {
      tokens,
      logo,
      photography: {
        hero: hero.filter(Boolean).map((path) => ({ path, source: 'brand_supplied' as const })),
        about: about.filter(Boolean).map((path) => ({ path, source: 'brand_supplied' as const })),
      },
      docs: {
        mandateLetter: { path: mandate.path, publicCopy: mandate.publicCopy },
        usageManual: { path: manual.path, publicCopy: manual.publicCopy },
      },
    }
    const parsed = rbKitSchema.safeParse(kit)
    if (!parsed.success) {
      setError('Faltan activos del kit (logos, fotos, documentos) / Kit assets missing (logos, photos, docs)')
      return
    }
    startTransition(async () => {
      const res = await saveBrandKit(brand.id, parsed.data, existingAccents)
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
      <div className="flex flex-col gap-2">
        <span className={LABEL}>Logotipos / Logos</span>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {RB_LOGO_SLOTS.map((slot) => (
            <AssetSlot
              key={slot}
              brandId={brand.id}
              slot={slot}
              label={slot}
              accept={IMAGE_ACCEPT}
              value={logo[slot]}
              onUploaded={(path) => {
                setLogo((l) => ({ ...l, [slot]: path }))
                setResult(null)
              }}
            />
          ))}
        </div>
      </div>

      {/* Photography */}
      <div className="flex flex-col gap-2">
        <span className={LABEL}>
          Fotografía · hero ×{HERO_SLOTS} · about ×{ABOUT_SLOTS}
        </span>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {hero.map((path, i) => (
            <AssetSlot
              key={`hero-${i}`}
              brandId={brand.id}
              slot="hero"
              label={`hero ${i + 1}`}
              accept={IMAGE_ACCEPT}
              value={path}
              onUploaded={(p) => setHeroAt(i, p)}
            />
          ))}
          {about.map((path, i) => (
            <AssetSlot
              key={`about-${i}`}
              brandId={brand.id}
              slot="about"
              label={`about ${i + 1}`}
              accept={IMAGE_ACCEPT}
              value={path}
              onUploaded={(p) => setAboutAt(i, p)}
            />
          ))}
        </div>
      </div>

      {/* Documents */}
      <div className="flex flex-col gap-2">
        <span className={LABEL}>Documentos / Documents (PDF)</span>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <AssetSlot
              brandId={brand.id}
              slot="mandate"
              label="carta mandato / mandate letter"
              accept={DOC_ACCEPT}
              value={mandate.path}
              onUploaded={(path) => {
                setMandate((d) => ({ ...d, path }))
                setResult(null)
              }}
            />
            <label className="flex items-center gap-2 font-mono text-label text-ink-secondary">
              <input
                type="checkbox"
                checked={mandate.publicCopy}
                onChange={(e) => setMandate((d) => ({ ...d, publicCopy: e.target.checked }))}
              />
              copia pública / public copy
            </label>
          </div>
          <div className="flex flex-col gap-1">
            <AssetSlot
              brandId={brand.id}
              slot="manual"
              label="manual de uso / usage manual"
              accept={DOC_ACCEPT}
              value={manual.path}
              onUploaded={(path) => {
                setManual((d) => ({ ...d, path }))
                setResult(null)
              }}
            />
            <label className="flex items-center gap-2 font-mono text-label text-ink-secondary">
              <input
                type="checkbox"
                checked={manual.publicCopy}
                onChange={(e) => setManual((d) => ({ ...d, publicCopy: e.target.checked }))}
              />
              copia pública / public copy
            </label>
          </div>
        </div>
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
        <div className="flex flex-wrap gap-3">
          <span className={`font-mono text-label ${logoComplete ? 'text-positive' : 'text-negative'}`}>
            {logoComplete ? '✓' : '✗'} logos 4/4
          </span>
          <span className={`font-mono text-label ${heroComplete ? 'text-positive' : 'text-negative'}`}>
            {heroComplete ? '✓' : '✗'} hero {hero.filter(Boolean).length}/{HERO_SLOTS}
          </span>
          <span className={`font-mono text-label ${aboutComplete ? 'text-positive' : 'text-negative'}`}>
            {aboutComplete ? '✓' : '✗'} about {about.filter(Boolean).length}/{ABOUT_SLOTS}
          </span>
          <span className={`font-mono text-label ${docsComplete ? 'text-positive' : 'text-negative'}`}>
            {docsComplete ? '✓' : '✗'} docs
          </span>
        </div>
        <span
          className={`font-mono text-label uppercase tracking-[0.08em] ${colourGatesPass && assetsComplete ? 'text-positive' : 'text-ink-secondary'}`}
        >
          {colourGatesPass && assetsComplete ? 'Kit listo para publicar' : 'Kit incompleto — publicación bloqueada'}
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
