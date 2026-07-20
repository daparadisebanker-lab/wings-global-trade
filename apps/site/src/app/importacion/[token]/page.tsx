// /importacion/{token} — the client import tracker (Quotation Intelligence
// SPEC §2.1). A private, no-login, noindex page: the buyer watches their
// importation move phase by phase and sees the rep-signed CIF figure (G1).
// Server-rendered, force-dynamic (phases are live). The tokenized read model is
// resolved service-role-only (lib/journey/access). Countdown + installments are
// later waves (§2.2/§2.3).
import type { Metadata } from 'next'
import Link from 'next/link'
import { resolveJourney, type TrackerPhase } from '@/lib/journey/access'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ token: string }>
}

export async function generateMetadata(): Promise<Metadata> {
  return { title: 'Seguimiento de importación · Wings Global Trade', robots: { index: false, follow: false } }
}

function fmtDate(iso: string | null): string {
  if (!iso) return ''
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso)
  return m ? `${m[3]}/${m[2]}/${m[1]}` : ''
}
function fmtMoney(n: number, currency: string): string {
  return `${currency} ${n.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export default async function ImportTrackerPage({ params }: PageProps) {
  const { token } = await params
  const res = await resolveJourney(token)

  if (!res.ok) {
    return (
      <div className="mx-auto flex min-h-[60vh] w-full max-w-[480px] flex-col items-center justify-center gap-6 px-5 text-center">
        <p className="text-[22px] text-[var(--color-text-primary)]">Este enlace de seguimiento no existe o expiró.</p>
        <Link href="/" className="text-[14px] text-[var(--color-text-mono)] underline">
          Ir a Wings Global Trade
        </Link>
      </div>
    )
  }

  const t = res.tracker

  return (
    <div className="mx-auto w-full max-w-[560px] px-5 py-8 sm:py-12">
      <header className="flex flex-col gap-2">
        <span className="font-[var(--font-mono)] text-[13px] uppercase tracking-[0.14em] text-[var(--color-text-mono)]">
          Seguimiento de importación
        </span>
        <h1 className="font-[var(--font-display)] text-[28px] leading-tight text-[var(--color-text-primary)]">
          {t.currentLabel}
        </h1>
        {t.incoterm ? (
          <p className="font-[var(--font-mono)] text-[13px] text-[var(--color-text-mono)]">{t.incoterm}</p>
        ) : null}
      </header>

      {/* Signed CIF (G1) */}
      {t.cif ? (
        <section className="mt-6 rounded-none border border-[var(--color-border-gold)] bg-[var(--color-gold-muted)] p-4">
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-[13px] uppercase tracking-[0.12em] text-[var(--color-text-mono)]">Valor CIF acordado</span>
            <span className="font-[var(--font-mono)] text-[24px] font-semibold text-[var(--color-text-primary)]">
              {fmtMoney(t.cif.amount, t.cif.currency)}
            </span>
          </div>
          {t.signedAt ? (
            <p className="mt-2 text-[12.5px] leading-snug text-[var(--color-text-mono)]">
              Cotización firmada digitalmente por Wings Global Trade · {fmtDate(t.signedAt)}
            </p>
          ) : null}
        </section>
      ) : null}

      {/* Phase rail */}
      <section className="mt-8">
        <h2 className="mb-4 text-[13px] uppercase tracking-[0.14em] text-[var(--color-text-mono)]">Estado del embarque</h2>
        <ol className="flex flex-col">
          {t.phases.map((p) => (
            <PhaseRow key={p.code} phase={p} />
          ))}
        </ol>
      </section>

      {t.updatedAt ? (
        <p className="mt-8 text-[12px] text-[var(--color-text-muted)]">Última actualización · {fmtDate(t.updatedAt)}</p>
      ) : null}

      <footer className="mt-10 border-t border-[var(--color-border)] pt-4">
        <p className="text-[13px] text-[var(--color-text-mono)]">
          ¿Preguntas sobre tu importación? Escríbenos y te acompañamos en cada hito.
        </p>
      </footer>
    </div>
  )
}

function PhaseRow({ phase }: { phase: TrackerPhase }) {
  return (
    <li className="flex items-start gap-3 py-2">
      <span
        aria-hidden
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-none border text-[12px] ${
          phase.reached
            ? 'border-[var(--color-border-gold)] bg-[var(--color-gold)] text-[var(--color-text-primary)]'
            : 'border-[var(--color-border)] text-[var(--color-text-muted)]'
        }`}
      >
        {phase.reached ? '✓' : ''}
      </span>
      <div className="flex flex-1 items-baseline justify-between gap-3">
        <span
          className={`text-[15px] ${
            phase.current
              ? 'font-semibold text-[var(--color-text-primary)]'
              : phase.reached
                ? 'text-[var(--color-text-primary)]'
                : 'text-[var(--color-text-muted)]'
          }`}
        >
          {phase.label}
        </span>
        {phase.date ? (
          <span className="font-[var(--font-mono)] text-[12.5px] text-[var(--color-text-mono)]">{fmtDate(phase.date)}</span>
        ) : null}
      </div>
    </li>
  )
}
