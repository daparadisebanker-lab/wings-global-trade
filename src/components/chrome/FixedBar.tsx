import Link from "next/link";
import WingsLogo from "@/components/primitives/WingsLogo";

/**
 * Bottom conversion bar. Renders from first paint — no entrance animation.
 * The only filled button on the page; oxide is sanctioned here. Hover darkens
 * oxide ~8% via brightness so no second color value exists. Desktop-only —
 * the site-wide mobile bottom menu (root layout) takes its place below md.
 */
export default function FixedBar() {
  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[100] hidden border-t border-graphite bg-ink md:block"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex h-14 items-center justify-between pl-6">
        <WingsLogo height={26} tone="white" />
        <Link
          href="/cotizacion"
          className="flex h-14 items-center bg-oxide px-8 uppercase tracking-[0.12em] text-paper transition-[filter] duration-200 hover:brightness-[0.92]"
          style={{ fontFamily: "var(--font-data)", fontSize: "var(--type-data)" }}
        >
          Solicitar cotización
        </Link>
      </div>
    </div>
  );
}
