#!/usr/bin/env node

/**
 * Post-Build Audit Script
 *
 * Runs after every `pnpm build` to catch issues early.
 * Prints warnings but does NOT block the build (exit 0 always).
 *
 * Usage: Wired into build scripts — runs automatically.
 *
 * Security note: All commands are hardcoded strings (no user input).
 */

import { readFileSync } from 'fs'
import { join, resolve } from 'path'
import { globSync } from 'node:fs'

const ROOT = resolve(import.meta.dirname, '..')
const WARN = '\x1b[33m⚠\x1b[0m'
const PASS = '\x1b[32m✓\x1b[0m'

let warnings = 0

function warn(msg) {
  console.log(`  ${WARN} ${msg}`)
  warnings++
}

function pass(msg) {
  console.log(`  ${PASS} ${msg}`)
}

console.log('\n\x1b[1m🔍 Post-Build Audit\x1b[0m\n')

// ─── Check 1: No stale .js in core source ──────────────────

const staleJs = globSync('packages/core/src/ui/**/*.js', { cwd: ROOT })
if (staleJs.length > 0) {
  warn(`${staleJs.length} stale .js file(s) in core/src/ui/ — will shadow .tsx sources`)
  staleJs.forEach(f => console.log(`    ${f}`))
} else {
  pass('No stale .js in core/src/ui/')
}

// ─── Check 2: inject-use-client blast radius ────────────────

const PACKAGES = ['core', 'karm']

for (const pkg of PACKAGES) {
  const distDir = join(ROOT, 'packages', pkg, 'dist')
  const distFiles = globSync('**/*.js', { cwd: distDir })
  const useClientFiles = []

  for (const file of distFiles) {
    try {
      const first = readFileSync(join(distDir, file), 'utf-8').slice(0, 100)
      if (first.includes('"use client"') || first.includes("'use client'")) {
        useClientFiles.push(file)
      }
    } catch { /* skip unreadable */ }
  }

  const chunkFiles = useClientFiles.filter(f => f.includes('_chunks/'))
  if (chunkFiles.length > 0) {
    console.log(`  \x1b[36m${pkg}\x1b[0m: "use client" on ${useClientFiles.length} files (${chunkFiles.length} chunks)`)
    chunkFiles.forEach(f => console.log(`    _chunk: ${f}`))
  } else {
    pass(`${pkg}: "use client" on ${useClientFiles.length} files, 0 chunks`)
  }
}

// ─── Check 3: bg-surface-1 in dist (informational) ─────────
// Dist chunks merge files so filename-based filtering is unreliable.
// This is purely informational — real enforcement is in pre-publish-audit.mjs on source files.

for (const pkg of PACKAGES) {
  const distFiles = globSync('packages/' + pkg + '/dist/**/*.js', { cwd: ROOT })
  let surfaceCount = 0

  for (const file of distFiles) {
    const content = readFileSync(join(ROOT, file), 'utf-8')
    surfaceCount += (content.match(/bg-surface-1/g) || []).length
  }

  console.log(`  \x1b[36m${pkg}\x1b[0m: ${surfaceCount} bg-surface-1 in dist (includes legitimate overlays/dialogs)`)
}

// ─── Summary ────────────────────────────────────────────────

console.log()
if (warnings > 0) {
  console.log(`\x1b[33m⚠ ${warnings} warning(s) — review before publishing\x1b[0m\n`)
} else {
  console.log(`\x1b[32m✓ Build audit clean\x1b[0m\n`)
}

// Always exit 0 — this is advisory, not blocking
process.exit(0)
