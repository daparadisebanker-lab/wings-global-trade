"use client";

import { useRouter } from "next/navigation";
import { SUPPORTED_LANGUAGES, LANG_COOKIE } from "@/lib/i18n";

export default function LanguageSwitcher({ current }: { current: string }) {
  const router = useRouter();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    document.cookie = `${LANG_COOKIE}=${e.target.value};path=/;max-age=${60 * 60 * 24 * 365};samesite=lax`;
    router.refresh();
  }

  return (
    <select
      value={current}
      onChange={handleChange}
      className="border border-brown-300 bg-white px-2 py-1.5 text-xs text-brown-700 focus:border-brown-600 focus:outline-none"
    >
      {SUPPORTED_LANGUAGES.map((l) => (
        <option key={l.code} value={l.code}>
          {l.label}
        </option>
      ))}
    </select>
  );
}
