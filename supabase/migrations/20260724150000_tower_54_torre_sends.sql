-- TOWER · Mister Torre L2 (Comunicar) — the send outbox. Sending is the ONE sacred side
-- effect: it happens only on a permissioned human's approval of a COMUNICACION. This table
-- is the audit trail — one row per send ATTEMPT (SENT or FAILED), written best-effort right
-- after the send in approveTorreDraft (lib/actions/torre-review.ts). It never holds the
-- message body (that lives on the source ai_drafts payload, linked by draft_id) — the outbox
-- is a ledger of what left the building, not a second copy of client-facing prose.
-- draft_id is UNIQUE: it is the idempotency key. The ledger is at-most-once PER APPROVAL — a
-- resend is a fresh approval of a fresh (revised) COMUNICACION with its own draft_id, its own
-- row; there is no second row for the same draft. RLS + audit per convention (tower_53).
--
-- CRASH WINDOW (accepted, best-effort): the send happens just before this insert, so a process
-- death between the two leaves a sent message with no ledger row. Append-only + no PENDING
-- status means write-ahead isn't possible here. The reconciliation signal is: an APPROVED
-- COMUNICACION (tower.ai_drafts) with no matching torre_sends.draft_id is a suspect send.
--
-- FABRICATED ROW (accepted, mirrors tower_53 doc_id): FK checks bypass RLS, so a permissioned
-- writer could hand-craft a row for any ai_drafts id. The audit trigger captures who; a real
-- send only ever originates from approveTorreDraft.
set search_path to tower, public;

create table if not exists tower.torre_sends (
  id           uuid primary key default gen_random_uuid(),
  brand_id     uuid not null references tower.brands(id),
  lane_id      uuid references tower.lanes(id),
  -- the approved COMUNICACION this send covers; UNIQUE = the send idempotency key
  draft_id     uuid not null references tower.ai_drafts(id),
  channel      text not null check (channel in ('email','whatsapp')),
  to_addr      text not null,
  subject      text,
  language     text not null,
  -- provider message id (a mock id under MOCK_CONNECTORS until a real adapter is wired)
  provider_id  text,
  status       text not null check (status in ('SENT','FAILED')),
  -- the failure reason on a FAILED send (retryable-vs-dead diagnosis); null on SENT
  error        text,
  -- true when a mock adapter RECORDED the send instead of performing it (MOCK_CONNECTORS). NO
  -- default: every writer must state it, so a real send can never be silently ledgered as mocked.
  mocked       boolean not null,
  created_at   timestamptz not null default now(),
  unique (draft_id)
);

create index if not exists torre_sends_brand_idx on tower.torre_sends (brand_id, created_at desc);
create index if not exists torre_sends_lane_idx on tower.torre_sends (lane_id, created_at desc);

alter table tower.torre_sends enable row level security;

-- Read: the ops/commercial roles that live in the queue (mirrors the ai_drafts read surface).
create policy torre_sends_read on tower.torre_sends for select using (
  case when lane_id is not null
    then tower.has_lane_role(lane_id, array['LANE_DIRECTOR','CATALOG_EDITOR','TRADE_OPS','SALES','VIEWER'])
    else tower.has_brand_access(brand_id) end
);
-- Insert runs in the APPROVING OPERATOR's context, immediately after the ai_drafts claim. So
-- these insert roles MUST stay a SUPERSET of the ai_drafts approve roles (tower_16
-- ai_drafts_update: LANE_DIRECTOR/TRADE_OPS per lane, group-admin for null lane) — otherwise
-- an operator could approve a COMUNICACION whose outbox write then fails RLS silently. If
-- COMUNICACION approval is ever widened, widen this policy in lockstep.
create policy torre_sends_write on tower.torre_sends for insert with check (
  case when lane_id is not null
    then tower.has_lane_role(lane_id, array['LANE_DIRECTOR','TRADE_OPS'])
    else tower.is_group_admin() end
);
-- Append-only: an outbox row is a fact about a moment (it left, or it failed). No interactive
-- update/delete policy or grant — the ledger is immutable once written.

grant select, insert on tower.torre_sends to authenticated;

drop trigger if exists audit_torre_sends on tower.torre_sends;
create trigger audit_torre_sends
  after insert or update or delete on tower.torre_sends
  for each row execute function tower.audit_trigger();

comment on table tower.torre_sends is
  'Mister Torre send outbox (L2): one row per COMUNICACION send attempt (SENT|FAILED), draft_id-idempotent. Audit ledger, not a body store — the body lives on the source ai_drafts row.';
