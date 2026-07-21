'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { issueQuotation } from '@/lib/actions/quotation'
import { t, type Locale } from '@/lib/i18n'

/**
 * Issue-in-place: mints the binding COT-/PF- number for a DRAFT quotation right
 * from the window, then refreshes so the row shows its number and the proforma
 * prints numbered. Write is gated by RLS (issueQuotation) — a caller without
 * write access gets a graceful inline error rather than a thrown failure.
 */
export function IssueButton({ quoteId, locale }: { quoteId: string; locale: Locale }) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [failed, setFailed] = useState(false)

  function onIssue() {
    setFailed(false)
    start(async () => {
      const res = await issueQuotation(quoteId)
      if (res.error) {
        setFailed(true)
        return
      }
      router.refresh()
    })
  }

  return (
    <button
      type="button"
      onClick={onIssue}
      disabled={pending}
      className="font-mono text-label uppercase tracking-[0.1em] text-lane-accent hover:underline disabled:opacity-50"
      title={failed ? t({ es: 'No se pudo emitir', en: 'Could not issue' }, locale) : undefined}
    >
      {pending
        ? t({ es: 'Emitiendo…', en: 'Issuing…' }, locale)
        : failed
          ? t({ es: 'Reintentar', en: 'Retry' }, locale)
          : t({ es: 'Emitir', en: 'Issue' }, locale)}
    </button>
  )
}
