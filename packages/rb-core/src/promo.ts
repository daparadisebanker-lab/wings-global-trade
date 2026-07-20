// @wings/rb-core · promo.ts
// The container-promotion library (container-generic — "a template for all and
// any kind of container"). Pure + framework-agnostic: given a normalized
// ContainerPromo, it produces (1) shareable COPY in variants (WhatsApp, ad) and
// (2) the SHARE-CARD SVG (off-white, a slot visualization, the Wings wordmark,
// the listing URL). The SVG is a string so any app can render it inline or pipe
// it to resvg → PNG/JPG. Copy honors the site law: Spanish, no exclamation marks,
// technical and direct.

export interface ContainerPromoSpec {
  label: string
  value: string
}

/** The normalized input any container type maps into (RB, shared, lane…). */
export interface ContainerPromo {
  productName: string // "Chasis de bus ISUZU" / "Papel higiénico Áladín"
  ownerLabel: string // brand or lane, e.g. "Áladín" / "WGT/01 Maquinaria"
  containerCode: string // "RB01-40HC-001"
  slotsTotal: number
  slotsAvailable: number
  unitLabel?: string // "cupos" (default) | "slots"
  priceNote?: string // "precio especial mayorista" / a specific note
  specs?: ContainerPromoSpec[] // container's product specs, exhibited
  listingUrl: string // https://wingsglobaltrade.com/…
  routeLabel?: string // "China → Callao"
}

export type PromoVariant = 'whatsapp' | 'ad'

function specsSummary(p: ContainerPromo, max = 3): string {
  const s = (p.specs ?? []).slice(0, max)
  return s.length ? s.map((x) => `${x.label}: ${x.value}`).join(' · ') : ''
}

function unit(p: ContainerPromo): string {
  return p.unitLabel ?? 'cupos'
}

/**
 * Shareable copy for the active container. `whatsapp` is the multi-line message a
 * rep sends in their WhatsApp workflow; `ad` is the one-line headline for an ad.
 * The listing URL is always included so the reader can reserve on the site.
 */
export function buildPromoCopy(p: ContainerPromo, variant: PromoVariant = 'whatsapp'): string {
  const specs = specsSummary(p)
  const price = p.priceNote ? ` a ${p.priceNote}` : ' a precio especial'
  if (variant === 'ad') {
    return [
      `${p.productName} al por mayor — ${p.slotsAvailable} ${unit(p)} disponibles en contenedor compartido`,
      p.routeLabel ? ` · ${p.routeLabel}` : '',
      ` · ${p.listingUrl}`,
    ].join('')
  }
  // whatsapp
  const lines = [
    `Contenedor de ${p.productName} disponible: ${p.slotsAvailable} de ${p.slotsTotal} ${unit(p)}.`,
    `Una oportunidad de comprar ${p.productName} al por mayor${price}.`,
    specs ? `Incluye ${specs}.` : '',
    p.routeLabel ? `Ruta ${p.routeLabel}.` : '',
    `Reserva tu cupo: ${p.listingUrl}`,
  ]
  return lines.filter(Boolean).join('\n')
}

// ── Share card (SVG string) ──────────────────────────────────────────────────

const CARD = {
  size: 1080,
  bg: '#F8F6F0', // Wings warm-white / off-white
  ink: '#001E50', // Wings navy
  gold: '#C4933F', // Wings gold — available slots
  muted: '#D8D3C6', // taken slots
  sub: '#5A6472',
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

/** A grid of slot cells: available (gold) + taken (muted), laid out in rows. */
function slotGrid(total: number, available: number, x: number, y: number, w: number): string {
  const n = Math.max(1, Math.min(total, 120)) // cap for absurd inputs
  const perRow = Math.min(n, Math.ceil(Math.sqrt(n) * 1.6))
  const cols = Math.max(1, perRow)
  const gap = 14
  const cell = Math.floor((w - gap * (cols - 1)) / cols)
  const takenFrom = n - Math.max(0, Math.min(available, n)) // first `taken` cells muted
  let out = ''
  for (let i = 0; i < n; i++) {
    const r = Math.floor(i / cols)
    const c = i % cols
    const cx = x + c * (cell + gap)
    const cy = y + r * (cell + gap)
    const fill = i < takenFrom ? CARD.muted : CARD.gold
    out += `<rect x="${cx}" y="${cy}" width="${cell}" height="${cell}" rx="2" fill="${fill}"/>`
  }
  return out
}

/**
 * The off-white share card as an SVG string — a template for ANY container:
 * the Wings wordmark, a headline, the slot visualization (how many are in the
 * container), the wholesale pitch, and the listing URL. Render inline for
 * preview, or resvg → PNG/JPG for WhatsApp / ads.
 */
export function buildPromoCardSvg(p: ContainerPromo): string {
  const S = CARD.size
  const pad = 72
  const w = S - pad * 2
  const taken = Math.max(0, p.slotsTotal - p.slotsAvailable)
  const grid = slotGrid(p.slotsTotal, p.slotsAvailable, pad, 470, w)
  const specs = specsSummary(p, 4)

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}" viewBox="0 0 ${S} ${S}">
  <rect width="${S}" height="${S}" fill="${CARD.bg}"/>
  <!-- wordmark -->
  <text x="${pad}" y="${pad + 24}" font-family="Arial, sans-serif" font-size="30" font-weight="700" letter-spacing="2" fill="${CARD.ink}">WINGS GLOBAL TRADE</text>
  <text x="${S - pad}" y="${pad + 24}" text-anchor="end" font-family="Arial, sans-serif" font-size="20" fill="${CARD.sub}">${esc(p.ownerLabel)} · ${esc(p.containerCode)}</text>
  <line x1="${pad}" y1="${pad + 44}" x2="${S - pad}" y2="${pad + 44}" stroke="${CARD.ink}" stroke-width="2"/>

  <!-- headline -->
  <text x="${pad}" y="240" font-family="Arial, sans-serif" font-size="64" font-weight="800" fill="${CARD.ink}">Contenedor de</text>
  <text x="${pad}" y="315" font-family="Arial, sans-serif" font-size="64" font-weight="800" fill="${CARD.ink}">${esc(p.productName)}</text>

  <!-- slot count -->
  <text x="${pad}" y="410" font-family="Arial, sans-serif" font-size="40" font-weight="700" fill="${CARD.gold}">${p.slotsAvailable} de ${p.slotsTotal} ${esc(unit(p))} disponibles</text>

  <!-- slot grid -->
  ${grid}

  <!-- pitch + specs + url -->
  <text x="${pad}" y="${S - 190}" font-family="Arial, sans-serif" font-size="30" fill="${CARD.ink}">Compra al por mayor${p.priceNote ? ' · ' + esc(p.priceNote) : ' a precio especial'}</text>
  ${specs ? `<text x="${pad}" y="${S - 150}" font-family="Arial, sans-serif" font-size="24" fill="${CARD.sub}">${esc(specs)}</text>` : ''}
  <rect x="${pad}" y="${S - 118}" width="${w}" height="2" fill="${CARD.muted}"/>
  <text x="${pad}" y="${S - 72}" font-family="Arial, sans-serif" font-size="26" font-weight="700" fill="${CARD.ink}">${esc(p.listingUrl)}</text>
  ${p.routeLabel ? `<text x="${S - pad}" y="${S - 72}" text-anchor="end" font-family="Arial, sans-serif" font-size="24" fill="${CARD.sub}">${esc(p.routeLabel)}</text>` : ''}
  <desc>taken:${taken} available:${p.slotsAvailable}</desc>
</svg>`
}
