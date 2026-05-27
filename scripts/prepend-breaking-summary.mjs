#!/usr/bin/env node
/**
 * prepend-breaking-summary.mjs
 *
 * Runs AFTER `changeset version` (chained in `pnpm version-packages`). Changesets
 * orders CHANGELOG entries by changeset filename, not severity, so a genuinely
 * breaking `feat!` entry can land below several "non-breaking" ones — a reader
 * skimming top-down relaxes before reaching the break (devalok-design/shilp-sutra#62).
 *
 * This prepends a `> ⚠️ Breaking in X.Y.Z` callout to the top of the newest
 * version section, listing every entry that signals a breaking change, so the
 * break is the FIRST thing a human or agent reads.
 *
 * Breaking signal (deliberately tight to avoid false positives like
 * "non-breaking" or "breaking-change migrations"):
 *   - a Conventional Commits breaking marker — `feat!` / `fix!` / `perf!` /
 *     `refactor!` / `build!` / `chore!`, or a bare `!:`
 *   - a bolded breaking lead `**Breaking.` / `**Breaking:` NOT preceded by `non-`
 *
 * This catches PROPERLY-LABELLED breaking changes. A change mislabelled
 * "non-breaking" (e.g. a type narrowing — see #61) will NOT be caught here — that
 * is what the CLAUDE.md "narrowing is breaking" rule + the /publish-release
 * checklist exist to catch. Defense in depth: tool for marked breaks, human rule
 * for mislabels.
 *
 * Idempotent: if the newest section already has the callout, it is regenerated
 * in place rather than duplicated. No breaking entries → no block (and any stale
 * block from a previous run is removed).
 *
 * Operates on every published package's CHANGELOG.
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')

const CHANGELOGS = [
  'packages/core/CHANGELOG.md',
  'packages/eslint-plugin/CHANGELOG.md',
  'packages/brand/CHANGELOG.md',
]

const CALLOUT_START = '<!-- breaking-summary:start -->'
const CALLOUT_END = '<!-- breaking-summary:end -->'

const BREAKING_RE = /\b(?:feat|fix|perf|refactor|build|chore)!|!:|(?<!non[- ])\*\*Breaking[.:]/i

/** Strip any existing callout block from a section. */
function stripCallout(section) {
  const start = section.indexOf(CALLOUT_START)
  const end = section.indexOf(CALLOUT_END)
  if (start === -1 || end === -1) return section
  const before = section.slice(0, start).replace(/\n+$/, '\n')
  const after = section.slice(end + CALLOUT_END.length).replace(/^\n+/, '\n')
  return before + after
}

/** Extract per-entry headlines that signal a breaking change. */
function findBreakingHeadlines(sectionBody) {
  const out = []
  // changeset entries are top-level bullets: `- [#PR] ... ! - <headline>` or `- <headline>`
  // Capture the first line of each `- ` bullet.
  const lines = sectionBody.split('\n')
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i]
    if (!/^- /.test(l)) continue
    // a bullet's "scope" for breaking detection = its first line + the immediate body lines
    // until the next top-level bullet (cheap: scan ahead a few lines)
    let scope = l
    for (let j = i + 1; j < lines.length && j < i + 8 && !/^- /.test(lines[j]) && !/^## /.test(lines[j]); j++) {
      scope += '\n' + lines[j]
    }
    if (!BREAKING_RE.test(scope)) continue
    // headline = text after the changeset attribution `! - ` if present, else the bullet text
    let headline = l.replace(/^- /, '')
    const dashIdx = headline.indexOf('! - ')
    if (dashIdx !== -1) headline = headline.slice(dashIdx + 4)
    headline = headline.replace(/^\*\*|\*\*$/g, '').trim()
    // collapse markdown links/backticks lightly for the summary
    out.push(headline)
  }
  return out
}

let changed = 0

for (const rel of CHANGELOGS) {
  const path = join(ROOT, rel)
  if (!existsSync(path)) continue
  // Normalise CRLF → LF for processing; rewritten LF (git autocrlf restores
  // platform endings on checkout, matching every other generated doc here).
  const md = readFileSync(path, 'utf-8').replace(/\r\n/g, '\n')

  // Span of the newest version section: from the first `## ` to just before the
  // next `## ` (or EOF). We splice in place and leave the rest byte-for-byte.
  const firstH2 = md.search(/^## /m)
  if (firstH2 === -1) continue
  const afterFirst = md.slice(firstH2 + 3)
  const nextRel = afterFirst.search(/^## /m)
  const sectionEnd = nextRel === -1 ? md.length : firstH2 + 3 + nextRel
  const before = md.slice(0, firstH2)
  const section = md.slice(firstH2, sectionEnd)
  const after = md.slice(sectionEnd)

  const versionMatch = section.match(/^## (\S+)/)
  if (!versionMatch) continue
  const version = versionMatch[1]

  const cleaned = stripCallout(section)
  const headerEnd = cleaned.indexOf('\n')
  const header = cleaned.slice(0, headerEnd)
  // Body after the header, leading + trailing blank lines stripped.
  const body = cleaned.slice(headerEnd + 1).replace(/^\n+/, '').replace(/\n+$/, '')

  const breaking = findBreakingHeadlines(body)

  let rebuiltSection
  if (breaking.length === 0) {
    rebuiltSection = `${header}\n\n${body}\n`
  } else {
    const block = [
      CALLOUT_START,
      `> ### ⚠️ Breaking in ${version}`,
      '>',
      ...breaking.map((h) => `> - ${h}`),
      '>',
      '> See [`MIGRATION.md`](../../MIGRATION.md) and `docs/recipes/upgrading.md` before bumping.',
      CALLOUT_END,
    ].join('\n')
    rebuiltSection = `${header}\n\n${block}\n\n${body}\n`
  }
  // Preserve the original single blank line between this section and the next.
  const next = `${before}${rebuiltSection}${after.startsWith('\n') ? after : '\n' + after}`

  if (next !== md) {
    writeFileSync(path, next)
    changed++
    console.log(`[breaking-summary] ${rel}: ${breaking.length} breaking entr${breaking.length === 1 ? 'y' : 'ies'} summarised for ${version}`)
  }
}

if (changed === 0) console.log('[breaking-summary] no changes')
