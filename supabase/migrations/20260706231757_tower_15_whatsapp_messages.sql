-- TOWER Wave 3 · whatsapp_messages (W3.C). New table for the WhatsApp side of
-- ConversationPane. Service-role insert only (like tower.events).
set search_path to tower, public;

create table if not exists tower.whatsapp_messages (
  id            uuid        primary key default gen_random_uuid(),
  rfq_id        uuid        references tower.rfqs(id) on delete set null,
  account_id    uuid        references tower.accounts(id) on delete set null,
  direction     text        not null default 'INBOUND' check (direction in ('INBOUND','OUTBOUND')),
  wa_message_id text        unique not null,   -- idempotency key for webhook redelivery
  from_number   text        not null,
  to_number     text        not null,
  body          text        not null,
  occurred_at   timestamptz not null default now(),
  created_at    timestamptz not null default now()
);

create index if not exists whatsapp_messages_rfq_id_idx on tower.whatsapp_messages(rfq_id);
create index if not exists whatsapp_messages_account_id_idx on tower.whatsapp_messages(account_id);
create index if not exists whatsapp_messages_occurred_at_idx on tower.whatsapp_messages(occurred_at);

alter table tower.whatsapp_messages enable row level security;

-- Read: only once linked to an RFQ whose lane the caller can see. Unlinked
-- (triage) rows are service-role-only until a human links them.
create policy whatsapp_messages_read on tower.whatsapp_messages for select
  using (
    rfq_id is not null
    and exists (
      select 1 from tower.rfqs r
      where r.id = whatsapp_messages.rfq_id
        and tower.has_lane_role(r.lane_id, array['LANE_DIRECTOR','CATALOG_EDITOR','TRADE_OPS','SALES','VIEWER'])
    )
  );
-- No authenticated insert/update/delete policy: writes go through the
-- service-role hook only (mirrors tower.events). Append-only.

-- Privileges: authenticated reads only. Revoke the insert/update that
-- migration-11 default privileges would have auto-granted (RLS already blocks
-- it — this is defense in depth, matching the events lockdown).
grant select on tower.whatsapp_messages to authenticated;
revoke insert, update, delete on tower.whatsapp_messages from authenticated;
grant select, insert, update on tower.whatsapp_messages to service_role;

-- Audit trigger (the generic fn from migration 7).
drop trigger if exists audit_whatsapp_messages on tower.whatsapp_messages;
create trigger audit_whatsapp_messages
  after insert or update or delete on tower.whatsapp_messages
  for each row execute function tower.audit_trigger();
