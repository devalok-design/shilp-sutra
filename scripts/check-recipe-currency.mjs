#!/usr/bin/env node
/**
 * check-recipe-currency.mjs  (ADVISORY, network)
 *
 * Install recipes depend on THIRD-PARTY frameworks; when those change, a recipe
 * silently goes wrong (e.g. the TanStack Start recipe targeted the retired
 * @tanstack/start while the ecosystem moved to @tanstack/react-start).
 *
 * Mechanical limit — read this: npm signals catch only the EASY class. A
 * package that was **deprecated** or **unpublished/removed** is caught here. A
 * package that was **renamed/split** (like @tanstack/start → @tanstack/react-start)
 * is NOT: the old package often keeps publishing, so nothing mechanical flags
 * it. The rename/split class needs the scheduled AGENT review (see
 * .github/workflows or the /schedule routine) that re-reads each recipe against
 * the framework's CURRENT install docs. This script is the cheap first pass.
 *
 *   node scripts/check-recipe-currency.mjs
 */

import { execSync } from 'node:child_process'
import { readFileSync, readdirSync } from 'node:fs'
import { join, resolve } from 'node:path'

const RECIPES = resolve(import.meta.dirname, '..', 'packages', 'core', 'docs', 'recipes')
const STALE_MONTHS = 18

const files = readdirSync(RECIPES).filter((f) => f.startsWith('install-') && f.endsWith('.md'))
const pkgToRecipes = new Map()

for (const f of files) {
  const md = readFileSync(join(RECIPES, f), 'utf-8')
  const pkgs = new Set()
  // install commands: pnpm add / npm install / yarn add / bun add
  for (const m of md.matchAll(/(?:pnpm add|npm install|yarn add|bun add)(?:\s+-\w+)*\s+([^\n`]+)/g)) {
    for (const tok of m[1].split(/\s+/)) {
      const name = tok.replace(/@\^?[\d.]+$/, '') // strip @version
      if (/^(@[\w-]+\/[\w-]+|[a-z][\w-]+)$/.test(name) && !name.startsWith('@devalok/')) pkgs.add(name)
    }
  }
  for (const p of pkgs) {
    if (!pkgToRecipes.has(p)) pkgToRecipes.set(p, [])
    pkgToRecipes.get(p).push(f)
  }
}

console.log(`check-recipe-currency: ${pkgToRecipes.size} third-party packages referenced across ${files.length} recipes\n`)
const findings = []
for (const [pkg, recipes] of [...pkgToRecipes].sort()) {
  let meta
  try {
    meta = JSON.parse(execSync(`npm view ${pkg} deprecated time.modified --json`, { encoding: 'utf-8', stdio: ['ignore', 'pipe', 'ignore'] }) || '{}')
  } catch {
    findings.push(`✗ ${pkg} — NOT FOUND on npm (unpublished/removed?) [${recipes.join(', ')}]`)
    continue
  }
  const deprecated = meta.deprecated
  const modified = meta['time.modified'] || meta.modified
  if (deprecated) findings.push(`⚠ ${pkg} — DEPRECATED: ${String(deprecated).slice(0, 100)} [${recipes.join(', ')}]`)
  else if (modified) {
    const months = (Date.now() - new Date(modified).getTime()) / (1000 * 60 * 60 * 24 * 30)
    if (months > STALE_MONTHS) findings.push(`⚠ ${pkg} — last published ${Math.round(months)} months ago (stale?) [${recipes.join(', ')}]`)
  }
}

if (findings.length) {
  console.log('Findings (review — mechanical, misses renames/splits):')
  for (const f of findings) console.log(`  ${f}`)
} else {
  console.log('No deprecated / unpublished / stale packages referenced. (Rename/split drift still needs agent review.)')
}
process.exit(0)
