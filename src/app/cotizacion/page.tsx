import { redirect } from "next/navigation";

// Stub route (WINGS_HOME_SPEC.md §6.6 / §10) — the site already has a working
// quotation flow at /cotizar, so the stub forwards there instead of showing a
// dead placeholder.
export default function CotizacionPage() {
  redirect("/cotizar");
}
