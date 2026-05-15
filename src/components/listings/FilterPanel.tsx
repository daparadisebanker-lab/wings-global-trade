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
  { label: "Newest first",       value: ""           },
  { label: "HP: Low → High",    value: "hp-asc"     },
  { label: "HP: High → Low",    value: "hp-desc"    },
  { label: "Price: Low → High", value: "price-asc"  },
  { label: "Price: High → Low", value: "price-desc" },
];

export default function FilterPanel({ makes, countries, t }: Props) {
  const router       = useRouter();
  const pathname     = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Debounce timers for number inputs
  const debounceRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const get = (key: string) => searchParams.get(key) ?? "";
  const getAll = (key: string) => searchParams.getAll(key);

  // ── Core: update one param and push ──────────────────────────────────────
  const updateParam = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    startTransition(() => router.push(`${pathname}?${params.toString()}`, { scroll: false }));
  }, [pathname, router, searchParams]);

  // ── Core: toggle array param and push ────────────────────────────────────
  const toggleParam = useCallback((key: string, value: string, checked: boolean) => {
    const params = new URLSearchParams(searchParams.toString());
    if (checked) {
      params.append(key, value);
    } else {
      const values = params.getAll(key).filter(v => v !== value);
      params.delete(key);
      values.forEach(v => params.append(key, v));
    }
    startTransition(() => router.push(`${pathname}?${params.toString()}`, { scroll: false }));
  }, [pathname, router, searchParams]);

  // ── Instant change (selects) ────────────────────────────────────
  const handleInstant = useCallback(
    (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      updateParam(key, e.target.value);
    },
    [updateParam],
  );

  // ── Debounced change (number inputs) ─────────────────────────────────────
  const handleDebounced = useCallback(
    (key: string, delay = 400) =>
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        clearTimeout(debounceRef.current[key]);
        debounceRef.current[key] = setTimeout(() => updateParam(key, value), delay);
      },
    [updateParam],
  );

  // ── Reset all ─────────────────────────────────────────────────────────────
  const reset = useCallback(() => {
    startTransition(() => router.push(pathname, { scroll: false }));
  }, [pathname, router]);

  const hasFilters = searchParams.toString().length > 0;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-brown-100 px-5 py-4">
        <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-brown-800">
          {t.filters}
          {isPending && (
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-brown-500" />
          )}
        </span>
        {hasFilters && (
          <button
            type="button"
            onClick={reset}
            className="flex items-center gap-1 rounded px-2 py-1 text-xs uppercase tracking-wide text-brown-400 transition-colors hover:bg-brown-50 hover:text-brown-800"
          >
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            {t.clearAll}
          </button>
        )}
      </div>

      <div className="divide-y divide-brown-100">

        {/* Sort */}
        <FilterSection title={t.sortBy}>
          <select
            defaultValue={get("sort")}
            onChange={handleInstant("sort")}
            className="input-field !py-1.5 !text-xs w-full"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </FilterSection>

        {/* Brand */}
        <FilterSection title={t.makeLabel}>
          {makes.map((make) => (
            <label key={make} className="flex cursor-pointer items-center gap-3 py-1 text-sm text-brown-700 hover:text-brown-900">
              <input
                type="checkbox"
                name="brand"
                value={make}
                checked={getAll("brand").includes(make)}
                onChange={(e) => toggleParam("brand", make, e.target.checked)}
                className="accent-brown-700 rounded border-brown-300"
              />
              {make}
            </label>
          ))}
        </FilterSection>

        {/* Condition */}
        <FilterSection title={t.conditionLabel}>
          {[
            { label: t.condNew,         value: "new" },
            { label: t.condUsed,        value: "used" },
            { label: t.condRefurbished, value: "refurbished" },
          ].map(({ label, value }) => (
            <label key={value} className="flex cursor-pointer items-center gap-3 py-1 text-sm text-brown-700 hover:text-brown-900">
              <input
                type="checkbox"
                name="condition"
                value={value}
                checked={getAll("condition").includes(value)}
                onChange={(e) => toggleParam("condition", value, e.target.checked)}
                className="accent-brown-700 rounded border-brown-300"
              />
              {label}
            </label>
          ))}
        </FilterSection>

        {/* Horsepower */}
        <FilterSection title="Horsepower (HP)">
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="Min"
              min={0}
              max={500}
              defaultValue={get("hpMin")}
              onChange={handleDebounced("hpMin")}
              className="input-field !py-1.5 !text-xs"
            />
            <span className="text-brown-300">—</span>
            <input
              type="number"
              placeholder="Max"
              min={0}
              max={500}
              defaultValue={get("hpMax")}
              onChange={handleDebounced("hpMax")}
              className="input-field !py-1.5 !text-xs"
            />
          </div>
        </FilterSection>

        {/* Price */}
        <FilterSection title={t.priceLabel}>
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="Min"
              min={0}
              defaultValue={get("priceMin")}
              onChange={handleDebounced("priceMin")}
              className="input-field !py-1.5 !text-xs"
            />
            <span className="text-brown-300">—</span>
            <input
              type="number"
              placeholder="Max"
              min={0}
              defaultValue={get("priceMax")}
              onChange={handleDebounced("priceMax")}
              className="input-field !py-1.5 !text-xs"
            />
          </div>
        </FilterSection>

        {/* Year */}
        <FilterSection title={t.yearLabel}>
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="From"
              min={1990}
              max={2030}
              defaultValue={get("yearFrom")}
              onChange={handleDebounced("yearFrom")}
              className="input-field !py-1.5 !text-xs"
            />
            <span className="text-brown-300">—</span>
            <input
              type="number"
              placeholder="To"
              min={1990}
              max={2030}
              defaultValue={get("yearTo")}
              onChange={handleDebounced("yearTo")}
              className="input-field !py-1.5 !text-xs"
            />
          </div>
        </FilterSection>

        {/* Country */}
        {countries.length > 0 && (
          <FilterSection title={t.countryLabel} last>
            <select
              defaultValue={get("country")}
              onChange={handleInstant("country")}
              className="input-field !py-1.5 !text-xs w-full"
            >
              <option value="">{t.anyLabel}</option>
              {countries.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </FilterSection>
        )}

      </div>
    </div>
  );
}

// ── Sort bar for the page header ──────────────────────────────────────────────
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
      className="border border-brown-300 bg-white px-3 py-2 text-sm text-brown-800 focus:border-brown-600 focus:outline-none"
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
  last,
}: {
  title: string;
  children: React.ReactNode;
  last?: boolean;
}) {
  return (
    <div className={`px-5 py-4 ${last ? "" : ""}`}>
      <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-brown-500">{title}</p>
      {children}
    </div>
  );
}
