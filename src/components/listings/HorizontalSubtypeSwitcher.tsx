import Link from "next/link";
import Image from "next/image";
import { type Category } from "@/lib/categories";

interface Props {
  category: Category;
  activeSlug: string;
}

export default function HorizontalSubtypeSwitcher({ category, activeSlug }: Props) {
  // Only show active subtypes in the switcher, or all? Let's show all subtypes including coming soon
  // Wait, if it's coming soon, do we want users to click it? Probably yes, to see the ComingSoon page.
  const subtypes = category.subtypes;

  return (
    <div className="w-full border-b border-brown-200 bg-white">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex w-full overflow-x-auto py-4 scrollbar-hide">
          <div className="flex items-end gap-8">
            {subtypes.map((sub) => {
              const isActive = sub.href === activeSlug || sub.href.endsWith("/" + activeSlug) || sub.href.endsWith(activeSlug);

              return (
                <Link
                  key={sub.href}
                  href={sub.href}
                  className={`group flex flex-col items-center gap-2 whitespace-nowrap pb-2 border-b-2 transition-colors duration-200 ${
                    isActive
                      ? "border-brown-900 text-brown-900"
                      : "border-transparent text-brown-400 hover:text-brown-700 hover:border-brown-300"
                  }`}
                >
                  <div
                    className={`relative h-10 w-16 transition-opacity duration-200 ${
                      isActive ? "opacity-100" : "opacity-60 group-hover:opacity-100"
                    }`}
                  >
                    {sub.icon ? (
                      // Inline SVG or Image for the icon
                      <Image
                        src={sub.icon}
                        alt={sub.label}
                        fill
                        className="object-contain"
                      />
                    ) : (
                      // Fallback if no icon
                      <div className="flex h-full w-full items-center justify-center border border-dashed border-brown-300 bg-brown-50">
                        <span className="text-[10px] uppercase tracking-widest text-brown-400">
                          {sub.label.slice(0, 3)}
                        </span>
                      </div>
                    )}
                  </div>
                  <span
                    className={`text-xs font-semibold uppercase tracking-widest ${
                      isActive ? "text-brown-900" : "text-brown-500 group-hover:text-brown-700"
                    }`}
                  >
                    {sub.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
