-- TOWER Wave 4 · ai_drafts — the single reviewable-draft table (W4.B). Directive 7:
-- default DRAFT, confidence NOT NULL, nothing auto-commits. Reuses the existing
-- tower.has_brand_access() (migration 8) instead of B's duplicate helper.
set search_path to tower, public;

create table if not exists tower.ai_drafts (
  id          uuid primary key default gen_random_uuid(),
  kind        text not null check (kind in ('TRIAGE','LEAD_SCORE','SPEC_EXTRACT','WEEKLY_BRIEF')),
  ref_table   text,
  ref_id      uuid,
  brand_id    uuid not null references tower.brands(id),
  lane_id     uuid references tower.lanes(id),
  payload     jsonb not null default '{}',
  confidence  numeric not null default 0 check (confidence >= 0 and confidence <= 1),
  status      text not null default 'DRAFT' check (status in ('DRAFT','APPROVED','REJECTED')),
  model       text not null,
  created_by  uuid references tower.profiles(id),
  created_at  timestamptz not null default now(),
  reviewed_by uuid references tower.profiles(id),
  reviewed_at timestamptz
);

create index if not exists ai_drafts_lane_status_idx  on tower.ai_drafts (lane_id, status, created_at desc);
create index if not exists ai_drafts_brand_status_idx on tower.ai_drafts (brand_id, status, created_at desc);
create index if not exists ai_drafts_kind_status_idx  on tower.ai_drafts (kind, status);

alter table tower.ai_drafts enable row level security;

create policy ai_drafts_read on tower.ai_drafts for select using (
  case when lane_id is not null
    then tower.has_lane_role(lane_id, array['LANE_DIRECTOR','CATALOG_EDITOR','TRADE_OPS','SALES','VIEWER'])
    else tower.has_brand_access(brand_id) end
);
create policy ai_drafts_write on tower.ai_drafts for insert with check (
  case when lane_id is not null
    then tower.has_lane_role(lane_id, array['LANE_DIRECTOR','CATALOG_EDITOR','TRADE_OPS','SALES'])
    else tower.has_brand_access(brand_id) end
);
create policy ai_drafts_update on tower.ai_drafts for update using (
  case when lane_id is not null
    then tower.has_lane_role(lane_id, array['LANE_DIRECTOR','TRADE_OPS'])
    else tower.is_group_admin() end
);
-- No delete policy — append-only (Directive 4).

grant select, insert, update on tower.ai_drafts to authenticated;

-- F1: audit trigger (generic fn from migration 7).
drop trigger if exists audit_ai_drafts on tower.ai_drafts;
create trigger audit_ai_drafts
  after insert or update or delete on tower.ai_drafts
  for each row execute function tower.audit_trigger();
