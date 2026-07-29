'use client'

import { Muestrario } from '@/pasillo/components/Muestrario'
import { SheetDock, useSheet } from '@/pasillo/components/PasilloShell'

export default function MuestrarioPage() {
  const sheet = useSheet()
  return (
    <>
      <Muestrario onOpenSku={sheet.open} />
      <SheetDock sku={sheet.sku} onClose={sheet.close} onOpenSku={sheet.open} />
    </>
  )
}
