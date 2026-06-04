/**
 * Make kit content loader — reads packages/core/make-kit/*.md at build time.
 * Single source of truth shared with the npm tarball.
 */
import { readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

const REPO_ROOT = resolve(process.cwd(), '..', '..')
const MAKE_KIT_DIR = join(REPO_ROOT, 'packages', 'core', 'make-kit')

export type GuidelineFile = {
  /** Path within make-kit/ (e.g. "foundations/color.md") */
  path: string
  /** Short label shown in UI (e.g. "color") */
  label: string
  /** File content (markdown) */
  content: string
  /** Bytes (rounded to KB) — shown next to filename */
  sizeKB: number
}

export type GuidelineGroup = {
  id: 'top' | 'foundations' | 'components'
  title: string
  description: string
  files: GuidelineFile[]
}

const TOP_LEVEL = ['Guidelines.md', 'setup.md']
const FOUNDATIONS = [
  'color.md',
  'typography.md',
  'spacing.md',
  'surfaces.md',
  'radius.md',
  'motion.md',
  'dark-mode.md',
  'icons.md',
]
const COMPONENTS = [
  'overview.md',
  'button.md',
  'card.md',
  'input.md',
  'dialog.md',
  'badge.md',
  'select.md',
  'tabs.md',
  'toast.md',
  'form.md',
  'table.md',
  'dropdown-menu.md',
  'popover.md',
  'text.md',
  'stack.md',
  'icon.md',
]

function load(relPath: string): GuidelineFile {
  const abs = join(MAKE_KIT_DIR, relPath)
  const content = readFileSync(abs, 'utf8')
  const label = relPath
    .replace(/^(foundations|components)\//, '')
    .replace(/\.md$/, '')
  return {
    path: relPath,
    label,
    content,
    sizeKB: Math.round(Buffer.byteLength(content, 'utf8') / 1024),
  }
}

export function getGuidelineGroups(): GuidelineGroup[] {
  return [
    {
      id: 'top',
      title: 'Top level',
      description:
        'Entry point + setup. Figma Make reads Guidelines.md first, so paste it before anything else.',
      files: TOP_LEVEL.map((f) => load(f)),
    },
    {
      id: 'foundations',
      title: 'Foundations',
      description:
        'Tokens, surfaces, spacing cadence, motion, dark mode, icons. Paste all eight before moving to components.',
      files: FOUNDATIONS.map((f) => load(`foundations/${f}`)),
    },
    {
      id: 'components',
      title: 'Components',
      description:
        'Per-component guides. Overview first, then any order. 15 components covered — extend over time as Make fumbles surface.',
      files: COMPONENTS.map((f) => load(`components/${f}`)),
    },
  ]
}

/**
 * Concatenate all files in a group with a "## File: <path>" separator so a
 * single-paste flow still tracks which file each section is for. Used by
 * the "Copy all foundations" / "Copy all components" buttons.
 */
export function concatGroup(group: GuidelineGroup): string {
  return group.files
    .map((f) => `<!-- ===== File: ${f.path} ===== -->\n\n${f.content.trim()}\n`)
    .join('\n')
}

export function fileCount(): number {
  return TOP_LEVEL.length + FOUNDATIONS.length + COMPONENTS.length
}
