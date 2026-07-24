import { MisterCockpit } from '@/components/shell/mister/MisterCockpit'

// Intelligence → Mister (Phase E). The module route now renders the full-width
// Mister cockpit inline: command spine · composition canvas · commit rail. The
// AI-proposes/human-disposes review queue moved to /intelligence/revision and is
// reachable from the cockpit's commit rail. The cockpit reads the shared Mister
// conversation from the MisterProvider mounted in ShellChrome, so a draft started
// via ⌘J anywhere is still here.
export default function MisterPage() {
  return <MisterCockpit mode="page" />
}
