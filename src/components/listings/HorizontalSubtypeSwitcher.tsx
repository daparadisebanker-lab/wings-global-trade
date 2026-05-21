import Link from "next/link";
import Image from "next/image";
import { type Category } from "@/lib/categories";

interface Props {
  category:   Category;
  activeSlug: string;
}

export default function HorizontalSubtypeSwitcher({ category, activeSlug }: Props) {
  const subtypes = category.subtypes;

  return (
    <div className="w-full border-b border-[#E8E4DB] bg-white">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex w-full overflow-x-auto py-3 scrollbar-hide">
          <div className="flex items-center gap-2">
            {subtypes.map((sub) => {
              const isActive =
                sub.href === activeSlug ||
                sub.href.endsWith("/" + activeSlug) ||
                sub.href.endsWith(activeSlug);

              return (
                <Link
                  key={sub.href}
                  href={sub.href}
                  className={`group flex items-center gap-2.5 whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-widest transition-colors duration-200 ${
                    isActive
                      ? "bg-[#001E50] text-white"
                      : "text-[#6B6560] hover:bg-[#F8F6F0] hover:text-[#1C1A16]"
                  }`}
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  {sub.icon && (
                    <div
                      className={`relative h-5 w-8 flex-shrink-0 transition-opacity ${
                        isActive ? "opacity-80" : "opacity-50 group-hover:opacity-80"
                      }`}
                    >
                      <Image
                        src={sub.icon}
                        alt={sub.label}
                        fill
                        className={`object-contain ${isActive ? "brightness-0 invert" : ""}`}
                      />
                    </div>
                  )}
                  {sub.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
