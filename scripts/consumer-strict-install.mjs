#!/usr/bin/env node
/**
 * consumer-strict-install.mjs
 *
 * Installs the packed tarball into a throwaway consumer using **pnpm with
 * hoisting disabled and auto-install-peers off**, imports EVERY subpath export,
 * and checks both the types and the runtime.
 *
 * WHY THIS EXISTS SEPARATELY FROM consumer-smoke-test.mjs
 * -------------------------------------------------------
 * The Next smoke consumer installs with npm-style resolution: dependencies are
 * hoisted into a flat `node_modules`, and peers are auto-installed. Both hide
 * real faults —
 *
 *   • A package we never declared still resolves, because something else
 *     hoisted it to the top level.
 *   • A peer we forgot to declare gets installed anyway.
 *
 * pnpm's strict, symlinked layout does neither: a module resolves only if we
 * declared it. Running this found two faults that every npm-based test passed:
 *
 *   1. `@tiptap/pm` was missing from the peer set. TipTap's own .d.ts imports
 *      '@tiptap/pm/state' and declares @tiptap/pm as *its* peer, so our
 *      documented install line left six TS2307 errors from inside TipTap.
 *   2. Two 0-byte emitted modules (types-only entry points) threw
 *      ERR_REQUIRE_CYCLE_MODULE on import — an empty file gives Node's
 *      module-type detection nothing to read, and under pnpm's symlinks that
 *      ambiguity is fatal. Published 0.54.0 fails this way today.
 *
 * Neither is visible under npm. Keep this gate.
 *
 * Usage:
 *   node scripts/consumer-strict-install.mjs           # build + pack + verify
 *   node scripts/consumer-strict-install.mjs --no-build  # reuse existing dist
 */

import { spawnSync } from 'child_process'
import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'fs'
import { dirname, join, resolve } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const CORE = join(ROOT, 'packages', 'core')
const WORK = join(ROOT, 'tests', '.strict-consumer')
const SKIP_BUILD = process.argv.includes('--no-build')

const RED = '\x1b[31m'
const GREEN = '\x1b[32m'
const CYAN = '\x1b[36m'
const BOLD = '\x1b[1m'
const RESET = '\x1b[0m'

const step = (m) => console.log(`\n${CYAN}▶ ${m}${RESET}`)
const pass = (m) => console.log(`${GREEN}✓${RESET} ${m}`)
const fail = (m, extra) => {
  console.error(`\n${RED}${BOLD}✗ ${m}${RESET}`)
  if (extra) console.error(String(extra).slice(0, 4000))
  process.exit(1)
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

// ── Build + pack ────────────────────────────────────────────────────────
if (!SKIP_BUILD) {
  step('Building core')
  const b = run('pnpm', ['run', 'build'], { cwd: CORE })
  if (b.status !== 0) fail('core build failed', b.stderr || b.stdout)
  pass('Core built')
}

step('Packing tarball')
rmSync(WORK, { recursive: true, force: true })
mkdirSync(join(WORK, 'src'), { recursive: true })
const packed = run('pnpm', ['pack', '--pack-destination', WORK], { cwd: CORE })
if (packed.status !== 0) fail('pnpm pack failed', packed.stderr || packed.stdout)
const tgz = readdirSync(WORK).find((n) => n.endsWith('.tgz'))
if (!tgz) fail('no tarball produced')
pass(`Packed ${tgz}`)

// ── Generate a module importing every subpath ───────────────────────────
const pkg = JSON.parse(readFileSync(join(CORE, 'package.json'), 'utf8'))
const skip = (k) =>
  k.includes('*') ||
  k === './css' ||
  k === './tokens' ||
  k === './package.json' ||
  /\.(json|md|css)$/.test(k) ||
  k.startsWith('./make-kit')
const subpaths = Object.keys(pkg.exports).filter((k) => !skip(k))
const specOf = (k) => (k === '.' ? '@devalok/shilp-sutra' : `@devalok/shilp-sutra/${k.slice(2)}`)

writeFileSync(
  join(WORK, 'src', 'all.ts'),
  subpaths.map((k, i) => `import * as M${i} from '${specOf(k)}'`).join('\n') +
    `\n\nexport const ALL = [\n${subpaths.map((k, i) => `  ['${specOf(k)}', M${i}],`).join('\n')}\n]\n`
)
writeFileSync(join(WORK, 'subpaths.json'), JSON.stringify(subpaths))

// Every declared peer, so "missing peer" noise cannot masquerade as a defect.
// react/react-dom come from the base install.
//
// These go straight into package.json rather than through `pnpm add <pkg>@<range>`:
// on Windows `^` is cmd.exe's escape character, so a range passed through a
// shell arrives as an exact pin (`^8.0.0` → `8.0.0`) and resolves to the oldest
// release in the range — which for @tanstack/react-table has an unpublished
// transitive and fails to install at all.
const peerRanges = Object.fromEntries(
  Object.entries(pkg.peerDependencies || {}).filter(([k]) => k !== 'react' && k !== 'react-dom')
)

writeFileSync(
  join(WORK, 'package.json'),
  JSON.stringify(
    {
      name: 'strict-consumer',
      private: true,
      version: '1.0.0',
      type: 'module',
      dependencies: {
        '@devalok/shilp-sutra': `file:./${tgz}`,
        react: '^19.0.0',
        'react-dom': '^19.0.0',
      },
      devDependencies: {
        '@types/react': '^19.0.0',
        '@types/react-dom': '^19.0.0',
        ...peerRanges,
      },
    },
    null,
    2
  )
)

// The point of the gate: no hoisting, no implicit peers.
writeFileSync(
  join(WORK, '.npmrc'),
  'hoist=false\nshamefully-hoist=false\nauto-install-peers=false\nstrict-peer-dependencies=false\nnode-linker=isolated\n'
)
writeFileSync(
  join(WORK, 'tsconfig.json'),
  JSON.stringify(
    {
      compilerOptions: {
        target: 'ES2022',
        lib: ['ES2022', 'DOM', 'DOM.Iterable'],
        module: 'ESNext',
        moduleResolution: 'bundler',
        jsx: 'react-jsx',
        strict: true,
        skipLibCheck: false,
        noEmit: true,
        esModuleInterop: true,
      },
      include: ['src'],
    },
    null,
    2
  )
)

step(
  `Installing under pnpm (hoisting off) with ${Object.keys(peerRanges).length} declared peers`
)
const inst = run('pnpm', ['install', '--ignore-workspace'], { cwd: WORK })
if (inst.status !== 0) fail('pnpm install failed', inst.stderr || inst.stdout)
pass(`Installed; ${subpaths.length} subpaths to verify`)

// ── Types, on every TypeScript major we claim to support ────────────────
//
// Checking only the older major means we would catch nothing that is specific
// to the CURRENT compiler — which is the direction problems actually arrive
// from. Issue #237 was reported on TypeScript 7.0.2; this gate was pinned to
// 5.9, and the fix only happened to be verified on 7 because two throwaway
// fixtures resolved `typescript@latest` by chance. Luck is not a gate.
//
// 5.x stays covered because plenty of shipped apps are still on it.
const TS_VERSIONS = ['5.9', 'latest']

for (const version of TS_VERSIONS) {
  const addTs = run('pnpm', ['add', '-D', '--ignore-workspace', `typescript@${version}`], {
    cwd: WORK,
  })
  if (addTs.status !== 0) {
    fail(`installing typescript@${version} failed`, addTs.stderr || addTs.stdout)
  }
  const tscBin = join(WORK, 'node_modules', 'typescript', 'bin', 'tsc')
  const actual = JSON.parse(
    readFileSync(join(WORK, 'node_modules', 'typescript', 'package.json'), 'utf8')
  ).version

  step(`Type-checking every subpath — TypeScript ${actual} (skipLibCheck: false)`)
  const tsc = run('node', [tscBin, '--noEmit'], { cwd: WORK, shell: false })
  const tscErrors = ((tsc.stdout || '') + (tsc.stderr || ''))
    .split('\n')
    .filter((l) => /error TS\d+/.test(l))
  if (tscErrors.length) {
    fail(
      `${tscErrors.length} type error(s) on TypeScript ${actual} with every declared peer installed`,
      tscErrors.slice(0, 30).join('\n') +
        '\n\nEach one is something a pnpm consumer hits. If it names a package, that package is missing from peerDependencies (see TYPES_ONLY_COMPANIONS in derive-peer-map.mjs for the types-of-a-type-peer case).'
    )
  }
  pass(`${subpaths.length} subpaths type-check clean on TypeScript ${actual}`)
}

// ── Runtime ─────────────────────────────────────────────────────────────
step('SSR-importing every subpath in Node')
writeFileSync(
  join(WORK, 'ssr.mjs'),
  `import { readFileSync } from 'fs'
const subpaths = JSON.parse(readFileSync('./subpaths.json','utf8'))
const failed = []
for (const k of subpaths) {
  const spec = k === '.' ? '@devalok/shilp-sutra' : \`@devalok/shilp-sutra/\${k.slice(2)}\`
  try { await import(spec) }
  catch (e) { failed.push(\`\${spec} :: \${e.code || ''} \${String(e.message).split('\\n')[0].slice(0,160)}\`) }
}
if (failed.length) { console.error(failed.join('\\n')); process.exit(1) }
console.log('ok ' + subpaths.length)
`
)
const ssr = run('node', ['ssr.mjs'], { cwd: WORK, shell: false })
if (ssr.status !== 0) {
  fail(
    'subpath(s) failed to import at runtime',
    (ssr.stdout || '') +
      (ssr.stderr || '') +
      '\n\nERR_REQUIRE_CYCLE_MODULE usually means a 0-byte emitted module — see fix-empty-modules.mjs.'
  )
}
pass(`${subpaths.length} subpaths import cleanly`)

rmSync(WORK, { recursive: true, force: true })
console.log(`\n${GREEN}${BOLD}✓ Strict-install consumer check passed${RESET}`)
