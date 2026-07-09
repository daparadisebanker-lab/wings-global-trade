import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { Resvg } from '@resvg/resvg-js'

// Public assets moved to apps/site/public in the monorepo migration (M1).
const publicBrand = 'apps/site/public/brand'

const svg = readFileSync(`${publicBrand}/wings-isotipo-bg.svg`, 'utf-8')

const sizes = [
  { name: 'icon-192.png', size: 192 },
  { name: 'icon-512.png', size: 512 },
  { name: 'apple-touch-icon.png', size: 180 },
]

mkdirSync(publicBrand, { recursive: true })

for (const { name, size } of sizes) {
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: size },
  })
  const png = resvg.render().asPng()
  writeFileSync(`${publicBrand}/${name}`, png)
  console.log(`Generated ${publicBrand}/${name} (${size}x${size})`)
}
