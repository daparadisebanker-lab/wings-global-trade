// Group workspace — /contenedor/{id} (spec §4.2-B: "the shared source of truth").
// Mobile-first, top to bottom: header · milestone timeline · Mi cupo (member-
// scoped) · members strip · Hablar con Mister footer. Every read is scoped to
// the caller's member token — one member's financials never render for another.
//
// Access (Phase 1, token identity): the member arrives with ?t={memberToken}
// deep-linked from the Mister thread. The token is HMAC-verified and must be
// bound to this container id. No valid token → a gate back to WhatsApp.

import Link from 'next/link'
import { cookies } from 'next/headers'
import { FillMeter } from '@wings/trade-ui'
import { getWorkspace, type Workspace, type MemberStripEntry } from '@/lib/container/access'
import { verifyMemberToken } from '@/lib/container/identity'
import { computeCostShare } from '@/lib/container/cost'
import {
  MILESTONE_ORDER,
  MILESTONE_LABELS_ES,
  type ContainerStatus,
  type MemberPaymentRow,
  type MemberDocumentRow,
} from '@/types/container'
import { WINGS_PUBLIC_WHATSAPP } from '@/lib/constants'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ t?: string }>
}

export default async function WorkspacePage({ params, searchParams }: PageProps) {
  const { id } = await params
  const { t } = await searchParams

  // Token from query (deep link) or cookie (returning visit).
  const cookieStore = await cookies()
  const token = t ?? cookieStore.get(`wgt_member_${id}`)?.value
  const payload = verifyMemberToken(token)

  if (!payload || payload.cid !== id) {
    return <AccessGate />
  }

  const ws = await getWorkspace(id, payload.sub)
  if (!ws) return <AccessGate />

  const waCtx = encodeURIComponent(`Hola Mister, sobre mi contenedor ${ws.container.short_code}:`)
  const waHref = `https://wa.me/${WINGS_PUBLIC_WHATSAPP}?text=${waCtx}`

  return (
    <div className="mx-auto w-full max-w-[640px] px-5 pb-28 pt-8">
      <ContainerHeader ws={ws} />
      <MilestoneTimeline current={ws.container.status} milestones={ws.milestones} />
      <MiCupo ws={ws} waHref={waHref} />
      <MembersStrip members={ws.members} isLead={ws.isLead} mode={ws.container.mode} />

      {/* Persistent footer — never trap the user away from WhatsApp. */}
      <div className="fixed inset-x-0 bottom-0 z-10 border-t border-[var(--color-border)] bg-[var(--color-surface-card)]/95 px-5 py-3 backdrop-blur">
        <a
          href={waHref}
          target="_blank"
          rel="noopener noreferrer"
          className="mx-auto flex w-full max-w-[600px] items-center justify-center rounded-none bg-[var(--color-gold)] px-6 py-3.5 text-[16px] font-semibold text-[var(--color-text-primary)] transition-colors hover:bg-[var(--color-gold-hover)]"
        >
          Hablar con Mister
        </a>
      </div>
    </div>
  )
}

// ── Header ────────────────────────────────────────────────────────

function ContainerHeader({ ws }: { ws: Workspace }) {
  const c = ws.container
  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="font-[var(--font-mono)] text-[15px] tracking-tight text-[var(--color-text-primary)]">
          {c.route_origin} <span className="text-[var(--color-text-muted)]">→</span> {c.route_destination}
        </div>
        <StatusPill status={c.status} />
      </div>
      <FillMeter
        totalSlots={ws.slots.total}
        committedSlots={ws.slots.committed}
        reservedSlots={ws.slots.reserved}
        size="md"
      />
      <p className="font-[var(--font-mono)] text-[13px] text-[var(--color-text-mono)]">
        {c.short_code} · {c.container_type} · cierra {formatDate(c.fill_deadline)}
      </p>
    </section>
  )
}

function StatusPill({ status }: { status: ContainerStatus }) {
  return (
    <span className="rounded-none border border-[var(--color-border-gold)] bg-[var(--color-gold-muted)] px-2.5 py-1 font-[var(--font-mono)] text-[11px] uppercase tracking-[0.1em] text-[var(--color-text-primary)]">
      {MILESTONE_LABELS_ES[status]}
    </span>
  )
}

// ── Milestone timeline ────────────────────────────────────────────

function MilestoneTimeline({
  current,
  milestones,
}: {
  current: ContainerStatus
  milestones: Workspace['milestones']
}) {
  const currentIdx = MILESTONE_ORDER.indexOf(current)
  const byStatus = new Map(milestones.map((m) => [m.milestone, m]))

  return (
    <section className="mt-8">
      <h2 className="mb-3 text-[13px] uppercase tracking-[0.14em] text-[var(--color-text-mono)]">
        Seguimiento
      </h2>
      <ol className="flex flex-col gap-0">
        {MILESTONE_ORDER.map((step, i) => {
          const reached = currentIdx >= i && currentIdx >= 0
          const isCurrent = current === step
          const record = byStatus.get(step)
          return (
            <li key={step} className="flex gap-3">
              <div className="flex flex-col items-center">
                <span
                  className={[
                    'flex h-5 w-5 items-center justify-center rounded-none border',
                    reached
                      ? 'border-[var(--color-border-gold)] bg-[var(--color-gold)]'
                      : 'border-[var(--color-border)] bg-transparent',
                    isCurrent ? 'animate-pulse' : '',
                  ].join(' ')}
                  aria-hidden
                />
                {i < MILESTONE_ORDER.length - 1 && (
                  <span
                    className={[
                      'w-px flex-1',
                      reached ? 'bg-[var(--color-border-gold)]' : 'bg-[var(--color-border)]',
                    ].join(' ')}
                    style={{ minHeight: 28 }}
                    aria-hidden
                  />
                )}
              </div>
              <div className="pb-6">
                <p
                  className={[
                    'text-[15px]',
                    reached ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-muted)]',
                    isCurrent ? 'font-semibold' : '',
                  ].join(' ')}
                >
                  {MILESTONE_LABELS_ES[step]}
                </p>
                {record?.occurred_at && reached && (
                  <p className="font-[var(--font-mono)] text-[12px] text-[var(--color-text-mono)]">
                    {formatDate(record.occurred_at)}
                    {record.document_url && (
                      <>
                        {' · '}
                        <a href={record.document_url} target="_blank" rel="noopener noreferrer" className="underline">
                          documento
                        </a>
                      </>
                    )}
                  </p>
                )}
              </div>
            </li>
          )
        })}
      </ol>
    </section>
  )
}

// ── Mi cupo (member-scoped) ───────────────────────────────────────

function MiCupo({ ws, waHref }: { ws: Workspace; waHref: string }) {
  const c = ws.container
  const m = ws.me
  const cost = computeCostShare({
    slotPriceUsd: Number(c.slot_price_usd),
    slotsClaimed: m.slots_claimed,
    cbmPerSlot: Number(c.cbm_per_slot),
    cbmAllocated: m.cbm_allocated == null ? null : Number(m.cbm_allocated),
    overagePerCbmUsd: c.overage_per_cbm_usd == null ? null : Number(c.overage_per_cbm_usd),
  })
  const paid = ws.myPayments
    .filter((p) => p.status === 'confirmed' && p.kind !== 'refund')
    .reduce((sum, p) => sum + Number(p.amount_usd), 0)
  const pct = cost.total > 0 ? Math.min(100, Math.round((paid / cost.total) * 100)) : 0
  const allottedCbm = Number(c.cbm_per_slot) * m.slots_claimed
  const usedCbm = m.cbm_allocated == null ? null : Number(m.cbm_allocated)

  return (
    <section className="mt-4 rounded-none border border-[var(--color-border-gold)] bg-[var(--color-surface-card)] p-5">
      <h2 className="mb-4 text-[13px] uppercase tracking-[0.14em] text-[var(--color-text-mono)]">Mi cupo</h2>

      {m.cargo_description && (
        <p className="mb-4 text-[15px] text-[var(--color-text-primary)]">{m.cargo_description}</p>
      )}

      <dl className="mb-5 grid grid-cols-2 gap-x-4 gap-y-3 font-[var(--font-mono)] text-[14px]">
        <Field label="Cupos" value={String(m.slots_claimed)} />
        <Field
          label="Volumen"
          value={usedCbm == null ? `hasta ${fmtCbm(allottedCbm)} m³` : `${fmtCbm(usedCbm)} / ${fmtCbm(allottedCbm)} m³`}
        />
        <Field label="Precio todo incluido" value={`$${fmtUsd(cost.base)}`} />
        {cost.overage > 0 && <Field label={`Ajuste (${fmtCbm(cost.overageCbm)} m³ extra)`} value={`+$${fmtUsd(cost.overage)}`} />}
      </dl>

      <div className="mb-5">
        <div className="mb-1.5 flex items-baseline justify-between font-[var(--font-mono)] text-[13px]">
          <span className="text-[var(--color-text-mono)]">Pagado</span>
          <span className="text-[var(--color-text-primary)]">
            ${fmtUsd(paid)} / ${fmtUsd(cost.total)}
          </span>
        </div>
        <div className="h-2 w-full rounded-none bg-[var(--color-indicator-pending)]">
          <div className="h-full rounded-none bg-[var(--color-gold)]" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {c.price_includes.length > 0 && (
        <p className="mb-4 text-[12.5px] leading-snug text-[var(--color-text-mono)]">
          Todo incluido: {c.price_includes.join(' · ')}.
        </p>
      )}

      <MemberDocuments docs={ws.myDocuments} waHref={waHref} />
    </section>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-[0.08em] text-[var(--color-text-muted)]">{label}</dt>
      <dd className="text-[var(--color-text-primary)]">{value}</dd>
    </div>
  )
}

function MemberDocuments({ docs, waHref }: { docs: MemberDocumentRow[]; waHref: string }) {
  // Phase 1: uploads happen in the Mister WhatsApp thread (spec §3.4).
  const required = ['factura', 'packing', 'ficha_ruc']
  const present = new Map(docs.map((d) => [d.doc_type, d]))
  return (
    <div>
      <p className="mb-2 text-[11px] uppercase tracking-[0.08em] text-[var(--color-text-muted)]">Documentos</p>
      <div className="flex flex-wrap gap-2">
        {required.map((type) => {
          const doc = present.get(type)
          const ok = doc?.status === 'approved'
          return (
            <a
              key={type}
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className={[
                'rounded-none border px-3 py-1.5 text-[13px]',
                ok
                  ? 'border-[var(--color-border-gold)] bg-[var(--color-gold-muted)] text-[var(--color-text-primary)]'
                  : 'border-dashed border-[var(--color-border)] text-[var(--color-text-mono)]',
              ].join(' ')}
            >
              {DOC_LABELS[type] ?? type} {ok ? '✓' : '+'}
            </a>
          )
        })}
      </div>
    </div>
  )
}

const DOC_LABELS: Record<string, string> = {
  factura: 'Factura',
  packing: 'Packing list',
  ficha_ruc: 'Ficha RUC',
  poder: 'Poder',
}

// ── Members strip ─────────────────────────────────────────────────

function MembersStrip({
  members,
  isLead,
  mode,
}: {
  members: MemberStripEntry[]
  isLead: boolean
  mode: Workspace['container']['mode']
}) {
  const publicMode = mode !== 'private_group'
  return (
    <section className="mt-8">
      <h2 className="mb-3 text-[13px] uppercase tracking-[0.14em] text-[var(--color-text-mono)]">
        {publicMode ? 'Compradores' : 'El grupo'}
      </h2>
      {publicMode && !isLead ? (
        <p className="font-[var(--font-mono)] text-[14px] text-[var(--color-text-primary)]">
          {members.length} compradores confirmados
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {members.map((mem) => (
            <li key={mem.id} className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span
                  aria-hidden
                  className="flex h-8 w-8 items-center justify-center rounded-none border border-[var(--color-border)] bg-[var(--color-gold-subtle-2)] font-[var(--font-display)] text-[14px] text-[var(--color-text-primary)]"
                >
                  {(mem.displayName ?? '·').trim().charAt(0).toUpperCase()}
                </span>
                <span className="text-[14px] text-[var(--color-text-primary)]">
                  {mem.displayName ?? 'Comprador'}
                  {mem.isSelf && <span className="text-[var(--color-text-muted)]"> (tú)</span>}
                  {mem.role === 'lead' && (
                    <span className="ml-1.5 font-[var(--font-mono)] text-[11px] text-[var(--color-text-mono)]">· organiza</span>
                  )}
                </span>
              </div>
              {/* Lead sees per-member fill status; nobody sees others' money. */}
              {isLead && (
                <span className="font-[var(--font-mono)] text-[12px] text-[var(--color-text-mono)]">
                  {mem.slotsClaimed} cupo{mem.slotsClaimed > 1 ? 's' : ''} · {mem.slotStatus}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

// ── Access gate ───────────────────────────────────────────────────

function AccessGate() {
  const waHref = `https://wa.me/${WINGS_PUBLIC_WHATSAPP}?text=${encodeURIComponent('Hola Mister, quiero entrar a mi contenedor.')}`
  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-[440px] flex-col items-center justify-center gap-6 px-5 text-center">
      <p className="text-[20px] text-[var(--color-text-primary)]">
        Abre tu contenedor desde el enlace que te envió Mister por WhatsApp.
      </p>
      <a
        href={waHref}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-none bg-[var(--color-gold)] px-6 py-3.5 text-[16px] font-semibold text-[var(--color-text-primary)] transition-colors hover:bg-[var(--color-gold-hover)]"
      >
        Hablar con Mister
      </a>
      <Link href="/" className="text-[14px] text-[var(--color-text-mono)] underline">
        Ir a Wings Global Trade
      </Link>
    </div>
  )
}

// ── formatting ────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })
}
function fmtUsd(n: number): string {
  return n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}
function fmtCbm(n: number): string {
  return n.toLocaleString('es-PE', { minimumFractionDigits: 0, maximumFractionDigits: 1 })
}
