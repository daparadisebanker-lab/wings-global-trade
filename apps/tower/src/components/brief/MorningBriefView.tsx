// src/components/brief/MorningBriefView.tsx
// Mister Torre — the Morning Brief screen (L5 Reportar), spec 01 §4: "one screen, ≤90s to
// read". A thin renderer over the tested pure core (buildMorningBrief) — no logic here beyond
// presentation. Host-chrome World-A tokens only (no raw hex/px). The stillness IS the design:
// when nothing needs the operator, the Brief earns a calm quiet state instead of an empty error.
import Link from 'next/link'
import { t, type Locale, type Localized } from '@/lib/i18n'
import { formatHoursReturned } from '@/lib/torre/brief-view'
import type { MorningBrief } from '@/lib/torre/brief'
import type { Severity, WatchSignal } from '@/lib/torre/watch'
import type { PendingDraft } from '@/lib/torre/brief'
import type { TorreArtifactKind } from '@/lib/torre/artifacts'

const TAG: Localized = { es: 'REP · Brief', en: 'REP · Brief' }

const SEVERITY_LABEL: Record<Severity, Localized> = {
  inmediato: { es: 'Inmediato', en: 'Immediate' },
  alto: { es: 'Alto', en: 'High' },
  medio: { es: 'Medio', en: 'Medium' },
  bajo: { es: 'Bajo', en: 'Low' },
}
// Severity carries its weight in the ink, not a decorative badge (numbers-as-brand restraint).
const SEVERITY_INK: Record<Severity, string> = {
  inmediato: 'text-negative',
  alto: 'text-gold',
  medio: 'text-ink-primary',
  bajo: 'text-ink-secondary',
}

const KIND_LABEL: Record<TorreArtifactKind, Localized> = {
  HOJA_COSTOS: { es: 'Hoja de costos', en: 'Cost sheet' },
  COTIZACION: { es: 'Cotización', en: 'Quote' },
  COMUNICACION: { es: 'Comunicación', en: 'Message' },
  REPORTE_ESTADO: { es: 'Reporte de estado', en: 'Status report' },
  CHECKLIST_DOCS: { es: 'Checklist de documentos', en: 'Document checklist' },
  ACTA: { es: 'Acta', en: 'Minutes' },
  SOP: { es: 'Procedimiento', en: 'SOP' },
}

export function MorningBriefView({ brief, locale }: { brief: MorningBrief; locale: Locale }) {
  const { urgent, attention, drafts, telemetry, quiet } = brief
  return (
    <div className="flex flex-col gap-8 p-6">
      <header className="flex flex-col gap-1">
        <span className="font-mono text-label uppercase tracking-[0.15em] text-lane-accent" data-numeric>
          {t(TAG, locale)}
        </span>
        <h1 className="font-display text-t3 text-ink-primary">{t(brief.masthead, locale)}</h1>
      </header>

      {quiet ? (
        <QuietState locale={locale} />
      ) : (
        <div className="flex flex-col gap-8">
          {urgent.length > 0 ? (
            <SignalBand title={{ es: 'Ahora', en: 'Now' }} hint={{ es: 'Necesita tu atención hoy', en: 'Needs you today' }} signals={urgent} locale={locale} />
          ) : null}
          {attention.length > 0 ? (
            <SignalBand title={{ es: 'En observación', en: 'Watch' }} hint={{ es: 'Batido — sin urgencia inmediata', en: 'Batched — no immediate urgency' }} signals={attention} locale={locale} />
          ) : null}
          {drafts.length > 0 ? <DraftsBand drafts={drafts} locale={locale} /> : null}
        </div>
      )}

      {telemetry ? <TelemetryFooter telemetry={telemetry} locale={locale} /> : null}
    </div>
  )
}

function BandHeader({ title, hint, count, locale }: { title: Localized; hint: Localized; count: number; locale: Locale }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-line pb-2">
      <div className="flex items-baseline gap-3">
        <h2 className="font-display text-t1 text-ink-primary">{t(title, locale)}</h2>
        <span className="font-mono text-label uppercase tracking-[0.12em] text-ink-tertiary">{t(hint, locale)}</span>
      </div>
      <span className="font-mono text-label text-ink-tertiary" data-numeric>
        {count}
      </span>
    </div>
  )
}

function SignalBand({ title, hint, signals, locale }: { title: Localized; hint: Localized; signals: WatchSignal[]; locale: Locale }) {
  return (
    <section className="flex flex-col gap-3">
      <BandHeader title={title} hint={hint} count={signals.length} locale={locale} />
      <ul className="flex flex-col gap-2">
        {signals.map((s, i) => (
          <li
            key={`${s.rule}-${s.importRef}-${i}`}
            className="flex flex-col gap-1 rounded-card border border-line bg-surface-0 px-4 py-3"
          >
            <div className="flex items-baseline justify-between gap-3">
              <span className="font-ui text-t0 text-ink-primary">{t(s.title, locale)}</span>
              <span className={`shrink-0 font-mono text-label uppercase tracking-[0.1em] ${SEVERITY_INK[s.severity]}`}>
                {t(SEVERITY_LABEL[s.severity], locale)}
              </span>
            </div>
            <p className="font-ui text-label text-ink-secondary">{t(s.detail, locale)}</p>
            <span className="font-mono text-label uppercase tracking-[0.1em] text-ink-tertiary" data-numeric>
              {s.importRef}
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}

function DraftsBand({ drafts, locale }: { drafts: PendingDraft[]; locale: Locale }) {
  return (
    <section className="flex flex-col gap-3">
      <BandHeader
        title={{ es: 'Borradores listos', en: 'Ready drafts' }}
        hint={{ es: 'Esperan tu aprobación', en: 'Awaiting your approval' }}
        count={drafts.length}
        locale={locale}
      />
      <ul className="flex flex-col gap-2">
        {drafts.map((d) => (
          <li key={d.id}>
            <Link
              href="/intelligence"
              className="flex items-center justify-between gap-3 rounded-card border border-line bg-surface-0 px-4 py-3 outline-none transition-colors hover:bg-surface-1 focus-visible:border-lane-accent"
            >
              <span className="font-ui text-t0 text-ink-primary">{d.title}</span>
              <span className="shrink-0 font-mono text-label uppercase tracking-[0.1em] text-ink-tertiary">
                {t(KIND_LABEL[d.kind], locale)}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}

function TelemetryFooter({ telemetry, locale }: { telemetry: NonNullable<MorningBrief['telemetry']>; locale: Locale }) {
  return (
    <section className="flex flex-col gap-3 rounded-panel border border-line bg-surface-1 p-5">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="font-mono text-label uppercase tracking-[0.12em] text-ink-secondary">
          {t({ es: 'Devuelto por Mister · últimos 7 días', en: 'Returned by Mister · last 7 days' }, locale)}
        </h2>
      </div>
      <div className="flex flex-wrap items-baseline gap-x-8 gap-y-3">
        <Stat value={formatHoursReturned(telemetry.hoursReturned)} label={{ es: 'Horas devueltas', en: 'Hours returned' }} locale={locale} emphatic />
        <Stat value={String(telemetry.draftsApproved)} label={{ es: 'Aprobados', en: 'Approved' }} locale={locale} />
        {telemetry.signalsResolved !== undefined ? (
          <Stat value={String(telemetry.signalsResolved)} label={{ es: 'Señales resueltas', en: 'Signals resolved' }} locale={locale} />
        ) : null}
      </div>
      {telemetry.basis && telemetry.basis.length > 0 ? (
        <p className="font-mono text-label text-ink-tertiary">
          {telemetry.basis
            .map((b) => `${b.count} × ${t(KIND_EVENT_LABEL[b.kind], locale)} = ${b.minutesSaved} min`)
            .join('  ·  ')}
        </p>
      ) : null}
    </section>
  )
}

function Stat({ value, label, locale, emphatic }: { value: string; label: Localized; locale: Locale; emphatic?: boolean }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className={`font-mono tabular-nums ${emphatic ? 'text-t3 text-lane-accent' : 'text-t2 text-ink-primary'}`} data-numeric>
        {value}
      </span>
      <span className="font-mono text-label uppercase tracking-[0.1em] text-ink-tertiary">{t(label, locale)}</span>
    </div>
  )
}

// The telemetry basis names its time-saved event kinds (from brief.ts TimeSavedEvent['kind']).
const KIND_EVENT_LABEL: Record<string, Localized> = {
  quote_run: { es: 'cotización', en: 'quote' },
  draft_approved: { es: 'borrador', en: 'draft' },
  doc_generated: { es: 'documento', en: 'document' },
  signal_resolved: { es: 'señal', en: 'signal' },
}

function QuietState({ locale }: { locale: Locale }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-panel border border-line bg-surface-0 px-6 py-16 text-center">
      <p className="font-display text-t2 text-ink-primary">{t({ es: 'La torre está en calma', en: 'The tower is quiet' }, locale)}</p>
      <p className="max-w-md font-ui text-label text-ink-secondary">
        {t(
          { es: 'Nada requiere tu atención ahora. Mister sigue vigilando y te avisará si algo cambia.', en: 'Nothing needs you right now. Mister keeps watch and will surface anything that changes.' },
          locale,
        )}
      </p>
    </div>
  )
}
