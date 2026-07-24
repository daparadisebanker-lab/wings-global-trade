import { getMorningBrief } from '@/lib/actions/torre-brief'
import { MorningBriefView } from '@/components/brief/MorningBriefView'
import { DEFAULT_LOCALE, t } from '@/lib/i18n'

// The Morning Brief (L5 Reportar) — the operator's daily artifact (spec 01 §4). Server-rendered
// per identity; getMorningBrief resolves the caller's role + assembles signals/drafts/telemetry
// under RLS. Never hard-fails: an unauthorized/absent state degrades to a calm message.
export const dynamic = 'force-dynamic'

export default async function BriefPage() {
  const locale = DEFAULT_LOCALE
  const res = await getMorningBrief()

  if (!res.data) {
    return (
      <div className="flex flex-col gap-8 p-6">
        <header className="flex flex-col gap-1">
          <span className="font-mono text-label uppercase tracking-[0.15em] text-lane-accent">REP · Brief</span>
          <h1 className="font-display text-t3 text-ink-primary">{t({ es: 'Brief', en: 'Brief' }, locale)}</h1>
        </header>
        <p className="font-mono text-label uppercase tracking-[0.12em] text-ink-secondary">
          {res.error.code === 'UNAUTHORIZED'
            ? t({ es: 'Inicia sesión para ver tu brief.', en: 'Sign in to see your brief.' }, locale)
            : t({ es: 'No se pudo cargar el brief.', en: 'Could not load the brief.' }, locale)}
        </p>
      </div>
    )
  }

  return <MorningBriefView brief={res.data} locale={locale} />
}
