// src/components/features/mister/MisterHeader.tsx
// The issuing-authority band. 48px fixed height. Navy bg + 1px gold rule bottom.
// Floating mode: minimize (−) + close (×) controls, 1px warm-white stroke, no fill.
// Source: designer.md §4 (MisterHeader), animator.md §5 (state indicator)
'use client'

import { useMister } from '@/components/features/mister/MisterProvider'

interface Props {
  /** In floating mode show close/minimize controls; embedded hides them. */
  mode: 'floating' | 'embedded'
}

export function MisterHeader({ mode }: Props) {
  const { sessionId, archetype, isResolved, close } = useMister()

  return (
    <div
      className="flex h-[var(--mister-window-header-height)] flex-shrink-0 items-center justify-between border-b border-[rgba(248,246,240,0.08)] bg-[var(--mister-bg-header)] px-4"
      role="banner"
    >
      {/* Left: MISTER + endorsement */}
      <div className="flex flex-col justify-center gap-0">
        <p className="font-mono text-[13px] font-[500] uppercase leading-none tracking-[0.12em] text-[var(--mister-text-primary)]">
          MISTER
        </p>
        <p className="font-body text-[10px] font-[300] leading-none tracking-[0.02em] text-[var(--mister-text-muted)]">
          by Wings Global Trade
        </p>
      </div>

      {/* Right: session ref + archetype dot + window controls */}
      <div className="flex items-center gap-3">
        {/* Session reference — ghost until archetype resolved, then gold at 50% opacity */}
        <div className="flex items-center gap-1.5">
          <p
            className={`mister-session-ref font-mono text-[11px] font-[400] uppercase leading-none tracking-[0.08em] ${
              isResolved
                ? 'text-[rgba(196,147,63,0.50)]'
                : 'text-[var(--mister-text-ghost)]'
            }`}
            aria-label={`Referencia de sesión: ${sessionId}`}
          >
            {sessionId}
          </p>
          {/* 4px square state indicator — only visible after archetype resolved */}
          <span
            className={`mister-status-dot block h-1 w-1 rounded-none ${
              isResolved
                ? 'bg-[var(--mister-gold)] opacity-100'
                : 'bg-[var(--mister-status-unresolved)] opacity-0'
            }`}
            aria-hidden
          />
        </div>

        {/* Window controls — floating mode only */}
        {mode === 'floating' && (
          <div className="flex items-center gap-2">
            {/* Minimize — horizontal line (−), not a chevron */}
            <button
              type="button"
              onClick={close}
              aria-label="Minimizar Mister"
              className="flex h-4 w-4 items-center justify-center text-[var(--mister-text-primary)] opacity-60 transition-opacity duration-[150ms] hover:opacity-100"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                <line x1="3" y1="8" x2="13" y2="8" stroke="currentColor" strokeWidth="1" />
              </svg>
            </button>
            {/* Close — × made of two lines */}
            <button
              type="button"
              onClick={close}
              aria-label="Cerrar Mister"
              className="flex h-4 w-4 items-center justify-center text-[var(--mister-text-primary)] opacity-60 transition-opacity duration-[150ms] hover:opacity-100"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                <line x1="3" y1="3" x2="13" y2="13" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
                <line x1="13" y1="3" x2="3" y2="13" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Hidden: archetype label for screen readers */}
      <span className="sr-only">
        {isResolved ? `Perfil: ${archetype}` : 'Perfil en proceso de clasificación'}
      </span>
    </div>
  )
}
