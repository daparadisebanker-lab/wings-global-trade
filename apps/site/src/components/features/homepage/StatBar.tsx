import { CountUpStat } from '@/components/features/homepage/CountUpStat'

const STATS = [
  { value: '97',  label: 'Modelos disponibles' },
  { value: '05',  label: 'Fabricantes verificados' },
  { value: '02',  label: 'Zonas francas' },
  { value: '24h', label: 'Respuesta garantizada' },
]

// On mobile (2-col): odd indexes are right column → border always
// Index 2 is left column on mobile → border only at md+
function borderClass(i: number): string {
  if (i === 0) return ''
  if (i % 2 !== 0) return 'border-l border-warm-white/[0.07] pl-8 md:pl-12'
  return 'md:border-l md:border-warm-white/[0.07] md:pl-12'
}

export function StatBar() {
  return (
    <div className="bg-[#000C1F] border-t border-warm-white/[0.06] px-6 py-10 md:px-10 md:py-12">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-y-10 md:grid-cols-4">
        {STATS.map((s, i) => (
          <div key={s.label} className={borderClass(i)}>
            <CountUpStat value={s.value} label={s.label} />
          </div>
        ))}
      </div>
    </div>
  )
}
