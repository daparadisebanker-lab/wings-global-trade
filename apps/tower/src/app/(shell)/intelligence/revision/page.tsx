import { IntelligenceWorkspace } from '../IntelligenceWorkspace'

// Intelligence review queue (triage + spec-extract) — the AI-proposes/human-
// disposes surface, now one level under the Mister cockpit (Phase E). /intelligence
// renders the cockpit; this child hosts the review queues the cockpit's commit rail
// links to. The workspace component and its W4.B (RLS-scoped) actions are unchanged.
export default function IntelligenceRevisionPage() {
  return <IntelligenceWorkspace />
}
