#!/usr/bin/env node
/**
 * apply-text-ramp.mjs
 *
 * Applies the HIGH-CONFIDENCE text-ds-* → ramp swaps proposed by
 * propose-text-ramp.mjs. Low-confidence sites are left untouched for manual
 * review. Explicit `font-*` / `leading-*` on the same element are kept (they
 * override the ramp, preserving current visuals) — a later optional pass can
 * strip the now-redundant ones once Chromatic confirms the ramp defaults match.
 *
 * DEFAULT = dry-run (counts only). Pass --write to mutate files.
 * Verify after: pnpm typecheck && pnpm build, then Storybook/Chromatic visual diff.
 *
 * Usage (from packages/core/):
 *   node scripts/apply-text-ramp.mjs           # dry-run report
 *   node scripts/apply-text-ramp.mjs --write   # apply high-confidence swaps
 */
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = join(HERE, '..')
const SRC = join(ROOT, 'src')
const SCAN_DIRS = ['ui', 'composed', 'shell', 'ai']
const WRITE = process.argv.includes('--write')

// Must mirror propose-text-ramp.mjs exactly.
const SIZE = {
  '2xs': { tier: 'xs', head: null }, xs: { tier: 'xs', head: null },
  sm: { tier: 'sm', head: null }, md: { tier: 'md', head: null },
  base: { tier: 'lg', head: null }, lg: { tier: 'lg', head: 'xs' },
  xl: { tier: null, head: 'sm' }, '2xl': { tier: null, head: 'md' },
  '3xl': { tier: null, head: 'lg' }, '4xl': { tier: null, head: 'xl' },
}

function propose(sizeKey, ctx) {
  const spec = SIZE[sizeKey]
  if (!spec) return { variant: null, confidence: 'low' }
  const hasUpper = /\buppercase\b/.test(ctx)
  const hasMuted = /text-surface-fg-(muted|subtle)/.test(ctx)
  if (!spec.tier && spec.head) return { variant: `heading-${spec.head}`, confidence: 'high' }
  if (hasUpper) return { variant: `label-${spec.tier}`, confidence: 'high' }
  // Locked (low-confidence review, 2026-07-23):
  if (sizeKey === 'lg') return { variant: 'heading-xs', confidence: 'high' } // text-ds-lg (18px) → heading-xs (20px, Manrope)
  if ((sizeKey === 'xs' || sizeKey === '2xs') && hasMuted) return { variant: 'caption', confidence: 'high' } // small + muted → caption
  return { variant: `body-${spec.tier}`, confidence: 'high' }
}

function scan(dir, files) {
  let entries
  try { entries = readdirSync(dir) } catch { return }
  for (const e of entries) {
    const p = join(dir, e)
    const s = statSync(p)
    if (s.isDirectory()) { scan(p, files); continue }
    if (!p.endsWith('.tsx')) continue
    if (/\.(test|stories)\.tsx$/.test(p)) continue
    files.push(p)
  }
}

const files = []
for (const d of SCAN_DIRS) scan(join(SRC, d), files)

let totalSwaps = 0
let filesChanged = 0
const perFile = []

for (const file of files) {
  const rel = relative(ROOT, file).replace(/\\/g, '/')
  const orig = readFileSync(file, 'utf8')
  let swaps = 0
  const out = orig.split('\n').map((line) => {
    return line.replace(/\btext-ds-([0-9a-z]+)\b/g, (full, size) => {
      const p = propose(size, line) // context = original line
      if (p.confidence === 'high' && p.variant) { swaps++; return `text-${p.variant}` }
      return full
    })
  }).join('\n')
  if (swaps > 0) {
    totalSwaps += swaps
    filesChanged++
    perFile.push({ rel, swaps })
    if (WRITE) writeFileSync(file, out)
  }
}

perFile.sort((a, b) => b.swaps - a.swaps)
console.log(`\n  text-ds-* → ramp ${WRITE ? 'APPLIED' : '(dry-run)'}`)
console.log(`  ${totalSwaps} high-confidence swaps across ${filesChanged} files\n`)
for (const f of perFile.slice(0, 15)) console.log(`  ${String(f.swaps).padStart(3)}  ${f.rel}`)
if (perFile.length > 15) console.log(`  … +${perFile.length - 15} more files`)
if (!WRITE) console.log(`\n  Dry-run. Re-run with --write to apply, then: pnpm typecheck && pnpm build → visual diff.\n`)
else console.log(`\n  Applied. Next: pnpm typecheck && pnpm build, then Storybook/Chromatic visual diff.\n`)
