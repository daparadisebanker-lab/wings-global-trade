"use client";

import { useRouter } from "next/navigation";
import { CURRENCIES, CURRENCY_COOKIE } from "@/lib/currencies";

interface Props {
  current: string;
}

export default function CurrencySwitcher({ current }: Props) {
  const router = useRouter();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value;
    document.cookie = `${CURRENCY_COOKIE}=${value}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
    router.refresh();
  }

  return (
    <select
      value={current}
      onChange={handleChange}
      className="border-0 bg-transparent text-xs font-medium text-brown-600 focus:outline-none hover:text-brown-900 cursor-pointer"
      aria-label="Select currency"
    >
      {Object.values(CURRENCIES).map((c) => (
        <option key={c.code} value={c.code}>
          {c.symbol} {c.code}
        </option>
      ))}
    </select>
  );
}
