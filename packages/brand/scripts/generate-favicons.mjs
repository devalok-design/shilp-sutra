/**
 * generate-favicons.mjs
 *
 * Generates the modern minimal favicon set (Evil Martians "5 files" approach)
 * for each brand (devalok, karm). Brand color only — no black/white variants.
 *
 * Per brand, produces:
 *   favicon.ico      — 32x32 ICO (PNG wrapped in ICO container)
 *   favicon.svg      — scalable SVG (copied from source)
 *   apple-touch-icon.png — 180x180 PNG
 *   icon-192.png     — 192x192 PNG
 *   icon-512.png     — 512x512 PNG
 *
 * Sources:
 *   - Devalok: SVG favicon (rasterized via sharp)
 *   - Karm: 500x500 PNG favicon (upscaled to 512, downscaled for smaller)
 *
 * NOTE: This is a one-shot script. The Karm source (icon-512.png) is the
 * output of a previous run — the original favicon-brand-512.png was deleted.
 * Re-running regenerates from the current favicon files (idempotent for
 * Devalok since SVG source is preserved, but Karm re-processes its own output).
 *
 * Usage:  node packages/brand/scripts/generate-favicons.mjs
 * Requires: sharp (workspace devDependency)
 */
import sharp from 'sharp'
import { existsSync, mkdirSync, readFileSync, writeFileSync, cpSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ASSETS = join(__dirname, '..', 'src', 'assets')

const BRANDS = [
  {
    name: 'devalok',
    // SVG source — rasterize at each size
    svgSource: join(ASSETS, 'devalok', 'favicons', 'favicon.svg'),
    pngSource: null,
  },
  {
    name: 'karm',
    // No SVG available — use the 500x500 PNG as raster source
    svgSource: null,
    pngSource: join(ASSETS, 'karm', 'favicons', 'icon-512.png'),
  },
]

const PNG_SIZES = [
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'icon-192.png', size: 192 },
  { name: 'icon-512.png', size: 512 },
]

/**
 * Build a minimal ICO file wrapping a single 32x32 PNG.
 *
 * ICO format (single image):
 *   6-byte header:  uint16LE(0=reserved) + uint16LE(1=ICO type) + uint16LE(1=count)
 *   16-byte entry:  uint8(32=w) + uint8(32=h) + uint8(0=palette) + uint8(0=reserved)
 *                   + uint16LE(1=planes) + uint16LE(32=bpp) + uint32LE(pngSize) + uint32LE(22=offset)
 *   PNG data
 */
function buildIco(pngBuffer) {
  const header = Buffer.alloc(6)
  header.writeUInt16LE(0, 0) // reserved
  header.writeUInt16LE(1, 2) // ICO type
  header.writeUInt16LE(1, 4) // 1 image

  const entry = Buffer.alloc(16)
  entry.writeUInt8(32, 0) // width
  entry.writeUInt8(32, 1) // height
  entry.writeUInt8(0, 2) // palette count
  entry.writeUInt8(0, 3) // reserved
  entry.writeUInt16LE(1, 4) // color planes
  entry.writeUInt16LE(32, 6) // bits per pixel
  entry.writeUInt32LE(pngBuffer.length, 8) // PNG data size
  entry.writeUInt32LE(22, 12) // offset to PNG data (6 + 16 = 22)

  return Buffer.concat([header, entry, pngBuffer])
}

/**
 * Rasterize an SVG to a PNG at the given size (square).
 */
async function rasterizeSvg(svgPath, size) {
  return sharp(svgPath, { density: Math.round((72 * size) / 32) })
    .resize(size, size)
    .png()
    .toBuffer()
}

/**
 * Resize a PNG source to the given size (square).
 */
async function resizePng(pngPath, size) {
  return sharp(pngPath).resize(size, size).png().toBuffer()
}

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

async function generateForBrand(brand) {
  const outDir = join(ASSETS, brand.name, 'favicons-new')
  mkdirSync(outDir, { recursive: true })

  const results = []

  const rasterize = brand.svgSource
    ? (size) => rasterizeSvg(brand.svgSource, size)
    : (size) => resizePng(brand.pngSource, size)

  // 1. favicon.ico — 32x32 PNG wrapped in ICO
  const png32 = await rasterize(32)
  const ico = buildIco(png32)
  const icoPath = join(outDir, 'favicon.ico')
  writeFileSync(icoPath, ico)
  results.push({ file: 'favicon.ico', size: ico.length, dims: '32x32' })

  // 2. favicon.svg — copy from source (devalok only; karm has no SVG)
  if (brand.svgSource) {
    const svgPath = join(outDir, 'favicon.svg')
    cpSync(brand.svgSource, svgPath)
    const svgSize = readFileSync(svgPath).length
    results.push({ file: 'favicon.svg', size: svgSize, dims: 'scalable' })
  } else {
    console.log(`  SKIP  favicon.svg for ${brand.name} (no SVG source)`)
  }

  // 3. PNG sizes: apple-touch-icon, icon-192, icon-512
  for (const { name, size } of PNG_SIZES) {
    const pngBuf = await rasterize(size)
    const outPath = join(outDir, name)
    writeFileSync(outPath, pngBuf)
    results.push({ file: name, size: pngBuf.length, dims: `${size}x${size}` })
  }

  return results
}

async function run() {
  console.log('=== Generating favicons ===\n')

  for (const brand of BRANDS) {
    const source = brand.svgSource || brand.pngSource
    if (!existsSync(source)) {
      console.error(`  ERROR  Source not found for ${brand.name}: ${source}`)
      process.exit(1)
    }

    console.log(`${brand.name}:`)
    console.log(`  source: ${source}`)

    const results = await generateForBrand(brand)

    for (const r of results) {
      console.log(
        `    ${r.file.padEnd(24)} ${r.dims.padEnd(10)} ${formatSize(r.size).padStart(10)}`
      )
    }

    const outDir = join(ASSETS, brand.name, 'favicons-new')
    console.log(`  output: ${outDir}\n`)
  }

  console.log('Done. Review favicons-new/ directories, then move into place.')
}

run().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
