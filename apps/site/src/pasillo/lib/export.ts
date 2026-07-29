// Azulejos · §4.12 — what leaves the app.
//
// Two send actions of equal weight, WhatsApp and email, because a buyer's
// counterpart uses one or the other and the tool does not get to choose. Both
// carry the same body: every line with its quantity resolved to whole cartons,
// then the container load.
//
// The arithmetic travels WITH the request. A request that arrives as
// "56,70 m² = 42 cajas ≈ 1 050 kg" can be sourced; one that arrives as a list of
// codes starts a round of questions, and the whole promise dies there.
//
// THE RECIPIENT IS WINGS OPS. The buyer assembles a muestrario and sends it in;
// this is a lead landing in the Wings inbox, and Wings sources against it. That
// framing decides what belongs here:
//
//  · Nothing internal to the tool. No packing-rules build id, no admission about
//    what our own printed catalogue omits. A client does not narrate our data
//    gaps back to us; they state what they need.
//  · NUMBERS ARE UNAMBIGUOUS. The screen formats es-ES, where `25.000` means
//    twenty-five thousand — and this document gets forwarded to a factory that
//    reads it as twenty-five. Decimal comma, SPACE thousands, no dot inside any
//    number. Everything upstream is decimal-exact; losing that in transmission
//    would be absurd.
//  · THE REQUEST MATCHES THE HEADER. The incoterm asked for is the one the buyer
//    selected. It previously stated the buyer's terms and then asked for
//    "(FOB y CIF)" regardless.
//  · A `review` face_kind travels with its line, because a known data
//    discrepancy reaching Wings ops silently is how it reaches a factory.

import { getSeries, getSku, seriesName, seriesNameRaw } from '@/pasillo/lib/catalogue'
import type { Series } from '@/pasillo/types/catalogue'

/** "Mar de Flores · Flower Sea Series" — collapses to one name when untranslated. */
const seriesLine = (s: Series): string => {
  const raw = seriesNameRaw(s)
  return raw ? `${seriesName(s)} · ${raw}` : seriesName(s)
}
import {
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
// Deliberately NOT the es-ES display formatters — see the header note.

const dec = (n: number, places: number) =>
  n.toFixed(places).replace('.', ',')

/** Thousands separated by a space, never a dot. `28200` → `28 200`. */
const int = (n: number) =>
  Math.round(n)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ' ')

/** Where the request is sent, exactly as the buyer set it. */
const deliveryTerms = (buyer: Buyer) => [buyer.incoterm, buyer.port].filter(Boolean).join(' ')

/**
 * What the buyer is asking for. Kept to three lines and no meta-commentary:
 * "el catálogo impreso no los declara" was us explaining our own data gap inside
 * the client's message, which is not the client's to say.
 */
function askBlock(buyer: Buyer): string[] {
  const terms = deliveryTerms(buyer)
  return [
    'SOLICITAMOS',
    `1. Precio por m² por referencia${terms ? `, ${terms}` : ''}.`,
    '2. Tiempo de producción y disponibilidad por serie.',
    '3. Ficha técnica de las referencias listadas: PEI, absorción de agua,',
    '   resistencia al deslizamiento y canto.',
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
      // BOTH names, buyer's first. Ops reads this against a conversation held
      // in Spanish and then quotes a factory that only knows its own English
      // series name; a document carrying one of the two makes somebody
      // translate under time pressure, which is how the wrong series ships.
      //
      // Thickness carries a decimal on several series (8.8 mm) and must go
      // through the same comma rule as every other figure in this document.
      `${seriesLine(series)} — ${series.format_mm[0]}×${series.format_mm[1]}×${dec(series.thickness_mm, 1)} mm` +
        ` · ${series.pcs_per_ctn} PCS/CTN · ${dec(series.kgs_per_ctn, 1)} KGS/CTN` +
        ` · ${dec(series.m2_per_ctn, 2)} m²/caja`,
    )
    for (const uid of folder.selected) {
      const sku = getSku(uid)
      if (!sku) continue
      n += 1
      const t = lineTotals(qty[uid], series)
      lines.push(t)
      // The supplier's OWN printed finish, not our Spanish rendering of it.
      // Wings ops relays this to the factory, and the factory recognises its own
      // vocabulary; a translated finish would have to be translated back.
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
    // Explicitly "with a quantity": a line above may still read "cantidad por
    // definir", and a bare count beside a longer list invites the reader to
    // wonder which number is wrong.
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
  return L.join('\n')
}

/**
 * Where the request lands — Wings ops. Digits only. Unset by default: with no
 * number, wa.me opens the composer and the buyer picks the chat, which is right
 * until a real line is configured. Never guess one — a request delivered to the
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
