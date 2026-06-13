import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Listing } from "@/types";

export const metadata = { title: "Catalog Management — Admin" };

async function getListings(): Promise<{ listings: Listing[]; error: boolean }> {
  try {
    const supabase = await createClient();
    const { data, error } = await Promise.race([
      supabase.from("listings").select("*").order("created_at", { ascending: false }),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error("timeout")), 3000)),
    ]);
    if (error) throw error;
    return { listings: (data ?? []) as Listing[], error: false };
  } catch {
    return { listings: [], error: true };
  }
}

export default async function CatalogPage() {
  const { listings, error } = await getListings();

  const stats = {
    total: listings.length,
    newCount: listings.filter((l) => l.condition === "new").length,
    usedCount: listings.filter((l) => l.condition === "used").length,
    noImages: listings.filter((l) => !l.images?.length).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/admin" className="text-sm text-gray-400 hover:text-gray-600">
              Admin
            </Link>
            <span className="text-gray-300">/</span>
            <span className="text-sm text-gray-600">Catalog</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Product Catalog</h1>
          <p className="text-sm text-gray-500 mt-1">
            {error ? "Database unavailable — showing cached state." : `${listings.length} listing${listings.length !== 1 ? "s" : ""} in Supabase.`}
          </p>
        </div>
        <Link
          href="/admin/listings/new"
          className="inline-flex items-center gap-2 rounded-md bg-[#004389] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#1459A8] transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Product
        </Link>
      </div>

      {/* Supabase warning */}
      {error && (
        <div className="rounded-md bg-yellow-50 border border-yellow-200 p-4">
          <div className="flex gap-3">
            <svg className="w-5 h-5 text-yellow-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-yellow-800">Database not reachable</p>
              <p className="text-xs text-yellow-700 mt-0.5">
                Supabase is offline or paused.{" "}
                <a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer" className="underline">
                  Resume the project →
                </a>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      {!error && listings.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: "Total", value: stats.total, color: "text-gray-900" },
            { label: "New", value: stats.newCount, color: "text-green-700" },
            { label: "Used", value: stats.usedCount, color: "text-yellow-700" },
            { label: "No Images", value: stats.noImages, color: "text-red-600" },
          ].map((s) => (
            <div key={s.label} className="bg-white shadow-sm rounded-lg p-4 border border-gray-100">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{s.label}</p>
              <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Listings table */}
      <div className="bg-white shadow-sm sm:rounded-lg overflow-hidden border border-gray-100">
        {listings.length === 0 && !error ? (
          <div className="text-center py-16">
            <svg className="mx-auto w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="mt-3 text-sm text-gray-500">No products yet.</p>
            <Link href="/admin/listings/new" className="mt-4 inline-block text-sm font-medium text-[#004389] hover:underline">
              Add your first product →
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-3 pl-4 pr-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide sm:pl-6">Product</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Category</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Year</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Price</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Condition</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Images</th>
                  <th className="relative py-3 pl-3 pr-4 sm:pr-6"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {listings.map((listing) => (
                  <tr key={listing.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3.5 pl-4 pr-3 sm:pl-6">
                      <div className="font-medium text-sm text-gray-900">{listing.brand} {listing.model}</div>
                      <div className="text-xs text-gray-400 truncate max-w-[200px]">{listing.title}</div>
                    </td>
                    <td className="px-3 py-3.5 text-sm text-gray-500 hidden sm:table-cell">
                      {(listing.details as { category?: string })?.category ?? <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-3 py-3.5 text-sm text-gray-500">{listing.year || "—"}</td>
                    <td className="px-3 py-3.5 text-sm text-gray-700 font-mono">
                      {listing.price ? `${listing.currency} ${listing.price.toLocaleString()}` : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-3 py-3.5">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        listing.condition === "new"
                          ? "bg-green-50 text-green-700"
                          : listing.condition === "used"
                          ? "bg-yellow-50 text-yellow-700"
                          : "bg-blue-50 text-blue-700"
                      }`}>
                        {listing.condition}
                      </span>
                    </td>
                    <td className="px-3 py-3.5 text-sm hidden md:table-cell">
                      <span className={listing.images?.length ? "text-gray-600" : "text-red-400 font-medium"}>
                        {listing.images?.length ?? 0} photo{(listing.images?.length ?? 0) !== 1 ? "s" : ""}
                      </span>
                    </td>
                    <td className="py-3.5 pl-3 pr-4 sm:pr-6 text-right">
                      <Link
                        href={`/admin/listings/${listing.id}`}
                        className="text-sm font-medium text-[#004389] hover:text-[#1459A8] transition-colors"
                      >
                        Edit →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
