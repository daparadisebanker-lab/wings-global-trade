# Container Desk — Wave 3 (Builder W3.B)

ERP core: CBM fill/commitments, POs, QC checkpoints, trade documents, landed
cost. Server actions in `lib/actions/containers.ts` (+ pure logic in
`lib/actions/containers-logic.ts`, runtime constants in
`lib/actions/containers-types.ts`); public fill read model in
`app/api/public/fill/**`; routes under `app/(shell)/containers/**`; components
here.

## Storage bucket the Conductor needs to provision

- **Name:** `trade-documents`
- **Public:** No — private, signed URLs only (ARCHITECTURE.md: "Trade docs
  are sensitive; nothing public by default"). `DocumentVault` issues a signed
  upload URL to write and a signed read URL (300s TTL) per document to view —
  never a public path.
- **Path convention** (`lib/actions/containers-logic.ts#buildTradeDocumentStoragePath`):
  ```
  {brandSlug}/{laneSlug}/{sanitizedContainerCode}/{kind}/{timestamp}-{sanitized-file-name}
  ```
  e.g. `wings/machinery/WGT-01-C014/bl/1751835200000-bill-of-lading.pdf`
  (the container code's `/` is sanitized to `-` for the storage path — object
  keys with a raw `/` create implicit "folders" that would collide with the
  path's own segments).
- kind ∈ `BL | PACKING_LIST | CO | PHYTO | INVOICE | CERT` — TOWER's closed
  vocabulary for the DocumentVault completeness checklist (COMPONENT_TREE
  "completeness checklist"). `trade_documents.kind` itself is free `text` in
  DATABASE_SCHEMA.sql (no check constraint) — the enum lives in
  `containers-types.ts#DOCUMENT_KINDS` and is enforced by the Zod schemas in
  `containers.ts`, not the DB.
- RLS/policy expectation: same TRADE_OPS/LANE_DIRECTOR write boundary as
  `containers`/`purchase_orders` (proposed in
  `programs/tower/migration/wave3-container.sql`, **not applied** — the
  Conductor applies all DB changes). Storage object-level RLS mirroring that
  boundary is a follow-up, same gap `product-media` flagged in Wave 2 — signed
  URLs via the server action work today regardless.

## What's implemented

- **ContainerBoard** (`container-board/`) — server-paginated (cursor) board
  grouped by status column (OPEN→FILLING→BOOKED→IN_TRANSIT→ARRIVED→CLEARED→
  CLOSED), `ContainerCard` with code stamp, `FillBar` (committed/capacity CBM),
  mode chip, ETD; "Open container" form (capability-gated).
- **CommitmentsTable** (`commitments-table/`) — shared-container participants,
  status per participant, a commit-CBM form that surfaces `CAPACITY_EXCEEDED`
  from the atomic SQL function as a readable banner (never a raw DB error).
- **POPanel** (`po-panel/`) — supplier POs list + issue-PO form + status
  advance controls (forward-only / cancel, per `containers-logic#canAdvancePoStatus`).
- **QcTracker** (`qc-tracker/`) — checkpoint list + record-checkpoint form for
  a selected PO, evidence shown as signed-URL-free storage paths (evidence
  upload flow itself is out of scope this wave — see below).
- **DocumentVault** (`document-vault/`) — signed upload → attach, kind
  tagging, completeness checklist against `DOCUMENT_KINDS`, signed-URL
  previews (300s TTL, re-issued on each `listDocuments` call).
- **CostSheet** (`cost-sheet/`) — FOB/freight/insurance/duties/handling inputs
  (entered as decimal currency, converted to integer minor units before the
  server call — the server never receives a float), landed cost total +
  landed-cost-per-CBM, both server-computed via `computeLandedCost`.

## Deliberately out of scope this wave

- **QC evidence upload** — `qc_checks.evidence` accepts storage paths, but the
  signed-upload flow for evidence files themselves isn't built (only the
  document vault has one). `QcTracker`'s evidence field takes an already-known
  storage path string; wiring a second upload widget was pure repetition of
  `DocumentVault`'s pattern with no new logic, flagged rather than duplicated.
- **`/suppliers`** (COMPONENT_TREE's verified network directory) — not in this
  wave's path ownership (`app/(shell)/containers/**` only); `issuePO` accepts
  a `supplierId` the caller already has (e.g. typed in), no supplier picker UI.
- **CostSheet "margin/container"** (COMPONENT_TREE) — `landed_costs` has no
  revenue/sale-price column to diff against; margin needs a revenue source not
  yet in DATABASE_SCHEMA.sql. Flagged for a product decision rather than
  inventing a client-only number that looks authoritative but isn't persisted
  anywhere.
- **Realtime** (ARCHITECTURE "Supabase Realtime on containers, rfqs,
  events_rollup") — ContainerBoard/FillBar poll via TanStack Query's default
  staleTime, not a Realtime subscription; wiring that is presentation-only and
  can land without touching this wave's server actions.
- **Per-lane "Open container" capability on lane switch** — `/containers`
  resolves `canOpenContainer` server-side for the *initial* lane only; if the
  operator switches lanes in `ContainerBoard`'s dropdown client-side, the
  button's visibility doesn't re-check the new lane's capability until the
  page reloads. RLS still enforces the real permission on the actual
  `openContainer` call regardless — this only affects whether the button is
  shown, never whether the mutation succeeds.

## Known gaps noticed while building this

- `container_commitments`, `purchase_orders`, `qc_checks`, `trade_documents`,
  and `landed_costs` have **no RLS policies yet** in DATABASE_SCHEMA.sql (only
  `products` ships a worked example; the comment block says "Same pattern:
  apply to every domain table" but doesn't write it). Proposed policies +
  grants for all five tables are in `migration/wave3-container.sql` — per
  Wave 1's D-06, new tables need their own `grant` statements too (RLS and
  privileges are orthogonal), included there.
- `commit_container_cbm` is `SECURITY DEFINER` (needed for the row lock across
  a concurrent-safe capacity check) and therefore bypasses RLS entirely inside
  its own body — it re-implements the TRADE_OPS/SALES/LANE_DIRECTOR gate via
  `has_lane_role()` itself rather than relying on the (bypassed) `container_commitments`
  insert policy. If that policy's role set is ever widened, remember to widen
  the function's check too — they will silently drift otherwise.
