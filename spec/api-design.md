# Wings Global Trade — API Design

## Conventions

- All routes under `/api/` are Next.js 15 App Router route handlers (`src/app/api/[...]/route.ts`)
- All routes return `application/json`
- All error responses follow: `{ error: string, code: string }`
- Server-side routes use the Supabase service role key (never exposed to client)
- Input validated with Zod before any database write
- Rate limiting: Upstash Redis or Vercel KV (10 requests/minute per IP for mutation routes)
- Claude API calls only happen server-side — API key never in client bundle

---

## Route Index

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/categories` | List all active categories |
| GET | `/api/products` | List products (with filters) |
| GET | `/api/products/[slug]` | Get single product by slug |
| POST | `/api/leads/catalog` | Submit catalog inquiry |
| POST | `/api/leads/contact` | Submit contact form |
| POST | `/api/accio/chat` | Send message to Accio Engine (streaming) |
| POST | `/api/accio/estimate` | Calculate CIF estimate |
| POST | `/api/accio/submit` | Submit completed Accio TPR as lead |

---

## GET `/api/categories`

Returns all active catalog categories in sort order.

**Request:** No params

**Response 200:**
```json
{
  "categories": [
    {
      "id": "uuid",
      "slug": "maquinaria-agricola",
      "name_es": "Maquinaria Agrícola",
      "name_en": "Agricultural Machinery",
      "description_es": "Tractores, cosechadoras y equipos de labranza",
      "icon_key": "tractor",
      "sort_order": 1
    }
  ]
}
```

**Implementation notes:**
- Cached with `next: { revalidate: 3600 }` — categories change infrequently
- Used to populate homepage category grid and nav dropdown

---

## GET `/api/products`

List products with optional filtering.

**Query params:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `category` | string | No | Category slug filter |
| `q` | string | No | Full-text search (Spanish) |
| `limit` | number | No | Default 20, max 50 |
| `offset` | number | No | Default 0 |

**Response 200:**
```json
{
  "products": [
    {
      "id": "uuid",
      "slug": "tractor-yto-x754",
      "name_es": "Tractor YTO X754",
      "category_id": "uuid",
      "source_markets": ["China"],
      "images": ["https://...supabase.co/storage/v1/...hero.jpg"],
      "specs": { "Potencia": "75 HP", "Tracción": "4x4" }
    }
  ],
  "total": 42,
  "limit": 20,
  "offset": 0
}
```

**Implementation notes:**
- Full-text search uses Postgres `to_tsvector('spanish', name_es || ' ' || description_es)`
- Create index: `CREATE INDEX products_fts_idx ON products USING gin(to_tsvector('spanish', name_es || ' ' || description_es))`
- Cached with `next: { revalidate: 600 }` per category
- Images array returns only first image (thumbnail) for list view

---

## GET `/api/products/[slug]`

Get full product detail by slug.

**Response 200:**
```json
{
  "product": {
    "id": "uuid",
    "slug": "tractor-yto-x754",
    "name_es": "Tractor YTO X754",
    "name_en": "YTO X754 Tractor",
    "description_es": "Tractor de alta potencia para uso agrícola intensivo...",
    "category_id": "uuid",
    "source_markets": ["China"],
    "images": ["https://...hero.jpg", "https://...gallery-01.jpg"],
    "specs": {
      "Potencia del motor": "75 HP",
      "Tipo de tracción": "4x4",
      "Peso neto": "2400 kg"
    },
    "models": [
      { "name": "X754 Estándar", "specs_override": {} },
      { "name": "X754 Cabinado", "specs_override": { "Cabina": "Cerrada con A/C" } }
    ]
  }
}
```

**Response 404:**
```json
{ "error": "Producto no encontrado", "code": "PRODUCT_NOT_FOUND" }
```

**Implementation notes:**
- Cached with `next: { revalidate: 3600 }`
- Returns full images array for gallery

---

## POST `/api/leads/catalog`

Submit a catalog inquiry. Creates a lead record and triggers notifications.

**Request body:**
```typescript
{
  full_name: string           // required, min 2 chars
  company?: string
  email: string               // required, valid email
  phone: string               // required, E.164 format or local with country prefix
  destination_country: string // required
  product_id?: string         // UUID, optional — may be generic inquiry
  product_name: string        // required — display name, denormalized
  quantity: string            // required — "5 unidades", "1 contenedor"
  message?: string
  source_url?: string
}
```

**Zod schema:**
```typescript
const CatalogLeadSchema = z.object({
  full_name: z.string().min(2).max(100),
  company: z.string().max(200).optional(),
  email: z.string().email(),
  phone: z.string().min(7).max(20),
  destination_country: z.string().min(2).max(100),
  product_id: z.string().uuid().optional(),
  product_name: z.string().min(1).max(200),
  quantity: z.string().min(1).max(100),
  message: z.string().max(2000).optional(),
  source_url: z.string().url().optional(),
})
```

**Response 201:**
```json
{
  "lead_id": "uuid",
  "message": "Consulta recibida. El equipo de Wings se comunicará contigo en las próximas 24 horas."
}
```

**Response 400:**
```json
{
  "error": "Datos inválidos",
  "code": "VALIDATION_ERROR",
  "details": [{ "field": "email", "message": "Email inválido" }]
}
```

**Response 429:**
```json
{ "error": "Demasiadas solicitudes. Intenta en un momento.", "code": "RATE_LIMITED" }
```

**Implementation flow:**
```
1. Validate request body with Zod
2. Extract IP country from Vercel headers (x-vercel-ip-country)
3. Insert into leads table (service role key)
4. Fire-and-forget: send WhatsApp + email notifications
5. Return 201 with lead_id
```

**Notification failure handling:**
- Notification errors are logged to `notification_log` table
- They do NOT cause the API to return an error
- Lead is always saved first before notifications

---

## POST `/api/leads/contact`

Submit a contact form inquiry. Simpler than catalog — no product association.

**Request body:**
```typescript
{
  full_name: string
  email: string
  phone?: string
  message: string
}
```

**Response 201:**
```json
{ "lead_id": "uuid" }
```

**Implementation:** Same pattern as catalog lead. `flow: 'contact'`. WhatsApp and email notify.

---

## POST `/api/accio/chat`

The core Accio Engine endpoint. Accepts a conversation turn and returns a streaming AI response. Also extracts TPR fields from the AI response.

**Request body:**
```typescript
{
  messages: Array<{
    role: 'user' | 'assistant'
    content: string
  }>
  tpr_state: {
    product_description?: string
    hs_code?: string
    quantity?: string
    target_price_usd?: number
    destination_country?: string
    destination_port?: string
    certifications?: string[]
    tech_specs?: Record<string, string>
    packaging_requirements?: string
    delivery_timeline?: string
  }
  session_id: string  // Client-generated UUID for this session
}
```

**Response:** Server-Sent Events stream (text/event-stream)

```
data: {"type":"delta","content":"Entendido, buscas importar "}
data: {"type":"delta","content":"50 bombas hidráulicas."}
data: {"type":"tpr_update","field":"product_description","value":"Bomba hidráulica industrial 500 L/min"}
data: {"type":"tpr_update","field":"quantity","value":"50 unidades"}
data: {"type":"done","tpr_completeness":"minimum"}
```

**Event types:**
| Type | Payload | Description |
|------|---------|-------------|
| `delta` | `{ content: string }` | Streaming text chunk |
| `tpr_update` | `{ field: string, value: any }` | TPR field captured this turn |
| `done` | `{ tpr_completeness: 'partial' | 'minimum' | 'complete' }` | Stream complete |
| `error` | `{ message: string }` | Error occurred |

**Claude API configuration:**
```typescript
const ACCIO_SYSTEM_PROMPT = `
Eres el motor Accio de Wings Global Trade, una empresa especializada en importación a través de zonas francas (ZOFRATACNA en Perú y ZOFRI en Chile).

Tu trabajo es recopilar los requisitos técnicos del producto que el comprador necesita importar, a través de una conversación natural en español.

REGLAS:
- Habla siempre en español
- Haz UNA sola pregunta por mensaje
- Sé específico y técnico — eres un experto en comercio internacional
- Cuando captures un dato, confírmalo explícitamente
- No uses exclamaciones
- Después de capturar descripción del producto, cantidad y país de destino, ofrece calcular el estimado CIF

CAMPOS A CAPTURAR (en orden de prioridad):
1. Descripción del producto (obligatorio)
2. Código HS / categoría arancelaria (infiere y confirma)
3. Cantidad requerida
4. Precio objetivo por unidad (USD)
5. País de destino
6. Certificaciones requeridas
7. Especificaciones técnicas detalladas
8. Requisitos de empaque y etiquetado
9. Puerto de destino preferido
10. Plazo de entrega

EXTRACCIÓN DE DATOS:
Al final de cada respuesta, incluye un bloque JSON (entre |||JSON_START||| y |||JSON_END|||) con los campos que capturaste en este turno:
|||JSON_START|||
{"field": "product_description", "value": "..."}
|||JSON_END|||

Si capturaste múltiples campos, emite múltiples bloques.

Estado actual del TPR: [TPR_STATE_PLACEHOLDER]
`

// Model selection
const model = 'claude-haiku-4-5'  // Fast, cost-effective for conversational turns
// Switch to claude-sonnet-4-6 for CIF estimation reasoning
```

**Implementation notes:**
- Parse `|||JSON_START|||...|||JSON_END|||` blocks from streaming response
- Strip JSON blocks from text shown to user
- Emit `tpr_update` SSE events for each parsed field
- Max conversation length: 20 turns (enforce on server, not client)
- Rate limit: 30 requests per session_id per hour

---

## POST `/api/accio/estimate`

Calculate preliminary CIF estimate based on current TPR state. Called when minimum fields are captured.

**Request body:**
```typescript
{
  product_description: string
  hs_code?: string
  quantity: string
  quantity_units: string
  target_price_usd: number
  destination_country: string
  destination_port?: string
  certifications?: string[]
  source_market?: string    // AI-recommended, or user-specified
}
```

**Response 200:**
```json
{
  "estimate": {
    "free_zone": "ZOFRATACNA",
    "source_market": "China",
    "fob_estimate_usd": 45000,
    "freight_estimate_usd": 3200,
    "insurance_estimate_usd": 726,
    "cif_total_usd": 48926,
    "duty_rate_pct": 6,
    "duty_amount_usd": 2935.56,
    "free_zone_savings_pct": 18.5,
    "disclaimer": "Estimación preliminar sujeta a cotización formal.",
    "methodology": "FOB estimado basado en precio objetivo + margen de sourcing. Flete calculado para 1 contenedor 40HC vía Shanghai → Callao."
  }
}
```

**CIF Calculation Logic:**

```typescript
// Simplified calculation engine — src/lib/cif-calculator.ts

function calculateCIF(input: CIFInput): CIFEstimate {
  // 1. Determine free zone based on destination
  const freeZone = selectFreeZone(input.destination_country)
  // Peru/Bolivia → ZOFRATACNA; Chile/Colombia/Panama → ZOFRI

  // 2. Recommend source market if not specified
  const sourceMarket = input.source_market ?? recommendSourceMarket(input.hs_code)

  // 3. FOB estimate
  // If target_price is provided: use as anchor, add sourcing margin (15–25% depending on category)
  // Sourcing margin table: machinery 18%, vehicles 15%, parts 22%, equipment 20%
  const fobEstimate = input.target_price_usd * input.quantity_numeric * (1 + SOURCING_MARGIN)

  // 4. Freight estimate
  // Reference rates per 20GP/40HC/LCL based on origin port + destination port
  const freightEstimate = calculateFreight(sourceMarket, input.destination_port ?? defaultPort(input.destination_country), fobEstimate)

  // 5. Insurance (standard 1.5% of CIF per ICC clause C)
  const insuranceEstimate = (fobEstimate + freightEstimate) * 0.015

  // 6. CIF total
  const cifTotal = fobEstimate + freightEstimate + insuranceEstimate

  // 7. Duty rate lookup
  // Static lookup table: destination_country × hs_chapter → duty rate %
  // Source: WTO tariff schedules for Peru, Chile, Colombia, Panama, Costa Rica, Bolivia, Dominican Republic
  const dutyRate = DUTY_RATE_TABLE[input.destination_country]?.[hsChapter(input.hs_code)] ?? 0
  const dutyAmount = cifTotal * (dutyRate / 100)

  // 8. Free zone savings
  // ZOFRATACNA/ZOFRI advantage: ~15–22% vs. standard Lima/Santiago corridor
  // (reduced handling, preferential treatment, deferred VAT)
  const freeZoneSavingsPct = FREE_ZONE_SAVINGS[freeZone]

  return { freeZone, sourceMarket, fobEstimate, freightEstimate, insuranceEstimate, cifTotal, dutyRate, dutyAmount, freeZoneSavingsPct }
}
```

**Implementation notes:**
- This calculation is deterministic (no AI call needed for basic estimate)
- For complex products (unusual HS codes), call claude-sonnet-4-6 to reason through the estimate
- Store methodology string explaining assumptions
- Duty rate table maintained as a TypeScript constant in `src/lib/duty-rates.ts`

---

## POST `/api/accio/submit`

Submit the completed Accio TPR as an official inquiry.

**Request body:**
```typescript
{
  // Contact info
  full_name: string
  company?: string
  email: string
  phone: string

  // TPR state (final)
  tpr: {
    product_description: string
    hs_code?: string
    quantity: string
    target_price_usd?: number
    destination_country: string
    destination_port?: string
    certifications?: string[]
    tech_specs?: Record<string, string>
    packaging_requirements?: string
    delivery_timeline?: string
  }

  // Estimate (if generated)
  estimate?: {
    free_zone: string
    cif_total_usd: number
    duty_amount_usd: number
    free_zone_savings_pct: number
  }

  // Conversation snapshot (last 10 turns for ops context)
  conversation_snapshot: Array<{ role: string; content: string; timestamp: string }>
  session_id: string
}
```

**Response 201:**
```json
{
  "lead_id": "uuid",
  "project_id": "uuid",
  "message": "Tu consulta fue enviada al equipo de Wings. Te contactaremos en las próximas 24 horas."
}
```

**Implementation flow:**
```
1. Validate with Zod
2. Insert accio_projects record
3. Insert leads record (flow: 'accio', accio_project_id: ↑)
4. Send WhatsApp notification (TPR summary + project link)
5. Send email notification (full TPR as formatted HTML)
6. Return 201
```

---

## Internal: Notification Helpers

These are not HTTP routes — they are server-side functions called by the lead API routes.

### `sendWhatsAppNotification(leadId: string, payload: WhatsAppPayload)`

```typescript
// src/lib/notifications/whatsapp.ts
// Provider: Twilio WhatsApp API (or WhatsApp Business Cloud API)
// Config: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_FROM, OPS_WHATSAPP_NUMBER

async function sendWhatsAppNotification(leadId: string, payload: WhatsAppPayload): Promise<void> {
  try {
    const result = await twilioClient.messages.create({
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_FROM}`,
      to: `whatsapp:${process.env.OPS_WHATSAPP_NUMBER}`,
      body: formatWhatsAppMessage(payload),
    })
    await logNotification(leadId, 'whatsapp', 'sent', result.sid)
    await updateLeadNotificationStatus(leadId, 'whatsapp', new Date().toISOString())
  } catch (error) {
    await logNotification(leadId, 'whatsapp', 'failed', null, String(error))
    // Do not re-throw — notification failure is non-fatal
  }
}
```

### `sendEmailNotification(leadId: string, payload: EmailPayload)`

```typescript
// src/lib/notifications/email.ts
// Provider: Resend
// Config: RESEND_API_KEY, OPS_EMAIL

async function sendEmailNotification(leadId: string, payload: EmailPayload): Promise<void> {
  try {
    const result = await resend.emails.send({
      from: 'Wings Global Trade <noreply@wingsglobaltrade.com>',
      to: [process.env.OPS_EMAIL!],
      subject: formatEmailSubject(payload),
      html: renderLeadEmailHtml(payload),
    })
    await logNotification(leadId, 'email', 'sent', result.id)
    await updateLeadNotificationStatus(leadId, 'email', new Date().toISOString())
  } catch (error) {
    await logNotification(leadId, 'email', 'failed', null, String(error))
  }
}
```

---

## Error Code Reference

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Zod validation failed |
| `PRODUCT_NOT_FOUND` | 404 | Product slug not in database |
| `CATEGORY_NOT_FOUND` | 404 | Category slug not in database |
| `RATE_LIMITED` | 429 | Too many requests from this IP |
| `AI_UNAVAILABLE` | 503 | Claude API timeout or error |
| `INTERNAL_ERROR` | 500 | Unexpected server error |
