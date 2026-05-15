"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function addImageUrlToListing(listingId: string, publicUrl: string) {
  const supabase = await createClient();

  // 1. Get current images
  const { data: listing, error: fetchError } = await supabase
    .from("listings")
    .select("images")
    .eq("id", listingId)
    .single();

  if (fetchError || !listing) throw new Error("Could not fetch listing");

  const newImages = [...(listing.images || []), publicUrl];

  // 2. Update with new array
  const { error: updateError } = await supabase
    .from("listings")
    .update({ images: newImages })
    .eq("id", listingId);

  if (updateError) throw new Error("Could not update listing images");

  revalidatePath(`/admin/listings/${listingId}`);
  revalidatePath(`/agricultural/tractors/${listingId}`);
  return { success: true };
}

export async function removeImageUrlFromListing(listingId: string, urlToRemove: string) {
  const supabase = await createClient();

  const { data: listing } = await supabase
    .from("listings")
    .select("images")
    .eq("id", listingId)
    .single();

  if (!listing) return { success: false };

  const newImages = (listing.images || []).filter((u: string) => u !== urlToRemove);

  const { error } = await supabase
    .from("listings")
    .update({ images: newImages })
    .eq("id", listingId);

  if (error) throw new Error("Could not delete image");

  revalidatePath(`/admin/listings/${listingId}`);
  revalidatePath(`/agricultural/tractors/${listingId}`);
  return { success: true };
}
