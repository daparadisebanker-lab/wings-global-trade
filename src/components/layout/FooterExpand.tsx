"use client";

import { useId, useState } from "react";
import { IconChevronDown } from "@/components/icons";

/**
 * Collapsible region for the long footer content. Server-rendered children
 * pass through untouched; only the toggle + grid animation live on the client.
 * grid-template-rows 0fr→1fr animates to the content's intrinsic height —
 * no max-height guessing, no layout jump.
 */
export default function FooterExpand({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const regionId = useId();

  return (
    <>
      <div className="border-t border-white/8">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={regionId}
          onClick={() => setOpen((v) => !v)}
          className="mx-auto flex h-11 w-full max-w-7xl items-center justify-center gap-2 px-6 text-[10px] font-semibold uppercase tracking-[0.15em] text-white/40 transition-colors hover:text-white/80 lg:px-8"
          style={{ fontFamily: "var(--font-body)" }}
        >
          Más información
          <IconChevronDown
            className={`h-3.5 w-3.5 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
          />
        </button>
      </div>
      <div
        id={regionId}
        style={{
          display: "grid",
          gridTemplateRows: open ? "1fr" : "0fr",
          transition: "grid-template-rows 450ms cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        <div className="min-h-0 overflow-hidden">{children}</div>
      </div>
    </>
  );
}
