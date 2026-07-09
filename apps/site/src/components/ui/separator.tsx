// src/components/ui/separator.tsx
import { cn } from '@/lib/utils'

interface SeparatorProps {
  className?: string
  onNavy?: boolean
}

export function Separator({ className, onNavy }: SeparatorProps) {
  return (
    <hr
      className={cn(
        'border-0 border-t',
        onNavy ? 'border-t-[rgba(248,246,240,0.2)]' : 'border-t-border-default',
        className,
      )}
    />
  )
}
