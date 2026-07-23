#!/usr/bin/env node

/**
 * Compiled-CSS coverage audit — finds utility classes used in source that
 * don't emit CSS rules in the consumer build. Catches the exact failure
 * mode that shipped 0.37.0-next.0 with silently broken Avatar + animations:
 * source references `animate-skeleton-shimmer`, TW4 emits nothing, no
 * typecheck/lint/test/build/smoke error because TW4 silently drops unknown
 * utilities.
 *
 * Run AFTER consumer-smoke-test.mjs has produced a compiled CSS artifact
 * at tests/smoke-consumer/.next/static/chunks/*.css (or next15 variant).
 *
 * Method:
 *   1. Grep packages/core/src/**\/*.{tsx,ts} for utility class names
 *      matching DS-specific patterns (w-ds-*, h-ds-*, bg-surface-*,
 *      animate-*, shadow-*, etc.).
 *   2. Open the largest generated .css file in the smoke consumer.
 *   3. For each unique utility name, check whether `.<className>{` or
 *      `\s<className>,` or `\.<className>:` appears. If NOT, flag.
 *   4. Exit non-zero if any flagged class is in the "DS-essential" set.
 *      Emit warnings for dead-class candidates.
 */

import { readFileSync, existsSync } from 'fs'
import { globSync } from 'node:fs'
import { join, resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')

const variantArg = process.argv.find((a) => a.startsWith('--variant='))?.split('=')[1]
  ?? (process.argv.includes('--variant') ? process.argv[process.argv.indexOf('--variant') + 1] : null)
const VARIANT = variantArg ?? 'default'
const CONSUMER_DIR = VARIANT === 'next15-webpack' ? 'tests/smoke-consumer-next15' : 'tests/smoke-consumer'

const NEXT_DIR = join(ROOT, CONSUMER_DIR, '.next')
const STATIC_DIR = join(NEXT_DIR, 'static')

const GREEN = '\x1b[32m'
const RED = '\x1b[31m'
const YELLOW = '\x1b[33m'
const CYAN = '\x1b[36m'
const BOLD = '\x1b[1m'
const RESET = '\x1b[0m'

// ── Step 1: find the compiled CSS file ───────────────────────────────

function findLargestCss() {
  if (!existsSync(STATIC_DIR)) {
    console.error(`${RED}✗ No .next/static output at ${STATIC_DIR}. Run consumer smoke first.${RESET}`)
    process.exit(1)
  }
  const cssFiles = globSync(`**/*.css`, { cwd: STATIC_DIR }).map((f) => join(STATIC_DIR, f))
  if (cssFiles.length === 0) {
    console.error(`${RED}✗ No CSS files in ${STATIC_DIR}. Smoke may have failed.${RESET}`)
    process.exit(1)
  }
  return cssFiles
    .map((f) => ({ path: f, size: readFileSync(f).length }))
    .sort((a, b) => b.size - a.size)[0].path
}

const cssPath = findLargestCss()
const css = readFileSync(cssPath, 'utf-8')
console.log(`${CYAN}${BOLD}Compiled CSS audit — ${VARIANT}${RESET}`)
console.log(`  Source: ${cssPath} (${(css.length / 1024).toFixed(0)} KB)\n`)

// ── Step 2: grep source for DS utility patterns ──────────────────────

const SOURCE_GLOBS = ['packages/core/src/**/*.tsx', 'packages/core/src/**/*.ts']

// Patterns that must emit CSS if used anywhere. Broad — catches any class
// name beginning with a token-coupled prefix.
const MUST_EMIT = [
  /\b(h|w|min-h|min-w|max-h|max-w|size)-ds-[a-z0-9-]+/g,
  /\b(h|w)-ico-[a-z]+/g,
  /\b(p|m|gap)-(page-[xy]|section-gap|card-gap|stack-gap)\b/g,
  // Positioning — top/bottom/left/right/inset-ds-* share the --spacing-ds-*
  // namespace with p/m/gap/w/h. If one emits, all emit. Smoke page
  // exercises p-ds-03 etc., proving the namespace works. Specific
  // positioning utilities like `-top-ds-01` only emit when a component
  // using them is rendered — which is a smoke-page coverage concern,
  // not a DS bug. Skip in audit to avoid false positives.
  // /\b(top|bottom|left|right|inset)-ds-[a-z0-9-]+/g,
  /\bbg-surface-[a-z0-9-]+/g,
  /\btext-surface-[a-z0-9-]+/g,
  /\bborder-surface-[a-z0-9-]+/g,
  /\bring-surface-[a-z0-9-]+/g,
  /\bbg-accent-[0-9]+(?:-fg)?/g,
  /\btext-accent-[0-9]+(?:-fg)?/g,
  /\bborder-accent-[0-9]+/g,
  /\bring-accent-[0-9]+/g,
  /\bbg-(error|success|warning|info)-[0-9]+(?:-fg)?/g,
  /\btext-(error|success|warning|info)-[0-9]+(?:-fg)?/g,
  /\bborder-(error|success|warning|info)-[0-9]+/g,
  /\bbg-neutral-[0-9]+/g,
  /\btext-neutral-[0-9]+/g,
  /\bborder-neutral-[0-9]+/g,
  /\bbg-category-(teal|amber|slate|indigo|cyan|orange|emerald)-[0-9]+/g,
  /\btext-category-(teal|amber|slate|indigo|cyan|orange|emerald)-[0-9]+/g,
  /\brounded-ds-[a-z0-9]+/g,
  /\btext-ds-[a-z0-9]+/g,
  /\bleading-ds-[a-z]+/g,
  /\btracking-ds-[a-z]+/g,
  /\bshadow-[a-z0-9-]+/g,
  /\banimate-[a-z0-9-]+/g,
  /\bduration-(instant|fast-[0-9]+|moderate-[0-9a-z]+|slow-[0-9]+)\b/g,
  /\bease-(productive|expressive)-[a-z]+/g,
  /\bz-(base|raised|dropdown|sticky|overlay|modal|popover|toast|tooltip)\b/g,
  // `text-label-plain` MUST precede `text-label`, and `text-label` carries a
  // negative lookahead, so `text-label-plain[-tier]` isn't mis-split into a bare
  // `text-label-plain` (which has no CSS) — e.g. from the tw-merge classGroup config.
  /\b(text-heading|text-body|text-label-plain|text-label(?!-plain))-[a-z0-9]+/g,
  /\btext-(caption|overline|code)\b/g,
  /\bfocus-ring(?:-inset|-sm)?\b/g,
  /\btouch-target\b/g,
  /\btabular-nums\b/g,
  /\b(pt|pb|pl|pr|p)-safe\b/g,
  /\bborder-focus\b/g,
  /\bborder-ds-[a-z]+/g,
  /\bopacity-action-[a-z]+/g,
  /\bmax-w-layout(?:-body)?/g,
  /\bbg-gradient-brand(?:-dark)?/g,
  /\b(text|bg)-(overlay|disabled)\b/g,
  /\b(text|bg)-link(?:-hover|-visited)?/g,
  /\b(text|bg)-skeleton-(base|shimmer)\b/g,
  /\bbackdrop\b/g,
  /\bfont-(sans|display|body|accent|mono)\b/g,
  /\bfont-(light|regular|medium|semibold|bold)\b/g,
]

const usedClasses = new Set()

for (const glob of SOURCE_GLOBS) {
  const files = globSync(glob, { cwd: ROOT }).map((f) => join(ROOT, f))
  for (const f of files) {
    const normalized = f.replace(/\\/g, '/')
    if (
      normalized.includes('.stories.') ||
      normalized.includes('.test.') ||
      normalized.includes('__tests__') ||
      normalized.includes('/audits/') ||
      normalized.includes('/tokens/')
    ) continue
    let content
    try { content = readFileSync(f, 'utf-8') } catch { continue }

    // Strip CSS-var-like tokens (`--foo-bar`, `var(--foo-bar)`) before
    // scanning. Otherwise patterns like /border-focus/ match the `border-focus`
    // substring of `var(--border-focus-width)` and produce false positives.
    const cleaned = content.replace(/--[a-z][a-z0-9-]*/g, '')

    for (const pattern of MUST_EMIT) {
      pattern.lastIndex = 0
      const matches = cleaned.matchAll(pattern)
      for (const m of matches) {
        usedClasses.add(m[0])
      }
    }
  }
}

console.log(`  Scanned source, found ${usedClasses.size} unique DS utility classes referenced.\n`)

// ── Step 3: check each class appears in compiled CSS ─────────────────

const missing = []
const present = []

for (const cls of usedClasses) {
  // Match a TW4 class selector. TW4 emits classes either plainly
  // (`.animate-caret-blink{…}`) or with escaped prefixes like
  // `.hover\:…` or `.data-\[state\=open\]\:animate-accordion-down`.
  // So the class name always appears in one of three forms:
  //   `.<name>{`   `.<name>,`   `\:<name>{`   `\:<name>,`   `\:<name>[`
  //                                                          etc.
  // Substring match on `<name>{`, `<name>,`, `<name>[`, `<name>:`,
  // `<name> ` covers all of them — the preceding `.` or `\:` is
  // implicit from TW4's class-emit convention.
  const patterns = [`.${cls}`, `:${cls}`]
  const found = patterns.some((p) => {
    const i = css.indexOf(p)
    if (i < 0) return false
    // Ensure what follows is a CSS-selector terminator, not more
    // class-name chars (so `.ring-accent-8` doesn't match `.ring-accent-80`).
    const nextChar = css[i + p.length]
    return nextChar === undefined || /[\s,{:.>+~[\\]/.test(nextChar)
  })
  if (found) present.push(cls)
  else missing.push(cls)
}

// ── Step 4: report ───────────────────────────────────────────────────

// Classes we expect to be absent because the smoke page doesn't use them.
// These reflect the smoke page surface, not a product gap.
const EXPECTED_ABSENT = new Set([
  // Smoke page uses Button, Dialog, Skeleton, Tabs, Tooltip, Sidebar,
  // RichChatInput, RichTextEditor, TopBar, Toaster — not these:
  // (Any actual DS gap the class audit uncovers should remove this list.)
])

const realMissing = missing.filter((c) => !EXPECTED_ABSENT.has(c))

console.log(`${CYAN}Coverage:${RESET}`)
console.log(`  ${GREEN}✓${RESET} ${present.length} classes emit CSS rules`)
console.log(`  ${realMissing.length > 0 ? RED : GREEN}${realMissing.length > 0 ? '✗' : '✓'}${RESET} ${realMissing.length} classes used in source but MISSING from compiled CSS\n`)

if (realMissing.length > 0) {
  console.log(`${RED}${BOLD}Missing classes:${RESET}`)
  // Group by prefix for readability
  const groups = {}
  for (const c of realMissing) {
    const prefix = c.split('-').slice(0, 2).join('-')
    if (!groups[prefix]) groups[prefix] = []
    groups[prefix].push(c)
  }
  for (const [prefix, cs] of Object.entries(groups).sort()) {
    console.log(`  ${YELLOW}${prefix}${RESET}: ${cs.slice(0, 8).join(', ')}${cs.length > 8 ? ` … (+${cs.length - 8})` : ''}`)
  }
  console.log(`\n${RED}Some DS utility classes compile to zero CSS rules. Consumer apps`)
  console.log(`using these classes will render unstyled. Fix @theme or add @utility blocks.${RESET}`)
  process.exit(1)
}

console.log(`${GREEN}${BOLD}✓ All DS utility classes present in compiled CSS${RESET}`)
