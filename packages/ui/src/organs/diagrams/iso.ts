// src/lib/rb/iso.ts
// Shared isometric projection for the RB technical drawings — one engine,
// every diagram (caja máster, exploded view, pallet, container cupos).
// Convention: x runs to the lower-right, z to the lower-left, y up.

export const ISO_COS = 0.866
export const ISO_SIN = 0.5

export interface IsoOrigin {
  ox: number
  oy: number
}

export function isoPoint(o: IsoOrigin, x: number, y: number, z: number): [number, number] {
  return [o.ox + (x - z) * ISO_COS, o.oy + (x + z) * ISO_SIN - y]
}

export function isoPt(o: IsoOrigin, x: number, y: number, z: number): string {
  return isoPoint(o, x, y, z)
    .map((n) => n.toFixed(1))
    .join(',')
}

export interface IsoBoxFaces {
  top: string
  right: string
  left: string
  /** Outline path of the whole silhouette (for emphasis strokes). */
  outline: string
}

/** Faces of a box whose min corner sits at (x0, y0, z0), sized w×h×d. */
export function isoBox(
  o: IsoOrigin,
  x0: number,
  y0: number,
  z0: number,
  w: number,
  h: number,
  d: number,
): IsoBoxFaces {
  const p = (x: number, y: number, z: number) => isoPt(o, x0 + x, y0 + y, z0 + z)
  return {
    top: `${p(0, h, 0)} ${p(w, h, 0)} ${p(w, h, d)} ${p(0, h, d)}`,
    right: `${p(0, 0, 0)} ${p(w, 0, 0)} ${p(w, h, 0)} ${p(0, h, 0)}`,
    left: `${p(0, 0, 0)} ${p(0, h, 0)} ${p(0, h, d)} ${p(0, 0, d)}`,
    outline: `M${p(0, 0, 0)} L${p(w, 0, 0)} L${p(w, h, 0)} L${p(w, h, d)} L${p(0, h, d)} L${p(0, 0, d)} Z`,
  }
}

/** Canvas size that fits a w×h×d volume drawn from origin, plus padding. */
export function isoCanvas(w: number, h: number, d: number, pad = 46) {
  return {
    origin: { ox: d * ISO_COS + pad, oy: h + pad * 0.75 } as IsoOrigin,
    width: (w + d) * ISO_COS + pad * 2,
    height: h + (w + d) * ISO_SIN + pad * 1.6,
  }
}
