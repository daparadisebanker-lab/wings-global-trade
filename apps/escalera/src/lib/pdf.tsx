'use client'

// La Escalera · Rung 3 — the order-ready sheet.
//
// "a clean one-page PDF (order-ready: rows, quantities, totals, buyer contact)".
// It is the same arithmetic as the screen and the WhatsApp message — it reads
// the Quote, it never recomputes.
//
// @react-pdf/renderer is ~large. It is imported dynamically inside the export
// call so it never lands in the deck's bundle: the swipe surface stays under
// budget and the renderer is only fetched when a buyer actually exports.

import { fmtInt, fmtKg, fmtM2, fmtPct } from '@/lib/packing'
import { ASSUMED_PALLET_NOTE, WEIGHT_NOTE, type Quote } from '@/lib/quote'
import { formatChip } from '@/types/tile'

const COLS = [
  { key: 'n', label: '#', w: '4%' },
  { key: 'code', label: 'Código', w: '17%' },
  { key: 'format', label: 'Formato', w: '12%' },
  { key: 'room', label: 'Ambiente', w: '14%' },
  { key: 'area', label: 'm² pedidos', w: '11%' },
  { key: 'waste', label: 'Desp.', w: '7%' },
  { key: 'cartons', label: 'Cajas', w: '9%' },
  { key: 'supplied', label: 'm² surtidos', w: '13%' },
  { key: 'kg', label: 'kg', w: '13%' },
] as const

export async function downloadQuotePdf(quote: Quote, dateISO: string): Promise<void> {
  const { pdf, Document, Page, Text, View, StyleSheet } = await import('@react-pdf/renderer')

  const s = StyleSheet.create({
    page: { padding: 36, fontSize: 8.5, fontFamily: 'Helvetica', color: '#001E50' },
    h1: { fontSize: 15, fontFamily: 'Helvetica-Bold', marginBottom: 2 },
    sub: { fontSize: 8, color: '#5A6373', marginBottom: 14 },
    metaRow: { flexDirection: 'row', marginBottom: 14, gap: 24 },
    metaLabel: { fontSize: 6.5, color: '#5A6373', letterSpacing: 0.6, marginBottom: 2 },
    meta: { fontSize: 9 },
    tHead: {
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderBottomColor: '#001E50',
      paddingBottom: 4,
      marginBottom: 2,
    },
    th: { fontSize: 6.5, color: '#5A6373', letterSpacing: 0.6 },
    tr: {
      flexDirection: 'row',
      borderBottomWidth: 0.5,
      borderBottomColor: '#D9D6CE',
      paddingVertical: 4,
    },
    td: { fontSize: 8.5 },
    num: { fontSize: 8.5, textAlign: 'right' },
    note: { fontSize: 7, color: '#5A6373', marginTop: 2 },
    totals: {
      flexDirection: 'row',
      borderTopWidth: 1,
      borderTopColor: '#001E50',
      paddingTop: 6,
      marginTop: 2,
    },
    box: { marginTop: 16, padding: 10, backgroundColor: '#F3F1EA' },
    boxTitle: { fontSize: 6.5, color: '#5A6373', letterSpacing: 0.6, marginBottom: 4 },
    foot: { marginTop: 16, fontSize: 6.5, color: '#5A6373', lineHeight: 1.5 },
  })

  const { buyer, pricedLines, totals, fill } = quote

  const doc = (
    <Document title="Solicitud de cotización — Azulejos">
      <Page size="A4" style={s.page}>
        <Text style={s.h1}>Solicitud de cotización — Azulejos</Text>
        <Text style={s.sub}>La Escalera · {dateISO}</Text>

        <View style={s.metaRow}>
          <View>
            <Text style={s.metaLabel}>SOLICITANTE</Text>
            <Text style={s.meta}>{buyer.name || '—'}</Text>
          </View>
          <View>
            <Text style={s.metaLabel}>EMPRESA</Text>
            <Text style={s.meta}>{buyer.company || '—'}</Text>
          </View>
          <View>
            <Text style={s.metaLabel}>PROYECTO</Text>
            <Text style={s.meta}>{buyer.project || '—'}</Text>
          </View>
        </View>

        <View style={s.tHead}>
          {COLS.map((c) => (
            <Text
              key={c.key}
              style={[s.th, { width: c.w, textAlign: c.key === 'n' || c.key === 'code' || c.key === 'format' || c.key === 'room' ? 'left' : 'right' }]}
            >
              {c.label}
            </Text>
          ))}
        </View>

        {pricedLines.map((l, i) => (
          <View key={l.tile.id} style={s.tr} wrap={false}>
            <Text style={[s.td, { width: '4%' }]}>{i + 1}</Text>
            <View style={{ width: '17%' }}>
              <Text style={s.td}>{l.tile.code}</Text>
              {!!l.entry.note && <Text style={s.note}>{l.entry.note}</Text>}
            </View>
            <Text style={[s.td, { width: '12%' }]}>{formatChip(l.tile)}</Text>
            <Text style={[s.td, { width: '14%' }]}>{l.entry.room || '—'}</Text>
            <Text style={[s.num, { width: '11%' }]}>{fmtM2(l.totals.requestedM2)}</Text>
            <Text style={[s.num, { width: '7%' }]}>{l.entry.wastePct}%</Text>
            <Text style={[s.num, { width: '9%' }]}>{fmtInt(l.totals.cartons)}</Text>
            <Text style={[s.num, { width: '13%' }]}>{fmtM2(l.totals.suppliedM2)}</Text>
            <Text style={[s.num, { width: '13%' }]}>{fmtKg(l.totals.kg)}</Text>
          </View>
        ))}

        <View style={s.totals}>
          <Text style={[s.td, { width: '58%', fontFamily: 'Helvetica-Bold' }]}>
            TOTAL · {totals.lines} referencias · {fmtInt(totals.pallets)} pallets
          </Text>
          <Text style={[s.num, { width: '9%', fontFamily: 'Helvetica-Bold' }]}>
            {fmtInt(totals.cartons)}
          </Text>
          <Text style={[s.num, { width: '13%', fontFamily: 'Helvetica-Bold' }]}>
            {fmtM2(totals.suppliedM2)}
          </Text>
          <Text style={[s.num, { width: '13%', fontFamily: 'Helvetica-Bold' }]}>
            {fmtKg(totals.kg)}
          </Text>
        </View>

        <View style={s.box}>
          <Text style={s.boxTitle}>CARGA DEL CONTENEDOR</Text>
          <Text style={s.td}>
            {fill.label}: {fmtKg(totals.kg)} kg de {fmtKg(fill.payloadKg)} kg de carga máxima
            {' '}({fmtPct(fill.fillPct)}%)
            {fill.containersNeeded > 1 ? ` — requiere ${fill.containersNeeded} contenedores` : ''}
          </Text>
          <Text style={s.note}>{WEIGHT_NOTE}</Text>
        </View>

        <Text style={s.foot}>
          Cajas redondeadas siempre hacia arriba: no es posible comprar una caja fraccionada.
          {'\n'}
          {quote.hasAssumedPacking ? `${ASSUMED_PALLET_NOTE}\n` : ''}
          Este documento indica cantidades, no precios. Reglas de cálculo {quote.rulesVersion}.
        </Text>
      </Page>
    </Document>
  )

  const blob = await pdf(doc).toBlob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `cotizacion-azulejos-${dateISO}.pdf`
  document.body.appendChild(a)
  a.click()
  a.remove()
  // give the browser a tick to start the download before revoking
  setTimeout(() => URL.revokeObjectURL(url), 4000)
}
