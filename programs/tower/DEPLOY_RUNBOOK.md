# TOWER — Track ① Deploy + Verification Runbook

Concrete steps to take everything on `claude/start-j44jj2` live on the prod
Supabase project (`pyznlglvwihosemqkhtq`) + Vercel, and prove each feature in a
browser pass. Nothing here is live until this is done — migrations apply at
deploy; prod is never touched from the branch.

> Everything below is **build/test/review-verified but not live-verified** (no
> deployed DB was reachable while building). This pass is where it gets its real
> confirmation.

---

## 0 · Preconditions

- [ ] `pg_cron` extension enabled on prod (installed by `tower_09`; `tower_36`
      schedules an hourly job through it). If prod was created fresh, confirm the
      extension is present before applying `tower_36`.
- [ ] Service-role key available to the deploy (see env below) — uploads, events,
      and the RB publish-gate writes all use it.

## 1 · Apply migrations `tower_22 → tower_36`

Apply **in this order** (filename timestamps already sort correctly). Note the
gaps are intentional — **`tower_26–29` are reserved-but-unbuilt**, and **there is
no `tower_35`** (the promo activation event needed no schema change):

```
tower_22_quotation_document
tower_23_costing
tower_24_costing_config_seed
tower_25_rb_console
tower_30_import_journeys
tower_31_rep_catalog_read
tower_32_group_admin_guard
tower_33_container_promotion
tower_34_storage_buckets      ← NEW (Track ②): product-media + brand-kits buckets
tower_36_rb_alloc_status      ← NEW: allocation status machine + hourly cron
```

If some of `tower_22–33` are already applied on prod, apply only the remainder —
migrations are one-concern and forward-only. `tower_34` and `tower_36` are both
idempotent-safe to (re-)apply.

**Post-apply sanity:**
- [ ] `select id, public from storage.buckets where id in ('product-media','brand-kits');`
      → two rows, `public = false`.
- [ ] `select jobname, schedule from cron.job where jobname = 'rb_release_expired_allocations';`
      → one row, `0 * * * *`.
- [ ] `select tower.rb_release_expired_allocations();` → returns an int (0 on a
      fresh DB), proving the job function + guard trigger interoperate.

## 2 · Environment variables (Vercel)

- [ ] `JOURNEY_SIGNING_SECRET` — import-journey HMAC.
- [ ] `NEXT_PUBLIC_SITE_URL` — used to build promo listing / share-card URLs.
- [ ] `SUPABASE_SERVICE_ROLE_KEY` — **required** for media uploads (buckets are
      private, signed URLs are minted service-role) and for the analytics event.
- [ ] `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` — standard.

## 3 · Bootstrap the first group admin (run ONCE, after the founder signs in)

There is no admin yet to grant the first one, so seed by email (from `tower_32`):

```sql
update tower.profiles p set is_group_admin = true
from auth.users u
where u.id = p.id and u.email = '<founder-email>';
```

The `UserManager` toggle (`setUserGroupAdmin`) handles the rest of the 5-person
team afterward.

---

## 4 · Browser verification pass (prove each shipped feature)

### Core flows (pre-existing cycle work)
- [ ] Sign in; the founder sees every module (group admin).
- [ ] Quote → PDF (`/quote/[id]/document`).
- [ ] Costing → cost sheet (`/costing`, `/cost-sheet/[id]`).

### Track ② — media pipeline (NEW)
- [ ] **Catalog image:** in Catalog Studio, open a product → MediaManager → upload
      an image. Expect: signed PUT succeeds, the row appears, and it survives a
      reload (proves `product-media` bucket + service-role signed upload).
- [ ] **Brand kit:** RB console → a brand → Kit de marca → upload the 4 logos, 3
      hero + 2 about photos, and the 2 PDFs; set the 5 hex tokens. The
      completeness meter turns green; Save reports `kit_complete=true`.
- [ ] **Thumbnails:** reload the kit — already-saved image slots render thumbnails
      (signed download URLs), PDFs show a chip.

### Track ③ — promotion (NEW)
- [ ] Activate a container for promotion (BRAND_MANAGER/OPS). Then
      `select event, brand_slug, lane_slug, meta from tower.events
       where event='container_promoted' order by occurred_at desc limit 1;`
      → one row, `lane_slug='representation'`, meta has `code/phase/archetype`,
      `session_hash='srv_tower_action'` (no PII).
- [ ] Author copy → download PNG (`/api/promo-card/[code]?format=png`).
- [ ] Public page `/marcas/{brand}/contenedor/{code}` renders; its
      `opengraph-image` (paste the URL into a link-unfurl tester / WhatsApp)
      shows the 1080² brand card. A non-promoted code → 404 (nothing leaks).

### RB allocation status machine (NEW, `tower_36`)
- [ ] As BRAND_MANAGER/OPS, advance a reservation
      `RESERVED → CONFIRMED → LOADED → RELEASED` (via `advanceRbAllocationStatus`).
- [ ] Attempt an illegal jump (e.g. `RESERVED → LOADED`) → clean `STAGE_INVALID`,
      no row change.
- [ ] A BRAND_VIEWER cannot advance (RLS denies the UPDATE).
- [ ] Expiry job: with a RESERVED row whose `expires_at < now()`, run
      `select public.rb_release_expired_allocations();` → it flips to `RELEASED`;
      a second run returns 0 (idempotent).

### Wave 4 — live brand tokens (NEW)
- [ ] For a **LIVE** represented brand with a saved kit, load `/marcas/{slug}` and
      confirm its `--rb-*` accent/ink render (not the Áladín fixture). Áladín (or
      any brand without live tokens) still renders from the fixture CSS.

---

## 5 · Notes / rollback

- All migrations are forward-only (fix-forward, never edit a merged migration).
  `tower_34`/`tower_36` are safe to re-apply.
- The Wave 4 token injection reads `public.rb_active_containers` /
  `rb_public_brands` column names as they exist today; if the live view names a
  token column differently, reconcile the `getRbLiveBrandBySlug` select.
- Known-deferred cosmetics (not blockers): the OG card uses Wings-gold because the
  brand accent isn't in the public `rb_active_containers` contract; Wave 4 swaps
  only the token surface (content still from fixtures).
- One convention note for review: the Wave 4 brand layout injects `--rb-*` via an
  inline `style` on `[data-brand]` (the standard seam for dynamic CSS custom
  properties). If you prefer a scoped `<style>` block to honor the site's
  "no inline styles" rule, that's a small, isolated change.
