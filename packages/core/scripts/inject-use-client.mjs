/**
 * inject-use-client.mjs
 *
 * Post-build script that prepends `"use client";\n` to every .js and .d.ts
 * file in dist/, EXCEPT for files that are server-safe (pure markup / no hooks)
 * and files that already contain the directive.
 *
 * Run from packages/core/:
 *   node scripts/inject-use-client.mjs
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs'
import { join, posix } from 'path'

// ── Server-safe allow-list (relative to dist/, forward slashes) ─────────────
const SERVER_SAFE = new Set([
  // ui – pure-markup components
  'ui/text',
  'ui/skeleton',
  // ui/spinner — removed from server-safe list (v2 uses framer-motion hooks)
  'ui/stack',
  'ui/container',
  'ui/table',
  'ui/visually-hidden',
  'ui/code',

  // composed – no client hooks
  'composed/content-card',
  'composed/page-header',
  'composed/loading-skeleton',
  'composed/page-skeletons',
  'composed/priority-indicator',

  // tailwind config (Node-only, no React)
  'tailwind/index',
  'tailwind/preset',

  // utility modules
  'ui/lib/utils',
  'ui/lib/motion',

  // vendor-utils chunk — pure functions (clsx, cva, tailwind-merge), no React
  '_chunks/vendor-utils',

  // utility modules — pure functions, no React
  'ui/lib/date-utils',
  'composed/lib/string-utils',
])

// ── Directories to skip entirely ────────────────────────────────────────────
const SKIP_DIRS = new Set(['primitives', 'tokens'])

// ── Helpers ─────────────────────────────────────────────────────────────────

/** Recursively collect all files under `dir`. */
function walk(dir) {
  const results = []
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) {
      results.push(...walk(full))
    } else {
      results.push(full)
    }
  }
  return results
}

/**
 * Convert an absolute file path to a dist-relative POSIX key without extension.
 *   C:\…\dist\ui\button.js  →  ui/button
 *   C:\…\dist\ui\button.d.ts  →  ui/button
 */
function toKey(filePath, distRoot) {
  let rel = filePath.slice(distRoot.length + 1) // strip dist/ prefix + separator
  rel = rel.split('\\').join('/')                // normalise to forward slashes
  rel = rel.replace(/\.d\.ts$/, '')              // strip .d.ts first (before .js)
  rel = rel.replace(/\.js$/, '')                 // strip .js
  return rel
}

// ── Main ────────────────────────────────────────────────────────────────────

const distRoot = join(process.cwd(), 'dist')
const allFiles = walk(distRoot)

// Validate that SERVER_SAFE chunk entries actually exist in dist.
// If a chunk was renamed or removed by a Rollup/Vite upgrade, the entry
// becomes a no-op and server-safe code silently gets "use client".
for (const key of SERVER_SAFE) {
  if (!key.startsWith('_chunks/')) continue
  const jsPath = join(distRoot, `${key}.js`)
  const exists = allFiles.some(f => f.replace(/\\/g, '/').endsWith(`${key}.js`))
  if (!exists) {
    console.warn(`inject-use-client: WARNING — SERVER_SAFE entry '${key}' not found in dist/. Chunk may have been renamed.`)
  }
}

let injected = 0
let skipped = 0

for (const filePath of allFiles) {
  // Only process .js and .d.ts files
  const isJS = filePath.endsWith('.js')
  const isDTS = filePath.endsWith('.d.ts')
  if (!isJS && !isDTS) {
    continue
  }

  // Build the dist-relative posix path to check against skip lists
  const relPosix = filePath.slice(distRoot.length + 1).split('\\').join('/')

  // Skip entire directories
  const topDir = relPosix.split('/')[0]
  if (SKIP_DIRS.has(topDir)) {
    skipped++
    continue
  }

  // Skip server-safe files
  const key = toKey(filePath, distRoot)
  if (SERVER_SAFE.has(key)) {
    skipped++
    continue
  }

  // Read file and check if directive already present
  const content = readFileSync(filePath, 'utf8')
  if (content.startsWith('"use client"') || content.startsWith("'use client'")) {
    skipped++
    continue
  }

  // Prepend the directive
  writeFileSync(filePath, `"use client";\n${content}`)
  injected++
}

// ── SSR safety: patch unguarded `document` references in vendor chunks ──────
//
// Some bundled deps (react-remove-scroll, react-style-singleton) use
// `if (!document)` which throws ReferenceError in Node.js SSR because
// `document` doesn't exist at all (it's not falsy — it's undeclared).
// Next.js server-renders "use client" components, so this crashes every page.
//
// Fix: replace `if (!document)` with `if (typeof document === "undefined")`
// See: https://github.com/devalok-design/shilp-sutra/issues/21

let ssrPatched = 0
const vendorClientPath = join(distRoot, '_chunks', 'vendor-client.js')
try {
  let vendorContent = readFileSync(vendorClientPath, 'utf8')
  const original = vendorContent

  // Pattern 1: if (!document) — bare document reference guard
  vendorContent = vendorContent.replace(
    /if\s*\(\s*!document\s*\)/g,
    'if (typeof document === "undefined")',
  )

  // Pattern 2: bare `document.` access outside of functions that already have guards
  // Only patch top-level references in known problematic patterns:
  // - `var e = document.head || document.getElementsByTagName("head")[0]`
  //   These are inside functions that should be guarded by the fixed Pattern 1.
  //   No additional patching needed — the guard at function entry handles them.

  if (vendorContent !== original) {
    writeFileSync(vendorClientPath, vendorContent)
    ssrPatched++
    console.log(`inject-use-client: patched ${ssrPatched} SSR-unsafe document references in vendor-client.js`)
  }
} catch {
  // vendor-client.js may not exist in all build configurations
}

// ── SSR safety: patch Sonner's unguarded `document.hidden` in useState ──────
//
// Sonner's useIsDocumentHidden hook uses `useState(document.hidden)` which
// crashes during Next.js SSR because even "use client" components are
// server-rendered. The useState initializer runs during SSR.
//
// Fix: guard with typeof check, default to false on server.
// See: https://github.com/devalok-design/shilp-sutra/issues/21

const sonnerPath = join(distRoot, '_chunks', 'sonner.js')
try {
  let sonnerContent = readFileSync(sonnerPath, 'utf8')
  const sonnerOriginal = sonnerContent

  // Pattern: useState(document.hidden) → useState(typeof document !== "undefined" ? document.hidden : false)
  sonnerContent = sonnerContent.replace(
    /useState\(document\.hidden\)/g,
    'useState(typeof document !== "undefined" ? document.hidden : false)',
  )

  if (sonnerContent !== sonnerOriginal) {
    writeFileSync(sonnerPath, sonnerContent)
    const patchCount = (sonnerOriginal.match(/useState\(document\.hidden\)/g) || []).length
    console.log(`inject-use-client: patched ${patchCount} SSR-unsafe document.hidden references in sonner.js`)
  }
} catch {
  // sonner.js may not exist in all build configurations
}

console.log(
  `inject-use-client: ${injected} files updated, ${skipped} skipped`
)
