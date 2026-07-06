# @wings/mister

The **Mister client surface** — the one engine, one brain (ecosystem §1.4). This
package holds only the parts safe to share across lanes:

- `types` — the full Mister v2 type/data contract, including the control-block
  schema types (`quick_actions`, `surfaces`, `state`, `collected`).
- `useMisterStream` — the SSE streaming hook that consumes the **already-validated**
  event stream from `POST /api/mister`.

## What intentionally stays in apps/site (never moved)

The engine's server and guardrail surface is a hard danger zone ("never touch"):

- `app/api/mister/*` routes, the HOLD-BACK/`validateOutput` price guardrail,
  `lib/mister/{guardrails,systemPrompt,tools,client,stage,buildContext,rateLimit,
  rehydration}.ts`, and the cached system prompt.
- `src/types/mister.ts` and `src/hooks/useMisterStream.ts` remain as **re-export
  seams** so all 11 server importers and every client component keep importing
  `@/types/mister` / `@/hooks/useMisterStream` unchanged (D-03).

## MisterDock (the shell) is deliberately app-local — see MIGRATION_DECISIONS D-11

The live Mister shell is `MisterSiteWidget` (MisterProvider + MisterFloatingButton +
MisterFullscreenOverlay) plus ~28 interwoven client components and surfaces. Deep-
moving that whole tree into a package would sit it directly against the guardrail-
adjacent streaming/provider stack and risk the verified crown-jewel conversation for
a purely future theming benefit — and packages cannot import from apps, so a thin
wrapper is impossible. Per M3.3's wrap-and-log allowance, the shell stays in
apps/site; `MisterDock` is documented as a future clean-move once the client stack is
decoupled from app-local `lib/mister` motion/haptics/fallback utilities.

`database-shared.ts` holds byte-identical copies of the 3 database value types the
contract references (`FreeZone`, `TprCompleteness`, `ConversationTurn`) so the package
carries no app import.
