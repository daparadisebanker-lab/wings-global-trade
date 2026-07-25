// PURE WhatsApp-import logic: parse an exported chat .txt into a clean transcript,
// and parse the model's JSON back into a guarded client-profile draft. No SDK, no
// Supabase, no fetch — deterministic and unit-tested (whatsapp.test.ts). The
// server action (lib/actions/whatsapp-import.ts) does the Claude call between the
// two. Discipline mirrors the supplier-screenshot capability: the model only reads
// text into JSON; every field is guarded here, and nothing auto-commits.

import type { BuyerArchetype } from '@/lib/actions/clients-logic'

// Bidi/direction control marks WhatsApp sprinkles in — at line start (before the
// timestamp on media/call lines) and inside bodies. Stripped so both the header
// match and the cleaned body are noise-free.
const BIDI = /[‎‏‪-‮⁦-⁩]/g
const BIDI_LEAD = /^[‎‏‪-‮⁦-⁩]+/

// A new message starts with a timestamp header. iOS: "[15/07/26, 23:03:35] X: …"
// Android: "2/7/26, 14:30 - X: …". Anything else is a continuation of the previous.
const IOS = /^\[[^\]]+\]\s*([^:]+):\s?(.*)$/
const ANDROID =
  /^\d{1,2}[/.]\d{1,2}[/.]\d{2,4},?\s+\d{1,2}:\d{2}(?::\d{2})?(?:\s*[ap]\.?\s*m\.?)?\s*[-–]\s*([^:]+):\s?(.*)$/i

const SYSTEM_LINE =
  /end-to-end encrypted|cifrados de extremo a extremo|los mensajes y las llamadas|created group|añadió a|changed the subject|cambió el asunto|your security code|es un contacto|sin respuesta|llamada perdida|missed (?:voice|video) call/i
const MEDIA_LINE =
  /<media omitted>|<multimedia omitido>|imagen omitida|image omitted|video omitted|audio omitted|sticker omitted|gif omitted|documento omitido|<attached:|<adjunto:|\.(?:jpg|jpeg|png|opus|mp4|webp|pdf) \(file attached\)/i

const MAX_TRANSCRIPT = 14000

export interface WhatsappParse {
  /** Cleaned "Sender: body" transcript, capped for the model. */
  transcript: string
  /** Distinct sender labels, in first-seen order. */
  senders: string[]
  /** Sender labels that look like raw phone numbers (unsaved contacts). */
  phones: string[]
  messageCount: number
  /** True once there's a real exchange to read (≥2 messages). */
  hasContent: boolean
}

const isPhone = (s: string) => /^\+?[\d][\d\s()\-.]{5,}$/.test(s.trim())

/** PURE: an exported WhatsApp chat (.txt) → a clean transcript + participants. */
export function parseWhatsappExport(raw: string): WhatsappParse {
  const empty: WhatsappParse = { transcript: '', senders: [], phones: [], messageCount: 0, hasContent: false }
  if (typeof raw !== 'string' || !raw.trim()) return empty

  const messages: { sender: string; body: string }[] = []
  for (const rawLine of raw.split(/\r?\n/)) {
    // Strip a leading bidi mark so "‎[16/07/26 …]" still matches the header.
    const line = rawLine.replace(BIDI_LEAD, '')
    const m = IOS.exec(line) ?? ANDROID.exec(line)
    if (m) {
      const sender = m[1].replace(BIDI, '').trim()
      let body = (m[2] ?? '').replace(BIDI, '').trim()
      if (SYSTEM_LINE.test(body)) continue // drop encryption/contact/call notices
      if (MEDIA_LINE.test(body)) body = '[media]'
      messages.push({ sender, body })
    } else if (messages.length > 0 && line.trim()) {
      // Continuation of a multi-line message.
      messages[messages.length - 1].body += `\n${line.replace(BIDI, '').trim()}`
    }
  }

  const senders: string[] = []
  for (const msg of messages) if (!senders.includes(msg.sender)) senders.push(msg.sender)

  const transcript = messages
    .map((m) => `${m.sender}: ${m.body}`)
    .join('\n')
    .slice(0, MAX_TRANSCRIPT)

  return {
    transcript,
    senders,
    phones: senders.filter(isPhone),
    messageCount: messages.length,
    hasContent: messages.length >= 2 && transcript.length > 20,
  }
}

// ── Client-profile extraction (model text → guarded draft) ───────────────────

const ARCHETYPES: ReadonlySet<string> = new Set([
  'EQUIPMENT',
  'PROJECT',
  'COMMODITY',
  'PROGRAM',
  'CREDENTIAL',
  'ORIGIN',
  'ALLOCATION',
])

export interface ClientExtractDraft {
  name: string | null
  country: string | null
  city: string | null
  category: string | null
  archetype: BuyerArchetype | null
  demand: string | null
  currency: string | null
  contactName: string | null
  contactWhatsapp: string | null
  contactRole: string | null
  /** One-paragraph ES summary → the client's notes. */
  summary: string | null
  /** 0–1 model confidence, always surfaced to the reviewer (Directive 7). */
  confidence: number
  /** True when a usable profile was read — the render/save gate. */
  hasContent: boolean
}

function str(v: unknown): string | null {
  return typeof v === 'string' && v.trim().length > 0 ? v.trim() : null
}
function clamp01(raw: unknown): number {
  const n = typeof raw === 'string' ? Number(raw) : (raw as number)
  if (typeof n !== 'number' || !Number.isFinite(n)) return 0
  const unit = n > 1 && n <= 100 ? n / 100 : n
  return Math.min(1, Math.max(0, unit))
}
function currency(v: unknown): string | null {
  const s = str(v)
  return s && /^[A-Za-z]{3}$/.test(s) ? s.toUpperCase() : null
}

/**
 * PURE: model text → ClientExtractDraft (no SDK). Reused JSON extractor tolerates
 * ```json fences. Unknown fields stay null; a bad archetype drops to null rather
 * than corrupting the CHECK. `hasContent` gates whether the draft is worth
 * showing — a chat with no identifiable client yields a null draft, not a blank
 * form.
 */
export function parseClientExtract(raw: string, fallbackPhone?: string | null): ClientExtractDraft {
  const empty: ClientExtractDraft = {
    name: null,
    country: null,
    city: null,
    category: null,
    archetype: null,
    demand: null,
    currency: null,
    contactName: null,
    contactWhatsapp: fallbackPhone ?? null,
    contactRole: null,
    summary: null,
    confidence: 0,
    hasContent: false,
  }
  const obj = extractJsonObject(raw)
  if (!obj) return empty

  const archRaw = str(obj.archetype)?.toUpperCase() ?? null
  const draft: ClientExtractDraft = {
    name: str(obj.name),
    country: str(obj.country),
    city: str(obj.city),
    category: str(obj.category),
    archetype: archRaw && ARCHETYPES.has(archRaw) ? (archRaw as BuyerArchetype) : null,
    demand: str(obj.demand),
    currency: currency(obj.currency),
    contactName: str(obj.contactName),
    contactWhatsapp: str(obj.contactWhatsapp) ?? fallbackPhone ?? null,
    contactRole: str(obj.contactRole),
    summary: str(obj.summary),
    confidence: clamp01(obj.confidence),
    hasContent: false,
  }
  draft.hasContent = Boolean(
    draft.name || draft.demand || draft.category || draft.contactName || draft.contactWhatsapp,
  )
  return draft
}

/** Pull the first JSON object out of model text, tolerating ```json fences.
 *  (Local copy — keeps this module free of the AI layer so it stays pure.) */
function extractJsonObject(text: string): Record<string, unknown> | null {
  if (typeof text !== 'string') return null
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i)
  const body = fenced ? fenced[1] : text
  const start = body.indexOf('{')
  const end = body.lastIndexOf('}')
  if (start === -1 || end === -1 || end < start) return null
  try {
    const parsed = JSON.parse(body.slice(start, end + 1))
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : null
  } catch {
    return null
  }
}
