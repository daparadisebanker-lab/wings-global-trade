'use client'

import { useTransition } from 'react'
import { DEFAULT_LOCALE, t, type Locale } from '@/lib/i18n'
import { getDocumentUrl } from '@/lib/actions/documents'
import type { DocumentKind, DocumentListItem } from '@/lib/actions/documents-logic'
import { MISTER_ARTIFACT } from './mister-theme'

/**
 * The drive-search artifact — the documents Mister found, each openable via a
 * short-lived signed URL. Client component (the Open action calls a server
 * action). Dark World-B palette from the shared theme.
 */

const { text: TEXT, muted: MUTED, gold: GOLD, panelBg: PANEL_BG, border: BORDER, mono: MONO } = MISTER_ARTIFACT

interface DocumentSearchData {
  query: string
  results: DocumentListItem[]
}

const KIND_LABEL: Record<DocumentKind, { es: string; en: string }> = {
  SPEC_SHEET: { es: 'Ficha', en: 'Spec' },
  QUOTATION: { es: 'Cotización', en: 'Quote' },
  SUPPLIER_DOC: { es: 'Proveedor', en: 'Supplier' },
  CERTIFICATE: { es: 'Certificado', en: 'Cert' },
  DOCUMENT: { es: 'Documento', en: 'Doc' },
}

function DocRow({ doc, locale }: { doc: DocumentListItem; locale: Locale }) {
  const [opening, start] = useTransition()

  function onOpen() {
    start(async () => {
      const res = await getDocumentUrl(doc.id)
      if (!res.error) window.open(res.data.url, '_blank', 'noopener,noreferrer')
    })
  }

  const context = [doc.brandName, doc.laneSlug].filter(Boolean).join(' · ')

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderTop: BORDER }}>
      <div style={{ display: 'flex', minWidth: 0, flex: 1, flexDirection: 'column', gap: 2 }}>
        <span style={{ fontSize: 13.5, color: TEXT, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {doc.title}
        </span>
        <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '0.06em', textTransform: 'uppercase', color: MUTED }}>
          {t(KIND_LABEL[doc.kind], locale)}
          {context ? ` · ${context}` : ''}
        </span>
      </div>
      <button
        type="button"
        onClick={onOpen}
        disabled={opening}
        style={{
          flex: 'none',
          fontFamily: MONO,
          fontSize: 10.5,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: GOLD,
          background: 'transparent',
          border: `1px solid ${GOLD}`,
          borderRadius: 6,
          padding: '4px 9px',
          cursor: opening ? 'default' : 'pointer',
          opacity: opening ? 0.5 : 1,
        }}
      >
        {opening ? t({ es: 'Abriendo…', en: 'Opening…' }, locale) : t({ es: 'Abrir', en: 'Open' }, locale)}
      </button>
    </div>
  )
}

export function DocumentsArtifact({
  result,
  locale = DEFAULT_LOCALE,
}: {
  result: unknown
  locale?: Locale
}) {
  const r = result as DocumentSearchData

  return (
    <div style={{ background: PANEL_BG, border: BORDER, borderRadius: 12, padding: '10px 14px', color: TEXT }}>
      <div
        style={{
          fontFamily: MONO,
          fontSize: 11,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: MUTED,
          marginBottom: 2,
        }}
      >
        {t({ es: 'Drive', en: 'Drive' }, locale)}
        {r.query ? ` · ${r.query}` : ''} · {r.results.length}
      </div>
      {r.results.map((doc) => (
        <DocRow key={doc.id} doc={doc} locale={locale} />
      ))}
    </div>
  )
}
