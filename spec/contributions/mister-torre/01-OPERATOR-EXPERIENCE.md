# 01 — Operator Experience: Where Mister Lives in the Tower

Mister Torre is not a page. He is a **layer** present in four surfaces, always reachable in under a second, never blocking the work underneath.

## The four surfaces

### 1. The Command Bar (`Cmd+K` / `Ctrl+K`) — the front door
- Omnipresent. One input, three result groups: **Acciones** (verbs), **Registros** (imports/clients/quotes), **Preguntas** (free text → Mister).
- Verb-first grammar; every high-frequency job is a typed command with entity autocomplete:
  - `cotizar excavadora CAT 320 para @Provemaq` → opens a pre-planned quote run (03)
  - `estado @IMP-0142` → live status card + drafted client update
  - `borrador correo @Hefei-Machinery pedir ficha técnica` → email artifact in the side panel
  - `brief` → today's Morning Brief
- Every command result states what Mister *did and will do next*; no dead-end answers.

### 2. The Side Panel — the workroom (420px, right)
- Slides over any tower module; conversation + artifact preview split (artifact takes over when one exists — the artifact is the point).
- Context-locked: opened from an import, it loads that import's full state; opened globally, it asks for scope in one chip tap.
- The MisterAvatar (36-particle, from the shared signature system) sits in the panel header carrying state; this is the only always-animated element in the tower.

### 3. Inline Intelligence — Mister inside the modules
- **Table cells:** anomalous values get a 1px sky underline (the shared glow language); hover → one-line explanation; click → side panel with the full reasoning. ("Flete 38% sobre la media de la ruta — tarifa spot de julio. ¿Renegociar?")
- **Record headers:** each import/client/quote header carries a quiet `Mister ▸` row: the single most useful next action for that record, refreshed by The Watch (05). Never more than one suggestion at a time — an opinionated colleague, not a notification farm.
- **Empty fields:** completable-from-documents fields (HS code from ficha técnica, weights from packing list) show a ghost value + source; Tab accepts, keeps the citation.

### 4. The Morning Brief — the daily artifact (07:30, per role)
- One screen, ≤90 seconds to read: **Hoy** (deadlines, arrivals, payments) · **Riesgos** (exceptions ranked by cost-of-inaction) · **Borradores listos** (artifacts awaiting review) · **Ayer** (what Mister did, one line each).
- Delivered in-tower + optional WhatsApp/email digest. Dirección's brief adds pipeline and margin deltas.

## Jobs-to-be-done → surface mapping (the contract)

| Job | Primary path | Time budget |
|-----|-------------|-------------|
| New quote from a lead's spec sheet | Cmd+K `cotizar` → artifact review | ≤10 min including review |
| "¿Cómo va la importación de X?" (client asks) | record header → drafted update → approve → send | ≤2 min |
| Vessel delayed / doc missing | The Watch flags → side panel plan → approved comms | caught same hour |
| Weekly ops report | auto-drafted Friday 16:00 → review | ≤10 min review |
| Find precedent ("¿cómo nacionalizamos la CNC de 2024?") | Cmd+K question → answer with cited artifacts | ≤30 s |

## Interaction laws

1. **Two keystrokes to Mister from anywhere** (Cmd+K, or `M` on any focused record).
2. **The work surface never gets hijacked** — Mister appears in panel/inline/brief; he never modals over data entry.
3. **Everything Mister claims is clickable to its source** (tower record, document page, rate table, past artifact).
4. **Keyboard-complete:** approve `⌘↵`, edit `E`, discard `⌫`, next draft `J/K`. Operators live on keys.
5. **Interruption budget:** inline suggestions per module ≤1; Watch alerts ranked, batched to the Brief unless cost-of-inaction is immediate (demurrage, cutoff today).
