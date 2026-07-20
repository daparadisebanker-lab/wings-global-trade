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
  mister: (
    <>
      <path d="M12 3l2.5 5.5L20 11l-5.5 2.5L12 19l-2.5-5.5L4 11l5.5-2.5z" />
    </>
  ),
  plus: (
    <>
      <path d="M12 5v14M5 12h14" />
    </>
  ),
  // --- New category icon keys (0006_expand_categories) ---
  motorcycle: (
    <>
      <circle cx="6" cy="16" r="3" />
      <circle cx="18" cy="16" r="3" />
      <path d="M6 16h3l2-5h4l2 5M13 11l-1-4h3l2 4" />
      <path d="M9 11H7" />
    </>
  ),
  industrial: (
    <>
      <rect x="4" y="12" width="5" height="7" rx="1" />
      <path d="M9 15h6M15 10l4 2v7h-4z" />
      <path d="M4 12V9l5-5 5 5v3" />
      <path d="M9 19v2M15 19v2" />
    </>
  ),
  parts: (
    <>
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3-3a6 6 0 0 1-7.4 7.4l-3.8 3.8a2 2 0 1 1-2.8-2.8l3.8-3.8a6 6 0 0 1 7.4-7.4z" />
    </>
  ),
  harvester: (
    <>
      <circle cx="15" cy="11" r="5" />
      <rect x="2" y="8" width="8" height="7" rx="1" />
      <path d="M2 15h20" />
      <circle cx="5" cy="19" r="2.5" />
      <circle cx="18" cy="20" r="2" />
      <path d="M10 11.5h3" />
    </>
  ),
  'dump-truck': (
    <>
      <rect x="1" y="10" width="7" height="6" rx="1" />
      <path d="M8 16V7l12-3v12z" />
      <path d="M1 16h19" />
      <circle cx="4" cy="18.5" r="1.5" />
      <circle cx="15" cy="18.5" r="1.5" />
      <circle cx="19" cy="18.5" r="1.5" />
    </>
  ),
  forklift: (
    <>
      <rect x="10" y="9" width="11" height="9" rx="1" />
      <path d="M8 2v16M12 5v13" />
      <path d="M8 16H2M8 18.5H2" />
      <circle cx="19" cy="20.5" r="2" />
      <circle cx="3.5" cy="20.5" r="1.5" />
    </>
  ),
  generator: (
    <>
      <rect x="3" y="4" width="18" height="14" rx="1.5" />
      <path d="M13 7.5L10 13h4.5L11.5 18.5" />
      <path d="M8 4V2M10 4V2" />
    </>
  ),
  crane: (
    <>
      <path d="M5 22V4" />
      <path d="M5 4h15" />
      <path d="M20 4L5 11" />
      <path d="M14 4v10" />
      <path d="M14 14v3q0 2-3 2" />
      <path d="M3 22h4" />
      <path d="M5 4H2" />
    </>
  ),
  semi: (
    <>
      <rect x="9" y="7" width="13" height="9" rx="1" />
      <path d="M9 16V7H4L1 11v5z" />
      <circle cx="4" cy="18.5" r="2" />
      <circle cx="15" cy="18.5" r="2" />
      <circle cx="19" cy="18.5" r="2" />
      <path d="M9 13h2" />
    </>
  ),
  sprayer: (
    <>
      <rect x="8" y="8" width="8" height="6" rx="2" />
      <path d="M1 11h6M17 11h6" />
      <path d="M2 13v2M5 13v2M19 13v2M22 13v2" />
      <circle cx="9.5" cy="16" r="2" />
      <circle cx="14.5" cy="16" r="2" />
      <path d="M12 8V4" />
    </>
  ),
  car: (
    <>
      <path d="M3 13l1.8-5.2A2 2 0 0 1 6.7 6.5h10.6a2 2 0 0 1 1.9 1.3L21 13v4h-2M5 17H3v-4" />
      <path d="M3 13h18" />
      <circle cx="7" cy="17" r="2" />
      <circle cx="17" cy="17" r="2" />
    </>
  ),
  utv: (
    <>
      <circle cx="6.5" cy="16.5" r="3" />
      <circle cx="17.5" cy="16.5" r="3" />
      <path d="M3 15l2-4h6.5l3.5 4" />
      <path d="M5 11V6.5h7L14 11" />
      <path d="M9.5 16.5h5" />
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
