#!/usr/bin/env node

/**
 * SSR Smoke Test
 *
 * Imports every JS entry point from dist/ in Node.js to verify no
 * module-scope browser API usage (document, window, DOMMatrix, etc.)
 * crashes server-side rendering.
 *
 * This is a HARD GATE in pre-publish-audit.mjs — if any entry point
 * crashes on import, the package cannot be published.
 *
 * Limitation: This test catches module-scope browser API crashes (e.g.
 * `new DOMMatrix()` at top level). It does NOT catch render-body access
 * like `window.innerWidth` used directly in JSX — those only crash during
 * actual React SSR rendering, not during import.
 *
 * Security: All paths come from the package's own package.json.
 * No user input, no shell commands.
 *
 * Usage: node scripts/ssr-smoke-test.mjs
 */

import { readFileSync } from 'fs'
import { join, resolve, dirname } from 'path'
import { pathToFileURL, fileURLToPath } from 'url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf-8'))

// Build set of known external packages from peerDependencies.
// Only ERR_MODULE_NOT_FOUND for these is treated as a pass.
// Any other missing module is a real failure (broken import chain).
const KNOWN_EXTERNALS = new Set(Object.keys(pkg.peerDependencies || {}))

const PASS = '\x1b[32m\u2713\x1b[0m'
const FAIL = '\x1b[31m\u2717\x1b[0m'

let failures = 0
let passed = 0

// Collect all JS export entry points from package.json exports
const entries = []
for (const [key, value] of Object.entries(pkg.exports || {})) {
  // Skip non-JS exports (CSS tokens, fonts, etc.)
  if (key.includes('/tokens') || key.includes('/fonts')) continue

  // Tailwind entries have external deps (tailwindcss) that may not resolve in
  // pnpm workspace dev, but MUST still be tested for browser API crashes.
  // ERR_MODULE_NOT_FOUND for the external dep is expected; any other error
  // (DOMMatrix, document, etc.) is a real SSR failure.

  let target
  if (typeof value === 'string') {
    if (!value.endsWith('.js')) continue
    target = value
  } else if (typeof value === 'object') {
    target = value.import || value.default
    if (!target || !target.endsWith('.js')) continue
  }

  if (target) {
    entries.push({ key, file: target })
  }
}

console.log(`\nSSR smoke test: importing ${entries.length} entry points in Node.js...\n`)

for (const { key, file } of entries) {
  const absPath = resolve(ROOT, file)
  const fileUrl = pathToFileURL(absPath).href

  try {
    await import(fileUrl)
    console.log(`  ${PASS} ${key}`)
    passed++
  } catch (err) {
    // External deps (e.g. tailwindcss) may not resolve in dev workspace —
    // but ONLY treat as pass if the missing module is a declared peer dep.
    // Any other missing module means a broken import chain — real failure.
    if (err.code === 'ERR_MODULE_NOT_FOUND') {
      // Extract the package name from the error. Node.js ESM gives two forms:
      // 1. "Cannot find package 'tailwindcss'" (bare specifier)
      // 2. "Cannot find module '.../node_modules/tailwindcss/plugin'" (resolved path)
      const specMatch = err.message.match(/Cannot find (?:package |module )'([^']+)'/)
      const rawSpec = specMatch?.[1] ?? ''
      let missingPkg = null
      const nmIdx = rawSpec.replace(/\\/g, '/').lastIndexOf('node_modules/')
      if (nmIdx !== -1) {
        // Extract package name from resolved path: node_modules/@scope/pkg/... or node_modules/pkg/...
        const afterNm = rawSpec.replace(/\\/g, '/').slice(nmIdx + 'node_modules/'.length)
        const parts = afterNm.split('/')
        missingPkg = parts[0].startsWith('@') ? `${parts[0]}/${parts[1]}` : parts[0]
      } else if (rawSpec && !rawSpec.includes('/') && !rawSpec.includes('\\')) {
        // Bare specifier
        missingPkg = rawSpec
      }
      if (missingPkg && KNOWN_EXTERNALS.has(missingPkg)) {
        console.log(`  ${PASS} ${key} (external dep '${missingPkg}' not installed — OK)`)
        passed++
      } else {
        console.log(`  ${FAIL} ${key}`)
        console.log(`    \u2192 Missing module: ${missingPkg || err.message.split('\n')[0]}`)
        console.log(`    \u2192 Not a declared peerDependency — this is a broken import, not an expected external`)
        failures++
      }
    } else {
      console.log(`  ${FAIL} ${key}`)
      console.log(`    \u2192 ${err.message.split('\n')[0]}`)
      failures++
    }
  }
}

console.log(`\n${passed} passed, ${failures} failed\n`)

if (failures > 0) {
  console.log('\x1b[31mSSR smoke test FAILED\x1b[0m \u2014 fix module-scope browser API usage before publishing.')
  process.exit(1)
}

console.log('\x1b[32mSSR smoke test passed\x1b[0m \u2014 all entry points are safe to import in Node.js.')
