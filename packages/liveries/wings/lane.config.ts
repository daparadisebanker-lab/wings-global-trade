// packages/liveries/wings/lane.config.ts
//
// The Wings house livery config. NOTE: per the M2 migration constraint, the
// current site is NOT yet registered as an ecosystem lane — this config records
// the livery identity that maps to the live site's values, ready for formal lane
// onboarding later. It intentionally carries no WGT/NN code yet (codes are
// assigned at onboarding and are append-only, never reused).

export const lane = {
  code: null, // assigned at ecosystem onboarding (append-only); not a lane yet
  slug: 'wings',
  name: 'Wings Global Trade',
  scope:
    'Importación técnica B2B para el mercado latinoamericano · Technical B2B import for the Latin American market',
  // Wings today is the multi-category house catalog, not a single archetype lane.
  archetype: 'EQUIPMENT',
  buyer: ['importers', 'resellers', 'project managers', 'wholesale partners'],
  unitMath: 'per unit / per crate CBM',
  ground: '#001E50', // navy — the steel-shop cold blue
  ink: '#F8F6F0', // warm white on navy
  accent: '#C4933F', // harvest gold
  texture: 'none/high-key',
  typePosture: 'compressed-caps',
  status: 'HOUSE', // not OPENING/ACTIVE — this is the ecosystem host, pre-onboarding
} as const

export type WingsLane = typeof lane
