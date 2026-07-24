// src/lib/promo/raster.ts
// Client-side rasterizer for a promo-card SVG string → PNG/JPG download.
// Lifted from ContainerPromoPanel.downloadRaster so the RB promo and the ERP
// container share card share one path. Browser-only (canvas + DOM). The card is
// 1080×1080; the canvas is pre-filled with the un-themed card ground (#F8F6F0)
// so a JPEG (which has no alpha) never renders on black.
export function rasterizePromoCard(svg: string, filenameBase: string, kind: 'png' | 'jpeg'): void {
  const svgUrl = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }))
  const img = new Image()
  img.onload = () => {
    try {
      const canvas = document.createElement('canvas')
      canvas.width = 1080
      canvas.height = 1080
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      ctx.fillStyle = '#F8F6F0'
      ctx.fillRect(0, 0, 1080, 1080)
      ctx.drawImage(img, 0, 0, 1080, 1080)
      canvas.toBlob(
        (out) => {
          if (!out) return
          const outUrl = URL.createObjectURL(out)
          const a = document.createElement('a')
          a.href = outUrl
          a.download = `${filenameBase}.${kind === 'jpeg' ? 'jpg' : 'png'}`
          a.click()
          URL.revokeObjectURL(outUrl)
        },
        kind === 'jpeg' ? 'image/jpeg' : 'image/png',
        0.92,
      )
    } finally {
      URL.revokeObjectURL(svgUrl)
    }
  }
  img.src = svgUrl
}
