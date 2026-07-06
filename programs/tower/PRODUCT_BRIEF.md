# TOWER — The Wings Global Trade Operating System
### PRODUCT_BRIEF.md · v1.0 · July 2026

## What

**TOWER** is the internal CRM + ERP + PIM + analytics platform for the Wings Global Trade ecosystem — the control tower behind The Manifest. In supply chain, "control tower" is the literal industry term for the platform that gives full visibility over lanes, containers, and flows. The public sites are the port; TOWER is the room above it.

It is not a Salesforce clone with trade features bolted on. It is built *from* the Lane Intelligence Layer (CLAUDE.md): lanes, purchase-logic archetypes, container economics, and Mister conversations are first-class objects — not custom fields.

**Deployment:** `tower.wingsglobaltrade.com` — separate app, same monorepo, same Supabase.

**Absorbs:** the deployed `wings-operations` app (catalog, containers, financials, prorrateo). TOWER reaches feature parity wave by wave, migrates its data in Wave 1, and retires it at the Wave 5 decommission gate — see the absorption section in `programs/tower/CLAUDE.md`.

## Who (roles)

| Role | Scope | Can |
|------|-------|-----|
| **Group Admin** | All brands, all lanes | Everything, incl. spec schemas, roles, tenants |
| **Lane Director** | Assigned lane(s) | Full lane ops: catalog publish, pipeline, containers, metrics |
| **Catalog Editor** | Assigned lane(s) | Product CRUD + spec editing, submit for publish (cannot publish) |
| **Trade Ops** | Assigned lane(s) | Containers, suppliers, shipments, documents, QC |
| **Sales / Account** | Assigned lane(s) | Accounts, RFQs, quotes, Mister transcripts |
| **Viewer** | Assigned lane(s) | Read-only + dashboards |

One person can hold different roles in different lanes (`lane_memberships` table). **Áladín is a separate tenant (brand) on the same TOWER** — its team sees only Áladín; the group cockpit sees everything.

## The Five Core Loops

1. **Catalog loop:** Editor drafts product → schema-driven spec form (per archetype) → review → Lane Director publishes → webhook revalidates the public lane page in seconds. Add / update / retire — retirement never deletes (audit law).
2. **Pipeline loop:** Signal arrives (Mister session, RFQ form, WhatsApp) → auto-classified to lane + archetype → Account/RFQ created → quote → contract → feeds a container.
3. **Container loop:** Container program opened → commitments fill CBM (incl. shared-container groups — "Trae tu grupo" participants) → supplier POs → QC checkpoints → shipment + documents → landed cost & margin computed.
4. **Signal loop:** Public sites emit first-party events (product views, spec-sheet opens, fill-meter interactions, Mister starts, RFQ submits) → Signal Deck renders per-lane funnels → Lane Directors act.
5. **Intelligence loop:** Tower Intelligence (Claude API) triages inquiries, converts supplier PDFs into spec drafts, scores leads by archetype behavior, writes the weekly lane brief, and supervises Mister transcripts to improve knowledge packs.

## Beyond Salesforce — the five structural advantages

1. **Archetype-native pipelines.** PROJECT deals move brief→spec→quote→contract→production→shipment→installation; COMMODITY moves inquiry→offer→contract→booking→shipment. Stages come from the archetype, not from admin configuration hell.
2. **Container economics native.** CBM fill state, landed cost per unit, margin per container — the atoms of this business — are core objects. Salesforce has "Opportunities"; TOWER has steel boxes with money in them.
3. **Conversational CRM.** Mister sessions and WhatsApp threads *are* the lead record. No rep typing call notes; the transcript is the note.
4. **The public site is a peripheral.** Publishing, fill-meters, and availability states on wingsglobaltrade.com are rendered *from* TOWER state in real time. One truth.
5. **AI in the workflow, not in a sidebar.** Every module has one Intelligence action where the work actually happens (triage in Pipeline, spec extraction in Catalog, digest in Signal Deck).

## Success criteria (v1)

- A new Catalog Editor can publish a fully specified product to the live site in < 10 minutes without training.
- A Lane Director answers "how is my lane doing this week?" from one screen.
- Every RFQ traceable from first signal to container margin.
- Adding lane WGT/07 to TOWER = inserting one lane row + memberships. Zero code.

## Explicitly out of scope (v1)

Accounting ledger (export to accountant instead; hooks reserved), payroll, EDI/customs API integrations (document vault + manual first), native mobile apps (responsive web, warehouse-tolerant).
