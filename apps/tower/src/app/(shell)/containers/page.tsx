import { EmptyState } from '@/components/ui/EmptyState'

// Container Desk (ERP) — Wave 3. Placeholder shell surface.
export default function ContainersPage() {
  return (
    <EmptyState
      tag="CTN · Container Desk"
      title={{ es: 'Contenedores', en: 'Containers' }}
      description={{
        es: 'ERP: llenado de CBM, POs, checkpoints de QC, documentos y costo de aterrizaje. En construcción.',
        en: 'ERP: CBM fill, POs, QC checkpoints, documents, and landed cost. Under construction.',
      }}
    />
  )
}
