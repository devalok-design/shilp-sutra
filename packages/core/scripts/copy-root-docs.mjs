#!/usr/bin/env node

/**
 * Copy MIGRATION.md + AGENTS.md + rollback.md from the repo root into the
 * core package so they ship with the npm tarball. CHANGELOG.md, llms.txt,
 * llms-full.txt, and the deprecated preset stub all reference these files
 * by name — consumers clicking through from those references must find
 * them inside `node_modules/@devalok/shilp-sutra/`. AGENTS.md is also
 * auto-discovered by AGENTS.md-aware tools (Codex, Cursor, Copilot,
 * Aider, etc.) inside consumer projects.
 *
 * Outputs:
 *   packages/core/MIGRATION.md      (copy of repo-root MIGRATION.md)
 *   packages/core/AGENTS.md         (copy of repo-root AGENTS.md)
 *   packages/core/docs/rollback.md  (copy of repo-root docs/rollback.md)
 *
 * These paths are declared in package.json `files[]` so `npm pack` picks
 * them up. All outputs are git-ignored in packages/core/ to keep the
 * source of truth at repo root.
 */

import { copyFileSync, mkdirSync, existsSync } from 'fs'
import { dirname, join, resolve } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const CORE = resolve(__dirname, '..')
const REPO_ROOT = resolve(CORE, '..', '..')

const copies = [
  {
    from: join(REPO_ROOT, 'MIGRATION.md'),
    to: join(CORE, 'MIGRATION.md'),
  },
  {
    from: join(REPO_ROOT, 'AGENTS.md'),
    to: join(CORE, 'AGENTS.md'),
  },
  {
    from: join(REPO_ROOT, 'docs', 'rollback.md'),
    to: join(CORE, 'docs', 'rollback.md'),
  },
]

for (const { from, to } of copies) {
  if (!existsSync(from)) {
    console.error(`[copy-root-docs] Source missing: ${from}`)
    process.exit(1)
  }
  mkdirSync(dirname(to), { recursive: true })
  copyFileSync(from, to)
  console.log(`[copy-root-docs] ${from} → ${to}`)
}
