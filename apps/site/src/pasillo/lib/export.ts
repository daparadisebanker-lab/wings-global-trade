// Azulejos · §4.12 — what leaves the app.
//
// Two send actions of equal weight, WhatsApp and email, because a buyer's
// counterpart uses one or the other and the tool does not get to choose. Both
// carry the same body: every line with its quantity resolved to whole cartons,
// then the container load.
//
// The arithmetic travels WITH the request. A supplier who receives
// "56,70 m² = 42 cajas ≈ 1 050 kg" can reply with a price; one who receives a
// list of codes replies with questions, and the whole promise dies there.
//
// THIS FILE IS THE ONLY ARTEFACT A COUNTERPARTY EVER READS. Three rules follow
// from that, and none of them are style:
//
//  1. NUMBERS ARE UNAMBIGUOUS ACROSS LOCALES. The screen formats es-ES, where
//     `25.000` means twenty-five thousand. A factory in Foshan reads that as
//     twenty-five. This document therefore uses a decimal comma and a SPACE for
//     thousands — `25 000 kg`, `56,70 m²` — one convention, no dot anywhere in a
//     number. Everything upstream is decimal-exact; it would be absurd to lose
//     that in transmission.
//  2. THE REQUEST MATCHES THE HEADER. The incoterm asked for is the incoterm the
//     buyer selected. It previously stated the buyer's terms and then requested
//     "(FOB y CIF)" regardless.
//  3. IT ASKS FOR WHAT IS MISSING. The catalogue prints no PEI, absorption or
//     slip rating, and the UI is scrupulous about saying so — this message is
//     the one moment those fields can actually be resolved, so it requests them.
//     A `review` face_kind travels with its line for the same reason.

import { getSeries, getSku } from '@/pasillo/lib/catalogue'
import {
  PACKING_RULES_VERSION,
  containerFill,
  fmtFcl,
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

// ── Export-only number formatting ──────────────────────────────────────────
// Deliberately NOT the es-ES display formatters. See rule 1 above.

const dec = (n: number, places: number) =>
  n.toFixed(places).replace('.', ',')

/** Thousands separated by a space, never a dot. `28200` → `28 200`. */
const int = (n: number) =>
  Math.round(n)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ' ')

/** Where the request is sent, exactly as the buyer set it. */
const deliveryTerms = (buyer: Buyer) => [buyer.incoterm, buyer.port].filter(Boolean).join(' ')

/** The one block that asks for everything the catalogue cannot answer. */
function askBlock(buyer: Buyer): string[] {
  const terms = deliveryTerms(buyer)
  return [
    'SOLICITAMOS',
    `1. Precio por m² por referencia${terms ? `, ${terms}` : ''}.`,
    '2. Tiempo de producción y disponibilidad por serie.',
    '3. Ficha técnica de las referencias listadas: PEI, absorción de agua,',
    '   resistencia al deslizamiento y canto. El catálogo impreso no los declara.',
    '',
    'Quedamos atentos a su cotización.',
  ]
}

export function requestBody({ folders, qty, notes, buyer, kind, dateISO }: RequestInput): string {
  const L: string[] = []
  L.push('SOLICITUD DE COTIZACIÓN — AZULEJOS')
  const who = [buyer.company, buyer.name].filter(Boolean).join(' · ')
  if (who) L.push(who)
  if (buyer.project) L.push(`Proyecto: ${buyer.project}`)
  const terms = deliveryTerms(buyer)
  if (terms) L.push(`Entrega: ${terms}`)
  if (buyer.target) L.push(`Fecha objetivo en obra: ${buyer.target}`)
  L.push(`Fecha de solicitud: ${dateISO}`)
  L.push('')

  const lines: ReturnType<typeof lineTotals>[] = []
  let n = 0

  for (const folder of folders) {
    const series = getSeries(folder.series_uid)
    if (!series || folder.selected.length === 0) continue
    L.push(
      // Thickness carries a decimal on several series (8.8 mm) and must go
      // through the same comma rule as every other figure in this document.
      `${series.name_raw} — ${series.format_mm[0]}×${series.format_mm[1]}×${dec(series.thickness_mm, 1)} mm` +
        ` · ${series.pcs_per_ctn} PCS/CTN · ${dec(series.kgs_per_ctn, 1)} KGS/CTN` +
        ` · ${dec(series.m2_per_ctn, 2)} m²/caja`,
    )
    for (const uid of folder.selected) {
      const sku = getSku(uid)
      if (!sku) continue
      n += 1
      const t = lineTotals(qty[uid], series)
      lines.push(t)
      // The supplier's OWN printed finish, not our Spanish rendering of it —
      // they should recognise their vocabulary coming back at them.
      const head = `  ${n}. ${sku.code} · ${sku.finish_raw}`
      if (t.cartons > 0) {
        L.push(`${head} — ${int(t.cartons)} cajas · ${dec(t.m2, 2)} m² · ${int(t.kg)} kg`)
      } else {
        L.push(`${head} — cantidad por definir`)
      }
      const note = notes[uid]
      if (note) L.push(`     Nota: ${note}`)
      // The one known data discrepancy must not ship silently. The UI declares
      // it; so does the document that asks for a price against it.
      if (sku.face_kind === 'review') {
        L.push(
          `     Verificar antes de cotizar: el catálogo imprime ${sku.pattern_count}` +
            ` ${sku.pattern_count === 1 ? 'patrón' : 'patrones'} pero muestra ${sku.faces.length} caras.`,
        )
      }
    }
    L.push('')
  }

  const totals = sumTotals(lines)
  if (totals.cartons > 0) {
    const fill = containerFill(totals.kg, kind)
    L.push('TOTALES')
    // Explicitly "with a quantity": a line listed above may still read
    // "cantidad por definir", and a bare count beside a longer list invites the
    // supplier to wonder which number is wrong.
    L.push(`Referencias con cantidad: ${int(totals.skus)}`)
    L.push(`Cajas: ${int(totals.cartons)}`)
    L.push(`Superficie: ${dec(totals.m2, 2)} m²`)
    L.push(`Peso bruto: ${int(totals.kg)} kg`)
    L.push(
      `Contenedor: ${fmtFcl(fill.fcl).replace('.', ',')} × ${fill.kind === '20GP' ? "20'" : "40'"} FCL` +
        ` (carga útil ${int(fill.payloadKg)} kg)`,
    )
    L.push('')
    L.push(
      'Cantidades resueltas a cajas enteras, redondeadas hacia arriba; los m² y kilos',
    )
    L.push('corresponden a esas cajas.')
  } else {
    L.push('Cantidades por definir: se confirmarán contra el despiece del proyecto.')
  }

  L.push('')
  L.push(...askBlock(buyer))
  L.push(`Cálculo: ${PACKING_RULES_VERSION}`)
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

export function mailtoHref(body: string, company?: string): string {
  const subject = encodeURIComponent(
    `Solicitud de cotización — Azulejos${company ? ` · ${company}` : ''}`,
  )
  return `mailto:${SUPPLIER_EMAIL}?subject=${subject}&body=${encodeURIComponent(body)}`
}
