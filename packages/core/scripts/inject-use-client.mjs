/**
 * inject-use-client.mjs
 *
 * Post-build script that prepends `"use client";\n` to every .js file in dist/,
 * EXCEPT for files that are server-safe (pure markup / no hooks) and files that
 * already contain the directive.
 *
 * `.d.ts` files are deliberately NOT injected — and any pre-existing directive
 * in one is stripped. A declaration file is an ambient context, so a directive
 * prologue there is a statement and TypeScript rejects it outright:
 *
 *   dist/ui/button.d.ts(1,1): error TS1036:
 *     Statements are not allowed in ambient contexts.
 *
 * Consumers only see this with `skipLibCheck: false`, which is why it survived
 * to 0.54.0 (209 of 284 published .d.ts carried the directive; a single barrel
 * import produced 78 errors). The directive is a bundler/RSC runtime concern —
 * it is read off the .js module graph, and declarations are erased before
 * anything runs, so putting it in a .d.ts buys nothing and only breaks people.
 *
 * Server-safe components are detected automatically from a `// @server-safe`
 * comment on the first line of their source file. Build artifacts that are
 * server-safe (chunks, tailwind config) are listed in BUILD_ARTIFACT_SAFE below.
 *
 * Run from packages/core/:
 *   node scripts/inject-use-client.mjs
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs'
import { join, posix } from 'path'

// ── Build-artifact exemptions (not source files, can't be annotated) ────────
const BUILD_ARTIFACT_SAFE = new Set([
  // tailwind config (Node-only, no React)
  'tailwind/index',
  'tailwind/preset',

  // NOTE: '_chunks/vendor-utils' was listed here until clsx / cva /
  // tailwind-merge were externalized. With nothing left to group, the chunk is
  // no longer emitted and the entry only produced a "not found in dist/" warning.
])

// ── Scan source files for @server-safe annotation ──────────────────────────
const ANNOTATION = '// @server-safe'
const srcRoot = join(process.cwd(), 'src')

/** Recursively collect all .ts/.tsx files under `dir`. */
function walkSrc(dir) {
  const results = []
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) {
      results.push(...walkSrc(full))
    } else if (full.endsWith('.ts') || full.endsWith('.tsx')) {
      results.push(full)
    }
  }
  return results
}

/**
 * Build the server-safe set from source annotations.
 * Scans all .ts/.tsx files under src/ for `// @server-safe` on the first line.
 * Returns dist-relative POSIX keys (e.g. 'ui/text', 'composed/page-header').
 */
function detectServerSafeFromSource() {
  const detected = new Set()
  const srcFiles = walkSrc(srcRoot)

  for (const filePath of srcFiles) {
    const firstLine = readFileSync(filePath, 'utf8').split('\n')[0].trim()
    if (firstLine === ANNOTATION) {
      // Convert src path to dist key: strip srcRoot prefix, normalise slashes, strip extension
      let rel = filePath.slice(srcRoot.length + 1).split('\\').join('/')
      rel = rel.replace(/\.tsx?$/, '')
      detected.add(rel)
    }
  }

  return detected
}

const sourceServerSafe = detectServerSafeFromSource()

// Merge source annotations with build-artifact exemptions
const SERVER_SAFE = new Set([...sourceServerSafe, ...BUILD_ARTIFACT_SAFE])

// Log detected server-safe files for debugging
console.log(`inject-use-client: detected ${sourceServerSafe.size} @server-safe source files:`)
for (const key of [...sourceServerSafe].sort()) {
  console.log(`  ${key}`)
}

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
let stripped = 0

const DIRECTIVE_RE = /^\s*(["'])use client\1;?[ \t]*\r?\n/

for (const filePath of allFiles) {
  // `.d.ts` is an ambient context — a directive prologue there is a statement
  // (TS1036). Never inject, and strip one if a previous build left it behind.
  if (filePath.endsWith('.d.ts')) {
    const dtsContent = readFileSync(filePath, 'utf8')
    if (DIRECTIVE_RE.test(dtsContent)) {
      writeFileSync(filePath, dtsContent.replace(DIRECTIVE_RE, ''))
      stripped++
    }
    continue
  }

  if (!filePath.endsWith('.js')) {
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

// ── Rolldown runtime no longer needs a CJS require() bridge ────────────────
//
// Historical context (0.34–0.36): Vite 8/Rolldown bundled
// `use-sync-external-store` (a tiptap transitive) which does
// `require("react")` as a CJS shim. That forced us to inject
// `import { createRequire } from 'module'` into `_chunks/rolldown-runtime.js`,
// which Turbopack consumers could not resolve (`Cannot find module 'module'`),
// breaking every Next.js 16 + TW4 consumer (Karm #30).
//
// Fix (0.37.0): externalize `use-sync-external-store` in vite.config.ts so the
// consumer's React installs pull it in natively. With no bundled CJS deps
// calling require(), the rolldown runtime never emits a require shim, and this
// patch has nothing to do. Dead code removed.
//
// Epilogue: externalizing tiptap removed the last importer of
// `use-sync-external-store`, so it is no longer a dependency of ours at all.
//
// If a future dependency re-introduces CJS require into a client chunk, the
// consumer smoke test (scripts/consumer-smoke-test.mjs) will catch it as
// `Cannot find module 'module'` in Turbopack. At that point, prefer
// externalizing the offending dep over re-adding a CJS bridge.

console.log(
  `inject-use-client: ${injected} files updated, ${skipped} skipped, ${stripped} .d.ts directives stripped`
)
