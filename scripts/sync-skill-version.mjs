#!/usr/bin/env node
/**
 * Sync skill metadata.version to packages/core/package.json#version.
 *
 * Chained into `pnpm version-packages` (after `changeset version` bumps
 * packages/core/package.json) so the agent skill never drifts from the
 * package it describes. The pre-publish-audit gate
 * "skill/SKILL.md metadata.version matches packages/core/package.json#version"
 * fails the release otherwise.
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')

const pkg = JSON.parse(readFileSync(join(ROOT, 'packages/core/package.json'), 'utf-8'))
const targetVersion = pkg.version

const skillPaths = [
  join(ROOT, 'skills/shilp-sutra/SKILL.md'),
  join(ROOT, 'packages/core/skill/SKILL.md'),
]

let changed = 0
for (const p of skillPaths) {
  if (!existsSync(p)) continue
  const original = readFileSync(p, 'utf-8')
  const updated = original.replace(
    /^(\s*version:\s*)["'][^"']+["']/m,
    (_, prefix) => `${prefix}"${targetVersion}"`,
  )
  if (updated !== original) {
    writeFileSync(p, updated)
    console.log(`[sync-skill-version] ${p.replace(ROOT, '').replace(/\\/g, '/')} -> ${targetVersion}`)
    changed++
  }
}

if (changed === 0) console.log(`[sync-skill-version] already at ${targetVersion}, no-op`)
