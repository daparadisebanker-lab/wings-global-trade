// src/components/ui/breadcrumb.tsx
import Link from 'next/link'
import { cn } from '@/lib/utils'

export interface BreadcrumbItem {
  label: string
  href?: string
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[]
  className?: string
}

/**
 * Architectural breadcrumb trail.
 * All items except the last are Links; the last item is static navy text.
 * Separator: · in text-text-muted
 */
export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav
      aria-label="Ruta de navegación"
      className={cn(
        'py-3 border-b border-[rgba(0,30,80,0.06)]',
        className,
      )}
    >
      <ol className="flex flex-wrap items-center gap-x-2">
        {items.map((item, index) => {
          const isLast = index === items.length - 1

          return (
            <li key={index} className="flex items-center gap-x-2">
              {index > 0 && (
                <span
                  className="font-mono text-[11px] text-text-muted select-none"
                  aria-hidden="true"
                >
                  ·
                </span>
              )}

              {isLast || !item.href ? (
                <span
                  className="font-mono text-[11px] text-navy font-medium"
                  aria-current={isLast ? 'page' : undefined}
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="font-mono text-[11px] text-text-muted hover:text-navy transition-colors"
                >
                  {item.label}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
