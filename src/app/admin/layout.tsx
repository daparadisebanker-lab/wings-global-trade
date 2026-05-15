import Link from "next/link";
import { logout } from "./login/actions";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between items-center">
            <div className="flex">
              <Link href="/admin" className="flex flex-shrink-0 items-center font-serif text-xl font-bold text-brown-900">
                Admin Portal
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
                View Site
              </Link>
              <form action={logout}>
                <button type="submit" className="text-sm font-semibold text-red-600 hover:text-red-500">
                  Sign out
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
