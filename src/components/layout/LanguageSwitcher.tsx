"use client";

import { useRouter } from "next/navigation";
import { SUPPORTED_LANGUAGES, LANG_COOKIE } from "@/lib/i18n";

export default function LanguageSwitcher({ current }: { current: string }) {
  const router = useRouter();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    document.cookie = `${LANG_COOKIE}=${e.target.value}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
    router.refresh();
  }

  return (
    <select
      value={current}
      onChange={handleChange}
      className="border-0 bg-transparent text-xs font-medium text-white/50 focus:outline-none hover:text-white cursor-pointer"
      style={{ fontFamily: "var(--font-body)" }}
      aria-label="Select language"
    >
      {SUPPORTED_LANGUAGES.map((l) => (
        <option key={l.code} value={l.code} className="bg-[#004389] text-white">
          {l.label}
        </option>
      ))}
    </select>
  );
}
