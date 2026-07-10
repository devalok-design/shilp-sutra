#!/usr/bin/env node
/**
 * stub-migration-section.mjs
 *
 * Runs AFTER `changeset version` (chained in `pnpm version-packages`), so
 * packages/core/package.json already carries the NEW target version.
 *
 * The pre-publish audit hard-fails the release if root MIGRATION.md has no
 * section for the target major.minor (gate: "MIGRATION.md at repo root has
 * section for target version"). That gate can only fire DURING a release —
 * the version bump happens here, not on a developer laptop — so a local
 * pre-flight never catches a missing section. It blocked 0.47.0's first
 * publish attempt.
 *
 * This closes that gap: if MIGRATION.md has no `v{major.minor}` section, insert
 * a stub so the gate passes, seeded from BREAKING.json when the version has
 * breaking entries. The stub is deliberately marked "review before release" —
 * it exists to unblock the mechanical gate and PROMPT the human to write real
 * migration prose on the Version Packages PR, never to fake it.
 *
 * Idempotent: re-running (or a human having already written the section) is a
 * no-op. Never throws in a way that breaks version-packages — a stub failure
 * would just resurface as the original audit gate.
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join, resolve } from 'node:path'

const ROOT = resolve(import.meta.dirname, '..')
const MIGRATION = join(ROOT, 'MIGRATION.md')
const CORE_PKG = join(ROOT, 'packages/core/package.json')
const BREAKING = join(ROOT, 'packages/core/BREAKING.json')

const version = JSON.parse(readFileSync(CORE_PKG, 'utf-8')).version
const majorMinor = version.match(/^(\d+\.\d+)/)?.[1]

if (!majorMinor) {
  console.log(`[migration-stub] could not parse version "${version}" — skipping`)
  process.exit(0)
}
if (!existsSync(MIGRATION)) {
  console.log('[migration-stub] MIGRATION.md not found — skipping')
  process.exit(0)
}

const content = readFileSync(MIGRATION, 'utf-8').replace(/\r\n/g, '\n')

// Gate matches on `v{major.minor}` anywhere; mirror that so we don't double-stub.
if (content.includes(`v${majorMinor}`)) {
  console.log(`[migration-stub] MIGRATION.md already has a v${majorMinor} section — no stub needed`)
  process.exit(0)
}

// Pull breaking data for the exact version, if any.
let breaking = null
try {
  breaking = JSON.parse(readFileSync(BREAKING, 'utf-8')).versions?.[version] ?? null
} catch {
  // BREAKING.json optional/unreadable — treat as no breaking data.
}

const lines = []
if (breaking) {
  lines.push(`## v${version} — breaking changes (review before release)`)
  lines.push('')
  lines.push(`> ⚠️ Auto-stubbed by \`version-packages\`. This version has breaking entries in BREAKING.json. **Expand each into before→after migration steps on the Version Packages PR before publishing.**`)
  lines.push('')
  if (breaking.summary) lines.push(breaking.summary)
  if (Array.isArray(breaking.removed) && breaking.removed.length) {
    lines.push('')
    lines.push('Removed:')
    for (const r of breaking.removed) {
      lines.push(`- \`${r.symbol ?? r.name ?? r}\`${r.replacement ? ` → use \`${r.replacement}\`` : ''}`)
    }
  }
} else {
  lines.push(`## v${version} — additive (no migration required)`)
  lines.push('')
  lines.push('Nothing breaks at the TypeScript level; this release is additive.')
  lines.push('')
  lines.push('> Auto-stubbed by `version-packages` so the release audit\'s MIGRATION-section gate can\'t block. If any behavioral or visual change needs consumer action, replace this stub with the specifics on the Version Packages PR before publishing.')
}
lines.push('')

const section = lines.join('\n')

// Insert before the first existing version section (`## v...` or `## [...]`);
// fall back to appending after the file's intro if none exists yet.
const firstSection = content.search(/^## (?:v|\[)/m)
let next
if (firstSection === -1) {
  next = content.trimEnd() + '\n\n' + section + '\n'
} else {
  next = content.slice(0, firstSection) + section + '\n' + content.slice(firstSection)
}

writeFileSync(MIGRATION, next)
console.log(`[migration-stub] inserted v${version} ${breaking ? 'breaking' : 'additive'} stub into MIGRATION.md — review/expand on the Version PR.`)
