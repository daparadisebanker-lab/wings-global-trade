-- tower_31 · Rep catalog read — org-wide published-product visibility
-- (RB Console access reconciliation, ratified 2026-07-20). A represented-brand
-- rep is WRITE-isolated to their own brand but READ-broad across the published
-- catalog: they can check catalog listings in other categories. Additive only.

set search_path to tower;

-- SELECT policies are OR'd: a products row is visible if the shipped lane-scoped
-- policy passes (products_read, tower_08) OR this one. Any authenticated staff/rep
-- may read PUBLISHED products across every lane. DRAFT products + all writes stay
-- lane-scoped (products_read / products_ins / products_upd) — this grants no edit.
-- Service-role (site read model) is unaffected; anon still gets nothing.
create policy products_read_published on tower.products for select
  using ( auth.role() = 'authenticated' and status = 'PUBLISHED' );
