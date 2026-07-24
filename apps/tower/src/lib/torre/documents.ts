// src/lib/torre/documents.ts
// Mister Torre — the operational document family exporters + frame (Loop L3, Documentar).
// PURE + unit-tested. Each document artifact type (reporte_estado, checklist_docs, acta,
// sop) gets a Markdown exporter (its "renderer/exporter" leg) and shares one branded
// document FRAME (header/footer model the print component renders with tokens).
//
// Honesty rides through: a checklist with a MISSING required doc, or a report with an
// open blocker, is unapprovable (isApprovable) — the exporter shows the gap plainly, it
// never papers over it. No money here; these are operational documents.
import {
  isApprovable,
  type ActaPayload,
  type ChecklistDocsPayload,
  type ReporteEstadoPayload,
  type SopPayload,
  type TorreArtifactPayload,
} from './artifacts'

/** The four operational document artifact payloads (L3). */
export type DocumentPayload = ReporteEstadoPayload | ChecklistDocsPayload | ActaPayload | SopPayload

export interface DocumentFrame {
  brand: string
  kind: TorreArtifactPayload['kind']
  title: string
  version: number
  approvable: boolean
  /** The §5 credit for a non-Wings brand (footer/colophon only). */
  endorsement: { es: string; en: string } | null
}

const WINGS = 'Wings Global Trade'

/** PURE: the shared branded frame for a document artifact (the four document kinds only). */
export function documentFrame(p: DocumentPayload, brand = WINGS): DocumentFrame {
  return {
    brand,
    kind: p.kind,
    title: p.title,
    version: p.version,
    approvable: isApprovable(p),
    endorsement: brand !== WINGS ? { es: 'Representado por Wings Global Trade', en: 'Represented by Wings Global Trade' } : null,
  }
}

/** Collapse newlines so a value can't forge headings / extra lines / warning text. */
function line(s: string): string {
  return s.replace(/[\r\n]+/g, ' ').trim()
}
/** Escape a Markdown TABLE cell: no pipes (column injection) and no newlines. */
function cell(s: string): string {
  return line(s).replace(/\|/g, '\\|')
}
function h(title: string): string {
  return `# ${line(title)}\n`
}
/** A shared "## Bloqueos" section so a blocked document reads as blocked in EVERY exporter. */
function blockersSection(blockers: { reason: { es: string } }[]): string[] {
  if (!blockers.length) return []
  return ['', '## Bloqueos', ...blockers.map((b) => `- ⚠ ${line(b.reason.es)}`)]
}

/** PURE: reporte_estado → Markdown. */
export function reporteEstadoMarkdown(p: ReporteEstadoPayload): string {
  const lines = [
    h(p.title),
    `**Import:** ${p.importRef}  ·  **Estado:** ${p.status}  ·  **Al:** ${p.asOf}`,
    '',
    p.summary,
    '',
    '## Hitos',
    ...p.milestones.map((m) => `- [${m.done ? 'x' : ' '}] ${m.label}${m.date ? ` (${m.date})` : ''}`),
  ]
  if (p.risks.length) {
    lines.push('', '## Riesgos', ...p.risks.map((r) => `- **${r.severity.toUpperCase()}** — ${r.note}`))
  }
  if (p.nextActions.length) {
    lines.push('', '## Próximas acciones', ...p.nextActions.map((a) => `- ${line(a)}`))
  }
  lines.push(...blockersSection(p.blockers))
  return lines.join('\n')
}

/** PURE: checklist_docs → Markdown. Missing required docs are marked, never hidden. */
export function checklistDocsMarkdown(p: ChecklistDocsPayload): string {
  const mark = (s: string) => (s === 'presente' ? '✓' : s === 'vencido' ? '⏳' : '✗')
  const lines = [
    h(p.title),
    `**Import:** ${line(p.importRef)}  ·  **Etapa:** ${line(p.stage)}`,
    '',
    '| Documento | Requerido | Estado |',
    '| --- | --- | --- |',
    ...p.items.map((i) => `| ${cell(i.doc)} | ${i.required ? 'Sí' : 'No'} | ${mark(i.status)} ${i.status}${i.note ? ` — ${cell(i.note)}` : ''} |`),
  ]
  const missingRequired = p.items.filter((i) => i.required && i.status !== 'presente')
  if (missingRequired.length) {
    lines.push('', `> **Faltan ${missingRequired.length} documento(s) obligatorio(s).**`)
  }
  lines.push(...blockersSection(p.blockers))
  return lines.join('\n')
}

/** PURE: acta → Markdown. */
export function actaMarkdown(p: ActaPayload): string {
  const lines = [
    h(p.title),
    `**Fecha:** ${line(p.date)}  ·  **Asistentes:** ${p.attendees.map(line).join(', ')}`,
    '',
    '## Decisiones',
    ...p.decisions.map((d) => `- **${line(d.topic)}:** ${line(d.decision)}${d.owner ? ` _(${line(d.owner)})_` : ''}`),
    '',
    '## Tareas',
    ...p.actionItems.map((a) => `- [ ] ${line(a.task)} — **${line(a.owner)}**${a.due ? ` (vence ${line(a.due)})` : ''}`),
  ]
  lines.push(...blockersSection(p.blockers))
  return lines.join('\n')
}

/** PURE: sop → Markdown. */
export function sopMarkdown(p: SopPayload): string {
  const lines = [
    h(p.title),
    `**Alcance:** ${line(p.scope)}`,
    '',
    ...p.steps
      .slice()
      .sort((a, b) => a.n - b.n)
      .map((s) => `${s.n}. ${line(s.action)}${s.owner ? ` — _${line(s.owner)}_` : ''}${s.note ? `\n   > ${line(s.note)}` : ''}`),
  ]
  lines.push(...blockersSection(p.blockers))
  return lines.join('\n')
}

/** PURE: dispatch a document artifact to its Markdown exporter (throws for non-document kinds). */
export function documentMarkdown(p: TorreArtifactPayload): string {
  switch (p.kind) {
    case 'REPORTE_ESTADO':
      return reporteEstadoMarkdown(p)
    case 'CHECKLIST_DOCS':
      return checklistDocsMarkdown(p)
    case 'ACTA':
      return actaMarkdown(p)
    case 'SOP':
      return sopMarkdown(p)
    default:
      throw new Error(`documentMarkdown: not a document artifact (${p.kind})`)
  }
}
