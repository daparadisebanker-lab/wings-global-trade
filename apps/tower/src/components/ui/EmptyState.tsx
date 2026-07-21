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
        'flex min-h-[60vh] w-full flex-col items-center justify-center gap-3 px-6 text-center',
        className,
      )}
    >
      {tag ? (
        <span className="max-w-full break-words font-mono text-t0 uppercase tracking-[0.15em] text-lane-accent" data-numeric>
          {tag}
        </span>
      ) : null}
      {/* max-w-full + break-words + a smaller mobile size so the display title
          wraps inside the viewport instead of forcing a horizontal scroll. */}
      <h1 className="max-w-full break-words font-display text-t2 text-ink-primary sm:text-t3">
        {t(title, locale)}
      </h1>
      {description ? (
        // w-full caps the paragraph at the container width on mobile (items-center
        // would otherwise shrink-to-fit to max-w-md = 448px and overflow 390px).
        <p className="w-full max-w-md break-words font-ui text-t1 leading-relaxed text-ink-secondary">
          {t(description, locale)}
        </p>
      ) : null}
    </div>
  )
}
