// Mister Torre — the operational DOCUMENT family renderers (L3 Documentar), drawn
// inside Mister's World-B navy bubble (mister-theme.ts) to match the quote-artifact
// cards. The four kinds (reporte_estado · checklist_docs · acta · sop) render
// STRUCTURALLY — milestones + risks, a checklist status table, decisions + tasks,
// numbered steps — instead of the raw Markdown <pre> they used before. Honesty
// rides through: open blockers show a "No aprobable" banner and a checklist's
// missing-required documents are marked plainly. No money here (operational docs).
import { DEFAULT_LOCALE, t, type Locale } from '@/lib/i18n'
import { MISTER_ARTIFACT } from './mister-theme'
import {
  type Blocker,
  type ReporteEstadoPayload,
  type ChecklistDocsPayload,
  type ActaPayload,
  type SopPayload,
  type TorreArtifactPayload,
} from '@/lib/torre/artifacts'

const { text: TEXT, body: BODY, muted: MUTED, gold: ACCENT, steel: STEEL, error: ERR, panelBg: PANEL_BG, fieldBg: FIELD_BG, border: BORDER, steelLine: STEEL_LINE, mono: MONO } =
  MISTER_ARTIFACT

type DocPayload = ReporteEstadoPayload | ChecklistDocsPayload | ActaPayload | SopPayload

const KIND_LABEL: Record<DocPayload['kind'], { es: string; en: string }> = {
  REPORTE_ESTADO: { es: 'Reporte de estado', en: 'Status report' },
  CHECKLIST_DOCS: { es: 'Checklist de documentos', en: 'Document checklist' },
  ACTA: { es: 'Acta de reunión', en: 'Meeting minutes' },
  SOP: { es: 'Procedimiento (SOP)', en: 'Procedure (SOP)' },
}

// Bilingual labels for the closed enums, so the EN variant reads in English (the
// raw schema tokens are Spanish). Fall back to the raw token if a value is unmapped.
const SEVERITY_LABEL: Record<string, { es: string; en: string }> = {
  alta: { es: 'Alta', en: 'High' },
  media: { es: 'Media', en: 'Medium' },
  baja: { es: 'Baja', en: 'Low' },
}
const STATUS_LABEL: Record<string, { es: string; en: string }> = {
  presente: { es: 'Presente', en: 'Present' },
  vencido: { es: 'Vencido', en: 'Expired' },
  faltante: { es: 'Faltante', en: 'Missing' },
}

function Kicker({ children }: { children: React.ReactNode }) {
  return <span style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: MUTED }}>{children}</span>
}

function SectionH({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ marginTop: 12, marginBottom: 4, fontFamily: MONO, fontSize: 10.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: MUTED }}>
      {children}
    </div>
  )
}

function MetaLine({ children }: { children: React.ReactNode }) {
  return <div style={{ fontFamily: MONO, fontSize: 10.5, color: MUTED }}>{children}</div>
}

function BlockerBanner({ blockers, locale }: { blockers: Blocker[]; locale: Locale }) {
  if (blockers.length === 0) return null
  return (
    <div style={{ marginTop: 10, padding: '8px 10px', border: `1px solid ${ERR}`, borderRadius: 8, background: FIELD_BG }}>
      <div style={{ fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', color: ERR, marginBottom: 6 }}>
        {t({ es: 'No aprobable — verificar', en: 'Not approvable — verify' }, locale)}
      </div>
      {blockers.map((b) => (
        <div key={b.id} style={{ fontSize: 12.5, color: BODY, marginBottom: 2 }}>• {locale === 'en' ? b.reason.en : b.reason.es}</div>
      ))}
    </div>
  )
}

function Shell({ payload, locale, children }: { payload: DocPayload; locale: Locale; children: React.ReactNode }) {
  return (
    <div style={{ background: PANEL_BG, border: BORDER, borderRadius: 12, padding: '12px 14px', color: TEXT }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
        <Kicker>{t(KIND_LABEL[payload.kind], locale)}</Kicker>
        <span style={{ fontFamily: MONO, fontSize: 10, color: MUTED }}>v{payload.version}</span>
      </div>
      <div style={{ fontSize: 15, fontWeight: 600, color: TEXT, margin: '4px 0 4px' }}>{payload.title}</div>
      {children}
      <BlockerBanner blockers={payload.blockers} locale={locale} />
      <div style={{ marginTop: 10, paddingTop: 6, borderTop: BORDER, fontFamily: MONO, fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: MUTED }}>
        MISTER · {payload.kind} · v{payload.version}
      </div>
    </div>
  )
}

const SEV_COLOR: Record<string, string> = { alta: ERR, media: ACCENT, baja: STEEL }

function ReporteEstado({ p, locale }: { p: ReporteEstadoPayload; locale: Locale }) {
  return (
    <Shell payload={p} locale={locale}>
      <MetaLine>
        {t({ es: 'Import', en: 'Import' }, locale)}: {p.importRef} · {t({ es: 'Estado', en: 'Status' }, locale)}: {p.status} · {t({ es: 'Al', en: 'As of' }, locale)}: {p.asOf}
      </MetaLine>
      {p.summary ? <p style={{ fontSize: 12.5, color: BODY, lineHeight: 1.5, margin: '8px 0 0' }}>{p.summary}</p> : null}
      {p.milestones.length > 0 ? (
        <>
          <SectionH>{t({ es: 'Hitos', en: 'Milestones' }, locale)}</SectionH>
          {p.milestones.map((m, i) => (
            <div key={i} style={{ fontSize: 12.5, color: m.done ? MUTED : BODY, lineHeight: 1.6 }}>
              <span style={{ color: m.done ? STEEL : MUTED }}>{m.done ? '☑' : '☐'}</span> {m.label}
              {m.date ? <span style={{ color: MUTED }}> · {m.date}</span> : null}
            </div>
          ))}
        </>
      ) : null}
      {p.risks.length > 0 ? (
        <>
          <SectionH>{t({ es: 'Riesgos', en: 'Risks' }, locale)}</SectionH>
          {p.risks.map((r, i) => (
            <div key={i} style={{ fontSize: 12.5, color: BODY, lineHeight: 1.5 }}>
              <span style={{ fontFamily: MONO, fontSize: 10, textTransform: 'uppercase', color: SEV_COLOR[r.severity.toLowerCase()] ?? ACCENT }}>
                {SEVERITY_LABEL[r.severity.toLowerCase()]?.[locale] ?? r.severity}
              </span> — {r.note}
            </div>
          ))}
        </>
      ) : null}
      {p.nextActions.length > 0 ? (
        <>
          <SectionH>{t({ es: 'Próximas acciones', en: 'Next actions' }, locale)}</SectionH>
          {p.nextActions.map((a, i) => (
            <div key={i} style={{ fontSize: 12.5, color: BODY, lineHeight: 1.5 }}>· {a}</div>
          ))}
        </>
      ) : null}
    </Shell>
  )
}

function ChecklistDocs({ p, locale }: { p: ChecklistDocsPayload; locale: Locale }) {
  const missing = p.items.filter((i) => i.required && i.status !== 'presente')
  const markColor = (s: string) => (s === 'presente' ? STEEL : s === 'vencido' ? ACCENT : ERR)
  const mark = (s: string) => (s === 'presente' ? '✓' : s === 'vencido' ? '⏳' : '✗')
  return (
    <Shell payload={p} locale={locale}>
      <MetaLine>
        {t({ es: 'Import', en: 'Import' }, locale)}: {p.importRef} · {t({ es: 'Etapa', en: 'Stage' }, locale)}: {p.stage}
      </MetaLine>
      <div style={{ marginTop: 8, border: `1px solid ${STEEL_LINE}`, borderRadius: 8, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 8, padding: '6px 10px', background: FIELD_BG }}>
          <Kicker>{t({ es: 'Documento', en: 'Document' }, locale)}</Kicker>
          <Kicker>{t({ es: 'Obl.', en: 'Req.' }, locale)}</Kicker>
          <Kicker>{t({ es: 'Estado', en: 'Status' }, locale)}</Kicker>
        </div>
        {p.items.map((i, idx) => (
          <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 8, padding: '6px 10px', borderTop: `1px solid ${STEEL_LINE}`, alignItems: 'baseline' }}>
            <span style={{ fontSize: 12.5, color: BODY }}>
              {i.doc}
              {i.note ? <span style={{ color: MUTED }}> — {i.note}</span> : null}
            </span>
            <span style={{ fontFamily: MONO, fontSize: 11, color: MUTED }}>{i.required ? t({ es: 'Sí', en: 'Yes' }, locale) : 'No'}</span>
            <span style={{ fontFamily: MONO, fontSize: 11.5, color: markColor(i.status), whiteSpace: 'nowrap' }}>
              {mark(i.status)} {STATUS_LABEL[i.status]?.[locale] ?? i.status}
            </span>
          </div>
        ))}
      </div>
      {missing.length > 0 ? (
        <div style={{ marginTop: 8, fontSize: 12, color: ERR }}>
          {t({ es: `Faltan ${missing.length} documento(s) obligatorio(s).`, en: `${missing.length} required document(s) missing.` }, locale)}
        </div>
      ) : null}
    </Shell>
  )
}

function Acta({ p, locale }: { p: ActaPayload; locale: Locale }) {
  return (
    <Shell payload={p} locale={locale}>
      <MetaLine>
        {t({ es: 'Fecha', en: 'Date' }, locale)}: {p.date} · {t({ es: 'Asistentes', en: 'Attendees' }, locale)}: {p.attendees.join(', ') || '—'}
      </MetaLine>
      {p.decisions.length > 0 ? (
        <>
          <SectionH>{t({ es: 'Decisiones', en: 'Decisions' }, locale)}</SectionH>
          {p.decisions.map((d, i) => (
            <div key={i} style={{ fontSize: 12.5, color: BODY, lineHeight: 1.5 }}>
              <span style={{ fontWeight: 600, color: TEXT }}>{d.topic}:</span> {d.decision}
              {d.owner ? <span style={{ color: MUTED }}> ({d.owner})</span> : null}
            </div>
          ))}
        </>
      ) : null}
      {p.actionItems.length > 0 ? (
        <>
          <SectionH>{t({ es: 'Tareas', en: 'Action items' }, locale)}</SectionH>
          {p.actionItems.map((a, i) => (
            <div key={i} style={{ fontSize: 12.5, color: BODY, lineHeight: 1.6 }}>
              <span style={{ color: MUTED }}>☐</span> {a.task} — <span style={{ fontWeight: 600, color: TEXT }}>{a.owner}</span>
              {a.due ? <span style={{ color: MUTED }}> · {t({ es: 'vence', en: 'due' }, locale)} {a.due}</span> : null}
            </div>
          ))}
        </>
      ) : null}
    </Shell>
  )
}

function Sop({ p, locale }: { p: SopPayload; locale: Locale }) {
  const steps = p.steps.slice().sort((a, b) => a.n - b.n)
  return (
    <Shell payload={p} locale={locale}>
      <MetaLine>
        {t({ es: 'Alcance', en: 'Scope' }, locale)}: {p.scope}
      </MetaLine>
      <div style={{ marginTop: 8 }}>
        {steps.map((s, i) => (
          <div key={`${s.n}-${i}`} style={{ fontSize: 12.5, color: BODY, lineHeight: 1.5, marginBottom: 6 }}>
            <span style={{ fontFamily: MONO, color: ACCENT }}>{s.n}.</span> {s.action}
            {s.owner ? <span style={{ color: MUTED }}> — {s.owner}</span> : null}
            {s.note ? <div style={{ fontSize: 11.5, color: MUTED, paddingLeft: 16 }}>› {s.note}</div> : null}
          </div>
        ))}
      </div>
    </Shell>
  )
}

/** Render a Torre operational document artifact. Accepts the full payload union and
 *  narrows to the four L3 document kinds; any other kind renders nothing (the queue
 *  only mounts this for DOCUMENT_KINDS). */
export function TorreDocumentArtifact({ payload, locale = DEFAULT_LOCALE }: { payload: TorreArtifactPayload; locale?: Locale }) {
  switch (payload.kind) {
    case 'REPORTE_ESTADO':
      return <ReporteEstado p={payload} locale={locale} />
    case 'CHECKLIST_DOCS':
      return <ChecklistDocs p={payload} locale={locale} />
    case 'ACTA':
      return <Acta p={payload} locale={locale} />
    case 'SOP':
      return <Sop p={payload} locale={locale} />
    default:
      return null
  }
}
