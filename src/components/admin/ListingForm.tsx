"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createListing, updateListing, deleteListing } from "@/app/admin/listings/actions";
import type { Listing } from "@/types";

type Mode = "create" | "edit";
interface Props {
  mode: Mode;
  listing?: Listing;
}

const CATEGORIES = [
  "Agricultural - Tractor",
  "Agricultural - Harvester",
  "Agricultural - Equipment",
  "Industrial",
  "Trucks",
  "Buses",
  "Spare Parts",
];

const CURRENCIES = ["USD", "EUR", "PEN", "CLP", "BRL", "MXN"];
const CONDITIONS = [
  { value: "new", label: "New" },
  { value: "used", label: "Used" },
  { value: "refurbished", label: "Refurbished" },
];
const DRIVE_TYPES = ["4WD", "2WD", "AWD"];
const FUEL_TYPES = ["Diesel", "Gasoline", "Electric", "Hybrid", "LPG"];

// ── Small UI helpers ──────────────────────────────────────────────────────────

function Field({ label, required, hint, children }: {
  label: string; required?: boolean; hint?: string; children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
    </div>
  );
}

function TextInput({ value, onChange, placeholder, required }: {
  value: string; onChange: (v: string) => void;
  placeholder?: string; required?: boolean;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      className="block w-full rounded-md border-gray-300 shadow-sm text-sm focus:border-navy-500 focus:ring-navy-500 px-3 py-2 border"
    />
  );
}

function NumberInput({ value, onChange, placeholder, min }: {
  value: string; onChange: (v: string) => void;
  placeholder?: string; min?: number;
}) {
  return (
    <input
      type="number"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      min={min}
      className="block w-full rounded-md border-gray-300 shadow-sm text-sm focus:border-navy-500 focus:ring-navy-500 px-3 py-2 border"
    />
  );
}

function SelectInput({ value, onChange, options }: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[] | string[];
}) {
  const normalized = options.map((o) =>
    typeof o === "string" ? { value: o, label: o } : o
  );
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="block w-full rounded-md border-gray-300 shadow-sm text-sm focus:border-navy-500 focus:ring-navy-500 px-3 py-2 border bg-white"
    >
      <option value="">— Select —</option>
      {normalized.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

function Checkbox({ checked, onChange, label }: {
  checked: boolean; onChange: (v: boolean) => void; label: string;
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-gray-300 text-navy-600 focus:ring-navy-500"
      />
      <span className="text-sm text-gray-700">{label}</span>
    </label>
  );
}

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="border-b border-gray-200 pb-3 mb-5">
      <h3 className="text-base font-semibold text-gray-900">{title}</h3>
      {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
    </div>
  );
}

function AdvancedSection({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-white shadow sm:rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center justify-between px-4 py-4 sm:px-6 text-left hover:bg-gray-50 transition-colors"
      >
        <span className="text-sm font-medium text-gray-700">{title}</span>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && <div className="px-4 pb-6 sm:px-6">{children}</div>}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function ListingForm({ mode, listing }: Props) {
  const router = useRouter();
  const initial = listing ?? null;
  const d = initial?.details ?? {};
  const eng = d.engine ?? {};
  const pto = d.pto ?? {};
  const dims = d.dimensions ?? {};
  const tires = d.tires ?? {};
  const cabin = d.cabin ?? {};

  // Basic
  const [brand, setBrand] = useState(initial?.brand ?? "");
  const [model, setModel] = useState(initial?.model ?? "");
  const [title, setTitle] = useState(initial?.title ?? "");
  const [year, setYear] = useState(initial?.year?.toString() ?? new Date().getFullYear().toString());
  const [condition, setCondition] = useState<string>(initial?.condition ?? "new");
  const [category, setCategory] = useState(d.category ?? "");

  // Pricing & Location
  const [price, setPrice] = useState(initial?.price?.toString() ?? "");
  const [currency, setCurrency] = useState(initial?.currency ?? "USD");
  const [location, setLocation] = useState(initial?.location ?? "");
  const [country, setCountry] = useState(initial?.country ?? "");
  const [hoursUsed, setHoursUsed] = useState(initial?.hours_used?.toString() ?? "");

  // Description
  const [description, setDescription] = useState(initial?.description ?? "");

  // Performance
  const [horsepower, setHorsepower] = useState(initial?.horsepower?.toString() ?? "");
  const [transmission, setTransmission] = useState(initial?.transmission ?? "");
  const [driveType, setDriveType] = useState(initial?.drive_type ?? "");

  // Engine
  const [engineMfr, setEngineMfr] = useState(eng.manufacturer ?? "");
  const [engineModel, setEngineModel] = useState(eng.model ?? "");
  const [displacement, setDisplacement] = useState(eng.displacement_cc?.toString() ?? "");
  const [cylinders, setCylinders] = useState(eng.cylinders?.toString() ?? "");
  const [fuelType, setFuelType] = useState(eng.fuel_type ?? "Diesel");
  const [rpmRated, setRpmRated] = useState(eng.rpm_rated?.toString() ?? "");

  // PTO
  const [rearPto, setRearPto] = useState(pto.rear_pto ?? false);
  const [rearPtoRpm, setRearPtoRpm] = useState(pto.rear_pto_rpm ?? "");
  const [frontPto, setFrontPto] = useState(pto.front_pto ?? false);

  // Dimensions
  const [dimLength, setDimLength] = useState(dims.length_mm?.toString() ?? "");
  const [dimWidth, setDimWidth] = useState(dims.width_mm?.toString() ?? "");
  const [dimHeight, setDimHeight] = useState(dims.height_mm?.toString() ?? "");
  const [dimWeight, setDimWeight] = useState(dims.operating_weight_kg?.toString() ?? "");
  const [dimClearance, setDimClearance] = useState(dims.ground_clearance_mm?.toString() ?? "");

  // Tires
  const [tireFront, setTireFront] = useState(tires.front ?? "");
  const [tireRear, setTireRear] = useState(tires.rear ?? "");

  // Cabin
  const [hasCabin, setHasCabin] = useState(cabin.cabin ?? false);
  const [hasAC, setHasAC] = useState(cabin.air_conditioning ?? false);
  const [hasGPS, setHasGPS] = useState(cabin.gps_ready ?? false);
  const [hasLoader, setHasLoader] = useState(cabin.front_loader_ready ?? false);

  // UI state
  const [isPending, startTransition] = useTransition();
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  function buildInput() {
    return {
      title: title || `${brand} ${model}`.trim(),
      brand,
      model,
      year: parseInt(year) || new Date().getFullYear(),
      condition: condition as "new" | "used" | "refurbished",
      location,
      country,
      price: parseFloat(price) || 0,
      currency,
      hours_used: hoursUsed ? parseInt(hoursUsed) : null,
      horsepower: horsepower ? parseInt(horsepower) : null,
      transmission: transmission || null,
      drive_type: driveType || null,
      description,
      images: initial?.images ?? [],
      details: {
        category: category || undefined,
        engine: {
          manufacturer: engineMfr || undefined,
          model: engineModel || undefined,
          displacement_cc: displacement ? parseInt(displacement) : undefined,
          cylinders: cylinders ? parseInt(cylinders) : undefined,
          fuel_type: fuelType || undefined,
          rpm_rated: rpmRated ? parseInt(rpmRated) : undefined,
        },
        pto: {
          rear_pto: rearPto || undefined,
          rear_pto_rpm: rearPtoRpm || undefined,
          front_pto: frontPto || undefined,
        },
        dimensions: {
          length_mm: dimLength ? parseInt(dimLength) : undefined,
          width_mm: dimWidth ? parseInt(dimWidth) : undefined,
          height_mm: dimHeight ? parseInt(dimHeight) : undefined,
          operating_weight_kg: dimWeight ? parseInt(dimWeight) : undefined,
          ground_clearance_mm: dimClearance ? parseInt(dimClearance) : undefined,
        },
        tires: {
          front: tireFront || undefined,
          rear: tireRear || undefined,
        },
        cabin: {
          cabin: hasCabin || undefined,
          air_conditioning: hasAC || undefined,
          gps_ready: hasGPS || undefined,
          front_loader_ready: hasLoader || undefined,
        },
      },
    };
  }

  function handleSave() {
    if (!brand || !model) {
      setSaveStatus("error");
      setErrorMsg("Brand and Model are required.");
      return;
    }
    setSaveStatus("idle");
    setErrorMsg("");
    startTransition(async () => {
      try {
        const input = buildInput();
        if (mode === "create") {
          const { id } = await createListing(input);
          router.push(`/admin/listings/${id}`);
        } else {
          await updateListing(listing!.id, input);
          setSaveStatus("saved");
          setTimeout(() => setSaveStatus("idle"), 3000);
        }
      } catch (e: unknown) {
        setSaveStatus("error");
        setErrorMsg(e instanceof Error ? e.message : "An unexpected error occurred.");
      }
    });
  }

  function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    startTransition(async () => {
      try {
        await deleteListing(listing!.id);
        router.push("/admin");
      } catch (e: unknown) {
        setSaveStatus("error");
        setErrorMsg(e instanceof Error ? e.message : "Failed to delete.");
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* Top action bar */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.push("/admin")}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          All Listings
        </button>

        <div className="flex items-center gap-3">
          {saveStatus === "saved" && (
            <span className="text-sm text-green-600 font-medium">Saved</span>
          )}
          {saveStatus === "error" && (
            <span className="text-sm text-red-600">{errorMsg}</span>
          )}
          {mode === "edit" && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={isPending}
              className={`text-sm font-medium px-3 py-2 rounded-md transition-colors ${
                confirmDelete
                  ? "bg-red-600 text-white hover:bg-red-700"
                  : "text-red-600 hover:bg-red-50"
              }`}
            >
              {confirmDelete ? "Confirm Delete" : "Delete"}
            </button>
          )}
          {confirmDelete && (
            <button
              type="button"
              onClick={() => setConfirmDelete(false)}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={isPending}
            className="inline-flex items-center gap-2 rounded-md bg-[#001E50] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#002a6e] disabled:opacity-60 transition-colors"
          >
            {isPending ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Saving…
              </>
            ) : mode === "create" ? "Create Listing" : "Save Changes"}
          </button>
        </div>
      </div>

      {/* ── Section 1: Basic Information ──────────────────────────────────────── */}
      <div className="bg-white shadow sm:rounded-lg px-4 py-5 sm:p-6">
        <SectionHeader
          title="Basic Information"
          subtitle="The main details that identify this product in the catalog."
        />
        <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-3">
          <Field label="Brand" required>
            <TextInput value={brand} onChange={setBrand} placeholder="e.g. YTO, SinoHarvest, JD" required />
          </Field>
          <Field label="Model" required>
            <TextInput value={model} onChange={setModel} placeholder="e.g. SH504" required />
          </Field>
          <Field label="Year" required>
            <NumberInput value={year} onChange={setYear} placeholder="2024" min={1950} />
          </Field>
          <Field label="Title" hint="Leave blank to auto-generate from Brand + Model">
            <TextInput value={title} onChange={setTitle} placeholder="Auto-generated if empty" />
          </Field>
          <Field label="Condition" required>
            <SelectInput value={condition} onChange={setCondition} options={CONDITIONS} />
          </Field>
          <Field label="Category">
            <SelectInput value={category} onChange={setCategory} options={CATEGORIES} />
          </Field>
        </div>
      </div>

      {/* ── Section 2: Pricing & Location ─────────────────────────────────────── */}
      <div className="bg-white shadow sm:rounded-lg px-4 py-5 sm:p-6">
        <SectionHeader
          title="Pricing & Location"
          subtitle="Set the price and where the product is located."
        />
        <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-3">
          <Field label="Price">
            <NumberInput value={price} onChange={setPrice} placeholder="0" min={0} />
          </Field>
          <Field label="Currency">
            <SelectInput value={currency} onChange={setCurrency} options={CURRENCIES} />
          </Field>
          <Field label="Hours Used" hint="For used machinery only">
            <NumberInput value={hoursUsed} onChange={setHoursUsed} placeholder="e.g. 1200" min={0} />
          </Field>
          <Field label="Location" hint="City or region">
            <TextInput value={location} onChange={setLocation} placeholder="e.g. Tacna, Peru" />
          </Field>
          <Field label="Country">
            <TextInput value={country} onChange={setCountry} placeholder="e.g. China, Peru, Brazil" />
          </Field>
        </div>
      </div>

      {/* ── Section 3: Description ────────────────────────────────────────────── */}
      <div className="bg-white shadow sm:rounded-lg px-4 py-5 sm:p-6">
        <SectionHeader
          title="Description"
          subtitle="A detailed description of the product that buyers will read."
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={6}
          placeholder="Describe the product, its key features, intended use, and any important specifications..."
          className="block w-full rounded-md border-gray-300 shadow-sm text-sm focus:border-navy-500 focus:ring-navy-500 px-3 py-2 border"
        />
        <p className="mt-1 text-xs text-gray-400">{description.length} characters</p>
      </div>

      {/* ── Section 4: Performance ────────────────────────────────────────────── */}
      <div className="bg-white shadow sm:rounded-lg px-4 py-5 sm:p-6">
        <SectionHeader
          title="Performance"
          subtitle="Key technical figures shown on listing cards and in filters."
        />
        <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-3">
          <Field label="Horsepower (HP)">
            <NumberInput value={horsepower} onChange={setHorsepower} placeholder="e.g. 50" min={0} />
          </Field>
          <Field label="Transmission" hint="e.g. 8+2, 12+4, CVT">
            <TextInput value={transmission} onChange={setTransmission} placeholder="e.g. 8+2" />
          </Field>
          <Field label="Drive Type">
            <SelectInput value={driveType} onChange={setDriveType} options={DRIVE_TYPES} />
          </Field>
        </div>
      </div>

      {/* ── Advanced sections (collapsible) ───────────────────────────────────── */}
      <AdvancedSection title="Engine Specifications">
        <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-3 mt-2">
          <Field label="Engine Manufacturer">
            <TextInput value={engineMfr} onChange={setEngineMfr} placeholder="e.g. Yuchai, XCEC" />
          </Field>
          <Field label="Engine Model">
            <TextInput value={engineModel} onChange={setEngineModel} placeholder="e.g. 4100B-4a" />
          </Field>
          <Field label="Fuel Type">
            <SelectInput value={fuelType} onChange={setFuelType} options={FUEL_TYPES} />
          </Field>
          <Field label="Displacement (cc)">
            <NumberInput value={displacement} onChange={setDisplacement} placeholder="e.g. 3300" min={0} />
          </Field>
          <Field label="Cylinders">
            <NumberInput value={cylinders} onChange={setCylinders} placeholder="e.g. 4" min={1} />
          </Field>
          <Field label="Rated RPM">
            <NumberInput value={rpmRated} onChange={setRpmRated} placeholder="e.g. 2000" min={0} />
          </Field>
        </div>
      </AdvancedSection>

      <AdvancedSection title="Dimensions & Weight">
        <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-3 mt-2">
          <Field label="Length (mm)">
            <NumberInput value={dimLength} onChange={setDimLength} placeholder="e.g. 3325" min={0} />
          </Field>
          <Field label="Width (mm)">
            <NumberInput value={dimWidth} onChange={setDimWidth} placeholder="e.g. 1848" min={0} />
          </Field>
          <Field label="Height (mm)">
            <NumberInput value={dimHeight} onChange={setDimHeight} placeholder="e.g. 2350" min={0} />
          </Field>
          <Field label="Operating Weight (kg)">
            <NumberInput value={dimWeight} onChange={setDimWeight} placeholder="e.g. 2370" min={0} />
          </Field>
          <Field label="Ground Clearance (mm)">
            <NumberInput value={dimClearance} onChange={setDimClearance} placeholder="e.g. 334" min={0} />
          </Field>
        </div>
      </AdvancedSection>

      <AdvancedSection title="Tires & PTO">
        <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2 mt-2">
          <Field label="Front Tires" hint="e.g. 8.3-20">
            <TextInput value={tireFront} onChange={setTireFront} placeholder="e.g. 8.3-20" />
          </Field>
          <Field label="Rear Tires" hint="e.g. 11-32">
            <TextInput value={tireRear} onChange={setTireRear} placeholder="e.g. 11-32" />
          </Field>
        </div>
        <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-3 mt-5">
          <Checkbox checked={rearPto} onChange={setRearPto} label="Rear PTO" />
          <Field label="Rear PTO RPM">
            <TextInput value={rearPtoRpm} onChange={setRearPtoRpm} placeholder="e.g. 540 / 766" />
          </Field>
          <Checkbox checked={frontPto} onChange={setFrontPto} label="Front PTO" />
        </div>
      </AdvancedSection>

      <AdvancedSection title="Cabin & Features">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mt-2">
          <Checkbox checked={hasCabin} onChange={setHasCabin} label="Enclosed Cabin" />
          <Checkbox checked={hasAC} onChange={setHasAC} label="Air Conditioning" />
          <Checkbox checked={hasGPS} onChange={setHasGPS} label="GPS Ready" />
          <Checkbox checked={hasLoader} onChange={setHasLoader} label="Front Loader Ready" />
        </div>
      </AdvancedSection>

      {/* Bottom save button — convenience repeat */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          className="inline-flex items-center gap-2 rounded-md bg-[#001E50] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#002a6e] disabled:opacity-60 transition-colors"
        >
          {isPending ? "Saving…" : mode === "create" ? "Create Listing" : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
