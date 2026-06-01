import ListingForm from "@/components/admin/ListingForm";

export const metadata = { title: "New Listing — Admin" };

export default function NewListingPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Add New Product</h1>
        <p className="mt-1 text-sm text-gray-500">
          Fill in the details below to add a new product to the catalog.
          Fields marked with <span className="text-red-500">*</span> are required.
        </p>
      </div>
      <ListingForm mode="create" />
    </div>
  );
}
