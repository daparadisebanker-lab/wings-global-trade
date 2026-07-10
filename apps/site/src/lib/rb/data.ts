// src/lib/rb/data.ts
// Server-side loaders for the Represented Brands public contract:
// public.rb_public_brands / rb_public_templates / rb_public_containers
// (views over the tower schema — the ONLY surfaces the site reads) plus the
// public.rb_reserve RPC wrapper. Service role only; never import client-side.
//
// When Supabase is unconfigured (dev without env), everything falls back to
// the SPEC §6 fixtures so the shelf still renders — same policy as insertLead.

import { createServiceClient } from '@/lib/supabase/server'
import {
  ALADIN_CONTAINERS,
  ALADIN_TEMPLATE_40HC,
  type RbContainerTemplate,
  type RbPublicContainer,
} from '@/lib/rb/fixtures'

const KIND_LABELS: Record<string, string> = {
  '20GP': "20' Standard · 33 m³",
  '40GP': "40' Standard · 67 m³",
  '40HC': "40' High Cube · 76 m³",
  REEFER: "40' Reefer",
}

interface TemplateRow {
  ref: string
  kind: string
  total_slots: number
  packages_per_slot: number
  packets_per_package: number
  units_per_package: number
  unit_name_plural: string
  package_kg: number | string
  max_packages: number
  governing_bound: string
  brand_slug: string
}

interface ContainerRow {
  id: string
  code: string
  route: { origin?: string; destination?: string } | null
  closes_at: string | null
  template_ref: string
  brand_slug: string
  total_slots: number
  committed_slots: number
  reserved_slots: number
}

function mapTemplate(row: TemplateRow): RbContainerTemplate {
  return {
    ref: row.ref,
    kind: row.kind as RbContainerTemplate['kind'],
    kindLabel: KIND_LABELS[row.kind] ?? row.kind,
    productSlug: '',
    totalPackages: row.max_packages,
    totalSlots: row.total_slots,
    packagesPerSlot: row.packages_per_slot,
    packetsPerPackage: row.packets_per_package,
    unitsPerPackage: row.units_per_package,
    unitNamePlural: row.unit_name_plural,
    packageKg: Number(row.package_kg),
    governingBound: row.governing_bound as RbContainerTemplate['governingBound'],
  }
}

function mapContainer(row: ContainerRow): RbPublicContainer {
  return {
    id: row.id,
    code: row.code,
    templateRef: row.template_ref,
    route: { origin: row.route?.origin ?? '—', destination: row.route?.destination ?? 'Callao' },
    closesAt: row.closes_at ?? '',
    slots: {
      total: row.total_slots,
      committed: row.committed_slots,
      reserved: row.reserved_slots,
    },
  }
}

export async function getRbTemplateForBrand(brandSlug: string): Promise<RbContainerTemplate | null> {
  const supabase = createServiceClient()
  if (!supabase) return brandSlug === 'aladin' ? ALADIN_TEMPLATE_40HC : null
  const { data, error } = await supabase
    .from('rb_public_templates')
    .select('*')
    .eq('brand_slug', brandSlug)
    .limit(1)
    .maybeSingle()
  if (error) throw new Error(`rb_public_templates read failed: ${error.message}`)
  return data ? mapTemplate(data as TemplateRow) : null
}

export async function getRbTemplateByRef(ref: string): Promise<RbContainerTemplate | null> {
  const supabase = createServiceClient()
  if (!supabase) return ref === ALADIN_TEMPLATE_40HC.ref ? ALADIN_TEMPLATE_40HC : null
  const { data, error } = await supabase
    .from('rb_public_templates')
    .select('*')
    .eq('ref', ref)
    .maybeSingle()
  if (error) throw new Error(`rb_public_templates read failed: ${error.message}`)
  return data ? mapTemplate(data as TemplateRow) : null
}

export async function getRbContainers(brandSlug: string): Promise<RbPublicContainer[]> {
  const supabase = createServiceClient()
  if (!supabase) return brandSlug === 'aladin' ? ALADIN_CONTAINERS : []
  const { data, error } = await supabase
    .from('rb_public_containers')
    .select('*')
    .eq('brand_slug', brandSlug)
    .order('closes_at', { ascending: true })
  if (error) throw new Error(`rb_public_containers read failed: ${error.message}`)
  return ((data ?? []) as ContainerRow[]).map(mapContainer)
}

export async function getRbContainerById(id: string): Promise<RbPublicContainer | null> {
  const supabase = createServiceClient()
  if (!supabase) return ALADIN_CONTAINERS.find((c) => c.id === id) ?? null
  const { data, error } = await supabase
    .from('rb_public_containers')
    .select('*')
    .eq('id', id)
    .maybeSingle()
  if (error) throw new Error(`rb_public_containers read failed: ${error.message}`)
  return data ? mapContainer(data as ContainerRow) : null
}

export interface RbReserveResult {
  ok: boolean
  allocationId?: string
  reason?: 'insufficient' | 'closed' | 'not_found'
}

/** Atomic slot reservation through public.rb_reserve (row-locked in tower).
 *  Dev fallback: no DB → pretend-success so the flow remains drivable. */
export async function reserveRbSlots(params: {
  containerId: string
  slots: number
  leadId: string
  quantityUnits: number
}): Promise<RbReserveResult> {
  const supabase = createServiceClient()
  if (!supabase) {
    console.info('[rb] (dev — no Supabase) allocation would be inserted:', params)
    return { ok: true, allocationId: crypto.randomUUID() }
  }
  const { data, error } = await supabase.rpc('rb_reserve', {
    p_container: params.containerId,
    p_slots: params.slots,
    p_lead: params.leadId,
    p_quantity_units: params.quantityUnits,
  })
  if (error) {
    if (error.message.includes('RB_INSUFFICIENT_SLOTS')) return { ok: false, reason: 'insufficient' }
    if (error.message.includes('RB_CONTAINER_CLOSED')) return { ok: false, reason: 'closed' }
    if (error.message.includes('RB_CONTAINER_NOT_FOUND')) return { ok: false, reason: 'not_found' }
    throw new Error(`rb_reserve failed: ${error.message}`)
  }
  return { ok: true, allocationId: data as string }
}
