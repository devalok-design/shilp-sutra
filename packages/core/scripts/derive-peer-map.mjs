/**
 * derive-peer-map.mjs
 *
 * Single source of truth for "which components need which optional peer deps."
 *
 * Replaces the hand-maintained PEER_SPECS map in build-mcp-manifest.mjs and the
 * §2a tables repeated across docs/recipes/install-*.md. Those three surfaces
 * drifted (dogfood 2026-07-10): `sonner`, `remark-gfm`, `@emoji-mart/*` were
 * real peers missing from the map, and `@tiptap/*` was listed as a peer despite
 * being BUNDLED into dist (`_chunks/tiptap.js`) — a phantom install instruction.
 *
 * The truth is derivable, so derive it:
 *   1. A module is a CONSUMER PEER iff our build externalizes it (it is NOT in
 *      dist, so the consumer must provide it). The authoritative "externalized"
 *      set is the `external: [...]` regex list in vite.config.ts — parsed here,
 *      never re-typed.
 *   2. A GATED peer is an externalized module minus the base-install/universal
 *      set (react, framer-motion, tailwindcss, @tabler, …) — i.e. the
 *      component-specific optional peers a consumer only needs when they import
 *      the matching component.
 *   3. component → peers is read from the component's actual import statements
 *      (static, side-effect, and dynamic/lazy).
 *
 * Usage (from packages/core/):
 *   node scripts/derive-peer-map.mjs            # print the derived map (JSON)
 *   node scripts/derive-peer-map.mjs --check    # diff map vs recipe §2a tables; exit 1 on drift
 *
 * Consumed by build-mcp-manifest.mjs via `import { derivePeerMap }`.
 */

import { readFileSync, readdirSync, statSync } from 'fs'
import { join, basename, extname } from 'path'
import { fileURLToPath } from 'url'

// import.meta.dirname (Node 20.11+) is undefined under some test runners; fall
// back to the file URL only when it is a real file: URL.
const __dirname = import.meta.dirname || fileURLToPath(new URL('.', import.meta.url))
const ROOT = join(__dirname, '..')

// Categories the MCP manifest indexes (mirrors build-mcp-manifest.mjs CATEGORIES).
// The peer map only needs to key components the manifest actually exposes.
const MANIFEST_CATEGORIES = ['ui', 'composed', 'shell']

// Skipped when ENUMERATING components (these are not components themselves).
const SKIP_DIRS = new Set(['lib', '__tests__', 'extensions', '_internal'])
// Skipped when SCANNING a component's own files for imports. Only test dirs are
// excluded — `_internal`/`lib`/`extensions` code ships in the consumer's bundle,
// so their peer imports (e.g. charts/_internal/axes.tsx → d3-axis) count.
const WALK_SKIP_DIRS = new Set(['__tests__'])

// Externalized-but-universal: part of the base install (react/-dom, next,
// framer-motion, tailwindcss), a build/transitive concern (server-only,
// use-sync-external-store), or globally noted rather than component-gated
// (@tabler/icons-react — preflight already emits a standing Tabler note). These
// are NOT reported per-component.
const BASE_EXTERNALS = new Set([
  'react',
  'react-dom',
  'next',
  'server-only',
  'tailwindcss',
  'framer-motion',
  'use-sync-external-store',
  '@tabler/icons-react',
])

/** Bare-module root: '@scope/pkg/sub' → '@scope/pkg', 'pkg/sub' → 'pkg'. */
function moduleRoot(spec) {
  const parts = spec.split('/')
  if (spec.startsWith('@')) return parts.slice(0, 2).join('/')
  return parts[0]
}

/** PascalCase/camel → kebab (mirrors tools.mjs kebab + manifest naming). */
function kebab(s) {
  return String(s)
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
    .toLowerCase()
}

/**
 * Parse the `external: [ /regex/flags, ... ]` block out of vite.config.ts and
 * return RegExp[]. Keeps vite.config as the single source of the externalized
 * set — regenerate this map when the build's externalization changes.
 */
function loadExternalMatchers() {
  const src = readFileSync(join(ROOT, 'vite.config.ts'), 'utf8').replace(/\r\n/g, '\n')
  const start = src.indexOf('external:')
  if (start < 0) throw new Error('derive-peer-map: no `external:` block in vite.config.ts')
  const open = src.indexOf('[', start)
  // Walk to the matching close bracket (the block is one level deep, no nested arrays).
  let depth = 0
  let end = -1
  for (let i = open; i < src.length; i++) {
    if (src[i] === '[') depth++
    else if (src[i] === ']') {
      depth--
      if (depth === 0) { end = i; break }
    }
  }
  if (end < 0) throw new Error('derive-peer-map: unterminated `external:` array in vite.config.ts')
  const block = src.slice(open + 1, end)
  const matchers = []
  for (const raw of block.split('\n')) {
    // Strip a trailing line comment, but only one preceded by whitespace — a
    // bare `/\/\/.*$/` would also eat the `//` INSIDE a regex literal ending in
    // `\//` (e.g. `/^@tanstack\//`), silently dropping that external.
    const line = raw.replace(/\s+\/\/.*$/, '').trim().replace(/,+$/, '')
    const m = line.match(/^\/(.+)\/([gimsuy]*)$/)
    if (m) matchers.push(new RegExp(m[1], m[2]))
  }
  if (!matchers.length) throw new Error('derive-peer-map: parsed zero external matchers')
  return matchers
}

/**
 * Consumer-facing component names — the kebab basenames of `./ui/*`,
 * `./composed/*`, `./shell/*`, `./ai/*` subpath exports in package.json. Only
 * these are gated: internal sub-components (data-table-body, …) are pulled in
 * transitively by their exported parent, so a consumer never installs peers
 * for them directly. Reporting them would make the gate cry wolf.
 */
function loadExportedComponents() {
  const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'))
  const set = new Set()
  for (const key of Object.keys(pkg.exports || {})) {
    const m = key.match(/^\.\/(ui|composed|shell|ai)\/(.+)$/)
    if (m && !m[2].includes('/')) set.add(kebab(m[2]))
  }
  return set
}

function isExcludedFile(filename) {
  if (!filename.endsWith('.tsx') && !filename.endsWith('.ts')) return true
  if (/\.(test|stories)\.(tsx?|jsx?)$/.test(filename)) return true
  if (filename.endsWith('.d.ts')) return true
  if (filename.endsWith('.mdx')) return true
  if (filename === 'index.ts' || filename === 'index.tsx') return true
  if (/-types\.tsx?$/.test(filename)) return true
  return false
}

/** Collect all .ts/.tsx files under a component entry (file or directory). */
function filesForEntry(categoryDir, entry) {
  const full = join(categoryDir, entry)
  const out = []
  if (statSync(full).isDirectory()) {
    walk(full, out)
  } else if (!isExcludedFile(entry)) {
    out.push(full)
  }
  return out
}

function walk(dir, out) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    const stat = statSync(full)
    if (stat.isDirectory()) {
      if (WALK_SKIP_DIRS.has(entry)) continue
      walk(full, out)
    } else if (!isExcludedFile(entry)) {
      out.push(full)
    }
  }
}

/** Every bare module specifier imported (static, side-effect, dynamic/lazy). */
function bareImportsOf(file) {
  const src = readFileSync(file, 'utf8').replace(/\r\n/g, '\n')
  const specs = new Set()
  const patterns = [
    /(?:import|export)\s[^'"]*?from\s*['"]([^'"]+)['"]/g, // import … from 'x' / export … from 'x'
    /import\s*['"]([^'"]+)['"]/g, // side-effect: import 'x'
    /import\(\s*['"]([^'"]+)['"]\s*\)/g, // dynamic / React.lazy(() => import('x'))
    /require\(\s*['"]([^'"]+)['"]\s*\)/g, // defensive: require('x')
  ]
  for (const re of patterns) {
    for (const m of src.matchAll(re)) {
      const spec = m[1]
      if (spec.startsWith('.') || spec.startsWith('/')) continue // relative
      specs.add(spec)
    }
  }
  return specs
}

/**
 * Derive component → sorted unique gated-peer list.
 * @returns {{ map: Record<string,string[]>, gatedUniverse: Set<string>, externals: RegExp[] }}
 */
export function derivePeerMap({ categories = MANIFEST_CATEGORIES, exportedOnly = true } = {}) {
  const externals = loadExternalMatchers()
  const isExternal = (root) => externals.some((re) => re.test(root))
  const isGated = (root) => isExternal(root) && !BASE_EXTERNALS.has(root)
  const exported = exportedOnly ? loadExportedComponents() : null

  const map = {}
  const gatedUniverse = new Set()

  for (const cat of categories) {
    const categoryDir = join(ROOT, 'src', cat)
    let entries
    try {
      entries = readdirSync(categoryDir)
    } catch {
      continue
    }
    for (const entry of entries) {
      const isDir = statSync(join(categoryDir, entry)).isDirectory()
      if (isDir && SKIP_DIRS.has(entry)) continue
      if (!isDir && isExcludedFile(entry)) continue
      const name = isDir ? entry : basename(entry, extname(entry))
      const peers = new Set()
      for (const file of filesForEntry(categoryDir, entry)) {
        for (const spec of bareImportsOf(file)) {
          const root = moduleRoot(spec)
          if (isGated(root)) {
            peers.add(root)
            gatedUniverse.add(root)
          }
        }
      }
      const key = kebab(name)
      if (peers.size && (!exported || exported.has(key))) map[key] = [...peers].sort()
    }
  }
  return { map, gatedUniverse, externals }
}

// ── Gate: diff derived map against the recipe §2a tables ──────────────────────

/** Parse a recipe's §2a "optional peer" table → { componentName: sortedPeers[] }. */
function parseRecipeTable(md) {
  const text = md.replace(/\r\n/g, '\n')
  const result = {}
  for (const line of text.split('\n')) {
    if (!line.trim().startsWith('|')) continue
    if (!line.includes('@devalok/shilp-sutra/')) continue
    // Import cell: first backticked token containing the package path.
    const importCell = line.match(/`(@devalok\/shilp-sutra\/[^`]+)`/)
    if (!importCell) continue
    // Install cell: the `pnpm add …` (or npm/yarn/bun) backticked command(s).
    const pkgs = new Set()
    for (const cmd of line.matchAll(/`(?:pnpm add|npm install|yarn add|bun add)\s+([^`]+)`/g)) {
      for (const tok of cmd[1].split(/\s+/)) {
        const t = tok.trim().replace(/^-D$/, '')
        if (t && !/^-/.test(t)) pkgs.add(moduleRoot(t))
      }
    }
    if (!pkgs.size) continue
    // Import path → component name (last non-glob segment, kebab).
    const segs = importCell[1].replace(/^@devalok\/shilp-sutra\//, '').split('/').filter((s) => s && s !== '*')
    const name = kebab(segs[segs.length - 1])
    result[name] = [...new Set([...(result[name] || []), ...pkgs])].sort()
  }
  return result
}

function sameSet(a = [], b = []) {
  if (a.length !== b.length) return false
  const s = new Set(a)
  return b.every((x) => s.has(x))
}

/** Compare derived map to a recipe table; return { missing, phantom, mismatched }. */
function diffAgainstRecipe(derived, recipe) {
  const missing = [] // component→peer in source but not in recipe
  const phantom = [] // component→peer in recipe but not in source (e.g. bundled tiptap)
  const mismatched = []
  const names = new Set([...Object.keys(derived), ...Object.keys(recipe)])
  for (const name of names) {
    const d = derived[name] || []
    const r = recipe[name] || []
    if (sameSet(d, r)) continue
    const miss = d.filter((p) => !r.includes(p))
    const phan = r.filter((p) => !d.includes(p))
    if (miss.length) missing.push({ component: name, peers: miss })
    if (phan.length) phantom.push({ component: name, peers: phan })
    if (miss.length && phan.length) mismatched.push(name)
  }
  return { missing, phantom }
}

async function main() {
  const checkOnly = process.argv.includes('--check')
  const { map } = derivePeerMap()

  if (!checkOnly) {
    process.stdout.write(JSON.stringify(map, null, 2) + '\n')
    return
  }

  // §2a tables are duplicated across recipes; parse them all and union, so a
  // peer documented in one recipe but dropped from another still counts as
  // "documented" (and a genuinely-missing peer fails everywhere).
  const recipeDir = join(ROOT, 'docs', 'recipes')
  const recipeFiles = readdirSync(recipeDir).filter((f) => /^install-.*\.md$/.test(f))
  const union = {}
  const perRecipe = {}
  for (const f of recipeFiles) {
    const parsed = parseRecipeTable(readFileSync(join(recipeDir, f), 'utf8'))
    perRecipe[f] = parsed
    for (const [name, peers] of Object.entries(parsed)) {
      union[name] = [...new Set([...(union[name] || []), ...peers])].sort()
    }
  }

  const { missing, phantom } = diffAgainstRecipe(map, union)

  console.log('# derive-peer-map --check\n')
  console.log(`Derived ${Object.keys(map).length} components with gated peers from source.`)
  console.log(`Recipe §2a tables (union of ${recipeFiles.length} files) list ${Object.keys(union).length} components.\n`)

  if (!missing.length && !phantom.length) {
    console.log('✓ Recipe peer tables match the source-derived map. No drift.')
    return
  }

  if (missing.length) {
    console.log(`✗ MISSING — imported in source but absent from every recipe §2a table (consumer build/runtime breaks):`)
    for (const { component, peers } of missing) console.log(`    ${component} → ${peers.join(', ')}`)
    console.log('')
  }
  if (phantom.length) {
    console.log(`✗ PHANTOM — listed in a recipe §2a table but NOT imported by the component (redundant install; often a bundled dep):`)
    for (const { component, peers } of phantom) console.log(`    ${component} → ${peers.join(', ')}`)
    console.log('')
  }
  console.log('Fix: update the §2a table in docs/recipes/install-*.md (and drop PEER_SPECS — build-mcp-manifest.mjs now derives from source).')
  process.exitCode = 1
}

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('derive-peer-map.mjs')) {
  main()
}
