-- tower_34 · Storage buckets for the media pipeline (REMAINING track ②)
-- ------------------------------------------------------------
-- Provisions the two private buckets the TOWER media surfaces assume but that
-- were never created (catalog/README.md flagged this as "the Conductor's job"):
--
--   · product-media — catalog product images/docs (media.ts / <MediaManager>).
--     Path: {brandSlug}/{laneSlug}/{productId}/{kind}/{ts}-{name}
--   · brand-kits    — represented-brand --rb-* kit assets (BrandKitPanel).
--     Path: rb/{brandSlug}/{slot}/{ts}-{name}
--
-- ACCESS MODEL (deliberate — mirrors the RB console's "authorize in the server
-- action, privileged write via the service role" pattern in
-- represented-brands.ts, NOT a per-object storage.objects RLS predicate):
--
--   Both buckets are PRIVATE. Every read/write is brokered by a server action
--   that first authorizes the caller against the shipped, tested predicates
--   (has_lane_role / has_rb_role / is_group_admin) and only then asks the
--   SERVICE-ROLE client to mint a signed upload/download URL. The service role
--   bypasses storage RLS, and the signed URL is authorized by its token — so no
--   `authenticated`/`anon` policy on storage.objects is needed or wanted. With
--   RLS enabled and zero public policies (Supabase's default for storage.objects),
--   nothing is reachable except through a server-issued signed URL. That keeps
--   "nothing public by default" (ARCHITECTURE.md) true by construction and avoids
--   an untested path-parsing RLS predicate as the security boundary.
--
-- Idempotent: safe to re-apply; on conflict we correct the limits in place.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  (
    'product-media',
    'product-media',
    false,
    26214400, -- 25 MiB
    array['image/png','image/jpeg','image/webp','image/avif','image/svg+xml','application/pdf']
  ),
  (
    'brand-kits',
    'brand-kits',
    false,
    26214400, -- 25 MiB
    array['image/png','image/jpeg','image/webp','image/avif','image/svg+xml','application/pdf']
  )
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;
