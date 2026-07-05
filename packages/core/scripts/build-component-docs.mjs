/**
 * build-component-docs.mjs
 *
 * Scans src/ui/, src/composed/, src/shell/ for component source files and
 * validates that each has a matching doc in docs/components/{category}/{kebab-name}.md.
 * Validation-only since 0.46 — llms-full.txt is gone; build-mcp-manifest.mjs
 * emits mcp-manifest.json + the router llms.txt instead.
 *
 * Usage (run from packages/core/):
 *   node scripts/build-component-docs.mjs           # validate
 *   node scripts/build-component-docs.mjs --check   # same (kept for pipeline compat)
 */

import { readdirSync, statSync } from 'fs'
import { join, basename, extname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const ROOT = join(__dirname, '..')

// ── Configuration ───────────────────────────────────────────────────────────

const CATEGORIES = ['ui', 'composed', 'shell']

/** Directories to skip when scanning for components. */
const SKIP_DIRS = new Set(['lib', '__tests__', 'extensions', '_internal'])

/** File patterns to exclude. */
function isExcluded(filename) {
  if (filename.endsWith('.js')) return true
  if (filename.endsWith('.test.tsx') || filename.endsWith('.test.ts')) return true
  if (filename.endsWith('.stories.tsx') || filename.endsWith('.stories.ts')) return true
  if (filename.endsWith('.mdx')) return true
  if (filename === 'index.ts' || filename === 'index.tsx') return true
  if (filename.endsWith('-types.ts') || filename.endsWith('-types.tsx')) return true
  return false
}

// ── Component scanning ──────────────────────────────────────────────────────

/**
 * Collect kebab-names of components in a category directory.
 * Scans .tsx files at the top level. Subdirectories (e.g. charts/, tree-view/)
 * are treated as a single component each (the directory name), not recursed into.
 * Skips SKIP_DIRS entirely.
 */
function scanComponents(categoryDir) {
  const names = []

  let entries
  try {
    entries = readdirSync(categoryDir)
  } catch {
    return []
  }

  for (const entry of entries) {
    const fullPath = join(categoryDir, entry)
    const stat = statSync(fullPath)

    if (stat.isDirectory()) {
      if (SKIP_DIRS.has(entry)) continue
      // Subdirectory = one component (e.g. charts/, tree-view/, date-picker/)
      names.push(entry)
      continue
    }

    // Only .tsx component files
    if (!entry.endsWith('.tsx')) continue
    if (isExcluded(entry)) continue

    const name = basename(entry, extname(entry))
    names.push(name)
  }

  return [...new Set(names)].sort()
}

// ── Main ────────────────────────────────────────────────────────────────────

const checkOnly = process.argv.includes('--check')

// Scan all categories for component names
const componentsByCategory = {}
for (const cat of CATEGORIES) {
  componentsByCategory[cat] = scanComponents(join(ROOT, 'src', cat))
}

// Validate: every component must have a matching doc file
const missing = []
for (const cat of CATEGORIES) {
  for (const name of componentsByCategory[cat]) {
    const docPath = join(ROOT, 'docs', 'components', cat, `${name}.md`)
    try {
      statSync(docPath)
    } catch {
      missing.push(`docs/components/${cat}/${name}.md`)
    }
  }
}

if (missing.length > 0) {
  const total = CATEGORIES.reduce((n, c) => n + componentsByCategory[c].length, 0)
  console.error(`\nMissing ${missing.length} of ${total} component doc files:\n`)
  for (const m of missing) {
    console.error(`  - ${m}`)
  }
  console.error('')
  process.exit(1)
}

// In --check mode, just report success
if (checkOnly) {
  const total = CATEGORIES.reduce((n, c) => n + componentsByCategory[c].length, 0)
  console.log(`All ${total} component doc files present.`)
  process.exit(0)
}

// llms-full.txt is no longer generated (removed in 0.46 — the MCP manifest +
// per-component docs + router llms.txt replaced the concatenated dump; see
// docs/specs/mcp-manifest-standard.md §4). This script is now validation-only;
// build-mcp-manifest.mjs handles all generation.
const total = CATEGORIES.reduce((n, c) => n + componentsByCategory[c].length, 0)
console.log(`All ${total} component doc files present across ${CATEGORIES.length} categories.`)
