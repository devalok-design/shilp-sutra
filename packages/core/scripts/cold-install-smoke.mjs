#!/usr/bin/env node

/**
 * cold-install-smoke.mjs
 *
 * Dogfoods the "install shilp-sutra and it just works" promise end-to-end:
 * scaffolds a real consumer app in a temp dir, installs it the way the recipe
 * says, builds it, and asserts the built app is not silently broken.
 *
 * Why it exists (2026-07-10 dogfood): on Vite 8 / Rolldown a MISSING optional
 * peer no longer fails the build — the bundler silently externalizes the
 * unresolved bare specifier into the emitted bundle, which then dies in the
 * browser at runtime. So "build passed" is not proof the app works. This smoke
 * makes the guarantee testable:
 *
 *   In a Vite APP build, everything resolvable is bundled — so ANY bare import
 *   specifier left in dist/assets/*.js is, by definition, a module the bundler
 *   could not resolve (a missing peer). The assertion is therefore simply:
 *   the built app contains ZERO bare specifiers.
 *
 * The peers to install come from derive-peer-map.mjs (the source-derived map),
 * so this also validates that map end-to-end: if the map misses a peer a tested
 * component imports, the build leaves a bare specifier and this smoke fails.
 *
 * Usage (from packages/core/):
 *   node scripts/cold-install-smoke.mjs                 # test published @latest
 *   node scripts/cold-install-smoke.mjs --tarball ./pkg.tgz   # test a local `npm pack`
 *   node scripts/cold-install-smoke.mjs --framework vite      # (only vite for now)
 *   node scripts/cold-install-smoke.mjs --keep         # leave the temp app for inspection
 *
 * Security: no consumer input; component list + peers derived from this repo.
 */

import { execSync } from 'child_process'
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, readdirSync, rmSync, existsSync } from 'fs'
import { join, resolve } from 'path'
import { tmpdir } from 'os'
import { createRequire } from 'module'
import { derivePeerMap } from './derive-peer-map.mjs'

const PASS = '\x1b[32m✓\x1b[0m'
const FAIL = '\x1b[31m✗\x1b[0m'

const argv = process.argv.slice(2)
const opt = (flag) => {
  const i = argv.indexOf(flag)
  return i >= 0 ? argv[i + 1] : undefined
}
const framework = opt('--framework') || 'vite'
const tarball = opt('--tarball')
const keep = argv.includes('--keep')

// Guarded optional dynamic imports that legitimately resolve to a throwing stub
// and are caught at runtime — NOT a break. framer-motion probes
// `@emotion/is-prop-valid` with a try/catch to decide prop filtering.
const BENIGN_UNRESOLVED = new Set(['@emotion/is-prop-valid'])

if (framework !== 'vite') {
  console.error(`cold-install-smoke: only "vite" is implemented (got "${framework}"). Next/Remix/TanStack are follow-ups.`)
  process.exit(2)
}

// The install specifier: a local pack (absolute path) or the published package.
const ssSpec = tarball ? resolve(tarball) : '@devalok/shilp-sutra@latest'

// Components the smoke app imports. A base trio + one peer-cliff component per
// gated peer family, so a regression in any family's peer map surfaces here.
const COMPONENTS = [
  { name: 'button', import: 'Button', subpath: 'ui/button', jsx: '<Button>Primary</Button>' },
  { name: 'stack', import: 'Stack', subpath: 'ui/stack', jsx: null },
  { name: 'text', import: 'Text', subpath: 'ui/text', jsx: '<Text variant="heading-2xl">Hi</Text>' },
  { name: 'markdown-viewer', import: 'MarkdownViewer', subpath: 'composed/markdown-viewer', jsx: '<MarkdownViewer content={"# Hi"} />' },
  { name: 'emoji-picker', import: 'EmojiPicker', subpath: 'composed/emoji-picker', jsx: null },
  { name: 'toaster', import: 'Toaster', subpath: 'ui/toaster', jsx: '<Toaster />' },
]

// Derive the peers those components need — the whole point: install exactly what
// the source-derived map says, nothing hand-listed.
const { map } = derivePeerMap()
const peers = new Set()
for (const c of COMPONENTS) for (const p of map[c.name] || []) peers.add(p)
// sonner (Toaster) is an optional peer with a package entry but no third-party
// import surface beyond itself — it is in the derived map, so it is covered.

console.log(`\x1b[36mcold-install-smoke\x1b[0m — framework=${framework}, package=${tarball ? 'local tarball' : ssSpec}`)
console.log(`Components: ${COMPONENTS.map((c) => c.name).join(', ')}`)
console.log(`Derived peers to install: ${[...peers].join(', ') || '(none)'}\n`)

const dir = mkdtempSync(join(tmpdir(), 'ss-cold-'))
let failures = 0
const fail = (msg) => { failures++; console.log(`${FAIL} ${msg}`) }
const pass = (msg) => console.log(`${PASS} ${msg}`)

function sh(cmd, label) {
  try {
    execSync(cmd, { cwd: dir, encoding: 'utf-8', stdio: 'pipe' })
    return { ok: true }
  } catch (e) {
    return { ok: false, out: (e.stdout || '') + (e.stderr || ''), label }
  }
}

try {
  scaffold()
  install()
  auditPeerRanges()
  const built = build()
  if (built) auditBundle()
} finally {
  if (keep) console.log(`\nTemp app kept at: ${dir}`)
  else rmSync(dir, { recursive: true, force: true })
}

console.log('')
if (failures) {
  console.log(`${FAIL} cold-install-smoke: ${failures} failure(s).`)
  process.exit(1)
}
console.log(`${PASS} cold-install-smoke: clean install, build, and bundle.`)

// ── steps ─────────────────────────────────────────────────────────────────────

function scaffold() {
  mkdirSync(join(dir, 'src'))
  const imports = COMPONENTS.map((c) => `import { ${c.import} } from "@devalok/shilp-sutra/${c.subpath}";`).join('\n')
  const jsx = COMPONENTS.filter((c) => c.jsx).map((c) => '      ' + c.jsx).join('\n')

  writeFileSync(join(dir, 'package.json'), JSON.stringify({
    name: 'ss-cold-smoke', private: true, version: '0.0.0', type: 'module',
    scripts: { build: 'tsc -b && vite build' },
  }, null, 2))

  writeFileSync(join(dir, 'vite.config.ts'),
    `import { defineConfig } from "vite";\nimport react from "@vitejs/plugin-react";\nimport tailwindcss from "@tailwindcss/vite";\nexport default defineConfig({ plugins: [react(), tailwindcss()] });\n`)

  writeFileSync(join(dir, 'tsconfig.json'), JSON.stringify({
    compilerOptions: {
      target: 'ES2022', useDefineForClassFields: true, lib: ['ES2022', 'DOM', 'DOM.Iterable'],
      module: 'ESNext', skipLibCheck: true, moduleResolution: 'bundler', jsx: 'react-jsx',
      strict: true, noEmit: true, esModuleInterop: true,
    },
    include: ['src'],
  }, null, 2))

  writeFileSync(join(dir, 'index.html'),
    `<!doctype html><html><head><meta charset="utf-8"><title>smoke</title></head><body><div id="root"></div><script type="module" src="/src/main.tsx"></script></body></html>\n`)

  writeFileSync(join(dir, 'src', 'index.css'), `@import "tailwindcss";\n@import "@devalok/shilp-sutra/css";\n`)

  // vite/client ambient types (declares *.css side-effect imports so tsc is happy).
  writeFileSync(join(dir, 'src', 'vite-env.d.ts'), `/// <reference types="vite/client" />\n`)

  writeFileSync(join(dir, 'src', 'App.tsx'),
    `${imports}\n\nexport function App() {\n  return (\n    <Stack className="p-ds-08" gap="ds-04">\n${jsx}\n    </Stack>\n  );\n}\n`)

  writeFileSync(join(dir, 'src', 'main.tsx'),
    `import { StrictMode } from "react";\nimport { createRoot } from "react-dom/client";\nimport { App } from "./App";\nimport "./index.css";\ncreateRoot(document.getElementById("root")!).render(<StrictMode><App /></StrictMode>);\n`)

  pass('scaffolded minimal Vite app')
}

function install() {
  // @tabler/icons-react is a REQUIRED (non-optional) peer imported internally by
  // many components (e.g. MarkdownViewer's copy button) regardless of whether the
  // consumer passes Tabler icons — so it belongs in the base install alongside
  // framer-motion. (The recipe base install currently omits it — a finding.)
  const base = ['react', 'react-dom', 'framer-motion', '@tabler/icons-react']
  const dev = ['vite', '@vitejs/plugin-react', 'typescript', '@types/react', '@types/react-dom', 'tailwindcss@^4', '@tailwindcss/vite', 'semver']
  const runtime = `npm install ${ssSpec} ${base.join(' ')} ${[...peers].join(' ')} --no-audit --no-fund`

  let r = sh(runtime, 'install')
  if (!r.ok && /ERESOLVE|Conflicting peer/i.test(r.out || '')) {
    // A clean install blocked by a peer conflict IS a "just works" break —
    // record it, then retry permissively so the bundle audit can still run.
    fail(`clean \`npm install\` blocked by a peer conflict (consumers must use --legacy-peer-deps):\n${peerConflictSummary(r.out)}`)
    r = sh(runtime + ' --legacy-peer-deps', 'install-legacy')
  }
  if (!r.ok) { fail(`install failed:\n${clip(r.out)}`); throw new Error('install') }

  const r2 = sh(`npm install -D ${dev.join(' ')} --no-audit --no-fund --legacy-peer-deps`, 'install-dev')
  if (!r2.ok) { fail(`dev install failed:\n${clip(r2.out)}`); throw new Error('install') }
  pass(`installed ${ssSpec} + base peers + ${peers.size} derived peer(s)`)
}

/** Pull the "peer X from Y does not accept Z" lines out of an ERESOLVE dump. */
function peerConflictSummary(out) {
  const lines = String(out || '').split('\n').filter((l) => /peer |Conflicting|node_modules\//.test(l))
  return '      ' + lines.slice(0, 6).map((l) => l.replace(/^npm error\s*/, '').trim()).filter(Boolean).join('\n      ')
}

/**
 * Deterministic install-time check: does each installed peer's declared
 * `peerDependencies.react` accept the React major the app uses? Catches peers
 * that lag the React version shilp-sutra targets (e.g. @emoji-mart/react@1.1.1
 * still declares `^16.8 || ^17 || ^18` — a hard ERESOLVE for React-19 consumers,
 * which npm's resolver only surfaces nondeterministically).
 */
function auditPeerRanges() {
  const reactPkg = join(dir, 'node_modules', 'react', 'package.json')
  if (!existsSync(reactPkg)) return
  const reactVersion = JSON.parse(readFileSync(reactPkg, 'utf-8')).version
  // Real semver — the temp app has `semver` transitively (vite/npm). If it is
  // somehow absent, skip rather than risk a false positive on comparator ranges.
  let semver
  try { semver = createRequire(join(dir, 'package.json'))('semver') } catch { /* skip */ }
  if (!semver) { console.log(`  (peer-range check skipped — semver not resolvable)`); return }
  let flagged = 0
  for (const p of peers) {
    const pj = join(dir, 'node_modules', p, 'package.json')
    if (!existsSync(pj)) continue
    const meta = JSON.parse(readFileSync(pj, 'utf-8'))
    const range = meta.peerDependencies?.react
    if (!range) continue
    if (!semver.satisfies(reactVersion, range, { includePrerelease: true })) {
      flagged++
      fail(`${p}@${meta.version} declares peer react "${range}" — does NOT accept installed React ${reactVersion}. React-${reactVersion.split('.')[0]} consumers hit ERESOLVE on \`npm install\` (must use --legacy-peer-deps until the peer updates).`)
    }
  }
  if (!flagged) pass(`all ${peers.size} installed peer(s) accept React ${reactVersion}`)
}

function build() {
  const r = sh('npm run build', 'build')
  if (!r.ok) { fail(`build failed (tsc or vite):\n${clip(r.out)}`); return false }
  pass('tsc + vite build succeeded (recipe App typechecks)')
  return true
}

/**
 * The core assertion. On Vite 8 / Rolldown a MISSING module is not left as a
 * bare specifier — it is replaced by a generated stub whose body throws
 * `Could not resolve "X"` at runtime, while the build still exits 0. So the
 * app builds green and dies when the component renders. Detect those stubs
 * (minus known guarded optionals); each remaining one is a missing peer.
 */
function auditBundle() {
  const assetsDir = join(dir, 'dist', 'assets')
  if (!existsSync(assetsDir)) { fail('no dist/assets after build'); return }
  const jsFiles = readdirSync(assetsDir).filter((f) => f.endsWith('.js'))
  const unresolved = new Set()
  for (const f of jsFiles) {
    const src = readFileSync(join(assetsDir, f), 'utf-8')
    for (const m of src.matchAll(/Could not resolve ["']([^"']+)["']/g)) {
      if (!BENIGN_UNRESOLVED.has(m[1])) unresolved.add(m[1])
    }
  }
  if (unresolved.size === 0) {
    pass('bundle has ZERO unresolved-module stubs — following the derived peer map yields a clean build')
    return
  }
  fail(`bundle carries ${unresolved.size} unresolved-module stub(s) — build is GREEN but these throw at runtime (missing peers):`)
  for (const spec of unresolved) {
    const root = spec.startsWith('@') ? spec.split('/').slice(0, 2).join('/') : spec.split('/')[0]
    const owners = COMPONENTS.filter((c) => (map[c.name] || []).some((p) => p === root || spec.startsWith(p))).map((c) => c.name)
    console.log(`      "${spec}"${owners.length ? ` — needed by ${owners.join(', ')} (peer "${root}" in derived map but not installed)` : ` — "${root}" not in the derived peer map`}`)
  }
}

function clip(s, n = 1500) {
  s = String(s || '')
  return s.length > n ? s.slice(-n) : s
}
