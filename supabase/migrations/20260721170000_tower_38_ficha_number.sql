-- tower_38 · Ficha número — a real minted, monotonic per-year sequence for the
-- Ficha técnica spec-sheet reference (FT-WGT-YYYY-NNNN). Replaces the placeholder
-- "hash of the product id" the ficha generator shipped with. Mirrors the
-- quote-number mechanism (tower_22 · mint_quote_no): a per-year counter table
-- (not a bare sequence, so the yearly reset is explicit and auditable), bumped
-- atomically under a row lock inside a SECURITY DEFINER function. Additive +
-- idempotent.
--
-- Two deliberate differences from mint_quote_no, both forced by where a ficha
-- number is minted:
--   1. A quote number is minted inside issueQuotation — a privileged step whose
--      caller already has write rights on `quotes`, so mint_quote_no just bumps
--      the counter and the action persists. A ficha number is minted on the READ
--      path (getFichaDocument), whose callers include SALES/VIEWER users who,
--      under products_upd (tower_08), may NOT write tower.products. So this
--      function PERSISTS the number onto the product itself (SECURITY DEFINER),
--      rather than leaving persistence to the RLS-scoped client.
--   2. Because it persists, it is keyed by product id and idempotent: a product
--      that already carries a ficha_no keeps it forever (same stability law as a
--      quote number — minted once, never reused, never re-minted).
-- The counter mechanism itself is mirrored exactly; only the persistence
-- responsibility moves into the function. A parallel counter table (not the
-- quote one) so the two document families number independently.

set search_path to tower;

-- Spec-sheet reference lives on the product; append-only, minted once, unique.
alter table products
  add column if not exists ficha_no text;

-- Ficha numbers are unique and append-only (same law as quote/lane/container codes).
create unique index if not exists products_ficha_no_key on products (ficha_no)
  where ficha_no is not null;

-- ── Per-year ficha-number counter ────────────────────────────────────────────
-- FT-WGT-YYYY-NNNN, NNNN resetting each calendar year. Parallel to
-- quote_number_counters (tower_22): quote-specific there, so a ficha counter here
-- rather than overloading one table.
create table if not exists ficha_number_counters (
  year     int primary key,
  last_seq int not null default 0
);

-- Atomic mint + persist. Locks the product row; if it already carries a ficha_no
-- returns that unchanged (idempotent). Otherwise bumps the year's counter under
-- the same row lock, formats the reference, stores it on the product, and returns
-- it. SECURITY DEFINER so a SALES/VIEWER user (who cannot write tower.products
-- under RLS) can still mint, and so the counter table needs no client-facing
-- policy. auth.uid() is preserved under the definer, so the tower_07 audit
-- trigger on `products` records the real caller on the UPDATE — no trigger change
-- needed (it captures ficha_no via to_jsonb(new) automatically). Returns null for
-- an unknown product id; the caller RLS-loads the product before minting, so the
-- legitimate path never hits that guard.
create or replace function mint_ficha_no(p_product_id uuid, p_year int) returns text
language plpgsql
security definer
set search_path = tower
as $$
declare
  v_existing text;
  v_seq      int;
  v_no       text;
begin
  select ficha_no into v_existing from products where id = p_product_id for update;
  if not found then
    return null;
  end if;
  if v_existing is not null then
    return v_existing;
  end if;

  insert into ficha_number_counters (year, last_seq)
    values (p_year, 1)
  on conflict (year)
    do update set last_seq = ficha_number_counters.last_seq + 1
  returning last_seq into v_seq;

  v_no := 'FT-WGT-' || p_year::text || '-' || lpad(v_seq::text, 4, '0');
  update products set ficha_no = v_no where id = p_product_id;
  return v_no;
end;
$$;

grant execute on function mint_ficha_no(uuid, int) to authenticated;

-- Counter table is written only through the definer function; lock it down.
alter table ficha_number_counters enable row level security;
-- (no policies: no direct client read/write; the SECURITY DEFINER function and
--  the service role are the only writers.)
