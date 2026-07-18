# Quotation Intelligence — the live import‑tracking layer

> **Status: PROPOSAL — Phase 0 pending Muaaz.** Written 2026‑07‑18.
> This is a spec package, not active law (per `programs/README.md`): nothing
> here governs current work until Muaaz says build it. It extends **TOWER**
> (`programs/tower/`, now substantially built at `apps/tower`) and adds one
> new **client‑facing surface** on `apps/site`. It touches a hard site law
> (the no‑absolute‑price rule) and introduces one net‑new domain (installment
> payments) — both flagged as ratification gates in §7.

---

## 0 · What this is (in the user's words, structured)

A buyer who has received a real quotation from Wings gets a single live screen
that answers one question at all times: **"where is my importation right now?"**
It carries four layers, each fed by TOWER:

1. **The CIF quotation** — the actual all‑in landed figure Wings issued to this
   client (FOB + freight + insurance, then the post‑CIF layers: duties,
   container handling). Not an indexed range — the real contracted number, on a
   private per‑client document.
2. **The live import tracker** — the shipment moving phase by phase:
   *quotation received → accepted → freight booked at origin → insured → BL
   liberated → in transit → arrival & container handling → nationalized →
   delivered*. Each phase flips as TOWER ops advances it, and the client is
   pinged (WhatsApp/email) at each hito.
3. **The validity countdown** — the quote has a time validity; a live clock
   counts it down. On expiry the document changes state and the CTA changes.
4. **The payment ledger** — if installments were agreed (anticipo / saldo
   contra BL / saldo contra entrega), the client sees each installment, its
   amount, due date, and status (pending / paid / overdue).

All state is **written in TOWER** and **read by the client surface**. The
client surface never writes. This is the "public site is a read model" law
(TOWER `CLAUDE.md` §5 / ARCHITECTURE ADR‑4) applied to a private read model.

---

## 1 · What already exists (build on it, do not re‑invent)

The concept is ~70% assembled from parts that already ship. The gap is smaller
than it looks.

| Need | Already in the repo | Where |
|---|---|---|
| CIF cost atoms | `tower.landed_costs` = `fob_minor · freight_minor · insurance_minor · duties_minor · handling_minor` + currency | `programs/tower/DATABASE_SCHEMA.sql` |
| Quote + validity | `tower.quotes.valid_until`, `status ∈ {DRAFT,SENT,ACCEPTED,REJECTED,EXPIRED}`, `total_minor`, `lines jsonb` | same |
| Order lifecycle | `tower.orders.status ∈ {CONTRACTED,IN_PRODUCTION,READY,SHIPPED,DELIVERED,CLOSED,CANCELLED}`, `incoterm` | same |
| Shipment lifecycle | `tower.containers.status ∈ {OPEN,FILLING,BOOKED,IN_TRANSIT,ARRIVED,CLEARED,CLOSED}`, `route jsonb` (ETD/ETA) | same |
| BL & docs | `tower.trade_documents.kind` incl. `'BL','CO','PHYTO','INVOICE','PACKING_LIST'` | same |
| Tokenized private page, no login | `/g/{token}` — server‑rendered, `force-dynamic`, resolve‑token‑to‑read‑model, no account wall | `apps/site/src/app/g/[token]/page.tsx` |
| Live countdown island | `InviteActions` owns a `deadlineISO` countdown + CTA beacon | `apps/site/src/components/features/container/InviteActions.tsx` |
| Milestone vocabulary (ES) | *"Zarpó · llegó a zona franca · nacionalizado · entregado — te avisamos en cada paso"* | same `/g/{token}` page, `Step` list |
| Notification rail | WhatsApp (Twilio) + email (Resend), fire‑and‑forget after DB write | `apps/site` notification flow; TOWER uses n8n for the same |
| Money discipline | integer minor units + currency, arithmetic server‑side, basis points for % | TOWER law (ARCHITECTURE ADR‑7) |

**Reuse, don't fork:** the client tracker is the `/g/{token}` pattern pointed
at an order instead of a container invite; the countdown is `InviteActions`
retargeted from `fillDeadline` to `quote.valid_until`; the phases reuse the
existing milestone language.

---

## 2 · What is genuinely new (the actual build)

Four gaps. Everything else is wiring.

### 2.1 A canonical, config‑driven import‑phase model
TOWER has `order.status`, `container.status`, `purchase_order.status`,
`commitment.status` — four separate lifecycles. The client sees **one**
journey. We need a single ordered phase model that is *derived* from those
underlying states + document/payment events, not a fifth hand‑maintained
status. Proposed canonical phases (ES‑first, per site copy law):

| # | Phase (client‑facing, ES) | Fires from (TOWER truth) |
|---|---|---|
| 0 | `COTIZACION_RECIBIDA` — Cotización recibida | `quotes.status = SENT` |
| 1 | `ACEPTADA` — Cotización aceptada | `quotes.status = ACCEPTED` → `orders` row created |
| 2 | `EN_ORIGEN` — Flete reservado en origen | freight booked (container `BOOKED` / origin‑freight milestone) |
| 3 | `ASEGURADO` — Carga asegurada | insurance bound (milestone) |
| 4 | `BL_LIBERADO` — BL liberado | `trade_documents` BL released milestone (telex/liberación) |
| 5 | `EN_TRANSITO` — En tránsito | `containers.status = IN_TRANSIT` |
| 6 | `ARRIBO` — Arribo y manejo en puerto/zona franca | `containers.status = ARRIVED` + handling milestone |
| 7 | `NACIONALIZADO` — Nacionalizado / despacho | `containers.status = CLEARED` |
| 8 | `ENTREGADO` — Entregado | `orders.status = DELIVERED` |

Law (TOWER Directive 2 — archetype/config drives structure): the phase list is
**config on the lane/order**, not a hardcoded array in a component. Some
archetypes skip phases (a CREDENTIAL mandate has no container; a shared‑
container ALLOCATION buyer shares phases 2–8 with the whole box). The renderer
reads the phase set from config and maps current TOWER state onto it.

Each phase transition is an **append‑only milestone row** with a timestamp — so
the client sees a dated timeline ("BL liberado · 14 jul") and TOWER keeps the
audit trail. Milestones are the event log; `order.status`/`container.status`
stay the system of record.

### 2.2 Installment payment ledger (net‑new domain)
Nothing in `tower` models a payment schedule today (`landed_costs` is internal
cost, not what the client owes). New tables (§4). Rules:
- Money is **integer minor units + currency** — no floats, ever (ADR‑7).
- Installments are a **schedule against an agreed contract**, never a checkout.
  No "pay now / add to cart" — display is *status*, and the action is *"coordinar
  pago"* (WhatsApp handoff), never an on‑site payment form. This keeps the
  wholesale‑only Prime Directive and passes the vocabulary lint.
- Standard trade schedule as the seed template: **anticipo** (on acceptance),
  **saldo contra BL** (against BL release), **saldo contra entrega** — but the
  schedule is data, configured per order, not hardcoded.

### 2.3 The private client‑tracker surface + access token
A new route on `apps/site` — proposed `/importacion/{token}` (ES) — built as a
sibling of `/g/{token}`: server‑rendered, `force-dynamic`, token resolves to a
curated read model, **no client login** (recommended — see §7 G2). Renders the
CIF document, the phase tracker, the countdown, and the payment ledger. It is
the **only** place in the ecosystem an absolute contracted price is shown to a
buyer — gated behind an unguessable per‑order token, `robots: noindex`.

### 2.4 Update propagation TOWER → client
Ops advances a shipment in TOWER (marks BL liberated, freight booked, insurance
bound, container handling). Each action must (a) write the milestone row, (b)
fire the client notification via n8n (WhatsApp/email), (c) be `force-dynamic`‑
visible on the tracker within seconds. This is one server action per milestone,
reusing TOWER's `transitionContainer` / document‑upload flow, plus a milestone
writer. Supabase Realtime on the milestone table gives the live tick without
polling.

---

## 3 · The pricing‑privacy boundary (read before anything)

`apps/site/CLAUDE.md` is explicit: **no absolute price, availability, or lead
time — ever**; the old absolute‑USD CIF flow was *retired*; Mister teaches cost
*structure* via indexed ranges (base 100) only, enforced at the type level.

Quotation Intelligence does **not** violate this — but it lives right against
the line, so the boundary is stated as law here:

1. The public catalog, Mister, and every indexable page stay **indexed‑range
   only**. Nothing changes there.
2. The absolute CIF number appears **only** on the private, tokenized,
   `noindex` per‑order document, delivered to a client who already received a
   real quotation. It is a **1:1 commercial artifact** (a contract), not
   marketing. This is the same category as an emailed PDF quote — just live.
3. Therefore the tracker code path is **physically separate** from Mister's
   guardrail/hold‑back code and from `@wings/mister` types (whose
   `WaterfallSegment` forbids absolute values). It must never import them, and
   Mister must never link to an absolute figure — only to the tokenized page,
   which stands on its own auth (the token).

**This is a ratification gate (§7 G1): Muaaz confirms that a private tokenized
per‑order document may show the real contracted CIF figure.** If the answer is
no, the tracker shows phases + countdown + payment *status* but renders the CIF
as the issued PDF download rather than live numbers on the page.

---

## 4 · Data model (additions to schema `tower`)

All tables: `uuid` PKs, `timestamptz`, integer minor units, `brand_id`+`lane_id`
for RLS, audit trigger before UI, append‑only where noted. Draft — refine at
build against the live `tower` schema.

```sql
set search_path to tower;

-- The client‑visible import journey. One row per order; phases are milestones.
create table import_journeys (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references brands(id),
  lane_id  uuid not null references lanes(id),
  order_id uuid not null references orders(id),
  quote_id uuid not null references quotes(id),
  container_id uuid references containers(id),        -- null until assigned
  phase_set text not null default 'STANDARD_IMPORT',  -- config key; archetype-aware
  current_phase text not null default 'COTIZACION_RECIBIDA',
  incoterm text,                                       -- mirrors order.incoterm (CIF, DDP…)
  created_at timestamptz default now(),
  unique (order_id)
);

-- Append-only dated timeline. The event log the client sees; never updated in place.
create table journey_milestones (
  id uuid primary key default gen_random_uuid(),
  journey_id uuid not null references import_journeys(id) on delete cascade,
  phase text not null,                    -- one of the canonical phase codes (§2.1)
  occurred_at timestamptz not null default now(),
  note_es text, note_en text,             -- optional human line ("Telex release emitido")
  doc_id uuid references trade_documents(id),  -- e.g. the BL that liberated
  recorded_by uuid references profiles(id),
  primary key (id)
);

-- The client-facing CIF snapshot (frozen at quote send; recomputed only on re-quote).
create table client_cif_snapshots (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid not null references quotes(id),
  fob_minor bigint not null, freight_minor bigint not null,
  insurance_minor bigint not null, duties_minor bigint default 0,
  handling_minor bigint default 0,
  cif_minor bigint not null,              -- fob+freight+insurance (server-computed)
  landed_minor bigint not null,           -- cif+duties+handling
  currency text not null default 'USD',
  computed_at timestamptz default now(),
  unique (quote_id)
);

-- Installment schedule. A plan against a contract — NOT a checkout.
create table payment_plans (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references brands(id),
  order_id uuid not null references orders(id),
  currency text not null default 'USD',
  total_minor bigint not null,
  status text not null default 'ACTIVE' check (status in ('ACTIVE','SETTLED','CANCELLED')),
  created_at timestamptz default now(),
  unique (order_id)
);

create table installments (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references payment_plans(id) on delete cascade,
  seq int not null,                       -- 1,2,3…
  label_es text not null, label_en text,  -- 'Anticipo' · 'Saldo contra BL' · 'Saldo contra entrega'
  amount_minor bigint not null,
  trigger_phase text,                     -- optional: due when journey hits this phase
  due_date date,
  status text not null default 'PENDING' check (status in ('PENDING','PAID','OVERDUE','WAIVED')),
  paid_at timestamptz,
  unique (plan_id, seq)
);

-- No-login client access. Mirror of the container-invite token model.
create table client_access_tokens (
  id uuid primary key default gen_random_uuid(),
  token text unique not null,             -- unguessable; delivered by WhatsApp/email
  order_id uuid not null references orders(id),
  scope text not null default 'IMPORT_TRACKER',
  expires_at timestamptz,                 -- optional; separate from quote validity
  revoked boolean not null default false,
  created_at timestamptz default now()
);
```

Audit triggers, RLS policies (ops write via `has_lane_role`; client read via
service‑role token resolution only — the client never holds a Supabase
session), and the CBM/CIF math live server‑side, same law as every TOWER table.

---

## 5 · Surfaces

### 5.1 TOWER (ops side — where updates happen)
Extend the existing Container Desk / order detail (already built under
`apps/tower/src/components/containers` and `.../pipeline`):
- **Milestone bar** on the order/container detail: one click per hito (freight
  booked · insured · BL liberated · handling · nationalized · delivered) →
  server action writes `journey_milestones` + advances `current_phase` + fires
  the notification. Reuses `transitionContainer` + `uploadDocument`.
- **Payment‑plan editor**: compose the installment schedule from a template,
  mark installments paid. Integer‑minor math, audit‑logged.
- **"Copy tracker link"**: issues/reveals the `client_access_tokens` link.

### 5.2 apps/site (client side — the tracker)
New route `/importacion/{token}` — a `/g/{token}` sibling:
- **Header:** route (origin → destino), incoterm, order ref.
- **CIF document** (behind G1): CIF composition as a `ManifestTable`‑style
  tabular‑mono breakdown — FOB · flete · seguro · (línea CIF) · aranceles ·
  manejo · **total puesto**. Numbers are brand assets (Prime Directive 5).
- **Live validity countdown** (`InviteActions` retargeted to `quote.valid_until`)
  when the quote is still `SENT`; on expiry → "Cotización vencida · renovar con
  Mister" CTA.
- **Phase tracker:** the ordered phase rail with the dated milestone timeline;
  current phase emphasized; future phases ghosted. `force-dynamic` + Realtime.
- **Payment ledger:** each installment — label, amount, due date, status chip
  (pendiente / pagado / vencido). Action = *"coordinar pago"* → WhatsApp. Never
  an on‑site payment form.
- **One primary action** per the skeleton law: *Hablar con Mister* / WhatsApp.

No new organs required beyond a `PhaseTracker` (candidate shared organ — run the
swap test) and a `PaymentLedger` block. `FillMeter` reused where the order rides
a shared container.

---

## 6 · Copy & compliance

- Spanish, no exclamation marks, technical/direct/trustworthy (site copy law).
- Wholesale‑language lint over every string: no "comprar / carrito / pagar
  ahora / checkout". Payment is *coordinado*, not transacted on‑site.
- ES + EN for every client‑facing label.
- `robots: noindex, nofollow` on the tracker (private, like `/g/{token}`).

---

## 7 · Phase 0 — decisions for Muaaz (gates before build)

Answer one at a time; each becomes law recorded here + in the relevant CLAUDE.md.

- **G1 · Pricing‑privacy exception (the big one).** May the private, tokenized,
  `noindex` per‑order tracker display the **absolute contracted CIF figure** to
  the client who received the quote? (Recommended: **yes** — it is a 1:1
  contract artifact, physically isolated from Mister's guardrails; §3.) If no →
  render CIF as a PDF download, page shows phases + countdown + payment status
  only.
- **G2 · Client access mechanism.** Tokenized no‑login link, mirroring
  `/g/{token}` (**recommended** — zero new auth, in the repo's grain), vs. real
  authenticated client accounts on `apps/site` (large — the site currently has
  *no auth*; introduces an external‑user identity system). Recommend token now,
  accounts later only if a client dashboard across many imports is wanted.
- **G3 · Home for the build.** This spec as a **new program** (recommended:
  `programs/quotation-intelligence/`, a wave layered on TOWER once it is
  production) vs. folding it into TOWER's own wave plan as "Wave 6".
- **G4 · Installment scope at launch.** Display‑only ledger (status set by ops
  in TOWER) at launch — **recommended** — vs. any payment‑provider integration
  (out of scope; TOWER v1 explicitly excludes an accounting ledger).
- **G5 · Phase model canon.** Ratify the nine canonical phases in §2.1 (codes
  are append‑only once shipped, like lane codes), and confirm which archetypes
  skip which phases.
- **G6 · Notification cadence.** Every phase pings the client, or only the
  headline hitos (aceptada · BL liberado · arribo · entregado)? Default:
  configurable per phase, headline hitos on by default.

## 8 · Definition of done (when built)

- [ ] Phase 0 (G1–G6) answered and recorded.
- [ ] New `tower` tables migrated with audit triggers + RLS (ops write / client
      read‑via‑token); non‑admin membership fixture test; Áladín isolation holds.
- [ ] Money is integer minor units end‑to‑end; CIF/landed math server‑only.
- [ ] Phase model is config‑driven (works for ≥2 archetypes without branching).
- [ ] Milestones append‑only + dated; TOWER ops actions fire them + notify.
- [ ] Tracker `/importacion/{token}`: `noindex`, `force-dynamic`, live countdown,
      Realtime phase tick, payment ledger, one primary action.
- [ ] Wholesale + no‑absolute‑price lints pass (public surfaces unchanged;
      absolute figure only on the tokenized page per G1).
- [ ] `PhaseTracker` passes the swap test against a second lane's livery.
- [ ] ES/EN complete.
