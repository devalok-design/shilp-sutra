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

  // shared chunks — pure functions split out by Rollup, no React
  '_chunks/utils',
  '_chunks/motion',

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

console.log(
  `inject-use-client: ${injected} files updated, ${skipped} skipped`
)
