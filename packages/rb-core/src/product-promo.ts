// @wings/rb-core · product-promo.ts
// The PRODUCT-promotion library — the counterpart to promo.ts (containers). Given
// a normalized ProductPromo it produces (1) shareable COPY in the same variants
// (whatsapp · ad · marketing · clients) and (2) a SHARE-CARD SVG that is
// spec-forward (numbers as brand assets, per root CLAUDE.md §1.5) with an OPTIONAL
// product image. Two purposes, one voice:
//   · a listed catalog product (Catálogo) — promote what's on our listings
//   · a TRIAL product (Prueba) — a "sondeo de mercado": test demand with a few
//     leads WITHOUT publishing to the site. Stamped as a muestra so it never
//     masquerades as a live listing.
// Copy honors the site law: Spanish, no exclamation marks, technical, wholesale.
import { wingsLogo } from './wings-logo'
import {
  CARD,
  FONT_DISPLAY,
  FONT_BODY,
  FONT_LABEL,
  accentText,
  onFill,
  safeAccent,
  esc,
} from './card-kit'
import type { PromoVariant, PromoAudience } from './promo'

export interface ProductPromoSpec {
  label: string
  value: string
}

/** The normalized input any product (lane catalog, RB shelf, or ad-hoc trial)
 *  maps into for copy + card. Every field but productName is optional so a
 *  spec-light product still renders. */
export interface ProductPromo {
  productName: string
  ownerLabel?: string // brand or lane, e.g. "Áladín" / "WGT/01 Maquinaria"
  category?: string // top-level category, e.g. "Maquinaria"
  specs?: ProductPromoSpec[] // exhibited specs — numbers as assets
  priceNote?: string // rep-authored, optional ("precio de campaña")
  moq?: string // exhibited MOQ line, e.g. "100 unidades"
  unitLabel?: string // "unidad" default
  listingUrl?: string // OMITTED when there is no live listing page
  accent?: string // brand accent hex — the one owned signal
  imageHref?: string // OPTIONAL data:image/... URL (a Prueba upload)
  /** A market probe, not a listing — stamps the card as a muestra and shifts the
   *  copy to "estamos evaluando disponibilidad" framing. */
  trial?: boolean
}

/** Audience closing text for the product share (parallels promo.ts). Trial gets a
 *  probe-framed close; a listed product gets a wholesale CTA. */
const END_TEXT: Record<PromoAudience, { listed: string; trial: string }> = {
  marketing: {
    listed: 'Uso interno · equipo de marketing: adaptar a pieza de anuncio y coordinar la difusión.',
    trial: 'Uso interno · equipo de marketing: sondeo de demanda, aún sin listar. Medir interés antes de publicar.',
  },
  clients: {
    listed: 'Escríbenos para coordinar tu compra al por mayor y confirmar disponibilidad.',
    trial: 'Estamos evaluando disponibilidad al por mayor. Escríbenos si te interesa para dimensionar el pedido.',
  },
}

function unit(p: ProductPromo): string {
  return p.unitLabel ?? 'unidad'
}

function specsSummary(p: ProductPromo, max = 3): string {
  const s = (p.specs ?? []).slice(0, max)
  return s.length ? s.map((x) => `${x.label}: ${x.value}`).join(' · ') : ''
}

/** The one-line ad-script body — shared verbatim by ad / marketing / clients so
 *  the audiences differ only by the appended end-text. Trial reframes the lead. */
function adScriptBody(p: ProductPromo): string {
  const cat = p.category ? ` · ${p.category}` : ''
  const specs = specsSummary(p)
  const lead = p.trial
    ? `${p.productName} — evaluando disponibilidad al por mayor${cat}`
    : `${p.productName} al por mayor${cat}`
  return [lead, specs ? ` — ${specs}` : '', p.listingUrl ? ` · ${p.listingUrl}` : ''].join('')
}

/**
 * Shareable copy for a product. `whatsapp` is the multi-line message a rep sends
 * in their workflow; `ad` is the one-line headline; `marketing` / `clients` reuse
 * the ad-script body and append an audience-specific end-text.
 */
export function buildProductPromoCopy(p: ProductPromo, variant: PromoVariant = 'whatsapp'): string {
  if (variant === 'ad') return adScriptBody(p)
  if (variant === 'marketing' || variant === 'clients') {
    return `${adScriptBody(p)}\n${p.trial ? END_TEXT[variant].trial : END_TEXT[variant].listed}`
  }
  // whatsapp — multi-line
  const specs = specsSummary(p, 4)
  const price = p.priceNote ? ` a ${p.priceNote}` : ''
  const moq = p.moq ? `Pedido mínimo: ${p.moq}.` : ''
  const lines = p.trial
    ? [
        `Estamos evaluando ${p.productName} al por mayor${p.category ? ` (${p.category})` : ''}.`,
        `Aún no está en el catálogo; queremos medir el interés antes de listarlo.`,
        specs ? `Referencia: ${specs}.` : '',
        moq,
        `Escríbenos si te interesa para dimensionar el pedido.`,
      ]
    : [
        `${p.productName} disponible al por mayor${price}.`,
        p.category ? `Categoría: ${p.category}.` : '',
        specs ? `Incluye ${specs}.` : '',
        moq,
        p.listingUrl ? `Más detalle: ${p.listingUrl}` : 'Escríbenos para coordinar tu compra al por mayor.',
      ]
  return lines.filter(Boolean).join('\n')
}

// ── Share card (SVG string) ──────────────────────────────────────────────────

/** Greedy word-wrap to at most `maxLines` lines of ~`maxChars`, ellipsizing the
 *  overflow. SVG <text> doesn't wrap, so headings are wrapped here. */
function wrapText(s: string, maxChars: number, maxLines: number): string[] {
  const words = s.split(/\s+/).filter(Boolean)
  const lines: string[] = []
  let cur = ''
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w
    if (next.length <= maxChars) {
      cur = next
    } else {
      if (cur) lines.push(cur)
      cur = w
      if (lines.length === maxLines - 1) break
    }
  }
  if (cur && lines.length < maxLines) lines.push(cur)
  if (lines.length === maxLines) {
    // Ellipsize the last line if there's still text left over.
    const used = lines.join(' ').length
    if (used < s.length) {
      let last = lines[maxLines - 1]
      while (last.length > 1 && last.length > maxChars - 1) last = last.slice(0, -1)
      lines[maxLines - 1] = `${last.replace(/[\s·]+$/, '')}…`
    }
  }
  return lines.length ? lines : ['']
}

// Only a base64 raster data URL is embeddable: never an arbitrary href (no
// external fetch), never a non-base64 data URL (whose body could carry a `"` and
// break out of the SVG attribute), and never svg+xml (no nested markup). The
// base64 alphabet contains no quote, so the attribute is safe unescaped.
const IMAGE_DATA_RE = /^data:image\/(png|jpe?g|webp);base64,[A-Za-z0-9+/=]+$/i

/** A safe, embeddable base64 raster data URL, or null. */
function safeImage(href?: string): string | null {
  return href && IMAGE_DATA_RE.test(href) ? href : null
}

/**
 * The off-white product share card as an SVG string. Spec-forward: the Wings
 * wordmark, a headline, an OPTIONAL product image, the exhibited spec table, the
 * MOQ / price note, and (only when present) a listing URL. A trial product wears
 * a "Muestra — sondeo" stamp so it is never mistaken for a live listing. Render
 * inline for preview, or rasterize (canvas / resvg) → PNG/JPG for WhatsApp / ads.
 */
export function buildProductPromoCardSvg(p: ProductPromo): string {
  const S = CARD.size
  const pad = 72
  const w = S - pad * 2
  const accent = safeAccent(p.accent)
  const img = safeImage(p.imageHref)
  const specs = (p.specs ?? []).slice(0, 6)

  // Header: wordmark + owner/category + hairline.
  const ownerBits = [p.ownerLabel, p.category].filter(Boolean).map((s) => esc(s as string)).join(' · ')
  const header =
    `${wingsLogo(pad, pad - 10, 78, CARD.ink)}` +
    (ownerBits
      ? `<text x="${S - pad}" y="${pad + 46}" text-anchor="end" font-family="${FONT_LABEL}" font-size="24" font-weight="500" fill="${CARD.sub}">${ownerBits}</text>`
      : '') +
    `<line x1="${pad}" y1="${pad + 84}" x2="${S - pad}" y2="${pad + 84}" stroke="${CARD.ink}" stroke-width="2"/>`

  // Trial stamp (a muestra badge) — honest that this is not a listing.
  const stamp = p.trial
    ? `<rect x="${pad}" y="212" width="330" height="42" fill="${CARD.ink}"/>` +
      `<text x="${pad + 165}" y="242" text-anchor="middle" font-family="${FONT_LABEL}" font-size="26" font-weight="600" letter-spacing="1.5" fill="${onFill(CARD.ink)}">MUESTRA · SONDEO</text>`
    : ''
  const headTop = p.trial ? 340 : 300

  // Headline — wrapped to 2 lines. Narrower budget when an image occupies the right.
  const headMax = img ? 16 : 24
  const headLines = wrapText(p.productName, headMax, 2)
  const headline = headLines
    .map((ln, i) => `<text x="${pad}" y="${headTop + i * 72}" font-family="${FONT_DISPLAY}" font-size="60" font-weight="400" fill="${CARD.ink}">${esc(ln)}</text>`)
    .join('')
  const headBottom = headTop + (headLines.length - 1) * 72

  // Optional product image — a framed square on the right.
  const imgSize = 360
  const imgX = S - pad - imgSize
  const imgY = 300
  const clipId = 'wgt-prod-clip'
  const image = img
    ? `<clipPath id="${clipId}"><rect x="${imgX}" y="${imgY}" width="${imgSize}" height="${imgSize}" rx="8"/></clipPath>` +
      `<image href="${img}" x="${imgX}" y="${imgY}" width="${imgSize}" height="${imgSize}" preserveAspectRatio="xMidYMid slice" clip-path="url(#${clipId})"/>` +
      `<rect x="${imgX}" y="${imgY}" width="${imgSize}" height="${imgSize}" rx="8" fill="none" stroke="${CARD.ink}" stroke-width="2"/>`
    : ''

  // Spec table — the hero when there's no photo. Left column, one row per spec.
  const specTop = Math.max(headBottom + 96, 520)
  const specColW = img ? imgX - pad - 24 : w
  const specRows = specs
    .map((s, i) => {
      const y = specTop + i * 58
      return (
        `<text x="${pad}" y="${y}" font-family="${FONT_LABEL}" font-size="26" font-weight="500" letter-spacing="0.5" fill="${CARD.sub}">${esc(s.label.toUpperCase())}</text>` +
        `<text x="${pad + Math.min(300, specColW * 0.42)}" y="${y}" font-family="${FONT_BODY}" font-size="30" font-weight="600" fill="${CARD.ink}">${esc(s.value)}</text>` +
        `<line x1="${pad}" y1="${y + 16}" x2="${pad + specColW}" y2="${y + 16}" stroke="${CARD.line}" stroke-width="1"/>`
      )
    })
    .join('')

  // Footer — price note / MOQ, then the pitch, then a listing URL or a contact line.
  const priceLine = p.priceNote
    ? `Al por mayor · ${esc(p.priceNote)}`
    : p.trial
      ? 'Al por mayor · sondeo de disponibilidad'
      : 'Compra al por mayor'
  const moqLine = p.moq ? `Pedido mínimo: ${esc(p.moq)} ${esc(unit(p))}s` : ''
  const closeLine = p.listingUrl
    ? esc(p.listingUrl)
    : p.trial
      ? 'Escríbenos para evaluar el pedido — wingsglobaltrade.com'
      : 'Escríbenos para coordinar — wingsglobaltrade.com'

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}" viewBox="0 0 ${S} ${S}">
  <rect width="${S}" height="${S}" fill="${CARD.bg}"/>
  ${header}
  ${stamp}
  ${headline}
  ${image}
  <text x="${pad}" y="${specTop - 40}" font-family="${FONT_LABEL}" font-size="30" font-weight="600" fill="${accentText(accent)}">Especificaciones</text>
  ${specRows}
  <text x="${pad}" y="${S - 190}" font-family="${FONT_BODY}" font-size="30" font-weight="500" fill="${CARD.ink}">${priceLine}</text>
  ${moqLine ? `<text x="${pad}" y="${S - 150}" font-family="${FONT_BODY}" font-size="24" fill="${CARD.sub}">${moqLine}</text>` : ''}
  <rect x="${pad}" y="${S - 118}" width="${w}" height="2" fill="${CARD.line}"/>
  <text x="${pad}" y="${S - 72}" font-family="${FONT_BODY}" font-size="26" font-weight="700" fill="${CARD.ink}">${closeLine}</text>
</svg>`
}
