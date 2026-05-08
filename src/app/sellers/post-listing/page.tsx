import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Post a Listing — Euro Global Machinery",
  description: "List your tractor, vehicle, or agricultural machinery and reach thousands of buyers across Europe.",
};

const STEPS = [
  {
    num: "01",
    title: "Create Your Account",
    body: "Register as an individual seller or apply for a verified dealer account. Verification takes less than 24 hours.",
  },
  {
    num: "02",
    title: "Fill In the Details",
    body: "Enter make, model, year, condition, hours, and price. Our structured form ensures buyers get all the information they need.",
  },
  {
    num: "03",
    title: "Add Photos",
    body: "Upload up to 20 high-resolution images. Listings with quality photos receive up to 4x more enquiries.",
  },
  {
    num: "04",
    title: "Publish and Sell",
    body: "Your listing goes live instantly and is visible to buyers across 28 European countries and beyond.",
  },
];

const FIELDS = [
  { label: "Category", type: "select", options: ["Tractors", "Cars", "Trucks", "Automobiles", "Other Machinery", "Spare Parts"] },
  { label: "Make / Brand", type: "text", placeholder: "e.g. John Deere" },
  { label: "Model", type: "text", placeholder: "e.g. 6120M" },
  { label: "Year", type: "number", placeholder: "e.g. 2021" },
  { label: "Condition", type: "select", options: ["New", "Used", "Refurbished"] },
  { label: "Price (EUR)", type: "number", placeholder: "e.g. 85000" },
  { label: "Hours Used", type: "number", placeholder: "e.g. 1200" },
  { label: "Horsepower", type: "number", placeholder: "e.g. 120" },
  { label: "Location / City", type: "text", placeholder: "e.g. Munich" },
  { label: "Country", type: "text", placeholder: "e.g. Germany" },
];

export default function PostListingPage() {
  return (
    <div className="min-h-screen bg-cream-50">

      {/* Page header */}
      <div className="border-b border-brown-200 bg-brown-900 py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <p className="section-label mb-3 text-brown-500">For Sellers</p>
          <h1 className="font-serif text-4xl font-semibold text-cream-50 sm:text-5xl">
            Post a Listing
          </h1>
          <p className="mt-4 max-w-xl text-base font-light leading-relaxed text-brown-400">
            Reach thousands of qualified buyers across Europe. Listings go live within minutes.
          </p>
        </div>
      </div>

      {/* How it works */}
      <section className="border-b border-brown-200 bg-white py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <p className="section-label mb-2">How It Works</p>
          <h2 className="mb-10 font-serif text-2xl font-semibold text-brown-900">Four Simple Steps</h2>
          <div className="grid gap-px bg-brown-200 border border-brown-200 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s) => (
              <div key={s.num} className="bg-white p-8">
                <p className="font-serif text-4xl font-semibold text-brown-200">{s.num}</p>
                <h3 className="mt-4 font-serif text-base font-semibold text-brown-900">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-brown-500">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Form */}
      <section className="py-16">
        <div className="mx-auto max-w-3xl px-6 lg:px-8">
          <div className="border border-brown-200 bg-white p-8 sm:p-10">
            <h2 className="mb-2 font-serif text-2xl font-semibold text-brown-900">Listing Details</h2>
            <p className="mb-8 text-sm text-brown-500">
              Complete the form below. Fields marked with an asterisk are required.
            </p>

            <form className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                {FIELDS.map((f) => (
                  <div key={f.label}>
                    <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-widest text-brown-600">
                      {f.label}
                    </label>
                    {f.type === "select" ? (
                      <select className="input-field">
                        <option value="">Select…</option>
                        {f.options?.map((o) => <option key={o}>{o}</option>)}
                      </select>
                    ) : (
                      <input
                        type={f.type}
                        placeholder={f.placeholder}
                        className="input-field"
                      />
                    )}
                  </div>
                ))}
              </div>

              <div>
                <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-widest text-brown-600">
                  Description
                </label>
                <textarea
                  rows={5}
                  placeholder="Describe the machine — service history, attachments, any known defects…"
                  className="input-field resize-none"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-widest text-brown-600">
                  Contact WhatsApp Number
                </label>
                <input type="tel" placeholder="+49 170 123 4567" className="input-field" />
                <p className="mt-1.5 text-xs text-brown-400">Buyer enquiries will be delivered directly to this number.</p>
              </div>

              <div className="border-t border-brown-100 pt-6">
                <button type="submit" className="btn-primary w-full text-xs uppercase tracking-widest">
                  Submit Listing for Review
                </button>
                <p className="mt-3 text-center text-xs text-brown-400">
                  By submitting you agree to our{" "}
                  <Link href="/terms" className="underline hover:text-brown-700">Terms of Use</Link>.
                </p>
              </div>
            </form>
          </div>

          <div className="mt-6 border border-brown-200 bg-cream-100 p-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-brown-700">Need a Dealer Account?</p>
            <p className="mt-2 text-sm text-brown-500">
              Post unlimited listings, get priority placement, and access analytics with a verified dealer account.
            </p>
            <Link href="/sellers/dealer-accounts" className="btn-secondary mt-4 inline-flex text-xs">
              View Dealer Plans
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
