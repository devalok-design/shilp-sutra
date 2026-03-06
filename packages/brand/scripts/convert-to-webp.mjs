/**
 * convert-to-webp.mjs
 *
 * Converts PNG logo assets to WebP format for significant size savings.
 * Favicons at 16px and 32px are skipped (browsers require PNG favicons).
 *
 * For each PNG, tries both lossy (quality 90) and lossless WebP, then keeps
 * whichever is smaller. If neither WebP variant beats the original PNG, the
 * WebP file is removed and the PNG is kept as-is.
 *
 * Usage:  node packages/brand/scripts/convert-to-webp.mjs
 * Requires: sharp (installed as workspace devDependency)
 */
import sharp from 'sharp'
import { readdirSync, statSync, unlinkSync } from 'fs'
import { join, dirname, basename, extname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const srcAssets = join(__dirname, '..', 'src', 'assets')

// Favicon sizes that must remain PNG-only (browser compatibility)
const SKIP_PATTERNS = ['-16.png', '-32.png']

function shouldSkip(filePath) {
  const name = basename(filePath)
  return SKIP_PATTERNS.some((pattern) => name.endsWith(pattern))
}

function collectPngs(dir) {
  const results = []
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) {
      results.push(...collectPngs(full))
    } else if (extname(entry).toLowerCase() === '.png') {
      results.push(full)
    }
  }
  return results
}

async function convertOne(pngPath) {
  const webpPath = pngPath.replace(/\.png$/i, '.webp')
  const webpLosslessPath = pngPath.replace(/\.png$/i, '.webp.lossless.tmp')

  // Try lossy
  await sharp(pngPath).webp({ quality: 90 }).toFile(webpPath)
  const lossySize = statSync(webpPath).size

  // Try lossless
  await sharp(pngPath).webp({ lossless: true }).toFile(webpLosslessPath)
  const losslessSize = statSync(webpLosslessPath).size

  // Pick the smaller one
  if (losslessSize < lossySize) {
    // Replace lossy with lossless
    unlinkSync(webpPath)
    const { renameSync } = await import('fs')
    renameSync(webpLosslessPath, webpPath)
    return { size: losslessSize, mode: 'lossless' }
  } else {
    // Lossy was smaller (or equal), remove lossless temp
    unlinkSync(webpLosslessPath)
    return { size: lossySize, mode: 'lossy' }
  }
}

async function convert() {
  const pngs = collectPngs(srcAssets)
  let totalOriginal = 0
  let totalWebp = 0
  let converted = 0
  let skipped = 0
  let skippedLarger = 0

  console.log(`Found ${pngs.length} PNG files in ${srcAssets}\n`)

  for (const pngPath of pngs) {
    const rel = pngPath.replace(srcAssets, '')
    const pngSize = statSync(pngPath).size

    if (shouldSkip(pngPath)) {
      console.log(`  SKIP  ${rel}  (small favicon, keep PNG only)`)
      skipped++
      continue
    }

    try {
      const { size: webpSize, mode } = await convertOne(pngPath)

      if (webpSize >= pngSize) {
        // WebP is not smaller — remove it, keep PNG only
        const webpPath = pngPath.replace(/\.png$/i, '.webp')
        unlinkSync(webpPath)
        console.log(
          `  SKIP  ${rel}  ${formatSize(pngSize)} -> ${formatSize(webpSize)} ${mode}  (WebP larger, keeping PNG only)`
        )
        skippedLarger++
        continue
      }

      const savings = ((1 - webpSize / pngSize) * 100).toFixed(1)
      totalOriginal += pngSize
      totalWebp += webpSize
      converted++

      console.log(
        `  OK    ${rel}  ${formatSize(pngSize)} -> ${formatSize(webpSize)} ${mode}  (${savings}% smaller)`
      )
    } catch (err) {
      console.error(`  FAIL  ${rel}: ${err.message}`)
    }
  }

  console.log('\n--- Summary ---')
  console.log(`  Converted:     ${converted} files`)
  console.log(`  Skipped:       ${skipped} files (small favicons)`)
  console.log(`  Skipped:       ${skippedLarger} files (WebP was larger)`)
  if (totalOriginal > 0) {
    console.log(
      `  PNG total:     ${formatSize(totalOriginal)}  ->  WebP total: ${formatSize(totalWebp)}`
    )
    const overallSavings = ((1 - totalWebp / totalOriginal) * 100).toFixed(1)
    console.log(`  Savings:       ${overallSavings}%`)
  }
}

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

convert().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
