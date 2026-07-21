# TOWER · n8n automation

n8n workflows that drive TOWER's scheduled Intelligence + ops jobs. They run on
the **shared ecosystem n8n instance** (root CLAUDE.md §Stack), in the TOWER
pipeline group. Import each `*.workflow.json` here, set the env vars it needs,
then activate.

## `weekly-lane-brief.workflow.json`

**Trigger:** Schedule — every Monday 07:00 (weekly cron).

**What it does:** fans out to one run per lane, computes the current ISO week
(e.g. `2026-W27`), calls the TOWER brief endpoint per lane, and posts each
returned digest as a **DRAFT for review** — never auto-published. This is the
scheduled twin of `WeeklyBrief` (COMPONENT_TREE §4) and honors the core law:
*Intelligence proposes, humans dispose* (TOWER CLAUDE.md Directive 7).

**Endpoint it calls** (API_MAP.md · Intelligence):

```
POST {TOWER_BASE_URL}/api/ai/brief
Body: { lane, week }
→ { data: { markdown } }   digest markdown (sonnet)
```

The result is forwarded to `TOWER_BRIEF_REVIEW_WEBHOOK` as:

```
POST {TOWER_BRIEF_REVIEW_WEBHOOK}
{ status: "DRAFT", kind: "weekly_lane_brief", lane, week, markdown }
```

Point that webhook at the review inbox that fronts the WhatsApp/email digest
send (a human approves before it goes out).

## `journey-advance.workflow.json`

**Trigger:** Schedule — every hour.

**What it does:** the DETERMINISTIC (rules/date/state-driven, **no AI**) auto-advancer
for import journeys. On each tick it POSTs to the TOWER hook, which scans every
open journey (cache not yet `ENTREGADO`) and recomputes its client-facing phase
from the live quote/order/container states + the append-only hito log — the SAME
derivation a rep triggers by hand. When live state has outrun the cached phase it
advances **forward only** (monotonic), appends a system-attested milestone
(`recorded_by = null`), and emits a PII-free `journey.phase.advanced` event.
Re-running on a settled journey is a no-op (idempotent).

This is the scheduled twin of the `JourneyPanel` rep controls: the panel lets a
human record the hitos that have no single status source (`EN_ORIGEN`,
`ASEGURADO`, `BL_LIBERADO`); this workflow closes the loop for the phases that DO
derive from an underlying status (accepted → in transit → arrived → nationalized
→ delivered) so the client tracker never lags behind the shipment. *Intelligence
proposes, humans dispose* still holds — the hook can only ever set the phase the
underlying state already proves, never an arbitrary one.

**Endpoint it calls** (server contract in `apps/tower/src/app/api/hooks/journey-advance/route.ts`):

```
POST {TOWER_BASE_URL}/api/hooks/journey-advance
Header: X-Wings-Signature: sha256=<hmac-sha256 of the raw body, key JOURNEY_ADVANCE_SECRET>
Body: {}                              scan all open journeys (default)
      { "limit": 200 }                cap the batch
      { "journeyId": "<uuid>" }       reconcile one journey
→ { data: { scanned, advanced, results: [{ journeyId, advanced, fromPhase, toPhase }] } }
```

The `Sign body` Code node HMACs the **raw** body it sends (empty `{}` by default),
so the signature always matches the exact bytes — never re-serialize the body
downstream.

### Env it needs

| Var | Purpose |
|-----|---------|
| `TOWER_BASE_URL` | TOWER origin, no trailing slash |
| `JOURNEY_ADVANCE_SECRET` | Shared HMAC secret; must equal the app's `JOURNEY_ADVANCE_SECRET` |
| `JOURNEY_ADVANCE_LIMIT` | *(optional)* batch cap per tick |
| `JOURNEY_ADVANCE_JOURNEY_ID` | *(optional)* target a single journey instead of scanning |

## Import

1. n8n → **Workflows → Import from File** → select the `*.workflow.json` you want.
2. Set the env vars below on the n8n instance (Settings → Variables, or host env).
3. Open the workflow, confirm the Schedule node's timezone matches ops, **Save**,
   then toggle **Active**. (`active` ships `false` — activation is deliberate.)

### `weekly-lane-brief` — env / webhook it needs

| Var | Purpose |
|-----|---------|
| `TOWER_BASE_URL` | TOWER origin, no trailing slash (e.g. `https://tower.wingsglobaltrade.com`) |
| `TOWER_SERVICE_TOKEN` | Bearer token for the server-to-server call to `/api/ai/brief` |
| `TOWER_BRIEF_LANES` | Comma-separated lane slugs to brief (e.g. `machinery,interiors,provisions`) — add a lane here, no workflow edit |
| `TOWER_BRIEF_REVIEW_WEBHOOK` | URL that receives each `DRAFT` brief for human review before send |

> A new lane needs **zero** workflow edits — append its slug to
> `TOWER_BRIEF_LANES` (ecosystem CLAUDE.md: lane N+1 costs a fraction of lane N).
