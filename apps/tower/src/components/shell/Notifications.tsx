'use client'

import { useState } from 'react'
import { cn } from '@wings/trade-ui'
import { DEFAULT_LOCALE, t, type Locale } from '@/lib/i18n'

/**
 * Notifications stub (COMPONENT_TREE TopBar). A bell toggle + an empty panel;
 * the live feed (revalidation callbacks, QC alarms, digest ready) wires in a
 * later wave. Keyboard reachable; status reads by label, never color alone.
 */
export function Notifications({ locale = DEFAULT_LOCALE }: { locale?: Locale }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'rounded-card border border-line px-3 py-1.5 font-mono text-label uppercase tracking-[0.1em]',
          'text-ink-secondary hover:text-ink-primary',
        )}
      >
        {t({ es: 'Avisos', en: 'Alerts' }, locale)}
      </button>
      {open ? (
        <div
          role="dialog"
          aria-label={t({ es: 'Avisos', en: 'Alerts' }, locale)}
          className="material-panel tower-fade absolute right-0 top-full z-20 mt-2 w-72 rounded-card-lg p-4"
        >
          <p className="font-ui text-t0 text-ink-secondary">
            {t({ es: 'Sin avisos', en: 'No alerts' }, locale)}
          </p>
        </div>
      ) : null}
    </div>
  )
}
