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

import { existsSync, readdirSync, rmSync, statSync, unlinkSync, writeFileSync } from 'fs'
import { readFileSync } from 'fs'
import { execFileSync, spawnSync } from 'child_process'
import { join, resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const CORE = join(ROOT, 'packages/core')

// Variant selection — default Next 16 + Turbopack, or pass `--variant next15-webpack`
// for the Next 15 + Webpack fixture. Added in 0.37 to cover both current bundler
// realities (council review called out Webpack-only consumers as untested).
const variantArg = process.argv.find((a) => a.startsWith('--variant='))?.split('=')[1]
  ?? (process.argv.includes('--variant')
    ? process.argv[process.argv.indexOf('--variant') + 1]
    : null)
const VARIANT = variantArg ?? 'default'
const CONSUMER_DIR = VARIANT === 'next15-webpack' ? 'tests/smoke-consumer-next15' : 'tests/smoke-consumer'
const CONSUMER = join(ROOT, CONSUMER_DIR)
const VARIANT_LABEL = VARIANT === 'next15-webpack' ? 'Next 15 + Webpack' : 'Next 16 + Turbopack'

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

console.log(`${CYAN}${BOLD}Consumer smoke — ${VARIANT_LABEL}${RESET}`)

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

step(`Running next build (${VARIANT_LABEL})`)
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

pass(`next build (${VARIANT_LABEL}) completed without errors or known regressions`)

// ── Step 5: type-resolution matrix ─────────────────────────────────────
//
// `next build` type-checks with the consumer's own tsconfig, which sets
// `skipLibCheck: true` — the setting that suppresses every error originating
// INSIDE a dependency's .d.ts. That blind spot let 0.54.0 ship 209 declaration
// files carrying a `"use client"` prologue (TS1036), 8 with undeclared type
// imports (TS2307), and 234 extensionless relative specifiers (TS2834/2835).
// A consumer barrel import produced 78 errors; every gate we had stayed green.
//
// So type-check the SAME installed consumer across the axes that actually
// change the answer: module resolution (`bundler` vs `nodenext`) × whether
// declaration files are checked at all. Only `skipLibCheck: false` can see our
// .d.ts, and only `nodenext` enforces explicit extensions.
//
// Errors are filtered to our own package plus the consumer's source — an
// unrelated dependency shipping bad types is not our release blocker.

step('Type-resolution matrix (bundler|nodenext × skipLibCheck on|off)')

const MATRIX = [
  { moduleResolution: 'bundler', module: 'ESNext', skipLibCheck: true },
  { moduleResolution: 'bundler', module: 'ESNext', skipLibCheck: false },
  { moduleResolution: 'nodenext', module: 'NodeNext', skipLibCheck: true },
  { moduleResolution: 'nodenext', module: 'NodeNext', skipLibCheck: false },
]

const matrixFailures = []

for (const cfg of MATRIX) {
  const label = `${cfg.moduleResolution} + skipLibCheck:${cfg.skipLibCheck}`
  const tsconfigPath = join(CONSUMER, `tsconfig.matrix.json`)
  writeFileSync(
    tsconfigPath,
    JSON.stringify(
      {
        compilerOptions: {
          target: 'ES2022',
          lib: ['ES2022', 'DOM', 'DOM.Iterable'],
          module: cfg.module,
          moduleResolution: cfg.moduleResolution,
          jsx: 'react-jsx',
          strict: true,
          skipLibCheck: cfg.skipLibCheck,
          noEmit: true,
          esModuleInterop: true,
          allowSyntheticDefaultImports: true,
        },
        include: ['app/**/*.ts', 'app/**/*.tsx'],
      },
      null,
      2
    )
  )

  // Invoke the consumer's own tsc entry directly. Going through `npx` would
  // need shell:true on Windows, which concatenates argv unescaped (DEP0190).
  const tscBin = join(CONSUMER, 'node_modules', 'typescript', 'bin', 'tsc')
  const tsc = run('node', [tscBin, '-p', 'tsconfig.matrix.json'], {
    cwd: CONSUMER,
    shell: false,
  })
  const out = (tsc.stdout || '') + '\n' + (tsc.stderr || '')
  const ours = out
    .split('\n')
    .filter((l) => /error TS\d+/.test(l))
    .filter((l) => l.includes('@devalok/shilp-sutra') || l.startsWith('app'))

  if (ours.length) {
    matrixFailures.push({ label, errors: ours })
    console.error(`  ${RED}✗ ${label} — ${ours.length} error(s)${RESET}`)
  } else {
    console.log(`  ${GREEN}✓${RESET} ${label}`)
  }
  if (existsSync(tsconfigPath)) unlinkSync(tsconfigPath)
}

if (matrixFailures.length) {
  console.error(`\n${RED}${BOLD}✗ Type-resolution matrix failed${RESET}\n`)
  for (const f of matrixFailures) {
    console.error(`  ${RED}• ${f.label}${RESET}`)
    for (const e of f.errors.slice(0, 8)) console.error(`      ${e.slice(0, 220)}`)
    if (f.errors.length > 8) console.error(`      … and ${f.errors.length - 8} more`)
  }
  console.error(
    `\nThese are errors a consumer sees from OUR declaration files.\n` +
      `Run \`node scripts/audit-dts.mjs\` for a precise breakdown.`
  )
  process.exit(1)
}
pass('Type-resolution matrix clean across all four configurations')

console.log(`\n${GREEN}${BOLD}✓ Consumer smoke test passed${RESET}`)
console.log(`   Full build log: ${logPath}`)
