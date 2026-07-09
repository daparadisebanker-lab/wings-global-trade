-- TOWER Wave 5 (W5.A) · brands.status — required for BrandManager retire/reinstate.
-- Append-only spirit (Directive 4): retire via status, never DELETE. §2 of the W5.A
-- proposal (audit triggers on identity tables) verified already present from Wave 1;
-- §3 (authenticated-client admin policies) deliberately not applied — admin actions
-- use DB-resolved group-admin + service role (W3 precedent).
alter table tower.brands
  add column if not exists status text not null default 'ACTIVE'
    check (status in ('ACTIVE', 'RETIRED'));
