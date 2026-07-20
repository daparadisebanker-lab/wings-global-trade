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
export type ShippingPhase = 'EN_ORIGEN' | 'EN_TRANSITO' | 'ARRIBADO'

export const SHIPPING_PHASE_LABELS: Record<ShippingPhase, string> = {
  EN_ORIGEN: 'En origen',
  EN_TRANSITO: 'En tránsito',
  ARRIBADO: 'Arribado',
}

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

const CARD = {
  size: 1080,
  bg: '#F8F6F0', // Wings warm-white / off-white
  ink: '#001E50', // Wings navy — edges, labels, wordmark
  gold: '#C4933F', // Wings gold — default container fill
  muted: '#D8D3C6', // dividers
  sub: '#5A6472',
  tint: '#ECE6DA', // top-face tint for open bays
}

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
      `<text x="${(sx + sliceW / 2).toFixed(1)}" y="${yBot - 16}" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" font-weight="700" fill="${s === 'committed' ? '#ffffff' : CARD.ink}">${i + 1}</text>`
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
    const bw = phase.length * 15 + 32
    // Arrived reads as a completed state (navy); in-transit/origin use the accent.
    const badge = p.phase === 'ARRIBADO' ? CARD.ink : (p.accent && /^#[0-9a-fA-F]{6}$/.test(p.accent) ? p.accent : CARD.gold)
    out +=
      `<rect x="${cx}" y="${y - 30}" width="${bw}" height="40" fill="${badge}"/>` +
      `<text x="${cx + bw / 2}" y="${y - 2}" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" font-weight="700" letter-spacing="1" fill="#ffffff">${esc(phase.toUpperCase())}</text>`
    cx += bw + 20
  }
  if (route) {
    out += `<text x="${cx}" y="${y - 4}" font-family="Arial, sans-serif" font-size="30" font-weight="700" fill="${CARD.ink}">${esc(route)}</text>`
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
      `<text x="${cx + sw + 12}" y="${y}" font-family="Arial, sans-serif" font-size="24" fill="${CARD.ink}">${it.label}</text>`
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
  <!-- Wings imagotipo (the real mark, inlined) -->
  ${wingsLogo(pad, pad - 6, 62)}
  <text x="${S - pad}" y="${pad + 34}" text-anchor="end" font-family="Arial, sans-serif" font-size="20" fill="${CARD.sub}">${esc(p.ownerLabel)} · ${esc(p.containerCode)}</text>
  <line x1="${pad}" y1="${pad + 70}" x2="${S - pad}" y2="${pad + 70}" stroke="${CARD.ink}" stroke-width="2"/>

  <!-- headline -->
  <text x="${pad}" y="240" font-family="Arial, sans-serif" font-size="64" font-weight="800" fill="${CARD.ink}">Contenedor de</text>
  <text x="${pad}" y="315" font-family="Arial, sans-serif" font-size="64" font-weight="800" fill="${CARD.ink}">${esc(p.productName)}</text>

  <!-- slot count -->
  <text x="${pad}" y="400" font-family="Arial, sans-serif" font-size="40" font-weight="700" fill="${accent}">${p.slotsAvailable} de ${p.slotsTotal} ${esc(unit(p))} disponibles</text>

  <!-- shipment status: phase badge + origin → destination (from the spec) -->
  ${shipmentStatus(p, pad, 462)}

  <!-- container drawing -->
  ${container}

  <!-- legend -->
  ${legend(p, pad, yTop + H + 62, hatchId)}

  <!-- pitch + specs + url -->
  <text x="${pad}" y="${S - 190}" font-family="Arial, sans-serif" font-size="30" fill="${CARD.ink}">Compra al por mayor${p.priceNote ? ' · ' + esc(p.priceNote) : ' a precio especial'}</text>
  ${specs ? `<text x="${pad}" y="${S - 150}" font-family="Arial, sans-serif" font-size="24" fill="${CARD.sub}">${esc(specs)}</text>` : ''}
  <rect x="${pad}" y="${S - 118}" width="${w}" height="2" fill="${CARD.muted}"/>
  <text x="${pad}" y="${S - 72}" font-family="Arial, sans-serif" font-size="26" font-weight="700" fill="${CARD.ink}">${esc(p.listingUrl)}</text>
  <desc>taken:${taken} committed:${committed} reserved:${reserved} available:${p.slotsAvailable}</desc>
</svg>`
}
