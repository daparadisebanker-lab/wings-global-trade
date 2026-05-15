import Link from "next/link";
import { getListings } from "@data/listings";

export default async function AdminDashboard() {
  const listings = await getListings({}); // Get all

  return (
    <div className="bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-base font-semibold leading-6 text-gray-900">Manage Inventory</h3>
        <div className="mt-2 sm:flex sm:items-start sm:justify-between">
          <div className="max-w-xl text-sm text-gray-500">
            <p>Upload photos, update details, or remove tractors from the catalog.</p>
          </div>
        </div>

        <div className="mt-8 flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <table className="min-w-full divide-y divide-gray-300">
                <thead>
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">Make/Model</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Year</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Price</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Images</th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-0"><span className="sr-only">Edit</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {listings.map((listing) => (
                    <tr key={listing.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                        {listing.brand} {listing.model}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{listing.year || '-'}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{listing.price ? `$${listing.price.toLocaleString()}` : '-'}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{listing.images?.length || 0}</td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                        <Link href={`/admin/listings/${listing.id}`} className="text-brown-600 hover:text-brown-900">
                          Edit<span className="sr-only">, {listing.model}</span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
