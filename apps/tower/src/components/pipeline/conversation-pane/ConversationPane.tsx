'use client'

// Mister transcript + WhatsApp thread inline — "the record IS the
// conversation" (COMPONENT_TREE §2 <ConversationPane>). Data comes from the
// W3.C contract (`@/lib/conversations#getConversation`, merged Mister +
// WhatsApp), fetched through `fetchConversation` (lib/actions/pipeline.ts) so
// this component never talks to Supabase directly. Starts from
// `initialConversation` (fetched server-side in the RSC page) and offers a
// manual refresh for entries that arrived since the page loaded.
import { useState, useTransition } from 'react'
import { fetchConversation } from '@/lib/actions/pipeline'
import type { Conversation, ConversationEntry } from '@/lib/conversations'

const ROLE_LABEL: Record<ConversationEntry['role'], string> = {
  buyer: 'Cliente / Client',
  advisor: 'Wings',
  system: 'Sistema / System',
}

// The buyer is the inbound side; advisor/system are Wings' side.
function isInbound(role: ConversationEntry['role']): boolean {
  return role === 'buyer'
}

function formatAt(iso: string): string {
  try {
    return new Date(iso).toLocaleString('es-PE', { dateStyle: 'short', timeStyle: 'short' })
  } catch {
    return iso
  }
}

export function ConversationPane({ rfqId, initialConversation }: { rfqId: string; initialConversation: Conversation }) {
  const [conversation, setConversation] = useState<Conversation>(initialConversation)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleRefresh() {
    setError(null)
    startTransition(async () => {
      const result = await fetchConversation(rfqId)
      if (result.error) {
        setError(result.error.message)
        return
      }
      setConversation(result.data)
    })
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="font-mono text-label uppercase tracking-[0.1em] text-ink-secondary">
          Conversación / Conversation
        </h3>
        <button
          type="button"
          onClick={handleRefresh}
          disabled={isPending}
          className="font-mono text-label uppercase tracking-[0.08em] text-ink-secondary hover:text-lane-accent disabled:opacity-40"
        >
          Actualizar / Refresh
        </button>
      </div>

      {error ? (
        <p role="alert" className="font-ui text-t0 text-negative">
          {error}
        </p>
      ) : null}

      {conversation.entries.length === 0 ? (
        <p className="font-ui text-t0 text-ink-secondary">Sin mensajes todavía / No messages yet.</p>
      ) : (
        <ol className="flex flex-col gap-2">
          {conversation.entries.map((e, i) => (
            <li
              key={i}
              className={`flex flex-col gap-1 rounded-card border border-line p-3 ${
                isInbound(e.role) ? 'bg-surface-0' : 'bg-surface-1'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="font-mono text-label uppercase tracking-[0.08em] text-lane-accent">
                  {e.source} · {ROLE_LABEL[e.role]}
                </span>
                <span className="font-mono text-label text-ink-secondary" data-numeric>
                  {formatAt(e.at)}
                </span>
              </div>
              <p className="font-ui text-t0 text-ink-primary">{e.text}</p>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}
