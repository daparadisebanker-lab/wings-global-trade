'use client'

import { useState, useTransition } from 'react'
import { t, type Locale } from '@/lib/i18n'
import { extractClientFromWhatsapp } from '@/lib/actions/whatsapp-import'
import type { ClientExtractDraft } from '@/lib/crm/whatsapp'

/**
 * Import a client from an exported WhatsApp chat. Paste the text or upload the
 * `.txt` WhatsApp produces; Mister reads it and returns a DRAFT profile the
 * operator then reviews + saves in the form (Directive 7 — nothing auto-commits).
 */
export function WhatsappImport({
  locale,
  onDraft,
  onCancel,
}: {
  locale: Locale
  onDraft: (draft: ClientExtractDraft) => void
  onCancel: () => void
}) {
  const [text, setText] = useState('')
  const [fileName, setFileName] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [reading, startRead] = useTransition()

  async function onFile(file: File | undefined) {
    if (!file) return
    setFileName(file.name)
    setError(null)
    try {
      setText(await file.text())
    } catch {
      setError(t({ es: 'No se pudo leer el archivo', en: 'Could not read the file' }, locale))
    }
  }

  function onRead() {
    setError(null)
    startRead(async () => {
      const res = await extractClientFromWhatsapp(text)
      if (res.error) {
        setError(res.error.message)
        return
      }
      onDraft(res.data)
    })
  }

  const field =
    'rounded-card border border-line bg-surface-0 px-3 py-2 font-ui text-t0 text-ink-primary outline-none focus-visible:border-lane-accent placeholder:text-ink-secondary'

  return (
    <div className="flex flex-col gap-3 rounded-card-lg border border-line bg-surface-1 p-4 shadow-elevation-2">
      <span className="font-mono text-label uppercase tracking-[0.1em] text-ink-secondary">
        {t({ es: 'Importar desde WhatsApp', en: 'Import from WhatsApp' }, locale)}
      </span>
      <p className="max-w-prose font-ui text-label text-ink-secondary">
        {t(
          {
            es: 'Exporta la conversación en WhatsApp (sin archivos) y súbela o pégala. Mister arma un borrador de perfil que revisas antes de guardar.',
            en: 'Export the chat in WhatsApp (without media) and upload or paste it. Mister builds a draft profile you review before saving.',
          },
          locale,
        )}
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <label className="cursor-pointer rounded-card border border-line px-3 py-2 font-mono text-label uppercase tracking-[0.08em] text-ink-primary hover:border-lane-accent">
          {t({ es: 'Subir .txt', en: 'Upload .txt' }, locale)}
          <input
            type="file"
            accept=".txt,text/plain"
            className="hidden"
            onChange={(e) => void onFile(e.target.files?.[0])}
          />
        </label>
        {fileName ? <span className="font-mono text-label text-ink-secondary">{fileName}</span> : null}
      </div>

      <textarea
        className={`${field} min-h-[140px] resize-y font-mono text-label`}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={t(
          { es: '…o pega aquí el texto del chat exportado', en: '…or paste the exported chat text here' },
          locale,
        )}
      />

      {error ? (
        <p role="alert" className="font-ui text-t0 text-negative">
          {error}
        </p>
      ) : null}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onRead}
          disabled={reading || text.trim().length < 20}
          className="rounded-card bg-accent px-4 py-2 font-mono text-label uppercase tracking-[0.1em] text-surface-0 disabled:opacity-50"
        >
          {reading
            ? t({ es: 'Leyendo…', en: 'Reading…' }, locale)
            : t({ es: 'Leer y crear perfil', en: 'Read & build profile' }, locale)}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="font-mono text-label uppercase tracking-[0.1em] text-ink-secondary hover:text-ink-primary"
        >
          {t({ es: 'Cancelar', en: 'Cancel' }, locale)}
        </button>
      </div>
    </div>
  )
}
