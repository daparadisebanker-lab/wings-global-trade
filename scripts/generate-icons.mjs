import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { Resvg } from '@resvg/resvg-js'

const svg = readFileSync('public/brand/wings-isotipo-bg.svg', 'utf-8')

const sizes = [
  { name: 'icon-192.png', size: 192 },
  { name: 'icon-512.png', size: 512 },
  { name: 'apple-touch-icon.png', size: 180 },
]

mkdirSync('public/brand', { recursive: true })

for (const { name, size } of sizes) {
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: size },
  })
  const png = resvg.render().asPng()
  writeFileSync(`public/brand/${name}`, png)
  console.log(`Generated public/brand/${name} (${size}x${size})`)
}
