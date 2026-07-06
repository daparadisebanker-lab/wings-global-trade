import { EmptyState } from '@/components/ui/EmptyState'

// Catalog Studio (PIM) — Wave 2. Placeholder shell surface.
export default function CatalogPage() {
  return (
    <EmptyState
      tag="CAT · Catalog Studio"
      title={{ es: 'Catálogo', en: 'Catalog' }}
      description={{
        es: 'PIM: catálogo, formularios de especificación por esquema y publicación al sitio. En construcción.',
        en: 'PIM: catalog, schema-driven spec forms, and publish-to-site. Under construction.',
      }}
    />
  )
}
