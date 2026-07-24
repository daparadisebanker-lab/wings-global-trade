'use client'

// TeamSpace (WS6) — the org-wide internal note stream with @mentions. Compose a
// note, @mention teammates (an in-system notification, no email — D3), read the
// activity stream, and clear your mentions. Deliberately minimal ("we don't need
// it to compete with the dock"). Dormant-safe: when the backend isn't available
// yet (tower_55 unapplied) the composer is hidden behind a "coming soon" note.
import { useMemo, useState, useTransition } from 'react'
import { cn } from '@wings/trade-ui'
import {
  postTeamNote,
  markMentionRead,
  markAllMentionsRead,
} from '@/lib/actions/team-space'
import {
  splitBodyMentions,
  filterTeammates,
  type TeamNote,
  type TeamMention,
  type Teammate,
} from '@/lib/actions/team-space-logic'
import { DEFAULT_LOCALE, t, type Locale } from '@/lib/i18n'

const LABEL = 'font-mono text-label uppercase tracking-[0.08em] text-ink-secondary'

/** Render a note body with @-tokens tinted. */
function Body({ text }: { text: string }) {
  return (
    <p className="whitespace-pre-wrap font-ui text-t0 text-ink-primary">
      {splitBodyMentions(text).map((seg, i) =>
        seg.mention ? (
          <span key={i} className="text-lane-accent">
            {seg.text}
          </span>
        ) : (
          <span key={i}>{seg.text}</span>
        ),
      )}
    </p>
  )
}

function when(iso: string): string {
  // Terse date; the stream is chronological so a full timestamp is noise.
  return iso.slice(0, 10)
}

export function TeamSpace({
  available,
  currentUserId,
  initialNotes,
  initialMentions,
  roster,
  locale = DEFAULT_LOCALE,
}: {
  available: boolean
  currentUserId: string
  initialNotes: TeamNote[]
  initialMentions: TeamMention[]
  roster: Teammate[]
  locale?: Locale
}) {
  const [notes, setNotes] = useState(initialNotes)
  const [mentions, setMentions] = useState(initialMentions)
  const [tab, setTab] = useState<'stream' | 'mentions'>('stream')
  const [body, setBody] = useState('')
  const [picked, setPicked] = useState<Teammate[]>([])
  const [query, setQuery] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPosting, startPost] = useTransition()

  // Never offer to @mention yourself, and drop already-picked from the dropdown.
  const pickable = useMemo(() => {
    const takenIds = new Set([currentUserId, ...picked.map((p) => p.id)])
    return filterTeammates(roster, query).filter((tm) => !takenIds.has(tm.id))
  }, [roster, query, picked, currentUserId])

  const unread = mentions.filter((m) => !m.read).length

  function submit() {
    const text = body.trim()
    if (!text) return
    setError(null)
    startPost(async () => {
      const res = await postTeamNote({ body: text, mentionedUserIds: picked.map((p) => p.id) })
      if (res.error) {
        setError(res.error.message)
        return
      }
      setNotes((prev) => [res.data, ...prev])
      setBody('')
      setPicked([])
      setQuery('')
    })
  }

  function markOne(id: string) {
    setMentions((prev) => prev.map((m) => (m.id === id ? { ...m, read: true } : m)))
    void markMentionRead(id)
  }
  function markAll() {
    setMentions((prev) => prev.map((m) => ({ ...m, read: true })))
    void markAllMentionsRead()
  }

  if (!available) {
    return (
      <div className="rounded-card border border-line bg-surface-1 p-6">
        <p className="font-ui text-t0 text-ink-secondary">
          {t(
            { es: 'El espacio de equipo se activará pronto.', en: 'The team space will be available soon.' },
            locale,
          )}
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Composer */}
      <div className="flex flex-col gap-3 rounded-card border border-line bg-surface-1 p-4">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          maxLength={2000}
          rows={3}
          placeholder={t({ es: 'Escribe una nota para el equipo…', en: 'Write a note for the team…' }, locale)}
          aria-label={t({ es: 'Nota para el equipo', en: 'Note for the team' }, locale)}
          className="w-full rounded-card border border-line bg-surface-0 px-3 py-2 font-ui text-t0 text-ink-primary outline-none focus-visible:border-lane-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-lane-accent"
        />

        {/* Mention picker */}
        <div className="flex flex-col gap-2">
          <span className={LABEL}>{t({ es: 'Mencionar', en: 'Mention' }, locale)}</span>
          {picked.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {picked.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPicked((prev) => prev.filter((x) => x.id !== p.id))}
                  className="flex items-center gap-1 rounded-pill border border-line bg-surface-2 px-2 py-1 font-mono text-label text-lane-accent hover:border-lane-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lane-accent"
                  aria-label={`${t({ es: 'Quitar', en: 'Remove' }, locale)} ${p.name}`}
                >
                  @{p.name} ✕
                </button>
              ))}
            </div>
          ) : null}
          {roster.length > 0 ? (
            <>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t({ es: 'Buscar compañero…', en: 'Search teammate…' }, locale)}
                aria-label={t({ es: 'Buscar compañero', en: 'Search teammate' }, locale)}
                className="rounded-card border border-line bg-surface-0 px-2 py-1.5 font-ui text-t0 text-ink-primary outline-none focus-visible:border-lane-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-lane-accent"
              />
              {query.trim() && pickable.length > 0 ? (
                <ul className="flex max-h-40 flex-col gap-0.5 overflow-y-auto rounded-card border border-line" role="listbox" aria-label={t({ es: 'Compañeros', en: 'Teammates' }, locale)}>
                  {pickable.map((tm) => (
                    <li key={tm.id} role="presentation">
                      <button
                        type="button"
                        role="option"
                        aria-selected={false}
                        onClick={() => {
                          setPicked((prev) => [...prev, tm])
                          setQuery('')
                        }}
                        className="w-full px-2 py-1.5 text-left font-ui text-t0 text-ink-secondary hover:bg-surface-2 hover:text-ink-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-lane-accent"
                      >
                        {tm.name}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </>
          ) : null}
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={submit}
            disabled={isPosting || !body.trim()}
            className="rounded-card bg-accent px-4 py-2 font-mono text-label uppercase tracking-[0.1em] text-surface-0 disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lane-accent"
          >
            {t({ es: 'Publicar', en: 'Post' }, locale)}
          </button>
          {error ? (
            <span role="alert" className="font-ui text-t0 text-negative">
              {error}
            </span>
          ) : null}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex w-fit overflow-hidden rounded-card border border-line">
        {(['stream', 'mentions'] as const).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setTab(v)}
            aria-pressed={tab === v}
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 font-mono text-label uppercase tracking-[0.08em] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-lane-accent',
              tab === v ? 'bg-accent text-surface-0' : 'text-ink-secondary hover:bg-surface-2',
            )}
          >
            {v === 'stream'
              ? t({ es: 'Actividad', en: 'Activity' }, locale)
              : t({ es: 'Mis menciones', en: 'My mentions' }, locale)}
            {v === 'mentions' && unread > 0 ? (
              <span className="rounded-pill bg-lane-accent px-1.5 font-mono text-label text-surface-0">{unread}</span>
            ) : null}
          </button>
        ))}
      </div>

      {tab === 'stream' ? (
        <section className="flex flex-col gap-2">
          {notes.length === 0 ? (
            <p className="font-ui text-t0 text-ink-secondary">
              {t({ es: 'Aún no hay notas. Escribe la primera.', en: 'No notes yet. Write the first one.' }, locale)}
            </p>
          ) : (
            <ul className="flex flex-col divide-y divide-line rounded-card border border-line">
              {notes.map((nte) => (
                <li key={nte.id} className="flex flex-col gap-1 px-4 py-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-label uppercase tracking-[0.08em] text-ink-primary">{nte.authorName}</span>
                    <span className="font-mono text-label text-ink-tertiary" data-numeric>
                      {when(nte.createdAt)}
                    </span>
                  </div>
                  <Body text={nte.body} />
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : (
        <section className="flex flex-col gap-2">
          {unread > 0 ? (
            <button
              type="button"
              onClick={markAll}
              className="w-fit font-mono text-label uppercase tracking-[0.08em] text-lane-accent hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lane-accent"
            >
              {t({ es: 'Marcar todo como leído', en: 'Mark all read' }, locale)}
            </button>
          ) : null}
          {mentions.length === 0 ? (
            <p className="font-ui text-t0 text-ink-secondary">
              {t({ es: 'No tienes menciones.', en: 'You have no mentions.' }, locale)}
            </p>
          ) : (
            <ul className="flex flex-col divide-y divide-line rounded-card border border-line">
              {mentions.map((m) => (
                <li key={m.id} className={cn('flex flex-col gap-1 px-4 py-3', !m.read && 'bg-surface-1')}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-label uppercase tracking-[0.08em] text-ink-primary">
                      {m.authorName}
                      {!m.read ? <span className="ml-2 text-lane-accent">●</span> : null}
                    </span>
                    {!m.read ? (
                      <button
                        type="button"
                        onClick={() => markOne(m.id)}
                        className="font-mono text-label uppercase tracking-[0.08em] text-ink-secondary hover:text-lane-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lane-accent"
                      >
                        {t({ es: 'Marcar leído', en: 'Mark read' }, locale)}
                      </button>
                    ) : null}
                  </div>
                  <Body text={m.body} />
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  )
}
