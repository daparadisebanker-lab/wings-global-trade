// Invite landing — /g/{token} (spec §4.2-A: "the highest-leverage screen in
// the system"). The invitee arrives from a WhatsApp tap with borrowed trust
// from the lead. No account wall, no form, no email field — the single CTA
// goes straight to WhatsApp; the platform account is created inside the Mister
// conversation after intent is proven. Server-rendered; a small client island
// (InviteActions) owns the countdown + CTA beacon.

import type { Metadata } from 'next'
import Link from 'next/link'
import { FillMeter } from '@wings/trade-ui'
import { resolveInvite, recordInviteEvent } from '@/lib/container/access'
import { InviteActions } from '@/components/features/container/InviteActions'
import { FALLBACK_LABELS_ES } from '@/types/container'
import { WINGS_PUBLIC_WHATSAPP } from '@/lib/constants'

export const dynamic = 'force-dynamic' // live fill/slots — never statically cached

interface PageProps {
  params: Promise<{ token: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { token } = await params
  const res = await resolveInvite(token)
  if (!res.ok) {
    return { title: 'Contenedor cerrado', robots: { index: false, follow: false } }
  }
  const p = res.preview
  const title = `${p.leadName ? `${p.leadName} te invita` : 'Únete al contenedor'} · ${p.routeOrigin} → ${p.routeDestination}`
  const description = `Cupo todo incluido $${fmt(p.slotPriceUsd)}. ${p.slots.open} de ${p.slots.total} cupos disponibles. Contenedor compartido con Wings Global Trade.`
  return {
    title,
    description,
    robots: { index: false, follow: false }, // private invite, not for indexing
    openGraph: { title, description, type: 'website' },
  }
}

export default async function InviteLandingPage({ params }: PageProps) {
  const { token } = await params
  const res = await resolveInvite(token)

  if (!res.ok) {
    return <ClosedState reason={res.reason} />
  }

  const { invite, preview: p } = res

  // Attribution: the link was opened. Best-effort, does not block render.
  void recordInviteEvent(invite.id, 'opened')

  const waText = `Hola Mister, quiero mi cupo en el contenedor ${p.shortCode}`
  const waHref = `https://wa.me/${WINGS_PUBLIC_WHATSAPP}?text=${encodeURIComponent(waText)}`

  return (
    <div className="mx-auto w-full max-w-[560px] px-5 py-8 sm:py-12">
      {/* ── Above the fold ─────────────────────────────────────────── */}
      <section className="flex flex-col gap-6">
        {p.leadName && (
          <div className="flex items-center gap-3">
            <span
              aria-hidden
              className="flex h-11 w-11 items-center justify-center rounded-none border border-[var(--color-border-gold)] bg-[var(--color-gold-muted)] font-[var(--font-display)] text-[18px] text-[var(--color-text-primary)]"
            >
              {p.leadName.trim().charAt(0).toUpperCase()}
            </span>
            <p className="text-[15px] text-[var(--color-text-mono)]">
              <span className="font-semibold text-[var(--color-text-primary)]">{p.leadName}</span>{' '}
              te invita a su contenedor
            </p>
          </div>
        )}

        <div className="font-[var(--font-mono)] text-[15px] tracking-tight text-[var(--color-text-primary)]">
          {p.routeOrigin} <span className="text-[var(--color-text-muted)]">→</span>{' '}
          {p.routeDestination}
          <span className="text-[var(--color-text-muted)]"> · {p.containerType}</span>
        </div>

        <FillMeter
          totalSlots={p.slots.total}
          committedSlots={p.slots.committed}
          reservedSlots={p.slots.reserved}
          size="lg"
          showLegend
        />

        {/* One number rules every screen. */}
        <div className="flex items-baseline gap-2">
          <span className="font-[var(--font-mono)] text-[40px] font-semibold leading-none text-[var(--color-text-primary)]">
            ${fmt(p.slotPriceUsd)}
          </span>
          <span className="text-[15px] text-[var(--color-text-mono)]">— todo incluido por cupo</span>
        </div>

        <InviteActions inviteId={invite.id} waHref={waHref} deadlineISO={p.fillDeadline} />
      </section>

      {/* ── Below the fold ─────────────────────────────────────────── */}
      <section className="mt-12 flex flex-col gap-10">
        {p.priceIncludes.length > 0 && (
          <div>
            <h2 className="mb-3 text-[13px] uppercase tracking-[0.14em] text-[var(--color-text-mono)]">
              El precio incluye
            </h2>
            <ul className="flex flex-col gap-2">
              {p.priceIncludes.map((item) => (
                <li key={item} className="flex items-center gap-2 text-[15px] text-[var(--color-text-primary)]">
                  <Check /> {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Trust is a UI layer, not a paragraph — three fixed badges. */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <TrustBadge title="Depósito protegido" body="Tu dinero lo custodia Wings, nunca otro comprador." />
          <TrustBadge title="Tu contrato es con Wings" body="No con los demás compradores del grupo." />
          <TrustBadge title="Regla de respaldo" body={FALLBACK_LABELS_ES[p.fallback]} />
        </div>

        <div>
          <h2 className="mb-4 text-[13px] uppercase tracking-[0.14em] text-[var(--color-text-mono)]">
            ¿Cómo funciona?
          </h2>
          <ol className="flex flex-col gap-4">
            <Step n={1} title="Tomas tu cupo por WhatsApp" body="Le dices a Mister qué máquina traes. Él calcula tu volumen y tu precio todo incluido." />
            <Step n={2} title="El contenedor se llena" body="Cuando el grupo completa los cupos, Wings cierra la reserva y arranca el embarque." />
            <Step n={3} title="Sigues cada hito" body="Zarpó, llegó a zona franca, nacionalizado, entregado — te avisamos en cada paso." />
          </ol>
        </div>

        <FaqAccordion
          items={[
            { q: '¿Necesito llenar el contenedor solo?', a: 'No. Compartes un contenedor con tu grupo; cada uno paga solo su cupo, en proporción a su volumen.' },
            { q: '¿Cómo se calcula mi precio?', a: `Es un precio todo incluido por cupo — $${fmt(p.slotPriceUsd)} — que ya cubre flete, seguro, zona franca y despacho. Sin sorpresas.` },
            { q: '¿Y si el contenedor no se llena?', a: FALLBACK_LABELS_ES[p.fallback] },
            { q: '¿Con quién es mi contrato?', a: 'Siempre con Wings Global Trade. Tu relación no depende de los demás compradores.' },
          ]}
        />
      </section>
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────

function ClosedState({ reason }: { reason: 'not_found' | 'revoked' | 'expired' | 'closed' }) {
  const message =
    reason === 'not_found'
      ? 'Este enlace no existe o expiró.'
      : reason === 'closed'
        ? 'Este contenedor ya cerró su grupo.'
        : reason === 'expired'
          ? 'Este enlace de invitación expiró.'
          : 'Este contenedor ya cerró su grupo.'
  const waHref = `https://wa.me/${WINGS_PUBLIC_WHATSAPP}?text=${encodeURIComponent('Hola Mister, quiero importar en un contenedor compartido.')}`
  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-[480px] flex-col items-center justify-center gap-6 px-5 text-center">
      <p className="text-[22px] text-[var(--color-text-primary)]">{message}</p>
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

function TrustBadge({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-none border border-[var(--color-border)] bg-[var(--color-surface-card)] p-3">
      <p className="mb-1 text-[13px] font-semibold text-[var(--color-text-primary)]">{title}</p>
      <p className="text-[12.5px] leading-snug text-[var(--color-text-mono)]">{body}</p>
    </div>
  )
}

function Step({ n, title, body }: { n: number; title: string; body: string }) {
  return (
    <li className="flex gap-3">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-none border border-[var(--color-border-gold)] font-[var(--font-mono)] text-[13px] text-[var(--color-text-primary)]">
        {n}
      </span>
      <div>
        <p className="text-[15px] font-semibold text-[var(--color-text-primary)]">{title}</p>
        <p className="text-[14px] leading-snug text-[var(--color-text-mono)]">{body}</p>
      </div>
    </li>
  )
}

function FaqAccordion({ items }: { items: { q: string; a: string }[] }) {
  return (
    <div>
      <h2 className="mb-3 text-[13px] uppercase tracking-[0.14em] text-[var(--color-text-mono)]">
        Preguntas frecuentes
      </h2>
      <div className="flex flex-col divide-y divide-[var(--color-border)] border-y border-[var(--color-border)]">
        {items.map((it) => (
          <details key={it.q} className="group py-3">
            <summary className="flex cursor-pointer list-none items-center justify-between text-[15px] text-[var(--color-text-primary)]">
              {it.q}
              <span className="ml-3 text-[var(--color-text-muted)] transition-transform group-open:rotate-45">+</span>
            </summary>
            <p className="mt-2 text-[14px] leading-relaxed text-[var(--color-text-mono)]">{it.a}</p>
          </details>
        ))}
      </div>
    </div>
  )
}

function Check() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden className="shrink-0">
      <path d="M3 8.5l3 3 7-7" stroke="var(--color-gold)" strokeWidth="1.75" strokeLinecap="square" />
    </svg>
  )
}

function fmt(n: number): string {
  return n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}
