// Self-identification, not features. Each label is phrased so the buyer reads
// it and recognizes their own operation ("that's me"), rather than reading a
// spec restated as a badge. "Para…" framing puts the buyer's use-case first.
interface ChipRule {
  condition: (s: Record<string, unknown>, categorySlug: string) => boolean
  label: string
}

const RULES: ChipRule[] = [
  { condition: (s) => (s.payload_kg as number) >= 5000, label: 'Para carga pesada y sostenida' },
  { condition: (s) => (s.payload_kg as number) >= 1000 && (s.payload_kg as number) < 5000, label: 'Para reparto urbano de hasta 1 tonelada' },
  { condition: (s) => typeof s.transmission === 'string' && s.transmission.toLowerCase().includes('manual'), label: 'Para terreno irregular y pendientes' },
  { condition: (s) => (s.hp as number) > 150, label: 'Para jornadas de trabajo exigente' },
  { condition: (s) => (s.hp as number) >= 50 && (s.hp as number) <= 150, label: 'Para operación diaria y bajo consumo' },
  { condition: (_s, cat) => cat === 'maquinaria-agricola', label: 'Para faena agrícola continua' },
  { condition: (_s, cat) => cat === 'buses', label: 'Para transporte de pasajeros en ruta' },
  { condition: (s) => (s.gvw_kg as number) > 15000, label: 'Para operaciones de gran escala' },
  { condition: (s) => typeof s.cabin === 'string' && s.cabin.toLowerCase().includes('doble'), label: 'Para equipos que viajan con la carga' },
  { condition: (s) => typeof s.emission_standard === 'string' && s.emission_standard.toLowerCase().includes('euro'), label: 'Para zonas con norma de emisiones Euro-VI' },
]

const CATEGORY_FALLBACKS: Record<string, { label: string }[]> = {
  'maquinaria-agricola': [
    { label: 'Para faena agrícola continua' },
    { label: 'Para campo abierto y terreno difícil' },
    { label: 'Para uso de temporada completa' },
  ],
  buses: [
    { label: 'Para transporte de pasajeros en ruta' },
    { label: 'Para operación homologada de transporte' },
    { label: 'Para recorridos de carga mixta' },
  ],
  default: [
    { label: 'Para importación con ficha técnica verificada' },
    { label: 'Para abastecimiento de origen certificado' },
    { label: 'Para evaluación de compra inmediata' },
  ],
}

interface ReasonChipsProps {
  specs: Record<string, unknown>
  categorySlug: string
}

export default function ReasonChips({ specs, categorySlug }: ReasonChipsProps) {
  const matched = RULES.filter((rule) => {
    try {
      return rule.condition(specs, categorySlug)
    } catch {
      return false
    }
  }).slice(0, 3)

  const fallbacks = CATEGORY_FALLBACKS[categorySlug] ?? CATEGORY_FALLBACKS['default']
  const chips: { label: string }[] = [...matched]

  while (chips.length < 3) {
    const fallback = fallbacks[chips.length]
    if (fallback && !chips.find((c) => c.label === fallback.label)) {
      chips.push(fallback)
    } else {
      break
    }
  }

  return (
    <div className="flex flex-row flex-wrap gap-2">
      {chips.map((chip) => (
        <span
          key={chip.label}
          className="inline-flex items-center px-2.5 py-1 border-l-2 border-[#C4933F] bg-[#C4933F]/[0.06] text-[#F8F6F0] font-mono text-[10px] tracking-wide normal-case rounded-sm"
        >
          {chip.label}
        </span>
      ))}
    </div>
  )
}
