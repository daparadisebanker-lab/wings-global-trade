'use server'

// src/lib/actions/rb-diagrams.ts
// RB diagram-geometry mutations (RB Console Wave 4, Ch 04 · SPEC R1/R2). The
// write-side for tower.rb_diagram_specs (tower_45) — the BOUNDED parametric
// geometry a product's technical package drawing is derived from. Root §5-bis /
// R1: geometry lives OUTSIDE the spec value; this is its ONE home.
//
// TOWER mutation law: auth (requireUser) → Zod parse → RLS-scoped query. RLS
// (has_rb_role, join-through-parent to rb_products — tower_45 §45.3) is the ONLY
// permission boundary; this file never gates with `if (role === …)`. Numbers are
// brand assets (Directive 5): integer mm + integer counts, no money, no float.
import { z } from 'zod'
import type { SupabaseClient } from '@supabase/supabase-js'
import { createServerSupabase } from '@/lib/supabase/server'
import { fail, ok, type ActionResult } from './result'

type TowerClient = ReturnType<SupabaseClient['schema']>

const uuidSchema = z.string().uuid()

// ── Row shape (camelCase, mirrors tower.rb_diagram_specs) ─────────────────────
export interface RbDiagramSpecRow {
  id: string
  rbProductId: string
  packageLengthMm: number
  packageWidthMm: number
  packageHeightMm: number
  unitsPerPackage: number
  packagesPerSlot: number
  cellsAcross: number
  cellsHigh: number
  cellsDeep: number
  detail: 'rolls' | 'slabs'
  caption: string | null
  updatedAt: string
}

interface RawRbDiagramSpecRow {
  id: string
  rb_product_id: string
  package_length_mm: number
  package_width_mm: number
  package_height_mm: number
  units_per_package: number
  packages_per_slot: number
  cells_across: number
  cells_high: number
  cells_deep: number
  detail: string
  caption: string | null
  updated_at: string
}

const SELECT_COLS =
  'id,rb_product_id,package_length_mm,package_width_mm,package_height_mm,units_per_package,packages_per_slot,cells_across,cells_high,cells_deep,detail,caption,updated_at'

function mapRow(row: RawRbDiagramSpecRow): RbDiagramSpecRow {
  return {
    id: row.id,
    rbProductId: row.rb_product_id,
    packageLengthMm: row.package_length_mm,
    packageWidthMm: row.package_width_mm,
    packageHeightMm: row.package_height_mm,
    unitsPerPackage: row.units_per_package,
    packagesPerSlot: row.packages_per_slot,
    cellsAcross: row.cells_across,
    cellsHigh: row.cells_high,
    cellsDeep: row.cells_deep,
    detail: row.detail === 'rolls' ? 'rolls' : 'slabs',
    caption: row.caption,
    updatedAt: row.updated_at,
  }
}

// ── Zod input — the bounded geometry (mirrors the tower_45 CHECK) ─────────────
const dimSchema = z.number().int().positive().max(100_000) // mm, generous ceiling
const countSchema = z.number().int().positive().max(100_000)
const cellSchema = z.number().int().positive().max(999)

const diagramInputSchema = z.object({
  packageLengthMm: dimSchema,
  packageWidthMm: dimSchema,
  packageHeightMm: dimSchema,
  unitsPerPackage: countSchema,
  packagesPerSlot: countSchema,
  cellsAcross: cellSchema.default(1),
  cellsHigh: cellSchema.default(1),
  cellsDeep: cellSchema.default(1),
  detail: z.enum(['rolls', 'slabs']).default('slabs'),
  caption: z.string().trim().max(200).nullable().optional(),
})
export type RbDiagramSpecInput = z.input<typeof diagramInputSchema>

// ── Auth helper (RLS client) — identical to rb-catalog.ts ─────────────────────
async function requireUser() {
  const supabase = await createServerSupabase()
  if (!supabase) return { ok: false, error: fail('UNAUTHORIZED', 'Auth no configurado / Auth not configured') } as const
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: fail('UNAUTHORIZED', 'Sesión requerida / Session required') } as const
  return { ok: true, supabase: supabase.schema('tower') as TowerClient, user } as const
}

/** Read a product's diagram geometry (by rb_product_id) for editor prefill and
 *  the tech-sheet / fiche render. RLS read (any RB role on the brand, resolved
 *  through the parent product); null when none has been authored yet. */
export async function getRbDiagramSpec(rbProductId: string): Promise<ActionResult<RbDiagramSpecRow | null>> {
  const gate = await requireUser()
  if (!gate.ok) return gate.error
  const idParsed = uuidSchema.safeParse(rbProductId)
  if (!idParsed.success) return fail('VALIDATION', 'ID de producto inválido / Invalid product id')

  const { data, error } = await gate.supabase
    .from('rb_diagram_specs')
    .select(SELECT_COLS)
    .eq('rb_product_id', idParsed.data)
    .maybeSingle()
  if (error) return fail('VALIDATION', 'No se pudo leer la geometría / Could not read diagram geometry')
  return ok(data ? mapRow(data as unknown as RawRbDiagramSpecRow) : null)
}

/** Create or update a product's diagram geometry. RLS (rb_diagram_specs_ins/upd,
 *  has_rb_role BRAND_MANAGER/BRAND_OPS join-through-parent) confines the write to a
 *  brand the caller manages/ops; the audit trigger (tower_45) logs it. One spec per
 *  product (unique rb_product_id) — upsert conflict-targets it. */
export async function upsertRbDiagramSpec(
  rbProductId: string,
  input: RbDiagramSpecInput,
): Promise<ActionResult<RbDiagramSpecRow>> {
  const gate = await requireUser()
  if (!gate.ok) return gate.error
  const idParsed = uuidSchema.safeParse(rbProductId)
  if (!idParsed.success) return fail('VALIDATION', 'ID de producto inválido / Invalid product id')
  const parsed = diagramInputSchema.safeParse(input)
  if (!parsed.success) return fail('VALIDATION', 'Datos inválidos / Invalid data', parsed.error.flatten().fieldErrors)

  const payload = {
    rb_product_id: idParsed.data,
    package_length_mm: parsed.data.packageLengthMm,
    package_width_mm: parsed.data.packageWidthMm,
    package_height_mm: parsed.data.packageHeightMm,
    units_per_package: parsed.data.unitsPerPackage,
    packages_per_slot: parsed.data.packagesPerSlot,
    cells_across: parsed.data.cellsAcross,
    cells_high: parsed.data.cellsHigh,
    cells_deep: parsed.data.cellsDeep,
    detail: parsed.data.detail,
    caption: parsed.data.caption ?? null,
    created_by: gate.user.id,
  }

  const { data, error } = await gate.supabase
    .from('rb_diagram_specs')
    .upsert(payload, { onConflict: 'rb_product_id' })
    .select(SELECT_COLS)
    .single()
  if (error) return fail('FORBIDDEN_LANE', 'No se pudo guardar la geometría / Could not save diagram geometry')
  return ok(mapRow(data as unknown as RawRbDiagramSpecRow))
}
