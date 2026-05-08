import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Press — Euro Global Machinery",
  description: "Press releases, media resources, and contact information for journalists covering Euro Global Machinery.",
};

const RELEASES = [
  {
    date: "12 March 2025",
    title: "Euro Global Machinery Surpasses 52,000 Active Listings Across 28 Countries",
    summary: "The platform reports record activity in Q1 2025, driven by strong demand from Poland, France, and Spain. New dealer verification tools launched.",
    category: "Company",
  },
  {
    date: "8 January 2025",
    title: "Euro Global Machinery Launches Full Latin American Market Expansion",
    summary: "The marketplace now supports 8 Latin American currencies and Spanish-language listings tailored for buyers in Mexico, Brazil, Colombia, and Argentina.",
    category: "Product",
  },
  {
    date: "15 October 2024",
    title: "New WhatsApp Enquiry Routing Reduces Seller Response Time by 60%",
    summary: "All buyer enquiries are now routed directly to sellers via WhatsApp, eliminating email delays and improving transaction rates across the platform.",
    category: "Product",
  },
  {
    date: "3 July 2024",
    title: "Euro Global Machinery Reaches 3,800 Verified Dealer Milestone",
    summary: "The platform&apos;s dealer verification programme, launched in 2013, has now onboarded dealerships from all 28 covered markets.",
    category: "Milestone",
  },
  {
    date: "22 April 2024",
    title: "Partnership Announced with European Logistics Network for Cross-Border Transport",
    summary: "A new logistics partnership enables buyers to arrange cross-border machinery transport directly through the platform at negotiated rates.",
    category: "Partnership",
  },
];

const COVERAGE = [
  { outlet: "Agrarheute", region: "Germany", date: "March 2025" },
  { outlet: "La France Agricole", region: "France", date: "February 2025" },
  { outlet: "Tractor & Machinery", region: "United Kingdom", date: "January 2025" },
  { outlet: "Farmer's Weekly", region: "United Kingdom", date: "November 2024" },
  { outlet: "Top Agrar", region: "Germany / Poland", date: "October 2024" },
  { outlet: "El Agricultor Profesional", region: "Spain", date: "September 2024" },
];

export default function PressPage() {
  return (
    <div className="min-h-screen bg-cream-50">

      {/* Header */}
      <div className="border-b border-brown-200 bg-brown-900 py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <p className="section-label mb-3 text-brown-500">Media</p>
          <h1 className="font-serif text-4xl font-semibold text-cream-50 sm:text-5xl">Press</h1>
          <p className="mt-4 max-w-xl text-base font-light leading-relaxed text-brown-400">
            Resources and contacts for journalists covering the agricultural machinery and vehicle trade industry.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-3 lg:gap-16">

          {/* Main content */}
          <div className="lg:col-span-2 space-y-16">

            {/* Press releases */}
            <div>
              <p className="section-label mb-2">Press Releases</p>
              <h2 className="mb-8 font-serif text-2xl font-semibold text-brown-900">Latest News</h2>
              <div className="divide-y divide-brown-100 border border-brown-200 bg-white">
                {RELEASES.map((r) => (
                  <div key={r.title} className="p-7">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-[9px] font-semibold uppercase tracking-widest text-brown-400 border border-brown-200 px-2 py-0.5">
                        {r.category}
                      </span>
                      <span className="text-xs text-brown-400">{r.date}</span>
                    </div>
                    <h3 className="mt-3 font-serif text-base font-semibold text-brown-900"
                      dangerouslySetInnerHTML={{ __html: r.title }}
                    />
                    <p className="mt-2 text-sm leading-relaxed text-brown-500"
                      dangerouslySetInnerHTML={{ __html: r.summary }}
                    />
                    <button className="mt-3 text-xs font-semibold uppercase tracking-widest text-brown-700 underline-offset-2 hover:underline">
                      Read Full Release
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Media coverage */}
            <div>
              <p className="section-label mb-2">Coverage</p>
              <h2 className="mb-8 font-serif text-2xl font-semibold text-brown-900">Recent Media Coverage</h2>
              <div className="divide-y divide-brown-100 border border-brown-200 bg-white">
                {COVERAGE.map((c) => (
                  <div key={c.outlet} className="flex items-center justify-between p-5">
                    <div>
                      <p className="font-serif text-sm font-semibold text-brown-900">{c.outlet}</p>
                      <p className="mt-0.5 text-xs text-brown-400">{c.region}</p>
                    </div>
                    <p className="text-xs text-brown-400">{c.date}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">

            {/* Press contact */}
            <div className="border border-brown-200 bg-white p-7">
              <h3 className="mb-4 font-serif text-base font-semibold text-brown-900">Press Contact</h3>
              <p className="text-sm text-brown-600">For press enquiries, interview requests, and media kits:</p>
              <div className="mt-4 space-y-2 text-sm">
                <p className="font-medium text-brown-900">Media Relations Team</p>
                <a href="mailto:press@euroglobalexport.com" className="block text-brown-600 underline-offset-2 hover:underline">
                  press@euroglobalexport.com
                </a>
                <p className="text-brown-500">Response within 4 business hours</p>
              </div>
            </div>

            {/* Media kit */}
            <div className="border border-brown-200 bg-white p-7">
              <h3 className="mb-4 font-serif text-base font-semibold text-brown-900">Media Kit</h3>
              <p className="text-sm text-brown-500 mb-5">
                Download our brand assets, executive bios, company fact sheet, and approved images.
              </p>
              <div className="space-y-3">
                {[
                  { label: "Brand Assets (logos, colours)", size: "ZIP, 8.2 MB" },
                  { label: "Company Fact Sheet", size: "PDF, 340 KB" },
                  { label: "Executive Bios & Headshots", size: "ZIP, 12 MB" },
                  { label: "Platform Screenshots", size: "ZIP, 24 MB" },
                ].map((asset) => (
                  <div key={asset.label} className="flex items-start justify-between gap-3 border-t border-brown-100 pt-3">
                    <p className="text-xs text-brown-700">{asset.label}</p>
                    <button className="shrink-0 text-xs font-semibold uppercase tracking-widest text-brown-700 underline-offset-2 hover:underline">
                      Download
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Key facts */}
            <div className="border border-brown-200 bg-cream-100 p-7">
              <h3 className="mb-4 font-serif text-base font-semibold text-brown-900">Key Facts</h3>
              <dl className="space-y-3 text-xs">
                {[
                  { label: "Founded", value: "2005, Munich, Germany" },
                  { label: "Listings", value: "52,000+ active" },
                  { label: "Dealers", value: "3,800 verified" },
                  { label: "Countries", value: "28 markets" },
                  { label: "Languages", value: "8 (EN, DE, FR, ES, PT, PL, IT, NL)" },
                  { label: "Registration", value: "European Union" },
                ].map((f) => (
                  <div key={f.label} className="flex justify-between">
                    <dt className="font-semibold uppercase tracking-widest text-brown-500">{f.label}</dt>
                    <dd className="text-brown-700">{f.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
