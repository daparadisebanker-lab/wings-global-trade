'use client'

import { Muestrario } from '@/components/Muestrario'
import { SheetDock, useSheet } from '@/components/PasilloShell'

export default function MuestrarioPage() {
  const sheet = useSheet()
  return (
    <>
      <Muestrario onOpenSku={sheet.open} />
      <SheetDock sku={sheet.sku} onClose={sheet.close} onOpenSku={sheet.open} />
    </>
  )
}
