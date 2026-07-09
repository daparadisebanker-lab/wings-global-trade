// src/lib/catalog-applications.ts
// Application-context definitions for SEO landing pages.
// Captures LATAM search intent: "tractores para arroz", "tractores para frutales", etc.

export interface CatalogApplication {
  slug: string
  name_es: string
  description_es: string
  recommendedHpRange: string
  recommendedTraction: string
  metaTitle: string
  metaDescription: string
  heroSubtitle: string
  filterParams: Record<string, string>
}

export const CATALOG_APPLICATIONS: Record<string, CatalogApplication[]> = {
  'maquinaria-agricola': [
    {
      slug: 'arrozal',
      name_es: 'Tractores para Arrozal',
      description_es:
        'Tractores de alta tracción 4WD para suelos húmedos y cultivos de arroz. Alta flotación y tracción en barro.',
      recommendedHpRange: '50-100',
      recommendedTraction: '4wd',
      metaTitle: 'Tractores para Arrozal — Importación directa | Wings Global Trade',
      metaDescription:
        'Tractores 4WD 50-100 HP certificados para cultivo de arroz. Importación desde China vía ZOFRATACNA. Consulta técnica sin registro.',
      heroSubtitle: '4WD · Alta flotación · 50–100 HP recomendado',
      filterParams: { traction: '4wd', hp: '50-100' },
    },
    {
      slug: 'frutales',
      name_es: 'Tractores para Frutales y Huertos',
      description_es:
        'Tractores compactos y de baja altura para entre hileras. Diseñados para viñedos, citrus, paltos y frutales.',
      recommendedHpRange: '15-50',
      recommendedTraction: '4wd',
      metaTitle: 'Tractores para Frutales y Huertos — Importación | Wings',
      metaDescription:
        'Tractores compactos 4WD para frutales, viñedos y huertos. Baja altura, alta maniobrabilidad. Importación desde China a LATAM.',
      heroSubtitle: 'Compactos · Baja altura · 4WD',
      filterParams: { traction: '4wd', hp: '15-50' },
    },
    {
      slug: 'cultivos-surco',
      name_es: 'Tractores para Cultivos en Surco',
      description_es:
        'Tractores medianos y pesados para maíz, soja, girasol y cultivos de gran escala. Potencia y transmisión sincronizada.',
      recommendedHpRange: '80-200',
      recommendedTraction: '4wd',
      metaTitle: 'Tractores para Maíz y Cultivos en Surco | Wings Global Trade',
      metaDescription:
        'Tractores 80-200 HP para maíz, soja, girasol. Transmisión sincronizada. Importación directa desde China con gestión en zona franca.',
      heroSubtitle: 'Alta potencia · Transmisión sincronizada · 80–200 HP',
      filterParams: { traction: '4wd', hp: '100-200' },
    },
    {
      slug: 'ganaderia',
      name_es: 'Tractores para Ganadería y Pasturas',
      description_es:
        'Tractores multiusos para manejo de pasturas, carga de forraje y operaciones ganaderas.',
      recommendedHpRange: '50-100',
      recommendedTraction: '2wd',
      metaTitle: 'Tractores para Ganadería — Importación B2B | Wings',
      metaDescription:
        'Tractores multiusos para ganadería y pasturas. 2WD y 4WD disponibles. Importación directa desde China para LATAM.',
      heroSubtitle: 'Multiusos · 2WD y 4WD disponibles',
      filterParams: { hp: '50-100' },
    },
  ],
}

/**
 * Returns the application definition for a given category + useCase slug pair.
 * Returns undefined if not found.
 */
export function getCatalogApplication(
  categorySlug: string,
  useCaseSlug: string,
): CatalogApplication | undefined {
  const apps = CATALOG_APPLICATIONS[categorySlug]
  if (!apps) return undefined
  return apps.find((a) => a.slug === useCaseSlug)
}
