"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useTransition, useRef } from "react";

interface Props {
  makes:     string[];
  countries: string[];
  t: {
    filters:         string;
    clearAll:        string;
    makeLabel:       string;
    conditionLabel:  string;
    yearLabel:       string;
    priceLabel:      string;
    countryLabel:    string;
    anyLabel:        string;
    condAny:         string;
    condNew:         string;
    condUsed:        string;
    condRefurbished: string;
    sortBy:          string;
    sortNewest:      string;
    sortPriceAsc:    string;
    sortPriceDesc:   string;
    sortHoursAsc:    string;
  };
}

const SORT_OPTIONS = [
  { label: "Más recientes",        value: ""           },
  { label: "Potencia: menor → mayor", value: "hp-asc"  },
  { label: "Potencia: mayor → menor", value: "hp-desc" },
];

const HP_RANGES = [
  { label: "40 – 60 hp",   min: "40",  max: "60"  },
  { label: "60 – 80 hp",   min: "60",  max: "80"  },
  { label: "80 – 100 hp",  min: "80",  max: "100" },
  { label: "100 – 130 hp", min: "100", max: "130" },
  { label: "130 – 160 hp", min: "130", max: "160" },
  { label: "160 – 210 hp", min: "160", max: "210" },
];

export default function FilterPanel({ makes, countries: _countries, t }: Props) {
  const router       = useRouter();
  const pathname     = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const debounceRef  = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const get    = (key: string) => searchParams.get(key) ?? "";
  const getAll = (key: string) => searchParams.getAll(key);

  const updateParam = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value); else params.delete(key);
    startTransition(() => router.push(`${pathname}?${params.toString()}`, { scroll: false }));
  }, [pathname, router, searchParams]);

  const toggleParam = useCallback((key: string, value: string, checked: boolean) => {
    const params = new URLSearchParams(searchParams.toString());
    if (checked) {
      params.append(key, value);
    } else {
      const values = params.getAll(key).filter((v) => v !== value);
      params.delete(key);
      values.forEach((v) => params.append(key, v));
    }
    startTransition(() => router.push(`${pathname}?${params.toString()}`, { scroll: false }));
  }, [pathname, router, searchParams]);

  const handleInstant = useCallback(
    (key: string) => (e: React.ChangeEvent<HTMLSelectElement>) => updateParam(key, e.target.value),
    [updateParam],
  );

  const handleDebounced = useCallback(
    (key: string, delay = 400) =>
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        clearTimeout(debounceRef.current[key]);
        debounceRef.current[key] = setTimeout(() => updateParam(key, value), delay);
      },
    [updateParam],
  );

  const reset = useCallback(() => {
    startTransition(() => router.push(pathname, { scroll: false }));
  }, [pathname, router]);

  const activeHpRange = HP_RANGES.find(
    (r) => get("hpMin") === r.min && get("hpMax") === r.max
  )?.label ?? "";

  function handleHpRange(label: string) {
    const range = HP_RANGES.find((r) => r.label === label);
    const params = new URLSearchParams(searchParams.toString());
    if (range) {
      params.set("hpMin", range.min);
      params.set("hpMax", range.max);
    } else {
      params.delete("hpMin");
      params.delete("hpMax");
    }
    startTransition(() => router.push(`${pathname}?${params.toString()}`, { scroll: false }));
  }

  const hasFilters = searchParams.toString().length > 0;

  return (
    <div className="overflow-hidden rounded-2xl border border-[#E8E4DB] bg-white">

      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#E8E4DB] px-5 py-4">
        <span
          className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#1C1A16]"
          style={{ fontFamily: "var(--font-body)" }}
        >
          {t.filters}
          {isPending && (
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-[#C4933F]" />
          )}
        </span>
        {hasFilters && (
          <button
            type="button"
            onClick={reset}
            className="flex items-center gap-1 rounded-full px-3 py-1 text-xs uppercase tracking-wide text-[#6B6560] transition-colors hover:bg-[#F8F6F0] hover:text-[#1C1A16]"
            style={{ fontFamily: "var(--font-body)" }}
          >
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            {t.clearAll}
          </button>
        )}
      </div>

      <div className="divide-y divide-[#E8E4DB]">

        {/* Sort */}
        <FilterSection title={t.sortBy}>
          <select
            defaultValue={get("sort")}
            onChange={handleInstant("sort")}
            className="w-full rounded-xl border border-[#E8E4DB] bg-[#F8F6F0] px-3 py-2 text-xs text-[#1C1A16] focus:border-[#C4933F] focus:outline-none"
            style={{ fontFamily: "var(--font-body)" }}
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </FilterSection>

        {/* Brand */}
        <FilterSection title={t.makeLabel}>
          {makes.map((make) => (
            <label
              key={make}
              className="flex cursor-pointer items-center gap-3 py-1 text-sm text-[#6B6560] hover:text-[#1C1A16]"
              style={{ fontFamily: "var(--font-body)" }}
            >
              <input
                type="checkbox"
                name="brand"
                value={make}
                checked={getAll("brand").includes(make)}
                onChange={(e) => toggleParam("brand", make, e.target.checked)}
                className="h-3.5 w-3.5 rounded border-[#E8E4DB] accent-[#C4933F]"
              />
              {make}
            </label>
          ))}
        </FilterSection>

        {/* Horsepower ranges */}
        <FilterSection title="Potencia (HP)">
          <div className="flex flex-col gap-1">
            <label
              className="flex cursor-pointer items-center gap-3 py-1 text-sm text-[#6B6560] hover:text-[#1C1A16]"
              style={{ fontFamily: "var(--font-body)" }}
            >
              <input
                type="radio"
                name="hpRange"
                value=""
                checked={activeHpRange === ""}
                onChange={() => handleHpRange("")}
                className="accent-[#C4933F]"
              />
              Todos los rangos
            </label>
            {HP_RANGES.map((r) => (
              <label
                key={r.label}
                className="flex cursor-pointer items-center gap-3 py-1 text-sm text-[#6B6560] hover:text-[#1C1A16]"
                style={{ fontFamily: "var(--font-body)" }}
              >
                <input
                  type="radio"
                  name="hpRange"
                  value={r.label}
                  checked={activeHpRange === r.label}
                  onChange={() => handleHpRange(r.label)}
                  className="accent-[#C4933F]"
                />
                {r.label}
              </label>
            ))}
          </div>
        </FilterSection>

        {/* Tracción */}
        <FilterSection title="Tracción" last>
          {["4WD", "2WD"].map((drive) => (
            <label
              key={drive}
              className="flex cursor-pointer items-center gap-3 py-1 text-sm text-[#6B6560] hover:text-[#1C1A16]"
              style={{ fontFamily: "var(--font-body)" }}
            >
              <input
                type="checkbox"
                name="drive_type"
                value={drive}
                checked={getAll("drive_type").includes(drive)}
                onChange={(e) => toggleParam("drive_type", drive, e.target.checked)}
                className="h-3.5 w-3.5 rounded border-[#E8E4DB] accent-[#C4933F]"
              />
              {drive}
            </label>
          ))}
        </FilterSection>

      </div>
    </div>
  );
}

// ── Sort bar (used in page header) ────────────────────────────────────────────
export function SortBar({ currentSort }: { currentSort: string }) {
  const router       = useRouter();
  const pathname     = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    if (e.target.value) params.set("sort", e.target.value);
    else params.delete("sort");
    startTransition(() => router.push(`${pathname}?${params.toString()}`, { scroll: false }));
  };

  return (
    <select
      defaultValue={currentSort}
      onChange={handleChange}
      className="rounded-xl border border-[#E8E4DB] bg-white px-3 py-2 text-sm text-[#1C1A16] focus:border-[#C4933F] focus:outline-none"
      style={{ fontFamily: "var(--font-body)" }}
    >
      {SORT_OPTIONS.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

function FilterSection({
  title,
  children,
  last: _last,
}: {
  title: string;
  children: React.ReactNode;
  last?: boolean;
}) {
  return (
    <div className="px-5 py-4">
      <p
        className="mb-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#C4933F]"
        style={{ fontFamily: "var(--font-body)" }}
      >
        {title}
      </p>
      {children}
    </div>
  );
}
