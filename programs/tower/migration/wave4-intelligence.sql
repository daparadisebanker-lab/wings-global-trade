-- TOWER · Wave 4 (W4.B Intelligence engine) · PROPOSED SQL — artifact only.
-- NOT APPLIED by this agent. The Conductor reviews, adds the standard audit
-- trigger, and applies all DB changes (per the build brief:
-- "Do NOT write to Supabase/apply DDL; propose ... and FLAG it").
--
-- This file proposes ONE new table — tower.ai_drafts — plus its RLS + grants.
-- It is the single home for every AI output in TOWER: triage classifications,
-- lead scores, spec extractions, and weekly lane briefs. Directive 7 (core law)
-- is encoded in the schema: `status DRAFT|APPROVED|REJECTED` with a default of
-- DRAFT, and `confidence` NOT NULL — nothing can auto-commit, and the reviewer
-- always sees the confidence. Approval is a human server action
-- (lib/actions/intelligence.ts) that applies the payload to the real record and
-- flips status to APPROVED.
--
-- ── FLAGS FOR THE CONDUCTOR ─────────────────────────────────────────────────
--  F1 · AUDIT TRIGGER (Directive 4): every mutating table gets the generic
--       `tower.audit_trigger()` before it gets a UI. This file does NOT attach
--       it (the trigger fn lives in the Conductor's audit migration, per
--       wave3-hooks.sql's identical flag). Attach after applying:
--         create trigger ai_drafts_audit
--           after insert or update or delete on tower.ai_drafts
--           for each row execute function tower.audit_trigger();
--
--  F2 · BRAND-SCOPED DRAFTS (lane_id NULL). Lead-score drafts reference an
--       account, which is brand-scoped, not lane-scoped — so their `lane_id` is
--       NULL and the lane-role RLS below cannot see them. This file adds a
--       `tower.has_brand_membership(brand)` helper and a brand-level read/write
--       branch for NULL-lane rows. If the Conductor prefers to attribute a
--       lead-score draft to a representative lane instead, drop the brand branch
--       and make lane_id NOT NULL — but then the score route must choose a lane.
--
--  F3 · WHO MAY CREATE vs. REVIEW. Proposed split below: any working lane role
--       (LANE_DIRECTOR/TRADE_OPS/SALES/CATALOG_EDITOR) may CREATE a draft (the
--       endpoints run as the authenticated user); only LANE_DIRECTOR/TRADE_OPS
--       (or group admin) may UPDATE (approve/reject). Tighten per the group's
--       real review policy. No DELETE policy and no DELETE grant — drafts are
--       append-only history like every other TOWER world (Directive 4); a
--       rejected draft is retained, never removed.
--
--  F4 · The approve* actions ALSO write the target record (rfqs / accounts /
--       products). Those tables' own RLS (Wave 2/3) is the gate for that write —
--       this file does not re-grant them. A reviewer who can approve a triage
--       draft but lacks SALES/LANE_DIRECTOR on the target RFQ's lane will have
--       the rfqs UPDATE refused; that is correct (RLS is the permission system),
--       and the action surfaces FORBIDDEN_LANE.

set search_path to tower, public;

-- ============================================================
-- 0 · Brand-membership RLS helper (F2)
-- ============================================================
-- Mirrors has_lane_role's security-definer shape (DATABASE_SCHEMA.sql). True if
-- the caller is group admin, or holds ANY membership on ANY lane of the brand.
create or replace function tower.has_brand_membership(p_brand uuid) returns boolean
language sql stable security definer as
$$ select tower.is_group_admin() or exists (
     select 1
       from tower.lane_memberships m
       join tower.lanes l on l.id = m.lane_id
      where m.user_id = auth.uid() and l.brand_id = p_brand) $$;

grant execute on function tower.has_brand_membership(uuid) to authenticated;

-- ============================================================
-- 1 · tower.ai_drafts — the reviewable-draft table
-- ============================================================
create table if not exists tower.ai_drafts (
  id          uuid primary key default gen_random_uuid(),
  kind        text not null check (kind in ('TRIAGE','LEAD_SCORE','SPEC_EXTRACT','WEEKLY_BRIEF')),
  -- The real table + row a draft applies to on approval (rfqs | accounts |
  -- products | lanes | null). Polymorphic, like tower.tasks.ref_table/ref_id.
  ref_table   text,
  ref_id      uuid,
  brand_id    uuid not null references tower.brands(id),
  lane_id     uuid references tower.lanes(id),           -- NULL for brand-scoped drafts (F2)
  payload     jsonb not null default '{}',               -- the confidence-scored draft body
  confidence  numeric not null default 0 check (confidence >= 0 and confidence <= 1),
  status      text not null default 'DRAFT'
                check (status in ('DRAFT','APPROVED','REJECTED')),
  model       text not null,                             -- e.g. claude-haiku-4-5-20251001 | claude-sonnet-5
  created_by  uuid references tower.profiles(id),
  created_at  timestamptz not null default now(),
  reviewed_by uuid references tower.profiles(id),
  reviewed_at timestamptz
);

-- Review queues read pending drafts by lane/kind, newest first.
create index if not exists ai_drafts_lane_status_idx  on tower.ai_drafts (lane_id, status, created_at desc);
create index if not exists ai_drafts_brand_status_idx on tower.ai_drafts (brand_id, status, created_at desc);
create index if not exists ai_drafts_kind_status_idx  on tower.ai_drafts (kind, status);

-- ============================================================
-- 2 · RLS (F2/F3) — lane-scoped rows via has_lane_role; NULL-lane
--     (brand-scoped) rows via has_brand_membership.
-- ============================================================
alter table tower.ai_drafts enable row level security;

-- READ — any working/viewer lane role on the draft's lane, OR (NULL lane) any
-- membership in the brand. Group admin passes through both helpers.
create policy ai_drafts_read on tower.ai_drafts for select using (
  case
    when lane_id is not null then
      has_lane_role(lane_id, array['LANE_DIRECTOR','CATALOG_EDITOR','TRADE_OPS','SALES','VIEWER'])
    else
      has_brand_membership(brand_id)
  end
);

-- CREATE — any working lane role on the target lane (endpoints run as the user),
-- OR (NULL lane) brand membership.
create policy ai_drafts_write on tower.ai_drafts for insert with check (
  case
    when lane_id is not null then
      has_lane_role(lane_id, array['LANE_DIRECTOR','CATALOG_EDITOR','TRADE_OPS','SALES'])
    else
      has_brand_membership(brand_id)
  end
);

-- REVIEW (approve/reject) — reviewers only: LANE_DIRECTOR/TRADE_OPS on the lane,
-- or group admin; NULL-lane rows require group admin (tighten per policy).
create policy ai_drafts_update on tower.ai_drafts for update using (
  case
    when lane_id is not null then
      has_lane_role(lane_id, array['LANE_DIRECTOR','TRADE_OPS'])
    else
      is_group_admin()
  end
);
-- No delete policy — append-only (Directive 4).

-- ============================================================
-- 3 · Grants (D-06: RLS and privileges are orthogonal). No DELETE grant.
-- ============================================================
grant select, insert, update on tower.ai_drafts to authenticated;
