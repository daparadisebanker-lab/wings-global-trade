'use client'

import { Lista } from '@/components/Lista'
import { DensitySwitch, RecordTab, SheetDock, useSheet } from '@/components/PasilloShell'

export default function ListaPage() {
  const sheet = useSheet()
  return (
    <>
      <DensitySwitch />
      <Lista onOpenSku={sheet.open} />
      <RecordTab />
      <SheetDock sku={sheet.sku} onClose={sheet.close} onOpenSku={sheet.open} />
    </>
  )
}
