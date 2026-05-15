import { createClient } from "@/lib/supabase/server";
import type { Listing } from "@/types";

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

// ── Fetch listings with optional filters applied server-side ──────────────────
export async function getListings(filters: ListingFilters = {}): Promise<Listing[]> {
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

  const { data, error } = await query;
  if (error) {
    console.error("[listings] Failed to fetch:", error.message);
    return [];
  }
  return (data ?? []) as Listing[];
}

// ── Single listing by slug ────────────────────────────────────────────────────
export async function getListingById(id: string): Promise<Listing | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error(`[listings] Failed to fetch ${id}:`, error.message);
    return null;
  }
  return data as Listing;
}

// ── Sidebar helpers ───────────────────────────────────────────────────────────
export async function getMakes(): Promise<string[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("listings").select("brand");
  if (error || !data) return [];
  return Array.from(new Set(data.map((r) => r.brand))).sort();
}

export async function getCountries(): Promise<string[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("listings").select("country");
  if (error || !data) return [];
  return Array.from(
    new Set(data.map((r) => r.country).filter(Boolean))
  ).sort() as string[];
}

export async function getAllListingIds(): Promise<string[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("listings").select("id");
  if (error || !data) return [];
  return data.map((r) => r.id as string);
}
