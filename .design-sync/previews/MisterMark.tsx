import { MisterMark } from '@wings/trade-ui'

export function SizeSweep() {
  return (
    <div style={{ padding: 24, background: '#F8F6F0', display: 'flex', alignItems: 'flex-end', gap: 24 }}>
      <MisterMark size={16} />
      <MisterMark size={28} />
      <MisterMark size={64} />
      <MisterMark size={128} />
    </div>
  )
}

export function OnNavy() {
  return (
    <div style={{ padding: 24, background: '#001E50', display: 'flex', alignItems: 'center' }}>
      <MisterMark size={64} />
    </div>
  )
}
