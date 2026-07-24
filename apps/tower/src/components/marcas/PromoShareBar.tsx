'use client'

// PromoShareBar — the container-promo share controls (root CLAUDE.md §5-bis, WS5).
// Reuses the existing "share the script" button (D2) and adds a client target:
// the rep picks a real client contact and the message opens as a wa.me deep-link
// addressed to THAT contact's WhatsApp, so the rep's own WhatsApp opens the chat
// with the copy pre-filled — they hit send. This is the rep's own workflow: NO
// Meta/Cloud API, no broadcast, no server-side send. Three ways out:
//   · Marketing team  → the rep's own line (internal ad-production handoff)
//   · A selected client → wa.me addressed to that contact (falls back to the
//     rep's own line / the generic chooser when none is picked)
//   · Native share     → the OS share sheet (WhatsApp + a contact or a broadcast
//     LIST is the rep's own workflow), shown only where navigator.share exists.
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import type { PromoAudience } from '@wings/rb-core'
import { waMeUrl } from '@/lib/actions/container-promo-logic'
import { filterRecipients, personalizedShareText, type ShareRecipient } from '@/lib/actions/share-recipients-logic'
import { DEFAULT_LOCALE, t, type Locale } from '@/lib/i18n'

const LABEL = 'font-mono text-label uppercase tracking-[0.08em] text-ink-secondary'
// Where a rep sets their own WhatsApp Business line (rep-identity, tower_39).
const REP_PROFILE_PATH = '/perfil'

function openWhatsApp(target: string | null, text: string) {
  window.open(waMeUrl(target, text), '_blank', 'noopener,noreferrer')
}

export function PromoShareBar({
  recipients,
  repWhatsappE164 = null,
  repWhatsappLabel = null,
  buildText,
  locale = DEFAULT_LOCALE,
}: {
  /** Client contacts the rep can reach on WhatsApp (RLS-scoped, may be empty). */
  recipients: ShareRecipient[]
  repWhatsappE164?: string | null
  repWhatsappLabel?: string | null
  /** Builds the audience-specific share copy from the current promo + edits. */
  buildText: (audience: PromoAudience) => string
  locale?: Locale
}) {
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  // navigator.share is client-only — resolve after mount to avoid an SSR mismatch.
  const [canNativeShare, setCanNativeShare] = useState(false)
  useEffect(() => {
    setCanNativeShare(typeof navigator !== 'undefined' && typeof navigator.share === 'function')
  }, [])

  const selected = useMemo(
    () => recipients.find((r) => r.id === selectedId) ?? null,
    [recipients, selectedId],
  )
  const filtered = useMemo(() => filterRecipients(recipients, query), [recipients, query])

  // The client-facing text, greeted to the picked contact when they have a name
  // (a nameless contact — display falls back to the account — goes out ungreeted).
  function clientText(): string {
    const base = buildText('clients')
    return selected ? personalizedShareText(base, selected.greetName, locale) : base
  }

  function shareToMarketing() {
    openWhatsApp(repWhatsappE164, buildText('marketing'))
  }

  function shareToClient() {
    // Addressed to the picked contact; with none picked it opens the rep's own
    // line (or the generic chooser when no number is on file) — unchanged behavior.
    openWhatsApp(selected?.whatsapp ?? repWhatsappE164, clientText())
  }

  async function shareNative() {
    try {
      await navigator.share({ text: clientText() })
    } catch (e) {
      // A user cancel (AbortError) is expected — swallow it. Any OTHER failure
      // (share target rejected, not-allowed) must not dead-end the button, so
      // fall back to the wa.me path (own line / picked contact).
      if ((e as DOMException | undefined)?.name !== 'AbortError') {
        openWhatsApp(selected?.whatsapp ?? repWhatsappE164, clientText())
      }
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <span className={LABEL}>{t({ es: 'Compartir el guion', en: 'Share the script' }, locale)}</span>

      {/* ── Internal handoff ── */}
      <button
        type="button"
        onClick={shareToMarketing}
        className="w-fit rounded-card border border-line px-3 py-1.5 font-mono text-label uppercase tracking-[0.08em] text-ink-secondary hover:border-lane-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lane-accent"
      >
        {t({ es: 'Compartir con equipo de marketing', en: 'Share with marketing team' }, locale)}
      </button>

      {/* ── Client target ── */}
      <div className="flex flex-col gap-2 rounded-card border border-line bg-surface-0 p-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className={LABEL}>{t({ es: 'Enviar a un cliente', en: 'Send to a client' }, locale)}</span>
          {selected ? (
            <button
              type="button"
              onClick={() => setSelectedId(null)}
              className="font-mono text-label uppercase tracking-[0.08em] text-lane-accent hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lane-accent"
            >
              {t({ es: 'Quitar selección', en: 'Clear' }, locale)}
            </button>
          ) : null}
        </div>

        {recipients.length > 0 ? (
          <>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t({ es: 'Buscar cliente…', en: 'Search client…' }, locale)}
              aria-label={t({ es: 'Buscar cliente', en: 'Search client' }, locale)}
              className="rounded-card border border-line bg-surface-1 px-2 py-1.5 font-ui text-t0 text-ink-primary outline-none focus-visible:border-lane-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-lane-accent"
            />
            {/* role=listbox must directly own its options — the li wrappers are
                presentation so the option relationship isn't broken; the empty
                message lives OUTSIDE the listbox (a non-option child is invalid). */}
            {filtered.length > 0 ? (
              <ul className="flex max-h-40 flex-col gap-0.5 overflow-y-auto" role="listbox" aria-label={t({ es: 'Clientes', en: 'Clients' }, locale)}>
                {filtered.map((r) => {
                  const on = r.id === selectedId
                  return (
                    <li key={r.id} role="presentation">
                      <button
                        type="button"
                        role="option"
                        aria-selected={on}
                        onClick={() => setSelectedId(on ? null : r.id)}
                        className={`flex w-full flex-col items-start rounded-control px-2 py-1.5 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-lane-accent ${
                          on ? 'bg-surface-2 text-ink-primary' : 'text-ink-secondary hover:bg-surface-1'
                        }`}
                      >
                        <span className="font-ui text-t0">{r.contactName}</span>
                        <span className="font-mono text-label text-ink-secondary">
                          {r.accountName}
                          {r.brandName ? ` · ${r.brandName}` : ''}
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            ) : (
              <p className="px-2 py-1.5 font-ui text-label text-ink-secondary">
                {t({ es: 'Sin coincidencias', en: 'No matches' }, locale)}
              </p>
            )}
          </>
        ) : (
          <p className="font-mono text-label text-ink-secondary">
            {/* Neutral wording: this branch also renders when the fetch failed, so
                it must not assert "there are none" as a fact. */}
            {t(
              {
                es: 'No hay clientes con WhatsApp para mostrar. Agrega el número en el contacto del cliente.',
                en: 'No clients with WhatsApp to show. Add the number on the client contact.',
              },
              locale,
            )}
          </p>
        )}

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={shareToClient}
            className="rounded-card bg-accent px-3 py-1.5 font-mono text-label uppercase tracking-[0.08em] text-surface-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lane-accent"
          >
            {selected
              ? `${t({ es: 'Compartir con', en: 'Share with' }, locale)} ${selected.contactName}`
              : t({ es: 'Compartir con leads y clientes', en: 'Share with leads & clients' }, locale)}
          </button>
          {canNativeShare ? (
            <button
              type="button"
              onClick={shareNative}
              className="rounded-card border border-line px-3 py-1.5 font-mono text-label uppercase tracking-[0.08em] text-ink-secondary hover:border-lane-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lane-accent"
            >
              {t({ es: 'Compartir…', en: 'Share…' }, locale)}
            </button>
          ) : null}
        </div>

        {/* Sender context — where the message opens from. */}
        {selected ? (
          <p className="font-mono text-label text-ink-secondary">
            {t(
              { es: 'Abre el chat con', en: 'Opens the chat with' },
              locale,
            )}{' '}
            {selected.contactName} ({selected.whatsapp}){' '}
            {t({ es: '— listo para enviar', en: '— ready to send' }, locale)}
          </p>
        ) : repWhatsappE164 ? (
          <p className="font-mono text-label text-ink-secondary">
            {t({ es: 'Se comparte desde tu WhatsApp', en: 'Shared from your WhatsApp' }, locale)}
            {repWhatsappLabel ? ` · ${repWhatsappLabel}` : ''} ({repWhatsappE164})
          </p>
        ) : (
          <p className="font-mono text-label text-ink-secondary">
            {t({ es: 'Se comparte desde la línea general.', en: 'Shared from the general line.' }, locale)}{' '}
            <Link
              href={REP_PROFILE_PATH}
              className="text-lane-accent underline underline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lane-accent"
            >
              {t({ es: 'Configura tu WhatsApp en tu perfil', en: 'Set up your WhatsApp in your profile' }, locale)}
            </Link>
          </p>
        )}
      </div>
    </div>
  )
}
