// Pure logic for the client window's "suppliers assigned" panel — the display
// type, the join-row shape, and the row mapper. Split from account-suppliers.ts
// because a 'use server' file may only export async functions (mirrors
// clients.ts / clients-logic.ts). Unit-tested.

export interface AccountSupplierListItem {
  id: string
  supplierId: string
  supplierName: string
  supplierCountry: string | null
  note: string | null
  createdAt: string
}

// ── Raw join shape (Supabase returns a nested relation as object|array) ──────
type Nested<T> = T | T[] | null
interface RawSupplierJoin {
  name: string | null
  country: string | null
}

export interface RawAccountSupplierRow {
  id: string
  supplier_id: string
  note: string | null
  created_at: string
  suppliers: Nested<RawSupplierJoin>
}

function one<T>(v: Nested<T>): T | null {
  if (Array.isArray(v)) return v.length > 0 ? v[0] : null
  return v ?? null
}

/** PURE: raw joined row → the flat display item. */
export function mapAccountSupplierRow(row: RawAccountSupplierRow): AccountSupplierListItem {
  const supplier = one(row.suppliers)
  return {
    id: row.id,
    supplierId: row.supplier_id,
    supplierName: supplier?.name ?? '',
    supplierCountry: supplier?.country ?? null,
    note: row.note,
    createdAt: row.created_at,
  }
}

export const ACCOUNT_SUPPLIER_SELECT = 'id,supplier_id,note,created_at,suppliers(name,country)'
