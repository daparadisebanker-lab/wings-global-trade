import { IntelligenceWorkspace } from './IntelligenceWorkspace'

// Intelligence — Wave 4 (COMPONENT_TREE §5). Replaces the Wave-1 placeholder.
// Two review surfaces (TriageQueue · SpecExtractReview) where the AI proposes
// and the operator disposes. RLS is the permission system — these surfaces show
// only what the (RLS-scoped) W4.B actions return; the UI never enforces access.
export default function IntelligencePage() {
  return <IntelligenceWorkspace />
}
