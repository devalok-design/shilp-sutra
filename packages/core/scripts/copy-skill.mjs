#!/usr/bin/env node

/**
 * Copy skills/shilp-sutra/ from the repo root into packages/core/skill/ so it
 * ships with the npm tarball at `node_modules/@devalok/shilp-sutra/skill/`.
 *
 * Consumers can then install the Agent Skill straight from their dependencies:
 *
 *   cp -r node_modules/@devalok/shilp-sutra/skill ~/.claude/skills/shilp-sutra
 *
 * Source of truth is at repo root; the copy under packages/core/ is git-ignored
 * and regenerated on every build.
 */

import { copyFileSync, mkdirSync, existsSync, readdirSync, statSync, rmSync } from 'fs'
import { dirname, join, resolve } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const CORE = resolve(__dirname, '..')
const REPO_ROOT = resolve(CORE, '..', '..')
const SRC = join(REPO_ROOT, 'skills', 'shilp-sutra')
const DST = join(CORE, 'skill')

if (!existsSync(SRC)) {
  console.error(`[copy-skill] Source missing: ${SRC}`)
  console.error(`[copy-skill] Run: node scripts/build-skill.mjs (from repo root)`)
  process.exit(1)
}

if (existsSync(DST)) rmSync(DST, { recursive: true, force: true })

let count = 0
function copyTree(src, dst) {
  mkdirSync(dst, { recursive: true })
  for (const entry of readdirSync(src)) {
    const s = join(src, entry)
    const d = join(dst, entry)
    if (statSync(s).isDirectory()) {
      copyTree(s, d)
    } else {
      copyFileSync(s, d)
      count++
    }
  }
}

copyTree(SRC, DST)
console.log(`[copy-skill] copied ${count} files: ${SRC} → ${DST}`)
