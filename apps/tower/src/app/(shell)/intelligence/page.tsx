import { EmptyState } from '@/components/ui/EmptyState'

// Intelligence — Wave 4. Placeholder shell surface.
export default function IntelligencePage() {
  return (
    <EmptyState
      tag="INT · Intelligence"
      title={{ es: 'Inteligencia', en: 'Intelligence' }}
      description={{
        es: 'Triage, extracción de especificaciones, scoring y supervisión de Mister. La IA propone, el humano decide. En construcción.',
        en: 'Triage, spec extraction, scoring, and Mister supervision. Intelligence proposes, humans dispose. Under construction.',
      }}
    />
  )
}
