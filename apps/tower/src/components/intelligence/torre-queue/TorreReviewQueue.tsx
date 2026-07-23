'use client'

// The Mister Torre review queue (spec-torre/03 §Review UX + 01 §keyboard-complete).
// A KEYBOARD-FIRST review surface: J/K move through the queue, ⌘↵ approves the
// selected artifact, R rejects. The list + chrome are host Tower (light tokens);
// the artifact PREVIEW is Mister (World-B navy), per the 04 scope boundary. The
// approve control NAMES the exact side effect and is disabled while any blocker is
// open. Status is shown in a self-contained banner (no global toast dependency).
import { useCallback, useEffect, useState, useTransition } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { cn } from '@wings/trade-ui'
import { DEFAULT_LOCALE, t, type Locale } from '@/lib/i18n'
import { MISTER_ARTIFACT } from '@/components/shell/mister-theme'
import { ConstellationField } from '@/components/shell/mister/ConstellationField'
import { Condensation, HairlineSweep, ThreeDots } from '@/components/shell/mister/MisterLoaders'
import { useTorreDraftsQuery } from './useTorreDraftsQuery'
import { approveTorreDraft, rejectTorreDraft } from '@/lib/actions/torre-review'
import { approveSideEffect, canApproveTorre } from '@/lib/torre/review-logic'
import { exportCotizacionXlsx, exportHojaCostosXlsx } from '@/lib/torre/export'
import { CotizacionCard, HojaCostosCard, ComunicacionCard } from '@/components/shell/TorreQuoteArtifact'
import type { TorreDraftRecord } from '@/lib/torre/drafts'
import type { CotizacionPayload, HojaCostosPayload } from '@/lib/torre/artifacts'

const KIND_TAG: Record<string, string> = { COTIZACION: 'COT', HOJA_COSTOS: 'HOJ', COMUNICACION: 'MSG' }

function title(rec: TorreDraftRecord, locale: Locale): string {
  const p = rec.payload
  if (p.kind === 'HOJA_COSTOS') return p.title
  if (p.kind === 'COTIZACION') return `${p.machine.productName || t({ es: 'Cotización', en: 'Quotation' }, locale)}${p.clientName ? ` · ${p.clientName}` : ''}`
  return p.subject ?? t({ es: 'Mensaje', en: 'Message' }, locale)
}

export function TorreReviewQueue({ locale = DEFAULT_LOCALE }: { locale?: Locale }) {
  const { data, isLoading, isError, error } = useTorreDraftsQuery()
  const drafts = data ?? []
  const qc = useQueryClient()
  const [pending, startTransition] = useTransition()
  const [index, setIndex] = useState(0)
  const [status, setStatus] = useState<{ text: string; tone: 'ok' | 'err' } | null>(null)
  // The approve signature moment: true for ~650ms after a successful approve so the
  // metadata strip glow-sweeps and the avatar snaps to CONFIRM before the item leaves.
  const [justApproved, setJustApproved] = useState(false)

  const selected = drafts[Math.min(index, Math.max(0, drafts.length - 1))] ?? null

  const refetch = useCallback(() => {
    void qc.invalidateQueries({ queryKey: ['tower', 'intelligence', 'torre'] })
  }, [qc])

  const doApprove = useCallback(
    (rec: TorreDraftRecord | null) => {
      if (!rec || !canApproveTorre(rec.payload)) return
      startTransition(async () => {
        const res = await approveTorreDraft(rec.id)
        if (res.error) {
          setStatus({ text: res.error.message, tone: 'err' })
          refetch()
          return
        }
        setStatus({ text: t(res.data.sideEffect, locale), tone: 'ok' })
        // Play the "shipped" moment, THEN let the approved item leave the queue.
        setJustApproved(true)
        window.setTimeout(() => {
          setJustApproved(false)
          refetch()
        }, 650)
      })
    },
    [locale, refetch],
  )

  const doReject = useCallback(
    (rec: TorreDraftRecord | null) => {
      if (!rec) return
      startTransition(async () => {
        const res = await rejectTorreDraft(rec.id)
        if (res.error) setStatus({ text: res.error.message, tone: 'err' })
        else setStatus({ text: t({ es: 'Rechazado', en: 'Rejected' }, locale), tone: 'ok' })
        refetch()
      })
    },
    [locale, refetch],
  )

  // Keyboard-complete: J/K navigate, ⌘↵ approve, R reject. Ignored while typing.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const el = e.target as HTMLElement | null
      if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)) return
      if (drafts.length === 0) return
      if (e.key === 'j' || e.key === 'ArrowDown') {
        e.preventDefault()
        setIndex((i) => Math.min(i + 1, drafts.length - 1))
      } else if (e.key === 'k' || e.key === 'ArrowUp') {
        e.preventDefault()
        setIndex((i) => Math.max(i - 1, 0))
      } else if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        doApprove(selected)
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault()
        doReject(selected)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [drafts.length, selected, doApprove, doReject])

  if (isLoading) return <Condensation caption={t({ es: 'Reuniendo artefactos…', en: 'Gathering artifacts…' }, locale)} />
  if (isError) return <p className="font-ui text-t0 text-negative">{error?.message}</p>
  if (drafts.length === 0)
    return (
      <div className="rounded-card-lg border border-line bg-surface-1 p-8 text-center">
        <p className="font-ui text-t0 text-ink-secondary">
          {t({ es: 'Sin artefactos pendientes. Corre una cotización con Mister (⌘J).', en: 'No pending artifacts. Run a quote with Mister (⌘J).' }, locale)}
        </p>
      </div>
    )

  const approvable = selected ? canApproveTorre(selected.payload) : false

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[300px_1fr]">
      {/* Queue list — host Tower chrome */}
      <div className="flex flex-col gap-1" role="listbox" aria-label={t({ es: 'Cola de revisión', en: 'Review queue' }, locale)}>
        <div className="mb-1 flex items-center justify-between px-1">
          <span className="flex items-center gap-2 font-mono text-label uppercase tracking-[0.12em] text-ink-secondary">
            <ConstellationField size={20} state={justApproved ? 'confirm' : pending ? 'thinking' : 'idle'} gradient ariaLabel="Mister" />
            {drafts.length} {t({ es: 'pendiente(s)', en: 'pending' }, locale)}
          </span>
          <span className="font-mono text-label text-ink-tertiary">J/K · ⌘↵ · R</span>
        </div>
        {drafts.map((rec, i) => {
          const active = rec.id === selected?.id
          const blockers = rec.payload.blockers?.length ?? 0
          return (
            <button
              key={rec.id}
              type="button"
              role="option"
              aria-selected={active}
              onClick={() => setIndex(i)}
              className={cn(
                'flex flex-col gap-1 rounded-control border px-3 py-2 text-left outline-none focus-visible:border-lane-accent',
                active ? 'border-lane-accent bg-surface-1' : 'border-line bg-surface-0 hover:bg-surface-2',
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-label uppercase tracking-[0.1em] text-lane-accent">{KIND_TAG[rec.kind] ?? rec.kind}</span>
                {blockers > 0 ? (
                  <span className="font-mono text-label text-negative">{blockers} ⚠</span>
                ) : (
                  <span className="font-mono text-label text-positive">✓</span>
                )}
              </div>
              <span className="truncate font-ui text-t0 text-ink-primary">{title(rec, locale)}</span>
            </button>
          )
        })}
      </div>

      {/* Selected artifact — Mister World-B preview + the named approve control */}
      <div className="flex flex-col gap-3">
        {selected && (
          <>
            {pending && <HairlineSweep />}
            <div className="rounded-panel p-4" style={{ background: MISTER_ARTIFACT.ink }}>
              {selected.payload.kind === 'COTIZACION' && <CotizacionCard payload={selected.payload} locale={locale} sweep={justApproved} />}
              {selected.payload.kind === 'HOJA_COSTOS' && <HojaCostosCard payload={selected.payload} locale={locale} sweep={justApproved} />}
              {selected.payload.kind === 'COMUNICACION' && <ComunicacionCard payload={selected.payload} locale={locale} sweep={justApproved} />}
            </div>

            {status && (
              <div
                className={cn(
                  'rounded-control px-3 py-2 font-ui text-t0',
                  status.tone === 'ok' ? 'bg-surface-2 text-positive' : 'bg-surface-2 text-negative',
                )}
                role="status"
              >
                {status.text}
              </div>
            )}

            {/* Controls — host Tower chrome; approve NAMES the side effect */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                disabled={!approvable || pending}
                onClick={() => doApprove(selected)}
                title={approvable ? undefined : t({ es: 'Resuelve los bloqueos primero', en: 'Resolve the blockers first' }, locale)}
                className={cn(
                  'rounded-control px-4 py-2 font-ui text-t0 outline-none focus-visible:ring-2',
                  approvable && !pending ? 'bg-accent text-accent-ink hover:opacity-90' : 'cursor-not-allowed bg-surface-2 text-ink-tertiary',
                )}
              >
                {pending ? (
                  <ThreeDots />
                ) : (
                  <>
                    {t(approveSideEffect(selected.payload), locale)} <span className="font-mono text-label opacity-70">⌘↵</span>
                  </>
                )}
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={() => doReject(selected)}
                className="rounded-control border border-line px-4 py-2 font-ui text-t0 text-ink-secondary outline-none hover:text-negative focus-visible:border-negative"
              >
                {t({ es: 'Rechazar', en: 'Reject' }, locale)} <span className="font-mono text-label opacity-70">R</span>
              </button>

              {selected.payload.kind === 'COTIZACION' && (
                <button
                  type="button"
                  onClick={() => void exportCotizacionXlsx(selected.payload as CotizacionPayload, locale === 'en' ? 'en' : 'es')}
                  className="rounded-control border border-line px-3 py-2 font-mono text-label uppercase tracking-[0.08em] text-ink-secondary outline-none hover:text-ink-primary focus-visible:border-lane-accent"
                >
                  XLSX
                </button>
              )}
              {selected.payload.kind === 'HOJA_COSTOS' && (
                <button
                  type="button"
                  onClick={() => void exportHojaCostosXlsx(selected.payload as HojaCostosPayload)}
                  className="rounded-control border border-line px-3 py-2 font-mono text-label uppercase tracking-[0.08em] text-ink-secondary outline-none hover:text-ink-primary focus-visible:border-lane-accent"
                >
                  XLSX
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
