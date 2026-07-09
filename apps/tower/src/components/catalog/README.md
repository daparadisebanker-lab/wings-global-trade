# Catalog Studio — Wave 2 (Builder W2.C)

CRUD + publish core for the PIM. Server actions in `lib/actions/catalog.ts`
(+ pure logic in `lib/actions/catalog-logic.ts`) and `lib/actions/media.ts`;
routes under `app/(shell)/catalog/**`; components here.

## Storage bucket the Conductor needs to provision

- **Name:** `product-media`
- **Public:** No — private, signed URLs only (matches ARCHITECTURE.md: "nothing
  public by default"; the site reads media via a signed URL issued at render
  time or a CDN-cached derivative, not this bucket directly).
- **Path convention** (`lib/actions/catalog-logic.ts#buildMediaStoragePath`):
  ```
  {brandSlug}/{laneSlug}/{productId}/{kind}/{timestamp}-{sanitized-file-name}
  ```
  e.g. `wings/machinery/6f2e.../hero/1751835200000-cat-320-front.jpg`
- kind ∈ `HERO | GALLERY | TECHNICAL | CERTIFICATE` (matches
  `tower.product_media.kind` check constraint), lowercased in the path.
- RLS/policy expectation: same director/editor write boundary as `products`
  (a `CATALOG_EDITOR`/`LANE_DIRECTOR` of the product's lane may upload;
  reads scoped the same way `product_media` rows are scoped). This wave
  assumes storage policies mirroring the `products_update` pattern in
  DATABASE_SCHEMA.sql — not yet written, since bucket/policy provisioning is
  explicitly the Conductor's job, not this agent's.
- Variant generation (resized/optimized derivatives) is n8n's job per
  ARCHITECTURE ("signed upload → variants via n8n") — not built here.
  `MediaManager` uploads the original only.

## What's implemented

- **ProductTable** (`product-table/`) — server-paginated (cursor), status/
  category-search/lane filters, bulk retire + CSV export, virtualized rows
  (`@tanstack/react-virtual`).
- **ProductEditor** (`product-editor/`) — name ES/EN, slug, category_path
  chip editor, archetype-driven spec section (via the `spec-form` contract),
  media, save-draft / submit-for-review / publish / retire, version history.
- **PublishBar** — DRAFT → IN_REVIEW → PUBLISHED, capability-driven (never a
  hardcoded role check), shows the public URL + revalidation status.
- **VersionHistory** — timeline + one-click rollback (confirm step).
- **MediaManager** — signed upload → PUT → attach, kind tagging, remove.

## Deliberately out of scope this wave

- **`/catalog/schemas`** (COMPONENT_TREE's admin JSON-Schema editor) — depends
  on the real `getSpecSchema`/`SpecForm` contracts landing; both are stubs
  right now (see the CONTRACT STUB headers). Building a schema editor against
  a placeholder schema format would be throwaway work.
- **Bulk "reassign"** (COMPONENT_TREE's third bulk action, alongside retire/
  export) — `DATABASE_SCHEMA.sql`'s `products` table has no owner/assignee
  column to reassign *to* (only `created_by`, set once at insert). Implemented
  retire + export only; flagged for a product decision on what reassign means
  before building it.
- Real JSON-Schema-driven spec rendering, media variant pipeline, and the
  `views(7d)` ProductTable column (needs Signal Deck's rollups, Wave 4).

## Known Wave-1 gap noticed while building this

`lib/rbac.ts`'s `Role` type is lowercase (`'lane_director'`, …) and treats
`'group_admin'` as a `lane_memberships.role` value, but
`DATABASE_SCHEMA.sql`'s check constraint on `lane_memberships.role` is
uppercase (`LANE_DIRECTOR`, …) and models group-admin as a separate
`profiles.is_group_admin` boolean — no membership row required. Real DB rows
will never match `rbac.ts`'s lowercase comparisons or its phantom
`'group_admin'` role. Catalog Studio's own capability check
(`getLaneCapabilities` → `computeCapabilities` in `catalog-logic.ts`) queries
`profiles.is_group_admin` + `lane_memberships.role` directly (uppercase) to
avoid inheriting this, but `rbac.ts`/`lib/lanes/memberships.ts`/`ShellChrome`
(all Wave-1-owned, outside this wave's paths) likely need the same fix.
