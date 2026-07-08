# CONTENEDOR COMPARTIDO — Feature + Go-to-Market Specification
## Wings Global Trade · Mister AI · "Trae tu Grupo"

> **Purpose of this document:** Complete, execution-ready specification for the shared-container feature system. Written for consumption by the Claude Code pipeline (wings-global-trade project). Covers product rationale, data model, Mister conversation changes, UI/UX architecture, trust design, the public slot marketplace, landing page system, campaign automation, and phased rollout.
>
> **Constraint:** This spec extends the existing Wings Global Trade platform (Next.js / Supabase / Vercel) and the existing Mister lane architecture. It does not replace any current flow. All Mister changes are additive lanes/branches.

---

## 0. THE INSIGHT (source of truth for every decision below)

Direct customer feedback, verbatim intent:

1. Wholesale machinery buyers often cannot fill a container alone. They coordinate informally — with 1–3 known partners, usually in a WhatsApp group — to share a full-container-load (FCL) import.
2. The informal version has structural trust problems: who holds the money, who is liable, how costs split by cargo volume.
3. Buyers address foreign traders/importers as **"oiga, mister"** — the product name maps to an existing social role.
4. The buying unit already lives in WhatsApp groups. Acquisition must meet it there — via **pull (shareable invite link)**, never push (WhatsApp API cannot read group membership; unsolicited outbound violates WhatsApp Business policy and risks Ley 29733 exposure).

**Product thesis:** Wings productizes container coordination. The buyer's relationship is always with Wings, never with the other buyers. Wings supplies the trust the informal version lacks — transparent CBM-proportional cost allocation, deposit-secured slots, published fallback rules, milestone tracking.

**Two anchor phrases (canonical brand language, do not paraphrase):**
- **"Trae tu grupo"** — the feature name, CTA, and campaign hook for private groups.
- **"Oiga, Mister"** — the campaign hook and voice register for Mister-led creative.

---

## 1. PRODUCT OVERVIEW

### 1.1 The two container modes (one data model, two acquisition modes)

| | **Grupo Privado ("Trae tu grupo")** | **Cupos Públicos (open slots)** |
|---|---|---|
| Initiated by | A container lead inside Mister | Wings (or auto-opened from an unfilled private group) |
| Members | Lead's known partners via invite link | Strangers, deposit-to-claim |
| Trust source | Existing relationship + Wings structure | Wings structure only (stronger guarantees) |
| Visibility between members | Full group workspace by default | Aggregate fill only; identity private by default |
| Marketing role | Viral loop (every invite = organic signup) | Perishable slot campaigns with price + deadline |
| Phase | **Phase 1 (MVP)** | **Phase 2** |

**The hybrid rule (elegant and mandatory):** a private group container that has not filled by `soft_deadline` can — with the lead's one-tap consent — open its remaining slots publicly. The committed group becomes the social proof in the public ad: *"5 cupos tomados por un grupo de Arequipa. Quedan 5."*

### 1.2 Core loop

```
Mister diagnosis → "¿Importas solo o compartido?" 
  → COMPARTIDO → create/join container → claim slot (deposit in Phase 2)
  → container fills → Wings closes booking → milestones tracked
  → every milestone pushed to each member via WhatsApp template
  → arrival at Tacna/Iquique → clearance → delivery/pickup per member
  → post-import: "¿Siguiente contenedor?" re-engagement
```

### 1.3 What Wings monetizes

- Coordination margin priced into the per-slot importation price (all-in, single number).
- Deposit float discipline (Phase 2) — deposits held by Wings, not between buyers.
- Repeat-import velocity: groups that import once import again; the group workspace is the retention surface.

---

## 2. DATA MODEL (Supabase / Postgres)

> RLS on every table. Members see their own rows + aggregate container state. Leads additionally see member fill status (not payment details of others unless the group opts into transparency). Wings admin role sees all. Never expose service key client-side.

```sql
-- ============================================================
-- CONTAINERS
-- ============================================================
create type container_mode as enum ('private_group', 'public_slots', 'hybrid');
create type container_status as enum (
  'draft',          -- lead configuring
  'filling',        -- open for members/claims
  'soft_deadline',  -- fill deadline near; hybrid-open decision point
  'closed',         -- fully committed, booking in progress
  'booked',         -- carrier booking confirmed
  'sailed',
  'arrived',        -- at Tacna / Iquique FTZ
  'cleared',        -- customs/FTZ clearance done
  'delivered',      -- all member cargo released
  'cancelled'       -- fallback executed
);
create type fallback_policy as enum (
  'wings_tops_up',   -- Wings fills remaining CBM with own inventory
  'extend_once',     -- one deadline extension, then refund
  'refund'           -- full deposit refund
);

create table containers (
  id uuid primary key default gen_random_uuid(),
  mode container_mode not null default 'private_group',
  status container_status not null default 'draft',
  route_origin text not null,               -- e.g. 'Ningbo, CN'
  route_destination text not null,          -- 'Tacna FTZ' | 'Iquique FTZ'
  container_type text not null default '40HC',
  total_cbm numeric(6,2) not null,          -- usable CBM
  total_slots int not null,                 -- marketing unit (e.g. 10)
  cbm_per_slot numeric(6,2) not null,       -- total_cbm / total_slots baseline
  slot_price_usd numeric(10,2) not null,    -- ALL-IN importation price per slot
  price_includes jsonb not null,            -- ['flete','seguro','zona franca','despacho'] — rendered verbatim on landing page
  fill_deadline timestamptz not null,
  fallback fallback_policy not null default 'extend_once',
  lead_user_id uuid references auth.users,  -- null for Wings-initiated public containers
  hybrid_opened_at timestamptz,             -- when private group opened remaining slots
  landing_slug text unique,                 -- public landing page (Phase 2 / hybrid)
  created_at timestamptz default now()
);

-- ============================================================
-- MEMBERSHIP & SLOTS
-- ============================================================
create type member_role as enum ('lead', 'member');
create type slot_status as enum (
  'invited',        -- invite link opened, not yet onboarded
  'joined',         -- account created via WhatsApp opt-in
  'reserved',       -- slot held (deposit pending in Phase 2)
  'committed',      -- deposit paid / contract signed
  'paid_in_full',
  'released'        -- member exited before commitment
);

create table container_members (
  id uuid primary key default gen_random_uuid(),
  container_id uuid not null references containers,
  user_id uuid not null references auth.users,
  role member_role not null default 'member',
  slot_status slot_status not null default 'joined',
  slots_claimed int not null default 1,          -- one member may take multiple slots
  cbm_allocated numeric(6,2),                    -- actual, may differ from baseline
  cargo_description text,                        -- machinery item(s)
  cost_share_usd numeric(10,2),                  -- CBM-proportional, recomputed on allocation change
  deposit_usd numeric(10,2) default 0,
  visibility_opt_in boolean default false,       -- strangers: show identity to group?
  whatsapp_opted_in_at timestamptz,              -- compliance anchor — REQUIRED before any template send
  joined_via_invite_id uuid,
  created_at timestamptz default now(),
  unique (container_id, user_id)
);

-- ============================================================
-- INVITATIONS (the "Trae tu grupo" mechanic)
-- ============================================================
create table container_invites (
  id uuid primary key default gen_random_uuid(),
  container_id uuid not null references containers,
  created_by uuid not null references auth.users,
  token text unique not null,               -- short, unguessable, in the share URL
  max_uses int,                             -- null = until container fills
  uses int not null default 0,
  expires_at timestamptz,
  created_at timestamptz default now()
);

-- Attribution: every invite open/join is an acquisition event
create table invite_events (
  id uuid primary key default gen_random_uuid(),
  invite_id uuid not null references container_invites,
  event text not null check (event in ('opened','wa_started','account_created','slot_reserved')),
  user_id uuid,                             -- null until account exists
  created_at timestamptz default now()
);

-- ============================================================
-- MILESTONES & PAYMENTS
-- ============================================================
create table container_milestones (
  id uuid primary key default gen_random_uuid(),
  container_id uuid not null references containers,
  milestone container_status not null,
  occurred_at timestamptz not null default now(),
  note text,
  document_url text                          -- BL, packing list, clearance docs
);

create table member_payments (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references container_members,
  kind text not null check (kind in ('deposit','balance','adjustment','refund')),
  amount_usd numeric(10,2) not null,
  status text not null check (status in ('pending','confirmed','refunded')),
  proof_url text,                            -- transfer receipt upload (Phase 1: manual confirm)
  created_at timestamptz default now()
);

-- ============================================================
-- DOCUMENTS (per-member slice of the shared import)
-- ============================================================
create table member_documents (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references container_members,
  doc_type text not null,                    -- 'factura','packing','poder','ficha_ruc', ...
  url text not null,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz default now()
);
```

**Cost allocation function (server-side, single source of truth):**
`cost_share_usd = slot_price_usd × slots_claimed`, with an adjustment line when `cbm_allocated` exceeds `cbm_per_slot × slots_claimed` (overage billed at a published per-CBM rate). Recompute and notify on any allocation change. Never compute allocation client-side.

**Legal flag (resolve before build):** importer-of-record structure for a shared container through the FTZ — one consolidated Wings import with internal allocation vs. per-member declarations — changes the documents table requirements and the contract templates. Confirm with the customs broker; the schema above supports both (docs are per-member either way).

---

## 3. MISTER CONVERSATION CHANGES (additive lane)

### 3.1 The fork

Inserted at the point of confirmed purchase intent inside the existing needs-diagnosis, before WhatsApp handoff:

> **Mister:** «Perfecto. Para este pedido, ¿vas a importar solo o compartido? Un contenedor compartido baja tu precio de importación — tú traes tu grupo, o te sumamos a un contenedor que ya está en marcha.»
>
> Quick replies: **[Solo]** **[Con mi grupo]** **[Súmame a uno]** *(third option Phase 2 only)*

- **Solo** → existing lane, unchanged.
- **Con mi grupo** → container creation micro-flow (3.2).
- **Súmame a uno** → open-slot browse (3.3, Phase 2).

### 3.2 "Trae tu grupo" creation flow (lead)

Mister collects, conversationally, one question at a time:
1. Cargo: what machinery, rough volume (Mister estimates CBM from catalog data — never asks the buyer to know CBM).
2. Group size: «¿Con cuántos socios más? Te preparo los cupos.»
3. Wings proposes the container config: route, total slots, per-slot all-in price, fill deadline, fallback policy — as a single card the lead confirms.
4. On confirm → container created (`filling`) → Mister returns the **invite link with rich preview** and the exact share script:

> «Listo. Pásale esto a tu grupo — cada uno entra con su propio cupo y su propia cuenta:»
> `wings.trade/g/{token}`
> «Cuando toquen el enlace, yo mismo los recibo por WhatsApp.»

### 3.3 Member onboarding (invitee, WhatsApp-first — this IS the opt-in)

Invite link → landing preview (see §5.2) → single CTA opens `wa.me/{wings_number}?text=Hola Mister, quiero mi cupo en el contenedor {short_code}`.

The user sending that message **is** the WhatsApp opt-in (`whatsapp_opted_in_at` set). Mister then, in ≤3 exchanges:
1. «¡Hola! Bienvenido al contenedor de {lead_name} — {route}, cierra el {date}. ¿Qué máquina traes tú?»
2. Cargo captured → CBM estimated → «Tu cupo: hasta {cbm} m³, precio de importación todo incluido: ${price}.»
3. Account creation via magic link → slot `reserved` → member lands in the group workspace.

**Voice register (system-prompt note, canonical):** Mister speaks like the "oiga, mister" counterpart — direct, street-fluent, knows prices, never corporate, never translated startup-speak. Respectful *usted* by default, drops to *tú* if the buyer does. Short sentences. Numbers early.

### 3.4 Mister as ongoing group agent

Post-fill, Mister handles per-member queries in the same WhatsApp thread: «¿Dónde está el contenedor?», «¿Cuánto me falta pagar?», «Sube tu factura aquí». Each answer reads that member's rows only — Mister never discloses another member's payment status.

---

## 4. UI/UX ARCHITECTURE

> **Surface priority: mobile-first, aggressively.** This audience lives in WhatsApp on Android. Desktop is secondary (lead reviewing documents). Every flow below must be completable one-handed on a mid-range Android over 4G. Skeleton screens, optimistic UI, offline-tolerant reads.

### 4.1 Experience principles (decision rules for every screen)

1. **WhatsApp is the front door; the platform is the ledger.** Never force the platform when WhatsApp can carry the step. The web app is where truth lives (allocations, documents, payments); WhatsApp is where events arrive.
2. **One number rules every screen: the all-in price.** `$X — todo incluido` appears before any detail. Cost opacity is the incumbent's moat; price clarity is the entire UX thesis.
3. **The fill meter is the hero element.** Container state is always shown as a physical metaphor: a horizontal container silhouette filling left-to-right, segmented by slots. Claimed = solid, reserved = hatched, open = outline. This one component appears on the landing page, the group workspace, the ad creative, and the invite preview — identical everywhere. It is the brand's most reusable asset.
4. **Progressive disclosure of complexity.** CBM, overage rates, fallback policy exist one tap below the surface — present, honest, never in the first screen's way.
5. **Trust is a UI layer, not a paragraph.** Deposit protection, the fallback rule, and "tu contrato es con Wings, no con los demás compradores" render as three fixed badges, not buried terms.
6. **Privacy asymmetry by mode.** Private groups: members visible to each other by default. Public slots: aggregate only («7 compradores confirmados»), identity opt-in. The same workspace template, one visibility flag.

### 4.2 Screen inventory

#### A. Invite Landing (`/g/{token}`) — the highest-leverage screen in the system
The invitee arrives from a WhatsApp tap with borrowed trust from the lead. Do not spend it.

- **Above the fold (one screen, no scroll needed to act):** lead's name + avatar («{Lead} te invita a su contenedor»), route line with flag icons, fill meter, `${price} — todo incluido por cupo`, deadline countdown, single full-width CTA: **«Tomar mi cupo por WhatsApp»**.
- Below fold: what the price includes (checklist, verbatim from `price_includes`), the three trust badges, «¿Cómo funciona?» in 3 illustrated steps, FAQ accordion.
- **No account wall, no form, no email field.** The CTA goes straight to WhatsApp — the platform account is created *inside* the Mister conversation, after intent is proven. Every field on this page before the WhatsApp tap is a conversion leak.
- OG/preview meta: the link unfurls in WhatsApp showing the fill meter image, route, and price — the preview card does half the selling before the tap. Generate the OG image server-side per container (fill state baked in, regenerated on state change).

#### B. Group Workspace (`/contenedor/{id}`) — the shared source of truth
Mobile layout, top to bottom:
1. **Container header:** route, status pill, fill meter, deadline.
2. **Milestone timeline:** horizontal stepper (Cerrado → Zarpó → Llegó a Tacna → Nacionalizado → Entregado), current step pulsing. Each completed step expands to its document (BL, clearance) — read-only for members.
3. **«Mi cupo» card (member-scoped):** their cargo, CBM used vs. allotted, their cost share broken into included lines, payment progress bar, pending document chips with upload CTA. This card is *theirs*; it never shows other members' financials.
4. **Members strip:** avatars + slot count (private mode) or anonymized count (public mode). Lead sees per-member fill status here.
5. **Persistent footer action:** «Hablar con Mister» → deep-links back into the WhatsApp thread with container context. The platform never traps the user away from the channel they trust.

Desktop: same modules, two-column (timeline + members left, «Mi cupo» right). No desktop-only features — parity by simplification.

#### C. Lead Console (lead role only, extra tab in the workspace)
- Slot grid: who's invited / joined / reserved / committed per slot; resend-invite per pending slot (regenerates the WhatsApp share text, does not message anyone directly).
- **The soft-deadline decision moment:** when the fill deadline nears with open slots, the console surfaces one card: «Te faltan {n} cupos. ¿Abrimos los cupos restantes al público?» → one tap flips mode to `hybrid`, generates the public landing, and notifies the lead of the privacy change. This is the single most consequential UI moment in the system — it must be one decision, one tap, fully reversible until the first stranger commits.

#### D. Public Slot Landing (`/c/{landing_slug}`) — Phase 2, the perishable campaign target
Same skeleton as the invite landing, with the trust load inverted (no lead endorsement to borrow):
- Social proof block replaces the lead header: «{n} compradores ya confirmados» + committed-CBM bar; in hybrid mode, «{n} cupos tomados por un grupo de {city}».
- Deposit mechanics explicit above the fold: «Reserva tu cupo con ${deposit}. Si el contenedor no cierra: {fallback in plain words}.»
- CTA identical pattern: WhatsApp-first. Deposit is requested by Mister *after* diagnosis confirms the cargo fits — never a payment form on the landing page cold. (Phase 2 payment: manual transfer + proof upload with Mister confirmation; gateway integration is Phase 3.)
- Countdown + slots-remaining are live (revalidated ≤60s). A stale «Quedan 3» that's actually full destroys the trust the whole page exists to build.

#### E. Container Marketplace (`/contenedores`) — Phase 2
Card list of open containers: route, fill meter, price, deadline. Filter by destination FTZ and machinery category. Each card → its landing. Deliberately austere — this is a shelf, not a feed.

### 4.3 Visual system notes
Extend the existing Wings brand system — do not invent a parallel one. Typography per the established stack (Cormorant Garamond display / DM Mono for numbers, prices, CBM, countdowns / DM Sans UI). All prices, deadlines, and meter labels in DM Mono: data should *look* like data — precision is the aesthetic argument for trust. Warm paper ground, restrained accent for the fill meter's claimed state. Motion: the fill meter animates on load (segments filling sequentially, ~400ms total, ease-out) — the one moment of theater, everywhere else clinical.

### 4.4 UX edge cases (must be designed, not discovered)
- **Invite link forwarded beyond the group:** by design this is fine (viral loop), but the lead can cap `max_uses` and revoke the token; a revoked link's landing shows «Este contenedor ya cerró su grupo» + CTA to browse open containers (Phase 2) or talk to Mister.
- **Container fills while an invitee is mid-onboarding:** Mister handles it in-thread: «Se llenó justo antes de que confirmes. Te reservo prioridad en el siguiente a {destination} — ¿te aviso?» → waitlist row, re-engagement asset.
- **Member exits before commitment:** slot returns to open; group notified via workspace (not WhatsApp blast); lead prompted to re-share.
- **Allocation overage discovered at packing:** adjustment line item appears on «Mi cupo» with Mister proactively explaining it in-thread *before* the member sees an unexplained number.
- **Two members claim the last slot concurrently:** server-side slot reservation with row lock; loser gets the waitlist script above.

---

## 5. GO-TO-MARKET LAYER

### 5.1 Three campaign lanes (folds into the ads program)
This feature adds a campaign lane with a rhythm the brand/category lanes don't have. (The original meta-ads-program it extended was deleted 2026-07-08; these lanes fold into its replacement when that program is written.)

| Lane | Rhythm | Hook |
|---|---|---|
| Brand / category | Always-on | The base ads program |
| **«Trae tu grupo»** | Always-on | The behavior buyers already have: importing in group |
| **Slot campaigns** | **Perishable** — launched per container, dead at close | «Quedan {n} de {total} cupos · ${price} todo incluido · cierra {date}» |

### 5.2 Slot campaign anatomy (per open container)
- **Creative:** the fill meter IS the ad. Static + 6s animated version (meter filling to current state, countdown ticking). Headline: «Oiga, Mister — ¿queda cupo?» / body: route, price, deadline. Formats: 1:1 feed, 9:16 Reels/Stories, 4:5.
- **Audience:** the archetype(s) mapped to that container's machinery category (from the archetype × category matrix) + retargeting stack (site visitors, Mister-abandoners, waitlist members, past importers).
- **Objective:** conversions on the landing's WhatsApp CTA (CAPI event `wa_started` with container_id).
- **Kill rule:** campaign auto-pauses at `closed` status or deadline — never advertise a full container.

### 5.3 Automation pipeline (n8n)
```
Trigger: container.status → 'filling' (or 'hybrid')
  1. Generate landing page (slug, OG image with live fill state)
  2. Clone Meta campaign template → inject route, price, deadline, category audience
  3. Post launch summary to ops channel
Trigger: fill-state change
  4. Regenerate OG image; update ad creative variant if meter crossed 50% / 80%
     (80%+ is the strongest urgency creative: «Últimos {n} cupos»)
Trigger: container closed/cancelled
  5. Pause campaign, archive landing to «Contenedor cerrado» state with
     waitlist CTA, log final CAC per slot
```

### 5.4 Measurement additions (KPI tree extension)
- **Viral coefficient:** invites sent → `wa_started` → accounts created per container (from `invite_events`). Target: every private container creates ≥2 net-new accounts.
- **Slot economics:** ad spend per slot filled, per container; compare private-viral vs. paid-public acquisition cost.
- **Fill velocity:** days from `filling` → `closed`, by route and category — feeds deadline-setting and how many containers to open concurrently.
- **Trust proxy:** landing → WhatsApp CTA rate (invite landing should run far above public landing; if public converges toward private, the trust UI is working).

---

## 6. PHASED ROLLOUT

**Phase 1 — «Trae tu grupo» MVP** (private groups only)
Mister fork + creation flow · invite link + WhatsApp opt-in onboarding · group workspace (header, timeline, Mi cupo, members) · lead console minus hybrid toggle · manual payments (transfer + proof) · milestone WhatsApp templates · invite attribution events.
*Exit criteria:* 3 real containers filled end-to-end; viral coefficient measured; legal structure with customs broker confirmed.

**Phase 2 — Public slots + hybrid**
Deposit-to-claim (manual confirm) · public landings + marketplace shelf · hybrid one-tap open · slot campaign n8n pipeline · waitlists · «Súmame a uno» lane in Mister.

**Phase 3 — Scale mechanics**
Payment gateway · automated CBM estimation from catalog + photos · per-CBM overage automation · route-level demand forecasting from waitlist + fill-velocity data · matchmaking suggestions («hay un contenedor a Iquique al 60% con tu categoría»).

---

## 7. OPEN DECISIONS (surface to founder before build)
1. **Importer of record** for shared containers through Tacna/Iquique — consolidated vs. per-member declaration (customs broker).
2. **Deposit amount logic** — flat per slot vs. % of slot price; and the chosen `fallback_policy` default (recommend `extend_once` for launch: least capital risk, honest to buyers).
3. **Chile/Bolivia buyers** — the FTZ routes imply cross-border demand; if in scope, landing pages need CLP/BOB price display and geo-targeted slot campaigns.
4. **Overage per-CBM rate** — must be published on every landing before the first container opens.
