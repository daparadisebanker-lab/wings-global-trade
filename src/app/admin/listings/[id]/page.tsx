import { notFound } from "next/navigation";
import { getListings } from "@data/listings";
import ImageUploader from "./ImageUploader";
import { createClient } from "@/lib/supabase/server";

export default async function EditListingPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: listing } = await supabase
    .from("listings")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!listing) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-base font-semibold leading-6 text-gray-900">
            Edit Listing: {listing.brand} {listing.model}
          </h3>
          <div className="mt-2 max-w-xl text-sm text-gray-500">
            <p>Manage the image gallery for this tractor. Images are uploaded directly to the database.</p>
          </div>
          
          <div className="mt-6">
            <ImageUploader listingId={listing.id} existingImages={listing.images || []} />
          </div>
        </div>
      </div>
    </div>
  );
}
