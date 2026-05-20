import { createClient } from "@/lib/supabase/server";
import type { Listing } from "@/types";
import catalogRaw from "./product-catalog.json";

// ── Filter shape ──────────────────────────────────────────────────────────────
export type ListingFilters = {
  brand?:     string | string[];
  condition?: string | string[];
  country?:   string;
  yearFrom?:  number;
  yearTo?:    number;
  priceMin?:  number;
  priceMax?:  number;
  hpMin?:     number;
  hpMax?:     number;
  sort?:      string;
};

// ── Catalog fallback — map JSON catalog entries to Listing shape ──────────────
const catalogListings: Listing[] = (
  catalogRaw as { products: Record<string, unknown>[] }
).products.map((p) => ({
  id:           String(p.id ?? ""),
  title:        String(p.title ?? ""),
  brand:        String(p.brand ?? ""),
  model:        String(p.model ?? ""),
  year:         Number(p.year ?? new Date().getFullYear()),
  price:        Number(p.price ?? 0),
  currency:     String(p.currency ?? "USD"),
  hours_used:   null,
  horsepower:   p.horsepower != null ? Number(p.horsepower) : null,
  condition:    (p.condition as "new" | "used" | "refurbished") ?? "new",
  location:     String(p.location ?? ""),
  country:      String(p.country ?? ""),
  description:  String(p.description ?? ""),
  images:       Array.isArray(p.images) ? (p.images as string[]) : [],
  transmission: p.transmission != null ? String(p.transmission) : null,
  drive_type:   p.drive_type != null ? String(p.drive_type) : null,
  details:      (p.details ?? {}) as Listing["details"],
}));

// ── Race a promise against a 1.5-second deadline ──────────────────────────────
function withTimeout<T>(promise: PromiseLike<T>, ms = 1500): Promise<T> {
  return Promise.race([
    Promise.resolve(promise),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("supabase_timeout")), ms)
    ),
  ]);
}

// ── Apply client-side filters to catalog fallback ─────────────────────────────
function applyFilters(listings: Listing[], filters: ListingFilters): Listing[] {
  let result = listings;
  if (filters.brand) {
    const brands = Array.isArray(filters.brand) ? filters.brand : [filters.brand];
    result = result.filter((l) => brands.includes(l.brand));
  }
  if (filters.condition) {
    const conds = Array.isArray(filters.condition) ? filters.condition : [filters.condition];
    result = result.filter((l) => conds.includes(l.condition));
  }
  if (filters.country)  result = result.filter((l) => l.country === filters.country);
  if (filters.yearFrom) result = result.filter((l) => l.year >= filters.yearFrom!);
  if (filters.yearTo)   result = result.filter((l) => l.year <= filters.yearTo!);
  if (filters.priceMin) result = result.filter((l) => l.price >= filters.priceMin!);
  if (filters.priceMax) result = result.filter((l) => l.price <= filters.priceMax!);
  if (filters.hpMin)    result = result.filter((l) => (l.horsepower ?? 0) >= filters.hpMin!);
  if (filters.hpMax)    result = result.filter((l) => (l.horsepower ?? 0) <= filters.hpMax!);
  switch (filters.sort) {
    case "price-asc":  result = [...result].sort((a, b) => a.price - b.price); break;
    case "price-desc": result = [...result].sort((a, b) => b.price - a.price); break;
    case "hp-asc":     result = [...result].sort((a, b) => (a.horsepower ?? 0) - (b.horsepower ?? 0)); break;
    case "hp-desc":    result = [...result].sort((a, b) => (b.horsepower ?? 0) - (a.horsepower ?? 0)); break;
  }
  return result;
}

// ── Fetch listings with optional filters applied server-side ──────────────────
export async function getListings(filters: ListingFilters = {}): Promise<Listing[]> {
  try {
    const supabase = await createClient();

    let query = supabase.from("listings").select("*");

    if (filters.brand) {
      if (Array.isArray(filters.brand)) query = query.in("brand", filters.brand);
      else query = query.eq("brand", filters.brand);
    }
    if (filters.condition) {
      if (Array.isArray(filters.condition)) query = query.in("condition", filters.condition);
      else query = query.eq("condition", filters.condition);
    }
    if (filters.country)   query = query.eq("country",   filters.country);
    if (filters.yearFrom)  query = query.gte("year",      filters.yearFrom);
    if (filters.yearTo)    query = query.lte("year",      filters.yearTo);
    if (filters.priceMin)  query = query.gte("price",     filters.priceMin);
    if (filters.priceMax)  query = query.lte("price",     filters.priceMax);
    if (filters.hpMin)     query = query.gte("horsepower", filters.hpMin);
    if (filters.hpMax)     query = query.lte("horsepower", filters.hpMax);

    switch (filters.sort) {
      case "price-asc":   query = query.order("price",      { ascending: true,  nullsFirst: false }); break;
      case "price-desc":  query = query.order("price",      { ascending: false, nullsFirst: false }); break;
      case "hp-asc":      query = query.order("horsepower", { ascending: true,  nullsFirst: false }); break;
      case "hp-desc":     query = query.order("horsepower", { ascending: false, nullsFirst: false }); break;
      default:            query = query.order("created_at", { ascending: false });
    }

    const { data, error } = await withTimeout(query);
    if (error) throw error;
    return (data ?? []) as Listing[];
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg !== "supabase_timeout") console.error("[listings] Failed to fetch:", msg);
    return applyFilters(catalogListings, filters);
  }
}

// ── Single listing by slug ────────────────────────────────────────────────────
export async function getListingById(id: string): Promise<Listing | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await withTimeout(
      supabase.from("listings").select("*").eq("id", id).single()
    );
    if (error) throw error;
    return data as Listing;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg !== "supabase_timeout") console.error(`[listings] Failed to fetch ${id}:`, msg);
    return catalogListings.find((l) => l.id === id) ?? null;
  }
}

// ── Sidebar helpers ───────────────────────────────────────────────────────────
export async function getMakes(): Promise<string[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await withTimeout(supabase.from("listings").select("brand"));
    if (error) throw error;
    return Array.from(new Set((data ?? []).map((r) => r.brand))).sort();
  } catch {
    return Array.from(new Set(catalogListings.map((l) => l.brand))).sort();
  }
}

export async function getCountries(): Promise<string[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await withTimeout(supabase.from("listings").select("country"));
    if (error) throw error;
    return Array.from(
      new Set((data ?? []).map((r) => r.country).filter(Boolean))
    ).sort() as string[];
  } catch {
    return Array.from(
      new Set(catalogListings.map((l) => l.country).filter(Boolean))
    ).sort();
  }
}

export async function getAllListingIds(): Promise<string[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await withTimeout(supabase.from("listings").select("id"));
    if (error) throw error;
    return (data ?? []).map((r) => r.id as string);
  } catch {
    return catalogListings.map((l) => l.id);
  }
}
