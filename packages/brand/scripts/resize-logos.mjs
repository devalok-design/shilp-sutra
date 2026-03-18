/**
 * resize-logos.mjs
 *
 * Reads the oversized master PNGs from src/assets/devalok/logos/, resizes each
 * to 512/1024 (longest edge, aspect ratio preserved), and generates both
 * PNG and WebP at each size. Output goes to src/assets/devalok/logos-resized/.
 *
 * For WebP, tries both lossy (quality 90) and lossless, keeps whichever is
 * smaller — same strategy as convert-to-webp.mjs.
 *
 * NOTE: This is a one-shot script. The original 10K+ master PNGs have been
 * deleted after resizing. Running again will re-process the already-resized
 * files (harmless but produces double-compressed artifacts at smaller sizes).
 * To regenerate from true masters, restore them from git history first.
 *
 * Usage:  node packages/brand/scripts/resize-logos.mjs
 * Requires: sharp (installed as workspace devDependency)
 */
import sharp from 'sharp'
import { existsSync, mkdirSync, statSync, unlinkSync } from 'fs'
import { join, dirname, basename } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const LOGOS_SRC = join(__dirname, '..', 'src', 'assets', 'devalok', 'logos')
const LOGOS_OUT = join(__dirname, '..', 'src', 'assets', 'devalok', 'logos-resized')

const LOGO_TYPES = [
  'monogram',
  'monogram-wordmark',
  'monogram-shell',
  'monogram-shell-wordmark',
  'monogram-coin-wordmark',
  'shloka',
]

const COLORS = ['brand', 'black', 'white']

const SIZES = [512, 1024]

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

/**
 * Generate a WebP from a sharp pipeline, trying both lossy and lossless,
 * keeping whichever is smaller.
 */
async function writeSmallestWebp(inputPath, outputPath, resizeOpts) {
  const lossyPath = outputPath + '.lossy.tmp'
  const losslessPath = outputPath + '.lossless.tmp'

  await sharp(inputPath)
    .resize(resizeOpts)
    .webp({ quality: 90 })
    .toFile(lossyPath)

  await sharp(inputPath)
    .resize(resizeOpts)
    .webp({ lossless: true })
    .toFile(losslessPath)

  const lossySize = statSync(lossyPath).size
  const losslessSize = statSync(losslessPath).size

  const { renameSync } = await import('fs')

  if (losslessSize < lossySize) {
    unlinkSync(lossyPath)
    renameSync(losslessPath, outputPath)
    return { size: losslessSize, mode: 'lossless' }
  } else {
    unlinkSync(losslessPath)
    renameSync(lossyPath, outputPath)
    return { size: lossySize, mode: 'lossy' }
  }
}

async function run() {
  // Ensure output directory exists
  if (!existsSync(LOGOS_OUT)) {
    mkdirSync(LOGOS_OUT, { recursive: true })
  }

  let totalOriginalSize = 0
  let totalNewPngSize = 0
  let totalNewWebpSize = 0
  let filesGenerated = 0
  let errors = 0

  const results = []

  for (const logoType of LOGO_TYPES) {
    for (const color of COLORS) {
      const srcName = `${logoType}-${color}.png`
      const srcPath = join(LOGOS_SRC, srcName)

      if (!existsSync(srcPath)) {
        console.log(`  SKIP  ${srcName}  (not found)`)
        continue
      }

      const originalSize = statSync(srcPath).size
      const metadata = await sharp(srcPath).metadata()
      const { width, height } = metadata
      totalOriginalSize += originalSize

      const logoResults = {
        name: srcName,
        originalSize,
        originalDims: `${width}x${height}`,
        outputs: [],
      }

      for (const targetSize of SIZES) {
        // Resize by longest edge, preserving aspect ratio
        const resizeOpts =
          width >= height
            ? { width: targetSize, withoutEnlargement: true }
            : { height: targetSize, withoutEnlargement: true }

        // Compute actual output dimensions for display
        const scale = targetSize / Math.max(width, height)
        const outW = Math.round(width * Math.min(scale, 1))
        const outH = Math.round(height * Math.min(scale, 1))

        const baseName = `${logoType}-${color}-${targetSize}`

        // PNG output
        const pngOutPath = join(LOGOS_OUT, `${baseName}.png`)
        try {
          await sharp(srcPath).resize(resizeOpts).png().toFile(pngOutPath)
          const pngSize = statSync(pngOutPath).size
          totalNewPngSize += pngSize
          filesGenerated++

          logoResults.outputs.push({
            file: `${baseName}.png`,
            dims: `${outW}x${outH}`,
            size: pngSize,
            format: 'png',
          })
        } catch (err) {
          console.error(`  FAIL  ${baseName}.png: ${err.message}`)
          errors++
        }

        // WebP output
        const webpOutPath = join(LOGOS_OUT, `${baseName}.webp`)
        try {
          const { size: webpSize, mode } = await writeSmallestWebp(
            srcPath,
            webpOutPath,
            resizeOpts
          )
          totalNewWebpSize += webpSize
          filesGenerated++

          logoResults.outputs.push({
            file: `${baseName}.webp`,
            dims: `${outW}x${outH}`,
            size: webpSize,
            format: 'webp',
            mode,
          })
        } catch (err) {
          console.error(`  FAIL  ${baseName}.webp: ${err.message}`)
          errors++
        }
      }

      results.push(logoResults)
    }
  }

  // Print detailed results
  console.log('=== Resize Results ===\n')

  for (const r of results) {
    console.log(
      `${r.name}  (${r.originalDims}, ${formatSize(r.originalSize)})`
    )
    for (const o of r.outputs) {
      const savings = ((1 - o.size / r.originalSize) * 100).toFixed(1)
      const modeStr = o.mode ? ` ${o.mode}` : ''
      console.log(
        `    ${o.file.padEnd(50)} ${o.dims.padEnd(12)} ${formatSize(o.size).padStart(10)}  (${savings}% smaller${modeStr})`
      )
    }
    console.log()
  }

  // Summary
  const totalNewSize = totalNewPngSize + totalNewWebpSize
  console.log('=== Summary ===')
  console.log(`  Source files:     ${results.length}`)
  console.log(`  Files generated:  ${filesGenerated}`)
  if (errors > 0) {
    console.log(`  Errors:           ${errors}`)
  }
  console.log(`  Original total:   ${formatSize(totalOriginalSize)}`)
  console.log(`  New PNG total:    ${formatSize(totalNewPngSize)}`)
  console.log(`  New WebP total:   ${formatSize(totalNewWebpSize)}`)
  console.log(`  New combined:     ${formatSize(totalNewSize)}`)
  console.log(
    `  Overall savings:  ${((1 - totalNewSize / totalOriginalSize) * 100).toFixed(1)}%`
  )
  console.log(`\n  Output: ${LOGOS_OUT}`)
}

run().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
