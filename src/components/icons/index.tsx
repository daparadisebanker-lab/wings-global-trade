import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

/* Shared stroke-icon shell — every icon inherits currentColor so it adapts
   to both the navy brandbook chrome and the ink-glass premium chrome. */
function StrokeIcon({ children, ...rest }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {children}
    </svg>
  );
}

/** 2×2 module grid — last module offset, hinting at live inventory. */
export function IconCatalog(props: IconProps) {
  return (
    <StrokeIcon {...props}>
      <rect x="4" y="4" width="6.5" height="6.5" rx="0.75" />
      <rect x="13.5" y="4" width="6.5" height="6.5" rx="0.75" />
      <rect x="4" y="13.5" width="6.5" height="6.5" rx="0.75" />
      <rect x="14.75" y="14.75" width="5.75" height="5.75" rx="0.75" />
      <path d="M16.5 18.75l1.25 1 2-2.5" />
    </StrokeIcon>
  );
}

/** Container being craned onto a hull — direct importation. */
export function IconImport(props: IconProps) {
  return (
    <StrokeIcon {...props}>
      {/* crane mast + arm + cable */}
      <path d="M5.5 17.5V3.75h8M13.5 3.75v3" />
      {/* container with ribs */}
      <rect x="9.5" y="8.5" width="8.5" height="6" rx="0.5" />
      <path d="M12.4 8.5v6M15.4 8.5v6" />
      {/* hull */}
      <path d="M3 17.5h18l-2 3.25H5L3 17.5z" />
    </StrokeIcon>
  );
}

/** Quotation document — folded corner, spec lines, signature stroke. */
export function IconQuote(props: IconProps) {
  return (
    <StrokeIcon {...props}>
      <path d="M13.75 3.5H7.25c-.83 0-1.5.67-1.5 1.5v14c0 .83.67 1.5 1.5 1.5h9.5c.83 0 1.5-.67 1.5-1.5V8l-4.5-4.5z" />
      <path d="M13.75 3.5V8h4.5" />
      <path d="M9 11.5h6M9 14h3.5" />
      {/* signature */}
      <path d="M9 17.4c.7-1.1 1.3-1.1 1.9 0 .6 1.1 1.2 1.1 1.9 0H15" />
    </StrokeIcon>
  );
}

/** Official WhatsApp glyph — filled, single path. */
export function IconWhatsApp({ className, ...rest }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
      {...rest}
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

export function IconChevronDown(props: IconProps) {
  return (
    <StrokeIcon {...props}>
      <path d="M6 9.25l6 5.5 6-5.5" />
    </StrokeIcon>
  );
}

/** Asymmetric burger — shortened bottom rule for a drawn, editorial feel. */
export function IconMenu(props: IconProps) {
  return (
    <StrokeIcon {...props}>
      <path d="M4 7h16M4 12h16M4 17h10" />
    </StrokeIcon>
  );
}

export function IconClose(props: IconProps) {
  return (
    <StrokeIcon {...props}>
      <path d="M6 6l12 12M18 6L6 18" />
    </StrokeIcon>
  );
}

/** Classic handset outline. */
export function IconPhone(props: IconProps) {
  return (
    <StrokeIcon {...props}>
      <path d="M4.1 5.4c0-.97.78-1.75 1.75-1.75h1.9c.42 0 .79.27.92.67l1.04 3.11a.97.97 0 01-.44 1.15l-1.3.78a.49.49 0 00-.21.6 11.1 11.1 0 005.78 5.78c.22.1.48 0 .6-.21l.78-1.3a.97.97 0 011.15-.44l3.11 1.04c.4.13.67.5.67.92v1.9c0 .97-.78 1.75-1.75 1.75h-1.45C9.91 19.4 4.6 14.09 4.1 6.85V5.4z" />
    </StrokeIcon>
  );
}
