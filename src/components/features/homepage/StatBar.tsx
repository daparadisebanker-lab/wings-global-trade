import { CountUpStat } from '@/components/features/homepage/CountUpStat'

const STATS = [
  { value: '97', label: 'Modelos disponibles' },
  { value: '5',  label: 'Fabricantes verificados' },
  { value: '2',  label: 'Zonas francas' },
  { value: '24h', label: 'Respuesta garantizada' },
]

export function StatBar() {
  return (
    <div className="bg-[#000C1F] border-t border-warm-white/[0.06] px-6 py-10 md:px-10 md:py-12">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-y-10 md:grid-cols-4">
        {STATS.map((s, i) => (
          <div
            key={s.label}
            className={
              i > 0
                ? 'border-l border-warm-white/[0.07] pl-8 md:pl-12'
                : ''
            }
          >
            <CountUpStat value={s.value} label={s.label} />
          </div>
        ))}
      </div>
    </div>
  )
}
