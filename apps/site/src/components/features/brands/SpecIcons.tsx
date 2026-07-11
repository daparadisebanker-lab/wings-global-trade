// src/components/features/brands/SpecIcons.tsx
// Technical line icons for product spec rows — stroke-only, currentColor,
// drawn on a 24px grid at 1.5px stroke. Content-level icons (brand canvas);
// Wings chrome iconography is untouched (root law §5-bis: icons are
// content, never chrome).
import type { SVGProps } from 'react'

const base: SVGProps<SVGSVGElement> = {
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
}

export type SpecIconId =
  | 'package'
  | 'sheet'
  | 'weight'
  | 'box'
  | 'barcode'
  | 'ship'
  | 'seal'
  | 'ruler'

export function SpecIcon({ id }: { id: SpecIconId }) {
  switch (id) {
    case 'package': // roll / presentation
      return (
        <svg {...base}>
          <circle cx="9" cy="12" r="6" />
          <circle cx="9" cy="12" r="1.8" />
          <path d="M9 6h7a6 6 0 0 1 0 12H9" />
        </svg>
      )
    case 'sheet': // layers / hoja
      return (
        <svg {...base}>
          <path d="M4 8l8-4 8 4-8 4-8-4z" />
          <path d="M4 12l8 4 8-4" />
          <path d="M4 16l8 4 8-4" />
        </svg>
      )
    case 'weight':
      return (
        <svg {...base}>
          <path d="M9 7a3 3 0 1 1 6 0" />
          <path d="M5 7h14l2 13H3L5 7z" />
        </svg>
      )
    case 'box': // caja máster
      return (
        <svg {...base}>
          <path d="M3 8l9-5 9 5v8l-9 5-9-5V8z" />
          <path d="M3 8l9 5 9-5" />
          <path d="M12 13v8" />
        </svg>
      )
    case 'barcode': // GTIN
      return (
        <svg {...base}>
          <path d="M4 6v12M8 6v12M11 6v12M14 6v8M17 6v12M20 6v12" strokeWidth={1.8} />
        </svg>
      )
    case 'ship': // origen / importado
      return (
        <svg {...base}>
          <path d="M3 15h18l-2 5H5l-2-5z" />
          <path d="M6 15V9h12v6" />
          <path d="M10 9V5h4v4" />
        </svg>
      )
    case 'seal': // registro sanitario
      return (
        <svg {...base}>
          <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" />
          <path d="M8.5 12l2.5 2.5 4.5-4.5" />
        </svg>
      )
    case 'ruler': // dimensiones
      return (
        <svg {...base}>
          <rect x="3" y="9" width="18" height="6" rx="0.5" />
          <path d="M7 9v3M11 9v2.4M15 9v3M19 9v2.4" />
        </svg>
      )
  }
}
