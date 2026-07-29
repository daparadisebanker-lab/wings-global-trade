// El Pasillo · §4.12 — what leaves the app.
//
// Two send actions of equal weight, WhatsApp and email, because a buyer's
// counterpart uses one or the other and the tool does not get to choose. Both
// carry the same body: every line with its quantity resolved to whole cartons,
// then the container load.
//
// The arithmetic travels WITH the request. A supplier who receives
// "56,70 m² = 42 cajas ≈ 1.050 kg" can reply with a price; one who receives a
// list of codes replies with questions, and the 24-hour promise dies there.

import { finishLabel, getSeries, getSku } from '@/pasillo/lib/catalogue'
import {
  PACKING_RULES_VERSION,
  containerFill,
  fmtFcl,
  fmtInt,
  fmtKg,
  fmtM2,
  lineTotals,
  sumTotals,
  type ContainerKind,
  type Quantity,
} from '@/pasillo/lib/packing'
import type { Buyer, Folder } from '@/pasillo/lib/record'

export interface RequestInput {
  folders: readonly Folder[]
  qty: Readonly<Record<string, Quantity>>
  notes: Readonly<Record<string, string>>
  buyer: Buyer
  kind: ContainerKind
  dateISO: string
}

export function requestBody({ folders, qty, notes, buyer, kind, dateISO }: RequestInput): string {
  const L: string[] = []
  L.push('SOLICITUD DE COTIZACIÓN — Azulejos')
  const who = [buyer.company, buyer.name].filter(Boolean).join(' · ')
  if (who) L.push(who)
  if (buyer.project) L.push(`Proyecto: ${buyer.project}`)
  const terms = [buyer.incoterm, buyer.port].filter(Boolean).join(' ')
  if (terms) L.push(`Términos: ${terms}`)
  if (buyer.target) L.push(`Fecha objetivo: ${buyer.target}`)
  L.push(dateISO)
  L.push('')

  const lines: ReturnType<typeof lineTotals>[] = []
  let n = 0

  for (const folder of folders) {
    const series = getSeries(folder.series_uid)
    if (!series || folder.selected.length === 0) continue
    L.push(
      `${series.name_raw} — ${series.format_mm[0]}×${series.format_mm[1]}×${series.thickness_mm}mm` +
        ` · ${series.pcs_per_ctn} PCS/CTN · ${series.kgs_per_ctn} KGS/CTN` +
        ` · ${series.m2_per_ctn.toFixed(2)} m²/caja`,
    )
    for (const uid of folder.selected) {
      const sku = getSku(uid)
      if (!sku) continue
      n += 1
      const t = lineTotals(qty[uid], series)
      lines.push(t)
      const head = `  ${n}. ${sku.code} · ${finishLabel(sku)}`
      if (t.cartons > 0) {
        L.push(`${head} — ${fmtInt(t.cartons)} cajas · ${fmtM2(t.m2)} m² · ${fmtKg(t.kg)} kg`)
      } else {
        L.push(`${head} — cantidad por definir`)
      }
      const note = notes[uid]
      if (note) L.push(`     Nota: ${note}`)
    }
    L.push('')
  }

  const totals = sumTotals(lines)
  if (totals.cartons > 0) {
    const fill = containerFill(totals.kg, kind)
    L.push('TOTALES')
    L.push(`SKU: ${fmtInt(totals.skus)}`)
    L.push(`Cajas: ${fmtInt(totals.cartons)}`)
    L.push(`Superficie: ${fmtM2(totals.m2)} m²`)
    L.push(`Peso bruto: ${fmtKg(totals.kg)} kg`)
    L.push(
      `Contenedor: ${fmtFcl(fill.fcl)} × ${fill.kind === '20GP' ? "20'" : "40'"} FCL` +
        ` (${fmtKg(fill.payloadKg)} kg de carga máxima)`,
    )
    L.push('Los azulejos llenan el contenedor por peso antes que por volumen.')
    L.push('')
    L.push('Cajas redondeadas siempre hacia arriba: no es posible comprar una caja fraccionada.')
    L.push(`Reglas de cálculo: ${PACKING_RULES_VERSION}`)
  } else {
    L.push('Cantidades por definir. Agradezco precio por m² y disponibilidad.')
  }

  L.push('')
  L.push('Agradezco precio por m² (FOB y CIF) y tiempo de producción.')
  return L.join('\n')
}

/**
 * The supplier's WhatsApp number, digits only. Unset by default: with no
 * number, wa.me opens the composer and the buyer picks the chat, which is right
 * until a real line is configured. Never guess one — a quote delivered to the
 * wrong chat is worse than one the buyer has to address.
 */
const SUPPLIER_WA = (process.env.NEXT_PUBLIC_SUPPLIER_WHATSAPP ?? '').replace(/\D/g, '')
const SUPPLIER_EMAIL = process.env.NEXT_PUBLIC_SUPPLIER_EMAIL ?? ''

export function whatsappHref(body: string): string {
  const text = encodeURIComponent(body)
  return SUPPLIER_WA ? `https://wa.me/${SUPPLIER_WA}?text=${text}` : `https://wa.me/?text=${text}`
}

export function mailtoHref(body: string): string {
  const subject = encodeURIComponent('Solicitud de cotización — Azulejos')
  return `mailto:${SUPPLIER_EMAIL}?subject=${subject}&body=${encodeURIComponent(body)}`
}
