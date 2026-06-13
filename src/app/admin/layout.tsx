import Link from "next/link";
import { logout } from "./login/actions";
import AdminNav from "./AdminNav";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-6">
              <Link href="/admin" className="flex-shrink-0 font-bold text-gray-900 tracking-tight">
                Wings <span className="text-[#004389]">Admin</span>
              </Link>
              <AdminNav />
            </div>
            <div className="flex items-center gap-4">
              <Link href="/" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
                View Site ↗
              </Link>
              <form action={logout}>
                <button type="submit" className="text-sm font-semibold text-red-500 hover:text-red-700 transition-colors">
                  Sign out
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8 px-4">
        {children}
      </main>
    </div>
  );
}
