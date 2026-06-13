'use client'
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin/catalog",   label: "Catalog" },
  { href: "/admin/financial", label: "Financial Engine" },
];

export default function AdminNav() {
  const path = usePathname();
  return (
    <div className="hidden sm:flex items-center gap-1">
      {links.map(({ href, label }) => {
        const active = path.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              active
                ? "bg-[#004389]/10 text-[#004389]"
                : "text-gray-500 hover:text-gray-800 hover:bg-gray-100"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}
