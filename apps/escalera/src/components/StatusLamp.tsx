// El Pasillo · §4.11 — the status lamp.
//
// An 8px dot with a mono caps label. The label always accompanies the dot: a
// colour alone is not a status, and this interface does not spend colour on
// anything but the product.
//
// It lives only on the record ground and the series header — NEVER on a tile
// face. A green dot over a green tile says nothing, and a dot of any hue over a
// tile is a claim about the product's colour that the interface has no business
// making.

import type { SeriesStatus } from '@/types/catalogue'

const LABEL: Record<SeriesStatus, string> = {
  available: 'Disponible',
  made_to_order: 'Bajo pedido',
  discontinued: 'Descontinuado',
}

export function StatusLamp({
  status,
  onDark = false,
}: {
  status: SeriesStatus
  onDark?: boolean
}) {
  const dot =
    status === 'available'
      ? 'bg-lamp-avail'
      : status === 'made_to_order'
        ? 'bg-lamp-made'
        : `border ${onDark ? 'border-surface/40' : 'border-ink/30'}`

  return (
    <p className="flex items-center gap-2">
      <span aria-hidden className={`h-2 w-2 rounded-full ${dot}`} />
      <span className="stamp opacity-resting">{LABEL[status]}</span>
    </p>
  )
}
