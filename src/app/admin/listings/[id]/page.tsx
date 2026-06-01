import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ListingForm from "@/components/admin/ListingForm";
import ImageUploader from "./ImageUploader";
import type { Listing } from "@/types";

export default async function EditListingPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: listing, error } = await supabase
    .from("listings")
    .select("*")
    .eq("id", params.id)
    .single();

  if (error || !listing) {
    notFound();
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {listing.brand} {listing.model}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Edit all product details below, then click Save Changes.
        </p>
      </div>

      <ListingForm mode="edit" listing={listing as Listing} />

      {/* Image management — kept separate so saves don't affect it */}
      <div className="mt-8 bg-white shadow sm:rounded-lg px-4 py-5 sm:p-6">
        <div className="border-b border-gray-200 pb-3 mb-5">
          <h3 className="text-base font-semibold text-gray-900">Product Images</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Upload, view, and delete photos for this product. Images are saved instantly.
          </p>
        </div>
        <ImageUploader listingId={listing.id} existingImages={listing.images ?? []} />
      </div>
    </div>
  );
}
