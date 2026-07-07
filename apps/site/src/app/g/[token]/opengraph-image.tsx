// Dynamic OG image for the invite landing (spec §4.2-A: "the link unfurls in
// WhatsApp showing the fill meter image, route, and price — the preview card
// does half the selling before the tap"). Fill state is baked in and, because
// the route is force-dynamic, regenerated whenever slots change. Satori can't
// read our CSS tokens, so the FillMeter look is reproduced here with hex values
// (kept in sync with globals.css: gold #C4933F, navy #001E50, paper #FAF9F6).

import { ImageResponse } from 'next/og'
import { resolveInvite } from '@/lib/container/access'

export const alt = 'Contenedor compartido — Wings Global Trade'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const GOLD = '#C4933F'
const NAVY = '#001E50'
const PAPER = '#F5F1E9'
const MUTED = 'rgba(0,30,80,0.55)'

export default async function Image({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const res = await resolveInvite(token)

  // Fallback card if the invite can't be resolved.
  if (!res.ok) {
    return new ImageResponse(
      (
        <div style={{ ...fill, background: NAVY, color: 'white', fontSize: 44 }}>
          Contenedor compartido · Wings Global Trade
        </div>
      ),
      { ...size },
    )
  }

  const p = res.preview
  const total = p.slots.total
  const segments = Array.from({ length: total }, (_, i) => {
    if (i < p.slots.committed) return 'committed'
    if (i < p.slots.committed + p.slots.reserved) return 'reserved'
    return 'open'
  })
  const priceStr = p.slotPriceUsd.toLocaleString('en-US', { maximumFractionDigits: 0 })

  return new ImageResponse(
    (
      <div
        style={{
          ...fill,
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          gap: 34,
          padding: 80,
          background: PAPER,
        }}
      >
        {p.leadName && (
          <div style={{ fontSize: 30, color: MUTED }}>
            <span style={{ color: NAVY, fontWeight: 700 }}>{p.leadName}</span> te invita a su contenedor
          </div>
        )}

        <div style={{ fontSize: 40, color: NAVY, letterSpacing: -1 }}>
          {p.routeOrigin} → {p.routeDestination}
        </div>

        {/* FillMeter, inline reimplementation */}
        <div style={{ display: 'flex', width: '100%', gap: 4, height: 90, padding: 6, border: `2px solid ${GOLD}`, background: '#FFFFFF' }}>
          {segments.map((s, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                flex: 1,
                background: s === 'committed' ? GOLD : s === 'reserved' ? 'rgba(196,147,63,0.35)' : 'transparent',
                border: s === 'open' ? `2px dashed ${GOLD}` : s === 'reserved' ? `1px solid ${GOLD}` : 'none',
              }}
            />
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: 16 }}>
          <div style={{ fontSize: 76, fontWeight: 700, color: NAVY, letterSpacing: -2 }}>${priceStr}</div>
          <div style={{ fontSize: 30, color: MUTED }}>todo incluido por cupo</div>
        </div>

        <div style={{ display: 'flex', gap: 24, fontSize: 26, color: MUTED }}>
          <span>{p.slots.open} de {total} cupos disponibles</span>
          <span style={{ color: GOLD, fontWeight: 600, letterSpacing: 3 }}>OIGA, MISTER</span>
        </div>
      </div>
    ),
    { ...size },
  )
}

const fill = {
  width: '100%',
  height: '100%',
  display: 'flex',
} as const
