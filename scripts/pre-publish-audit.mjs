#!/usr/bin/env node

/**
 * Pre-Publish Audit Script
 *
 * Runs all automated gates before npm publish.
 * Exits non-zero if ANY gate fails.
 *
 * Usage: node scripts/pre-publish-audit.mjs
 *
 * Security note: All commands are hardcoded strings (no user input).
 * execSync is safe here — no shell injection risk.
 */

import { execSync } from 'child_process'
import { readFileSync, existsSync, readdirSync, statSync } from 'fs'
import { join, resolve, basename } from 'path'
import { globSync } from 'node:fs'
import { validate as validateBreakingManifest } from './validate-breaking-manifest.mjs'

const ROOT = resolve(import.meta.dirname, '..')
const PASS = '\x1b[32m✓\x1b[0m'
const FAIL = '\x1b[31m✗\x1b[0m'
const WARN = '\x1b[33m⚠\x1b[0m'
const SKIP = '\x1b[90m∅\x1b[0m'

// When the caller (release.yml / CI) has ALREADY run build+typecheck+test+ssr
// as separate steps, re-running them inside the audit is pure duplicate work
// (~4-6 min per release). Set SS_AUDIT_SKIP_REDUNDANT=1 to skip exactly those
// four gates; every audit-UNIQUE gate (docs coverage, token hygiene, manifest,
// skill, breaking, bundle, consumer smoke) still runs. Downstream gates that
// need dist/ rely on the caller's build step having produced it. Unset locally
// → the audit is fully self-contained as before.
const SKIP_REDUNDANT = process.env.SS_AUDIT_SKIP_REDUNDANT === '1'

let failures = 0
let warnings = 0
let skipped = 0

function run(cmd, opts = {}) {
  try {
    return execSync(cmd, { cwd: ROOT, encoding: 'utf-8', stdio: 'pipe', ...opts }).trim()
  } catch (e) {
    return e.stdout?.trim?.() ?? ''
  }
}

function gate(name, check) {
  try {
    const result = check()
    if (result === true) {
      console.log(`  ${PASS} ${name}`)
      return true
    }
    console.log(`  ${FAIL} ${name}`)
    if (typeof result === 'string') console.log(`    → ${result}`)
    failures++
    return false
  } catch (e) {
    console.log(`  ${FAIL} ${name}`)
    console.log(`    → ${e.message}`)
    failures++
    return false
  }
}

// A gate that duplicates a step the CI caller already ran. Skipped (not failed)
// when SS_AUDIT_SKIP_REDUNDANT=1; otherwise behaves exactly like gate().
function heavyGate(name, check) {
  if (SKIP_REDUNDANT) {
    console.log(`  ${SKIP} ${name} — skipped (already run as a CI step)`)
    skipped++
    return true
  }
  return gate(name, check)
}

function advisory(name, check) {
  try {
    const result = check()
    if (result === true) {
      console.log(`  ${PASS} ${name}`)
    } else {
      console.log(`  ${WARN} ${name}`)
      if (typeof result === 'string') console.log(`    → ${result}`)
      warnings++
    }
  } catch (e) {
    console.log(`  ${WARN} ${name}`)
    console.log(`    → ${e.message}`)
    warnings++
  }
}

// ─── Helpers ───────────────────────────────────────────────

function getLastTag() {
  try {
    return execSync('git describe --tags --abbrev=0', { cwd: ROOT, encoding: 'utf-8', stdio: 'pipe' }).trim()
  } catch {
    return null
  }
}

function getPackageVersion(pkg) {
  const pj = JSON.parse(readFileSync(join(ROOT, 'packages', pkg, 'package.json'), 'utf-8'))
  return pj.version
}

// Reads the latest version header from a package's changesets-managed
// CHANGELOG.md. Changesets writes `## 0.37.1` (no brackets); the legacy
// hand-maintained root CHANGELOG used Keep-a-Changelog `## [0.37.1]`.
// Accept both. Skip prerelease entries (`## 0.37.0-next.1`) — pre-mode bypasses
// this gate anyway, so stable-only matching keeps the regex simple.
function getChangelogLatestVersion(pkg = 'core') {
  const path = join(ROOT, 'packages', pkg, 'CHANGELOG.md')
  if (!existsSync(path)) return null
  const cl = readFileSync(path, 'utf-8')
  const match = cl.match(/^## \[?(\d+\.\d+\.\d+)\]?\s*$/m)
  return match ? match[1] : null
}

// Deprecated surface tokens: old numeric Tailwind classes (bg-surface-1..4)
// These are replaced by semantic names: bg-surface-base, bg-surface-raised, etc.
const DEPRECATED_SURFACE_TOKENS = [
  'bg-surface-1', 'bg-surface-2', 'bg-surface-3', 'bg-surface-4',
  'text-surface-1', 'text-surface-2', 'text-surface-3', 'text-surface-4',
  'border-surface-1', 'border-surface-2', 'border-surface-3', 'border-surface-4',
  'ring-surface-1', 'ring-surface-2', 'ring-surface-3', 'ring-surface-4',
]

// Deprecated shadow tokens: old numeric Tailwind classes (shadow-01..05)
// These are replaced by semantic names: shadow-raised, shadow-floating, etc.
const DEPRECATED_SHADOW_TOKENS = [
  'shadow-01', 'shadow-02', 'shadow-03', 'shadow-04', 'shadow-05',
]

// Files that intentionally define deprecated aliases (not component usage)
const TOKEN_DEFINITION_EXCLUDES = [
  'semantic.css',
  'preset.ts',
]

// ─── Gates ─────────────────────────────────────────────────

console.log('\n\x1b[1m🔍 Pre-Publish Audit\x1b[0m\n')

// --- Git State ---
console.log('\x1b[36mGit State\x1b[0m')

// In CI the working tree is inherently fresh (just checked out). If the
// audit also runs `pnpm build` as part of its chain, build artifacts that
// are regenerated deterministically (mcp-manifest.json, llms.txt router, copied root docs into
// packages/core/) will make `git status --porcelain` non-empty even though
// nothing a developer did is uncommitted. The gate exists to catch
// developer-laptop state where someone forgot to commit; in CI it's noise.
// Skip when process.env.CI is set (true in GitHub Actions, GitLab, etc.).
if (process.env.CI) {
  console.log(`  ${PASS} Working tree clean check skipped (CI — regenerated build artifacts expected)`)
} else {
  gate('Working tree is clean', () => {
    const status = run('git status --porcelain')
    if (status) return `Uncommitted changes:\n${status.split('\n').map(l => `      ${l}`).join('\n')}`
    return true
  })
}

// --- Version Consistency ---
console.log('\n\x1b[36mVersion Consistency\x1b[0m')

const coreVersion = getPackageVersion('core')
const clVersion = getChangelogLatestVersion()
// Changesets pre-mode defers the package.json bump to publish time. While
// .changeset/pre.json is present, package.json intentionally still reflects
// the previous stable version while CHANGELOG ALREADY has the next version's
// entry. That's the designed flow, not a mismatch we should fail on.
const preModeActive = existsSync(join(ROOT, '.changeset', 'pre.json'))

gate(`Core version (${coreVersion}) matches CHANGELOG (${clVersion})`, () => {
  if (preModeActive) {
    // During pre-mode, divergence is expected. The Changesets Action bumps
    // package.json and re-pins CHANGELOG during `pnpm version-packages` in
    // the next PR. Skip the equality check.
    return true
  }
  return coreVersion === clVersion || `CHANGELOG latest is ${clVersion}`
})

gate('CHANGELOG has entry for current version', () => {
  return clVersion != null || 'No version header found in CHANGELOG.md'
})

// --- Documentation Coverage ---
console.log('\n\x1b[36mDocumentation Coverage\x1b[0m')

gate('Core docs coverage (build:docs:check)', () => {
  try {
    execSync('node scripts/build-component-docs.mjs --check', {
      cwd: join(ROOT, 'packages/core'),
      encoding: 'utf-8',
      stdio: 'pipe',
    })
    return true
  } catch (e) {
    return e.stdout?.trim() || 'build:docs:check failed'
  }
})

gate('Core docs CVA accuracy (no HIGH drift vs source)', () => {
  // Mechanical check: every axis in a component's CVA must appear in its doc.
  // Catches the rot that accumulated before the 2026-04-21 sweep (Card missing
  // color+size, Combobox missing size, Text missing full variant list, etc.).
  // Only HIGH drift fails — MEDIUM "extra-axis" flags are false positives on
  // TS-only props the script can't see.
  try {
    execSync('node scripts/audit-component-docs.mjs --check', {
      cwd: join(ROOT, 'packages/core'),
      encoding: 'utf-8',
      stdio: 'pipe',
    })
    return true
  } catch (e) {
    return e.stderr?.trim() || e.stdout?.trim() || 'audit-component-docs --check failed'
  }
})

// Gate A: hand-written MCP tool lists (README/AGENTS) match the registered
// server.tool() set. Guards the exact rot that let "6 tools" survive 4 new
// tools shipping in 0.47.
gate('MCP tool lists match registered tools', () => {
  try {
    execSync('node scripts/check-tool-list.mjs --check', { cwd: ROOT, encoding: 'utf-8', stdio: 'pipe' })
    return true
  } catch (e) {
    return e.stdout?.trim() || e.stderr?.trim() || 'check-tool-list failed'
  }
})

// Gate B: every shipped component-doc EXAMPLE (served by the MCP get_component)
// lints clean — no TW4 dead classes, no invalid enum prop values. Catches an
// example that references a removed variant/prop before the MCP serves it.
gate('Component doc examples lint clean (dead classes / invalid enums)', () => {
  try {
    execSync('node scripts/lint-doc-examples.mjs --check', { cwd: join(ROOT, 'packages/core'), encoding: 'utf-8', stdio: 'pipe' })
    return true
  } catch (e) {
    return e.stdout?.trim() || e.stderr?.trim() || 'lint-doc-examples failed'
  }
})

// Advisory C: doc-documented props that no longer appear in source (likely
// removed). Heuristic — Radix-passthrough props show as false positives — so
// it warns, never blocks.
advisory('Doc props still exist in source (drift check)', () => {
  const out = run('node scripts/audit-doc-props.mjs', { cwd: ROOT })
  const flagged = out.match(/(\d+) with doc-only prop/)
  if (flagged && Number(flagged[1]) > 0) return out.split('\n').filter((l) => l.includes('⚠')).slice(0, 8).join('\n      ')
  return true
})

// --- Code Quality ---
console.log('\n\x1b[36mCode Quality\x1b[0m')

heavyGate('Typecheck passes', () => {
  try {
    execSync('pnpm typecheck', { cwd: ROOT, encoding: 'utf-8', stdio: 'pipe', timeout: 120000 })
    return true
  } catch {
    return 'Typecheck failed — run pnpm typecheck for details'
  }
})

gate('Lint has 0 errors', () => {
  const output = run('pnpm lint 2>&1')
  // Count lines containing " error " (not "0 errors")
  const lines = output.split('\n')
  const errorSummary = lines.find(l => /\d+ error/.test(l) && !/0 error/.test(l))
  if (errorSummary) return errorSummary.trim()
  return true
})

heavyGate('Core tests pass', () => {
  // Retry once — axe-core singleton can cause transient failures under resource pressure
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      execSync('pnpm vitest run --reporter=dot', {
        cwd: join(ROOT, 'packages/core'),
        encoding: 'utf-8',
        stdio: 'pipe',
        timeout: 600000,
      })
      return true
    } catch (e) {
      if (attempt === 0) continue // retry
      const failMatch = e.stdout?.match(/(\d+) failed/)
      return failMatch ? `${failMatch[1]} tests failed` : 'Tests failed'
    }
  }
})

heavyGate('Build succeeds', () => {
  try {
    execSync('pnpm build', { cwd: ROOT, encoding: 'utf-8', stdio: 'pipe', timeout: 300000 })
    return true
  } catch {
    return 'Build failed — run pnpm build for details'
  }
})

heavyGate('SSR smoke test passes (no browser API crashes in Node.js)', () => {
  try {
    // Hardcoded command — no user input, safe to use execSync
    execSync('node scripts/ssr-smoke-test.mjs', {
      cwd: join(ROOT, 'packages/core'),
      encoding: 'utf-8',
      stdio: 'pipe',
      timeout: 120000,
    })
    return true
  } catch (e) {
    return e.stdout?.trim() || 'SSR smoke test failed — run: node packages/core/scripts/ssr-smoke-test.mjs'
  }
})

// --- Source Hygiene ---
console.log('\n\x1b[36mSource Hygiene\x1b[0m')

gate('No stale .js files in core/src/ui/', () => {
  const jsFiles = globSync('packages/core/src/ui/**/*.js', { cwd: ROOT })
  if (jsFiles.length > 0) return `Found ${jsFiles.length} stale .js files:\n${jsFiles.map(f => `      ${f}`).join('\n')}`
  return true
})

gate('No deprecated surface tokens in components', () => {
  const violations = []
  const sourceFiles = [
    ...globSync('packages/core/src/**/*.tsx', { cwd: ROOT }),
  ]

  for (const file of sourceFiles) {
    const normalized = file.replace(/\\/g, '/')
    const basename = normalized.substring(normalized.lastIndexOf('/') + 1)
    // Skip token definition files, stories, and test files
    if (TOKEN_DEFINITION_EXCLUDES.some(e => basename === e) || normalized.includes('.stories.') || normalized.includes('__tests__') || normalized.includes('.test.')) continue

    const content = readFileSync(join(ROOT, file), 'utf-8')
    const lines = content.split('\n')
    for (let i = 0; i < lines.length; i++) {
      for (const token of DEPRECATED_SURFACE_TOKENS) {
        // Match the token as a distinct class (word boundary via non-alphanumeric before/after)
        const regex = new RegExp(`(?<![\\w-])${token.replace(/([.*+?^${}()|[\\]\\\\])/g, '\\$1')}(?![\\w-])`)
        if (regex.test(lines[i])) {
          violations.push(`${file}:${i + 1} — ${token}`)
        }
      }
    }
  }

  if (violations.length > 0) {
    return `Deprecated surface tokens found:\n${violations.map(v => `      ${v}`).join('\n')}\n      Use semantic names: bg-surface-base, bg-surface-raised, bg-surface-overlay, etc.`
  }
  return true
})

gate('No deprecated shadow tokens in components', () => {
  const violations = []
  const sourceFiles = [
    ...globSync('packages/core/src/**/*.tsx', { cwd: ROOT }),
  ]

  for (const file of sourceFiles) {
    const normalized = file.replace(/\\/g, '/')
    const basename = normalized.substring(normalized.lastIndexOf('/') + 1)
    // Skip token definition files, stories, and test files
    if (TOKEN_DEFINITION_EXCLUDES.some(e => basename === e) || normalized.includes('.stories.') || normalized.includes('__tests__') || normalized.includes('.test.')) continue

    const content = readFileSync(join(ROOT, file), 'utf-8')
    const lines = content.split('\n')
    for (let i = 0; i < lines.length; i++) {
      for (const token of DEPRECATED_SHADOW_TOKENS) {
        const regex = new RegExp(`(?<![\\w-])${token.replace(/([.*+?^${}()|[\\]\\\\])/g, '\\$1')}(?![\\w-])`)
        if (regex.test(lines[i])) {
          violations.push(`${file}:${i + 1} — ${token}`)
        }
      }
    }
  }

  if (violations.length > 0) {
    return `Deprecated shadow tokens found:\n${violations.map(v => `      ${v}`).join('\n')}\n      Use semantic names: shadow-raised, shadow-floating, shadow-overlay, etc.`
  }
  return true
})

// --- Shape-Role Radius Gate (added 2026-05-25, v0.39.0) ---
// All components MUST use semantic radius role tokens (rounded-control,
// rounded-surface, rounded-overlay, rounded-pill, etc.) so the [data-shape]
// preset switch can remap them. Bare `rounded-ds-*` and `rounded-full` are
// pinned to a single value and ignore the preset.
//
// Stories and tests are excluded (Storybook/test-runner only). Token-showcase
// files (forced-colors.stories, FoundationsShowcase) are explicitly allowlisted
// because they intentionally demonstrate the primitive scale.
const RADIUS_ROLE_INTENTIONAL_RAW = new Set([
  'packages/core/src/tokens/forced-colors.stories.tsx',
  'packages/core/src/tokens/FoundationsShowcase.tsx',
])

gate('Components use semantic radius roles (no rounded-ds-* / rounded-full)', () => {
  const violations = []
  const sourceFiles = globSync('packages/core/src/**/*.tsx', { cwd: ROOT })

  const bannedPattern = /\brounded(?:-[lrtb]l?|-[lrtb]r?)?-ds-[a-z0-9]+|\brounded-full\b/

  for (const file of sourceFiles) {
    const normalized = file.replace(/\\/g, '/')
    if (normalized.includes('.stories.') || normalized.includes('.test.') || normalized.includes('__tests__')) continue
    if (RADIUS_ROLE_INTENTIONAL_RAW.has(normalized)) continue

    const content = readFileSync(join(ROOT, file), 'utf-8')
    const lines = content.split('\n')
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      // Skip lines that are clearly JSDoc/markdown examples (start with ` *`)
      if (/^\s*\*\s/.test(line)) continue
      const match = line.match(bannedPattern)
      if (match) {
        violations.push(`${file}:${i + 1} — ${match[0]}`)
      }
    }
  }

  if (violations.length > 0) {
    return `Bare radius classes found (must use semantic roles):\n${violations.map(v => `      ${v}`).join('\n')}\n      Use: rounded-control, rounded-control-inner, rounded-surface, rounded-overlay-sm, rounded-overlay, rounded-overlay-lg, rounded-pill, rounded-bubble.\n      Token definitions live in packages/core/src/tokens/semantic.css.`
  }
  return true
})

// --- Tailwind 4 Migration Hygiene (added 2026-04-19 after issue #30) ---
// The TW 3→4 codemod run in commit 23c68d0 produced two classes of regressions
// that slipped past the audit: malformed nested arbitrary variants, and
// unmigrated class names with silently-different visual behavior in TW4.
// Issue #30 (RichChatInput/RichTextEditor garbled class) surfaced the gap.
// These gates prevent the same class of bug from shipping again.
console.log('\n\x1b[36mTailwind 4 Migration Hygiene\x1b[0m')

function scanSource(predicate) {
  const violations = []
  const sourceFiles = globSync('packages/core/src/**/*.{tsx,ts}', { cwd: ROOT })
  for (const file of sourceFiles) {
    const normalized = file.replace(/\\/g, '/')
    if (normalized.includes('.stories.') || normalized.includes('__tests__') || normalized.includes('.test.')) continue
    const content = readFileSync(join(ROOT, file), 'utf-8')
    const lines = content.split('\n')
    for (let i = 0; i < lines.length; i++) {
      const hit = predicate(lines[i])
      if (hit) violations.push(`${file}:${i + 1} — ${hit}`)
    }
  }
  return violations
}

// HARD GATE — exact pattern that broke Karm. Malformed nested arbitrary variant.
gate('No doubled-bracket arbitrary variants', () => {
  const v = scanSource((line) => {
    const m = line.match(/\[\[&[^\]]+\]:[a-z0-9-]+_[a-z]+\]:[a-z0-9-]+/)
    return m ? m[0] : null
  })
  if (v.length > 0) {
    return `Malformed nested arbitrary variants (TW3→4 codemod regression):\n${v.map((x) => `      ${x}`).join('\n')}\n      These are invalid CSS and crash Turbopack consumers.`
  }
  return true
})

// HARD GATE — TW3 outline-none still lingering. TW4 renamed to outline-hidden.
// Under forced-colors mode, outline-none removes the system outline entirely —
// breaks the a11y focus indicator. Caused silent regression in bar-chart,
// line-chart, stepper in 0.36.0 despite the forced-colors feature shipping.
gate('No TW3 outline-none (use outline-hidden)', () => {
  const v = scanSource((line) => /(^|[\s"'`:])outline-none(?![\w-])/.test(line) ? 'outline-none' : null)
  if (v.length > 0) {
    return `Stray TW3 outline-none (use outline-hidden in TW4):\n${v.map((x) => `      ${x}`).join('\n')}\n      outline-none in TW4 also removes the forced-colors outline — a11y regression.`
  }
  return true
})

// ADVISORY — silent renames: class compiles in TW4 but renders DIFFERENTLY
// than it did in TW3 (sizes shifted by one step). Visual surprise risk.
advisory('No TW3 silently-renamed classes (rounded-sm, shadow-sm, blur-sm, backdrop-blur-sm)', () => {
  // These classes still exist in TW4 but map to what TW3 called the next-size-up,
  // so leaving them means your UI silently got slightly larger/blurrier.
  const TW3_SILENT_RENAMES = ['rounded-sm', 'shadow-sm', 'blur-sm', 'backdrop-blur-sm']
  const v = scanSource((line) => {
    for (const c of TW3_SILENT_RENAMES) {
      const re = new RegExp(`(^|[\\s"'\`:/])${c}(?![\\w-])`)
      if (re.test(line)) return c
    }
    return null
  })
  if (v.length > 0) {
    return `Classes whose visual meaning shifted in TW4 (verify intent; rename to -xs or keep deliberately):\n${v.map((x) => `      ${x}`).join('\n')}`
  }
  return true
})

// ADVISORY — TW3 flex-shrink-*/flex-grow-* (deprecated, use shrink-*/grow-*)
advisory('No TW3 flex-shrink-/flex-grow- (use shrink-/grow- in TW4)', () => {
  const v = scanSource((line) => {
    const m = line.match(/(^|[\s"'`:])(flex-(?:shrink|grow)-[0-9a-z]+)/)
    return m ? m[2] : null
  })
  if (v.length > 0) return `Old flex-shrink/flex-grow syntax:\n${v.map((x) => `      ${x}`).join('\n')}`
  return true
})

// ADVISORY — TW3 leading-! important prefix (TW4 prefers trailing !).
// Still functional; flagged so it gets cleaned up before TW5.
advisory('No TW3 !prefix important (use trailing class! in TW4)', () => {
  const v = scanSource((line) => {
    const m = line.match(/:!(size|p|m|w|h|bg|text|border|shadow|rounded|gap)-[\w-]+/)
    return m ? m[0] : null
  })
  if (v.length > 0) return `Leading-! important syntax:\n${v.map((x) => `      ${x}`).join('\n')}`
  return true
})

// --- v0.37 Council Gates (added 2026-04-19) ---
// These gates were defined by the TW4 migration agent council review.
// Each prevents a silent correctness regression identified in round 2.
console.log('\n\x1b[36mv0.37 Council Gates\x1b[0m')

const corePkg = JSON.parse(readFileSync(join(ROOT, 'packages/core/package.json'), 'utf-8'))

// Gate: framer-motion + sonner in peerDependencies (not bundled as direct dep)
gate('framer-motion is a required peerDependency', () => {
  if (!corePkg.peerDependencies?.['framer-motion']) {
    return 'framer-motion missing from peerDependencies — must be required peer (module-scoped React contexts split when bundled)'
  }
  if (corePkg.dependencies?.['framer-motion']) {
    return 'framer-motion must not be in `dependencies` — it is a peer'
  }
  if (corePkg.peerDependenciesMeta?.['framer-motion']?.optional) {
    return 'framer-motion is REQUIRED (not optional) — remove the optional meta'
  }
  return true
})

gate('sonner is an optional peerDependency', () => {
  if (!corePkg.peerDependencies?.['sonner']) {
    return 'sonner missing from peerDependencies'
  }
  if (corePkg.dependencies?.['sonner']) {
    return 'sonner must not be in `dependencies`'
  }
  if (!corePkg.peerDependenciesMeta?.['sonner']?.optional) {
    return 'sonner must be marked optional in peerDependenciesMeta (consumers without toasts should not be required to install it)'
  }
  return true
})

// Gate: tailwindcss peer tightened to ^4.0.0 only (0.37 drops TW3 support)
gate('tailwindcss peer is ^4.0.0 only', () => {
  const range = corePkg.peerDependencies?.tailwindcss
  if (!range) return 'tailwindcss missing from peerDependencies'
  if (range.includes('^3') || range.includes('3.')) {
    return `tailwindcss peer range is "${range}" — 0.37 ships TW4-native CSS and cannot support TW3 consumers`
  }
  if (!range.startsWith('^4')) {
    return `tailwindcss peer range is "${range}" — expected ^4.x.y`
  }
  return true
})

// Gate: exports types-first ordering — TS silently falls back to .js otherwise
gate('exports types-first ordering (every subpath)', () => {
  const violations = []
  function walk(node, path) {
    if (!node || typeof node !== 'object') return
    // Conditional export block (has `types`/`import`/`default`/etc.)
    const keys = Object.keys(node)
    const isConditional = keys.some((k) => ['types', 'import', 'require', 'default', 'node', 'browser'].includes(k))
    if (isConditional && node.types) {
      if (keys[0] !== 'types') {
        violations.push(`${path} — "types" must be first, got: [${keys.join(', ')}]`)
      }
      return
    }
    // Recurse into sub-exports
    for (const [k, v] of Object.entries(node)) {
      if (typeof v === 'object' && v !== null) walk(v, `${path}${k === '.' ? '' : k}`)
    }
  }
  walk(corePkg.exports, '')
  if (violations.length > 0) {
    return `Exports with wrong conditional ordering:\n${violations.map((v) => `      ${v}`).join('\n')}`
  }
  return true
})

// Gate: every flat src/ui/*.tsx component has a "./ui/<name>" subpath export
// (or is explicitly allowlisted as barrel-only / internal). 0.44.0 shipped
// TruncatedText in dist/ but never added "./ui/truncated-text" to the exports
// map — so `import { TruncatedText } from "@devalok/shilp-sutra/ui/truncated-text"`
// failed to resolve, and the SSR smoke test (which iterates the exports map)
// never caught it. This gate closes that loop: a new component without a
// subpath export now forces an explicit decision — export it or allowlist it.
const SUBPATH_EXEMPT = new Set([
  // Internal sub-parts consumed only through their parent's barrel/subpath:
  'button-processing', // SplitButton/Button loading-state helper
  'stat-flash', // sub-part of StatCard
  'table-row-link', // sub-part of Table (routing-aware row) — consumed via the ui barrel
  // DataTable internals — DataTable itself is barrel-isolated (./ui/data-table):
  'data-table-body',
  'data-table-bulk-actions',
  'data-table-card',
  'data-table-context',
  'data-table-header',
  'data-table-pagination',
])
gate('Every flat src/ui component has a ./ui/<name> subpath export', () => {
  const subpaths = new Set(
    Object.keys(corePkg.exports)
      .filter((k) => /^\.\/ui\/[^/]+$/.test(k))
      .map((k) => k.replace('./ui/', ''))
  )
  const missing = globSync('packages/core/src/ui/*.tsx', { cwd: ROOT })
    .map((f) => basename(f, '.tsx'))
    .filter((name) => !/\.(test|stories)$/.test(name))
    .filter((name) => !subpaths.has(name) && !SUBPATH_EXEMPT.has(name))
    .sort()
  if (missing.length > 0) {
    return (
      `flat src/ui components with no "./ui/<name>" export:\n${missing
        .map((m) => `      ${m} — add "./ui/${m}" to packages/core/package.json#exports`)
        .join('\n')}\n      (or add it to SUBPATH_EXEMPT in scripts/pre-publish-audit.mjs if it is barrel-only/internal)`
    )
  }
  return true
})

// Gate: no `engines.node` (Phase 0 spike succeeded; the floor was leftover)
advisory('No engines.node floor (spike-succeeded state)', () => {
  if (corePkg.engines?.node) {
    return `engines.node = "${corePkg.engines.node}" — if the use-sync-external-store spike succeeded, this is leftover and forces EBADENGINE warnings`
  }
  return true
})

// Gate: MIGRATION.md exists at repo root AND has an entry for the next
// shipped version. "Next shipped" is derived from CHANGELOG's top-most
// entry — that's what's about to publish (and what Changesets Action will
// bump package.json to). Using package.json.version here would be wrong
// during pre-mode, when package.json hasn't been bumped yet.
//
// NB: patch-only releases (e.g. 0.37.1 fixing a 0.37.0 bug) can legitimately
// reuse the 0.37 MIGRATION section — so we check major.minor only, not the
// exact patch string. Major/minor version changes on 0.x signal breaking
// surface that SHOULD get an entry; patches inherit the minor's entry.
gate('MIGRATION.md at repo root has section for target version', () => {
  const path = join(ROOT, 'MIGRATION.md')
  if (!existsSync(path)) return 'MIGRATION.md not found at repo root'
  const targetVersion = clVersion
  if (!targetVersion) return true
  const majorMinor = targetVersion.match(/^(\d+\.\d+)/)?.[1]
  if (!majorMinor) return true
  const content = readFileSync(path, 'utf-8')
  if (!content.includes(`v${majorMinor}`)) {
    return `MIGRATION.md has no section matching v${majorMinor} (CHANGELOG target is ${targetVersion})`
  }
  return true
})

// Gate: README setup section has no TW3 preset residue
gate('README has no TW3 `presets: [shilpSutra]` residue', () => {
  const readmePaths = [join(ROOT, 'README.md'), join(ROOT, 'packages/core/README.md')]
  for (const p of readmePaths) {
    if (!existsSync(p)) continue
    const content = readFileSync(p, 'utf-8')
    if (/presets:\s*\[\s*shilpSutra\s*\]/.test(content)) {
      return `${p} still shows TW3-era \`presets: [shilpSutra]\` — TW4 CSS-first uses \`@import "@devalok/shilp-sutra/css"\``
    }
  }
  return true
})

// Gate: dist contains zero Node-builtin imports (Phase 0 acceptance)
gate('dist has zero `from "module"` / `require("module")` imports', () => {
  const distFiles = globSync('packages/core/dist/**/*.js', { cwd: ROOT })
  const offenders = []
  for (const f of distFiles) {
    const content = readFileSync(join(ROOT, f), 'utf-8')
    if (/from\s+['"]module['"]/.test(content) || /require\(\s*['"]module['"]\s*\)/.test(content) || /createRequire\s*\(/.test(content)) {
      offenders.push(f)
    }
  }
  if (offenders.length > 0) {
    return `Node-builtin import leaked into dist (breaks Turbopack):\n${offenders.map((f) => `      ${f}`).join('\n')}`
  }
  return true
})

// Gate: bare `shadow` class does not appear as a standalone class token in
// source string literals. TW4 dropped the default shadow scale — bare `shadow`
// silently compiles to nothing unless `--shadow` (unsuffixed) is defined in
// @theme. We don't define it, so any bare `shadow` loses its visual effect.
//
// Detection: extract string literals, split on whitespace, strip TW4 variant
// prefixes (`hover:`, `group-data-[…]:`, etc.), check terminal class == 'shadow'.
// Correctly ignores comments, compound classes (`transition-shadow`,
// `box-shadow`), and substring matches.
gate('No bare `shadow` class in className strings', () => {
  const v = scanSource((line) => {
    if (/^\s*\*/.test(line) || /^\s*\/\//.test(line)) return null
    const literals = line.matchAll(/(['"`])((?:\\.|(?!\1)[^\\])*)\1/g)
    for (const m of literals) {
      const body = m[2]
      for (const token of body.split(/\s+/)) {
        if (!token) continue
        const terminal = token.replace(/^(?:[a-zA-Z0-9-]+(?:\[[^\]]*\])?:)+/, '')
        if (terminal === 'shadow') return 'bare `shadow` token'
      }
    }
    return null
  })
  if (v.length > 0) {
    return `Bare \`shadow\` class will silently drop in TW4 (no default scale). Use \`shadow-raised\`, \`shadow-overlay\`, etc.:\n${v.map((x) => `      ${x}`).join('\n')}`
  }
  return true
})

// Gate: Next 15 + Webpack smoke variant exists (wired in release.yml as second smoke)
advisory('Next 15 + Webpack smoke variant exists', () => {
  const next15Dir = join(ROOT, 'tests/smoke-consumer-next15')
  if (!existsSync(next15Dir)) {
    return 'tests/smoke-consumer-next15/ does not exist — Next 15 + Webpack consumers have no CI coverage'
  }
  return true
})

// Gate: ./tailwind export must not exist (removed in 0.38.0).
gate('./tailwind preset export removed (v0.38.0)', () => {
  const presetPath = join(ROOT, 'packages/core/src/tailwind/preset.ts')
  if (existsSync(presetPath)) return 'packages/core/src/tailwind/preset.ts still exists — remove it (removed in 0.38.0)'
  return true
})

// Gate: Agent Skill references in sync with source files (llms.txt, recipes/*).
// build-skill.mjs --check exits non-zero if any file under skills/shilp-sutra/references/
// or the bundled LICENSE drifts from the source of truth.
// Hardcoded command — no user input, safe to use execSync.
gate('Agent Skill references in sync with source', () => {
  try {
    execSync('node scripts/build-skill.mjs --check', { cwd: ROOT, stdio: 'pipe' })
    return true
  } catch (e) {
    const out = (e.stdout?.toString() || '') + (e.stderr?.toString() || '')
    return `skills/shilp-sutra/references/ is out of date. Run: node scripts/build-skill.mjs\n${out.trim()}`
  }
})

// Gate: SKILL.md spec compliance (name matches dir, description length, body length).
// Spec: https://agentskills.io/specification
gate('SKILL.md follows agentskills.io spec', () => {
  const skillPath = join(ROOT, 'skills/shilp-sutra/SKILL.md')
  if (!existsSync(skillPath)) return 'skills/shilp-sutra/SKILL.md missing'
  // Normalize CRLF → LF so the frontmatter regex (^---\n) matches on a
  // Windows checkout too. Without this the gate false-fails locally on Windows
  // (the file is byte-identical, only line endings differ); CI on Linux passed.
  const content = readFileSync(skillPath, 'utf-8').replace(/\r\n/g, '\n')
  const fmMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)
  if (!fmMatch) return 'SKILL.md has no YAML frontmatter'
  const [, frontmatter, body] = fmMatch

  const nameMatch = frontmatter.match(/^name:\s*(\S+)\s*$/m)
  if (!nameMatch) return 'frontmatter missing required `name` field'
  const name = nameMatch[1]
  if (name !== 'shilp-sutra') return `name must equal directory name (got "${name}", expected "shilp-sutra")`
  if (!/^[a-z0-9](?:[a-z0-9-]{0,62}[a-z0-9])?$/.test(name)) return `name "${name}" violates spec (lowercase + hyphens, no leading/trailing hyphen, max 64)`
  if (name.includes('--')) return `name "${name}" contains consecutive hyphens`

  const descMatch = frontmatter.match(/^description:\s*([\s\S]+?)(?=\n[a-z][a-z-]*:|\n---|$)/m)
  if (!descMatch) return 'frontmatter missing required `description` field'
  const desc = descMatch[1].trim()
  if (desc.length === 0) return 'description is empty'
  if (desc.length > 1024) return `description is ${desc.length} chars (max 1024 per spec)`

  const bodyLines = body.split('\n').length
  if (bodyLines > 500) return `SKILL.md body is ${bodyLines} lines (>500 risks context bloat per spec guidance)`

  return true
})

// Gate: SKILL.md `metadata.version` MUST equal packages/core/package.json#version.
// Drift means consumers see a skill that claims to describe an older package
// version than the one they actually installed. Caught manually 2026-05-25 when
// 0.39.0 shipped with skill still at 0.38.0. `pnpm version-packages` chains
// `node scripts/sync-skill-version.mjs` to keep them aligned.
gate('skill/SKILL.md metadata.version matches packages/core/package.json#version', () => {
  const skillPaths = [
    join(ROOT, 'skills/shilp-sutra/SKILL.md'),
    join(ROOT, 'packages/core/skill/SKILL.md'),
  ]
  const pkgVersion = coreVersion
  for (const p of skillPaths) {
    if (!existsSync(p)) continue
    const content = readFileSync(p, 'utf-8')
    const m = content.match(/^\s*version:\s*["']([^"']+)["']/m)
    if (!m) return `${p.replace(ROOT, '').replace(/\\/g, '/')}: metadata.version not found in frontmatter`
    if (m[1] !== pkgVersion) {
      return `${p.replace(ROOT, '').replace(/\\/g, '/')}: metadata.version is "${m[1]}", expected "${pkgVersion}". Bump in skills/shilp-sutra/SKILL.md and rerun \`node scripts/build-skill.mjs\` (post-build copies into packages/core/skill/).`
    }
  }
  return true
})

// Gate: Icon API discipline. Every component that exposes an `icon`-shaped
// prop (icon, startIcon, endIcon, leftIcon, rightIcon) must route through
// the normalize-icon helper to participate in IconProvider context. Wave 5
// F-10 unified the API; this gate catches regressions where a new
// component lands with the old raw-render pattern.
//
// Allowlist exists for components where the icon is internal-config-only
// (Toast's per-type icon table) or where the value is forwarded to a child
// component whose own call to normalize-icon covers it.
gate('Icon-prop components import normalize-icon', () => {
  const ALLOWLIST = new Set([
    'src/ui/toast.tsx',                  // sonner pass-through; internal config, not consumer prop
    'src/ui/icon.tsx',                   // the Icon component itself
    'src/ui/icon-button.tsx',            // routes through Button's normalize
    'src/ui/tree-view/use-tree.ts',      // type-only TreeNode export, no render here
    'src/composed/extensions/slash-command.tsx',  // tiptap extension, internal
    'src/composed/error-boundary.tsx',   // internal Tabler refs in config
    'src/composed/priority-indicator.tsx',  // internal Tabler refs in PRIORITY_CONFIG dict
    'src/composed/rich-chat-input.tsx',  // ChatToolbarItem.icon — tiptap toolbar shape, ComponentType<{className}> by design
    'src/composed/bulk-action-bar.tsx',  // forwards action.icon to Button.startIcon which does normalize
    'src/composed/activity-feed.tsx',    // vestigial type, no render
    'src/shell/command-registry.tsx',    // type-only export, no render path here
    'src/shell/app-command-palette.tsx', // forwards SearchResult.icon to CommandPalette which normalizes
    'src/ai/ai-command-provider.tsx',    // type-only, forwards to conversation
  ])

  const ICON_PROP_PATTERN = /^\s*(icon|startIcon|endIcon|leftIcon|rightIcon)\??:/m

  const candidates = []
  for (const layer of ['ui', 'composed', 'shell', 'ai']) {
    const dir = join(ROOT, 'packages/core/src', layer)
    if (!existsSync(dir)) continue
    const files = globSync(`${dir}/**/*.{ts,tsx}`)
    for (const fullPath of files) {
      const rel = fullPath.replace(/\\/g, '/').split('/packages/core/')[1]
      if (!rel) continue
      if (rel.includes('.test.') || rel.includes('.stories.') || rel.includes('/__tests__/')) continue

      const source = readFileSync(fullPath, 'utf-8')
      if (!ICON_PROP_PATTERN.test(source)) continue

      const usesNormalize = source.includes('normalize-icon')
      if (usesNormalize) continue
      if (ALLOWLIST.has(rel)) continue

      candidates.push(rel)
    }
  }

  if (candidates.length === 0) return true
  return (
    `${candidates.length} component(s) declare an icon-shaped prop but do not import normalize-icon:\n` +
    candidates.map((c) => `       ${c}`).join('\n') +
    `\n     If the icon is consumer-facing, route it through normalize-icon + IconProvider. ` +
    `If it's internal-config-only, add the path to ALLOWLIST in scripts/pre-publish-audit.mjs.`
  )
})

// Gate: router llms.txt exists and stays a router — ≤3.5K tokens. Replaced the
// llms-quick.txt cap when llms-quick/llms-full were removed in 0.45. The
// router's whole value is being cheap to load in every agent context; if it
// grows, deep content is leaking back in — move it behind the MCP manifest.
gate('llms.txt (router) ≤ 3.5K tokens', () => {
  const router = join(ROOT, 'packages/core/llms.txt')
  if (!existsSync(router)) return 'packages/core/llms.txt missing — run node scripts/build-mcp-manifest.mjs'
  const content = readFileSync(router, 'utf-8')
  const approxTokens = Math.ceil(content.length / 4)
  if (approxTokens > 3500) {
    return `llms.txt is ~${approxTokens} tokens. Router cap is 3.5K — deep content belongs in per-component docs / mcp-manifest.json, not the router.`
  }
  return true
})

// Gate: mcp-manifest.json parses, validates structurally, and is stamped with
// the current package version. Catches the recurring "version bumped but
// stamped docs not regenerated" failure (bit 0.39 + 0.40 with llms-full.txt).
// --check re-parses all component docs + token CSS and exits non-zero on any
// structural violation (missing fields, bad tier, invalid composition relation).
gate('mcp-manifest.json valid + stamped with current version', () => {
  const manifestPath = join(ROOT, 'packages/core/mcp-manifest.json')
  if (!existsSync(manifestPath)) return 'packages/core/mcp-manifest.json missing — run node scripts/build-mcp-manifest.mjs'
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'))
  const coreVersion = getPackageVersion('core')
  if (manifest.packageVersion !== coreVersion) {
    return `mcp-manifest.json stamped ${manifest.packageVersion}, package.json is ${coreVersion} — regenerate: node scripts/build-mcp-manifest.mjs`
  }
  try {
    execSync('node scripts/build-mcp-manifest.mjs --check', {
      cwd: join(ROOT, 'packages/core'),
      encoding: 'utf-8',
      stdio: 'pipe',
    })
    return true
  } catch (e) {
    return e.stdout?.trim() || e.stderr?.trim() || 'build-mcp-manifest --check failed'
  }
})

// Advisory: composition tagging coverage. The AI-focused doc switch (0.45)
// converts prose Composability bullets to tagged form (**Part:**, **Composes:**,
// etc.) so composition serves as structured data. Track progress; flip to a
// hard gate once conversion completes.
advisory('Composition tagging coverage', () => {
  const manifest = JSON.parse(readFileSync(join(ROOT, 'packages/core/mcp-manifest.json'), 'utf-8'))
  const entries = Object.entries(manifest.components)
  const untagged = entries.filter(([, c]) => {
    const keys = Object.keys(c.composition ?? {})
    return keys.length === 0 || (keys.length === 1 && keys[0] === 'notes')
  })
  if (untagged.length > 0) {
    return `${untagged.length}/${entries.length} components have no structured composition data (notes-only or empty)`
  }
  return true
})

// Gate: BREAKING.json manifest validates + a current-version with a breaking
// CHANGELOG signal has a corresponding manifest entry. Mirrors the
// /publish-release narrowing-is-breaking checklist with tooling teeth — if a
// `feat!` lands without structured manifest data, AI agents and migration
// tooling can't answer "what breaks" programmatically.
gate('BREAKING.json manifest valid + complete for current version', () => {
  const r = validateBreakingManifest()
  if (r.ok) return true
  return r.errors.map((e) => `       ${e}`).join('\n').replace(/^ +/, '')
})

// --- New Gates (added by ecosystem audit 2026-04-06) ---
console.log('\n\x1b[36mComponent Hygiene\x1b[0m')

// Gate: Stories existence check (advisory — some internals legitimately lack stories)
advisory('Components have Storybook stories', () => {
  const STORY_EXEMPT = new Set([
    'icon-context', 'link-context', 'command-registry', 'ai-command-provider',
    'button-processing', 'lib/utils', 'lib/motion', 'lib/date-utils', 'lib/link-context',
    'lib/string-utils', 'types', 'toast-types',
    // Internal DataTable sub-components (covered by DataTable stories)
    'data-table-body', 'data-table-bulk-actions', 'data-table-card',
    'data-table-context', 'data-table-header', 'data-table-pagination',
  ])
  const missing = []
  const layers = ['ui', 'composed', 'shell', 'ai']
  for (const layer of layers) {
    const srcDir = join(ROOT, 'packages/core/src', layer)
    let files
    try { files = readdirSync(srcDir) } catch { continue }
    for (const f of files) {
      if (!f.endsWith('.tsx')) continue
      if (f.includes('.test.') || f.includes('.stories.') || f.startsWith('_')) continue
      const name = f.replace(/\.tsx$/, '')
      if (STORY_EXEMPT.has(name)) continue
      const storyPath = join(srcDir, `${name}.stories.tsx`)
      if (!existsSync(storyPath)) missing.push(`${layer}/${name}`)
    }
  }
  if (missing.length > 0) return `${missing.length} components missing stories:\n${missing.map(m => `      ${m}`).join('\n')}`
  return true
})

// Gate: Brand package version matches CHANGELOG
advisory('Brand version matches CHANGELOG', () => {
  try {
    const brandVersion = getPackageVersion('brand')
    const brandCLVersion = getChangelogLatestVersion('brand')
    if (!brandCLVersion) return true // No brand CHANGELOG — acceptable
    if (brandVersion !== brandCLVersion) return `Brand ${brandVersion} vs CHANGELOG ${brandCLVersion}`
    return true
  } catch {
    return true // Brand package may not exist
  }
})

// Gate: Bundle size tracking (informational)
advisory('Bundle size tracking', () => {
  try {
    const distDir = join(ROOT, 'packages/core/dist')
    let totalSize = 0
    const walkSize = (dir) => {
      for (const entry of readdirSync(dir)) {
        const full = join(dir, entry)
        const stat = statSync(full)
        if (stat.isDirectory()) walkSize(full)
        else totalSize += stat.size
      }
    }
    walkSize(distDir)
    console.log(`    dist/ total: ${(totalSize / 1024).toFixed(0)} KB`)
    return true
  } catch {
    return 'Could not measure dist/ size'
  }
})

// --- Advisory ---
console.log('\n\x1b[36mAdvisory\x1b[0m')

advisory('llms.txt updated', () => {
  const lastTag = getLastTag()
  if (!lastTag) return true
  const llmsChanged = run(`git diff ${lastTag}..HEAD --name-only -- packages/core/llms.txt`)
  if (!llmsChanged) return 'llms.txt has not been modified since last tag'
  return true
})

// --- Summary ---
console.log('\n' + '─'.repeat(50))
if (skipped > 0) {
  console.log(`\n\x1b[90m∅ ${skipped} redundant gate(s) skipped\x1b[0m (SS_AUDIT_SKIP_REDUNDANT=1 — already run as CI steps).`)
}
if (failures > 0) {
  console.log(`\n\x1b[31m✗ ${failures} gate(s) FAILED\x1b[0m — fix all failures before publishing.`)
  if (warnings > 0) console.log(`\x1b[33m⚠ ${warnings} warning(s)\x1b[0m`)
  process.exit(1)
} else {
  console.log(`\n\x1b[32m✓ All gates passed\x1b[0m`)
  if (warnings > 0) console.log(`\x1b[33m⚠ ${warnings} warning(s) — review before publishing\x1b[0m`)
  process.exit(0)
}
