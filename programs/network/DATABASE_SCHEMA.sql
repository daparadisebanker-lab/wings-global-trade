-- ============================================================
-- WINGS NETWORK — marketplace schema (Supabase / Postgres 15)
-- Project: wings-global-trade (pyznlglvwihosemqkhtq)
-- Run as ordered migrations. RLS on every table. Money = numeric.
-- ============================================================

create schema if not exists marketplace;
set search_path to marketplace, public;
create extension if not exists vector;
create extension if not exists pgcrypto;

-- ---------- ENUMS ----------
create type supplier_tier as enum ('listed','verified','network','corridor_partner');
create type verification_state as enum ('unverified','in_review','verified','suspended','revoked');
create type pipeline_stage as enum ('lead','applied','vetting','verified','active','suspended','churned');
create type category_state as enum ('closed','concierge','open');
create type consolidation_point as enum ('tacna','iquique');
create type container_state as enum ('open','filling','cutoff','consolidating','in_transit','arrived','delivered','cancelled');
create type slot_holder as enum ('buyer','supplier');
create type slot_state as enum ('reserved','confirmed','received','loaded','released');
create type publish_state as enum ('draft','pending_review','published','unpublished');
create type demand_source as enum ('request_form','mister_no_match');
create type archetype_lane as enum ('price_group','spec_technical','urgency','relationship_repeat','exploratory');
create type routing_branch as enum ('direct','network','near_match','no_match');
create type lead_outcome as enum ('routed','contacted','in_conversation','converted','expired','declined');
create type shipment_state as enum ('announced','received','inspected','loaded','in_transit','delivered','disputed','closed');
create type fee_type as enum ('consolidation','commission','subscription','service');
create type application_status as enum ('new','reviewing','accepted','rejected','waitlisted');

-- ---------- CORE: SUPPLIERS ----------
create table suppliers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  legal_name text,
  country char(2) not null,
  segment smallint check (segment between 1 and 4),
  tier supplier_tier not null default 'listed',
  verification_state verification_state not null default 'unverified',
  verification_expiry date,
  pipeline_stage pipeline_stage not null default 'lead',
  founder_cohort boolean not null default false,
  notion_page_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table supplier_contacts (
  id uuid primary key default gen_random_uuid(),
  supplier_id uuid not null references suppliers(id) on delete cascade,
  auth_user_id uuid unique references auth.users(id),
  name text not null,
  role text,
  whatsapp text,
  email text,
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);

create table applications (
  id uuid primary key default gen_random_uuid(),
  supplier_id uuid references suppliers(id),
  company_name text not null,
  contact_name text not null,
  email text not null,
  whatsapp text,
  country char(2),
  categories_text text[],
  catalog_url text,
  message text,
  status application_status not null default 'new',
  created_at timestamptz not null default now()
);

-- ---------- TAXONOMY & LOGISTICS ----------
create table categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name_es text not null,
  name_en text not null,
  state category_state not null default 'closed',
  reserved_line boolean not null default false,
  mister_routing_enabled boolean not null default false,
  created_at timestamptz not null default now()
);

create table lanes (
  id uuid primary key default gen_random_uuid(),
  consolidation_point consolidation_point not null,
  route text not null,                        -- e.g. 'iquique → la paz'
  schedule_note text,
  active boolean not null default true
);

create table containers (
  id uuid primary key default gen_random_uuid(),
  lane_id uuid not null references lanes(id),
  state container_state not null default 'open',
  capacity_cbm numeric(8,2) not null,
  cutoff_date date,
  opened_at timestamptz not null default now(),
  filled_at timestamptz
);

create table slots (
  id uuid primary key default gen_random_uuid(),
  container_id uuid not null references containers(id),
  holder_type slot_holder not null,
  holder_id uuid not null,                    -- supplier_id or buyer ref
  volume_cbm numeric(8,2) not null check (volume_cbm > 0),
  goods_ref text,
  state slot_state not null default 'reserved',
  created_at timestamptz not null default now()
);

-- fill % maintained by trigger; public hero reads the view, never joins
create or replace view containers_fill_view as
select c.id, c.lane_id, c.state, c.capacity_cbm, c.cutoff_date,
       coalesce(sum(s.volume_cbm) filter (where s.state <> 'released'),0) as filled_cbm,
       round(100 * coalesce(sum(s.volume_cbm) filter (where s.state <> 'released'),0)
             / c.capacity_cbm, 1) as fill_pct
from containers c left join slots s on s.container_id = c.id
group by c.id;

-- ---------- LISTINGS ----------
create table listings (
  id uuid primary key default gen_random_uuid(),
  supplier_id uuid not null references suppliers(id) on delete cascade,
  category_id uuid not null references categories(id),
  title text not null,
  spec jsonb not null default '{}',           -- blueprint spec-sheet payload
  lane_ids uuid[] not null default '{}',
  unit_cbm numeric(8,3),
  lead_time_days int,
  publish_state publish_state not null default 'draft',
  embedding vector(1024),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index listings_embedding_idx on listings using hnsw (embedding vector_cosine_ops);
create index listings_pub_cat_idx on listings (publish_state, category_id);

-- publish requires lane data + verified supplier + non-reserved open category
create or replace function enforce_publish_rules() returns trigger
language plpgsql security definer as $fn$
declare v_state verification_state; v_reserved boolean; v_cat category_state;
begin
  if new.publish_state = 'published' then
    select verification_state into v_state from suppliers where id = new.supplier_id;
    select reserved_line, state into v_reserved, v_cat from categories where id = new.category_id;
    if v_state <> 'verified' then raise exception 'supplier not verified'; end if;
    if v_reserved then raise exception 'reserved line: network listings blocked'; end if;
    if v_cat = 'closed' then raise exception 'category closed'; end if;
    if array_length(new.lane_ids,1) is null or new.unit_cbm is null then
      raise exception 'lane data required to publish'; end if;
  end if;
  return new;
end $fn$;
create trigger listings_publish_guard before insert or update on listings
for each row execute function enforce_publish_rules();

-- ---------- DEMAND & ROUTING ----------
create table demand_gaps (
  id uuid primary key default gen_random_uuid(),
  source demand_source not null,
  category_guess text,
  category_id uuid references categories(id),
  need_text text not null,
  need_embedding vector(1024),
  archetype_lane archetype_lane,
  volume_signal text,
  buyer_ref text,
  triaged boolean not null default false,
  created_at timestamptz not null default now()
);
create index demand_gaps_embedding_idx on demand_gaps using hnsw (need_embedding vector_cosine_ops);

create table routed_leads (
  id uuid primary key default gen_random_uuid(),
  buyer_ctx jsonb not null,
  archetype_lane archetype_lane not null,
  need_summary text not null,
  branch routing_branch not null,
  supplier_id uuid references suppliers(id),
  tier_at_route supplier_tier,
  candidates_considered uuid[] not null default '{}',
  outcome lead_outcome not null default 'routed',
  outcome_at timestamptz,
  created_at timestamptz not null default now(),
  constraint network_needs_supplier check (branch <> 'network' or supplier_id is not null)
);

-- ---------- MOVEMENT & MONEY ----------
create table shipments (
  id uuid primary key default gen_random_uuid(),
  supplier_id uuid not null references suppliers(id),
  slot_ids uuid[] not null,
  declared_value numeric(14,2) not null check (declared_value >= 0),
  currency char(3) not null default 'USD',
  state shipment_state not null default 'announced',
  inspection_result jsonb,
  created_at timestamptz not null default now()
);

create table fee_events (
  id uuid primary key default gen_random_uuid(),
  supplier_id uuid not null references suppliers(id),
  shipment_id uuid references shipments(id),
  type fee_type not null,
  amount numeric(14,2) not null,
  currency char(3) not null default 'USD',
  memo text,
  created_at timestamptz not null default now()
);  -- IMMUTABLE: no update/delete grants; statements are projections

create table verification_events (
  id uuid primary key default gen_random_uuid(),
  supplier_id uuid not null references suppliers(id),
  level smallint not null check (level between 1 and 3),
  result text not null,
  evidence_url text,
  actor text not null,
  created_at timestamptz not null default now()
);

create table performance_scores (
  supplier_id uuid primary key references suppliers(id) on delete cascade,
  dispute_rate numeric(5,4) not null default 0,
  lead_response_hrs numeric(7,2),
  doc_quality numeric(3,2),
  updated_at timestamptz not null default now()
);

create table flags (
  key text primary key,
  enabled boolean not null default false,
  payload jsonb not null default '{}'
);
insert into flags(key,enabled) values
 ('network_catalog',false),('portal',false),('stripe_billing',false);

-- ---------- STATE-TRANSITION AUDIT (shared) ----------
create table state_transitions (
  id bigint generated always as identity primary key,
  table_name text not null, row_id uuid not null,
  from_state text, to_state text not null,
  actor text not null default current_user,
  created_at timestamptz not null default now()
);
create or replace function log_transition() returns trigger language plpgsql as $fn$
begin
  if (tg_table_name='containers' and old.state is distinct from new.state) then
    insert into state_transitions(table_name,row_id,from_state,to_state)
    values ('containers', new.id, old.state::text, new.state::text);
  elsif (tg_table_name='shipments' and old.state is distinct from new.state) then
    insert into state_transitions(table_name,row_id,from_state,to_state)
    values ('shipments', new.id, old.state::text, new.state::text);
  elsif (tg_table_name='suppliers' and old.verification_state is distinct from new.verification_state) then
    insert into state_transitions(table_name,row_id,from_state,to_state)
    values ('suppliers', new.id, old.verification_state::text, new.verification_state::text);
  end if;
  return new;
end $fn$;
create trigger containers_audit after update on containers for each row execute function log_transition();
create trigger shipments_audit  after update on shipments  for each row execute function log_transition();
create trigger suppliers_audit  after update on suppliers  for each row execute function log_transition();

-- ---------- MATCHING RPC (Mister tool; filters BEFORE vectors) ----------
create or replace function match_supply(
  p_embedding vector(1024), p_category uuid, p_lane uuid, p_min_tier supplier_tier default 'network', p_limit int default 5
) returns table (listing_id uuid, supplier_id uuid, supplier_name text, tier supplier_tier, title text, spec jsonb, similarity float)
language sql stable security definer as $fn$
  select l.id, s.id, s.name, s.tier, l.title, l.spec,
         1 - (l.embedding <=> p_embedding) as similarity
  from listings l join suppliers s on s.id = l.supplier_id
  join categories c on c.id = l.category_id
  where l.publish_state = 'published'
    and s.verification_state = 'verified'
    and s.tier >= p_min_tier
    and c.id = p_category and c.state = 'open' and c.reserved_line = false
    and c.mister_routing_enabled = true
    and (p_lane is null or p_lane = any(l.lane_ids))
  order by similarity desc
  limit p_limit;
$fn$;

-- ---------- RLS ----------
alter table suppliers          enable row level security;
alter table supplier_contacts  enable row level security;
alter table applications       enable row level security;
alter table listings           enable row level security;
alter table routed_leads       enable row level security;
alter table shipments          enable row level security;
alter table fee_events         enable row level security;
alter table slots              enable row level security;
alter table demand_gaps        enable row level security;
alter table verification_events enable row level security;
alter table performance_scores enable row level security;
alter table categories         enable row level security;
alter table lanes              enable row level security;
alter table containers         enable row level security;
alter table flags              enable row level security;

create or replace function current_supplier_id() returns uuid
language sql stable security definer as
$fn$ select supplier_id from marketplace.supplier_contacts where auth_user_id = auth.uid() $fn$;

-- Public read (anon): taxonomy, lanes, fill view, published listings
create policy pub_categories on categories for select using (true);
create policy pub_lanes      on lanes      for select using (true);
create policy pub_containers on containers for select using (true);
create policy pub_listings   on listings   for select using (publish_state = 'published');
create policy pub_flags      on flags      for select using (true);

-- Anyone may apply / file a request (insert-only)
create policy ins_applications on applications for insert with check (true);
create policy ins_demand      on demand_gaps  for insert with check (true);

-- Supplier self-scope (portal)
create policy self_supplier   on suppliers   for select using (id = current_supplier_id());
create policy self_contacts   on supplier_contacts for select using (supplier_id = current_supplier_id());
create policy self_listings   on listings    for all    using (supplier_id = current_supplier_id())
                                             with check (supplier_id = current_supplier_id());
create policy self_leads      on routed_leads for select using (supplier_id = current_supplier_id());
create policy self_shipments  on shipments   for select using (supplier_id = current_supplier_id());
create policy self_fees       on fee_events  for select using (supplier_id = current_supplier_id());
create policy self_scores     on performance_scores for select using (supplier_id = current_supplier_id());
create policy self_slots      on slots for select using (holder_type='supplier' and holder_id = current_supplier_id());
-- Everything else: service-role only (no policy = denied). fee_events has NO
-- update/delete policy for any role → immutable by construction.

-- updated_at maintenance
create or replace function touch_updated_at() returns trigger language plpgsql as
$fn$ begin new.updated_at = now(); return new; end $fn$;
create trigger suppliers_touch before update on suppliers for each row execute function touch_updated_at();
create trigger listings_touch  before update on listings  for each row execute function touch_updated_at();
