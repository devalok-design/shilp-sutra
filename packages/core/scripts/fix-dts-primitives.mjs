/**
 * fix-dts-primitives.mjs
 *
 * Post-build script that:
 * 1. Copies vendored .d.ts files from src/primitives/ to dist/primitives/
 *    (the Vite build only emits .js for these pre-bundled vendored files)
 * 2. Rewrites `@primitives/react-*` import paths in ALL .d.ts files under dist/
 *    to correct relative paths so consumers resolve types without the build alias.
 *
 * Run from packages/core/:
 *   node scripts/fix-dts-primitives.mjs
 */

import { readFileSync, writeFileSync, readdirSync, statSync, copyFileSync, mkdirSync, existsSync } from 'fs'
import { join, relative, dirname, posix } from 'path'
import { fileURLToPath } from 'url'

// ── Resolve project root (packages/core/) ───────────────────────────────────
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const coreRoot = join(__dirname, '..')
const srcPrimitives = join(coreRoot, 'src', 'primitives')
const distRoot = join(coreRoot, 'dist')
const distPrimitives = join(distRoot, 'primitives')

// ── Step 1: Copy vendored .d.ts files from src/primitives/ → dist/primitives/
// These are the hand-written type declarations shipped alongside the bundled .js
// files. Vite's build does not copy them, so we do it manually.
// ─────────────────────────────────────────────────────────────────────────────

let copied = 0

function copyDtsFiles(srcDir, destDir) {
  if (!existsSync(srcDir)) return

  mkdirSync(destDir, { recursive: true })

  for (const entry of readdirSync(srcDir)) {
    const srcPath = join(srcDir, entry)
    const destPath = join(destDir, entry)
    const stat = statSync(srcPath)

    if (stat.isDirectory()) {
      // Recurse into subdirectories (e.g. _internal/)
      copyDtsFiles(srcPath, destPath)
    } else if (entry.endsWith('.d.ts')) {
      // Only copy if the file doesn't already exist in dist
      // (tsc may have generated some; vendored ones take precedence)
      copyFileSync(srcPath, destPath)
      copied++
    }
  }
}

copyDtsFiles(srcPrimitives, distPrimitives)
console.log(`fix-dts-primitives: copied ${copied} .d.ts files to dist/primitives/`)

// ── Step 2: Rewrite @primitives/ imports in all .d.ts files under dist/ ─────
// The TypeScript compiler preserves the `@primitives/react-*` path aliases in
// emitted .d.ts files. Consumers don't have this alias, so we rewrite to
// relative paths based on each file's location within dist/.
// ─────────────────────────────────────────────────────────────────────────────

/** Recursively collect all files under `dir`. */
function walk(dir) {
  const results = []
  if (!existsSync(dir)) return results
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

const ALIAS_RE = /['"]@primitives\/(react-[a-z-]+)['"]/g

let rewritten = 0

const allDtsFiles = walk(distRoot).filter(f => f.endsWith('.d.ts'))

for (const filePath of allDtsFiles) {
  const content = readFileSync(filePath, 'utf8')

  if (!ALIAS_RE.test(content)) continue
  // Reset regex lastIndex after test()
  ALIAS_RE.lastIndex = 0

  // Calculate relative path from this file's directory to dist/primitives/
  const fileDir = dirname(filePath)
  // Use posix-style relative path (forward slashes)
  let relToPrimitives = relative(fileDir, distPrimitives).split('\\').join('/')

  // Ensure it starts with ./ or ../
  if (!relToPrimitives.startsWith('.')) {
    relToPrimitives = './' + relToPrimitives
  }

  const updated = content.replace(ALIAS_RE, (match, name) => {
    const quote = match[0] // preserve original quote style (' or ")
    return `${quote}${relToPrimitives}/${name}${quote}`
  })

  if (updated !== content) {
    writeFileSync(filePath, updated)
    rewritten++
  }
}

console.log(`fix-dts-primitives: rewrote @primitives/ imports in ${rewritten} .d.ts files`)
