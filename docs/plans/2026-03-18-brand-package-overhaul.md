# Brand Package Overhaul — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Standardize all brand assets to correct dimensions, modern favicon set, and consistent naming — reducing package size from ~39 MB to ~3–5 MB.

**Architecture:** Resize existing master PNGs (10K+px) down to a 512/1024/2048 grid using sharp, generate WebP alongside PNG, adopt the modern 5-file favicon set per brand, update React components and favicon helpers to reference new paths.

**Tech Stack:** sharp 0.34.5 (already in workspace devDeps), Node.js scripts, React components, Vitest tests.

---

### Task 1: Create the `resize-logos.mjs` script

**Files:**
- Create: `packages/brand/scripts/resize-logos.mjs`

**Step 1: Write the resize script**

This script reads the current oversized master PNGs from `src/assets/devalok/logos/`, resizes each to 512/1024/2048 (longest edge, aspect preserved), and generates both PNG and WebP at each size. Output goes to a new temp directory so we can verify before replacing.

```js
/**
 * resize-logos.mjs
 *
 * Resizes Devalok logo master PNGs to standardized sizes (512, 1024, 2048 longest edge).
 * Generates PNG + WebP at each size. Preserves aspect ratio.
 *
 * Usage: node packages/brand/scripts/resize-logos.mjs
 * Requires: sharp (workspace devDependency)
 */
import sharp from 'sharp'
import { mkdirSync, readdirSync, statSync, rmSync, renameSync, existsSync } from 'fs'
import { join, dirname, basename, extname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const logosDir = join(__dirname, '..', 'src', 'assets', 'devalok', 'logos')
const tmpDir = join(__dirname, '..', 'src', 'assets', 'devalok', 'logos-resized')

const SIZES = [512, 1024, 2048]

// Only process the 6 raster-complex logo types (not wordmark SVGs)
const LOGO_TYPES = [
  'monogram',
  'monogram-wordmark',
  'monogram-shell',
  'monogram-shell-wordmark',
  'monogram-coin-wordmark',
  'shloka',
]
const COLORS = ['brand', 'black', 'white']

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

async function resizeLogo(srcPath, outDir, baseName, color) {
  const metadata = await sharp(srcPath).metadata()
  const { width, height } = metadata
  console.log(`  Source: ${baseName}-${color}.png (${width}x${height}, ${formatSize(statSync(srcPath).size)})`)

  for (const maxDim of SIZES) {
    // Resize so longest edge = maxDim, preserve aspect ratio
    const resizeOpts = width >= height
      ? { width: maxDim }
      : { height: maxDim }

    const pngOut = join(outDir, `${baseName}-${color}-${maxDim}.png`)
    const webpOut = join(outDir, `${baseName}-${color}-${maxDim}.webp`)

    // PNG
    await sharp(srcPath)
      .resize(resizeOpts)
      .png({ quality: 100, compressionLevel: 9 })
      .toFile(pngOut)

    // WebP — try lossy and lossless, keep smaller
    const webpLossy = join(outDir, `${baseName}-${color}-${maxDim}.webp.lossy.tmp`)
    const webpLossless = join(outDir, `${baseName}-${color}-${maxDim}.webp.lossless.tmp`)

    await sharp(srcPath).resize(resizeOpts).webp({ quality: 90 }).toFile(webpLossy)
    await sharp(srcPath).resize(resizeOpts).webp({ lossless: true }).toFile(webpLossless)

    const lossySize = statSync(webpLossy).size
    const losslessSize = statSync(webpLossless).size

    if (losslessSize < lossySize) {
      renameSync(webpLossless, webpOut)
      rmSync(webpLossy)
    } else {
      renameSync(webpLossy, webpOut)
      rmSync(webpLossless)
    }

    const pngSize = statSync(pngOut).size
    const webpSize = statSync(webpOut).size
    const dims = await sharp(pngOut).metadata()
    console.log(`    ${maxDim}: ${dims.width}x${dims.height}  PNG ${formatSize(pngSize)}  WebP ${formatSize(webpSize)}`)
  }
}

async function main() {
  // Clean and create output dir
  if (existsSync(tmpDir)) rmSync(tmpDir, { recursive: true })
  mkdirSync(tmpDir, { recursive: true })

  let totalOriginal = 0
  let totalNew = 0

  for (const type of LOGO_TYPES) {
    console.log(`\n--- ${type} ---`)
    for (const color of COLORS) {
      const srcFile = join(logosDir, `${type}-${color}.png`)
      if (!existsSync(srcFile)) {
        console.log(`  SKIP: ${type}-${color}.png not found`)
        continue
      }
      totalOriginal += statSync(srcFile).size
      await resizeLogo(srcFile, tmpDir, type, color)

      // Sum new file sizes
      for (const size of SIZES) {
        const pngOut = join(tmpDir, `${type}-${color}-${size}.png`)
        const webpOut = join(tmpDir, `${type}-${color}-${size}.webp`)
        if (existsSync(pngOut)) totalNew += statSync(pngOut).size
        if (existsSync(webpOut)) totalNew += statSync(webpOut).size
      }
    }
  }

  console.log('\n=== Summary ===')
  console.log(`  Original total: ${formatSize(totalOriginal)}`)
  console.log(`  New total (PNG + WebP): ${formatSize(totalNew)}`)
  console.log(`  Savings: ${((1 - totalNew / totalOriginal) * 100).toFixed(1)}%`)
  console.log(`\n  Output: ${tmpDir}`)
  console.log('  Review the output, then run with --apply to replace originals.')
}

main().catch(err => {
  console.error('Fatal:', err)
  process.exit(1)
})
```

**Step 2: Run the script and verify output**

Run: `node packages/brand/scripts/resize-logos.mjs`

Expected: Console output showing each logo resized to 512/1024/2048 with both PNG and WebP. Output in `src/assets/devalok/logos-resized/`. Verify:
- File dimensions match the size suffix in filename
- Aspect ratios preserved (shloka should be landscape, monogram-wordmark portrait)
- Visual quality acceptable at 2048 (spot-check a few in an image viewer)

**Step 3: Commit**

```bash
git add packages/brand/scripts/resize-logos.mjs
git commit -m "feat(brand): add resize-logos script for standardized logo sizing"
```

---

### Task 2: Replace old logo assets with resized versions

**Files:**
- Delete: All `src/assets/devalok/logos/*.png`, `*.svg`, `*.webp` (old oversized files)
- Create: Resized files from Task 1 output moved into `src/assets/devalok/logos/`

**Step 1: Remove old logo files and move in new ones**

After verifying Task 1 output looks correct:

```bash
# Remove all old logo files
rm packages/brand/src/assets/devalok/logos/*

# Move resized files in
mv packages/brand/src/assets/devalok/logos-resized/* packages/brand/src/assets/devalok/logos/
rmdir packages/brand/src/assets/devalok/logos-resized
```

**Step 2: Verify the new logo directory**

Run: `ls -la packages/brand/src/assets/devalok/logos/`

Expected: 108 files total (6 types × 3 colors × 3 sizes × 2 formats). No SVGs, no un-suffixed PNGs. Every filename follows `{type}-{color}-{size}.{png|webp}`.

**Step 3: Commit**

```bash
git add packages/brand/src/assets/devalok/logos/
git commit -m "feat(brand): replace oversized logo assets with standardized 512/1024/2048 grid"
```

---

### Task 3: Generate correct favicon assets

**Files:**
- Delete: All files in `src/assets/devalok/favicons/` and `src/assets/karm/favicons/`
- Create: 5 files per brand in those directories
- Create: `packages/brand/scripts/generate-favicons.mjs`

**Step 1: Write the favicon generation script**

This script uses sharp to render the existing favicon SVGs at the correct pixel sizes: 32x32 (for ICO), 180x180 (apple-touch), 192x192 (PWA), 512x512 (PWA splash). It also copies the SVG as-is.

```js
/**
 * generate-favicons.mjs
 *
 * Generates the modern minimal favicon set (5 files per brand) from source SVGs.
 * Uses sharp for SVG→PNG rasterization at exact target dimensions.
 *
 * Usage: node packages/brand/scripts/generate-favicons.mjs
 */
import sharp from 'sharp'
import { mkdirSync, cpSync, existsSync, rmSync, readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const assetsDir = join(__dirname, '..', 'src', 'assets')

const BRANDS = [
  {
    name: 'devalok',
    svgSource: join(assetsDir, 'devalok', 'favicons', 'favicon-brand.svg'),
    outDir: join(assetsDir, 'devalok', 'favicons-new'),
  },
  {
    name: 'karm',
    // Karm favicon SVG — if it doesn't exist, we'll need the existing ICO/PNG as source
    svgSource: join(assetsDir, 'karm', 'favicons', 'favicon-brand.svg'),
    pngFallback: join(assetsDir, 'karm', 'favicons', 'favicon-brand-512.png'),
    outDir: join(assetsDir, 'karm', 'favicons-new'),
  },
]

// Target sizes for raster favicons
const SIZES = [
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'icon-192.png', size: 192 },
  { name: 'icon-512.png', size: 512 },
]

/**
 * Creates a minimal ICO file from a 32x32 PNG buffer.
 * ICO format: 6-byte header + 16-byte directory entry + PNG data.
 */
function createIcoFromPng(pngBuffer, width, height) {
  const dir = Buffer.alloc(16)
  dir.writeUInt8(width >= 256 ? 0 : width, 0)
  dir.writeUInt8(height >= 256 ? 0 : height, 1)
  dir.writeUInt8(0, 2)    // color palette
  dir.writeUInt8(0, 3)    // reserved
  dir.writeUInt16LE(1, 4) // color planes
  dir.writeUInt16LE(32, 6) // bits per pixel
  dir.writeUInt32LE(pngBuffer.length, 8)
  dir.writeUInt32LE(22, 12) // offset to PNG data (6 header + 16 dir)

  const header = Buffer.alloc(6)
  header.writeUInt16LE(0, 0) // reserved
  header.writeUInt16LE(1, 2) // ICO type
  header.writeUInt16LE(1, 4) // 1 image

  return Buffer.concat([header, dir, pngBuffer])
}

async function generateForBrand(brand) {
  console.log(`\n--- ${brand.name} ---`)

  if (existsSync(brand.outDir)) rmSync(brand.outDir, { recursive: true })
  mkdirSync(brand.outDir, { recursive: true })

  // Determine source: SVG preferred, PNG fallback
  let source
  if (existsSync(brand.svgSource)) {
    source = brand.svgSource
    console.log(`  Source: ${brand.svgSource} (SVG)`)
  } else if (brand.pngFallback && existsSync(brand.pngFallback)) {
    source = brand.pngFallback
    console.log(`  Source: ${brand.pngFallback} (PNG fallback)`)
  } else {
    console.error(`  ERROR: No source found for ${brand.name}`)
    return
  }

  // 1. Copy SVG as-is (if exists)
  if (existsSync(brand.svgSource)) {
    cpSync(brand.svgSource, join(brand.outDir, 'favicon.svg'))
    console.log('  favicon.svg — copied')
  }

  // 2. Generate ICO from 32x32 PNG
  const png32 = await sharp(source).resize(32, 32).png().toBuffer()
  const ico = createIcoFromPng(png32, 32, 32)
  writeFileSync(join(brand.outDir, 'favicon.ico'), ico)
  console.log('  favicon.ico — 32x32')

  // 3. Generate sized PNGs
  for (const { name, size } of SIZES) {
    await sharp(source).resize(size, size).png({ compressionLevel: 9 }).toFile(join(brand.outDir, name))
    console.log(`  ${name} — ${size}x${size}`)
  }

  console.log(`  Output: ${brand.outDir}`)
}

async function main() {
  for (const brand of BRANDS) {
    await generateForBrand(brand)
  }
  console.log('\nDone. Review output dirs, then replace originals.')
}

main().catch(err => {
  console.error('Fatal:', err)
  process.exit(1)
})
```

**Step 2: Run and verify**

Run: `node packages/brand/scripts/generate-favicons.mjs`

Expected: 5 files per brand in `favicons-new/` directories. Verify:
- `favicon.ico` exists and is a valid ICO (open in browser)
- `favicon.svg` is the original SVG (unchanged)
- `apple-touch-icon.png` is exactly 180x180
- `icon-192.png` is exactly 192x192
- `icon-512.png` is exactly 512x512

**Step 3: Replace old favicons with new**

```bash
# Devalok
rm -rf packages/brand/src/assets/devalok/favicons
mv packages/brand/src/assets/devalok/favicons-new packages/brand/src/assets/devalok/favicons

# Karm
rm -rf packages/brand/src/assets/karm/favicons
mv packages/brand/src/assets/karm/favicons-new packages/brand/src/assets/karm/favicons
```

**Step 4: Commit**

```bash
git add packages/brand/scripts/generate-favicons.mjs packages/brand/src/assets/
git commit -m "feat(brand): generate correctly-sized modern minimal favicon set"
```

---

### Task 4: Update DevalokLogo component imports

**Files:**
- Modify: `packages/brand/src/devalok/devalok-logo.tsx`

The component currently imports 18 unsized PNGs (e.g., `monogram-brand.png`). Update to import the 2048 master PNGs (largest, used as `<img>` src — browser scales via CSS).

Actually, we should use the most appropriate size per display context. Since the component's max display size is `xl` = 80px (and even the audit story uses 300px), the 512px PNGs are more than sufficient and minimize bandwidth. We import 512 as default, but the structure supports larger sizes in the future.

**Step 1: Rewrite the import section and asset lookup**

Replace all 18 individual PNG imports with a path-based lookup that references the new filenames. Since Vite externalizes PNGs, the import resolves to a path string anyway.

In `devalok-logo.tsx`, replace lines 6–23 (the 18 import statements) and lines 102–125 (the staticAssets map and getStaticAssetPath function) with:

```tsx
// --- Static asset paths (new standardized naming) ---
// Import the 512px variants — sufficient for all CSS display sizes (max xl = 80px).
// Larger sizes (1024, 2048) available as raw assets for consumers who need them.
import monogramBrand from '../assets/devalok/logos/monogram-brand-512.png'
import monogramBlack from '../assets/devalok/logos/monogram-black-512.png'
import monogramWhite from '../assets/devalok/logos/monogram-white-512.png'
import monogramWordmarkBrand from '../assets/devalok/logos/monogram-wordmark-brand-512.png'
import monogramWordmarkBlack from '../assets/devalok/logos/monogram-wordmark-black-512.png'
import monogramWordmarkWhite from '../assets/devalok/logos/monogram-wordmark-white-512.png'
import monogramShellBrand from '../assets/devalok/logos/monogram-shell-brand-512.png'
import monogramShellBlack from '../assets/devalok/logos/monogram-shell-black-512.png'
import monogramShellWhite from '../assets/devalok/logos/monogram-shell-white-512.png'
import monogramShellWordmarkBrand from '../assets/devalok/logos/monogram-shell-wordmark-brand-512.png'
import monogramShellWordmarkBlack from '../assets/devalok/logos/monogram-shell-wordmark-black-512.png'
import monogramShellWordmarkWhite from '../assets/devalok/logos/monogram-shell-wordmark-white-512.png'
import monogramCoinWordmarkBrand from '../assets/devalok/logos/monogram-coin-wordmark-brand-512.png'
import monogramCoinWordmarkBlack from '../assets/devalok/logos/monogram-coin-wordmark-black-512.png'
import monogramCoinWordmarkWhite from '../assets/devalok/logos/monogram-coin-wordmark-white-512.png'
import shlokaBrand from '../assets/devalok/logos/shloka-brand-512.png'
import shlokaBlack from '../assets/devalok/logos/shloka-black-512.png'
import shlokaWhite from '../assets/devalok/logos/shloka-white-512.png'
```

The `staticAssets` map and `getStaticAssetPath` function stay exactly the same — only the import paths change.

**Step 2: Run tests**

Run: `pnpm --filter @devalok/shilp-sutra-brand test`

Expected: All existing tests pass. The test for `.png` extension (`it('uses .png extension for static asset path')`) should still pass since Vitest mocks asset imports.

**Step 3: Verify in Storybook**

Check Brand > Devalok > Logo > Asset Audit. All PNG-backed logos should render correctly from the new 512px files.

**Step 4: Commit**

```bash
git add packages/brand/src/devalok/devalok-logo.tsx
git commit -m "refactor(brand): update DevalokLogo imports to standardized 512px assets"
```

---

### Task 5: Update favicon helpers (breaking change)

**Files:**
- Modify: `packages/brand/src/devalok/devalok-favicon.ts`
- Modify: `packages/brand/src/karm/karm-favicon.ts`
- Modify: `packages/brand/src/assets/manifests/karm.webmanifest`

**Step 1: Rewrite devalok-favicon.ts**

```ts
type FaviconFormat = 'ico' | 'svg' | 'png'

export function getDevalokFaviconPath(options?: {
  format?: FaviconFormat
  /** Only used for PNG: 'apple-touch-icon' | 'icon-192' | 'icon-512' */
  name?: 'apple-touch-icon' | 'icon-192' | 'icon-512'
}): string {
  const { format = 'svg', name } = options ?? {}
  const base = '@devalok/shilp-sutra-brand/assets/devalok/favicons'
  if (format === 'ico') return `${base}/favicon.ico`
  if (format === 'svg') return `${base}/favicon.svg`
  return `${base}/${name ?? 'icon-512'}.png`
}

/** Returns a metadata object compatible with Next.js generateMetadata icons field */
export function generateDevalokFavicon() {
  const base = '@devalok/shilp-sutra-brand/assets/devalok/favicons'
  return {
    icon: [
      { url: `${base}/favicon.ico`, sizes: '32x32', type: 'image/x-icon' },
      { url: `${base}/favicon.svg`, type: 'image/svg+xml' },
    ],
    apple: [
      { url: `${base}/apple-touch-icon.png`, sizes: '180x180' },
    ],
  }
}
```

**Step 2: Rewrite karm-favicon.ts**

```ts
type FaviconFormat = 'ico' | 'svg' | 'png'

export function getKarmFaviconPath(options?: {
  format?: FaviconFormat
  name?: 'apple-touch-icon' | 'icon-192' | 'icon-512'
}): string {
  const { format = 'svg', name } = options ?? {}
  const base = '@devalok/shilp-sutra-brand/assets/karm/favicons'
  if (format === 'ico') return `${base}/favicon.ico`
  if (format === 'svg') return `${base}/favicon.svg`
  return `${base}/${name ?? 'icon-512'}.png`
}

/** Returns a metadata object compatible with Next.js generateMetadata icons field */
export function generateKarmFavicon() {
  const base = '@devalok/shilp-sutra-brand/assets/karm/favicons'
  return {
    icon: [
      { url: `${base}/favicon.ico`, sizes: '32x32', type: 'image/x-icon' },
      { url: `${base}/favicon.svg`, type: 'image/svg+xml' },
    ],
    apple: [
      { url: `${base}/apple-touch-icon.png`, sizes: '180x180' },
    ],
    manifest: '@devalok/shilp-sutra-brand/assets/manifests/karm.webmanifest',
  }
}
```

**Step 3: Update karm.webmanifest**

```json
{
  "name": "कर्म (Karm)",
  "short_name": "Karm",
  "description": "Karm - Studio Operating System by Devalok",
  "start_url": "/",
  "scope": "/",
  "display": "standalone",
  "orientation": "portrait",
  "theme_color": "#D33163",
  "background_color": "#ffffff",
  "categories": ["productivity", "business"],
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "maskable"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    }
  ]
}
```

**Step 4: Run typecheck**

Run: `pnpm --filter @devalok/shilp-sutra-brand typecheck`

Expected: Pass (the API change removes the `color` param — callers that used `color: 'brand'` will get a type error, but that's intentional for this breaking change).

**Step 5: Commit**

```bash
git add packages/brand/src/devalok/devalok-favicon.ts packages/brand/src/karm/karm-favicon.ts packages/brand/src/assets/manifests/karm.webmanifest
git commit -m "feat(brand)!: simplify favicon helpers to modern minimal brand-only set

BREAKING CHANGE: getDevalokFaviconPath and getKarmFaviconPath no longer accept color or size params.
generateDevalokFavicon and generateKarmFavicon no longer accept options."
```

---

### Task 6: Create validate-assets.mjs pre-publish gate

**Files:**
- Create: `packages/brand/scripts/validate-assets.mjs`

**Step 1: Write the validation script**

This script checks that every PNG in the assets directory has pixel dimensions matching its filename. Run as a pre-publish gate.

```js
/**
 * validate-assets.mjs
 *
 * Pre-publish gate: verifies all PNG assets have correct dimensions
 * matching their filename convention.
 *
 * Logo PNGs: {type}-{color}-{size}.png → longest edge must equal {size}
 * Favicon PNGs: apple-touch-icon.png → 180x180, icon-192.png → 192x192, icon-512.png → 512x512
 *
 * Usage: node packages/brand/scripts/validate-assets.mjs
 */
import sharp from 'sharp'
import { readdirSync, statSync } from 'fs'
import { join, dirname, basename, extname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const assetsDir = join(__dirname, '..', 'src', 'assets')

const FAVICON_SPECS = {
  'apple-touch-icon.png': { w: 180, h: 180 },
  'icon-192.png': { w: 192, h: 192 },
  'icon-512.png': { w: 512, h: 512 },
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

async function main() {
  const pngs = collectPngs(assetsDir)
  let errors = 0

  for (const pngPath of pngs) {
    const name = basename(pngPath)
    const rel = pngPath.replace(assetsDir, '')
    const { width, height } = await sharp(pngPath).metadata()

    // Check favicon PNGs
    if (FAVICON_SPECS[name]) {
      const spec = FAVICON_SPECS[name]
      if (width !== spec.w || height !== spec.h) {
        console.error(`  FAIL  ${rel}: expected ${spec.w}x${spec.h}, got ${width}x${height}`)
        errors++
      } else {
        console.log(`  OK    ${rel}: ${width}x${height}`)
      }
      continue
    }

    // Check logo PNGs: extract size from filename ({type}-{color}-{size}.png)
    const sizeMatch = name.match(/-(\d+)\.png$/)
    if (sizeMatch) {
      const expectedMax = parseInt(sizeMatch[1], 10)
      const actualMax = Math.max(width, height)
      if (actualMax !== expectedMax) {
        console.error(`  FAIL  ${rel}: expected longest edge ${expectedMax}, got ${width}x${height} (max ${actualMax})`)
        errors++
      } else {
        console.log(`  OK    ${rel}: ${width}x${height}`)
      }
      continue
    }

    // Unknown PNG — skip (e.g., favicon.ico is not PNG)
    console.log(`  SKIP  ${rel}: no size in filename`)
  }

  if (errors > 0) {
    console.error(`\n${errors} asset(s) have incorrect dimensions.`)
    process.exit(1)
  }
  console.log(`\nAll ${pngs.length} PNG assets validated.`)
}

main().catch(err => {
  console.error('Fatal:', err)
  process.exit(1)
})
```

**Step 2: Run and verify**

Run: `node packages/brand/scripts/validate-assets.mjs`

Expected: All PNGs pass validation (0 errors).

**Step 3: Commit**

```bash
git add packages/brand/scripts/validate-assets.mjs
git commit -m "feat(brand): add validate-assets pre-publish gate for dimension checks"
```

---

### Task 7: Update tests

**Files:**
- Modify: `packages/brand/src/devalok/devalok-logo.test.tsx`

**Step 1: Verify existing tests still pass**

Run: `pnpm --filter @devalok/shilp-sutra-brand test`

The Devalok logo tests mock PNG imports via Vitest's asset handling, so the import path change (adding `-512`) should be transparent. The `.png` extension test should still pass.

If any tests fail due to the import path changes, update the relevant assertions.

**Step 2: Commit (only if changes needed)**

```bash
git add packages/brand/src/devalok/devalok-logo.test.tsx
git commit -m "test(brand): update tests for new asset paths"
```

---

### Task 8: Update stories with audit view

**Files:**
- Modify: `packages/brand/src/devalok/devalok-logo.stories.tsx`
- Modify: `packages/brand/src/karm/karm-logo.stories.tsx`

The Asset Audit stories were already added earlier in this session. Verify they render correctly with the new 512px assets. If needed, adjust.

**Step 1: Verify in Storybook**

Open Storybook, check Brand > Devalok > Logo > Asset Audit and Brand > Karm > Logo > Asset Audit. All logos should render sharp and correctly.

**Step 2: Commit (if any story changes needed)**

```bash
git add packages/brand/src/devalok/devalok-logo.stories.tsx packages/brand/src/karm/karm-logo.stories.tsx
git commit -m "feat(brand): add asset audit stories for visual review"
```

---

### Task 9: Build, validate, and verify package size

**Files:**
- Modify: `packages/brand/scripts/copy-assets.mjs` (if needed for new structure)

**Step 1: Run full build**

Run: `pnpm --filter @devalok/shilp-sutra-brand build`

**Step 2: Run asset validation on dist**

Verify the dist/assets/ directory has the correct structure. Check that copy-assets.mjs correctly copies the new file structure.

**Step 3: Check package size**

Run: `du -sh packages/brand/dist/` (or `Get-ChildItem -Recurse packages/brand/dist | Measure-Object -Property Length -Sum` on Windows)

Expected: ~3-5 MB total (down from ~39 MB).

**Step 4: Run all checks**

```bash
pnpm --filter @devalok/shilp-sutra-brand typecheck
pnpm --filter @devalok/shilp-sutra-brand lint
pnpm --filter @devalok/shilp-sutra-brand test
```

**Step 5: Commit any remaining changes**

```bash
git add -A packages/brand/
git commit -m "chore(brand): build verification after asset overhaul"
```

---

### Task 10: Update documentation

**Files:**
- Modify: `packages/brand/README.md` — update favicon usage examples
- Modify: `packages/brand/llms.txt` — update API reference for favicon helpers
- Modify: `CHANGELOG.md` — add breaking changes section

**Step 1: Update README favicon examples**

Replace old `getDevalokFaviconPath({ color: 'brand', size: 32 })` examples with new API.

**Step 2: Update llms.txt**

Update the favicon helper signatures and note that logos are now pre-rendered at 512/1024/2048.

**Step 3: Update CHANGELOG**

Add entry documenting:
- BREAKING: Favicon helper API simplified (no color/size params)
- Logo assets resized to 512/1024/2048 grid (down from 10K+)
- SVGs removed for raster-complex Devalok logo types
- Package size reduced from ~39 MB to ~3-5 MB
- Modern minimal favicon set adopted (5 files per brand)

**Step 4: Commit**

```bash
git add packages/brand/README.md packages/brand/llms.txt CHANGELOG.md
git commit -m "docs(brand): update docs for asset overhaul and favicon API changes"
```
