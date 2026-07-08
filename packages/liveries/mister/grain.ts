// packages/liveries/mister/grain.ts
//
// Interface stub only. The stipple grain is Mister's constant (mark DNA) —
// see spec/MISTER_EXPRESSIVE_LAYER_SPEC.md, "THE CONSTANT — GRAIN":
// dissolve is directional (dense core -> particles escape outward, never
// random), grain scale is consistent per surface class.
//
// TODO(grain): noise parameters freeze after first render — do not invent
// values. Populate GrainConfig implementations only once a first render has
// been produced and judged against spec/MISTER_EXPRESSIVE_LAYER_SPEC.md.

/** Directional-dissolve parameters: dense core -> particles escape outward. */
export interface GrainDissolveConfig {
  /** Unit vector (or angle in degrees) particles escape along. */
  direction: { x: number; y: number } | number
  /** How far dissolved particles travel from the dense core, in local units. */
  travel: number
  /** Falloff curve name/id applied from core density to edge dissolve. */
  falloff: string
}

/** Full grain config for one expressive surface class. */
export interface GrainConfig {
  /** Identifies which surface class this config governs (e.g. "fillmeter", "junction"). */
  surfaceClass: string
  /** Noise scale — feTurbulence baseFrequency or shader-equivalent. */
  noiseScale: number
  /** Stipple density, 0..1. */
  density: number
  /** Directional dissolve behavior — see GrainDissolveConfig. */
  dissolve: GrainDissolveConfig
  /** Random seed, frozen once a surface class's grain is accepted. */
  seed: number
}
