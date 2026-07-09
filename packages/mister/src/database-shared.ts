// @wings/mister — the few database value types the Mister contract references.
// Byte-identical copies of apps/site src/types/database.ts so the package carries
// no app import. Keep in sync if the app definitions ever change.

export type TprCompleteness = 'partial' | 'minimum' | 'standard' | 'complete'

export type FreeZone = 'ZOFRATACNA' | 'ZOFRI'

export interface ConversationTurn {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  tpr_fields_captured?: string[]
  isEntryMessage?: boolean
}
