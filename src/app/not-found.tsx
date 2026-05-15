import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <p className="font-serif text-7xl font-semibold text-brown-200">404</p>
      <h1 className="mt-4 font-serif text-2xl font-semibold text-brown-900">Page Not Found</h1>
      <p className="mt-3 text-sm text-brown-500">
        The page you are looking for does not exist or has been moved.
      </p>
      <div className="mt-8 flex gap-4">
        <Link href="/" className="btn-primary text-xs uppercase tracking-widest">
          Go Home
        </Link>
        <Link href="/agricultural/tractors" className="btn-secondary text-xs uppercase tracking-widest">
          Browse Listings
        </Link>
      </div>
    </div>
  );
}
