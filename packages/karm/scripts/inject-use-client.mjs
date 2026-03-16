/**
 * Post-build: inject "use client" directive into all JS and .d.ts files in dist/,
 * EXCEPT for server-safe chunks (pure utilities with no DOM/React dependencies).
 *
 * Run from packages/karm/:
 *   node scripts/inject-use-client.mjs
 */
import { readdir, readFile, writeFile } from 'node:fs/promises'
import { join, extname } from 'node:path'
import { fileURLToPath } from 'node:url'

const DIST = join(fileURLToPath(new URL('.', import.meta.url)), '..', 'dist')

// ── Server-safe allow-list (relative to dist/, forward slashes) ─────────────
// These files must NOT get "use client" — they contain only pure functions
// (clsx, cva, tailwind-merge, date-fns) and are safe for server-side evaluation.
const SERVER_SAFE = new Set([
  '_chunks/vendor-utils',
])

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...await walk(full))
    } else if (
      ['.js', '.mjs'].includes(extname(entry.name)) ||
      entry.name.endsWith('.d.ts')
    ) {
      files.push(full)
    }
  }
  return files
}

/**
 * Convert an absolute file path to a dist-relative POSIX key without extension.
 *   C:\…\dist\_chunks\vendor-utils.js  →  _chunks/vendor-utils
 */
function toKey(filePath) {
  let rel = filePath.slice(DIST.length + 1)  // strip dist/ prefix + separator
  rel = rel.split('\\').join('/')              // normalise to forward slashes
  rel = rel.replace(/\.d\.ts$/, '')            // strip .d.ts first (before .js)
  rel = rel.replace(/\.js$/, '')               // strip .js
  return rel
}

async function inject() {
  const files = await walk(DIST)
  let injected = 0
  let skipped = 0
  for (const file of files) {
    // Skip server-safe files
    const key = toKey(file)
    if (SERVER_SAFE.has(key)) {
      skipped++
      continue
    }

    const content = await readFile(file, 'utf8')
    if (content.startsWith('"use client"') || content.startsWith("'use client'")) {
      skipped++
      continue
    }
    await writeFile(file, `"use client";\n${content}`)
    injected++
  }
  console.log(
    `[inject-use-client] ${injected} files updated, ${skipped} skipped`
  )
}

inject().catch(console.error)
