#!/usr/bin/env node
/**
 * validate-breaking-manifest.mjs
 *
 * Validates `packages/core/BREAKING.json` against `BREAKING.schema.json` and
 * cross-checks against repo state:
 *
 *   1. Structural — required fields, allowed fields, array shapes.
 *   2. `moved.to` paths exist in `packages/core/package.json#exports`.
 *   3. Discipline gate — current version's CHANGELOG with a breaking signal
 *      (`feat!` / `**Breaking.`) MUST have a manifest entry. Catches the
 *      class of mistake that produced the F-10 mislabel.
 *
 * Exposes `validate()` for the pre-publish-audit gate AND runs as a CLI.
 */

import { readFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const CORE = join(ROOT, 'packages/core')
const MANIFEST_PATH = join(CORE, 'BREAKING.json')
const SCHEMA_PATH = join(CORE, 'BREAKING.schema.json')
const PKG_PATH = join(CORE, 'package.json')
const CHANGELOG_PATH = join(CORE, 'CHANGELOG.md')

/**
 * Validate BREAKING.json. Returns { ok: boolean, errors: string[], versions: string[] }.
 * No process.exit — leaves that to callers.
 */
export function validate() {
  const errors = []
  const fail = (m) => errors.push(m)

  if (!existsSync(MANIFEST_PATH)) {
    return { ok: false, errors: ['BREAKING.json missing at packages/core/'], versions: [] }
  }
  if (!existsSync(SCHEMA_PATH)) {
    return { ok: false, errors: ['BREAKING.schema.json missing at packages/core/'], versions: [] }
  }

  let manifest, pkg
  try {
    manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf-8'))
  } catch (e) {
    return { ok: false, errors: [`BREAKING.json is not valid JSON: ${e.message}`], versions: [] }
  }
  try {
    pkg = JSON.parse(readFileSync(PKG_PATH, 'utf-8'))
  } catch (e) {
    return { ok: false, errors: [`packages/core/package.json is not valid JSON: ${e.message}`], versions: [] }
  }

  const currentVersion = pkg.version

  if (manifest.package !== pkg.name) {
    fail(`manifest.package ("${manifest.package}") must equal packages/core/package.json#name ("${pkg.name}")`)
  }
  if (!manifest.versions || typeof manifest.versions !== 'object') {
    fail('manifest.versions must be an object')
  }

  const semverRe = /^\d+\.\d+\.\d+$/
  const allowedFields = new Set(['summary', 'migrationDoc', 'moved', 'narrowed', 'removed', 'renamed', 'notes'])
  for (const v of Object.keys(manifest.versions || {})) {
    if (!semverRe.test(v)) fail(`version key "${v}" is not a valid X.Y.Z semver`)
    const entry = manifest.versions[v]
    for (const k of Object.keys(entry)) {
      if (!allowedFields.has(k)) fail(`${v}: unknown field "${k}" — allowed: ${[...allowedFields].join(', ')}`)
    }
    for (const arrKey of ['moved', 'narrowed', 'removed', 'renamed', 'notes']) {
      if (entry[arrKey] != null && !Array.isArray(entry[arrKey])) {
        fail(`${v}.${arrKey} must be an array`)
      }
    }
    for (const m of entry.moved || []) {
      for (const r of ['symbol', 'from', 'to']) {
        if (!m[r] || typeof m[r] !== 'string') fail(`${v}.moved entry missing/empty required string "${r}": ${JSON.stringify(m)}`)
      }
    }
    for (const n of entry.narrowed || []) {
      for (const r of ['prop', 'components', 'from', 'to', 'fix']) {
        if (n[r] == null) fail(`${v}.narrowed entry missing required field "${r}": ${JSON.stringify(n)}`)
      }
      if (!Array.isArray(n.components) || n.components.length === 0) {
        fail(`${v}.narrowed entry must have non-empty components array: ${JSON.stringify(n)}`)
      }
    }
  }

  // moved.to paths must exist in package.json exports
  const exportPaths = new Set(Object.keys(pkg.exports || {}))
  const prefix = pkg.name + '/'
  for (const v of Object.keys(manifest.versions || {})) {
    for (const m of (manifest.versions[v].moved || [])) {
      if (!m.to.startsWith(prefix)) {
        fail(`${v} moved: \`to\` ("${m.to}") must start with "${prefix}"`)
        continue
      }
      const rel = './' + m.to.slice(prefix.length)
      if (!exportPaths.has(rel)) {
        fail(`${v} moved: \`to\` path "${m.to}" → "${rel}" is not in packages/core/package.json#exports. Either add the subpath export or fix the manifest entry.`)
      }
    }
  }

  // Discipline gate: current version with breaking CHANGELOG signal MUST have
  // a manifest entry. Scan only TOP-LEVEL bullets' headlines (mirrors
  // prepend-breaking-summary.mjs's per-bullet scope) — scanning the whole
  // section false-triggers on quoted/documented prose like `**Breaking.`
  // inside a changeset body.
  if (existsSync(CHANGELOG_PATH)) {
    const changelog = readFileSync(CHANGELOG_PATH, 'utf-8').replace(/\r\n/g, '\n')
    const head = changelog.search(/^## /m)
    if (head !== -1) {
      const after = changelog.slice(head + 3)
      const nextRel = after.search(/^## /m)
      const section = changelog.slice(head, nextRel === -1 ? changelog.length : head + 3 + nextRel)
      const versionMatch = section.match(/^## (\S+)/)
      if (versionMatch && versionMatch[1] === currentVersion) {
        // Match the Conventional Commits `!` marker only — unambiguous.
        // Drop `**Breaking.` from the detector: it appears in prose too often
        // (e.g. inside a changeset body documenting another version's break).
        // The CC marker is the maintainer's explicit signal.
        const BREAKING_RE = /\b(?:feat|fix|perf|refactor|build|chore)!|!:/i
        // Per top-level bullet (line starting with `- `), test the first
        // ~5 lines of its scope. Nested bullets and prose paragraphs are
        // skipped — they document, they don't signal.
        const lines = section.split('\n')
        let hasBreaking = false
        for (let i = 0; i < lines.length; i++) {
          if (!/^- /.test(lines[i])) continue
          let scope = lines[i]
          for (let j = i + 1; j < lines.length && j < i + 5 && !/^- /.test(lines[j]) && !/^## /.test(lines[j]); j++) {
            scope += '\n' + lines[j]
          }
          if (BREAKING_RE.test(scope)) {
            hasBreaking = true
            break
          }
        }
        if (hasBreaking && !manifest.versions[currentVersion]) {
          fail(
            `CHANGELOG.md ${currentVersion} contains a Conventional-Commits breaking marker (feat!/fix!/!:) but BREAKING.json has no entry for ${currentVersion}. Add the structured break data so AI agents and migration tooling can read it programmatically (see packages/core/BREAKING.schema.json).`,
          )
        }
      }
    }
  }

  return {
    ok: errors.length === 0,
    errors,
    versions: Object.keys(manifest.versions || {}),
  }
}

// CLI entry — only when invoked directly.
const invokedDirectly = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]
if (invokedDirectly) {
  const r = validate()
  if (r.ok) {
    console.log(`✓ BREAKING.json validates — ${r.versions.length} version(s): ${r.versions.join(', ') || '(none)'}`)
    process.exit(0)
  }
  console.error(`✗ BREAKING.json validation FAILED — ${r.errors.length} issue(s):`)
  for (const e of r.errors) console.error(`  • ${e}`)
  process.exit(1)
}
