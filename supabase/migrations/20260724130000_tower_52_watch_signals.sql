-- TOWER · Mister Torre L4 (Vigilar/Watch) — watch_signals. The reconciler (lib/torre/
-- watch.ts) writes detected exceptions here; the Brief + real-time pings read them. One
-- OPEN signal per (brand, import_ref, rule) — the reconciler is idempotent (reconcileWatch),
-- so a standing exception is never re-pinged. Resolving flips status to RESOLVED; muting
-- (a kill switch at the signal level) flips to MUTED. RLS + audit mirror tower conventions.
set search_path to tower, public;

create table if not exists tower.watch_signals (
  id              uuid primary key default gen_random_uuid(),
  brand_id        uuid not null references tower.brands(id),
  lane_id         uuid references tower.lanes(id),
  import_ref      text not null,
  rule            text not null check (rule in (
    'eta-slip','doc-deadline','demurrage','rate-expiry',
    'payment-milestone','quote-quiet','margin-drift','stale-import'
  )),
  severity        text not null check (severity in ('inmediato','alto','medio','bajo')),
  title           jsonb not null,        -- { es, en }
  detail          jsonb not null,        -- { es, en }
  suggested_draft text check (suggested_draft in ('COMUNICACION','REPORTE_ESTADO','CHECKLIST_DOCS')),
  status          text not null default 'OPEN' check (status in ('OPEN','RESOLVED','MUTED')),
  created_at      timestamptz not null default now(),
  resolved_at     timestamptz
);

-- At most one ACTIVE (OPEN or MUTED) signal per import+rule — the reconciler's idempotency
-- key. Covering MUTED too is what stops a muted exception from being re-created (un-muted)
-- on the next reconcile. RESOLVED history rows are kept (append-only spirit) and excluded.
create unique index if not exists watch_signals_active_key
  on tower.watch_signals (brand_id, import_ref, rule) where status in ('OPEN', 'MUTED');
create index if not exists watch_signals_brand_status_idx on tower.watch_signals (brand_id, status, severity);
create index if not exists watch_signals_lane_idx on tower.watch_signals (lane_id);

alter table tower.watch_signals enable row level security;

create policy watch_signals_read on tower.watch_signals for select using (
  case when lane_id is not null
    then tower.has_lane_role(lane_id, array['LANE_DIRECTOR','CATALOG_EDITOR','TRADE_OPS','SALES','VIEWER'])
    else tower.has_brand_access(brand_id) end
);
-- The reconciler runs as a privileged job; interactive operators create/resolve within
-- their operational roles.
create policy watch_signals_write on tower.watch_signals for insert with check (
  case when lane_id is not null
    then tower.has_lane_role(lane_id, array['LANE_DIRECTOR','TRADE_OPS'])
    else tower.is_group_admin() end
);
create policy watch_signals_update on tower.watch_signals for update using (
  case when lane_id is not null
    then tower.has_lane_role(lane_id, array['LANE_DIRECTOR','TRADE_OPS'])
    else tower.is_group_admin() end
);

grant select, insert, update on tower.watch_signals to authenticated;

drop trigger if exists audit_watch_signals on tower.watch_signals;
create trigger audit_watch_signals
  after insert or update or delete on tower.watch_signals
  for each row execute function tower.audit_trigger();

comment on table tower.watch_signals is
  'Mister Torre watch layer (L4): detected import exceptions; one OPEN per (brand,import_ref,rule).';
