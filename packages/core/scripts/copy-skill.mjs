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

// Chat variant — ships separately as packages/core/chat-skill/ so consumers
// can pull just the lightweight pointer skill without the coding-agent bundle.
const CHAT_SRC = join(REPO_ROOT, 'skills', 'shilp-sutra', 'chat')
const CHAT_DST = join(CORE, 'chat-skill')

// Source-only files that shouldn't ship in the npm tarball (the template is
// committed source, .gitignore is repo hygiene — neither is consumer-facing).
const CHAT_EXCLUDE = new Set(['SKILL.md.template', '.gitignore'])

function copyTreeFiltered(src, dst, exclude) {
  mkdirSync(dst, { recursive: true })
  let n = 0
  for (const entry of readdirSync(src)) {
    if (exclude.has(entry)) continue
    const s = join(src, entry)
    const d = join(dst, entry)
    if (statSync(s).isDirectory()) {
      n += copyTreeFiltered(s, d, exclude)
    } else {
      copyFileSync(s, d)
      n++
    }
  }
  return n
}

if (existsSync(CHAT_SRC)) {
  if (existsSync(CHAT_DST)) rmSync(CHAT_DST, { recursive: true, force: true })
  const chatCount = copyTreeFiltered(CHAT_SRC, CHAT_DST, CHAT_EXCLUDE)
  console.log(`[copy-skill] copied ${chatCount} chat variant files: ${CHAT_SRC} → ${CHAT_DST}`)
} else {
  console.warn(`[copy-skill] no chat variant found at ${CHAT_SRC} — skipping`)
}
