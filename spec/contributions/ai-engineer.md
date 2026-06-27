# Mister AI Engineer Specification

**Author:** AI Engineer  
**Date:** 2026-06-27  
**Model:** claude-sonnet-4-6  
**Source authority:** MISTER_MASTER_BRIEF.md D3 + D7 + existing codebase audit  
**Status:** Implementation-ready — builder reads this before touching any AI code

---

## 0. Codebase reality vs brief

The existing code (`src/app/api/mister/chat/route.ts`, `src/types/mister.ts`) implements the **old Accio Engine TPR flow**. It is entirely replaced. Specifically:

- `tpr_update` / `delta` / `done` SSE event types → replaced by `token` / `surface` / `actions` / `state` / `done` / `error`
- `tprState` / `TprState` / `TprFieldKey` → replaced by `MisterContext` / `MisterCollected` / `MisterArchetype`
- `buildMisterSystemBlocks(tprState)` → replaced by the two-block prompt caching shape
- `accio_projects` table → coexists unchanged; new `mister_projects` table added alongside it
- `src/lib/mister-knowledge.ts` static catalog text → continues to exist and can be included in the static system prompt block (it is domain knowledge, not dynamic context)
- The mock stream (offline mode) → preserve the pattern but adapt to new event types

The `leads` table and notification flow are unchanged. A Mister session that escalates to human contact still creates a `leads` row — the `flow` enum needs a new value `'mister'`.

---

## 1. Gap Analysis

What D3 and D7 leave unspecified that a builder needs before writing a line of code.

### G1 — `mister_projects` DDL

D7 mentions the table in the checklist and lists columns in prose. No DDL, no types, no indexes, no RLS policies. Fully specified in §8.

### G2 — Content tables (contacts, documents, MOQ)

D7.4 defines the tool function signatures but not the Supabase tables they read. `fetchContact` needs a `mister_contacts` table. `fetchDocument` needs a `mister_documents` table. MOQ data lives embedded in `products.specs` jsonb — no separate table needed. Full DDL in §8.

### G3 — Tool execution model: reactive vs pre-loaded

D7.4 says "all tools run server-side, results injected into context.backend" but also defines them as `async function fetchProduct(...)` implying they are Anthropic tool_use blocks. These two descriptions resolve differently. The implementation decision is specified in §2.

### G4 — Quick actions fence extraction from live stream

D3 mandates a fenced `` ```quick_actions `` block at the end of every response. D7 does not specify how the server extracts it without either (a) buffering the entire response before streaming tokens to the client, or (b) using a stateful buffer mid-stream. The exact algorithm is specified in §3.

### G5 — History trim: what constitutes a "turn"

D7 says "last 15 turns" and "older turns are summarized into a compact collected context." It does not define whether a "turn" is a user+assistant pair (2 messages) or a single message. The word "summarized" implies a second model call which would be expensive. The exact algorithm and what "summarized" means mechanically are specified in §4.

### G6 — Stage transition logic

D7 defines `MisterStage` as an enum and says "use stage to decide how hard to push toward a next step." It does not specify when the server transitions stage from `induction` → `discovery` → `consideration` → `pre_qualification` → `support`, nor who is responsible (model vs server inference). Specified in §4.

### G7 — Guardrail scan: stream-then-replace flow

D7.6 gives regex patterns but does not specify whether the scan happens (a) on a buffered full response before streaming, (b) in real-time on tokens, or (c) after streaming completes. The "regenerate once with corrective instruction" adds an Anthropic API call — the cost and latency implications are unaddressed. The practical flow is specified in §5.

### G8 — Prompt caching: exact SDK call shape

D3 shows the TypeScript pattern but does not note that `cache_control` on a `system` block requires `@anthropic-ai/sdk` ≥ 0.24.0 and that the `system` field must be an array of content blocks (not a string). The existing code passes `system` as a string (via `buildMisterSystemBlocks`). The exact call shape is specified in §6.

### G9 — SSE wire format: named events vs flat JSON

D7 shows named SSE events (`event: token\ndata: {...}`) but the existing implementation uses flat JSON discriminated by `type` (`data: {"type":"delta",...}`). With `fetch` + `ReadableStream` (not `EventSource`), both work — but the client parser must match the server format. The exact wire format and client parsing pattern are specified in §3.

### G10 — `surface` event: when emitted and payload shapes

D7 lists `surface` as an SSE event type with `{"type":"product","payload":{...}}` but does not specify when it fires relative to tokens, what the payload looks like for each surface type, or whether multiple surfaces can fire in one turn. Specified in §3.

### G11 — Rate limiting: Redis dependency, fallback, burst guard implementation

D7.5 mentions Upstash Redis but the existing `.env.local.example` has no Redis variables. The burst guard (max 1 in-flight per session) is mentioned but not implemented. Fail-open vs fail-closed on Redis unavailability is unspecified. Full implementation pattern in §7.

### G12 — Session lifecycle: row creation and relation to `leads`

When does `mister_projects` row get created — on first message or when the client generates a session ID? What is the handoff to `leads` (which table links them)? The `leads.flow` enum needs a `'mister'` value. Specified in §8.

### G13 — `prefillToken` for quotation form

`triggerQuotationForm` returns `{ formUrl, prefillToken }`. The token needs a TTL, a storage table, and a validation endpoint so the form page can retrieve pre-filled data. Specified in §8.

---

## 2. Tool Execution Model

### Decision: pre-loaded context, not reactive Anthropic tool_use

Do not use Anthropic tool_use blocks for the D7.4 tools. Use them as plain server-side async functions called during context assembly, before the model API call. Reasons:

1. Tool_use interrupts the streaming flow: the model emits a `tool_use` block, the stream pauses, the server dispatches the tool and calls the API again. This doubles latency per turn on tool-heavy turns and requires stateful multi-call management.
2. The D7 system prompt says the context block arrives with `backend: { product, comparison, moq, logistics_docs, contacts }` pre-populated. The model is designed to read from injected context, not discover via tool calls.
3. D7.4 says "no fetchPrice, getLeadTime, fetchStock, getAvailability tool may exist" — this is framed as a schema-level prohibition. Keeping NO tools in the Anthropic tool schema achieves the same goal more simply.
4. All tool outputs are deterministic lookups (Supabase queries) — there is no benefit to letting the model decide what to fetch mid-stream; the server can make that decision based on session state.

### What each tool does at context assembly time

```
fetchProduct(currentProductId)
  → fires when: request.currentProductId is non-null
  → query: SELECT id, slug, name_es, description_es, specs, images, models, trade_intelligence
            FROM products WHERE id = $1 AND is_active = true
  → result shape: { id, name, category, summary, specs, imageUrl?, moqRef? }
  → injects into: context.backend.product

preloadComparison(session.collected.productInterest[])
  → fires when: session.collected.productInterest has ≥ 2 entries
  → query: SELECT id, name_es, specs FROM products WHERE id = ANY($1) AND is_active = true
  → result shape: { products: [{id, name, specs}], axes: string[] }
  → axes = union of all spec keys across the products, filtered to ≤ 8 most discriminating
  → injects into: context.backend.comparison

fetchDocument(session.collected.destinationCountry, currentProductCategory)
  → fires when: collected.destinationCountry is set
  → query: SELECT title, public_url, is_available FROM mister_documents
            WHERE country_code = $1 AND (product_type = $2 OR product_type = 'ALL')
            ORDER BY is_available DESC LIMIT 5
  → injects into: context.backend.logistics_docs (array or null if none available)

fetchContact(session.archetype, inferredCategory)
  → fires when: session.stage is 'pre_qualification' or 'support'
  → inferredCategory logic:
      lead_buyer          → 'sales'
      project_manager     → 'project'
      logistics_manager   → 'logistics'
      reseller            → 'partnerships'
      wholesale_partner   → 'key_accounts'
      unresolved          → 'sales'
  → query: SELECT name, role, whatsapp, email FROM mister_contacts
            WHERE $1 = ANY(archetypes) AND category = $2 AND is_active = true
            ORDER BY sort_order LIMIT 1
  → fallback: { name: 'Wings Global Trade', role: 'Operaciones', whatsapp: process.env.MISTER_OPS_WHATSAPP }
  → injects into: context.backend.contacts

triggerQuotationForm(prefilled)
  → not called during stream context assembly
  → called as a SEPARATE endpoint: POST /api/mister/quote
  → stores prefill data in mister_quote_tokens table with 24h TTL
  → returns { formUrl: '/cotizar?token={token}', prefillToken: '{uuid}' }
  → the /cotizar page reads the token and pre-fills the existing inquiry form
```

### Event sequence for a full turn (no tool result needed at model time)

```
1.  POST /api/mister/chat received
2.  Validate session: check mister_projects.in_flight = false (burst guard)
3.  SET mister_projects.in_flight = true (atomic update)
4.  Load mister_projects row (session state, history, archetype, stage, collected)
5.  Run context assembly (fetchProduct, fetchDocument, fetchContact in parallel)
6.  trimHistory(history, 15) → trimmedMessages
7.  renderContextBlock(session + assembledContext) → dynamic context string
8.  Open SSE stream to client (headers: text/event-stream)
9.  Emit pre-loaded surface events to client (for each non-null backend field, emit surface SSE)
10. Call Anthropic messages.stream() with static cached block + dynamic block + trimmed history
11. For each text delta:
      a. Append to accumulator string
      b. Run quick_actions fence detector on accumulator
      c. If in fence: do not emit token SSE
      d. If safe text available: emit token SSE
12. On message_stop:
      a. Run guardrail scan on full accumulated text
      b. If violation: emit error SSE { code: 'CONTENT_REPLACED', fallback: ROUTING_MESSAGE }
                       log violation to mister_projects.flags[]
      c. If clean: parse quick_actions from accumulated text, emit actions SSE
13. Infer new stage from updated collected data
14. Emit state SSE { archetype, stage }
15. Emit done SSE { messageId: uuid }
16. Persist to DB: new message appended to history, collected updated, turn_count++, in_flight = false
17. Close stream
```

### Event sequence for multi-tool turns (future)

If tool_use blocks are ever added to the schema (e.g., for a web-search capability), the server must handle the Anthropic agentic loop: stream call → pause on tool_use → execute → inject tool_result → stream call resume. That flow is out of scope for v1 Mister but the route must be designed so adding it does not require a rewrite of the SSE emission logic.

---

## 3. SSE Format and Client Consumption

### Wire format

The server uses `fetch` + `ReadableStream`, not `EventSource`. Named SSE events (`event:` + `data:` lines) are used. The client parses the raw stream with a custom reader.

```
event: surface\ndata: {"type":"product","payload":{...}}\n\n
event: token\ndata: {"delta":"On a 40'HC out of Iquique"}\n\n
event: token\ndata: {"delta":" into Peru, your usable volume"}\n\n
...
event: actions\ndata: {"quickActions":[{"label":"...","action":"..."},...]}\n\n
event: state\ndata: {"archetype":"logistics_manager","stage":"consideration"}\n\n
event: done\ndata: {"messageId":"018f..."}\n\n
```

Error events:
```
event: error\ndata: {"code":"AI_UNAVAILABLE","message":"Mister no está disponible..."}\n\n
event: error\ndata: {"code":"CONTENT_REPLACED","fallback":"Para precios específicos..."}\n\n
event: error\ndata: {"code":"SESSION_LIMIT","message":"..."}\n\n
```

### SSE encoder helper

```ts
function sseEvent(name: string, payload: unknown): Uint8Array {
  return new TextEncoder().encode(
    `event: ${name}\ndata: ${JSON.stringify(payload)}\n\n`
  );
}
```

### Surface event payload shapes

```ts
// event: surface
type SurfaceEvent =
  | { type: 'product'; payload: ProductSurface }
  | { type: 'comparison'; payload: ComparisonSurface }
  | { type: 'moq'; payload: MoqSurface }
  | { type: 'document'; payload: DocumentSurface }
  | { type: 'contact'; payload: ContactSurface }
  | { type: 'waterfall'; payload: WaterfallSurface }

interface ProductSurface {
  id: string; name: string; category: string;
  summary: string; specs: Record<string, string>;
  imageUrl?: string; slug: string;
}
interface ComparisonSurface {
  products: { id: string; name: string; specs: Record<string, string> }[];
  axes: string[];
}
interface MoqSurface {
  category: string;
  tiers: { minQty: number; description: string }[];
}
interface DocumentSurface {
  available: boolean; title?: string; url?: string;
  country: string; productType: string;
}
interface ContactSurface {
  name: string; role: string; whatsapp: string; email?: string;
}
interface WaterfallSurface {
  segments: WaterfallSegment[]; // from Deliverable 4
}
```

Multiple surface events may fire in a single turn. They are emitted before the first `token` event so the UI can render cards before text arrives.

### Quick actions fence extraction algorithm

The model appends exactly this at the end of every response (per D3 mandate):
````
```quick_actions
[{"label":"...","action":"..."},{"label":"...","action":"..."},{"label":"...","action":"..."}]
```
````

The fence detector operates on the accumulating full-text buffer. It is NOT a streaming token-by-token state machine because the fence header `` ```quick_actions `` can span multiple chunks. Instead:

```ts
const FENCE_OPEN = '```quick_actions';
const FENCE_CLOSE = '```';

interface StreamState {
  accumulator: string;    // full text so far
  fenceStart: number;     // index where fence opens, -1 if not found yet
  safeUpto: number;       // index up to which tokens have been emitted
}

function processChunk(state: StreamState, chunk: string): {
  tokenToEmit: string | null;
  state: StreamState;
} {
  const acc = state.accumulator + chunk;
  const fenceIdx = acc.indexOf(FENCE_OPEN);

  if (fenceIdx === -1) {
    // No fence started yet — emit everything new up to current length
    const tokenToEmit = acc.slice(state.safeUpto);
    return {
      tokenToEmit: tokenToEmit || null,
      state: { ...state, accumulator: acc, safeUpto: acc.length }
    };
  }

  // Fence found: emit text before fence start (only newly safe portion)
  const newSafeUpto = Math.min(fenceIdx, acc.length);
  const tokenToEmit = newSafeUpto > state.safeUpto
    ? acc.slice(state.safeUpto, newSafeUpto)
    : null;

  return {
    tokenToEmit,
    state: { ...state, accumulator: acc, fenceStart: fenceIdx, safeUpto: newSafeUpto }
  };
}

function extractActionsFromFull(fullText: string): {
  cleanText: string;
  actions: MisterQuickAction[] | null;
} {
  const openIdx = fullText.indexOf(FENCE_OPEN);
  if (openIdx === -1) return { cleanText: fullText.trimEnd(), actions: null };

  const bodyStart = fullText.indexOf('\n', openIdx) + 1;
  const closeIdx = fullText.indexOf(FENCE_CLOSE, bodyStart);
  if (closeIdx === -1) return { cleanText: fullText.slice(0, openIdx).trimEnd(), actions: null };

  const jsonBody = fullText.slice(bodyStart, closeIdx).trim();
  let actions: MisterQuickAction[] | null = null;
  try {
    const parsed = JSON.parse(jsonBody);
    if (Array.isArray(parsed) && parsed.length === 3) {
      actions = parsed as MisterQuickAction[];
    }
  } catch {
    // malformed — skip actions, log to console
    console.warn('[mister] malformed quick_actions JSON:', jsonBody.slice(0, 120));
  }

  return {
    cleanText: fullText.slice(0, openIdx).trimEnd(),
    actions
  };
}
```

On `message_stop`, call `extractActionsFromFull(accumulator)` to get the final clean text and actions. Actions validation: confirm each action has a valid `action` field matching `MisterActionId`. If 0 or >3 actions returned, use an archetype-appropriate fallback set (hardcoded per archetype in `src/lib/mister/fallback-actions.ts`).

### Client consumption pattern (`useMisterStream.ts`)

```ts
// Pseudocode — not the full hook
const reader = response.body!.getReader();
const decoder = new TextDecoder();
let buffer = '';

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  buffer += decoder.decode(value, { stream: true });

  // Split on double newline (SSE event separator)
  const events = buffer.split('\n\n');
  buffer = events.pop() ?? '';  // last (possibly incomplete) chunk stays buffered

  for (const rawEvent of events) {
    if (!rawEvent.trim()) continue;
    const lines = rawEvent.split('\n');
    const eventName = lines.find(l => l.startsWith('event:'))?.slice(7).trim();
    const dataLine = lines.find(l => l.startsWith('data:'))?.slice(5).trim();
    if (!dataLine) continue;

    const payload = JSON.parse(dataLine);

    switch (eventName) {
      case 'token':    appendStreamingText(payload.delta); break;
      case 'surface':  addSurface(payload); break;
      case 'actions':  setQuickActions(payload.quickActions); break;
      case 'state':    updateSession(payload.archetype, payload.stage); break;
      case 'done':     finalizeMessage(payload.messageId); break;
      case 'error':
        if (payload.code === 'CONTENT_REPLACED') replaceLastMessage(payload.fallback);
        else showErrorBanner(payload.message);
        break;
    }
  }
}
```

Abort controller: attach an `AbortController` to the fetch. On new user message while one is in-flight, call `controller.abort()` and start a new request. The server detects abort via `request.signal.aborted`.

---

## 4. Context Assembly and History Management

### `buildMisterContext()` function signature

```ts
// src/lib/mister/context.ts
export async function buildMisterContext(
  session: MisterProjectRow,
  request: { currentPage: string | null; currentProductId: string | null },
  supabase: SupabaseClient
): Promise<{ contextString: string; surfaces: SurfaceEvent[] }>
```

### Exact query pattern

```ts
async function buildMisterContext(...) {
  const [productResult, documentResult, contactResult] = await Promise.allSettled([
    // product: only if on a product page
    request.currentProductId
      ? fetchProduct(request.currentProductId, supabase)
      : Promise.resolve(null),

    // docs: only if destination country is known
    session.collected.destinationCountry
      ? fetchDocument(
          session.collected.destinationCountry,
          inferProductType(session),
          supabase
        )
      : Promise.resolve(null),

    // contact: only if stage is pre_qualification or support
    (session.stage === 'pre_qualification' || session.stage === 'support')
      ? fetchContact(session.archetype, supabase)
      : Promise.resolve(null),
  ]);

  // comparison: only if ≥2 products in productInterest
  let comparisonResult = null;
  const interests = session.collected.productInterest ?? [];
  if (interests.length >= 2) {
    comparisonResult = await preloadComparison(interests, supabase).catch(() => null);
  }

  const backend = {
    product: productResult.status === 'fulfilled' ? productResult.value : null,
    comparison: comparisonResult,
    moq: null,  // embedded in products.specs; rendered by product surface
    logistics_docs: documentResult.status === 'fulfilled' ? documentResult.value : null,
    contacts: contactResult.status === 'fulfilled' ? contactResult.value : null,
  };

  // Build surfaces to emit before tokens
  const surfaces: SurfaceEvent[] = [];
  if (backend.product) surfaces.push({ type: 'product', payload: toProductSurface(backend.product) });
  if (backend.comparison) surfaces.push({ type: 'comparison', payload: backend.comparison });
  if (backend.contacts) surfaces.push({ type: 'contact', payload: backend.contacts });
  if (backend.logistics_docs?.available) surfaces.push({ type: 'document', payload: backend.logistics_docs });

  const contextString = renderContextBlock({
    session,
    currentPage: request.currentPage,
    currentProductId: request.currentProductId,
    backend,
    opsWhatsapp: process.env.MISTER_OPS_WHATSAPP ?? '+50760250735',
  });

  return { contextString, surfaces };
}
```

### `renderContextBlock()` function

```ts
function renderContextBlock(params: {
  session: MisterProjectRow;
  currentPage: string | null;
  currentProductId: string | null;
  backend: BackendContext;
  opsWhatsapp: string;
}): string {
  const { session, currentPage, currentProductId, backend, opsWhatsapp } = params;

  const productLine = backend.product
    ? JSON.stringify({
        id: backend.product.id,
        name: backend.product.name,
        summary: backend.product.summary,
        specs: backend.product.specs,
      })
    : 'null';

  const comparisonLine = backend.comparison
    ? JSON.stringify(backend.comparison)
    : 'null';

  const moqLine = backend.product?.moqRef ?? 'null';

  const logisticsLine = backend.logistics_docs
    ? JSON.stringify(backend.logistics_docs)
    : 'null';

  const contactsLine = backend.contacts
    ? JSON.stringify(backend.contacts)
    : 'null';

  return `<<MISTER_CONTEXT>>
archetype: ${session.archetype}
stage: ${session.stage}
locale: ${session.locale}
current_page: ${currentPage ?? 'null'}
current_product: ${productLine}
collected: ${JSON.stringify(session.collected)}
backend:
  product: ${productLine}
  comparison: ${comparisonLine}
  moq: ${moqLine}
  logistics_docs: ${logisticsLine}
  contacts: ${contactsLine}
ops_whatsapp: ${opsWhatsapp}
<<END_CONTEXT>>`;
}
```

The rendered block is the second element of the `system` array (no `cache_control` — always fresh).

### History trim algorithm

A "turn" = 1 user message + 1 assistant message = 2 adjacent messages in the array. 15 turns = 30 messages maximum sent to the model.

```ts
// src/lib/mister/history.ts
export function trimHistory(
  messages: { role: 'user' | 'assistant'; content: string }[],
  maxTurns: number = 15
): {
  trimmed: { role: 'user' | 'assistant'; content: string }[];
  droppedTurns: number;
} {
  const maxMessages = maxTurns * 2;
  if (messages.length <= maxMessages) {
    return { trimmed: messages, droppedTurns: 0 };
  }

  const excess = messages.length - maxMessages;
  // Always drop full turns (pairs). If excess is odd, drop one extra message.
  const dropCount = excess % 2 === 0 ? excess : excess + 1;

  // Ensure first remaining message is a user message
  let sliceFrom = dropCount;
  while (sliceFrom < messages.length && messages[sliceFrom].role !== 'user') {
    sliceFrom++;
  }

  return {
    trimmed: messages.slice(sliceFrom),
    droppedTurns: Math.ceil(sliceFrom / 2),
  };
}
```

What "summarized into collected" means: it does NOT mean a separate summarization API call. It means the `collected` jsonb field on `mister_projects` is updated every turn as new data is extracted from the conversation (destination country, Incoterm, product interest, etc.). When old turns are dropped from the messages array, their captured data is already persisted in `collected`. The context block always injects the latest `collected` state, so the model retains structured knowledge of what was discussed even as raw transcript ages out.

### Stage transition inference (server-side, no model cooperation needed)

```ts
function inferStage(
  archetype: MisterArchetype,
  collected: MisterCollected,
  currentStage: MisterStage
): MisterStage {
  // Never regress
  const order: MisterStage[] = ['induction','discovery','consideration','pre_qualification','support'];
  const current = order.indexOf(currentStage);

  if (archetype === 'unresolved') return 'induction';

  // Resolved archetype → at least discovery
  let inferred = Math.max(current, 1);  // index 1 = discovery

  // 3+ collected fields signals consideration
  const filledFields = Object.values(collected).filter(v => v !== undefined && v !== null).length;
  if (filledFields >= 3) inferred = Math.max(inferred, 2);  // consideration

  // Has destination + (timeline or RUC) → pre_qualification
  if (collected.destinationCountry && (collected.timeline || collected.ruc)) {
    inferred = Math.max(inferred, 3);  // pre_qualification
  }

  // Support is only entered by escalation events (quotation form trigger, contact fetch)
  // Do not auto-advance to support — it is set explicitly when those events fire

  return order[inferred];
}
```

### Collected field extraction

The model does not embed JSON extraction markers (the old Accio pattern). Instead, the server scans the assistant response for structured data using a lightweight NLP approach: the model is prompted (in the static system prompt) to use specific phrases that are easy to parse. Example: "I've noted your destination: **Peru**" → server scans for bolded named entities in specific contexts.

Alternatively (simpler): at the end of every request, make a lightweight claude-haiku-4-5 classification call with a compact prompt:

```ts
// After the main stream completes, async (non-blocking)
async function extractCollected(
  assistantResponse: string,
  userMessage: string,
  currentCollected: MisterCollected
): Promise<Partial<MisterCollected>> {
  // Uses claude-haiku-4-5 (fast, cheap) for structured extraction
  const result = await haiku.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 256,
    system: `Extract trade data from conversation. Return JSON only. Fields: destinationCountry (string), destinationCity (string), incoterm (EXW|FOB|CFR|CIF|DAP|DDP), containerType (20GP|40GP|40HC|reefer|LCL), volume (string), ruc (string), timeline (string), productInterest (string[]). Return only fields that can be confidently extracted. If nothing new, return {}.`,
    messages: [{ role: 'user', content: `User said: "${userMessage}"\nMister replied: "${assistantResponse.slice(0, 800)}"` }]
  });
  try {
    return JSON.parse((result.content[0] as { text: string }).text);
  } catch { return {}; }
}
```

This extraction call happens AFTER the stream closes (fire-and-forget). Its result is written to `mister_projects.collected` via a follow-up Supabase update. On the next turn, the updated `collected` is in the context block.

This approach is clean, cheap (~50 tokens in/out), and does not block the user-facing stream.

---

## 5. Guardrail Scan

### Decision: stream-then-replace

Buffer the full response server-side while streaming tokens to the client. After `message_stop`, run the guardrail scan. If a violation is detected:

1. Emit `error` SSE with `code: 'CONTENT_REPLACED'` and `fallback: ROUTING_MESSAGE`
2. The client receives both the streamed (violating) text AND the error event
3. Client handler: on `CONTENT_REPLACED`, replace the content of the last assistant message bubble with `fallback`
4. Log violation: append to `mister_projects.flags[]`

No regeneration call. Regeneration (extra Anthropic API call) is not worth the latency and cost for a guardrail edge case. The routing message is the correct response anyway.

### Routing message constants

```ts
// src/lib/mister/guardrails.ts
export const ROUTING_MESSAGE_ES = `Para precios específicos, necesito pasarte a nuestro equipo de ventas — ellos preparan la cotización formal con los números reales para tu pedido. ¿Prefieres continuar por WhatsApp o abrir el formulario de cotización ahora?`;

export const ROUTING_MESSAGE_EN = `For specific pricing I need to route you to our sales team — they prepare the formal quotation with real figures for your order. Would you prefer to continue on WhatsApp or open the quotation form now?`;
```

Use the session locale to pick the appropriate constant.

### Regex patterns (exhaustive, EN + ES)

```ts
export const PRICE_GUARDRAIL_PATTERNS: RegExp[] = [
  // Currency symbols followed by digits
  /\b(US?\$|S\/\.?|USD|PEN|EUR|€|\$)\s*\d[\d,.]*/i,
  // Digits followed by currency words
  /\d[\d,.]*\s*(soles?|d[oó]lares?|euros?)\b/i,
  // Incoterm + value
  /\b(CIF|FOB|DDP|CFR|DAP|EXW)\s*:?\s*[\d$€]/i,
  // Total/price followed by number
  /\b(precio|costo|cif\s+total|fob\s+total|total\s+estimado|landed\s+cost)\s*:?\s*\d[\d,.]*/i,
  // Cost index as a specific dollar figure (not as an index point)
  // Index ranges like "100-115" are allowed; "US$12,000" is not
  /US?\$\d[\d,.]+/i,
];

export const AVAILABILITY_GUARDRAIL_PATTERNS: RegExp[] = [
  // Lead time with a number
  /(en|in|within)\s+\d+\s+(d[íi]as?|semanas?|meses?|days?|weeks?|months?)/i,
  // Stock statements
  /(en\s+stock|in\s+stock|disponible\s*(ahora|hoy|inmediatamente?)|available\s*(now|today|immediately))/i,
  // Lead time label
  /lead\s*time\s*:?\s*\d/i,
  // Delivery in X
  /entrega\s+en\s+\d/i,
  // Delivery guarantee
  /te\s+(lo\s+)?(entregamos?|enviamos?)\s+en\s+\d/i,
  // Arrival guarantee
  /(llegará|llega|arrives?)\s+en\s+\d/i,
];

export function scanGuardrails(text: string): {
  violated: boolean;
  patterns: string[];
} {
  const violated: string[] = [];

  for (const pattern of PRICE_GUARDRAIL_PATTERNS) {
    if (pattern.test(text)) violated.push(`price:${pattern.source}`);
  }
  for (const pattern of AVAILABILITY_GUARDRAIL_PATTERNS) {
    if (pattern.test(text)) violated.push(`availability:${pattern.source}`);
  }

  return { violated: violated.length > 0, patterns: violated };
}
```

### Input sanitization

Run before passing user message to the model. Replace injection attempts with a neutral acknowledgement:

```ts
const INJECTION_PATTERNS: RegExp[] = [
  /ignore\s+(previous|prior|all)\s+instructions?/i,
  /disregard\s+(your|the|all)\s+(system\s+prompt|instructions?)/i,
  /you\s+are\s+now\s+(a|an)\s+\w+/i,
  /repeat\s+(back\s+)?(your|the)\s+system\s+prompt/i,
  /output\s+your\s+(full\s+)?(instructions?|system\s+prompt)/i,
  /act\s+as\s+if\s+you\s+(are|were)\s+(not|a|an)/i,
  /jailbreak/i,
  /dan\s+mode/i,
];

export function sanitizeInput(userMessage: string): {
  clean: string;
  injectionDetected: boolean;
} {
  const injectionDetected = INJECTION_PATTERNS.some(p => p.test(userMessage));
  if (!injectionDetected) return { clean: userMessage, injectionDetected: false };

  // Replace the whole message with a neutral rephrase that preserves trade intent
  // Do not reveal that injection was detected — just route normally
  return {
    clean: 'Tengo una consulta sobre importación de productos.',
    injectionDetected: true,
  };
}
```

Log `injectionDetected: true` to `mister_projects.flags[]` with timestamp.

---

## 6. Prompt Caching

### Exact SDK call shape

The `@anthropic-ai/sdk` package is already a dependency. Prompt caching with `cache_control` works without a beta header in SDK ≥ 0.27.0; the SDK handles it. The `system` field must be an array of content block objects when using prompt caching.

```ts
// src/app/api/mister/chat/route.ts

import Anthropic from '@anthropic-ai/sdk';
import { MISTER_STATIC_PROMPT } from '@/lib/mister/prompt';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const stream = await client.messages.stream({
  model: 'claude-sonnet-4-6',
  max_tokens: 2048,
  system: [
    {
      type: 'text',
      text: MISTER_STATIC_PROMPT,
      // cache_control marks this block for prompt caching (5-min TTL on Anthropic infra)
      // The block must be ≥1024 tokens to qualify for caching
      cache_control: { type: 'ephemeral' },
    },
    {
      type: 'text',
      // Per-turn dynamic block: always fresh, never cached
      text: contextString,  // from renderContextBlock()
    },
  ],
  messages: trimmedMessages,
});
```

### Static prompt composition

The static block (`MISTER_STATIC_PROMPT`) combines:
1. The verbatim system prompt from D3 (~1,500 tokens)
2. The `WINGS_CATALOG_TEXT` from `mister-knowledge.ts` (~800 tokens)
3. The `WINGS_PROCESS_TEXT` from `mister-knowledge.ts` (~250 tokens)
4. The `WINGS_FAQ_TEXT` from `mister-knowledge.ts` (~400 tokens)
5. The `CATALOG_BEHAVIOR_TEXT` from `mister-knowledge.ts` (~350 tokens)

Total estimated: ~3,300 tokens. This comfortably exceeds the 1,024-token minimum for caching eligibility. The cache saves these tokens on every turn after the first.

```ts
// src/lib/mister/prompt.ts
import {
  WINGS_CATALOG_TEXT,
  WINGS_PROCESS_TEXT,
  WINGS_FAQ_TEXT,
  CATALOG_BEHAVIOR_TEXT,
} from '@/lib/mister-knowledge';

export const MISTER_STATIC_PROMPT = `${D3_SYSTEM_PROMPT}

${WINGS_CATALOG_TEXT}

${WINGS_PROCESS_TEXT}

${WINGS_FAQ_TEXT}

${CATALOG_BEHAVIOR_TEXT}`;
```

### Cache miss behavior

On cache miss (first turn, or after 5-minute TTL expiry), the full ~3,300 tokens are billed at standard input-token rate. On cache hit, only the cache read cost applies (~10% of standard rate). At typical conversational cadence (messages within 2 minutes of each other), cache hit rate is ~95%.

### max_tokens budget

Old code: `max_tokens: 1024`. New Mister responses include the quick_actions block (~120 tokens) plus more detailed multi-section responses (ANSWER + SURFACE + NEXT STEP). Budget: `max_tokens: 2048`. This is sufficient for all archetype responses including logistics_manager technical depth.

---

## 7. Rate Limiting

### Dependency

Add `@upstash/ratelimit` and `@upstash/redis` to `pnpm` dependencies. Add env vars:

```
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

If these are absent, the rate limiter fails open (logs a warning, proceeds).

### Implementation

```ts
// src/lib/mister/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

function createLimiter() {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null;  // fail open
  }
  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
  return {
    perMinute: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(20, '1 m'),
      prefix: 'mister:rl:ip:min',
    }),
    perHour: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(300, '1 h'),
      prefix: 'mister:rl:ip:hr',
    }),
  };
}

let limiterCache: ReturnType<typeof createLimiter> | undefined;
function getLimiter() {
  if (limiterCache === undefined) limiterCache = createLimiter();
  return limiterCache;
}

export async function checkRateLimit(ip: string): Promise<{
  allowed: boolean;
  retryAfterMs?: number;
}> {
  const limiter = getLimiter();
  if (!limiter) return { allowed: true };  // fail open

  try {
    const [min, hr] = await Promise.all([
      limiter.perMinute.limit(ip),
      limiter.perHour.limit(ip),
    ]);
    if (!min.success) return { allowed: false, retryAfterMs: min.reset - Date.now() };
    if (!hr.success) return { allowed: false, retryAfterMs: hr.reset - Date.now() };
    return { allowed: true };
  } catch (err) {
    console.warn('[mister/rate-limit] Redis error — failing open:', err);
    return { allowed: true };
  }
}
```

### Burst guard (in-flight)

The `mister_projects.in_flight` boolean column acts as a per-session mutex. On request start:

```ts
// Atomic check-and-set using Supabase update with a condition
const { data, error } = await supabase
  .from('mister_projects')
  .update({ in_flight: true })
  .eq('session_id', sessionId)
  .eq('in_flight', false)  // only succeed if not already in flight
  .select('id')
  .single();

if (!data) {
  return new Response(
    JSON.stringify({ error: 'Mister ya está procesando tu pregunta.', code: 'CONCURRENT_REQUEST' }),
    { status: 409 }
  );
}
```

On stream completion (success or error), always clear `in_flight`:
```ts
await supabase
  .from('mister_projects')
  .update({ in_flight: false })
  .eq('session_id', sessionId);
```

Put this in a `try/finally` block so it always runs.

### Abuse rate tightening

When `mister_projects.flags[]` grows to ≥ 3 entries (injection attempts + guardrail violations), write a `'TIGHTENED'` flag and halve the per-IP limits for that IP (keyed separately in Redis as `mister:rl:ip:tight:{ip}`). The implementation is a simple check before the standard rate limit call.

### Turn limit

```ts
if (session.turn_count >= 40) {
  // Emit SESSION_LIMIT error SSE and return
}
if (session.turn_count >= 30) {
  // Inject a soft warning into the context block:
  // "SYSTEM NOTE: This session is approaching its limit. Begin routing to human contact."
}
```

---

## 8. Supabase Schema

### Migration file name

`supabase/migrations/20260627000001_mister_system.sql`

### DDL

```sql
-- ============================================================
-- Mister AI Trade Intelligence System
-- Migration: 20260627000001_mister_system.sql
-- ============================================================

-- Enums
DO $$ BEGIN
  CREATE TYPE mister_archetype AS ENUM (
    'lead_buyer', 'project_manager', 'logistics_manager',
    'reseller', 'wholesale_partner', 'unresolved'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE mister_stage AS ENUM (
    'induction', 'discovery', 'consideration', 'pre_qualification', 'support'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE mister_locale AS ENUM ('es-PE', 'en', 'nl', 'de');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Extend lead_flow enum to include 'mister'
-- (Postgres enums cannot be modified in a transaction; use a workaround)
ALTER TYPE lead_flow ADD VALUE IF NOT EXISTS 'mister';

-- ============================================================
-- mister_projects — one row per session
-- ============================================================
CREATE TABLE IF NOT EXISTS mister_projects (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id          text        UNIQUE NOT NULL,
  archetype           mister_archetype NOT NULL DEFAULT 'unresolved',
  archetype_history   jsonb       NOT NULL DEFAULT '[]',
  -- shape: [{ from: MisterArchetype, to: MisterArchetype, at: ISO8601 }]
  stage               mister_stage NOT NULL DEFAULT 'induction',
  locale              mister_locale NOT NULL DEFAULT 'es-PE',
  current_page        text,
  current_product_id  uuid        REFERENCES products(id) ON DELETE SET NULL,
  collected           jsonb       NOT NULL DEFAULT '{}',
  -- shape: MisterCollected (see D7.3)
  history             jsonb       NOT NULL DEFAULT '[]',
  -- shape: { role: 'user'|'assistant', content: string }[]
  -- server trims to last 15 turns before model call; full history stored here
  turn_count          integer     NOT NULL DEFAULT 0,
  flags               text[]      NOT NULL DEFAULT '{}',
  -- entries: 'INJECTION:{timestamp}', 'GUARDRAIL:{pattern}:{timestamp}', 'TIGHTENED'
  in_flight           boolean     NOT NULL DEFAULT false,
  lead_id             uuid        REFERENCES leads(id) ON DELETE SET NULL,
  -- set when session converts to a lead (contact info submitted)
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS mister_projects_session_id_idx ON mister_projects(session_id);
CREATE INDEX IF NOT EXISTS mister_projects_archetype_idx  ON mister_projects(archetype);
CREATE INDEX IF NOT EXISTS mister_projects_stage_idx      ON mister_projects(stage);
CREATE INDEX IF NOT EXISTS mister_projects_created_at_idx ON mister_projects(created_at DESC);

ALTER TABLE mister_projects ENABLE ROW LEVEL SECURITY;
-- No public policies. Service role only.

DROP TRIGGER IF EXISTS set_mister_projects_updated_at ON mister_projects;
CREATE TRIGGER set_mister_projects_updated_at
  BEFORE UPDATE ON mister_projects
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- mister_contacts — fetchContact source table
-- ============================================================
CREATE TABLE IF NOT EXISTS mister_contacts (
  id          uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text    NOT NULL,
  role        text    NOT NULL,
  category    text    NOT NULL,
  -- CHECK: 'sales' | 'project' | 'logistics' | 'partnerships' | 'key_accounts'
  archetypes  text[]  NOT NULL DEFAULT '{}',
  -- which mister_archetype values this contact handles
  whatsapp    text    NOT NULL,
  email       text,
  is_active   boolean NOT NULL DEFAULT true,
  sort_order  integer NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE mister_contacts ENABLE ROW LEVEL SECURITY;
-- No public policies. Service role only.

-- Seed: ops fallback (always present)
INSERT INTO mister_contacts (name, role, category, archetypes, whatsapp, sort_order)
VALUES (
  'Wings Global Trade',
  'Operaciones',
  'sales',
  ARRAY['lead_buyer','project_manager','logistics_manager','reseller','wholesale_partner','unresolved'],
  '+50760250735',
  999
) ON CONFLICT DO NOTHING;

-- ============================================================
-- mister_documents — fetchDocument source table
-- ============================================================
CREATE TABLE IF NOT EXISTS mister_documents (
  id              uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code    text    NOT NULL,
  -- ISO 3166-1 alpha-2 or 'ALL' for universal documents
  product_type    text    NOT NULL,
  -- 'ALL' or category slug (maquinaria-agricola, camiones, etc.) or HS chapter
  title           text    NOT NULL,
  description_es  text,
  storage_path    text,
  -- Supabase Storage path (relative to bucket root)
  public_url      text,
  -- pre-signed URL or public URL; regenerate periodically
  is_available    boolean NOT NULL DEFAULT false,
  -- false until document is actually uploaded
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS mister_documents_lookup_idx
  ON mister_documents(country_code, product_type);

ALTER TABLE mister_documents ENABLE ROW LEVEL SECURITY;
-- No public policies.

DROP TRIGGER IF EXISTS set_mister_documents_updated_at ON mister_documents;
CREATE TRIGGER set_mister_documents_updated_at
  BEFORE UPDATE ON mister_documents
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- mister_quote_tokens — prefill tokens for quotation form
-- ============================================================
CREATE TABLE IF NOT EXISTS mister_quote_tokens (
  id            uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  token         text    UNIQUE NOT NULL DEFAULT gen_random_uuid()::text,
  session_id    text    NOT NULL,
  prefill_data  jsonb   NOT NULL DEFAULT '{}',
  -- shape: Partial<MisterCollected> & { archetype, productIds? }
  used          boolean NOT NULL DEFAULT false,
  expires_at    timestamptz NOT NULL DEFAULT (now() + interval '24 hours'),
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS mister_quote_tokens_token_idx      ON mister_quote_tokens(token);
CREATE INDEX IF NOT EXISTS mister_quote_tokens_session_id_idx ON mister_quote_tokens(session_id);
CREATE INDEX IF NOT EXISTS mister_quote_tokens_expires_at_idx ON mister_quote_tokens(expires_at);

ALTER TABLE mister_quote_tokens ENABLE ROW LEVEL SECURITY;
-- Public read by token only (for the /cotizar page)
CREATE POLICY "quote_token_public_read" ON mister_quote_tokens
  FOR SELECT USING (used = false AND expires_at > now());
```

### Session lifecycle

- `mister_projects` row is created on the **first POST** to `/api/mister/chat`. The client generates the `session_id` as a UUID on mount and sends it on every request. The server does `INSERT ... ON CONFLICT (session_id) DO NOTHING` then reads the row.
- The `leads` table row is created when the user submits contact info (separate endpoint `/api/mister/submit`). At that point, `mister_projects.lead_id` is set.
- The old `accio_projects` table is not touched by Mister. Existing records remain. No migration changes `accio_projects`.

### `/api/mister/quote` endpoint

```ts
// POST /api/mister/quote
// Body: { sessionId: string; prefilled: Partial<MisterCollected> & { archetype, productIds? } }
// Response: { formUrl: string; prefillToken: string }

const { data } = await supabase
  .from('mister_quote_tokens')
  .insert({ session_id: sessionId, prefill_data: prefilled })
  .select('token')
  .single();

return NextResponse.json({
  formUrl: `/cotizar?token=${data.token}`,
  prefillToken: data.token,
});
```

The `/cotizar` page reads the token from the query string, calls a server action to fetch `prefill_data` by token, and pre-fills the existing inquiry form. Mark `used = true` after read.

---

## 9. Environment Variables

Complete `.env.local.example` replacement:

```
# ============================================================
# Wings Global Trade — Environment Variables
# Copy this file to .env.local and fill in real values.
# .env.local is gitignored — never commit secrets.
# ============================================================

# --- Supabase ---
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# --- Anthropic (Claude API) — server-side only ---
ANTHROPIC_API_KEY=

# --- Upstash Redis (rate limiting) ---
# Get from https://console.upstash.com — create a Redis database
# If absent, Mister rate limiting fails open (still works, no limiting)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# --- Resend (transactional email) ---
RESEND_API_KEY=

# --- Twilio (WhatsApp API) ---
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_WHATSAPP_FROM=
TWILIO_WHATSAPP_TO=+50760250735

# --- Wings Ops recipients ---
WINGS_OPS_WHATSAPP=+50760250735
WINGS_OPS_EMAIL=

# --- Mister operational constants ---
# The WhatsApp number Mister surfaces for human escalation
# Injected into every <<MISTER_CONTEXT>> block
MISTER_OPS_WHATSAPP=+50760250735
```

---

## 10. Error Handling

Every async failure mode, its detection point, and the user-facing response.

| # | Failure | Detection point | Server action | Client SSE / HTTP |
|---|---------|----------------|---------------|-------------------|
| 1 | Request body malformed / schema invalid | Zod parse | Log, return 400 | HTTP 400 JSON `{error, code: 'VALIDATION_ERROR'}` |
| 2 | Input too long (>4000 chars) | Before model call | Log | HTTP 400 `{code: 'INPUT_TOO_LONG'}` |
| 3 | Session concurrent request (in_flight=true) | Burst guard check | No Supabase update | HTTP 409 `{code: 'CONCURRENT_REQUEST'}` |
| 4 | Per-IP rate limit exceeded | Upstash check | Log | HTTP 429 `{code: 'RATE_LIMITED', retryAfterMs}` |
| 5 | `mister_projects` row not found and insert fails | DB call | Log error | `error` SSE `{code: 'SESSION_ERROR', message: 'Recarga la página.'}` |
| 6 | Context assembly tool fails (fetchProduct etc.) | `Promise.allSettled` | Log, continue with null | Silent — context block has `null` for that field |
| 7 | Anthropic API network error / timeout | `client.messages.stream()` throw | Log, clear in_flight | `error` SSE `{code: 'AI_UNAVAILABLE', message: 'Mister no disponible. Intenta en unos segundos.'}` |
| 8 | Anthropic API 429 (overloaded) | API error status | Log | `error` SSE `{code: 'OVERLOADED', message: 'Demasiadas consultas ahora. Intenta en un momento o escríbenos por WhatsApp.'}` |
| 9 | Anthropic API 401 (invalid API key) | API error status | Log critical | `error` SSE `{code: 'AI_UNAVAILABLE'}` — do NOT expose key details |
| 10 | Guardrail violation in generated content | Post-stream scan | Log to flags[], clear in_flight | `error` SSE `{code: 'CONTENT_REPLACED', fallback: ROUTING_MESSAGE}` |
| 11 | Injection attempt in user input | Input sanitize | Log to flags[], proceed with sanitized input | No SSE — transparent to user |
| 12 | Session turn limit reached (turn_count >= 40) | Before model call | Clear in_flight | `error` SSE `{code: 'SESSION_LIMIT', message: 'Sesión completada. Un especialista continúa por WhatsApp.'}` + `actions` SSE with `connect_whatsapp` |
| 13 | Post-stream DB write fails | Supabase update | Log, do NOT surface | Silent — graceful degradation (next turn re-reads stale state) |
| 14 | `mister_quote_tokens` insert fails | Supabase call in /api/mister/quote | Log | HTTP 500 `{code: 'QUOTE_ERROR'}` — client shows "Abre el formulario manualmente" fallback |
| 15 | Upstash Redis unavailable | Upstash SDK throw | Log warning | Fail open — proceed without rate limiting |
| 16 | `quick_actions` JSON malformed | Fence extraction | Log, use archetype fallback | `actions` SSE with hardcoded fallback for that archetype+stage |
| 17 | Stream abort (client sends new message) | `request.signal.aborted` | Clear in_flight | No SSE — connection already closed |

All error SSE events include a human-readable `message` field in the session locale. The raw error (Supabase error, Anthropic error object, stack trace) is never included in SSE payload. All raw errors go to `console.error('[mister/...]', error)` only.

---

## 11. File Routing Map

New files to create (all under `src/`):

```
src/
  app/
    api/
      mister/
        chat/route.ts          ← REPLACE existing file entirely
        quote/route.ts         ← NEW: POST, returns prefill token
        document/route.ts      ← NEW: GET ?country=&type=, proxies signed URL
  lib/
    mister/
      prompt.ts                ← NEW: MISTER_STATIC_PROMPT assembly
      context.ts               ← NEW: buildMisterContext, renderContextBlock
      tools.ts                 ← NEW: fetchProduct, preloadComparison, etc.
      guardrails.ts            ← NEW: scanGuardrails, sanitizeInput, ROUTING_MESSAGE*
      history.ts               ← NEW: trimHistory
      rate-limit.ts            ← NEW: checkRateLimit (Upstash)
      stage.ts                 ← NEW: inferStage, extractCollected (haiku call)
      fallback-actions.ts      ← NEW: per-archetype fallback quick_actions
  types/
    mister.ts                  ← REPLACE: keep TprState (for old accio flow), ADD new Mister types
```

Keep `/src/lib/mister-knowledge.ts` and all existing TPR/Accio code. The old `/api/mister/chat/route.ts` is the only file being replaced.

The `/src/types/mister.ts` must export BOTH the old `TprState` / `TprFieldKey` / `CifEstimate` (for the still-active Accio Engine at `/accio`) AND the new `MisterArchetype` / `MisterStage` / `MisterCollected` / `MisterContext` / `MisterQuickAction` / `MisterSurface` / `MisterMessage` types.

---

## 12. Type Definitions (canonical, builder-ready)

These extend (not replace) the existing `src/types/mister.ts`. Add below the existing exports:

```ts
// ── NEW MISTER SYSTEM TYPES ──────────────────────────────────────────────────

export type MisterArchetype =
  | 'lead_buyer'
  | 'project_manager'
  | 'logistics_manager'
  | 'reseller'
  | 'wholesale_partner'
  | 'unresolved';

export type MisterStage =
  | 'induction'
  | 'discovery'
  | 'consideration'
  | 'pre_qualification'
  | 'support';

export type MisterLocale = 'es-PE' | 'en' | 'nl' | 'de';

export type MisterActionId =
  | 'ask_followup'
  | 'show_product'
  | 'show_comparison'
  | 'show_specs'
  | 'show_moq'
  | 'download_document'
  | 'open_quotation'
  | 'book_meeting'
  | 'connect_whatsapp'
  | 'explain_cost';

export interface MisterQuickAction {
  label: string;
  action: MisterActionId;
}

export interface MisterCollected {
  destinationCountry?: string;
  destinationCity?: string;
  incoterm?: 'EXW' | 'FOB' | 'CFR' | 'CIF' | 'DAP' | 'DDP';
  containerType?: '20GP' | '40GP' | '40HC' | 'reefer' | 'LCL';
  volume?: string;
  ruc?: string;
  timeline?: string;
  productInterest?: string[];  // product UUIDs from products table
  budgetBand?: string;
  notes?: string;
}

export type MisterSurfaceType = 'product' | 'comparison' | 'specs' | 'moq' | 'waterfall' | 'document' | 'contact';

export interface MisterSurface {
  type: MisterSurfaceType;
  payload: unknown;  // narrowed per type at render time
}

// SSE event types (named event wire format)
export type MisterStreamEvent =
  | { event: 'token';   data: { delta: string } }
  | { event: 'surface'; data: { type: MisterSurfaceType; payload: unknown } }
  | { event: 'actions'; data: { quickActions: MisterQuickAction[] } }
  | { event: 'state';   data: { archetype: MisterArchetype; stage: MisterStage } }
  | { event: 'done';    data: { messageId: string } }
  | { event: 'error';   data: { code: string; message?: string; fallback?: string } };

// POST /api/mister/chat request
export interface MisterChatRequest {
  sessionId: string;
  message: string;
  actionId?: MisterActionId;
  currentPage?: string;
  currentProductId?: string | null;
}

// mister_projects Supabase row shape
export interface MisterProjectRow {
  id: string;
  session_id: string;
  archetype: MisterArchetype;
  archetype_history: { from: MisterArchetype; to: MisterArchetype; at: string }[];
  stage: MisterStage;
  locale: MisterLocale;
  current_page: string | null;
  current_product_id: string | null;
  collected: MisterCollected;
  history: { role: 'user' | 'assistant'; content: string }[];
  turn_count: number;
  flags: string[];
  in_flight: boolean;
  lead_id: string | null;
  created_at: string;
  updated_at: string;
}
```

---

## 13. Induction and Archetype Resolution

D1 defines the decision tree but not the implementation mechanism. The model handles induction conversationally — the D3 system prompt contains the archetype definitions. No server-side state machine is needed for the questions themselves.

The server IS responsible for:

**Detecting first archetype resolution** — on each turn, compare the model's text for archetype signals using a lightweight keyword pass, THEN confirm via the next `extractCollected` haiku call which also returns an `archetypeSignal` field:

```ts
// Add to extractCollected prompt:
// Also return archetypeSignal: one of
// 'lead_buyer'|'project_manager'|'logistics_manager'|'reseller'|'wholesale_partner'|null
// based on explicit signals in the exchange. Return null if no strong signal.
```

When `archetypeSignal` is non-null and different from the current `session.archetype`:
- Append to `archetype_history`: `{ from: current, to: signal, at: now() }`
- Update `session.archetype = signal`
- Persist to `mister_projects`

**"If the user resists the induction"** — detected when `turn_count >= 3` and `archetype === 'unresolved'`. On next context assembly, inject into the dynamic context block: `SYSTEM NOTE: User has not resolved archetype after 3 turns. Set archetype to 'unresolved' and proceed to answer their direct question. Infer from page context.`

---

## Completion Flag

Signal: create `/ai/AI_COMPLETE.flag` at `C:\Users\Muaaz\projects\wings-global-trade\ai\AI_COMPLETE.flag`
