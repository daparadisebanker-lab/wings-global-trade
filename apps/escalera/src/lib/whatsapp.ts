// La Escalera · Rung 3 — the message that makes "respuesta en 24h" mean something.
//
// Spec: "a supplier who receives '620 m² of X = 431 cartons ≈ 12,100 kg' can
// reply with a price, not with questions." So the arithmetic travels WITH the
// request. Every line carries what was asked for, what that rounds up to, and
// what it weighs — and the assumptions are declared rather than buried.

import { fmtInt, fmtKg, fmtM2, fmtPct } from '@/lib/packing'
import { ASSUMED_PALLET_NOTE, WEIGHT_NOTE, type Quote } from '@/lib/quote'
import { formatChip } from '@/types/tile'

/**
 * The supplier's WhatsApp number in international format, digits only
 * (e.g. 5076025xxxx). Left unset by default: with no number, wa.me opens the
 * composer and the buyer picks the chat, which is correct until a real supplier
 * line is configured. Never guess a number here — a quote sent to the wrong
 * chat is worse than one the buyer has to address themselves.
 */
const SUPPLIER = (process.env.NEXT_PUBLIC_SUPPLIER_WHATSAPP ?? '').replace(/\D/g, '')

export function quoteMessage(quote: Quote, dateISO: string): string {
  const L: string[] = []
  const { buyer, pricedLines, totals, fill } = quote

  L.push('SOLICITUD DE COTIZACIÓN — Azulejos')
  const who = [buyer.company, buyer.name].filter(Boolean).join(' · ')
  if (who) L.push(who)
  if (buyer.project) L.push(`Proyecto: ${buyer.project}`)
  L.push(dateISO)
  L.push('')

  if (pricedLines.length === 0) {
    // A record with no quantities is still a real request — send the shortlist.
    L.push('Piezas de interés (sin cantidades todavía):')
    quote.lines.forEach((l, i) => {
      L.push(`${i + 1}. ${l.tile.code} · ${formatChip(l.tile)} mm · ${l.tile.finish}`)
    })
    L.push('')
    L.push('Agradezco precio por m² y disponibilidad.')
    return L.join('\n')
  }

  pricedLines.forEach((l, i) => {
    const { tile, entry, totals: t } = l
    L.push(`${i + 1}. ${tile.code} · ${formatChip(tile)} mm · ${tile.finish}`)
    const scope = entry.room ? `${entry.room}: ` : ''
    L.push(`   ${scope}${fmtM2(t.requestedM2)} m² + ${entry.wastePct}% = ${fmtM2(t.withWasteM2)} m²`)
    L.push(
      `   = ${fmtInt(t.cartons)} cajas (${fmtM2(tile.packing.m2_per_carton)} m²/caja)` +
        ` · ${fmtM2(t.suppliedM2)} m² · ${fmtKg(t.kg)} kg`,
    )
    if (entry.note) L.push(`   Nota: ${entry.note}`)
    L.push('')
  })

  L.push('TOTALES')
  L.push(`Cajas: ${fmtInt(totals.cartons)}`)
  L.push(`Superficie: ${fmtM2(totals.suppliedM2)} m²`)
  L.push(`Peso bruto: ${fmtKg(totals.kg)} kg`)
  L.push(`Pallets: ${fmtInt(totals.pallets)}`)
  L.push('')
  L.push(
    `Contenedor ${fill.label}: ${fmtKg(totals.kg)} kg de ${fmtKg(fill.payloadKg)} kg` +
      ` (${fmtPct(fill.fillPct)}%)` +
      (fill.containersNeeded > 1 ? ` — requiere ${fill.containersNeeded} contenedores` : ''),
  )
  L.push(WEIGHT_NOTE)
  L.push('')
  if (quote.hasAssumedPacking) L.push(ASSUMED_PALLET_NOTE)
  L.push(`Reglas de cálculo: ${quote.rulesVersion}`)
  L.push('')
  L.push('Agradezco precio por m² (FOB y CIF) y tiempo de producción.')

  return L.join('\n')
}

/** wa.me link. Without a configured supplier the buyer chooses the chat. */
export function whatsappHref(message: string): string {
  const text = encodeURIComponent(message)
  return SUPPLIER ? `https://wa.me/${SUPPLIER}?text=${text}` : `https://wa.me/?text=${text}`
}
