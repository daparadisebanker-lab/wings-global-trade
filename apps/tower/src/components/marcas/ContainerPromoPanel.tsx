'use client'

// Ventana de marketing — the container-promotion marketing window (root
// CLAUDE.md §5-bis). When a container is activated for promotion, a rep authors
// its share copy here and pulls the shareable assets: a live WhatsApp/ad copy
// with one-tap copy, and the off-white share card (live inline preview + PNG/JPG
// download) — all from the one @wings/rb-core library so the site, WhatsApp and
// ads stay identical. Activation + copy persist through RLS-gated server actions
// (setContainerPromoActive / saveContainerPromoCopy); the DB is the gate.
import Link from 'next/link'
import { useMemo, useRef, useState, useTransition } from 'react'
import {
  buildPromoCopy,
  buildPromoCardSvg,
  SHIPPING_PHASE_LABELS,
  type ContainerPromo,
  type PromoVariant,
  type ShippingPhase,
} from '@wings/rb-core'
import {
  saveContainerPromoCopy,
  setContainerPromoActive,
  setContainerShippingPhase,
  type ContainerPromoDetail,
} from '@/lib/actions/container-promo'
import { SHIPPING_PHASES, waMeUrl } from '@/lib/actions/container-promo-logic'
import type { PromoCopy } from '@/lib/actions/container-promo-logic'

const LABEL = 'font-mono text-label uppercase tracking-[0.08em] text-ink-secondary'
const INPUT =
  'rounded-card border border-line bg-surface-0 px-2 py-1.5 font-ui text-t0 text-ink-primary outline-none focus-visible:border-lane-accent'

// Where a rep sets their own WhatsApp Business line (rep-identity foundation,
// tower_39). Kept as one constant so the profile route can be re-pointed in a
// single place if onboarding lands it elsewhere.
const REP_PROFILE_PATH = '/perfil'

interface SpecRow {
  label: string
  value: string
}

export function ContainerPromoPanel({
  initial,
  onChanged,
  repWhatsappE164 = null,
  repWhatsappLabel = null,
}: {
  initial: ContainerPromoDetail
  onChanged?: () => void
  /** The current rep's own WhatsApp Business number (E.164) — the share deep-link
   *  is addressed to it so each rep shares from their own line. Null → fall back
   *  to the generic WhatsApp chooser and surface the profile hint. */
  repWhatsappE164?: string | null
  repWhatsappLabel?: string | null
}) {
  const [detail, setDetail] = useState(initial)
  const [variant, setVariant] = useState<PromoVariant>('whatsapp')
  const [headline, setHeadline] = useState(initial.copy.headline ?? '')
  const [priceNote, setPriceNote] = useState(initial.copy.priceNote ?? '')
  const [unitLabel, setUnitLabel] = useState(initial.copy.unitLabel ?? '')
  const [specs, setSpecs] = useState<SpecRow[]>(initial.copy.specs ?? [])
  const [banner, setBanner] = useState<{ tone: 'positive' | 'negative'; text: string } | null>(null)
  const [copied, setCopied] = useState(false)
  const [isSaving, startSave] = useTransition()
  const [isToggling, startToggle] = useTransition()
  const [isPhasing, startPhase] = useTransition()
  const previewRef = useRef<HTMLDivElement>(null)

  // The current copy, assembled from the edited fields (empty → dropped).
  const copy: PromoCopy = useMemo(() => {
    const cleaned = specs.map((s) => ({ label: s.label.trim(), value: s.value.trim() })).filter((s) => s.label && s.value)
    return {
      ...(headline.trim() ? { headline: headline.trim() } : {}),
      ...(priceNote.trim() ? { priceNote: priceNote.trim() } : {}),
      ...(unitLabel.trim() ? { unitLabel: unitLabel.trim() } : {}),
      ...(cleaned.length ? { specs: cleaned } : {}),
    }
  }, [headline, priceNote, unitLabel, specs])

  // Live ContainerPromo — the server baseline (detail.promo) overlaid with edits.
  // Falls back to the packing-derived default specs when the rep clears theirs.
  const promo: ContainerPromo = useMemo(() => {
    const cleaned = copy.specs ?? []
    return {
      productName: copy.headline || detail.productName,
      ownerLabel: detail.brandName,
      containerCode: detail.code,
      slotsTotal: detail.slotsTotal,
      slotsAvailable: detail.slotsAvailable,
      slotsCommitted: detail.promo.slotsCommitted,
      slotsReserved: detail.promo.slotsReserved,
      unitLabel: copy.unitLabel || 'cupos',
      priceNote: copy.priceNote,
      specs: cleaned.length ? cleaned : detail.defaultSpecs,
      listingUrl: detail.promo.listingUrl,
      // Route + phase are spec-driven — straight from the container record.
      routeLabel: detail.routeLabel ?? detail.promo.routeLabel,
      phase: detail.phase,
      accent: detail.promo.accent,
    }
  }, [copy, detail])

  const copyText = useMemo(() => buildPromoCopy(promo, variant), [promo, variant])
  const svg = useMemo(() => buildPromoCardSvg(promo), [promo])

  function saveCopy() {
    setBanner(null)
    startSave(async () => {
      const res = await saveContainerPromoCopy(detail.id, copy)
      if (res.error) {
        setBanner({ tone: 'negative', text: res.error.message })
        return
      }
      setDetail(res.data)
      setBanner({ tone: 'positive', text: 'Texto guardado / Copy saved ✓' })
      onChanged?.()
    })
  }

  function toggleActive() {
    setBanner(null)
    startToggle(async () => {
      const res = await setContainerPromoActive(detail.id, !detail.promoActive)
      if (res.error) {
        setBanner({ tone: 'negative', text: res.error.message })
        return
      }
      setDetail(res.data)
      onChanged?.()
    })
  }

  function changePhase(phase: ShippingPhase) {
    if (phase === detail.phase) return
    setBanner(null)
    startPhase(async () => {
      const res = await setContainerShippingPhase(detail.id, phase)
      if (res.error) {
        setBanner({ tone: 'negative', text: res.error.message })
        return
      }
      setDetail(res.data)
      onChanged?.()
    })
  }

  // Two-audience share: the same ad-script body, an audience-specific end-text,
  // opened as a WhatsApp share deep-link. Marketing = internal ad-production
  // handoff; clients = client-facing wholesale CTA (buildPromoCopy owns the copy).
  // The link is addressed to the rep's OWN WhatsApp Business number (each rep
  // reaches a different demographic); with no number on file it falls back to the
  // generic chooser and the hint below points the rep to their profile.
  function shareToAudience(audience: 'marketing' | 'clients') {
    const text = buildPromoCopy(promo, audience)
    const url = waMeUrl(repWhatsappE164, text)
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  async function copyToClipboard() {
    try {
      await navigator.clipboard.writeText(copyText)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      setBanner({ tone: 'negative', text: 'No se pudo copiar / Could not copy' })
    }
  }

  // Client-side raster: render the inline SVG into a canvas → PNG/JPG blob. No
  // server round-trip, real browser fonts (the /api/promo-card route is the
  // programmatic path for automation).
  function downloadRaster(kind: 'png' | 'jpeg') {
    const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = 1080
      canvas.height = 1080
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      ctx.fillStyle = '#F8F6F0'
      ctx.fillRect(0, 0, 1080, 1080)
      ctx.drawImage(img, 0, 0, 1080, 1080)
      URL.revokeObjectURL(url)
      canvas.toBlob(
        (out) => {
          if (!out) return
          const a = document.createElement('a')
          a.href = URL.createObjectURL(out)
          a.download = `contenedor-${detail.code}.${kind === 'jpeg' ? 'jpg' : 'png'}`
          a.click()
          URL.revokeObjectURL(a.href)
        },
        kind === 'jpeg' ? 'image/jpeg' : 'image/png',
        0.92,
      )
    }
    img.src = url
  }

  return (
    <div className="flex flex-col gap-4 rounded-card border border-line bg-surface-1 p-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col">
          <span className={LABEL}>Ventana de marketing · {detail.code}</span>
          <span className="font-ui text-t0 text-ink-primary">
            {detail.brandName} — {detail.slotsAvailable} de {detail.slotsTotal} cupos disponibles
          </span>
        </div>
        <button
          type="button"
          onClick={toggleActive}
          disabled={isToggling}
          className={`rounded-card px-3 py-1.5 font-mono text-label uppercase tracking-[0.1em] disabled:opacity-40 ${
            detail.promoActive ? 'border border-line text-ink-secondary hover:border-negative' : 'bg-accent text-surface-0'
          }`}
        >
          {detail.promoActive ? 'Desactivar promoción' : 'Activar promoción'}
        </button>
      </header>

      <p className={`font-mono text-label ${detail.promoActive ? 'text-positive' : 'text-ink-secondary'}`}>
        {detail.promoActive
          ? '● Activo — visible en la página de contenedor activo'
          : '○ Inactivo — el texto se guarda; actívalo para publicar'}
      </p>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* ── Editor ── */}
        <div className="flex flex-col gap-3">
          <label className="flex flex-col gap-1">
            <span className={LABEL}>Titular (opcional — por defecto el producto)</span>
            <input value={headline} onChange={(e) => setHeadline(e.target.value)} placeholder={detail.productName} className={INPUT} />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1">
              <span className={LABEL}>Nota de precio</span>
              <input value={priceNote} onChange={(e) => setPriceNote(e.target.value)} placeholder="precio de campaña" className={INPUT} />
            </label>
            <label className="flex flex-col gap-1">
              <span className={LABEL}>Unidad</span>
              <input value={unitLabel} onChange={(e) => setUnitLabel(e.target.value)} placeholder="cupos" className={INPUT} />
            </label>
          </div>
          {/* Route + phase — from the container spec, not free text. Origin and
              destination are read-only; the rep advances the shipping phase. */}
          <div className="flex flex-col gap-2 rounded-card border border-line bg-surface-0 p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className={LABEL}>Ruta del contenedor (spec)</span>
              <span className="font-mono text-t0 text-ink-primary">
                {detail.route?.origin ?? '—'} → {detail.route?.destination ?? 'Callao'}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className={LABEL}>Estado del envío</span>
              <div className="flex flex-wrap overflow-hidden rounded-card border border-line">
                {SHIPPING_PHASES.map((ph) => (
                  <button
                    key={ph}
                    type="button"
                    onClick={() => changePhase(ph)}
                    disabled={isPhasing}
                    aria-pressed={detail.phase === ph}
                    className={`px-3 py-1.5 font-mono text-label uppercase tracking-[0.08em] disabled:opacity-40 ${
                      detail.phase === ph ? 'bg-accent text-surface-0' : 'text-ink-secondary hover:bg-surface-1'
                    }`}
                  >
                    {SHIPPING_PHASE_LABELS[ph]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Specs editor */}
          <div className="flex flex-col gap-2">
            <span className={LABEL}>Especificaciones (vacío → derivadas del empaque)</span>
            {specs.map((s, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  value={s.label}
                  onChange={(e) => setSpecs((rows) => rows.map((r, j) => (j === i ? { ...r, label: e.target.value } : r)))}
                  placeholder="etiqueta"
                  className={`w-40 ${INPUT}`}
                />
                <input
                  value={s.value}
                  onChange={(e) => setSpecs((rows) => rows.map((r, j) => (j === i ? { ...r, value: e.target.value } : r)))}
                  placeholder="valor"
                  className={`flex-1 ${INPUT}`}
                />
                <button
                  type="button"
                  onClick={() => setSpecs((rows) => rows.filter((_, j) => j !== i))}
                  className="rounded-card border border-line px-2 py-1.5 font-mono text-label text-ink-secondary hover:border-negative"
                  aria-label="Quitar especificación"
                >
                  ✕
                </button>
              </div>
            ))}
            {specs.length < 6 ? (
              <button
                type="button"
                onClick={() => setSpecs((rows) => [...rows, { label: '', value: '' }])}
                className="w-fit rounded-card border border-line px-3 py-1.5 font-mono text-label uppercase tracking-[0.08em] text-ink-secondary hover:border-lane-accent"
              >
                + Agregar especificación
              </button>
            ) : null}
          </div>

          <button
            type="button"
            onClick={saveCopy}
            disabled={isSaving}
            className="w-fit rounded-card bg-accent px-4 py-2 font-mono text-label uppercase tracking-[0.1em] text-surface-0 disabled:opacity-40"
          >
            Guardar texto / Save copy
          </button>
          {banner ? (
            <p role="status" className={`font-ui text-t0 ${banner.tone === 'positive' ? 'text-positive' : 'text-negative'}`}>
              {banner.text}
            </p>
          ) : null}
        </div>

        {/* ── Preview ── */}
        <div className="flex flex-col gap-4">
          {/* Copy preview */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className={LABEL}>Copia</span>
              <div className="flex overflow-hidden rounded-card border border-line">
                {(['whatsapp', 'ad'] as PromoVariant[]).map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setVariant(v)}
                    className={`px-2 py-1 font-mono text-label uppercase tracking-[0.08em] ${
                      variant === v ? 'bg-accent text-surface-0' : 'text-ink-secondary'
                    }`}
                  >
                    {v === 'whatsapp' ? 'WhatsApp' : 'Anuncio'}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={copyToClipboard}
                className="rounded-card border border-line px-2 py-1 font-mono text-label uppercase tracking-[0.08em] text-ink-secondary hover:border-lane-accent"
              >
                {copied ? 'Copiado ✓' : 'Copiar'}
              </button>
            </div>
            <pre className="whitespace-pre-wrap rounded-card border border-line bg-surface-0 p-3 font-ui text-t0 text-ink-primary">
              {copyText}
            </pre>
            {/* Two-audience share: same ad-script body, audience-specific end-text. */}
            <div className="flex flex-col gap-2">
              <span className={LABEL}>Compartir el guion por audiencia</span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => shareToAudience('marketing')}
                  className="rounded-card border border-line px-3 py-1.5 font-mono text-label uppercase tracking-[0.08em] text-ink-secondary hover:border-lane-accent"
                >
                  Compartir con equipo de marketing
                </button>
                <button
                  type="button"
                  onClick={() => shareToAudience('clients')}
                  className="rounded-card bg-accent px-3 py-1.5 font-mono text-label uppercase tracking-[0.08em] text-surface-0"
                >
                  Compartir con leads y clientes
                </button>
              </div>
              {/* Sender context: the share opens from the rep's OWN WhatsApp line.
                  No number on file → generic chooser + a subtle profile hint. */}
              {repWhatsappE164 ? (
                <p className="font-mono text-label text-ink-secondary">
                  Se comparte desde tu WhatsApp{repWhatsappLabel ? ` · ${repWhatsappLabel}` : ''} ({repWhatsappE164}) / Shared from your WhatsApp
                </p>
              ) : (
                <p className="font-mono text-label text-ink-secondary">
                  Se comparte desde la línea general.{' '}
                  <Link
                    href={REP_PROFILE_PATH}
                    className="text-lane-accent underline underline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lane-accent"
                  >
                    Configura tu WhatsApp en tu perfil / Set up your WhatsApp in your profile
                  </Link>
                </p>
              )}
            </div>
          </div>

          {/* Card preview + downloads */}
          <div className="flex flex-col gap-2">
            <span className={LABEL}>Tarjeta para compartir (1080×1080)</span>
            <div
              ref={previewRef}
              className="overflow-hidden rounded-card border border-line [&>svg]:h-auto [&>svg]:w-full"
              // buildPromoCardSvg is our own pure, escaped SVG string — no user HTML.
              dangerouslySetInnerHTML={{ __html: svg }}
            />
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => downloadRaster('png')}
                className="rounded-card bg-accent px-3 py-1.5 font-mono text-label uppercase tracking-[0.1em] text-surface-0"
              >
                Descargar PNG
              </button>
              <button
                type="button"
                onClick={() => downloadRaster('jpeg')}
                className="rounded-card border border-line px-3 py-1.5 font-mono text-label uppercase tracking-[0.1em] text-ink-secondary hover:border-lane-accent"
              >
                Descargar JPG
              </button>
              <a
                href={`/api/promo-card/${encodeURIComponent(detail.code)}?format=svg`}
                className="rounded-card border border-line px-3 py-1.5 font-mono text-label uppercase tracking-[0.1em] text-ink-secondary hover:border-lane-accent"
              >
                SVG
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
