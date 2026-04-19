#!/usr/bin/env node

/**
 * Consumer Smoke Test
 *
 * Packs @devalok/shilp-sutra, installs the tarball into a throwaway
 * Next.js 16 + TW4 + Turbopack consumer (tests/smoke-consumer), and runs
 * `next build --turbopack`. Fails loudly on any Turbopack / PostCSS error
 * that references the design system.
 *
 * Wired into scripts/pre-publish-audit.mjs as a HARD gate — no publish
 * without this passing. Exists because typecheck / lint / unit tests /
 * SSR smoke do not exercise Turbopack's class-name + module resolution,
 * and that's where the last three release regressions slipped through.
 */

import { existsSync, readdirSync, rmSync, statSync, unlinkSync } from 'fs'
import { readFileSync } from 'fs'
import { execFileSync, spawnSync } from 'child_process'
import { join, resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const CORE = join(ROOT, 'packages/core')
const CONSUMER = join(ROOT, 'tests/smoke-consumer')

const GREEN = '\x1b[32m'
const RED = '\x1b[31m'
const YELLOW = '\x1b[33m'
const CYAN = '\x1b[36m'
const BOLD = '\x1b[1m'
const RESET = '\x1b[0m'

function step(label) {
  console.log(`\n${CYAN}▶ ${label}${RESET}`)
}

function fail(msg, extra) {
  console.error(`\n${RED}${BOLD}✗ FAIL:${RESET} ${msg}`)
  if (extra) console.error(extra)
  process.exit(1)
}

function pass(msg) {
  console.log(`${GREEN}✓${RESET} ${msg}`)
}

function warn(msg) {
  console.log(`${YELLOW}⚠${RESET} ${msg}`)
}

function run(cmd, args, opts = {}) {
  const res = spawnSync(cmd, args, {
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: process.platform === 'win32',
    ...opts,
  })
  return {
    status: res.status ?? -1,
    stdout: res.stdout?.toString('utf8') ?? '',
    stderr: res.stderr?.toString('utf8') ?? '',
  }
}

// ── Preflight: smoke consumer fixture exists ────────────────────────────

if (!existsSync(CONSUMER)) {
  fail(`Smoke consumer fixture not found at ${CONSUMER}. This script is useless without it.`)
}

// ── Step 1: Build core ──────────────────────────────────────────────────

step('Building @devalok/shilp-sutra (fresh)')
const build = run('pnpm', ['--filter', '@devalok/shilp-sutra', 'build'], { cwd: ROOT })
if (build.status !== 0) {
  fail('Core build failed.', build.stderr || build.stdout)
}
pass('Core built')

// ── Step 2: Remove any stale tarball, pack, rename to stable name ──────

step('Packing core into tarball')
// Remove any existing tgz in the consumer dir
for (const f of readdirSync(CONSUMER).filter((n) => n.endsWith('.tgz'))) {
  unlinkSync(join(CONSUMER, f))
}
// pnpm pack doesn't accept --filter; run from the package's cwd directly.
const pack = run('pnpm', ['pack', '--pack-destination', CONSUMER], { cwd: CORE })
if (pack.status !== 0) {
  fail('pnpm pack failed', pack.stderr || pack.stdout)
}
// Find the emitted tarball (name includes the version) and rename to the
// stable path that package.json references.
const tgz = readdirSync(CONSUMER).find((n) => n.startsWith('devalok-shilp-sutra-') && n.endsWith('.tgz'))
if (!tgz) {
  fail(`Could not find tarball in ${CONSUMER} after pack`, readdirSync(CONSUMER).join('\n'))
}
const stable = join(CONSUMER, 'shilp-sutra.tgz')
if (existsSync(stable)) unlinkSync(stable)
// Rename (copy on Windows if rename fails)
try {
  execFileSync('node', ['-e', `require('fs').renameSync(${JSON.stringify(join(CONSUMER, tgz))}, ${JSON.stringify(stable)})`])
} catch (e) {
  fail('Could not rename tarball to stable name', e.message)
}
const tgzBytes = statSync(stable).size
pass(`Packed: shilp-sutra.tgz (${Math.round(tgzBytes / 1024)} KB)`)

// ── Step 3: Clean + reinstall smoke consumer ───────────────────────────

step('Installing smoke consumer against the packed tarball')
const nodeModules = join(CONSUMER, 'node_modules')
const nextCache = join(CONSUMER, '.next')
if (existsSync(nodeModules)) rmSync(nodeModules, { recursive: true, force: true })
if (existsSync(nextCache)) rmSync(nextCache, { recursive: true, force: true })
// Remove lockfile too — force pnpm to resolve fresh against the new tarball hash
const lockfile = join(CONSUMER, 'pnpm-lock.yaml')
if (existsSync(lockfile)) unlinkSync(lockfile)
const install = run('pnpm', ['install', '--ignore-workspace'], { cwd: CONSUMER })
if (install.status !== 0) {
  fail('pnpm install failed in smoke-consumer', install.stderr || install.stdout)
}
pass('Consumer installed')

// ── Step 4: next build --turbopack ─────────────────────────────────────

step('Running next build (Turbopack)')
const next = run('pnpm', ['run', 'build'], { cwd: CONSUMER })
const combined = (next.stdout || '') + '\n' + (next.stderr || '')
// Save full log for inspection
const logPath = join(CONSUMER, 'smoke-test.log')
try {
  execFileSync('node', ['-e', `require('fs').writeFileSync(${JSON.stringify(logPath)}, ${JSON.stringify(combined)})`])
} catch {}

// ── Step 5: Evaluate ──────────────────────────────────────────────────

// Hard failures: non-zero exit from next build
if (next.status !== 0) {
  console.error(combined)
  fail(`next build exited with status ${next.status}. See ${logPath}`)
}

// Soft failures: patterns that indicate a real bug even if build "succeeded"
const RED_FLAGS = [
  // Module resolution failures
  { pattern: /Cannot find module '[^']+'/g, label: 'Cannot find module' },
  { pattern: /Module not found/gi, label: 'Module not found' },
  // Invalid CSS from class-name codemod leftovers
  { pattern: /Parsing CSS source code failed/gi, label: 'Parsing CSS source code failed' },
  { pattern: /No qualified name in attribute selector/gi, label: 'Malformed CSS selector (TW3 arbitrary variant in TW4)' },
  // Unresolvable theme() calls
  { pattern: /theme\(\) is not supported|Cannot resolve theme\(/gi, label: 'theme() not supported in TW4' },
  // React dev-mode warnings about missing keys (pointing at our components)
  { pattern: /Each child in a list should have a unique "key" prop.*[Ss]hilp[- ][Ss]utra/g, label: 'React missing-key warning from shilp-sutra' },
  // Element type invalid (dangling exports)
  { pattern: /Element type is invalid[^.]*got: undefined/gi, label: 'Element type invalid (undefined export)' },
  // Turbopack / Next specific failure hints
  { pattern: /Failed to compile/gi, label: 'Turbopack failed to compile' },
]

const hits = []
for (const { pattern, label } of RED_FLAGS) {
  const matches = combined.match(pattern)
  if (matches) {
    hits.push({ label, count: matches.length, samples: matches.slice(0, 3) })
  }
}

if (hits.length > 0) {
  console.error(`\n${RED}${BOLD}✗ Consumer smoke test caught ${hits.length} issue class(es):${RESET}\n`)
  for (const h of hits) {
    console.error(`  ${RED}• ${h.label}${RESET} (${h.count})`)
    for (const s of h.samples) console.error(`      ${s.split('\n')[0].slice(0, 200)}`)
  }
  console.error(`\nFull log: ${logPath}`)
  process.exit(1)
}

// If next build succeeded and no red flags hit: pass
pass('next build (Turbopack) completed without errors or known regressions')
console.log(`\n${GREEN}${BOLD}✓ Consumer smoke test passed${RESET}`)
console.log(`   Full build log: ${logPath}`)
