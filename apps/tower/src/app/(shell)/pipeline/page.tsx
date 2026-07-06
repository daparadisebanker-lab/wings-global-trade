import { EmptyState } from '@/components/ui/EmptyState'

// Pipeline (CRM) — archetype-native stages. Placeholder shell surface.
export default function PipelinePage() {
  return (
    <EmptyState
      tag="PIP · Pipeline"
      title={{ es: 'Pipeline', en: 'Pipeline' }}
      description={{
        es: 'CRM: RFQ por etapas de arquetipo, cotizaciones y transcripciones de Mister. En construcción.',
        en: 'CRM: RFQs on archetype-native stages, quotes, and Mister transcripts. Under construction.',
      }}
    />
  )
}
