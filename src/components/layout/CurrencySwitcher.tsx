"use client";

import { useRouter } from "next/navigation";
import { CURRENCIES, CURRENCY_COOKIE } from "@/lib/currencies";

export default function CurrencySwitcher({ current }: { current: string }) {
  const router = useRouter();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    document.cookie = `${CURRENCY_COOKIE}=${e.target.value}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
    router.refresh();
  }

  return (
    <select
      value={current}
      onChange={handleChange}
      className="border-0 bg-transparent text-xs font-medium text-white/50 focus:outline-none hover:text-white cursor-pointer"
      style={{ fontFamily: "var(--font-body)" }}
      aria-label="Select currency"
    >
      {Object.values(CURRENCIES).map((c) => (
        <option key={c.code} value={c.code} className="bg-[#004389] text-white">
          {c.symbol} {c.code}
        </option>
      ))}
    </select>
  );
}
