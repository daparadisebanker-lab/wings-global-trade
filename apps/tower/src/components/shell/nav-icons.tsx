// src/components/shell/nav-icons.tsx
// Line icons for the module rail. Geometric, 20×20, stroke = currentColor so they
// inherit the nav item's colour (navy → gold on active). No fills, ≤2px feel.
import type { FC, SVGProps } from 'react'
import type { NavIconId } from '@/lib/nav'

type IconProps = SVGProps<SVGSVGElement>

const SVG: FC<IconProps> = (p) => (
  <svg
    width={20}
    height={20}
    viewBox="0 0 20 20"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.6}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
    {...p}
  />
)

const Catalog: FC<IconProps> = (p) => (
  <SVG {...p}>
    <rect x="3" y="3" width="6" height="6" />
    <rect x="11" y="3" width="6" height="6" />
    <rect x="3" y="11" width="6" height="6" />
    <rect x="11" y="11" width="6" height="6" />
  </SVG>
)

const Pipeline: FC<IconProps> = (p) => (
  <SVG {...p}>
    <path d="M3 4h14l-5 6.5V16l-4-2v-3.5L3 4z" />
  </SVG>
)

const Quotations: FC<IconProps> = (p) => (
  <SVG {...p}>
    <path d="M5 3h6l4 4v10H5V3z" />
    <path d="M11 3v4h4" />
    <path d="M7.5 11h5M7.5 13.5h5" />
  </SVG>
)

const Clients: FC<IconProps> = (p) => (
  <SVG {...p}>
    <circle cx="7.5" cy="7" r="2.6" />
    <path d="M3 16c0-2.5 2-4 4.5-4s4.5 1.5 4.5 4" />
    <path d="M13.5 6.2a2.4 2.4 0 0 1 0 4.4M14 15.8c.3-2-.6-3.4-2-4.1" />
  </SVG>
)

const Containers: FC<IconProps> = (p) => (
  <SVG {...p}>
    <rect x="3" y="6" width="14" height="9" />
    <path d="M7 6v9M10 6v9M13 6v9" />
  </SVG>
)

const Costing: FC<IconProps> = (p) => (
  <SVG {...p}>
    <rect x="4" y="3" width="12" height="14" />
    <path d="M7 7h6M7 10h6M7 13h3" />
  </SVG>
)

const Marcas: FC<IconProps> = (p) => (
  <SVG {...p}>
    <path d="M11 3H16a1 1 0 0 1 1 1v5l-7.5 7.5L3 10l8-7z" />
    <circle cx="13.4" cy="6.6" r="1.1" />
  </SVG>
)

const Signals: FC<IconProps> = (p) => (
  <SVG {...p}>
    <path d="M3 12h4l2-6 3 9 2-5h3" />
  </SVG>
)

const Intelligence: FC<IconProps> = (p) => (
  <SVG {...p}>
    <path d="M10 3l1.6 5.4L17 10l-5.4 1.6L10 17l-1.6-5.4L3 10l5.4-1.6L10 3z" />
  </SVG>
)

const Admin: FC<IconProps> = (p) => (
  <SVG {...p}>
    <path d="M3 6h14M3 10h14M3 14h14" />
    <circle cx="8" cy="6" r="1.6" fill="var(--surface-1)" />
    <circle cx="13" cy="10" r="1.6" fill="var(--surface-1)" />
    <circle cx="7" cy="14" r="1.6" fill="var(--surface-1)" />
  </SVG>
)

export const NAV_ICONS: Record<NavIconId, FC<IconProps>> = {
  catalog: Catalog,
  pipeline: Pipeline,
  quotations: Quotations,
  clients: Clients,
  containers: Containers,
  costing: Costing,
  marcas: Marcas,
  signals: Signals,
  intelligence: Intelligence,
  admin: Admin,
}
