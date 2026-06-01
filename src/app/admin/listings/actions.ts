"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Listing } from "@/types";

export type ListingInput = Omit<Listing, "id" | "created_at" | "updated_at">;

export async function createListing(input: ListingInput): Promise<{ id: string }> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("listings")
    .insert([input])
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  revalidatePath("/admin");
  return { id: data.id as string };
}

export async function updateListing(id: string, input: Partial<ListingInput>): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("listings")
    .update(input)
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin");
  revalidatePath(`/admin/listings/${id}`);
  revalidatePath(`/agricultural/tractors/${id}`);
}

export async function deleteListing(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("listings").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin");
}
