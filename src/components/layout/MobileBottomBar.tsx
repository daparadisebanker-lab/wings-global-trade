"use client";

import { Fragment } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconCatalog,
  IconImport,
  IconQuote,
  IconWhatsApp,
} from "@/components/icons";

const WA_URL = "https://wa.me/51958381473";

const ITEMS = [
  { label: "Catálogo", href: "/categories", Icon: IconCatalog },
  { label: "Importar", href: "/importacion", Icon: IconImport },
  { label: "Cotizar", href: "/cotizar", Icon: IconQuote },
] as const;

function ItemBody({
  Icon,
  label,
  active,
  withDot,
}: {
  Icon: (props: React.SVGProps<SVGSVGElement>) => React.ReactElement;
  label: string;
  active?: boolean;
  withDot?: boolean;
}) {
  return (
    <>
      <span className="relative">
        <Icon className="h-[22px] w-[22px]" />
        {withDot && (
          <span
            className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: "#25D366" }}
            aria-hidden="true"
          />
        )}
      </span>
      <span
        className="text-[9.5px] font-semibold uppercase tracking-[0.14em]"
        style={{ fontFamily: "var(--font-body)" }}
      >
        {label}
      </span>
      {/* active/hover accent bar */}
      <span
        aria-hidden="true"
        className={`h-0.5 w-4 rounded-full transition-opacity duration-200 ${
          active ? "opacity-100" : "opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100"
        }`}
        style={{ backgroundColor: "#C4933F" }}
      />
    </>
  );
}

export default function MobileBottomBar() {
  const pathname = usePathname();

  const itemClass = (active: boolean) =>
    `group flex min-h-[48px] flex-1 flex-col items-center justify-center gap-1 pb-1.5 pt-2 transition-colors duration-200 ${
      active
        ? "text-[#F4F2ED]"
        : "text-[rgba(244,242,237,0.62)] hover:text-[#F4F2ED] focus-visible:text-[#F4F2ED]"
    }`;

  // 30px ≈ 55% of the ~56px bar — a % height would collapse in an
  // auto-height flex row, so the divider height is fixed.
  const divider = (
    <span
      aria-hidden="true"
      className="h-[30px] w-px self-center"
      style={{ backgroundColor: "rgba(244,242,237,0.12)" }}
    />
  );

  return (
    <nav
      aria-label="Navegación inferior"
      className="fixed bottom-0 left-0 right-0 z-40 flex md:hidden"
      style={{
        paddingBottom: "env(safe-area-inset-bottom)",
        backgroundColor: "rgba(11,12,14,0.94)",
        WebkitBackdropFilter: "blur(12px)",
        backdropFilter: "blur(12px)",
        borderTop: "1px solid rgba(244,242,237,0.14)",
      }}
    >
      {ITEMS.map(({ label, href, Icon }, i) => {
        const active = pathname.startsWith(href);
        return (
          <Fragment key={href}>
            {i > 0 && divider}
            <Link
              href={href}
              aria-current={active ? "page" : undefined}
              className={itemClass(active)}
            >
              <ItemBody Icon={Icon} label={label} active={active} />
            </Link>
          </Fragment>
        );
      })}
      {divider}
      <a
        href={WA_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={itemClass(false)}
      >
        <ItemBody Icon={IconWhatsApp} label="WhatsApp" withDot />
      </a>
    </nav>
  );
}
