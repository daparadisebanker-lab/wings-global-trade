import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

async function getQuickStats() {
  try {
    const supabase = await createClient();
    const { data, error } = await Promise.race([
      supabase.from("listings").select("id, condition, images"),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error("timeout")), 3000)),
    ]);
    if (error) throw error;
    const rows = (data ?? []) as { id: string; condition: string; images: string[] | null }[];
    return {
      total: rows.length,
      newCount: rows.filter((l) => l.condition === "new").length,
      noImages: rows.filter((l) => !l.images?.length).length,
      error: false,
    };
  } catch {
    return { total: 0, newCount: 0, noImages: 0, error: true };
  }
}

export default async function AdminHub() {
  const stats = await getQuickStats();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          Wings Global Trade — catalog and import operations.
        </p>
      </div>

      {/* Section cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* Catalog Management */}
        <Link href="/admin/catalog" className="group block">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-full transition-all group-hover:border-[#004389] group-hover:shadow-md">
            <div className="flex items-start justify-between mb-5">
              <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center">
                <svg className="w-5 h-5 text-[#004389]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </div>
              <span className="text-sm font-medium text-[#004389] opacity-0 group-hover:opacity-100 transition-opacity">
                Open →
              </span>
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-1.5">Catalog Management</h2>
            <p className="text-sm text-gray-500 mb-6">
              Add, edit, and manage product listings. Set prices, upload images, and control availability across the Wings platform.
            </p>
            <div className="grid grid-cols-3 gap-3">
              <Stat label="Listings" value={stats.error ? "—" : String(stats.total)} />
              <Stat label="New" value={stats.error ? "—" : String(stats.newCount)} green />
              <Stat label="No Image" value={stats.error ? "—" : String(stats.noImages)} red={!stats.error && stats.noImages > 0} />
            </div>
            {stats.error && (
              <p className="mt-3 text-xs text-yellow-600">Database unavailable — check Supabase.</p>
            )}
          </div>
        </Link>

        {/* Financial Engine */}
        <Link href="/admin/financial" className="group block">
          <div className="bg-[#001E50] rounded-xl shadow-sm p-6 h-full transition-all group-hover:bg-[#002870]">
            <div className="flex items-start justify-between mb-5">
              <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-[#C4933F]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="text-sm font-medium text-[#C4933F] opacity-0 group-hover:opacity-100 transition-opacity">
                Open →
              </span>
            </div>
            <h2 className="text-lg font-semibold text-white mb-1.5">Financial Engine</h2>
            <p className="text-sm text-white/55 mb-6">
              SUNAT import cost calculator. Compute FOB → CIF → Landed Cost → Cash Outlay with full tax cascade and margin analysis.
            </p>
            <div className="grid grid-cols-3 gap-3">
              <FinancialStat label="Ad Valorem" value="0–6%" />
              <FinancialStat label="ISC" value="0–7.5%" />
              <FinancialStat label="IGV ↻" value="18%" gold />
            </div>
          </div>
        </Link>
      </div>

      {/* Quick actions */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Quick Actions</p>
        <div className="flex flex-wrap gap-3">
          <QuickAction href="/admin/listings/new" label="Add Product" />
          <QuickAction href="/admin/catalog" label="View All Listings" />
          <QuickAction href="/admin/financial" label="Run Cost Calculation" />
          <QuickAction href="/" label="View Site" external />
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, green, red }: { label: string; value: string; green?: boolean; red?: boolean }) {
  return (
    <div className="bg-gray-50 rounded-lg p-3">
      <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">{label}</p>
      <p className={`text-xl font-bold ${green ? 'text-green-700' : red ? 'text-red-600' : 'text-gray-900'}`}>
        {value}
      </p>
    </div>
  );
}

function FinancialStat({ label, value, gold }: { label: string; value: string; gold?: boolean }) {
  return (
    <div className="bg-white/[0.07] rounded-lg p-3">
      <p className="text-xs text-white/40 uppercase tracking-wide mb-0.5">{label}</p>
      <p className={`text-base font-bold ${gold ? 'text-[#C4933F]' : 'text-white'}`}>{value}</p>
    </div>
  );
}

function QuickAction({ href, label, external }: { href: string; label: string; external?: boolean }) {
  return (
    <Link
      href={href}
      {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
      className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-3.5 py-2 text-sm font-medium text-gray-700 hover:border-[#004389] hover:text-[#004389] transition-colors"
    >
      {label}
      {external && (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      )}
    </Link>
  );
}
