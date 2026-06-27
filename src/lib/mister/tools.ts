// src/lib/mister/tools.ts
// Server-side context assembly tools (NOT Anthropic tool_use — these are plain async functions).
// Called during context assembly before the model API call.
// Authoritative: ai-engineer.md §2
// NO fetchPrice, getLeadTime, fetchStock, getAvailability — architectural anti-price guarantee.

import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  MisterArchetype,
  MisterStage,
  MisterCollected,
  ProductSurface,
  ComparisonSurface,
  DocumentSurface,
  ContactSurface,
  MoqSurface,
} from '@/types/mister'

// ─────────────────────────────────────────────────────────────
// fetchProduct — fires when currentProductId is non-null
// ─────────────────────────────────────────────────────────────
interface ProductRow {
  id: string
  slug: string
  name_es: string
  description_es: string
  specs: Record<string, string>
  images: string[]
  models: unknown
  trade_intelligence?: string
  category_id: string
}

export async function fetchProduct(
  productId: string,
  supabase: SupabaseClient,
): Promise<ProductSurface | null> {
  const { data, error } = await supabase
    .from('products')
    .select('id, slug, name_es, description_es, specs, images, models, trade_intelligence, category_id')
    .eq('id', productId)
    .eq('is_active', true)
    .single<ProductRow>()

  if (error || !data) return null

  return {
    id: data.id,
    slug: data.slug,
    name: data.name_es,
    category: data.category_id,
    summary: data.description_es.slice(0, 300),
    specs: data.specs as Record<string, string>,
    imageUrl: data.images?.[0],
  }
}

// ─────────────────────────────────────────────────────────────
// preloadComparison — fires when productInterest has ≥2 entries
// ─────────────────────────────────────────────────────────────
export async function preloadComparison(
  productIds: string[],
  supabase: SupabaseClient,
): Promise<ComparisonSurface | null> {
  const { data, error } = await supabase
    .from('products')
    .select('id, name_es, specs')
    .in('id', productIds)
    .eq('is_active', true)

  if (error || !data || data.length < 2) return null

  // Find axes: union of all spec keys across products, capped at 8
  const allKeys = new Set<string>()
  for (const product of data) {
    const specs = product.specs as Record<string, string>
    Object.keys(specs).forEach((k) => allKeys.add(k))
  }
  const axes = Array.from(allKeys).slice(0, 8)

  return {
    products: data.map((p) => ({
      id: p.id as string,
      name: p.name_es as string,
      specs: p.specs as Record<string, string>,
    })),
    axes,
  }
}

// ─────────────────────────────────────────────────────────────
// fetchDocument — fires when destinationCountry is set
// ─────────────────────────────────────────────────────────────
export async function fetchDocument(
  destinationCountry: string,
  productType: string,
  supabase: SupabaseClient,
): Promise<DocumentSurface | null> {
  // Normalize country to 2-letter code (simple mapping for top markets)
  const countryCode = normalizeCountryCode(destinationCountry)

  const { data, error } = await supabase
    .from('mister_documents')
    .select('title, public_url, is_available, country_code, product_type')
    .or(`country_code.eq.${countryCode},country_code.eq.ALL`)
    .or(`product_type.eq.${productType},product_type.eq.ALL`)
    .order('is_available', { ascending: false })
    .limit(1)
    .single()

  if (error || !data) return null

  return {
    available: Boolean(data.is_available),
    title: data.title as string | undefined,
    url: data.public_url as string | undefined,
    country: data.country_code as string,
    productType: data.product_type as string,
  }
}

// ─────────────────────────────────────────────────────────────
// fetchContact — fires when stage is pre_qualification or support
// ─────────────────────────────────────────────────────────────
function archetypeToCategory(archetype: MisterArchetype): string {
  const map: Record<MisterArchetype, string> = {
    lead_buyer: 'sales',
    project_manager: 'project',
    logistics_manager: 'logistics',
    reseller: 'partnerships',
    wholesale_partner: 'key_accounts',
    unresolved: 'sales',
  }
  return map[archetype]
}

export async function fetchContact(
  archetype: MisterArchetype,
  supabase: SupabaseClient,
): Promise<ContactSurface | null> {
  const category = archetypeToCategory(archetype)

  const { data, error } = await supabase
    .from('mister_contacts')
    .select('name, role, whatsapp, email')
    .contains('archetypes', [archetype])
    .eq('category', category)
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
    .limit(1)
    .single()

  if (error || !data) {
    // Fallback to ops number
    return {
      name: 'Wings Global Trade',
      role: 'Operaciones',
      whatsapp: process.env.MISTER_OPS_WHATSAPP ?? '+50760250735',
    }
  }

  return {
    name: data.name as string,
    role: data.role as string,
    whatsapp: data.whatsapp as string,
    email: data.email as string | undefined,
  }
}

// ─────────────────────────────────────────────────────────────
// triggerQuotationForm — separate endpoint, not called during stream
// ─────────────────────────────────────────────────────────────
// Called via POST /api/mister/quote — see that route for implementation.

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

/**
 * Determine active stage from session + request context.
 */
export function isEscalationStage(stage: MisterStage): boolean {
  return stage === 'pre_qualification' || stage === 'support'
}

/**
 * Infer a product type string from session collected data.
 * Used for document lookup.
 */
export function inferProductType(collected: MisterCollected): string {
  const interest = collected.productInterest
  if (interest && interest.length > 0) return 'ALL'
  return 'ALL'
}

/**
 * Simple country name → ISO 3166-1 alpha-2 code mapping for top Mister markets.
 */
function normalizeCountryCode(country: string): string {
  const map: Record<string, string> = {
    peru: 'PE',
    perú: 'PE',
    pe: 'PE',
    bolivia: 'BO',
    bo: 'BO',
    chile: 'CL',
    cl: 'CL',
    colombia: 'CO',
    co: 'CO',
    panamá: 'PA',
    panama: 'PA',
    pa: 'PA',
    paraguay: 'PY',
    py: 'PY',
    argentina: 'AR',
    ar: 'AR',
  }
  return map[country.toLowerCase().trim()] ?? country.toUpperCase().slice(0, 2)
}

/** Infer MOQ surface from product data if available */
export function inferMoqSurface(
  product: ProductSurface | null,
): MoqSurface | null {
  if (!product) return null
  // MOQ data is embedded in product.specs — expose the category for the component
  return {
    category: product.category,
    tiers: [
      { minQty: 1, description: 'Unidad suelta (LCL / consolidado)' },
      { minQty: 10, description: 'Media carga — contenedor 20\'GP compartido' },
      { minQty: 20, description: 'Carga completa — contenedor 40\'HC FCL' },
    ],
  }
}
