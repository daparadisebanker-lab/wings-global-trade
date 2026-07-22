import { DEFAULT_LOCALE, t, type Locale } from '@/lib/i18n'
import { listAuditLog } from '@/lib/actions/audit'
import { formatRelative } from './relative-time'

// Signals feed — the recent cross-module activity stream. The ONLY such stream in
// TOWER is the group-admin audit log (listAuditLog self-gates: non-admins get
// FORBIDDEN_LANE). So this renders for group admins only; for everyone else it
// returns null — no fabricated activity. Capped at 20, newest-first, relative time.
export async function SignalsFeed({ locale = DEFAULT_LOCALE }: { locale?: Locale }) {
  const res = await listAuditLog({ limit: 20 })
  if (!res.data || res.data.rows.length === 0) return null

  const now = new Date()

  return (
    <section className="flex flex-col gap-3">
      <h2 className="font-mono text-label uppercase tracking-[0.12em] text-ink-secondary">
        {t({ es: 'Actividad reciente', en: 'Recent activity' }, locale)}
      </h2>
      <ul className="flex flex-col rounded-card border border-line bg-surface-1">
        {res.data.rows.map((row) => (
          <li
            key={row.id}
            className="flex items-center justify-between gap-3 border-b border-line px-4 py-2.5 last:border-b-0"
          >
            <span className="min-w-0 truncate font-ui text-t0 text-ink-primary">
              <span className="font-mono text-label uppercase tracking-[0.1em] text-lane-accent">{row.action}</span>{' '}
              {row.tableName}
            </span>
            <time className="shrink-0 font-mono text-label tracking-[0.04em] text-ink-secondary" dateTime={row.at}>
              {formatRelative(row.at, now, locale)}
            </time>
          </li>
        ))}
      </ul>
    </section>
  )
}
