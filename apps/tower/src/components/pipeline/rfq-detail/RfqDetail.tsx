'use client'

// RFQ detail route (COMPONENT_TREE §2 `/pipeline/rfq/[id]`): stage stepper +
// owner/source header, LineItems, ConversationPane, QuoteComposer. Composes
// this wave's other owned components; <RFQHeader> from COMPONENT_TREE is
// rendered inline here rather than as its own file/component (not separately
// named in this wave's ownership list).
import { useState, useTransition } from 'react'
import { getStages } from '@/lib/archetypes'
import {
  updateStage,
  type OrderRow,
  type PipelineCapabilities,
  type QuoteRow,
  type RfqLineRow,
  type RfqRow,
} from '@/lib/actions/pipeline'
import type { Conversation } from '@/lib/conversations'
import { LineItems } from '@/components/pipeline/line-items'
import { QuoteComposer } from '@/components/pipeline/quote-composer'
import { JourneyPanel } from '@/components/pipeline/journey'
import { ConversationPane } from '@/components/pipeline/conversation-pane'

export function RfqDetail({
  rfq,
  capabilities,
  initialLines,
  initialQuotes,
  initialConversation,
}: {
  rfq: RfqRow
  capabilities: PipelineCapabilities
  initialLines: RfqLineRow[]
  initialQuotes: QuoteRow[]
  initialConversation: Conversation
}) {
  const [currentRfq, setCurrentRfq] = useState(rfq)
  const [lines, setLines] = useState(initialLines)
  const [quotes, setQuotes] = useState(initialQuotes)
  const [order, setOrder] = useState<OrderRow | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const stages = getStages(currentRfq.laneArchetype)

  function handleStageClick(stageId: string) {
    if (stageId === currentRfq.stage) return
    setError(null)
    startTransition(async () => {
      const result = await updateStage(currentRfq.id, stageId)
      if (result.error) {
        setError(result.error.message)
        return
      }
      setCurrentRfq(result.data)
    })
  }

  return (
    <div className="flex h-full flex-col gap-6 overflow-y-auto p-6">
      <header className="flex flex-col gap-3 border-b border-line pb-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h1 className="font-ui text-t2 text-ink-primary">
              {currentRfq.accountName ?? 'Sin cuenta / No account'}
            </h1>
            <span className="font-mono text-label uppercase tracking-[0.08em] text-ink-secondary">
              {currentRfq.laneSlug} · {currentRfq.laneArchetype} · {currentRfq.source}
            </span>
          </div>
          <span className="font-mono text-label text-ink-secondary" data-numeric>
            {currentRfq.currency}
          </span>
        </div>

        <nav aria-label="Etapa del RFQ / RFQ stage" className="flex flex-wrap items-center gap-1">
          {stages.map((s, i) => {
            const active = s.id === currentRfq.stage
            return (
              <button
                key={s.id}
                type="button"
                disabled={!capabilities.canAdvanceStage || isPending}
                onClick={() => handleStageClick(s.id)}
                aria-current={active ? 'step' : undefined}
                className={`rounded-card border px-3 py-1.5 font-mono text-label uppercase tracking-[0.06em] disabled:opacity-60 ${
                  active
                    ? 'border-lane-accent bg-surface-1 text-lane-accent'
                    : 'border-line text-ink-secondary hover:text-ink-primary'
                }`}
              >
                {i + 1}. {s.label.es}
              </button>
            )
          })}
        </nav>
      </header>

      {error ? (
        <p role="alert" className="font-ui text-t0 text-negative">
          {error}
        </p>
      ) : null}

      {order ? (
        <p role="status" className="font-mono text-t0 text-positive" data-numeric>
          Pedido creado / Order created: {order.id} ({order.status})
        </p>
      ) : null}

      <section className="flex flex-col gap-2">
        <h2 className="font-mono text-label uppercase tracking-[0.1em] text-ink-secondary">Líneas / Line items</h2>
        <LineItems
          rfqId={currentRfq.id}
          laneId={currentRfq.laneId}
          archetype={currentRfq.laneArchetype}
          currency={currentRfq.currency}
          lines={lines}
          canEdit={capabilities.canEditLines}
          onLinesChange={setLines}
        />
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="font-mono text-label uppercase tracking-[0.1em] text-ink-secondary">Cotización / Quote</h2>
        <QuoteComposer
          rfqId={currentRfq.id}
          archetype={currentRfq.laneArchetype}
          currency={currentRfq.currency}
          rfqLines={lines}
          quotes={quotes}
          capabilities={capabilities}
          hasAccount={Boolean(currentRfq.accountId)}
          onQuotesChange={setQuotes}
          onOrderCreated={setOrder}
        />
        {quotes[0] ? <JourneyPanel quoteId={quotes[0].id} /> : null}
      </section>

      <section className="flex flex-col gap-2">
        <ConversationPane rfqId={currentRfq.id} initialConversation={initialConversation} />
      </section>
    </div>
  )
}
