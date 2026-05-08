import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Dealer Accounts — Euro Global Machinery",
  description: "Apply for a verified dealer account and list unlimited machinery on Europe's leading marketplace.",
};

const BENEFITS = [
  {
    title: "Unlimited Listings",
    body: "Post as many machines as you have in stock. No per-listing fees on Professional and Dealer plans.",
  },
  {
    title: "Verified Dealer Badge",
    body: "Stand out with an official verified badge that builds buyer trust and increases enquiry rates.",
  },
  {
    title: "Priority Placement",
    body: "Your listings appear higher in search results and on the homepage featured section.",
  },
  {
    title: "Analytics Dashboard",
    body: "Track views, enquiries, and conversion rates for every listing in real time.",
  },
  {
    title: "Dedicated Account Manager",
    body: "Enterprise clients receive a dedicated contact for onboarding, listing support, and strategy.",
  },
  {
    title: "Pan-European Reach",
    body: "Your inventory is visible to buyers across 28 countries with automatic currency conversion.",
  },
];

const PLANS = [
  {
    name: "Individual",
    price: "Free",
    period: "",
    description: "For private sellers with occasional listings.",
    features: [
      "Up to 3 active listings",
      "Standard placement",
      "WhatsApp enquiries",
      "Basic seller profile",
    ],
    cta: "Get Started",
    href: "/sellers/post-listing",
    highlight: false,
  },
  {
    name: "Professional",
    price: "€49",
    period: "/ month",
    description: "For small dealerships and regular sellers.",
    features: [
      "Up to 30 active listings",
      "Priority placement in search",
      "Verified seller badge",
      "Listing analytics",
      "Email support",
    ],
    cta: "Apply Now",
    href: "#apply",
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "€149",
    period: "/ month",
    description: "For large dealerships and commercial fleets.",
    features: [
      "Unlimited listings",
      "Top-of-search placement",
      "Verified dealer badge",
      "Full analytics suite",
      "Dedicated account manager",
      "API access for inventory sync",
    ],
    cta: "Contact Sales",
    href: "/contact",
    highlight: false,
  },
];

export default function DealerAccountsPage() {
  return (
    <div className="min-h-screen bg-cream-50">

      {/* Header */}
      <div className="border-b border-brown-200 bg-brown-900 py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <p className="section-label mb-3 text-brown-500">For Sellers</p>
          <h1 className="font-serif text-4xl font-semibold text-cream-50 sm:text-5xl">
            Dealer Accounts
          </h1>
          <p className="mt-4 max-w-xl text-base font-light leading-relaxed text-brown-400">
            Join over 3,800 verified dealers already selling on Euro Global Machinery.
          </p>
        </div>
      </div>

      {/* Benefits */}
      <section className="border-b border-brown-200 bg-white py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <p className="section-label mb-2">Why Dealers Choose Us</p>
          <h2 className="mb-10 font-serif text-2xl font-semibold text-brown-900">Built for Professional Sellers</h2>
          <div className="grid gap-px bg-brown-200 border border-brown-200 sm:grid-cols-2 lg:grid-cols-3">
            {BENEFITS.map((b) => (
              <div key={b.title} className="bg-white p-8">
                <h3 className="font-serif text-base font-semibold text-brown-900">{b.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-brown-500">{b.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <p className="section-label mb-2">Plans</p>
          <h2 className="mb-10 font-serif text-2xl font-semibold text-brown-900">Choose Your Plan</h2>
          <div className="grid gap-px bg-brown-200 border border-brown-200 sm:grid-cols-3">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`flex flex-col p-8 ${plan.highlight ? "bg-brown-900" : "bg-white"}`}
              >
                <p className={`text-[10px] font-semibold uppercase tracking-widest ${plan.highlight ? "text-brown-500" : "text-brown-400"}`}>
                  {plan.name}
                </p>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className={`font-serif text-4xl font-semibold ${plan.highlight ? "text-cream-50" : "text-brown-900"}`}>
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className={`text-sm ${plan.highlight ? "text-brown-400" : "text-brown-500"}`}>
                      {plan.period}
                    </span>
                  )}
                </div>
                <p className={`mt-2 text-sm ${plan.highlight ? "text-brown-400" : "text-brown-500"}`}>
                  {plan.description}
                </p>
                <ul className={`mt-6 flex-1 space-y-2.5 border-t pt-6 text-sm ${plan.highlight ? "border-brown-700 text-brown-300" : "border-brown-100 text-brown-600"}`}>
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <span className={`mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full ${plan.highlight ? "bg-brown-400" : "bg-brown-400"}`} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href={plan.href}
                  className={`mt-8 block w-full text-center text-xs uppercase tracking-widest py-3 px-4 font-semibold transition-colors ${
                    plan.highlight
                      ? "bg-brown-500 text-white hover:bg-brown-400"
                      : "border border-brown-300 text-brown-700 hover:bg-brown-50"
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
          <p className="mt-4 text-center text-xs text-brown-400">
            All plans include VAT. Cancel any time. Annual billing available at 20% discount.
          </p>
        </div>
      </section>

      {/* Application form anchor */}
      <section id="apply" className="border-t border-brown-200 bg-white py-16">
        <div className="mx-auto max-w-2xl px-6 lg:px-8">
          <div className="border border-brown-200 p-8 sm:p-10">
            <h2 className="mb-2 font-serif text-2xl font-semibold text-brown-900">Apply for a Dealer Account</h2>
            <p className="mb-8 text-sm text-brown-500">
              Complete this form and our team will review your application within one business day.
            </p>
            <form className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-widest text-brown-600">Company Name</label>
                  <input type="text" placeholder="e.g. Schmidt Agrar GmbH" className="input-field" />
                </div>
                <div>
                  <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-widest text-brown-600">Country</label>
                  <input type="text" placeholder="e.g. Germany" className="input-field" />
                </div>
                <div>
                  <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-widest text-brown-600">Contact Name</label>
                  <input type="text" placeholder="Full name" className="input-field" />
                </div>
                <div>
                  <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-widest text-brown-600">Email Address</label>
                  <input type="email" placeholder="you@company.com" className="input-field" />
                </div>
                <div>
                  <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-widest text-brown-600">Phone / WhatsApp</label>
                  <input type="tel" placeholder="+49 …" className="input-field" />
                </div>
                <div>
                  <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-widest text-brown-600">Preferred Plan</label>
                  <select className="input-field">
                    <option>Professional — €49 / month</option>
                    <option>Enterprise — €149 / month</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-widest text-brown-600">About Your Business</label>
                <textarea rows={3} placeholder="Types of machinery, estimated inventory size…" className="input-field resize-none" />
              </div>
              <button type="submit" className="btn-primary w-full text-xs uppercase tracking-widest">
                Submit Application
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
