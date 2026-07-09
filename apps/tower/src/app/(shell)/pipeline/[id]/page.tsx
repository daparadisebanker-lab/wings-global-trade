import { EmptyState } from '@/components/ui/EmptyState'
import { RfqDetail } from '@/components/pipeline/rfq-detail'
import { fetchConversation, getPipelineCapabilities, getRfq, listLines, listQuotes } from '@/lib/actions/pipeline'

export default async function RfqDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const rfqResult = await getRfq(id)
  if (rfqResult.error) {
    return (
      <EmptyState
        tag="PIP · RFQ"
        title={{ es: 'RFQ no encontrado', en: 'RFQ not found' }}
        description={{
          es: 'No existe o no tienes acceso a este RFQ.',
          en: 'It does not exist or you have no access to this RFQ.',
        }}
      />
    )
  }

  const rfq = rfqResult.data

  const [linesResult, quotesResult, capsResult, conversationResult] = await Promise.all([
    listLines(rfq.id),
    listQuotes(rfq.id),
    getPipelineCapabilities(rfq.laneId),
    fetchConversation(rfq.id),
  ])

  const capabilities = capsResult.data ?? {
    canCreateRfq: false,
    canEditLines: false,
    canAdvanceStage: false,
    canComposeQuote: false,
    canSendQuote: false,
    canMarkQuoteStatus: false,
    canConvertToOrder: false,
  }

  return (
    <RfqDetail
      rfq={rfq}
      capabilities={capabilities}
      initialLines={linesResult.data ?? []}
      initialQuotes={quotesResult.data ?? []}
      initialConversation={conversationResult.data ?? { rfqId: rfq.id, entries: [] }}
    />
  )
}
