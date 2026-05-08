import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Seller Resources — Euro Global Machinery",
  description: "Guides, tips, and tools to help you sell machinery faster on Euro Global Machinery.",
};

const GUIDES = [
  {
    category: "Getting Started",
    title: "How to Write a Listing That Sells",
    description: "Learn which details buyers care about most and how to present your machine in the best light.",
    readTime: "5 min read",
  },
  {
    category: "Photography",
    title: "Photography Guide for Machinery",
    description: "The right angles, lighting, and details to photograph. Listings with great photos get 4x more enquiries.",
    readTime: "4 min read",
  },
  {
    category: "Pricing",
    title: "How to Price Your Machine Competitively",
    description: "Use market data and condition grading to set a price that attracts buyers without leaving money on the table.",
    readTime: "6 min read",
  },
  {
    category: "Safety",
    title: "Safely Completing a Cross-Border Sale",
    description: "Payment terms, documentation, and logistics for international transactions. Avoid common pitfalls.",
    readTime: "8 min read",
  },
  {
    category: "Documentation",
    title: "Required Documents for Selling in the EU",
    description: "CE marking, service records, ownership certificates — everything you need before listing.",
    readTime: "5 min read",
  },
  {
    category: "Logistics",
    title: "Arranging Transport for Buyers",
    description: "Our logistics partner network covers all 28 markets. Learn how to use them as a selling advantage.",
    readTime: "4 min read",
  },
];

const TIPS = [
  { num: "01", tip: "Always include the engine hours — it is the first thing serious buyers check." },
  { num: "02", tip: "State any known defects upfront. Transparency builds trust and reduces time-wasting enquiries." },
  { num: "03", tip: "Upload at least 10 photos including the engine bay, cab interior, tyres, and any attachments." },
  { num: "04", tip: "Respond to enquiries within a few hours. Speed of response directly affects conversion rates." },
  { num: "05", tip: "Price in EUR even if you are outside the Eurozone — buyers prefer a common reference." },
  { num: "06", tip: "Mention available attachments, spare parts, or service manuals in the description." },
];

export default function SellerResourcesPage() {
  return (
    <div className="min-h-screen bg-cream-50">

      {/* Header */}
      <div className="border-b border-brown-200 bg-brown-900 py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <p className="section-label mb-3 text-brown-500">For Sellers</p>
          <h1 className="font-serif text-4xl font-semibold text-cream-50 sm:text-5xl">Seller Resources</h1>
          <p className="mt-4 max-w-xl text-base font-light leading-relaxed text-brown-400">
            Practical guides and tips to help you list smarter and sell faster.
          </p>
        </div>
      </div>

      {/* Guides */}
      <section className="border-b border-brown-200 bg-white py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <p className="section-label mb-2">Guides</p>
          <h2 className="mb-10 font-serif text-2xl font-semibold text-brown-900">Seller Guides</h2>
          <div className="grid gap-px bg-brown-200 border border-brown-200 sm:grid-cols-2 lg:grid-cols-3">
            {GUIDES.map((g) => (
              <div key={g.title} className="group flex flex-col bg-white p-7 transition-colors hover:bg-brown-900">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-brown-400 group-hover:text-brown-600">
                  {g.category}
                </p>
                <h3 className="mt-2 font-serif text-base font-semibold text-brown-900 group-hover:text-cream-50">
                  {g.title}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-brown-500 group-hover:text-brown-400">
                  {g.description}
                </p>
                <p className="mt-4 text-xs text-brown-400 group-hover:text-brown-600">{g.readTime}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick tips */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <p className="section-label mb-2">Quick Reference</p>
          <h2 className="mb-10 font-serif text-2xl font-semibold text-brown-900">Top Tips for Sellers</h2>
          <div className="grid gap-px bg-brown-200 border border-brown-200 sm:grid-cols-2 lg:grid-cols-3">
            {TIPS.map((t) => (
              <div key={t.num} className="bg-white p-7">
                <p className="font-serif text-3xl font-semibold text-brown-200">{t.num}</p>
                <p className="mt-3 text-sm leading-relaxed text-brown-700">{t.tip}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Downloads */}
      <section className="border-t border-brown-200 bg-white py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <p className="section-label mb-2">Downloads</p>
          <h2 className="mb-10 font-serif text-2xl font-semibold text-brown-900">Free Seller Toolkit</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { title: "Listing Checklist", desc: "A printable checklist to complete before publishing any listing.", size: "PDF, 120 KB" },
              { title: "Pricing Worksheet", desc: "A simple spreadsheet to calculate a competitive asking price.", size: "XLSX, 48 KB" },
              { title: "Photo Shot List", desc: "The 20 photos every machinery listing should include.", size: "PDF, 85 KB" },
            ].map((d) => (
              <div key={d.title} className="border border-brown-200 p-6">
                <h3 className="font-serif text-base font-semibold text-brown-900">{d.title}</h3>
                <p className="mt-2 text-sm text-brown-500">{d.desc}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs text-brown-400">{d.size}</span>
                  <button className="text-xs font-semibold uppercase tracking-widest text-brown-700 underline-offset-2 hover:underline">
                    Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-brown-200 bg-cream-100 py-14">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <h2 className="font-serif text-2xl font-semibold text-brown-900">Ready to List Your Machine?</h2>
          <p className="mt-3 text-sm text-brown-500">Put these resources into practice and post your first listing today.</p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/sellers/post-listing" className="btn-primary text-xs uppercase tracking-widest">
              Post a Listing
            </Link>
            <Link href="/sellers/dealer-accounts" className="btn-secondary text-xs uppercase tracking-widest">
              View Dealer Plans
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
