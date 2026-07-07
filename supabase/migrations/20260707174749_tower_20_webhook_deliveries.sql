-- TOWER Wave 5 (W5.B) · webhook_deliveries — delivery telemetry behind <WebhookHealth>.
-- Service-role insert only; group-admin read. Audit trigger deliberately omitted
-- (events-style system telemetry per D-04 — the row is its own immutable record).
set search_path to tower, public;

create table if not exists tower.webhook_deliveries (
  id          uuid        primary key default gen_random_uuid(),
  source      text        not null,
  direction   text        not null default 'OUTBOUND'
                          check (direction in ('INBOUND', 'OUTBOUND')),
  status      text        not null
                          check (status in ('OK', 'FAILED')),
  reference   text,
  detail      jsonb       not null default '{}',
  occurred_at timestamptz not null default now(),
  created_at  timestamptz not null default now()
);

create index if not exists webhook_deliveries_source_time_idx
  on tower.webhook_deliveries (source, occurred_at desc);
create index if not exists webhook_deliveries_time_idx
  on tower.webhook_deliveries (occurred_at desc);
create index if not exists webhook_deliveries_status_idx
  on tower.webhook_deliveries (status);

alter table tower.webhook_deliveries enable row level security;

create policy webhook_deliveries_read on tower.webhook_deliveries for select
  using ( tower.is_group_admin() );

-- No authenticated INSERT/UPDATE policy: writes happen only via the service-role
-- client (matches tower.events and whatsapp_messages). No DELETE policy — append-only.

grant select on tower.webhook_deliveries to authenticated;
grant select, insert on tower.webhook_deliveries to service_role;

-- migration-11 default privileges auto-grant insert/update to authenticated on new
-- tables — revoke them (defense in depth, same as whatsapp_messages).
revoke insert, update, delete on tower.webhook_deliveries from authenticated;
