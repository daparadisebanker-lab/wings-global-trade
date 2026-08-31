// src/lib/notifications/types.ts
// Shared notification payload shapes.

import type { LeadBuyerType } from '@/types/database'

export interface CatalogNotificationPayload {
  flow: 'catalog'
  full_name: string
  company?: string | null
  destination_country: string
  product_name: string
  quantity: string
  buyer_type?: LeadBuyerType | null
  phone: string
  email: string
  message?: string | null
}

export interface ContactNotificationPayload {
  flow: 'contact'
  full_name: string
  email: string
  phone?: string | null
  message: string
}

export interface MisterNotificationPayload {
  flow: 'mister'
  full_name: string
  company?: string | null
  destination_country: string
  product_description: string
  quantity: string
  target_price_usd?: number | null
  cif_total_usd?: number | null
  free_zone?: string | null
  phone: string
  email: string
}

export type NotificationPayload =
  | CatalogNotificationPayload
  | ContactNotificationPayload
  | MisterNotificationPayload
