// src/components/ui/select.tsx
// Select primitive extracted to @wings/trade-ui (M3b); re-exported so existing
// importers are unchanged. DESTINATION_COUNTRIES is Wings/lane content and stays here.
export { Select } from '@wings/trade-ui'

/** Standard destination country options, Spanish-first. */
export const DESTINATION_COUNTRIES = [
  'Perú',
  'Chile',
  'Colombia',
  'Panamá',
  'Costa Rica',
  'Bolivia',
  'R. Dominicana',
  'Otro',
] as const
