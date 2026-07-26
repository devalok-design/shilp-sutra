#!/usr/bin/env node
/**
 * check-lockfile.mjs
 *
 * Fails if `pnpm-lock.yaml` is out of sync with any workspace `package.json` —
 * i.e. if CI's `pnpm install --frozen-lockfile` would die with
 * ERR_PNPM_OUTDATED_LOCKFILE.
 *
 * WHY THIS EXISTS (0.56.0). A bogus dependency entry reached the lockfile:
 *
 *     '==rich-chat-input?RCI:RTE':
 *       specifier: link:==rich-chat-input?RCI:RTE
 *
 * …a fragment of a mangled inline `node -e` script whose shell quoting broke.
 * It was committed, and EVERY local check passed. Running
 * `pnpm install --frozen-lockfile` in the repo printed "Already up to date" and
 * exited 0 — pnpm short-circuits on an up-to-date `node_modules` and never
 * re-validates the lockfile against package.json. `--force` did not defeat it.
 * Deleting `node_modules/.modules.yaml` did not defeat it. Only CI caught it,
 * because CI starts from a fresh checkout with no `node_modules` at all.
 *
 * So this gate reproduces the ONE condition that makes pnpm actually check: a
 * directory containing the workspace manifests and the lockfile, and NO
 * `node_modules`. It copies pnpm-workspace.yaml + pnpm-lock.yaml + every
 * workspace package.json into a temp dir and runs
 * `pnpm install --frozen-lockfile --lockfile-only` there.
 *
 * `--lockfile-only` means no downloading, no linking, no store writes — it
 * resolves and validates, then stops. Runs in a couple of seconds.
 *
 * Exit 0 = the lockfile is consistent. Exit 1 = CI would fail; the pnpm error
 * is printed verbatim.
 */

import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { tmpdir } from 'node:os'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { globSync } from 'node:fs'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')

function readWorkspaceGlobs() {
  const wsPath = join(ROOT, 'pnpm-workspace.yaml')
  if (!existsSync(wsPath)) throw new Error('pnpm-workspace.yaml not found')
  const src = readFileSync(wsPath, 'utf8').replace(/\r\n/g, '\n')
  const globs = []
  let inPackages = false
  for (const line of src.split('\n')) {
    if (/^packages:\s*$/.test(line)) { inPackages = true; continue }
    if (inPackages) {
      const m = line.match(/^\s*-\s*'?"?([^'"\s]+)'?"?\s*$/)
      if (m) { globs.push(m[1]); continue }
      if (line.trim() !== '' && !/^\s/.test(line)) inPackages = false
    }
  }
  if (!globs.length) throw new Error('no package globs parsed from pnpm-workspace.yaml')
  return globs
}

/** Every workspace package.json, repo-relative, plus the root one. */
function manifestPaths() {
  const out = ['package.json']
  for (const g of readWorkspaceGlobs()) {
    for (const dir of globSync(g, { cwd: ROOT })) {
      const rel = join(dir, 'package.json')
      if (existsSync(join(ROOT, rel))) out.push(rel.replace(/\\/g, '/'))
    }
  }
  return out
}

const manifests = manifestPaths()
const sandbox = mkdtempSync(join(tmpdir(), 'ss-lockcheck-'))

try {
  // Only manifests + lockfile + workspace config. Deliberately NO node_modules:
  // its presence is exactly what makes pnpm skip the validation we want.
  for (const rel of [...manifests, 'pnpm-workspace.yaml', 'pnpm-lock.yaml']) {
    const from = join(ROOT, rel)
    if (!existsSync(from)) throw new Error(`missing ${rel}`)
    const to = join(sandbox, rel)
    mkdirSync(dirname(to), { recursive: true })
    cpSync(from, to)
  }
  // A local .npmrc can carry registry/auth or resolution settings that change
  // the outcome; carry it over when present.
  for (const optional of ['.npmrc']) {
    const from = join(ROOT, optional)
    if (existsSync(from)) cpSync(from, join(sandbox, optional))
  }
  // Neutralise lifecycle scripts — we validate resolution, never run builds.
  writeFileSync(join(sandbox, '.npmrc'),
    (existsSync(join(sandbox, '.npmrc')) ? readFileSync(join(sandbox, '.npmrc'), 'utf8') + '\n' : '') +
    'ignore-scripts=true\n', 'utf8')

  console.log(`# check-lockfile\n`)
  console.log(`Validating pnpm-lock.yaml against ${manifests.length} workspace manifest(s)`)
  console.log(`in a clean sandbox (no node_modules, so pnpm cannot short-circuit).\n`)

  // Windows: pnpm resolves to a `.cmd` shim, which spawnSync cannot exec
  // directly — it fails with EINVAL. Invoke cmd.exe explicitly rather than
  // passing shell:true, which would work but emits a DEP0190 warning on every
  // run (args concatenated, not escaped). Here the argv is entirely static
  // literals, and going through cmd.exe with an explicit argv keeps it quiet.
  const PNPM_ARGS = ['install', '--frozen-lockfile', '--lockfile-only', '--ignore-scripts']
  const isWin = process.platform === 'win32'
  const res = isWin
    ? spawnSync(process.env.ComSpec || 'cmd.exe', ['/d', '/s', '/c', 'pnpm', ...PNPM_ARGS], {
        cwd: sandbox,
        encoding: 'utf8',
      })
    : spawnSync('pnpm', PNPM_ARGS, { cwd: sandbox, encoding: 'utf8' })

  const output = `${res.stdout || ''}${res.stderr || ''}`

  if (res.error) {
    console.error(`✗ could not run pnpm: ${res.error.message}`)
    process.exit(1)
  }
  if (res.status !== 0) {
    console.error(output.trim())
    console.error('\n✗ pnpm-lock.yaml is OUT OF SYNC with the workspace manifests.')
    console.error('  CI runs `pnpm install --frozen-lockfile` from a fresh checkout and will fail.')
    console.error('  Fix: run `pnpm install --no-frozen-lockfile`, then REVIEW the lockfile diff')
    console.error('  (`git diff pnpm-lock.yaml`) before committing — a stray entry is how 0.56.0')
    console.error('  shipped a broken lockfile past every other local check.')
    process.exit(1)
  }

  console.log('✓ pnpm-lock.yaml is in sync — `pnpm install --frozen-lockfile` would succeed.')
} finally {
  rmSync(sandbox, { recursive: true, force: true })
}
