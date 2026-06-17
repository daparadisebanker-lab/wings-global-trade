// src/types/api.ts
// API request/response shapes shared between client and server.

import type { Category, Product } from '@/types/database'
import type { CifEstimate } from '@/types/accio'

export interface ApiError {
  error: string
  code: string
  details?: unknown
}

export interface CategoriesResponse {
  categories: Category[]
}

export interface ProductsResponse {
  products: Product[]
  total: number
  limit: number
  offset: number
}

export interface ProductResponse {
  product: Product
}

export interface CatalogLeadRequest {
  full_name: string
  company?: string
  email: string
  phone: string
  destination_country: string
  product_id?: string
  product_name: string
  quantity: string
  message?: string
  source_url?: string
}

export interface CatalogLeadResponse {
  lead_id: string
  message: string
}

export interface ContactLeadRequest {
  full_name: string
  email: string
  phone?: string
  message: string
}

export interface ContactLeadResponse {
  lead_id: string
}

export interface EstimateResponse {
  estimate: CifEstimate
}

export interface AccioSubmitResponse {
  lead_id: string
  project_id: string
  message: string
}
