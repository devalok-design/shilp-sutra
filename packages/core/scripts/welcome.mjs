#!/usr/bin/env node
/**
 * Postinstall welcome banner for @devalok/shilp-sutra.
 *
 * Runs once per major.minor version on consumer install. Silent under CI,
 * non-TTY environments, NO_COLOR, npm silent loglevel, or when the
 * SHILP_SUTRA_NO_WELCOME env var is set. Falls back to a compact 6-line
 * text block if the terminal is narrower than 70 columns or shorter than
 * 28 rows. Never throws — wrapped in a try/catch so an internal error can
 * never break the consumer install.
 *
 * Safety guards (industry best practice — see research notes in
 * .changeset/wave-4-install-experience.md):
 *
 *   - process.env.CI                          → silent (avoid log noise on CI)
 *   - process.env.SHILP_SUTRA_NO_WELCOME=1    → silent (user opt-out)
 *   - process.env.NO_COLOR                    → plain text, no ANSI
 *   - process.stdout.isTTY === false          → silent (piped builds, Docker)
 *   - npm_config_loglevel === 'silent'        → silent (respect pkg manager)
 *   - !INIT_CWD || INIT_CWD inside the package → silent (dev install, not consumer)
 *   - Sentinel file with current version       → silent on re-install of same ver
 *   - try/catch around everything              → always exit 0
 *
 * The sentinel encodes the version (`node_modules/.shilp-sutra-welcomed`)
 * so version bumps re-fire the banner once.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PKG_DIR = resolve(__dirname, '..')

// ── Guard rails — bail out early if any condition says "silent". ────────────
function shouldSkip() {
  if (process.env.CI) return 'CI environment'
  if (process.env.SHILP_SUTRA_NO_WELCOME === '1' || process.env.SHILP_SUTRA_NO_WELCOME === 'true') return 'SHILP_SUTRA_NO_WELCOME set'
  if (process.env.npm_config_loglevel === 'silent') return 'npm silent loglevel'
  if (!process.stdout.isTTY) return 'not a TTY (piped/Docker/etc.)'
  // Dev install — we're inside the design-system repo itself, not a consumer
  const initCwd = process.env.INIT_CWD || process.cwd()
  const cwd = process.cwd()
  const isInsideNodeModules = cwd.includes(`${process.platform === 'win32' ? '\\' : '/'}node_modules${process.platform === 'win32' ? '\\' : '/'}`) || cwd.includes('/node_modules/')
  if (!isInsideNodeModules) return 'dev install (not running from node_modules/)'
  // INIT_CWD points at the consumer's project root. If absent → odd setup; skip.
  if (!initCwd || initCwd === cwd) return 'no INIT_CWD set (unusual install context)'
  return null
}

function readPkgVersion() {
  try {
    const pkg = JSON.parse(readFileSync(join(PKG_DIR, 'package.json'), 'utf-8'))
    return pkg.version
  } catch {
    return null
  }
}

// Sentinel: re-fire only on version change. Stored at the workspace root's
// node_modules/.shilp-sutra-welcomed so it survives pnpm dedupe rebuilds.
function getSentinelPath() {
  // Walk up from PKG_DIR (node_modules/@devalok/shilp-sutra/) to the
  // enclosing node_modules/ root, then write inside it.
  const parts = PKG_DIR.split(/[/\\]/)
  const nmIdx = parts.lastIndexOf('node_modules')
  if (nmIdx === -1) return null
  const nmRoot = parts.slice(0, nmIdx + 1).join(process.platform === 'win32' ? '\\' : '/')
  return join(nmRoot, '.shilp-sutra-welcomed')
}

function alreadyWelcomed(version) {
  const sentinel = getSentinelPath()
  if (!sentinel) return false
  try {
    if (!existsSync(sentinel)) return false
    const previousVersion = readFileSync(sentinel, 'utf-8').trim()
    return previousVersion === version
  } catch {
    return false
  }
}

// Returns the version recorded in the sentinel from a prior install, or null
// on first install / unreadable sentinel. Used to detect a version JUMP so the
// banner can point upgraders at MIGRATION.md.
function getPreviousVersion() {
  const sentinel = getSentinelPath()
  if (!sentinel) return null
  try {
    if (!existsSync(sentinel)) return null
    const prev = readFileSync(sentinel, 'utf-8').trim()
    return prev || null
  } catch {
    return null
  }
}

function markWelcomed(version) {
  const sentinel = getSentinelPath()
  if (!sentinel) return
  try {
    mkdirSync(dirname(sentinel), { recursive: true })
    writeFileSync(sentinel, version + '\n')
  } catch {
    // ignored — banner already printed, sentinel write is best-effort
  }
}

// ── ANSI rendering ──────────────────────────────────────────────────────────
const useColor = !process.env.NO_COLOR && process.stdout.isTTY

// Devalok pink #d946a6 = RGB(217, 70, 166)
const PINK = useColor ? '\x1b[38;2;217;70;166m' : ''
const PINK_DIM = useColor ? '\x1b[38;2;167;55;128m' : ''
const BOLD = useColor ? '\x1b[1m' : ''
const DIM = useColor ? '\x1b[2m' : ''
const RESET = useColor ? '\x1b[0m' : ''

function colour(text, code) {
  return useColor ? `${code}${text}${RESET}` : text
}

// Lotus — 13 rows × 30 cols Braille. Centered in a 63-col inner box (16 left,
// 17 right padding).
const LOTUS = [
  '⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣰⣦⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀',
  '⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣴⠟⠹⣧⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀',
  '⠀⠀⠀⠀⠀⠀⠀⠀⣷⣦⣄⣠⣿⠃⢠⣄⠈⢻⣆⣠⣴⡞⡆⠀⠀⠀⠀⠀⠀⠀',
  '⠀⠀⠀⠀⠀⢀⣀⣀⣿⠀⠈⢻⣇⢀⣾⢟⡄⣸⡿⠋⠀⡇⣇⣀⣀⠀⠀⠀⠀⠀',
  '⠀⣤⣤⣤⣀⣱⢻⠚⠻⣧⣀⠀⢹⡿⠃⠈⢻⣟⠀⢀⣤⠧⠓⣹⣟⣀⣤⣤⣤⡀',
  '⠀⠈⠻⣧⠉⠛⣽⠀⠀⠀⠙⣷⡿⠁⠀⠀⠀⢻⣶⠛⠁⠀⠀⡟⠟⠉⣵⡟⠁⠀',
  '⠀⠀⠀⠹⣧⡀⠏⡇⠀⠀⠀⣿⠁⠀⠀⠀⠀⠀⣿⡄⠀⠀⢠⢷⠀⣼⡟⠀⠀⠀',
  '⠀⠀⠀⠀⠙⣟⢼⡹⡄⠀⠀⣿⡄⠀⠀⠀⠀⢀⣿⡇⠀⢀⣞⣦⢾⠟⠀⠀⠀⠀',
  '⠀⠠⢶⣿⣛⠛⢒⣭⢻⣶⣤⣹⣿⣤⣀⣀⣠⣾⣟⣠⣔⡛⢫⣐⠛⢛⣻⣶⠆⠀',
  '⠀⠀⠀⠉⣻⡽⠛⠉⠁⠀⠉⢙⣿⠖⠒⠛⠻⣿⡋⠉⠁⠈⠉⠙⢿⣿⠉⠀⠀⠀',
  '⠀⠀⠀⠸⠿⠷⠒⣦⣤⣴⣶⢿⣿⡀⠀⠀⠀⣽⡿⢷⣦⠤⢤⡖⠶⠿⠧⠀⠀⠀',
  '⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠛⢿⣦⣴⡾⠟⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀',
  '⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠙⠟⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀',
]

const TOP = '╭───────────────────────────────────────────────────────────────╮'
const BOTTOM = '╰───────────────────────────────────────────────────────────────╯'
const EMPTY = '│                                                               │'
const INNER_WIDTH = 63

function row(content) {
  // content is a string of visible chars (ANSI-stripped width assumed equal to char count for ASCII)
  // We can't easily measure visible width when ANSI codes are present, so always pad based on the
  // PASSED visibleWidth in callers that contain colour. For plain rows, fall back to .length.
  const visible = content.replace(/\x1b\[[0-9;]*m/g, '')
  const padLen = Math.max(0, INNER_WIDTH - visible.length)
  return `│${content}${' '.repeat(padLen)}│`
}

function centeredLotusRow(braille) {
  // 30-col Braille row, 16-left + 17-right padding
  return `│                ${colour(braille, PINK)}                 │`
}

function buildFullBanner(version, prevVersion) {
  const lines = []
  lines.push(colour(TOP, PINK_DIM))
  lines.push(colour(EMPTY, PINK_DIM))
  for (const lotusRow of LOTUS) {
    lines.push(`${colour('│', PINK_DIM)}                ${colour(lotusRow, PINK)}                 ${colour('│', PINK_DIM)}`)
  }
  lines.push(colour(EMPTY, PINK_DIM))
  if (prevVersion && prevVersion !== version) {
    lines.push(row(`   ${colour('✦', PINK)}  ${colour('@devalok/shilp-sutra', BOLD)}  ${prevVersion} → ${version}`))
    lines.push(row(`   ${colour('⚠', PINK)} ${colour('Version changed — review breaking changes before deploy:', BOLD)}`))
    lines.push(row(`     ${colour('node_modules/@devalok/shilp-sutra/MIGRATION.md', DIM)}`))
    lines.push(row(`     ${colour('+ docs/recipes/upgrading.md (safe-upgrade procedure)', DIM)}`))
  } else {
    lines.push(row(`   ${colour('✦', PINK)}  ${colour('@devalok/shilp-sutra', BOLD)}  ${version}`))
    lines.push(row(`      ${colour('Tailwind 4 design system · 120+ components · RSC-safe', DIM)}`))
  }
  lines.push(colour(EMPTY, PINK_DIM))
  lines.push(row(`   ${colour('▸', PINK)} Setup recipe (pick your framework):`))
  lines.push(row(`     ${colour('node_modules/@devalok/shilp-sutra/docs/recipes/', DIM)}`))
  lines.push(colour(EMPTY, PINK_DIM))
  lines.push(row(`   ${colour('▸', PINK)} Theme it in 30 seconds:`))
  lines.push(row(`     ${colour('https://shilp-sutra.devalok.in/themer', DIM)}`))
  lines.push(colour(EMPTY, PINK_DIM))
  lines.push(row(`   ${colour('▸', PINK)} Wire your AI agent (Claude Code / Cursor / Codex):`))
  lines.push(row(`     ${colour('live docs MCP added to .mcp.json — approve it to enable', DIM)}`))
  lines.push(row(`     ${colour('(version-exact setup + peer preflight; beats guessing)', DIM)}`))
  lines.push(row(`     ${colour('or copy the skill: cp -r node_modules/@devalok/shilp-sutra/skill \\', DIM)}`))
  lines.push(row(`        ${colour('~/.claude/skills/shilp-sutra', DIM)}`))
  lines.push(colour(EMPTY, PINK_DIM))
  lines.push(row(`   ${colour('Disable this banner: SHILP_SUTRA_NO_WELCOME=1', DIM)}`))
  lines.push(colour(EMPTY, PINK_DIM))
  lines.push(row(`   ${colour('Built by Devalok · devalok.in', PINK)}`))
  lines.push(colour(EMPTY, PINK_DIM))
  lines.push(colour(BOTTOM, PINK_DIM))
  return lines.join('\n')
}

function buildCompactBanner(version, prevVersion) {
  const head =
    prevVersion && prevVersion !== version
      ? [
          `${colour('✦', PINK)} ${colour('@devalok/shilp-sutra', BOLD)} ${prevVersion} → ${version}`,
          `  ${colour('⚠', PINK)} Version changed — review ${colour('node_modules/@devalok/shilp-sutra/MIGRATION.md', DIM)} before deploy`,
        ]
      : [`${colour('✦', PINK)} ${colour('@devalok/shilp-sutra', BOLD)} ${version} ${colour('· Tailwind 4 design system', DIM)}`]
  return [
    '',
    ...head,
    `  ${colour('▸', PINK)} Setup: ${colour('node_modules/@devalok/shilp-sutra/docs/recipes/', DIM)}`,
    `  ${colour('▸', PINK)} Theme: ${colour('https://shilp-sutra.devalok.in/themer', DIM)}`,
    `  ${colour('▸', PINK)} AI: ${colour('cp -r node_modules/@devalok/shilp-sutra/skill ~/.claude/skills/shilp-sutra', DIM)}`,
    `  ${colour('Built by Devalok · devalok.in', PINK)}  ${colour('(SHILP_SUTRA_NO_WELCOME=1 to disable)', DIM)}`,
    '',
  ].join('\n')
}

// ── MCP auto-discovery ───────────────────────────────────────────────────────
// Write a project-scoped `.mcp.json` pointing at the hosted docs MCP so an AI
// coding agent DISCOVERS it right after install. This runs even when stdout is
// piped (unlike the banner) — a config file is not console noise, and the agent
// that just ran `install` is exactly who should find it. It is never silent-
// forced: Claude Code (and peers) still PROMPT the user to approve a project
// MCP server before enabling it. Safety: additive merge (never clobbers other
// servers or an existing shilp-sutra entry), skips CI and dev installs, honours
// opt-out, and a write-once sentinel so a user who deletes it is not re-nagged.
const SEP = process.platform === 'win32' ? '\\' : '/'
const MCP_URL = 'https://shilp-sutra.devalok.in/mcp'

function tryWriteMcpConfig() {
  try {
    if (process.env.SHILP_SUTRA_NO_WELCOME === '1' || process.env.SHILP_SUTRA_NO_WELCOME === 'true') return
    if (process.env.SHILP_SUTRA_NO_MCP === '1' || process.env.SHILP_SUTRA_NO_MCP === 'true') return
    if (process.env.CI) return // writing agent config into a CI checkout is pointless/unwanted

    const initCwd = process.env.INIT_CWD
    const cwd = process.cwd()
    const isInsideNodeModules = cwd.includes(`${SEP}node_modules${SEP}`) || cwd.includes('/node_modules/')
    if (!isInsideNodeModules) return // dev install inside the DS repo itself
    if (!initCwd || initCwd === cwd) return // no consumer root → unusual context

    // Write-once-ever sentinel (survives re-installs; respects user deletion of .mcp.json)
    const parts = PKG_DIR.split(/[/\\]/)
    const nmIdx = parts.lastIndexOf('node_modules')
    const sentinel = nmIdx === -1 ? null : join(parts.slice(0, nmIdx + 1).join(SEP), '.shilp-sutra-mcp-written')
    if (sentinel && existsSync(sentinel)) return

    const target = join(initCwd, '.mcp.json')
    let config = { mcpServers: {} }
    if (existsSync(target)) {
      try {
        config = JSON.parse(readFileSync(target, 'utf-8'))
      } catch {
        return // existing but unparseable — never clobber a hand-authored config
      }
      if (!config || typeof config !== 'object') return
      if (!config.mcpServers || typeof config.mcpServers !== 'object') config.mcpServers = {}
      if (config.mcpServers['shilp-sutra']) {
        if (sentinel) writeFileSync(sentinel, MCP_URL + '\n')
        return // already declared — leave the consumer's version untouched
      }
    }
    config.mcpServers['shilp-sutra'] = { type: 'http', url: MCP_URL }
    writeFileSync(target, JSON.stringify(config, null, 2) + '\n')
    if (sentinel) writeFileSync(sentinel, MCP_URL + '\n')
  } catch {
    // Never break the consumer install — a failed config write is a no-op.
  }
}

// ── Main ────────────────────────────────────────────────────────────────────
function main() {
  // --preview / --compact bypass all guards. Used by maintainers + by the
  // pre-publish-audit gate to verify the banner renders without ever
  // shipping a broken one. Compose only — never writes the sentinel.
  const preview = process.argv.includes('--preview')
  const forceCompact = process.argv.includes('--compact')

  // MCP auto-discovery runs regardless of TTY — an agent-run (piped) install is
  // precisely when the agent should discover the docs MCP. Must come before the
  // TTY skip below, which only governs the human-facing banner.
  if (!preview) tryWriteMcpConfig()

  if (!preview) {
    const skipReason = shouldSkip()
    if (skipReason) return // silent
  }

  const version = readPkgVersion() || '0.0.0-preview'

  if (!preview && alreadyWelcomed(version)) return

  // Detect a version jump so the banner can route upgraders to MIGRATION.md.
  // --preview simulates an upgrade so maintainers can verify the upgrade layout.
  const prevVersion = preview ? '0.39.0' : getPreviousVersion()

  const cols = process.stdout.columns || 80
  const rows = process.stdout.rows || 40
  const fitsFull = !forceCompact && cols >= 70 && rows >= 28

  const banner = fitsFull ? buildFullBanner(version, prevVersion) : buildCompactBanner(version, prevVersion)
  process.stdout.write('\n' + banner + '\n')

  if (!preview) markWelcomed(version)
}

try {
  main()
} catch {
  // Never crash the consumer install. A failure here is a UX bug, not a
  // blocker — pretend nothing happened.
}
