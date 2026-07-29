'use client'

import { Suspense } from 'react'
import { Lista } from '@/pasillo/components/Lista'
import { DensitySwitch, RecordTab, SheetDock, useSheet } from '@/pasillo/components/PasilloShell'

function ListaView() {
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

export default function ListaPage() {
  // Lista reads ?sku= so a shared link arrives with the code already in the
  // filter box. See the aisle page for why the boundary matters here.
  return (
    <Suspense>
      <ListaView />
    </Suspense>
  )
}
