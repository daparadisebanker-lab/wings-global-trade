// Client-side raster: render an off-white card SVG string into a canvas → PNG/JPG
// download. No server round-trip; data:image URIs embedded in the card don't taint
// the canvas, so a Prueba upload rasterizes cleanly. The ground is the fixed Wings
// off-white (CARD.bg) — a brand artifact that must never follow TOWER's theme.
import { CARD } from '@wings/rb-core'

/** Rasterize a 1080×1080 promo-card SVG and trigger a download. `onError` fires
 *  on any failure (image load, no 2D context, blank encode) so the caller can
 *  surface it instead of a dead button; the source object URL is always revoked. */
export function downloadCardRaster(svg: string, baseName: string, kind: 'png' | 'jpeg', onError?: () => void): void {
  const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const img = new Image()
  img.onerror = () => {
    URL.revokeObjectURL(url)
    onError?.()
  }
  img.onload = () => {
    URL.revokeObjectURL(url)
    const canvas = document.createElement('canvas')
    canvas.width = 1080
    canvas.height = 1080
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      onError?.()
      return
    }
    ctx.fillStyle = CARD.bg
    ctx.fillRect(0, 0, 1080, 1080)
    try {
      ctx.drawImage(img, 0, 0, 1080, 1080)
      canvas.toBlob(
        (out) => {
          if (!out) {
            onError?.()
            return
          }
          const a = document.createElement('a')
          a.href = URL.createObjectURL(out)
          a.download = `${baseName}.${kind === 'jpeg' ? 'jpg' : 'png'}`
          a.click()
          URL.revokeObjectURL(a.href)
        },
        kind === 'jpeg' ? 'image/jpeg' : 'image/png',
        0.92,
      )
    } catch {
      // A tainted canvas (should not happen — data: images don't taint) throws.
      onError?.()
    }
  }
  img.src = url
}
