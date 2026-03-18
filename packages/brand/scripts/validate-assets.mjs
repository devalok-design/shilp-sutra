/**
 * validate-assets.mjs
 *
 * Pre-publish gate that verifies all PNG assets have correct dimensions
 * matching their filename convention. Prevents mislabeled favicons and
 * incorrectly sized logos from shipping.
 *
 * Validation rules:
 *   1. Logo PNGs ({type}-{color}-{size}.png): longest edge must equal {size}
 *   2. Favicon PNGs: apple-touch-icon.png=180x180, icon-192.png=192x192, icon-512.png=512x512
 *   3. PNGs that match neither rule are skipped
 *
 * Usage:  node packages/brand/scripts/validate-assets.mjs
 * Requires: sharp (workspace devDependency)
 */
import sharp from 'sharp'
import { readdirSync, statSync } from 'fs'
import { join, dirname, basename } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ASSETS = join(__dirname, '..', 'src', 'assets')

/** Known favicon filenames → expected exact dimensions */
const FAVICON_RULES = {
  'apple-touch-icon.png': { width: 180, height: 180 },
  'icon-192.png': { width: 192, height: 192 },
  'icon-512.png': { width: 512, height: 512 },
}

/** Extract the trailing size number from a logo filename like "monogram-brand-512.png" */
function extractSizeFromFilename(filename) {
  const match = filename.match(/-(\d+)\.png$/)
  return match ? parseInt(match[1], 10) : null
}

/** Recursively collect all .png files under a directory */
function collectPngs(dir) {
  const results = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) {
      results.push(...collectPngs(full))
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.png')) {
      results.push(full)
    }
  }
  return results
}

async function run() {
  console.log('=== Validating PNG asset dimensions ===\n')

  const pngs = collectPngs(ASSETS).sort()
  let validated = 0
  let skipped = 0
  let errors = 0

  for (const filepath of pngs) {
    const name = basename(filepath)
    const relPath = filepath.replace(ASSETS + '/', '').replace(ASSETS + '\\', '')
    const { width, height } = await sharp(filepath).metadata()

    // Rule 2: known favicon names
    if (FAVICON_RULES[name]) {
      const expected = FAVICON_RULES[name]
      validated++
      if (width === expected.width && height === expected.height) {
        console.log(`  OK    ${relPath}  ${width}x${height}`)
      } else {
        console.log(
          `  FAIL  ${relPath}  ${width}x${height}  (expected ${expected.width}x${expected.height})`
        )
        errors++
      }
      continue
    }

    // Rule 1: logo PNGs with size in filename
    const expectedSize = extractSizeFromFilename(name)
    if (expectedSize) {
      validated++
      const longestEdge = Math.max(width, height)
      if (longestEdge === expectedSize) {
        console.log(`  OK    ${relPath}  ${width}x${height}`)
      } else {
        console.log(
          `  FAIL  ${relPath}  ${width}x${height}  (longest edge ${longestEdge}, expected ${expectedSize})`
        )
        errors++
      }
      continue
    }

    // Rule 3: skip
    skipped++
    console.log(`  SKIP  ${relPath}  ${width}x${height}  (no size convention)`)
  }

  // Summary
  console.log(`\n=== Summary ===`)
  console.log(`  Files scanned:    ${pngs.length}`)
  console.log(`  Validated:        ${validated}`)
  console.log(`  Skipped:          ${skipped}`)
  console.log(`  Errors:           ${errors}`)

  if (errors > 0) {
    console.log(`\nValidation FAILED — ${errors} asset(s) have incorrect dimensions.`)
    process.exit(1)
  }

  console.log(`\nAll assets OK.`)
}

run().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
