"use client";

import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { addImageUrlToListing, removeImageUrlFromListing } from "./actions";

interface Props {
  listingId: string;
  existingImages: string[];
}

export default function ImageUploader({ listingId, existingImages }: Props) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize Supabase client
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);

    try {
      // 1. Upload to Supabase Storage
      const fileExt = file.name.split(".").pop();
      const fileName = `${listingId}-${Math.random()}.${fileExt}`;
      const filePath = `listings/${fileName}`; // Path inside the bucket

      const { error: uploadError } = await supabase.storage
        .from("listing-images")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Get public URL
      const { data } = supabase.storage.from("listing-images").getPublicUrl(filePath);
      
      // 3. Update DB via server action
      await addImageUrlToListing(listingId, data.publicUrl);
    } catch (err: any) {
      setError(err.message || "Failed to upload image.");
    } finally {
      setIsUploading(false);
      e.target.value = ''; // reset input
    }
  };

  const handleDelete = async (url: string) => {
    if (!confirm("Are you sure you want to delete this image?")) return;
    
    try {
      // 1. Remove from DB via Server Action
      await removeImageUrlFromListing(listingId, url);
      
      // 2. We could optionally delete from storage bucket to save space, but keeping it simple for now.
      // The file path is everything after /listing-images/
      const pathMatch = url.match(/listing-images\/(.+)$/);
      if (pathMatch && pathMatch[1]) {
         await supabase.storage.from("listing-images").remove([pathMatch[1]]);
      }
    } catch (err: any) {
      setError(err.message || "Failed to delete image.");
    }
  };

  return (
    <div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 mb-6">
        {existingImages.map((img, i) => (
          <div key={i} className="relative group aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img} alt={`Image ${i + 1}`} className="w-full h-full object-cover" />
            <button
              onClick={() => handleDelete(img)}
              className="absolute top-2 right-2 bg-red-600 text-white p-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity"
              title="Delete Image"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      <div className="flex items-center justify-center w-full">
        <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-48 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            {isUploading ? (
              <p className="text-sm text-gray-500">Uploading...</p>
            ) : (
              <>
                <svg className="w-8 h-8 mb-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                </svg>
                <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                <p className="text-xs text-gray-500">PNG, JPG or WEBP (MAX. 5MB)</p>
              </>
            )}
          </div>
          <input id="dropzone-file" type="file" className="hidden" accept="image/*" onChange={handleFileChange} disabled={isUploading} />
        </label>
      </div>
    </div>
  );
}
