// @wings/trade-ui · Textarea primitive. Extracted verbatim from apps/site
// components/ui/textarea.tsx (M3b).
import { forwardRef } from 'react'
import type { TextareaHTMLAttributes } from 'react'
import { cn } from '../lib/cn'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  hasError?: boolean
  onNavy?: boolean
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, hasError, onNavy, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          'w-full rounded-wings px-4 py-3 font-body text-base outline-none transition-shadow resize-y min-h-24',
          onNavy
            ? 'bg-white/[0.06] border border-[rgba(248,246,240,0.2)] text-warm-white placeholder:text-[#6B7280]'
            : 'bg-white border border-border-default text-navy placeholder:text-[#9CA3AF]',
          'focus:border-gold focus:shadow-[0_0_0_3px_rgba(196,147,63,0.15)]',
          hasError && 'border-[#DC2626] focus:border-[#DC2626] focus:shadow-[0_0_0_3px_rgba(220,38,38,0.1)]',
          className,
        )}
        {...props}
      />
    )
  },
)
Textarea.displayName = 'Textarea'
