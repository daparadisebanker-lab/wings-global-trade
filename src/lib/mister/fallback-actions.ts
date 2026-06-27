// src/lib/mister/fallback-actions.ts
// 25-set fallback quick actions: 5 archetypes × 5 stages (incl. unresolved).
// Populated from copywriter.md §3 labels (es-PE primary).
// Used when the model's control block omits or has invalid quick_actions.
// Authoritative: spec/contributions/copywriter.md + ENRICHED_SPEC §7.4

import type { MisterArchetype, MisterStage, MisterQuickAction } from '@/types/mister'

type FallbackKey = `${MisterArchetype}:${MisterStage | 'induction'}`

const FALLBACK_MAP: Record<FallbackKey, MisterQuickAction[]> = {
  // ─── unresolved ────────────────────────────────────────────
  'unresolved:induction': [
    { label: 'Dime qué estás importando y para qué operación', action: 'ask_followup' },
    { label: 'Ver el catálogo de productos disponibles', action: 'show_product' },
    { label: 'Explícame cómo funciona el proceso de importación', action: 'ask_followup' },
  ],
  'unresolved:discovery': [
    { label: 'Dime qué estás importando y para qué operación', action: 'ask_followup' },
    { label: 'Ver el catálogo de productos disponibles', action: 'show_product' },
    { label: 'Explícame cómo se construye el costo de internación', action: 'explain_cost' },
  ],
  'unresolved:consideration': [
    { label: 'Muéstrame productos para mi uso', action: 'show_product' },
    { label: 'Explícame cómo se construye el costo de internación', action: 'explain_cost' },
    { label: 'Comparar algunas opciones para mí', action: 'show_comparison' },
  ],
  'unresolved:pre_qualification': [
    { label: 'Iniciar mi cotización', action: 'open_quotation' },
    { label: 'Hablar con alguien del equipo de Wings', action: 'connect_whatsapp' },
    { label: 'Descargar la ficha técnica', action: 'download_document' },
  ],
  'unresolved:support': [
    { label: 'Continuar por WhatsApp con un especialista', action: 'connect_whatsapp' },
    { label: 'Iniciar mi cotización', action: 'open_quotation' },
    { label: 'Enviarme la ficha y la estructura de costo', action: 'download_document' },
  ],

  // ─── lead_buyer ────────────────────────────────────────────
  'lead_buyer:induction': [
    { label: 'Muéstrame productos para mi uso', action: 'show_product' },
    { label: 'Explícame cómo se construye el costo de internación', action: 'explain_cost' },
    { label: 'Comparar algunas opciones para mí', action: 'show_comparison' },
  ],
  'lead_buyer:discovery': [
    { label: 'Muéstrame productos para mi uso', action: 'show_product' },
    { label: 'Explícame cómo se construye el costo de internación', action: 'explain_cost' },
    { label: 'Comparar algunas opciones para mí', action: 'show_comparison' },
  ],
  'lead_buyer:consideration': [
    { label: 'Desglosar las capas de costo de este producto', action: 'explain_cost' },
    { label: 'Explícame qué significa cada Incoterm para mi caso', action: 'ask_followup' },
    { label: 'Comparar este equipo con un modelo similar', action: 'show_comparison' },
  ],
  'lead_buyer:pre_qualification': [
    { label: 'Iniciar mi cotización', action: 'open_quotation' },
    { label: 'Descargar la ficha técnica', action: 'show_specs' },
    { label: 'Hablar con alguien del equipo de Wings', action: 'connect_whatsapp' },
  ],
  'lead_buyer:support': [
    { label: 'Enviarme la ficha y la estructura de costo', action: 'show_specs' },
    { label: 'Continuar por WhatsApp con un especialista', action: 'connect_whatsapp' },
    { label: 'Guardar sesión y retomar después', action: 'ask_followup' },
  ],

  // ─── project_manager ───────────────────────────────────────
  'project_manager:induction': [
    { label: 'Comparar este equipo con mis requisitos técnicos', action: 'show_comparison' },
    { label: 'Mostrarme productos de esta categoría', action: 'show_product' },
    { label: 'Verificar disponibilidad de certificados de cumplimiento', action: 'download_document' },
  ],
  'project_manager:discovery': [
    { label: 'Comparar este equipo con mis requisitos técnicos', action: 'show_comparison' },
    { label: 'Mostrarme productos de esta categoría', action: 'show_product' },
    { label: 'Verificar disponibilidad de certificados de cumplimiento', action: 'download_document' },
  ],
  'project_manager:consideration': [
    { label: 'Consolidar el paquete técnico y de cumplimiento para mi proyecto', action: 'show_specs' },
    { label: 'Explicar las opciones de Incoterm para mi estándar de entrega', action: 'ask_followup' },
    { label: 'Mostrar el proceso de entrega y plazos de referencia', action: 'ask_followup' },
  ],
  'project_manager:pre_qualification': [
    { label: 'Generar la cotización formal para adquisiciones', action: 'open_quotation' },
    { label: 'Agendar llamada con el especialista de proyectos de Wings', action: 'book_meeting' },
    { label: 'Descargar el paquete de certificados de cumplimiento', action: 'download_document' },
  ],
  'project_manager:support': [
    { label: 'Enviar el paquete técnico y de cumplimiento completo', action: 'show_specs' },
    { label: 'Agendar una llamada — tengo una fecha límite', action: 'book_meeting' },
    { label: 'Indicar mi fecha de entrega en la cotización', action: 'open_quotation' },
  ],

  // ─── logistics_manager ─────────────────────────────────────
  'logistics_manager:induction': [
    { label: 'Mapear el corredor Tacna/Iquique para este envío', action: 'ask_followup' },
    { label: 'Ver especificaciones de contenedor para esta mercancía', action: 'show_specs' },
    { label: 'Ver el proceso operativo de zona franca aplicable', action: 'ask_followup' },
  ],
  'logistics_manager:discovery': [
    { label: 'Mapear el corredor Tacna/Iquique para este envío', action: 'ask_followup' },
    { label: 'Ver especificaciones de contenedor para esta mercancía', action: 'show_specs' },
    { label: 'Ver el proceso operativo de zona franca aplicable', action: 'ask_followup' },
  ],
  'logistics_manager:consideration': [
    { label: 'Ver la matriz de responsabilidades Incoterm', action: 'show_specs' },
    { label: 'Explicar los requisitos de nacionalización SUNAT para esta mercancía', action: 'ask_followup' },
    { label: 'Optimizar el llenado del contenedor para mi volumen', action: 'explain_cost' },
  ],
  'logistics_manager:pre_qualification': [
    { label: 'Descargar el checklist SUNAT para mi país de destino', action: 'download_document' },
    { label: 'Conectarme con el equipo de logística de Wings', action: 'connect_whatsapp' },
    { label: 'Obtener una cotización de suministro para esta mercancía', action: 'open_quotation' },
  ],
  'logistics_manager:support': [
    { label: 'Descargar el paquete de documentos aduaneros para mi país', action: 'download_document' },
    { label: 'Agendar llamada — necesito diseñar un corredor recurrente', action: 'book_meeting' },
    { label: 'Conectarme con el equipo de agencias aduaneras', action: 'connect_whatsapp' },
  ],

  // ─── reseller ──────────────────────────────────────────────
  'reseller:induction': [
    { label: 'Ver el catálogo completo de esta categoría', action: 'show_product' },
    { label: 'Comparar los SKU de mayor margen en esta línea', action: 'show_comparison' },
    { label: 'Ver los niveles de MOQ de esta categoría', action: 'show_moq' },
  ],
  'reseller:discovery': [
    { label: 'Ver el catálogo completo de esta categoría', action: 'show_product' },
    { label: 'Comparar los SKU de mayor margen en esta línea', action: 'show_comparison' },
    { label: 'Ver los niveles de MOQ de esta categoría', action: 'show_moq' },
  ],
  'reseller:consideration': [
    { label: 'Abrir la tabla de MOQ de esta línea', action: 'show_moq' },
    { label: 'Ver cómo el costo de internación afecta mi margen de reventa', action: 'explain_cost' },
    { label: 'Explicar el impacto del Incoterm en mi cálculo de margen', action: 'ask_followup' },
  ],
  'reseller:pre_qualification': [
    { label: 'Solicitar condiciones de reventa para mi territorio', action: 'open_quotation' },
    { label: 'Conectarme con el equipo de alianzas comerciales', action: 'connect_whatsapp' },
    { label: 'Iniciar una cotización para revendedor', action: 'open_quotation' },
  ],
  'reseller:support': [
    { label: 'Descargar el catálogo de revendedor y tabla de MOQ', action: 'download_document' },
    { label: 'Conectar con el equipo de canales para hablar de exclusividad', action: 'connect_whatsapp' },
    { label: 'Explicar el proceso de exclusividad por territorio', action: 'ask_followup' },
  ],

  // ─── wholesale_partner ─────────────────────────────────────
  'wholesale_partner:induction': [
    { label: 'Ver el rango multi-SKU disponible para mis mercados', action: 'show_product' },
    { label: 'Ver el resumen del programa mayorista', action: 'ask_followup' },
    { label: 'Ver la matriz MOQ por categoría', action: 'show_moq' },
  ],
  'wholesale_partner:discovery': [
    { label: 'Ver el rango multi-SKU disponible para mis mercados', action: 'show_product' },
    { label: 'Ver el resumen del programa mayorista', action: 'ask_followup' },
    { label: 'Ver la matriz MOQ por categoría', action: 'show_moq' },
  ],
  'wholesale_partner:consideration': [
    { label: 'Abrir la matriz MOQ por tramo de volumen', action: 'show_moq' },
    { label: 'Ver el marco documental multi-país', action: 'download_document' },
    { label: 'Explicar la capacidad del corredor para mi volumen', action: 'explain_cost' },
  ],
  'wholesale_partner:pre_qualification': [
    { label: 'Iniciar cotización de programa con cuentas clave', action: 'connect_whatsapp' },
    { label: 'Agendar llamada con el equipo mayorista', action: 'book_meeting' },
    { label: 'Descargar la matriz MOQ multi-SKU', action: 'show_moq' },
  ],
  'wholesale_partner:support': [
    { label: 'Estructurar mi marco documental multi-país', action: 'download_document' },
    { label: 'Agendar reunión para negociar el acuerdo marco', action: 'book_meeting' },
    { label: 'Conectarme con el equipo de cuentas clave', action: 'connect_whatsapp' },
  ],
}

/**
 * Return the fallback quick actions for the given archetype × stage combination.
 * Falls back to unresolved:discovery if the combination is not in the map.
 */
export function getFallbackActions(
  archetype: MisterArchetype,
  stage: MisterStage,
): MisterQuickAction[] {
  // Map 'induction' to 'discovery' for the lookup key since induction is not a
  // persistent stage in the fallback map (most archetypes use discovery as the base).
  const key: FallbackKey = `${archetype}:${stage}`
  return FALLBACK_MAP[key] ?? FALLBACK_MAP['unresolved:discovery']!
}

/**
 * Validate that a quick action has a valid action id.
 * Returns true if valid.
 */
const VALID_ACTION_IDS = new Set([
  'ask_followup',
  'show_product',
  'show_comparison',
  'show_specs',
  'show_moq',
  'download_document',
  'open_quotation',
  'book_meeting',
  'connect_whatsapp',
  'explain_cost',
])

export function isValidQuickAction(
  action: unknown,
): action is MisterQuickAction {
  if (typeof action !== 'object' || action === null) return false
  const a = action as Record<string, unknown>
  return (
    typeof a.label === 'string' &&
    a.label.length > 0 &&
    typeof a.action === 'string' &&
    VALID_ACTION_IDS.has(a.action)
  )
}
