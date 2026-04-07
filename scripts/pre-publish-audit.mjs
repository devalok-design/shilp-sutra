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
import { join, resolve } from 'path'
import { globSync } from 'node:fs'

const ROOT = resolve(import.meta.dirname, '..')
const PASS = '\x1b[32m✓\x1b[0m'
const FAIL = '\x1b[31m✗\x1b[0m'
const WARN = '\x1b[33m⚠\x1b[0m'

let failures = 0
let warnings = 0

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

function getChangelogLatestVersion() {
  const cl = readFileSync(join(ROOT, 'CHANGELOG.md'), 'utf-8')
  const match = cl.match(/^## \[(\d+\.\d+\.\d+)\]/m)
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

gate('Working tree is clean', () => {
  const status = run('git status --porcelain')
  if (status) return `Uncommitted changes:\n${status.split('\n').map(l => `      ${l}`).join('\n')}`
  return true
})

// --- Version Consistency ---
console.log('\n\x1b[36mVersion Consistency\x1b[0m')

const coreVersion = getPackageVersion('core')
const clVersion = getChangelogLatestVersion()

gate(`Core version (${coreVersion}) matches CHANGELOG (${clVersion})`, () => {
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

// --- Code Quality ---
console.log('\n\x1b[36mCode Quality\x1b[0m')

gate('Typecheck passes', () => {
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

gate('Core tests pass', () => {
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

gate('Build succeeds', () => {
  try {
    execSync('pnpm build', { cwd: ROOT, encoding: 'utf-8', stdio: 'pipe', timeout: 300000 })
    return true
  } catch {
    return 'Build failed — run pnpm build for details'
  }
})

gate('SSR smoke test passes (no browser API crashes in Node.js)', () => {
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
    const brandCL = readFileSync(join(ROOT, 'CHANGELOG.md'), 'utf-8')
    const brandMatch = brandCL.match(/## \[(\d+\.\d+\.\d+)\].*brand/i)
    if (!brandMatch) return true // No brand entry — acceptable
    if (brandVersion !== brandMatch[1]) return `Brand ${brandVersion} vs CHANGELOG ${brandMatch[1]}`
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
if (failures > 0) {
  console.log(`\n\x1b[31m✗ ${failures} gate(s) FAILED\x1b[0m — fix all failures before publishing.`)
  if (warnings > 0) console.log(`\x1b[33m⚠ ${warnings} warning(s)\x1b[0m`)
  process.exit(1)
} else {
  console.log(`\n\x1b[32m✓ All gates passed\x1b[0m`)
  if (warnings > 0) console.log(`\x1b[33m⚠ ${warnings} warning(s) — review before publishing\x1b[0m`)
  process.exit(0)
}
