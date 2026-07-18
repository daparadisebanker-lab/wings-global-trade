-- tower_22 · Quotation document — the official "Cotización" format.
-- Extends tower.quotes with the fields the client-facing document needs beyond
-- the internal pricing engine: a human quote number, an issue date, an explicit
-- subtotal/tax/total split (IGV), the bill-to snapshot, commercial terms, and
-- free-text observations. Money stays integer minor units; tax is basis points
-- (TOWER Directive 3 / ARCHITECTURE ADR-7). Additive + idempotent; the generic
-- audit trigger on `quotes` (tower_07) already captures these columns via
-- to_jsonb(NEW) — no trigger change needed.

set search_path to tower;

alter table quotes
  add column if not exists quote_no       text,
  add column if not exists issued_on      date,
  add column if not exists subtotal_minor bigint,
  add column if not exists tax_label      text   not null default 'IGV 18%',
  add column if not exists tax_bps        int    not null default 1800
    check (tax_bps >= 0 and tax_bps <= 10000),
  add column if not exists tax_minor      bigint not null default 0,
  add column if not exists bill_to        jsonb  not null default '{}'::jsonb,
  add column if not exists terms          jsonb  not null default '{}'::jsonb,
  add column if not exists observations   jsonb  not null default '[]'::jsonb;

-- Quote numbers are unique and append-only (same law as lane/container codes).
create unique index if not exists quotes_quote_no_key on quotes (quote_no)
  where quote_no is not null;

-- Backfill: existing quotes' persisted total is a pre-tax subtotal.
update quotes set subtotal_minor = total_minor where subtotal_minor is null;

-- ── Per-year quote-number counter ────────────────────────────────────────────
-- COT-WGT-YYYY-NNNN, NNNN resetting each calendar year. A counter table (not a
-- bare sequence) so the reset is explicit and auditable.
create table if not exists quote_number_counters (
  year     int primary key,
  last_seq int not null default 0
);

-- Atomic mint: upsert bumps the year's counter under a row lock and returns the
-- formatted number. SECURITY DEFINER so a SALES user can mint without direct
-- write access to the counter table.
create or replace function mint_quote_no(p_year int) returns text
language plpgsql
security definer
set search_path = tower
as $$
declare
  v_seq int;
begin
  insert into quote_number_counters (year, last_seq)
    values (p_year, 1)
  on conflict (year)
    do update set last_seq = quote_number_counters.last_seq + 1
  returning last_seq into v_seq;
  return 'COT-WGT-' || p_year::text || '-' || lpad(v_seq::text, 4, '0');
end;
$$;

grant execute on function mint_quote_no(int) to authenticated;

-- Counter table is written only through the definer function; lock it down.
alter table quote_number_counters enable row level security;
-- (no policies: no direct client read/write; the SECURITY DEFINER function and
--  the service role are the only writers.)
