import { Archivo, IBM_Plex_Mono, Inter } from "next/font/google";

// Self-hosted at build time via next/font (§3). Variable names match the
// font-*-v2 mappings in tailwind.config.ts. Applied on the homepage root only
// so inner pages keep the Flexo brandbook system.
export const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"], // Archivo Expanded = wdth 125, applied via .wings-display
  variable: "--font-archivo",
  display: "swap",
});

export const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-ibm-plex-mono",
  display: "swap",
});
