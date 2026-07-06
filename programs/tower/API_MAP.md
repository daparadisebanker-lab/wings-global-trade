# TOWER · API_MAP.md

Mutations are Next.js **server actions** (auth → Zod parse → RLS-scoped query). Route handlers exist only where an external system calls in, or streaming is needed. All IDs uuid; all money integer minor units; all list endpoints cursor-paginated.

## Server actions (internal)

| Domain | Action | Notes |
|--------|--------|-------|
| Catalog | `createProduct(laneId, input)` | Zod vs. active spec schema |
| | `updateProduct(id, patch)` | editors; status transitions gated by RLS |
| | `submitForReview(id)` / `publishProduct(id)` | publish: snapshot → `product_versions`, then revalidate webhook |
| | `retireProduct(id)` / `rollbackProduct(id, version)` | retire never deletes |
| | `attachMedia(productId, uploads[])` | signed upload → variants via n8n |
| Pipeline | `createRFQ(input)` / `updateStage(id, stage)` | stage validated against archetype stage set |
| | `upsertLines(rfqId, lines[])` | unit must match lane unit math |
| | `composeQuote(rfqId, lines)` / `sendQuote(quoteId)` | totals computed server-side; PDF via n8n |
| | `convertToOrder(quoteId)` | creates order, prompts container assignment |
| Containers | `openContainer(laneId, kind, mode)` | code auto-issued, append-only |
| | `commitCBM(containerId, {orderId?, accountId, cbm})` | rejects over-capacity atomically (SQL check) |
| | `issuePO(containerId, supplierId, lines)` / `recordQC(poId, checkpoint, result, evidence)` | |
| | `uploadDocument(containerId, kind, file)` / `computeLandedCost(containerId, inputs)` | cost math server-only |
| | `transitionContainer(id, status)` | drives public fill-meter state |
| Admin | `inviteUser(email)` / `setMemberships(userId, grid)` / `registerLane(config)` / `publishSpecSchema(...)` | group admin |

## Route handlers (external / streaming)

### `POST /api/ingest`  — public event endpoint (called by all sites)
```
Headers: X-Wings-Signature (HMAC-SHA256 of body, per-brand key)
Body: { brand, lane, event, session_hash, product_slug?, path?, meta? }
→ 202. Rate-limited per session_hash. No PII accepted (rejected if email/phone shaped).
Events: page_view · product_view · spec_open · fillmeter_interact ·
        mister_start · mister_complete · rfq_submit · whatsapp_handoff
```

### `GET /api/public/fill/{containerCode}` — feeds the public FillMeter
```
→ { code, capacity_cbm, committed_cbm, status, mode }   (only if public_fill_visible)
Cache: 60s. This is the single source of truth for "Trae tu grupo" meters.
```

### `GET /api/public/catalog/{brand}/{lane}` — site pulls published products
```
→ published snapshots only (from product_versions). ISR-cached; revalidated on publish.
```

### `POST /api/hooks/mister` — existing n8n Mister pipeline posts session lifecycle
```
{ session_id, lane, phase: started|completed|handoff, transcript_ref, contact? }
→ creates/updates RFQ (source=MISTER) + fires triage.
```

### `POST /api/hooks/whatsapp` — n8n WhatsApp inbound
```
→ threads message onto matching account/RFQ (by number), else Triage Queue.
```

### Intelligence (streaming where >2s)
```
POST /api/ai/triage        { text|session_ref } → { lane, archetype, account_match, draft_reply, confidence }   (haiku)
POST /api/ai/spec-extract  { storage_path, schema_id } → drafted spec JSON + field confidences               (sonnet, streamed)
POST /api/ai/brief         { lane, week } → digest markdown (also scheduled weekly via n8n)                  (sonnet)
POST /api/ai/score         { account_id } → { score, factors[] }                                             (haiku, nightly batch)
```

### `POST /api/hooks/revalidate-callback` — Vercel revalidation confirmation → WebhookHealth

## Contracts & errors

Every response `{ data } | { error: { code, message } }`; codes: `UNAUTHORIZED`, `FORBIDDEN_LANE`, `VALIDATION`, `CAPACITY_EXCEEDED`, `STAGE_INVALID`, `SCHEMA_MISMATCH`, `RATE_LIMITED`. Raw DB errors never leave the server. Every mutation lands in `audit_log` via trigger — no exceptions, including admin.
