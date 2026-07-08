// src/components/features/mister/MisterMark.tsx
// The registered Mister mark, for the brand header's ~28px avatar slot.
//
// Geometry copied VERBATIM from packages/liveries/mister/logo/mister-m-solid.svg
// — registered master, never edit coordinates. See
// spec/MISTER_LOGO_APPLICATION_STANDARD.md.
//
// Variant choice: mister-m-solid (M only). Per the standard's SIZE & SWITCHOVER
// table this slot renders far below 64px, so the SOLID SVG is mandatory (never
// the grain PNG); and the variant table assigns "favicon, app icon, avatar,
// stamps" to m-solid. At ~28px the full constellation's satellites would fall to
// ~1–2px and read as compression noise, so the M-only cut is the correct one
// (favicon gate verified legible to 16px).
//
// The viewBox already bakes in 1b clearspace — do NOT crop or add padding.
// Fill is the COLOR LAW token MISTER AZUL, with the registered hex as fallback
// for surfaces that have not imported the Mister livery.
'use client'

// viewBox of the registered m-solid variant — used to hold a uniform aspect
// ratio (spec refuses non-uniform scale).
const VIEWBOX = '2142.55 3479.44 1480.81 1275.54'
const VB_W = 1480.81
const VB_H = 1275.54

interface Props {
  /** Rendered mark height in px. Width is derived to keep uniform scale. */
  size?: number
  className?: string
}

export function MisterMark({ size = 28, className }: Props) {
  const width = (size * VB_W) / VB_H

  return (
    <svg
      width={width}
      height={size}
      viewBox={VIEWBOX}
      role="img"
      aria-hidden
      className={className}
    >
      <path
        fill="var(--mister-azul, #1D83F2)"
        d="M2552.67 4483.19c76.07,0 137.75,-61.67 137.75,-137.74 0,-19.34 -2.54,-38.47 -11.19,-54.46 -41.39,-76.41 -66.09,-51.25 -101.65,-105.48 -8.27,-12.61 -11.26,-28.44 -11.26,-44.58 0,-51.78 42.02,-93.63 93.72,-93.74 44.01,-0.09 80.76,29.91 90.93,71.16 9.3,37.66 -10.62,82.37 -3.39,114.19 11.7,64.22 67.91,112.91 135.51,112.91 56.54,0 105.12,-34.06 126.34,-82.78 16.76,-38.48 3.39,-78.39 3.39,-121.74 0,-6.32 0.63,-12.48 1.81,-18.45 8.56,-42.94 46.46,-75.29 91.91,-75.29 51.78,0 93.74,41.96 93.74,93.74 0,35.57 -21.04,64.48 -49.04,82.4 -31.81,20.35 -54.74,49.42 -54.74,49.42 -13.14,21.11 -20.74,46.01 -20.74,72.7 0,76.07 61.67,137.74 137.74,137.74 72.89,0 132.56,-56.61 137.43,-128.26 0.21,-3.13 0.32,-6.3 0.32,-9.48 0,-12.89 -0.87,-25.64 -5.08,-37.18 -11.35,-31.13 -25.76,-48.15 -37.47,-62.32 -7.65,-9.26 -15.27,-18.6 -21.54,-28.92 -17.65,-29.01 -27.82,-63.1 -27.71,-99.78 0.11,-39.6 12.04,-76.42 32.29,-106.87 31.77,-47.75 59.52,-67.58 59.52,-121.32 0,-12.26 -1.6,-24.16 -4.61,-35.48 -15.65,-58.89 -69.33,-102.27 -133.14,-102.27 -42.92,0 -81.16,19.68 -106.46,50.43 -5.19,6.31 -10.67,12.69 -13.88,20.26 -12.31,29.06 -13.61,41.8 -19.74,81.04 -14.44,92.12 -94.16,162.59 -190.34,162.59 -78.73,0 -146.44,-47.22 -176.33,-114.88 -27.98,-63.35 -7.65,-86.54 -38.87,-137.18 -23.53,-38.18 -67.02,-62.26 -115.22,-62.26 -76.07,0 -137.75,61.67 -137.75,137.75 0,11.83 0.45,23.62 4.3,34.25 18.23,50.37 27.68,51.06 56.54,89.15 21.72,28.66 30.97,66.15 30.97,104.79 0,26.59 -5.39,51.92 -15.13,74.96 -6.53,15.44 -13.7,30.99 -25.15,42.93 -29.47,30.73 -51.54,66.69 -51.54,110.3 0,76.07 61.67,137.74 137.75,137.74z"
      />
    </svg>
  )
}
