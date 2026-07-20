// src/lib/promo/fonts.ts
// Brand font files for server-side share-card rasterization (resvg). The card
// SVG (@wings/rb-core) references NissanOpti / Flexo / Teko; resvg matches those
// by the fonts' internal family names, so we hand it the actual files. Kept in
// apps/tower/public/fonts and pinned into the function bundle via next.config
// outputFileTracingIncludes. Missing files are filtered out at call time so the
// route always renders (falling back to system fonts).
import path from 'node:path'
import { existsSync } from 'node:fs'

const DIR = path.join(process.cwd(), 'public', 'fonts')

const CANDIDATES = [
  path.join(DIR, 'NissanOpti.otf'),
  path.join(DIR, 'flexo', 'Flexo-Regular.ttf'),
  path.join(DIR, 'flexo', 'Flexo-Medium.ttf'),
  path.join(DIR, 'flexo', 'Flexo-Demi.ttf'),
  path.join(DIR, 'flexo', 'Flexo-Bold.ttf'),
  path.join(DIR, 'Teko-Medium.ttf'),
  path.join(DIR, 'Teko-SemiBold.ttf'),
  path.join(DIR, 'Teko-Bold.ttf'),
]

/** Existing brand font files to hand to resvg's `font.fontFiles`. */
export function promoFontFiles(): string[] {
  return CANDIDATES.filter((f) => existsSync(f))
}
