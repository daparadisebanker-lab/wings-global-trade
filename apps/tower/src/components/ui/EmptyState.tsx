import { cn } from '@wings/trade-ui'
import { DEFAULT_LOCALE, t, type Locale, type Localized } from '@/lib/i18n'

/**
 * Titled empty state — the scaffold's placeholder surface (COMPONENT_TREE
 * signature: instrument panels appear laid-out or not at all; no skeleton
 * shimmer). Status/label reads without relying on color.
 */
export function EmptyState({
  title,
  description,
  tag,
  locale = DEFAULT_LOCALE,
  className,
}: {
  title: Localized
  description?: Localized
  tag?: string
  locale?: Locale
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex min-h-[60vh] flex-col items-center justify-center gap-3 px-6 text-center',
        className,
      )}
    >
      {tag ? (
        <span className="font-mono text-t0 uppercase tracking-[0.15em] text-lane-accent" data-numeric>
          {tag}
        </span>
      ) : null}
      <h1 className="font-ui text-t3 text-ink-primary">{t(title, locale)}</h1>
      {description ? (
        <p className="max-w-md font-ui text-t1 leading-relaxed text-ink-secondary">
          {t(description, locale)}
        </p>
      ) : null}
    </div>
  )
}
