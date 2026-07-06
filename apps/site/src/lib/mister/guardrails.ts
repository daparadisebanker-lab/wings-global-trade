// src/lib/mister/guardrails.ts
// Output guardrails: price/availability scan + input sanitization.
// Authoritative: ENRICHED_SPEC §7.5, ai-engineer.md §5
// Implementation: stream-then-scan (per ai-engineer.md §5 decision).
// Indexed [low, high] patterns PASS — the regexes scope to currency symbols/words only.

// ─────────────────────────────────────────────────────────────
// Routing messages (emitted to client when guardrail fires)
// ─────────────────────────────────────────────────────────────
export const ROUTING_MESSAGE_ES =
  'Para precios específicos, necesito pasarte a nuestro equipo de ventas — ellos preparan la cotización formal con los números reales para tu pedido. ¿Prefieres continuar por WhatsApp o abrir el formulario de cotización ahora?'

export const ROUTING_MESSAGE_EN =
  "For specific pricing I need to route you to our sales team — they prepare the formal quotation with real figures for your order. Would you prefer to continue on WhatsApp or open the quotation form now?"

// ─────────────────────────────────────────────────────────────
// Price guardrail patterns (EN + ES)
// ─────────────────────────────────────────────────────────────
export const PRICE_GUARDRAIL_PATTERNS: RegExp[] = [
  // Currency symbols followed by digits — catches $12,000 / USD 5000 / S/. 3500
  /\b(US?\$|S\/\.?|USD|PEN|EUR|€|\$)\s*\d[\d,.]+/gi,
  // Digits followed by currency words — catches "12000 soles" / "5 mil dólares"
  /\d[\d,.]*\s*(soles?|d[oó]lares?|euros?)\b/gi,
  // Incoterm label immediately followed by a number — catches "CIF: 12000"
  /\b(CIF|FOB|DDP|CFR|DAP|EXW)\s*:?\s*[\d$€]/gi,
  // Price-label keywords followed by a number
  /\b(precio|costo|cif\s+total|fob\s+total|total\s+estimado|landed\s+cost)\s*:?\s*\d[\d,.]+/gi,
  // Bare US dollar figure
  /US?\$\d[\d,.]+/gi,
  // Number-as-words currency — catches "quince mil dólares" / "cinco mil soles"
  /\b(mil|miles)\s+(de\s+)?(d[oó]lares?|soles?)\b/gi,
]

// ─────────────────────────────────────────────────────────────
// Availability guardrail patterns (EN + ES)
// ─────────────────────────────────────────────────────────────
export const AVAILABILITY_GUARDRAIL_PATTERNS: RegExp[] = [
  // Lead time with a concrete number — catches "en 30 días" / "in 6 weeks"
  /(en|in|within)\s+\d+\s+(d[íi]as?|semanas?|meses?|days?|weeks?|months?)/gi,
  // Stock statements
  /(en\s+stock|in\s+stock|disponible\s*(ahora|hoy|inmediatamente?)|available\s*(now|today|immediately))/gi,
  // Lead time label with digit
  /lead\s*time\s*:?\s*\d/gi,
  // "Entrega en X"
  /entrega\s+en\s+\d/gi,
  // "Te lo enviamos en X"
  /te\s+(lo\s+)?(entregamos?|enviamos?)\s+en\s+\d/gi,
  // "Llegará/llega en X"
  /(llegará|llega|arrives?)\s+en\s+\d/gi,
  // Duration verb + number — catches "tarda 60–90 días" / "demora 75 días" / "requiere 3 semanas"
  // (no prefix required, unlike the "en/in/within" pattern above)
  /(tarda|demora|toma|requiere|dura)\s+(entre\s+)?\d+(\s*(?:[–-]|y)\s*\d+)?\s+(d[íi]as?|semanas?|meses?)/gi,
  // Bare day-range near shipping context — ranges of days are always lead-time claims in
  // this domain (index points use "puntos", never "días"), so no prefix/verb is required
  /\d+\s*[–-]\s*\d+\s*d[íi]as/gi,
  // English duration verb + number — catches "takes 60–90 days" / "requires 3 weeks"
  /(takes|requires)\s+(about\s+)?\d+(\s*[–-]\s*\d+)?\s+(days?|weeks?|months?)/gi,
]

export interface GuardrailResult {
  violated: boolean
  patterns: string[]
}

/**
 * Scan text for price and availability violations.
 * Indexed [low, high] bracketed patterns are NOT caught — the regexes
 * require currency symbols or specific currency words.
 */
export function scanGuardrails(text: string): GuardrailResult {
  const violated: string[] = []

  for (const pattern of PRICE_GUARDRAIL_PATTERNS) {
    pattern.lastIndex = 0
    if (pattern.test(text)) {
      violated.push(`price:${pattern.source}`)
    }
  }
  for (const pattern of AVAILABILITY_GUARDRAIL_PATTERNS) {
    pattern.lastIndex = 0
    if (pattern.test(text)) {
      violated.push(`availability:${pattern.source}`)
    }
  }

  return { violated: violated.length > 0, patterns: violated }
}

// ─────────────────────────────────────────────────────────────
// Input sanitization — prompt injection detection
// ─────────────────────────────────────────────────────────────
const INJECTION_PATTERNS: RegExp[] = [
  /ignore\s+(previous|prior|all)\s+instructions?/i,
  /disregard\s+(your|the|all)\s+(system\s+prompt|instructions?)/i,
  /you\s+are\s+now\s+(a|an)\s+\w+/i,
  /repeat\s+(back\s+)?(your|the)\s+system\s+prompt/i,
  /output\s+your\s+(full\s+)?(instructions?|system\s+prompt)/i,
  /act\s+as\s+if\s+you\s+(are|were)\s+(not|a|an)/i,
  /jailbreak/i,
  /dan\s+mode/i,
  // Spanish equivalents — es-PE is the primary locale, so these are not optional
  /ignora\s+(las\s+)?(instrucciones|reglas)\s+(anteriores|previas|del\s+sistema)/i,
  /olvida\s+(todo\s+)?(lo\s+anterior|tus\s+instrucciones)/i,
  /(muestra|repite|imprime|rev[eé]la(?:me)?)\s+(tu|el)\s+(prompt|sistema|instrucciones)/i,
  /ahora\s+eres\s+(un|una)\s+\w+/i,
  /act[uú]a\s+como\s+si\s+(no\s+)?(fueras|tuvieras)/i,
  /modo\s+(desarrollador|developer|dios|sin\s+restricciones)/i,
]

export interface SanitizeResult {
  clean: string
  injectionDetected: boolean
}

/**
 * Detect prompt injection attempts and neutralize them.
 * Does not reveal detection to the user — replaces with a neutral trade query.
 */
export function sanitizeInput(userMessage: string): SanitizeResult {
  const injectionDetected = INJECTION_PATTERNS.some((p) => p.test(userMessage))
  if (!injectionDetected) {
    return { clean: userMessage, injectionDetected: false }
  }
  return {
    clean: 'Tengo una consulta sobre importación de productos.',
    injectionDetected: true,
  }
}

/**
 * Return the appropriate routing message for the session locale.
 */
export function getRoutingMessage(locale: string): string {
  return locale.startsWith('en') ? ROUTING_MESSAGE_EN : ROUTING_MESSAGE_ES
}

/**
 * Build a flag entry string for mister_projects.flags[].
 */
export function buildGuardrailFlag(patterns: string[]): string {
  return `GUARDRAIL:${patterns.slice(0, 2).join('|')}:${new Date().toISOString()}`
}

export function buildInjectionFlag(): string {
  return `INJECTION:${new Date().toISOString()}`
}
