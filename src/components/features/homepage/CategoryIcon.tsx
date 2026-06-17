// src/components/features/homepage/CategoryIcon.tsx
// Inline SVG icons keyed by category icon_key. Stroke = currentColor.

interface IconProps {
  iconKey: string | null
  className?: string
}

const paths: Record<string, React.ReactNode> = {
  tractor: (
    <>
      <circle cx="7" cy="17" r="3" />
      <circle cx="17" cy="18" r="2" />
      <path d="M10 17h4M4 13V8h6l2 5M12 8h4l2 5" />
    </>
  ),
  truck: (
    <>
      <path d="M3 7h11v8H3zM14 10h4l3 3v2h-7z" />
      <circle cx="7" cy="17" r="2" />
      <circle cx="17" cy="17" r="2" />
    </>
  ),
  bus: (
    <>
      <rect x="4" y="5" width="16" height="12" rx="2" />
      <path d="M4 11h16M8 17v2M16 17v2" />
      <circle cx="8" cy="14" r="1" />
      <circle cx="16" cy="14" r="1" />
    </>
  ),
  gear: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1" />
    </>
  ),
  part: (
    <>
      <circle cx="12" cy="12" r="3" />
      <circle cx="12" cy="12" r="8" />
      <path d="M12 4v3M12 17v3M4 12h3M17 12h3" />
    </>
  ),
  accio: (
    <>
      <path d="M12 3l2.5 5.5L20 11l-5.5 2.5L12 19l-2.5-5.5L4 11l5.5-2.5z" />
    </>
  ),
}

export function CategoryIcon({ iconKey, className }: IconProps) {
  const content = (iconKey && paths[iconKey]) || paths.gear
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {content}
    </svg>
  )
}
