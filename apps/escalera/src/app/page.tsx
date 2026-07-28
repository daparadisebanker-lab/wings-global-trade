'use client'

import { Lane } from '@/components/Lane'
import { DensitySwitch, RecordTab, SheetDock, useSheet } from '@/components/PasilloShell'

export default function PasilloPage() {
  const sheet = useSheet()
  return (
    <>
      <DensitySwitch />
      <Lane onOpenSku={sheet.open} />
      <RecordTab />
      <SheetDock sku={sheet.sku} onClose={sheet.close} onOpenSku={sheet.open} />
    </>
  )
}
