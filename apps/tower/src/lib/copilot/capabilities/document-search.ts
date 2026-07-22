// Capability: Mister reads the drive (Slice 3D). The operator asks for a document
// in plain Spanish ("busca la ficha del montacargas X904", "¿tengo el certificado
// del proveedor Y?"); the model extracts clean search terms + an optional kind,
// and the RLS-scoped searchDocuments action returns the matches Mister lists (each
// openable). The model only turns a sentence into a query — the search itself, and
// what it can see, is the deterministic, RLS-gated action.
//
// This is the first capability that touches the DB: it runs server-side inside
// askMister, so it can call the server action directly.

import { INTELLIGENCE_MODELS } from '@/lib/ai/types'
import { extractJsonObject } from '@/lib/ai/parse'
import type { IntelligenceClient } from '@/lib/ai/client'
import { searchDocuments } from '@/lib/actions/documents'
import { DOCUMENT_KINDS, type DocumentKind } from '@/lib/actions/documents-logic'
import { textResult, type Capability, type CopilotResult } from '../types'

function kindOf(v: unknown): DocumentKind | null {
  return typeof v === 'string' && (DOCUMENT_KINDS as readonly string[]).includes(v) ? (v as DocumentKind) : null
}

const SYSTEM = `Eres Mister, el copiloto interno de Wings Global Trade. El operador busca un DOCUMENTO en el
drive (fichas técnicas, docs de proveedor, certificados, cotizaciones guardadas). Tu única tarea es
convertir su frase en términos de búsqueda — NO inventes documentos.

Responde SOLO con un objeto JSON, sin texto alrededor, con esta forma exacta:
{
  "understood": boolean,
  "query": string,   // los términos clave para buscar por TÍTULO (producto, proveedor, código…),
                     // sin muletillas como "busca", "la ficha de", "tengo el". Cadena vacía = listar recientes.
  "kind": "SPEC_SHEET"|"QUOTATION"|"SUPPLIER_DOC"|"CERTIFICATE"|"DOCUMENT"|null
}

Mapea: "ficha técnica"→SPEC_SHEET, "cotización"→QUOTATION, "doc/oferta de proveedor"→SUPPLIER_DOC,
"certificado"→CERTIFICATE. Si no piden un tipo concreto, kind=null. Si la frase NO trata de buscar
un documento, understood=false.`

export const documentSearchCapability: Capability = {
  id: 'document-search',
  router: {
    description:
      'Buscar un documento en el drive: fichas técnicas, docs de proveedor, certificados o cotizaciones guardadas.',
    examples: [
      'Busca la ficha técnica del montacargas X904',
      '¿Tengo el certificado del proveedor Ningbo?',
      'Muéstrame las cotizaciones guardadas de este cliente',
    ],
  },
  async run(client: IntelligenceClient, text: string): Promise<CopilotResult> {
    const raw = await client.complete({
      model: INTELLIGENCE_MODELS.classify,
      system: SYSTEM,
      user: text,
      maxTokens: 150,
    })
    const obj = extractJsonObject(raw)
    if (!obj || obj.understood === false) {
      return textResult(
        '¿Qué documento buscas? Dime el producto, proveedor o tipo. / What document are you after? Name the product, supplier, or kind.',
      )
    }

    const query = typeof obj.query === 'string' ? obj.query.trim() : ''
    const kind = kindOf(obj.kind)

    const res = await searchDocuments(query, kind)
    if (res.error) {
      return textResult('No pude buscar en el drive ahora. / I couldn’t search the drive right now.')
    }
    if (res.data.length === 0) {
      return textResult(
        query
          ? `No encontré documentos para “${query}”. / No documents found for “${query}”.`
          : 'No encontré documentos. / No documents found.',
      )
    }

    return { renderer: 'documents', note: undefined, data: { query, results: res.data } }
  },
}
