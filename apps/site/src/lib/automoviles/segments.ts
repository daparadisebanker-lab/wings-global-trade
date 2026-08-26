// src/lib/automoviles/segments.ts
//
// Explicit specs.Segmento → canonical taxonomy slug map. Not a keyword
// heuristic on purpose: an earlier substring-match attempt ("does Segmento
// start with the segment name's first word?") silently mis-bucketed every
// SUV sub-segment into the same count, because "SUV compacto", "SUV
// mediano" and "SUV todoterreno" all start with "SUV". Explicit mapping is
// the only version of this that's actually correct. Matches
// packages/liveries/automoviles/lane.config.ts's five taxonomy slugs.

export const SEGMENTO_TO_SLUG: Record<string, string> = {
  'Sedán compacto': 'sedan',
  'Sedán deportivo compacto': 'sedan',
  'Sedán ejecutivo': 'sedan',
  'Sedán ejecutivo de batalla larga': 'sedan',
  'Sedán ejecutivo grand tourer': 'sedan',
  'Fastback ejecutivo': 'sedan',
  'Hatchback premium': 'sedan',
  'Compacto urbano': 'sedan',
  'SUV compacto': 'suv-compacto',
  'SUV compacto premium': 'suv-compacto',
  'Crossover subcompacto': 'suv-compacto',
  'SUV mediano': 'suv-mediano-grande',
  'SUV mediano 7 plazas': 'suv-mediano-grande',
  'SUV mediano premium': 'suv-mediano-grande',
  'SUV todoterreno grande': 'suv-todoterreno',
  'SUV todoterreno mediano': 'suv-todoterreno',
  'Furgoneta / MPV comercial': 'mpv-furgoneta',
  'Furgoneta / minivan comercial': 'mpv-furgoneta',
}

export function segmentSlug(segmento: string | undefined): string | undefined {
  if (!segmento) return undefined
  return SEGMENTO_TO_SLUG[segmento]
}
