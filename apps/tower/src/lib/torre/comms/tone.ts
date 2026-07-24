// src/lib/torre/comms/tone.ts
// Mister Torre — redactor tone/audience model (Loop L2, Comunicar). PURE + unit-tested.
// The redactor's CHARACTER never changes; its register, default language, and salutations
// shift per audience (spec-torre: client in the client's language, supplier EN by default,
// internal/agent ES). This feeds both the draft_message defaults and the redactor prompt.
//
// It carries NO money and invents NO figures — tone only. Facts-from-state stays the
// redactor's law (profiles.ts); this just shapes HOW it speaks, not WHAT it claims.

export type Audience = 'client' | 'supplier' | 'agent'
export type CommLanguage = 'es' | 'en'

export interface ToneProfile {
  audience: Audience
  language: CommLanguage
  /** One-word register the prompt anchors on. */
  register: 'formal' | 'professional' | 'operational'
  greeting: string
  signoff: string
  /** A one-line instruction appended to the redactor prompt for this audience. */
  guidance: string
}

/** The language a channel defaults to when the caller doesn't pin one. */
export function defaultLanguage(audience: Audience, clientLanguage?: CommLanguage): CommLanguage {
  switch (audience) {
    case 'client':
      return clientLanguage ?? 'es' // the client's language (fallback ES)
    case 'supplier':
      return 'en' // supplier comms are EN by default
    case 'agent':
      return 'es' // internal is ES
  }
}

const GREETING: Record<Audience, Record<CommLanguage, string>> = {
  client: { es: 'Estimado/a', en: 'Dear' },
  supplier: { es: 'Estimados', en: 'Dear' },
  agent: { es: 'Hola', en: 'Hi' },
}
const SIGNOFF: Record<Audience, Record<CommLanguage, string>> = {
  client: { es: 'Saludos cordiales', en: 'Best regards' },
  supplier: { es: 'Saludos', en: 'Best regards' },
  agent: { es: 'Gracias', en: 'Thanks' },
}
const REGISTER: Record<Audience, ToneProfile['register']> = {
  client: 'formal',
  supplier: 'professional',
  agent: 'operational',
}
const GUIDANCE: Record<Audience, { es: string; en: string }> = {
  client: {
    es: 'Tono formal y cálido; claridad sobre términos y validez; sin jerga interna; nunca lenguaje de venta minorista.',
    en: 'Formal, warm tone; clear on terms and validity; no internal jargon; never retail sales language.',
  },
  supplier: {
    es: 'Tono profesional y directo; enfoca specs, cantidades e incoterms; conciso.',
    en: 'Professional, direct tone; focus on specs, quantities and incoterms; concise.',
  },
  agent: {
    es: 'Tono operativo y breve; solo lo accionable; sin preámbulos.',
    en: 'Operational, brief tone; actionable only; no preamble.',
  },
}

/**
 * PURE: the tone profile for an audience. `clientLanguage` only matters for `client`
 * (the client's own language); supplier/agent ignore it. An explicit `language` override
 * wins when provided (e.g. a client who prefers EN).
 */
export function toneProfile(audience: Audience, opts: { language?: CommLanguage; clientLanguage?: CommLanguage } = {}): ToneProfile {
  const language = opts.language ?? defaultLanguage(audience, opts.clientLanguage)
  return {
    audience,
    language,
    register: REGISTER[audience],
    greeting: GREETING[audience][language],
    signoff: SIGNOFF[audience][language],
    guidance: GUIDANCE[audience][language],
  }
}

// The default-language rule per audience, as a short phrase for the prompt block.
const LANGUAGE_RULE: Record<Audience, { es: string; en: string }> = {
  client: { es: 'en el idioma del cliente (ES por defecto)', en: "in the client's language (ES by default)" },
  supplier: { es: 'en inglés por defecto', en: 'in English by default' },
  agent: { es: 'en español (interno)', en: 'in Spanish (internal)' },
}
const AUDIENCE_LABEL: Record<Audience, { es: string; en: string }> = {
  client: { es: 'cliente', en: 'client' },
  supplier: { es: 'proveedor', en: 'supplier' },
  agent: { es: 'interno/agente', en: 'internal/agent' },
}

/**
 * PURE: the redactor's FULL tone contract for all three audiences, rendered as one prompt
 * block — the SINGLE source of truth the draft_message prompt embeds (no hand-copied,
 * drift-prone prose). Each line carries the audience's register, default language rule, and
 * the per-audience guidance (incl. the wholesale-only "never retail sales language" rule for
 * clients). `promptLang` picks the label/guidance language; the character never changes.
 */
export function toneGuidanceBlock(promptLang: CommLanguage = 'es'): string {
  const order: Audience[] = ['client', 'supplier', 'agent']
  const header =
    promptLang === 'es'
      ? 'TONO POR AUDIENCIA (el carácter no cambia; el registro y el idioma sí):'
      : 'TONE BY AUDIENCE (character never changes; register and language do):'
  const rows = order.map((a) => {
    const label = AUDIENCE_LABEL[a][promptLang]
    const rule = LANGUAGE_RULE[a][promptLang]
    return `· ${label} (${REGISTER[a]}, ${rule}): ${GUIDANCE[a][promptLang]}`
  })
  return [header, ...rows].join('\n')
}
