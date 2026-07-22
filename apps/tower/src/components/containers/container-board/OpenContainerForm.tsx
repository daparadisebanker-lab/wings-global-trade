'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { openContainer } from '@/lib/actions/containers'
import { CONTAINER_KINDS, CONTAINER_MODES } from '@/lib/actions/containers-types'

// "Open container" panel — TRADE_OPS/LANE_DIRECTOR only (gated by the caller
// via ContainerCapabilities.canWrite; RLS + this action's own gate are the
// real boundary, this is presentation only per CLAUDE.md Directive 1).
export function OpenContainerForm({
  laneId,
  onOpened,
  onClose,
}: {
  laneId: string
  onOpened: () => void
  onClose: () => void
}) {
  const [kind, setKind] = useState<(typeof CONTAINER_KINDS)[number]>('40HC')
  const [mode, setMode] = useState<(typeof CONTAINER_MODES)[number]>('DEDICATED')
  const [capacityCbm, setCapacityCbm] = useState('58')
  const [origin, setOrigin] = useState('')
  const [destination, setDestination] = useState('')
  const [etd, setEtd] = useState('')
  const [publicFillVisible, setPublicFillVisible] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const firstFieldRef = useRef<HTMLSelectElement>(null)

  // Open like a drawer: move focus into the panel on mount, and let Escape
  // close it — the inline form is now keyboard-complete, not just present.
  useEffect(() => {
    firstFieldRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  function submit() {
    setError(null)
    const capacity = Number(capacityCbm)
    if (!Number.isFinite(capacity) || capacity <= 0) {
      setError('Capacidad CBM inválida / Invalid CBM capacity')
      return
    }
    startTransition(async () => {
      const result = await openContainer(laneId, {
        kind,
        mode,
        capacityCbm: capacity,
        route: {
          origin: origin || undefined,
          destination: destination || undefined,
          etd: etd || undefined,
        },
        publicFillVisible,
      })
      if (result.error) {
        setError(`${result.error.code}: ${result.error.message}`)
        return
      }
      onOpened()
    })
  }

  return (
    <div
      role="group"
      aria-label="Abrir contenedor / Open container"
      className="tower-settle flex flex-col gap-3 rounded-card border border-line bg-surface-1 p-4"
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-label uppercase tracking-[0.1em] text-ink-secondary">
          Abrir contenedor / Open container
        </span>
        <button type="button" onClick={onClose} className="font-mono text-label text-ink-secondary hover:text-ink-primary">
          Cerrar / Close
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <label className="flex flex-col gap-1">
          <span className="font-mono text-label uppercase tracking-[0.1em] text-ink-secondary">Tipo / Kind</span>
          <select
            ref={firstFieldRef}
            value={kind}
            onChange={(e) => setKind(e.target.value as (typeof CONTAINER_KINDS)[number])}
            className="rounded-card border border-line bg-surface-0 px-3 py-2 font-mono text-t0 text-ink-primary outline-none focus-visible:border-lane-accent"
          >
            {CONTAINER_KINDS.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="font-mono text-label uppercase tracking-[0.1em] text-ink-secondary">Modo / Mode</span>
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as (typeof CONTAINER_MODES)[number])}
            className="rounded-card border border-line bg-surface-0 px-3 py-2 font-mono text-t0 text-ink-primary outline-none focus-visible:border-lane-accent"
          >
            {CONTAINER_MODES.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="font-mono text-label uppercase tracking-[0.1em] text-ink-secondary">Capacidad CBM / Capacity</span>
          <input
            value={capacityCbm}
            onChange={(e) => setCapacityCbm(e.target.value)}
            inputMode="decimal"
            className="rounded-card border border-line bg-surface-0 px-3 py-2 font-mono text-t0 text-ink-primary outline-none focus-visible:border-lane-accent"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="font-mono text-label uppercase tracking-[0.1em] text-ink-secondary">Origen / Origin</span>
          <input
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            className="rounded-card border border-line bg-surface-0 px-3 py-2 font-ui text-t0 text-ink-primary outline-none focus-visible:border-lane-accent"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="font-mono text-label uppercase tracking-[0.1em] text-ink-secondary">Destino / Destination</span>
          <input
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="rounded-card border border-line bg-surface-0 px-3 py-2 font-ui text-t0 text-ink-primary outline-none focus-visible:border-lane-accent"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="font-mono text-label uppercase tracking-[0.1em] text-ink-secondary">ETD</span>
          <input
            type="date"
            value={etd}
            onChange={(e) => setEtd(e.target.value)}
            className="rounded-card border border-line bg-surface-0 px-3 py-2 font-mono text-t0 text-ink-primary outline-none focus-visible:border-lane-accent"
          />
        </label>
      </div>

      <label className="flex items-center gap-2 font-mono text-label uppercase tracking-[0.08em] text-ink-secondary">
        <input type="checkbox" checked={publicFillVisible} onChange={(e) => setPublicFillVisible(e.target.checked)} />
        Visible en FillMeter público / Visible on public FillMeter
      </label>

      {error ? (
        <p role="alert" className="font-ui text-t0 text-negative">
          {error}
        </p>
      ) : null}

      <button
        type="button"
        onClick={submit}
        disabled={isPending}
        className="self-start rounded-card bg-accent px-4 py-2 font-mono text-label uppercase tracking-[0.1em] text-surface-0 disabled:opacity-40"
      >
        {isPending ? 'Abriendo… / Opening…' : 'Abrir / Open'}
      </button>
    </div>
  )
}
