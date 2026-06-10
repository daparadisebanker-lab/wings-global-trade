import { redirect } from "next/navigation";

// Stub route (WINGS_HOME_SPEC.md §6.3 / §10) — the site already has a full
// catalog at /categories, so the stub forwards there instead of a placeholder.
export default function CategoriasPage() {
  redirect("/categories");
}
