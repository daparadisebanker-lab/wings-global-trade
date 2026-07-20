// @wings/rb-core · promo.ts
// The container-promotion library (container-generic — "a template for all and
// any kind of container"). Pure + framework-agnostic: given a normalized
// ContainerPromo, it produces (1) shareable COPY in variants (WhatsApp, ad) and
// (2) the SHARE-CARD SVG (off-white, a slot visualization, the Wings wordmark,
// the listing URL). The SVG is a string so any app can render it inline or pipe
// it to resvg → PNG/JPG. Copy honors the site law: Spanish, no exclamation marks,
// technical and direct.

import { wingsLogo } from './wings-logo'

export interface ContainerPromoSpec {
  label: string
  value: string
}

/** Where the container physically is — driven by the container spec, not copy. */
export type ShippingPhase = 'EN_ORIGEN' | 'EN_TRANSITO' | 'ARRIBADO' | 'NACIONALIZADO'

export const SHIPPING_PHASE_LABELS: Record<ShippingPhase, string> = {
  EN_ORIGEN: 'En origen',
  EN_TRANSITO: 'En tránsito',
  ARRIBADO: 'Arribado',
  NACIONALIZADO: 'Nacionalizado',
}

/** Phases at/after arrival — read as a completed state (navy badge). */
const ARRIVED_PHASES: ShippingPhase[] = ['ARRIBADO', 'NACIONALIZADO']

/** The normalized input any container type maps into (RB, shared, lane…). */
export interface ContainerPromo {
  productName: string // "Chasis de bus ISUZU" / "Papel higiénico Áladín"
  ownerLabel: string // brand or lane, e.g. "Áladín" / "WGT/01 Maquinaria"
  containerCode: string // "RB01-40HC-001"
  slotsTotal: number
  slotsAvailable: number
  /** Breakdown for the container slice: committed = vendido, reserved =
   *  reservado. When omitted, all taken slots (total − available) show as
   *  vendido. The card draws three states; the copy uses only `slotsAvailable`. */
  slotsCommitted?: number
  slotsReserved?: number
  unitLabel?: string // "cupos" (default) | "slots"
  priceNote?: string // "precio especial mayorista" / a specific note
  specs?: ContainerPromoSpec[] // container's product specs, exhibited
  listingUrl: string // https://wingsglobaltrade.com/…
  routeLabel?: string // "Qingdao → Callao" — derived from the container route
  phase?: ShippingPhase // where the container is (en origen / tránsito / arribado)
  /** Container-fill colour (hex) — the brand accent so each card carries its
   *  own signal. Defaults to Wings gold. Ground + wordmark stay Wings. */
  accent?: string
}

export type PromoVariant = 'whatsapp' | 'ad'

function specsSummary(p: ContainerPromo, max = 3): string {
  const s = (p.specs ?? []).slice(0, max)
  return s.length ? s.map((x) => `${x.label}: ${x.value}`).join(' · ') : ''
}

function unit(p: ContainerPromo): string {
  return p.unitLabel ?? 'cupos'
}

/** "En tránsito · Qingdao → Callao" — phase + route, from the container spec. */
function statusLine(p: ContainerPromo): string {
  const phase = p.phase ? SHIPPING_PHASE_LABELS[p.phase] : ''
  if (phase && p.routeLabel) return `${phase} · ${p.routeLabel}`
  return phase || p.routeLabel || ''
}

/**
 * Shareable copy for the active container. `whatsapp` is the multi-line message a
 * rep sends in their WhatsApp workflow; `ad` is the one-line headline for an ad.
 * The listing URL is always included so the reader can reserve on the site.
 */
export function buildPromoCopy(p: ContainerPromo, variant: PromoVariant = 'whatsapp'): string {
  const specs = specsSummary(p)
  const price = p.priceNote ? ` a ${p.priceNote}` : ' a precio especial'
  const status = statusLine(p)
  if (variant === 'ad') {
    return [
      `${p.productName} al por mayor — ${p.slotsAvailable} ${unit(p)} disponibles en contenedor compartido`,
      status ? ` · ${status}` : '',
      ` · ${p.listingUrl}`,
    ].join('')
  }
  // whatsapp
  const lines = [
    `Contenedor de ${p.productName} disponible: ${p.slotsAvailable} de ${p.slotsTotal} ${unit(p)}.`,
    `Una oportunidad de comprar ${p.productName} al por mayor${price}.`,
    specs ? `Incluye ${specs}.` : '',
    status ? `${status}.` : '',
    `Reserva tu cupo: ${p.listingUrl}`,
  ]
  return lines.filter(Boolean).join('\n')
}

// ── Share card (SVG string) ──────────────────────────────────────────────────

// ── Colour math (so the palette is derived, never invented) ──────────────────
function hxToRgb(h: string): [number, number, number] {
  const s = h.replace('#', '')
  return [0, 2, 4].map((i) => parseInt(s.slice(i, i + 2), 16)) as [number, number, number]
}
function rgbToHex(rgb: number[]): string {
  return '#' + rgb.map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('')
}
/** Flatten `fg` at alpha `a` over opaque `bg` — a provably in-family tint. */
function mix(fg: string, bg: string, a: number): string {
  const F = hxToRgb(fg)
  const B = hxToRgb(bg)
  return rgbToHex(F.map((v, i) => B[i] * (1 - a) + v * a))
}
function _lin(c: number): number {
  const x = c / 255
  return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4
}
function luminance(h: string): number {
  const [r, g, b] = hxToRgb(h)
  return 0.2126 * _lin(r) + 0.7152 * _lin(g) + 0.0722 * _lin(b)
}
/** WCAG contrast ratio between two solid hex colours. */
function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

// The three brand constants — a mirror of packages/liveries/wings/livery.css
// (--livery-warm-white / --livery-navy / --livery-gold). resvg can't read CSS
// custom properties, so these are the single source the card derives from; keep
// them in sync with the livery. Every other card colour is DERIVED from these.
const BRAND = { warmWhite: '#F8F6F0', navy: '#001E50', gold: '#C4933F' }

const CARD = {
  size: 1080,
  bg: BRAND.warmWhite,
  ink: BRAND.navy, // edges, labels, headline
  gold: BRAND.gold, // default container fill
  sub: mix(BRAND.navy, BRAND.warmWhite, 0.55), // secondary text = site's muted rgba(0,30,80,.55), flattened
  line: mix(BRAND.navy, BRAND.warmWhite, 0.2), // hairline divider — a faint navy tint
  tint: mix(BRAND.gold, BRAND.warmWhite, 0.08), // open-bay top face — faint warm paper
}

/** Accent is safe as text only if it clears 4.5:1 on the ground (livery Phase-2
 *  law); otherwise fall back to navy ink. */
function accentText(accent: string): string {
  return contrast(accent, CARD.bg) >= 4.5 ? accent : CARD.ink
}
/** Highest-contrast label colour for text sitting ON a filled shape. */
function onFill(fill: string): string {
  return contrast('#ffffff', fill) >= contrast(CARD.ink, fill) ? '#ffffff' : CARD.ink
}

// Wings brand type system (apps/site/public/fonts, self-hosted): NissanOpti =
// display, Flexo = body, Teko = labels + numerals. Family names match both the
// font files' internal names (for resvg) and the @font-face declarations (for
// the browser preview/canvas). Arial is only the last-ditch fallback.
const FONT_DISPLAY = "'NissanOpti', Arial, sans-serif"
const FONT_BODY = "'Flexo', Arial, sans-serif"
const FONT_LABEL = "'Teko', 'Arial Narrow', Arial, sans-serif"

// Cabinet-projection depth ratios — identical grammar to the ContainerSliceDiagram
// organ (@wings/trade-ui) so the WhatsApp/ad card matches the on-site drawing.
const DX = 40
const DY = 22

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

interface Split {
  committed: number
  reserved: number
  available: number
}

/** Resolve the three states from the promo, clamped so they sum to total. */
function splitSlots(p: ContainerPromo): Split {
  const total = Math.max(0, Math.floor(p.slotsTotal))
  const available = Math.max(0, Math.min(total, Math.floor(p.slotsAvailable)))
  const taken = total - available
  let committed = p.slotsCommitted != null ? Math.max(0, Math.floor(p.slotsCommitted)) : taken
  let reserved = p.slotsReserved != null ? Math.max(0, Math.floor(p.slotsReserved)) : 0
  // Keep committed + reserved === taken (committed wins, reserved fills the rest).
  committed = Math.min(committed, taken)
  reserved = Math.min(reserved, taken - committed)
  return { committed, reserved, available }
}

/**
 * The container drawn as a technical object, sliced into numbered bays — a
 * cabinet projection with three states (vendido solid · reservado hatched ·
 * disponible outline). Pure SVG string; `hatchId` refs a <pattern> in <defs>.
 */
function isoContainer(p: ContainerPromo, x0: number, yTop: number, frontW: number, H: number, hatchId: string): string {
  const accent = p.accent && /^#[0-9a-fA-F]{6}$/.test(p.accent) ? p.accent : CARD.gold
  const total = Math.max(1, Math.floor(p.slotsTotal))
  const { committed, reserved } = splitSlots(p)
  const sliceW = frontW / total
  const yBot = yTop + H

  const stateOf = (i: number): 'committed' | 'reserved' | 'open' =>
    i < committed ? 'committed' : i < committed + reserved ? 'reserved' : 'open'
  const frontFill = (s: string) => (s === 'committed' ? accent : s === 'reserved' ? `url(#${hatchId})` : '#ffffff')
  const topFill = (s: string) => (s === 'committed' ? accent : CARD.tint)

  let slices = ''
  for (let i = 0; i < total; i++) {
    const sx = x0 + i * sliceW
    const s = stateOf(i)
    slices +=
      `<rect data-slot="${s}" x="${sx.toFixed(1)}" y="${yTop}" width="${sliceW.toFixed(1)}" height="${H}" fill="${frontFill(s)}" stroke="${CARD.ink}" stroke-width="1.2"/>` +
      `<polygon points="${sx.toFixed(1)},${yTop} ${(sx + DX).toFixed(1)},${yTop - DY} ${(sx + sliceW + DX).toFixed(1)},${yTop - DY} ${(sx + sliceW).toFixed(1)},${yTop}" fill="${topFill(s)}" stroke="${CARD.ink}" stroke-width="0.9" opacity="0.95"/>` +
      `<text x="${(sx + sliceW / 2).toFixed(1)}" y="${yBot - 16}" text-anchor="middle" font-family="${FONT_LABEL}" font-size="28" font-weight="600" fill="${s === 'committed' ? onFill(accent) : CARD.ink}">${i + 1}</text>`
  }
  // Right end cap (receding face) so it reads as a solid box.
  const cap = `<polygon points="${(x0 + frontW).toFixed(1)},${yTop} ${(x0 + frontW + DX).toFixed(1)},${yTop - DY} ${(x0 + frontW + DX).toFixed(1)},${(yTop - DY + H).toFixed(1)} ${(x0 + frontW).toFixed(1)},${yBot}" fill="${CARD.tint}" stroke="${CARD.ink}" stroke-width="1.2"/>`
  return slices + cap
}

/**
 * Shipment status row: a filled phase badge (En origen / En tránsito / Arribado)
 * followed by the origin → destination route — both from the container spec, so
 * a card always states where the container is and where it is going.
 */
function shipmentStatus(p: ContainerPromo, x: number, y: number): string {
  const phase = p.phase ? SHIPPING_PHASE_LABELS[p.phase] : ''
  const route = p.routeLabel ?? ''
  if (!phase && !route) return ''
  let out = ''
  let cx = x
  if (phase) {
    const bw = phase.length * 13 + 30 // Teko is condensed — tighter than Arial
    // Arrived/nationalized read as completed states (navy); origin/transit use accent.
    const badge = p.phase && ARRIVED_PHASES.includes(p.phase) ? CARD.ink : (p.accent && /^#[0-9a-fA-F]{6}$/.test(p.accent) ? p.accent : CARD.gold)
    out +=
      `<rect x="${cx}" y="${y - 30}" width="${bw}" height="40" fill="${badge}"/>` +
      `<text x="${cx + bw / 2}" y="${y - 2}" text-anchor="middle" font-family="${FONT_LABEL}" font-size="26" font-weight="600" letter-spacing="1" fill="${onFill(badge)}">${esc(phase.toUpperCase())}</text>`
    cx += bw + 20
  }
  if (route) {
    out += `<text x="${cx}" y="${y - 4}" font-family="${FONT_LABEL}" font-size="32" font-weight="600" fill="${CARD.ink}">${esc(route)}</text>`
  }
  return out
}

/** Legend row: vendido (solid) · reservado (hatch) · disponible (outline). */
function legend(p: ContainerPromo, x: number, y: number, hatchId: string): string {
  const accent = p.accent && /^#[0-9a-fA-F]{6}$/.test(p.accent) ? p.accent : CARD.gold
  const sw = 26
  const items: { fill: string; label: string }[] = [
    { fill: accent, label: 'Vendido' },
    { fill: `url(#${hatchId})`, label: 'Reservado' },
    { fill: '#ffffff', label: 'Disponible' },
  ]
  let cx = x
  let out = ''
  for (const it of items) {
    out +=
      `<rect x="${cx}" y="${y - sw + 4}" width="${sw}" height="${sw}" fill="${it.fill}" stroke="${CARD.ink}" stroke-width="1.2"/>` +
      `<text x="${cx + sw + 12}" y="${y}" font-family="${FONT_BODY}" font-size="24" fill="${CARD.ink}">${it.label}</text>`
    cx += sw + 12 + it.label.length * 13 + 40
  }
  return out
}

/**
 * The off-white share card as an SVG string — a template for ANY container:
 * the Wings wordmark, a headline, the container drawn as numbered bays (vendido ·
 * reservado · disponible), the wholesale pitch, and the listing URL. Render
 * inline for preview, or resvg → PNG/JPG for WhatsApp / ads.
 */
export function buildPromoCardSvg(p: ContainerPromo): string {
  const S = CARD.size
  const pad = 72
  const w = S - pad * 2
  const { committed, reserved } = splitSlots(p)
  const taken = committed + reserved
  const specs = specsSummary(p, 4)
  const hatchId = `wgt-hatch-${Math.max(0, Math.floor(p.slotsTotal))}`
  const accent = p.accent && /^#[0-9a-fA-F]{6}$/.test(p.accent) ? p.accent : CARD.gold

  // Container drawing region.
  const yTop = 520
  const H = 210
  const container = isoContainer(p, pad, yTop, w - DX, H, hatchId)

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}" viewBox="0 0 ${S} ${S}">
  <defs>
    <pattern id="${hatchId}" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <rect width="10" height="10" fill="#ffffff"/>
      <line x1="0" y1="0" x2="0" y2="10" stroke="${accent}" stroke-width="3.4" opacity="0.5"/>
    </pattern>
  </defs>
  <rect width="${S}" height="${S}" fill="${CARD.bg}"/>
  <!-- Wings imagotipo (the real mark, inlined) — recoloured to brand navy for
       one owned blue on the card -->
  ${wingsLogo(pad, pad - 10, 78, CARD.ink)}
  <text x="${S - pad}" y="${pad + 46}" text-anchor="end" font-family="${FONT_LABEL}" font-size="24" font-weight="500" fill="${CARD.sub}">${esc(p.ownerLabel)} · ${esc(p.containerCode)}</text>
  <line x1="${pad}" y1="${pad + 84}" x2="${S - pad}" y2="${pad + 84}" stroke="${CARD.ink}" stroke-width="2"/>

  <!-- headline -->
  <text x="${pad}" y="238" font-family="${FONT_DISPLAY}" font-size="66" font-weight="400" fill="${CARD.ink}">Contenedor de</text>
  <text x="${pad}" y="313" font-family="${FONT_DISPLAY}" font-size="66" font-weight="400" fill="${CARD.ink}">${esc(p.productName)}</text>

  <!-- slot count -->
  <text x="${pad}" y="402" font-family="${FONT_LABEL}" font-size="46" font-weight="600" fill="${accentText(accent)}">${p.slotsAvailable} de ${p.slotsTotal} ${esc(unit(p))} disponibles</text>

  <!-- shipment status: phase badge + origin → destination (from the spec) -->
  ${shipmentStatus(p, pad, 462)}

  <!-- container drawing -->
  ${container}

  <!-- legend -->
  ${legend(p, pad, yTop + H + 62, hatchId)}

  <!-- pitch + specs + url -->
  <text x="${pad}" y="${S - 190}" font-family="${FONT_BODY}" font-size="30" font-weight="500" fill="${CARD.ink}">Compra al por mayor${p.priceNote ? ' · ' + esc(p.priceNote) : ' a precio especial'}</text>
  ${specs ? `<text x="${pad}" y="${S - 150}" font-family="${FONT_BODY}" font-size="24" fill="${CARD.sub}">${esc(specs)}</text>` : ''}
  <rect x="${pad}" y="${S - 118}" width="${w}" height="2" fill="${CARD.line}"/>
  <text x="${pad}" y="${S - 72}" font-family="${FONT_BODY}" font-size="26" font-weight="700" fill="${CARD.ink}">${esc(p.listingUrl)}</text>
  <desc>taken:${taken} committed:${committed} reserved:${reserved} available:${p.slotsAvailable}</desc>
</svg>`
}
