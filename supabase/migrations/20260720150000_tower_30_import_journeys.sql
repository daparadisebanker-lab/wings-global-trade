-- tower_30 · Quotation Intelligence — import-journey milestone + phase layer
-- (programs/quotation-intelligence/SPEC.md §2.1/§2.4; G1 ratified: the client sees
-- the REAL CIF figure, digitally signed by the committing rep). Additive only.
-- One client-facing journey per committed quote, its current phase DERIVED from
-- TOWER's underlying states + an append-only dated milestone log. Numbered
-- tower_30 to sit clear of the RB program's reserved tower_26–29.

set search_path to tower;

-- One journey per committed quote. current_phase is a derived cache (recomputed
-- server-side on every milestone); the milestone log is the event record while
-- quotes/orders/containers stay the system of record.
create table if not exists import_journeys (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references brands(id),
  lane_id  uuid not null references lanes(id),
  quote_id uuid not null references quotes(id),
  order_id uuid references orders(id),
  container_id uuid references containers(id),
  phase_set text not null default 'STANDARD_IMPORT',
  current_phase text not null default 'COTIZACION_RECIBIDA',
  incoterm text,
  -- G1: the committing rep's digital signature over the CIF snapshot. HMAC(rep,
  -- cif_minor, currency, signed_at) — unforgeable without the server secret, and
  -- tamper-evident: if the figure changes the signature no longer verifies.
  committed_by uuid references profiles(id) default auth.uid(),
  signature jsonb not null default '{}',   -- { signed_by, signed_at, cif_minor, currency, alg, sig }
  access_token text unique,                -- unguessable; the client tracker link (/importacion/{token})
  created_at timestamptz default now(),
  unique (quote_id)
);
create index if not exists import_journeys_lane_idx on import_journeys (lane_id, created_at desc);
create index if not exists import_journeys_order_idx on import_journeys (order_id);

-- Append-only dated timeline. Each hito is stamped by the rep who advanced it.
create table if not exists journey_milestones (
  id uuid primary key default gen_random_uuid(),
  journey_id uuid not null references import_journeys(id) on delete cascade,
  phase text not null,                    -- one of the canonical phase codes (SPEC §2.1)
  occurred_at timestamptz not null default now(),
  note_es text, note_en text,
  doc_id uuid references trade_documents(id),   -- e.g. the BL that liberated
  recorded_by uuid references profiles(id) default auth.uid(),
  created_at timestamptz default now()
);
create index if not exists journey_milestones_journey_idx on journey_milestones (journey_id, occurred_at);

-- Audit triggers (append-only worlds).
create trigger audit_import_journeys after insert or update or delete on import_journeys
  for each row execute function tower.audit_trigger();
create trigger audit_journey_milestones after insert or update or delete on journey_milestones
  for each row execute function tower.audit_trigger();

-- RLS: lane-scoped via has_lane_role (same shape as tower_23 costing).
alter table import_journeys enable row level security;
create policy journeys_read on import_journeys for select
  using ( has_lane_role(lane_id, array['LANE_DIRECTOR','TRADE_OPS','SALES','CATALOG_EDITOR','VIEWER']) );
create policy journeys_write on import_journeys for insert with check
  ( has_lane_role(lane_id, array['LANE_DIRECTOR','TRADE_OPS','SALES']) );
create policy journeys_update on import_journeys for update
  using ( has_lane_role(lane_id, array['LANE_DIRECTOR','TRADE_OPS','SALES']) )
  with check ( has_lane_role(lane_id, array['LANE_DIRECTOR','TRADE_OPS','SALES']) );

alter table journey_milestones enable row level security;
create policy milestones_read on journey_milestones for select
  using ( exists (select 1 from import_journeys j where j.id = journey_id
          and has_lane_role(j.lane_id, array['LANE_DIRECTOR','TRADE_OPS','SALES','CATALOG_EDITOR','VIEWER'])) );
create policy milestones_write on journey_milestones for insert with check
  ( exists (select 1 from import_journeys j where j.id = journey_id
          and has_lane_role(j.lane_id, array['LANE_DIRECTOR','TRADE_OPS','SALES'])) );

grant select, insert, update on import_journeys, journey_milestones to authenticated;
