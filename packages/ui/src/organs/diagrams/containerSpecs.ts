// @wings/trade-ui · organs/diagrams/containerSpecs.ts
// Shared ISO container geometry + fit types for the diagram organs (RB Console
// Wave 0). Moved verbatim from apps/site/src/lib/cubicaje/fit.ts — values are
// byte-identical, zero behavior change. apps/site re-exports these through its
// lib/cubicaje/fit.ts so existing callers are unchanged.
//
// NOTE (tracked follow-up): ContainerSliceDiagram still carries its own internal
// `DIMS` (2D slice l/h). Unifying it into a single CONTAINER_SPECS is a pure
// refactor deferred here to keep this move render-identical.

export interface ContainerKindSpec {
  kind: '20GP' | '40GP' | '40HC'
  label: string
  /** interior mm */
  l: number
  w: number
  h: number
  /** kg */
  payload: number
  cbm: number
}

export const CONTAINER_KINDS: ContainerKindSpec[] = [
  { kind: '20GP', label: "20' Standard", l: 5898, w: 2352, h: 2393, payload: 28200, cbm: 33.2 },
  { kind: '40GP', label: "40' Standard", l: 12032, w: 2352, h: 2393, payload: 28200, cbm: 67.7 },
  { kind: '40HC', label: "40' High Cube", l: 12032, w: 2352, h: 2698, payload: 28500, cbm: 76.4 },
]

export interface FitResult {
  count: number
  /** chosen orientation in mm along container L / W / H */
  unit: { l: number; w: number; h: number }
  grid: { alongL: number; alongW: number; layers: number }
  volumeUtilization: number
  totalKg: number
  weightBound: boolean
  /** if weight-limited, the volumetric count before the payload cap */
  volumetricCount: number
}
