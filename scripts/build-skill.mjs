#!/usr/bin/env node
/**
 * Build the bundled Agent Skill from existing sources.
 *
 * Mirrors:
 *   packages/core/llms.txt              -> skills/shilp-sutra/references/components.md
 *   packages/core/docs/recipes/*.md     -> skills/shilp-sutra/references/setup-*.md (and others)
 *
 * Run via: node scripts/build-skill.mjs
 *
 * Pre-publish audit calls this script with --check to verify the bundled
 * references are in sync with the source files. CI fails if they diverge.
 */

import { copyFileSync, mkdirSync, readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createHash } from 'node:crypto'

const __filename = fileURLToPath(import.meta.url)
const repoRoot = resolve(dirname(__filename), '..')
const skillRoot = join(repoRoot, 'skills', 'shilp-sutra')
const refsDir = join(skillRoot, 'references')

const recipeDir = join(repoRoot, 'packages', 'core', 'docs', 'recipes')

const transfers = [
  // Component reference (router — llms-full.txt removed in 0.45; per-component
  // detail lives in docs/components/**/*.md and mcp-manifest.json)
  {
    src: join(repoRoot, 'packages', 'core', 'llms.txt'),
    dst: join(refsDir, 'components.md'),
    header: `<!-- Source: packages/core/llms.txt — do not edit directly. Regenerate with \`node scripts/build-skill.mjs\`. -->\n\n`,
  },
  // Setup recipes (rename install-* -> setup-*)
  ...readdirSync(recipeDir)
    .filter((f) => f.startsWith('install-') && f.endsWith('.md'))
    .map((f) => ({
      src: join(recipeDir, f),
      dst: join(refsDir, f.replace(/^install-/, 'setup-')),
      header: `<!-- Source: packages/core/docs/recipes/${f} — do not edit directly. Regenerate with \`node scripts/build-skill.mjs\`. -->\n\n`,
    })),
  // Non-install recipes (customize-brand, server-components, troubleshoot)
  ...readdirSync(recipeDir)
    .filter((f) => !f.startsWith('install-') && f.endsWith('.md') && f !== 'index.md')
    .map((f) => ({
      src: join(recipeDir, f),
      dst: join(refsDir, f),
      header: `<!-- Source: packages/core/docs/recipes/${f} — do not edit directly. Regenerate with \`node scripts/build-skill.mjs\`. -->\n\n`,
    })),
]

const LICENSE_SRC = join(repoRoot, 'LICENSE')
const LICENSE_DST = join(skillRoot, 'LICENSE')

const checkMode = process.argv.includes('--check')

function digest(content) {
  return createHash('sha256').update(content).digest('hex')
}

function read(file) {
  return readFileSync(file, 'utf8')
}

let driftCount = 0
const driftFiles = []

mkdirSync(refsDir, { recursive: true })

for (const t of transfers) {
  if (!existsSync(t.src)) {
    console.error(`[build-skill] MISSING SOURCE: ${t.src}`)
    process.exit(1)
  }
  const srcContent = read(t.src)
  const dstContent = t.header + srcContent

  if (checkMode) {
    if (!existsSync(t.dst) || digest(read(t.dst)) !== digest(dstContent)) {
      driftCount++
      driftFiles.push(t.dst.replace(repoRoot + '\\', '').replace(repoRoot + '/', ''))
    }
  } else {
    writeFileSync(t.dst, dstContent)
    console.log(`[build-skill] wrote ${t.dst.replace(repoRoot + '\\', '').replace(repoRoot + '/', '')}`)
  }
}

// LICENSE
if (checkMode) {
  if (!existsSync(LICENSE_DST) || digest(read(LICENSE_DST)) !== digest(read(LICENSE_SRC))) {
    driftCount++
    driftFiles.push('skills/shilp-sutra/LICENSE')
  }
} else {
  copyFileSync(LICENSE_SRC, LICENSE_DST)
  console.log(`[build-skill] wrote skills/shilp-sutra/LICENSE`)
}

if (checkMode) {
  if (driftCount > 0) {
    console.error(`\n[build-skill] DRIFT detected in ${driftCount} file(s):`)
    for (const f of driftFiles) console.error(`  - ${f}`)
    console.error(`\nRun: node scripts/build-skill.mjs`)
    process.exit(1)
  }
  console.log(`[build-skill] OK — skill references in sync (${transfers.length + 1} files checked)`)
} else {
  console.log(`\n[build-skill] done. ${transfers.length + 1} files written.`)
}
