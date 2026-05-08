import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Pricing — Euro Global Machinery",
  description: "Transparent pricing for individual sellers and professional dealers on Euro Global Machinery.",
};

const PLANS = [
  {
    name: "Basic",
    tag: "Individual",
    price: "Free",
    period: "",
    description: "For private sellers who occasionally list a machine.",
    features: [
      { text: "3 active listings", included: true },
      { text: "Standard search placement", included: true },
      { text: "WhatsApp enquiry routing", included: true },
      { text: "Basic seller profile", included: true },
      { text: "Verified badge", included: false },
      { text: "Analytics dashboard", included: false },
      { text: "Priority placement", included: false },
      { text: "Account manager", included: false },
    ],
    cta: "Start for Free",
    href: "/sellers/post-listing",
    highlight: false,
  },
  {
    name: "Professional",
    tag: "Most popular",
    price: "€49",
    period: "/ month",
    description: "For active dealers managing a regular inventory.",
    features: [
      { text: "30 active listings", included: true },
      { text: "Priority search placement", included: true },
      { text: "WhatsApp enquiry routing", included: true },
      { text: "Verified dealer badge", included: true },
      { text: "Listing analytics", included: true },
      { text: "Email support", included: true },
      { text: "Featured on homepage", included: false },
      { text: "Account manager", included: false },
    ],
    cta: "Get Professional",
    href: "/sellers/dealer-accounts#apply",
    highlight: true,
  },
  {
    name: "Enterprise",
    tag: "Large dealers",
    price: "€149",
    period: "/ month",
    description: "For large dealerships and fleet operators.",
    features: [
      { text: "Unlimited listings", included: true },
      { text: "Top-of-search placement", included: true },
      { text: "WhatsApp enquiry routing", included: true },
      { text: "Verified dealer badge", included: true },
      { text: "Full analytics suite", included: true },
      { text: "Priority support", included: true },
      { text: "Featured on homepage", included: true },
      { text: "Dedicated account manager", included: true },
    ],
    cta: "Contact Sales",
    href: "/contact",
    highlight: false,
  },
];

const FAQS = [
  {
    q: "Is there a setup fee?",
    a: "No. All plans begin immediately after payment with no additional fees.",
  },
  {
    q: "Can I cancel at any time?",
    a: "Yes. Cancel before your next billing date and you will not be charged again. Your listings remain live until the end of the billing period.",
  },
  {
    q: "Do you offer annual billing?",
    a: "Yes. Paying annually saves 20% compared to monthly billing. Contact our team to switch.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept all major credit and debit cards, SEPA bank transfers, and PayPal.",
  },
  {
    q: "How long does verification take?",
    a: "Dealer verification is completed within one business day. You will receive a confirmation email once your account is approved.",
  },
  {
    q: "Can I upgrade or downgrade my plan?",
    a: "Yes. Plan changes take effect at the start of your next billing cycle. Contact support to make a change.",
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-cream-50">

      {/* Header */}
      <div className="border-b border-brown-200 bg-brown-900 py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <p className="section-label mb-3 text-brown-500">For Sellers</p>
          <h1 className="font-serif text-4xl font-semibold text-cream-50 sm:text-5xl">Pricing</h1>
          <p className="mt-4 max-w-xl text-base font-light leading-relaxed text-brown-400">
            Transparent plans with no hidden fees. Start free and upgrade as your business grows.
          </p>
        </div>
      </div>

      {/* Plans */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid gap-px bg-brown-200 border border-brown-200 sm:grid-cols-3">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`flex flex-col p-8 ${plan.highlight ? "bg-brown-900" : "bg-white"}`}
              >
                <div className="flex items-start justify-between">
                  <p className={`font-serif text-xl font-semibold ${plan.highlight ? "text-cream-50" : "text-brown-900"}`}>
                    {plan.name}
                  </p>
                  <span className={`text-[9px] font-semibold uppercase tracking-widest px-2 py-1 ${plan.highlight ? "bg-brown-700 text-brown-300" : "bg-brown-100 text-brown-500"}`}>
                    {plan.tag}
                  </span>
                </div>

                <div className="mt-5 flex items-baseline gap-1">
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

                <ul className={`mt-6 flex-1 space-y-3 border-t pt-6 ${plan.highlight ? "border-brown-700" : "border-brown-100"}`}>
                  {plan.features.map((f) => (
                    <li key={f.text} className="flex items-center gap-3 text-sm">
                      <span className={`h-px w-3 shrink-0 ${f.included ? (plan.highlight ? "bg-brown-400" : "bg-brown-600") : "bg-brown-200"}`} />
                      <span className={f.included ? (plan.highlight ? "text-brown-200" : "text-brown-700") : (plan.highlight ? "text-brown-600" : "text-brown-300")}>
                        {f.text}
                      </span>
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
            All prices include VAT where applicable. Annual billing available at 20% off.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-brown-200 bg-white py-16">
        <div className="mx-auto max-w-3xl px-6 lg:px-8">
          <p className="section-label mb-2">Frequently Asked Questions</p>
          <h2 className="mb-10 font-serif text-2xl font-semibold text-brown-900">Pricing Questions</h2>
          <div className="divide-y divide-brown-100">
            {FAQS.map((faq) => (
              <div key={faq.q} className="py-6">
                <p className="font-serif text-base font-medium text-brown-900">{faq.q}</p>
                <p className="mt-2 text-sm leading-relaxed text-brown-500">{faq.a}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 border border-brown-200 bg-cream-100 p-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-brown-700">Still have questions?</p>
            <p className="mt-2 text-sm text-brown-500">Our team is happy to help you choose the right plan.</p>
            <Link href="/contact" className="btn-secondary mt-4 inline-flex text-xs">Contact Us</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
