'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { getDocumentUrl, removeDocument } from '@/lib/actions/documents'
import { t, type Locale } from '@/lib/i18n'

/**
 * Per-document actions: Open (mint a short-lived signed URL and open it) and
 * Remove (RLS-gated delete + storage cleanup). Both degrade to an inline state
 * rather than a thrown failure.
 */
export function DocumentActions({ id, locale }: { id: string; locale: Locale }) {
  const router = useRouter()
  const [opening, startOpen] = useTransition()
  const [removing, startRemove] = useTransition()
  const [failed, setFailed] = useState(false)

  function onOpen() {
    setFailed(false)
    startOpen(async () => {
      const res = await getDocumentUrl(id)
      if (res.error) {
        setFailed(true)
        return
      }
      window.open(res.data.url, '_blank', 'noopener,noreferrer')
    })
  }

  function onRemove() {
    if (!window.confirm(t({ es: '¿Eliminar este documento?', en: 'Remove this document?' }, locale))) return
    setFailed(false)
    startRemove(async () => {
      const res = await removeDocument(id)
      if (res.error) {
        setFailed(true)
        return
      }
      router.refresh()
    })
  }

  return (
    <div className="flex items-center justify-end gap-4">
      <button
        type="button"
        onClick={onOpen}
        disabled={opening}
        className="font-mono text-label uppercase tracking-[0.1em] text-accent hover:underline disabled:opacity-50"
      >
        {opening
          ? t({ es: 'Abriendo…', en: 'Opening…' }, locale)
          : failed
            ? t({ es: 'Reintentar', en: 'Retry' }, locale)
            : t({ es: 'Abrir', en: 'Open' }, locale)}
      </button>
      <button
        type="button"
        onClick={onRemove}
        disabled={removing}
        className="font-mono text-label uppercase tracking-[0.1em] text-ink-secondary hover:text-negative disabled:opacity-50"
      >
        {removing ? '…' : t({ es: 'Eliminar', en: 'Remove' }, locale)}
      </button>
    </div>
  )
}
