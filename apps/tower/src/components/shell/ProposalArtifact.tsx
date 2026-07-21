'use client'

import { useState } from 'react'
import { DEFAULT_LOCALE, t, type Locale } from '@/lib/i18n'
import type { ProposalDraftData } from '@/lib/copilot/capabilities/proposal-draft'

/**
 * The proposal "artifact" — a copy-ready client message Mister drafted, ES primary
 * with an EN mirror toggle and a one-tap copy (composing-to-send is the whole
 * point). INLINE styles only (dark-bubble palette) so it reads against Mister's
 * #00112e bubble like the other artifacts. Client component: it owns the copy +
 * language toggle state.
 */

const TEXT = '#eef4fb'
const MUTED = '#a8c0dc'
const GOLD = '#e0b866'
const PANEL_BG = 'rgba(0,17,46,0.55)'
const BORDER = '1px solid rgba(168,192,220,0.2)'
const MONO = 'var(--font-mono)'

const CHANNEL_LABEL: Record<string, string> = {
  whatsapp: 'WhatsApp',
  email: 'Email',
  formal: 'Formal',
}

export function ProposalArtifact({
  result,
  locale = DEFAULT_LOCALE,
}: {
  result: unknown
  locale?: Locale
}) {
  const r = result as ProposalDraftData
  const hasEn = Boolean(r.bodyEn)
  const [showEn, setShowEn] = useState(false)
  const [copied, setCopied] = useState(false)

  const body = showEn && r.bodyEn ? r.bodyEn : r.bodyEs
  const subject = showEn ? r.subjectEn : r.subjectEs

  async function copy() {
    const text = [subject, body].filter(Boolean).join('\n\n')
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      // Clipboard blocked — the text is selectable in the body regardless.
    }
  }

  return (
    <div
      style={{
        background: PANEL_BG,
        border: BORDER,
        borderRadius: 12,
        padding: '12px 14px',
        color: TEXT,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
      }}
    >
      {/* Header: label · channel · language toggle */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: MUTED }}>
          {t({ es: 'Propuesta', en: 'Proposal' }, locale)}
          {r.channel ? ` · ${CHANNEL_LABEL[r.channel]}` : ''}
        </span>
        {hasEn ? (
          <button
            type="button"
            onClick={() => setShowEn((v) => !v)}
            style={{
              fontFamily: MONO,
              fontSize: 10,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: GOLD,
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            {showEn ? 'ES' : 'EN'}
          </button>
        ) : null}
      </div>

      {subject ? (
        <div style={{ fontSize: 14, fontWeight: 600, color: TEXT, lineHeight: 1.35 }}>{subject}</div>
      ) : null}

      {/* The message — selectable, whitespace preserved. */}
      <div
        style={{
          fontSize: 13.5,
          lineHeight: 1.5,
          color: '#dbe6f3',
          whiteSpace: 'pre-wrap',
          borderTop: BORDER,
          paddingTop: 10,
        }}
      >
        {body}
      </div>

      <button
        type="button"
        onClick={copy}
        style={{
          alignSelf: 'flex-start',
          fontFamily: MONO,
          fontSize: 11,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: copied ? '#00112e' : GOLD,
          background: copied ? GOLD : 'transparent',
          border: `1px solid ${GOLD}`,
          borderRadius: 6,
          padding: '5px 10px',
          cursor: 'pointer',
          transition: 'background 140ms ease, color 140ms ease',
        }}
      >
        {copied
          ? t({ es: 'Copiado ✓', en: 'Copied ✓' }, locale)
          : t({ es: 'Copiar', en: 'Copy' }, locale)}
      </button>
    </div>
  )
}
