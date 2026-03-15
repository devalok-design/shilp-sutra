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
import { readFileSync, existsSync } from 'fs'
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

// Files that legitimately use bg-surface-1
const SURFACE1_ALLOWLIST = [
  // Overlays & floating elements
  'dialog.tsx', 'alert-dialog.tsx', 'sheet.tsx', 'popover.tsx',
  'dropdown-menu.tsx', 'context-menu.tsx', 'select.tsx', 'combobox.tsx',
  'hover-card.tsx', 'navigation-menu.tsx', 'toast.tsx', 'menubar.tsx',
  'autocomplete.tsx',
  // Shell chrome
  'sidebar.tsx', 'top-bar.tsx', 'notification-center.tsx', 'client-portal-header.tsx',
  // Sticky headers (need page bg match)
  'data-table.tsx',
  // Input controls & pickers
  'color-input.tsx', 'date-picker.tsx', 'date-time-picker.tsx',
  'date-range-picker.tsx', 'time-picker.tsx', 'slider.tsx',
  'segmented-control.tsx', 'tabs.tsx',
  // Rich text floating UI
  'mention-suggestion.tsx', 'emoji-suggestion.tsx', 'rich-text-editor.tsx',
  // Components where surface-1 is intentional (pills, badges over timeline)
  'activity-feed.tsx', 'activity-entry.tsx', 'avatar-group.tsx',
  'member-picker.tsx', 'command-palette.tsx',
  // Karm pickers (floating popovers)
  'task-properties.tsx', 'task-priority-picker.tsx', 'task-column-picker.tsx',
  'task-label-editor.tsx', 'task-date-picker.tsx', 'task-visibility-picker.tsx',
  // Karm panel sticky header
  'task-detail-panel.tsx',
  // Admin pickers/dropdowns
  'edit-break.tsx', 'edit-break-balance.tsx', 'header.tsx',
  'leave-request.tsx', 'correction-list.tsx', 'dashboard-header.tsx',
  // Board card avatar badge (floating checkbox on card)
  'task-card.tsx',
  // Chart tooltip (floating overlay)
  'tooltip.tsx',
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
const karmVersion = getPackageVersion('karm')
const clVersion = getChangelogLatestVersion()

gate(`Core version (${coreVersion}) or Karm version (${karmVersion}) matches CHANGELOG (${clVersion})`, () => {
  return coreVersion === clVersion || karmVersion === clVersion || `CHANGELOG latest is ${clVersion}`
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
  try {
    execSync('pnpm vitest run --reporter=dot', {
      cwd: join(ROOT, 'packages/core'),
      encoding: 'utf-8',
      stdio: 'pipe',
      timeout: 300000,
    })
    return true
  } catch (e) {
    const failMatch = e.stdout?.match(/(\d+) failed/)
    return failMatch ? `${failMatch[1]} tests failed` : 'Tests failed'
  }
})

gate('Karm tests pass', () => {
  try {
    execSync('pnpm vitest run --reporter=dot', {
      cwd: join(ROOT, 'packages/karm'),
      encoding: 'utf-8',
      stdio: 'pipe',
      timeout: 300000,
    })
    return true
  } catch (e) {
    const failMatch = e.stdout?.match(/(\d+) failed/)
    return failMatch ? `${failMatch[1]} tests failed` : 'Tests failed'
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

// --- Source Hygiene ---
console.log('\n\x1b[36mSource Hygiene\x1b[0m')

gate('No stale .js files in core/src/ui/', () => {
  const jsFiles = globSync('packages/core/src/ui/**/*.js', { cwd: ROOT })
  if (jsFiles.length > 0) return `Found ${jsFiles.length} stale .js files:\n${jsFiles.map(f => `      ${f}`).join('\n')}`
  return true
})

gate('No bg-surface-1 on component cards/widgets', () => {
  const violations = []
  const sourceFiles = [
    ...globSync('packages/core/src/**/*.tsx', { cwd: ROOT }),
    ...globSync('packages/karm/src/**/*.tsx', { cwd: ROOT }),
  ]

  for (const file of sourceFiles) {
    // Normalize to forward slashes for cross-platform basename extraction
    const normalized = file.replace(/\\/g, '/')
    const basename = normalized.substring(normalized.lastIndexOf('/') + 1)
    // Skip allowlisted files, stories, and test files
    if (SURFACE1_ALLOWLIST.some(a => basename === a) || normalized.includes('.stories.') || normalized.includes('__tests__')) continue

    const content = readFileSync(join(ROOT, file), 'utf-8')
    if (content.includes('bg-surface-1')) {
      const lines = content.split('\n')
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('bg-surface-1')) {
          violations.push(`${file}:${i + 1}`)
        }
      }
    }
  }

  if (violations.length > 0) {
    return `bg-surface-1 found on non-allowlisted files:\n${violations.map(v => `      ${v}`).join('\n')}\n      If legitimate, add filename to SURFACE1_ALLOWLIST in scripts/pre-publish-audit.mjs`
  }
  return true
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
