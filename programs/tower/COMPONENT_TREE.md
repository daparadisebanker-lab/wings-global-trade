# TOWER · COMPONENT_TREE.md

## App shell (every screen)

```
<TowerShell>
├─ <TopBar>            brand switcher (group admin only) · global search · notifications · user
├─ <LaneSwitcher>      the stamp rail — user's assigned lanes as LaneStamps; active lane floods accent
├─ <CommandPalette>    ⌘K — Linear-grade: jump to product/account/container, run actions
│                      ("publish…", "new RFQ…", "open container WGT/02-C014")
├─ <NavRail>           Catalog · Pipeline · Containers · Signals · Intelligence · Admin
└─ <main data-lane={activeLane}>       ← livery cascades; Tower chrome stays graphite
```

Tower chrome is the control-room livery (DESIGN_SYSTEM.md); the *active lane's accent* tints stamps, charts, and status chips — operators always feel which lane they're standing in.

## 1 · Catalog Studio (PIM)

```
/catalog
├─ <ProductTable>          ManifestTable: status stamp · name · category · CBM · MOQ · views(7d) · updated
│   ├─ filters: status, category_path, schema version    ├─ bulk actions: retire, export, reassign
├─ /catalog/new  &  /catalog/[id]
│   <ProductEditor>
│   ├─ <SpecForm>          ★ schema-driven: renders from spec_schemas.json_schema (Zod→JSON-Schema),
│   │                      typed fields (dimension, material, grade, HS code…), per-locale tabs ES/EN(+DE/NL)
│   ├─ <MediaManager>      upload → variant pipeline → kind tagging (HERO/TECHNICAL/CERTIFICATE)
│   ├─ <SpecExtract>       ★ Intelligence: drop supplier PDF/image → drafted spec fields, diff-style review
│   ├─ <VersionHistory>    product_versions timeline · one-click rollback (republish snapshot)
│   └─ <PublishBar>        DRAFT → IN_REVIEW → PUBLISHED; director-gated; shows the exact
│                          public URL + revalidation status after publish
└─ /catalog/schemas        (group admin) spec-schema versions per archetype/lane, JSON-Schema editor + preview
```

## 2 · Pipeline (CRM)

```
/pipeline
├─ <PipelineBoard>         columns = archetype stage set of the active lane (never configurable per-user)
│   └─ <RFQCard>           account · lines summary in lane unit math · source icon (Mister/WA/form) · score
├─ /pipeline/rfq/[id]
│   ├─ <RFQHeader>         stage stepper · owner · source
│   ├─ <LineItems>         qty in lane units, target price, linked products
│   ├─ <ConversationPane>  ★ Mister transcript + WhatsApp thread inline — the record IS the conversation
│   ├─ <QuoteComposer>     versioned quotes; totals server-computed; PDF via existing doc-gen pipeline
│   └─ <TriageSuggestion>  ★ Intelligence: classification rationale + drafted reply (approve/edit)
├─ /accounts               <AccountTable> country · lanes touched · score · lifetime value
└─ /accounts/[id]          timeline of every session, RFQ, order, container across lanes (brand-scoped)
```

## 3 · Container Desk (ERP)

```
/containers
├─ <ContainerBoard>        columns by status OPEN→FILLING→BOOKED→IN_TRANSIT→ARRIVED→CLEARED→CLOSED
│   └─ <ContainerCard>     code stamp · <FillBar> committed/capacity CBM · mode chip (SHARED/DEDICATED) · ETD
├─ /containers/[id]
│   ├─ <FillMeter3D>       ★ the public site's visualizer, reused as an operational instrument —
│   │                      commitments render as cargo; hover = account + CBM
│   ├─ <CommitmentsTable>  shared-container participants ("Trae tu grupo" groups), status per participant
│   ├─ <POPanel>           supplier POs · QC checkpoint tracker with evidence
│   ├─ <DocumentVault>     BL / packing list / certs — signed-URL previews, completeness checklist
│   └─ <CostSheet>         ★ landed cost: FOB+freight+insurance+duties+free-zone handling →
│                          landed/unit · margin/container · integer-money, server-computed
└─ /suppliers              verified network directory · QC history sparkline · lanes served
```

## 4 · Signal Deck (analytics)

```
/signals                   (scoped: directors see their lanes; group admin sees cross-lane)
├─ <LanePulse>             headline row: views · spec opens · Mister starts · RFQs · handoffs (7d vs prev)
├─ <FunnelChart>           view → spec_open → mister/rfq → quote → contract (conversion at each edge)
├─ <ProductLeaderboard>    ManifestTable: product · views · spec opens · RFQ lines · velocity Δ
├─ <FillWatch>             all public fill-meters: interaction rate vs fill progress
├─ <SourceSplit>           Mister vs form vs WhatsApp origination
└─ <WeeklyBrief>           ★ Intelligence-written lane digest (also delivered via n8n → WhatsApp/email)
/signals/group             (admin) cross-lane comparison · brand split (Wings vs Áladín) · cohort views
```

## 5 · Intelligence

```
/intelligence
├─ <TriageQueue>           unclassified inbound → suggested lane/archetype/account (approve/correct;
│                          corrections logged as training signal)
├─ <MisterConsole>         transcript review · failure-mode flags · knowledge-pack diff proposals
│                          (edits write to Supabase packs — no redeploy)
├─ <SpecExtractQueue>      batch supplier-doc → product drafts
└─ <ScoreExplainer>        why an account scored N — archetype behavior breakdown
```

## 6 · Admin

```
/admin
├─ <UserManager>           invite · lane_memberships matrix editor (user × lane × role grid)
├─ <LaneRegistry>          lanes table, append-only codes, status flips (mirrors ecosystem CLAUDE.md)
├─ <BrandManager>          tenants (wings, aladin, …)
├─ <AuditExplorer>         filterable append-only log (group admin only)
└─ <WebhookHealth>         revalidation + n8n pipeline status
```

★ = signature component — the six moments that make TOWER feel beyond Salesforce: SpecForm (schema-driven), SpecExtract, ConversationPane, FillMeter3D-as-instrument, CostSheet, WeeklyBrief.
