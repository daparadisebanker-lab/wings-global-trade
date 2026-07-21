-- tower_42 · RB "retire" cross-guard (R14) — block retiring an rb_product that is
-- composed into a LIVE container (root CLAUDE.md §5-bis; the R14 guard the base
-- retire transition in rb-catalog.ts#retireRbProduct deferred to Wave 3).
--
-- A represented brand's product is composed into containers through its packing
-- profile: rb_container_templates.composition is a jsonb array of
-- {profile_slug, packages}, where profile_slug = rb_packing_profiles.product_slug,
-- which is authored equal to rb_products.slug (tower_26 §2.1: "slug joins
-- rb_packing_profiles.product_slug via (represented_brand_id, slug=product_slug)").
-- So the product→container link is:
--
--   rb_products.slug  =  composition[*]->>'profile_slug'  (rb_container_templates)
--                        →  rb_containers.template_id  →  rb_containers.status
--
-- Retiring a product (PUBLISHED → RETIRED) while a container built on a template
-- that carries that product is still LIVE would pull a product out from under a
-- planned/open container. This migration blocks that at the DB — the authoritative
-- enforcement — with a BEFORE UPDATE trigger; the friendly pre-check in the action
-- is defence in depth, not the boundary.
--
-- LIVE set = OPEN, FILLING. Terminal / not-live = CLOSED, SHIPPED, CANCELLED —
-- the exact live-set rb_reserve() enforces (rb_wave1: "if v_status not in
-- ('OPEN','FILLING') then raise RB_CONTAINER_CLOSED"). A container that has shipped,
-- closed, or been cancelled no longer depends on the product staying published.
--
-- Additive only — never alters shipped objects destructively. The audit trigger
-- (audit_rb_products, tower_26 §2.8) fires AFTER this BEFORE-guard, so a blocked
-- retire writes no audit row (the UPDATE is rejected before it commits). Mirrors
-- the tower_36 rb_alloc_status_guard idiom: a security-definer plpgsql guard
-- function + a `before update of status` trigger, idempotent creation. No public
-- wrapper — the guard is trigger-internal (unlike the tower_36 job wrapper); nothing
-- calls it through PostgREST.

set search_path to tower, public;

-- ── Retire cross-guard (authoritative) ──────────────────────────────────────
-- Fires only on the transition INTO RETIRED. Rejects the retire when the product's
-- slug appears as a profile_slug in the composition of any container template whose
-- container (same brand) is still LIVE. Brand scope is resolved on both the template
-- and the container so a slug collision across brands can never cross-block —
-- product_slug is globally unique today (rb_wave1), but the guard does not lean on
-- that; it matches within new.represented_brand_id.
create or replace function tower.rb_retire_guard() returns trigger
language plpgsql security definer set search_path = tower, public as $fn$
begin
  -- Only guard the entry into RETIRED. Any other status write (including a
  -- no-op or a rollback back to PUBLISHED) passes through untouched.
  if new.status is distinct from 'RETIRED' or old.status is not distinct from 'RETIRED' then
    return new;
  end if;

  if exists (
    select 1
    from tower.rb_containers c
    join tower.rb_container_templates t on t.id = c.template_id
    where c.represented_brand_id = new.represented_brand_id
      and t.represented_brand_id = new.represented_brand_id
      and c.status in ('OPEN','FILLING')
      and t.composition @> jsonb_build_array(jsonb_build_object('profile_slug', new.slug))
  ) then
    raise exception 'RB_RETIRE_BLOCKED_LIVE_CONTAINER: product % is composed into a live container', new.slug
      using hint = 'close, ship or cancel the container(s) before retiring this product';
  end if;

  return new;
end $fn$;

drop trigger if exists rb_products_retire_guard on tower.rb_products;
create trigger rb_products_retire_guard
  before update of status on tower.rb_products
  for each row execute function tower.rb_retire_guard();
