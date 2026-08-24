#!/usr/bin/env node
/**
 * figma-extract-icons.mjs
 *
 * Emits SVG path data for the Tabler icons this design system actually uses,
 * ranked by real usage in `src/`, so the Figma library can own its icon set
 * instead of depending on the Tabler community library.
 *
 * WHY WE OWN THEM (measured 2026-08-18):
 *   Community-library Tabler icons have a VARYING number of <Vector> children
 *   (1, 2 or 3 across a sample of eight). Binding an icon's colour on an
 *   INSTANCE is an override, and an override cannot cover children that did not
 *   exist when it was made — so swapping a 1-vector icon for a 3-vector one
 *   leaves two vectors unbound and rendering black.
 *
 *   Owning the components moves the binding into each icon's MAIN definition,
 *   where there is no override to lose. Swap safety becomes structural.
 *
 * Source of truth: @tabler/icons-react (the same package the components import).
 * Each icon module exports `__iconNode`, an array of [tag, attrs] pairs.
 *
 * Output:
 *   packages/core/scripts/.figma/icons.json
 *     { generatedAt, tablerVersion, strokeWidth, size, icons: [
 *         { name, usageCount, pathCount, paths: [d, ...], svg }
 *     ] }
 *
 * Usage:
 *   node packages/core/scripts/figma-extract-icons.mjs           # top 48 by usage
 *   node packages/core/scripts/figma-extract-icons.mjs 80        # top 80
 *   node packages/core/scripts/figma-extract-icons.mjs --all-used # every icon referenced in src
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const HERE = dirname(fileURLToPath(import.meta.url))
const CORE = join(HERE, '..')
const SRC = join(CORE, 'src')
const ICONS_DIR = join(CORE, 'node_modules', '@tabler', 'icons-react', 'dist', 'esm', 'icons')
const OUT_DIR = join(HERE, '.figma')
const OUT_FILE = join(OUT_DIR, 'icons.json')

const SIZE = 24
const STROKE_WIDTH = 2

/**
 * Icon size tiers, parsed from src/ui/icon.tsx so they cannot drift from the code.
 *
 * Each Figma icon becomes a COMPONENT_SET with one variant per tier, authored at the
 * tier's true pixel size with the tier's EXPLICIT stroke weight. The design system does
 * not scale stroke proportionally — a 14px icon uses 1.5, a 16px icon uses 2 — so a
 * single component resized in Figma renders the wrong weight.
 */
function parseSizeTiers() {
  const src = readFileSync(join(SRC, 'ui', 'icon.tsx'), 'utf8')
  const sizeBlock = src.match(/const SIZE_PX[^=]*=\s*\{([^}]*)\}/)
  const strokeBlock = src.match(/regular:\s*\{([^}]*)\}/)
  if (!sizeBlock || !strokeBlock) {
    throw new Error('Could not parse SIZE_PX / STROKE_MAP.regular from src/ui/icon.tsx — the shape changed, update this parser.')
  }
  const pairs = (s) =>
    Object.fromEntries(
      [...s.matchAll(/'?([a-z0-9]+)'?\s*:\s*([\d.]+)/g)].map((m) => [m[1], Number(m[2])]),
    )
  const px = pairs(sizeBlock[1])
  const stroke = pairs(strokeBlock[1])
  return Object.keys(px).map((tier) => ({ tier, px: px[tier], strokeWidth: stroke[tier] }))
}

if (!existsSync(ICONS_DIR)) {
  console.error(`Cannot find @tabler/icons-react at ${ICONS_DIR}`)
  console.error('Run `pnpm install` in packages/core first.')
  process.exit(2)
}

const arg = process.argv[2]
const ALL_USED = arg === '--all-used'
const LIMIT = ALL_USED ? Infinity : (Number.parseInt(arg, 10) || 48)

/** PascalCase icon component name -> kebab-case tabler name. */
const toKebab = (pascal) =>
  pascal
    .replace(/^Icon/, '')
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
    .toLowerCase()

/** Walk src/ and count `Icon*` references, so the curated set reflects reality. */
function countUsage() {
  const counts = new Map()
  const skip = new Set(['IconInput', 'IconProps', 'IconContext', 'IconProvider', 'IconGroup', 'IconSize', 'IconButton', 'IconButtonProps'])
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, entry.name)
      if (entry.isDirectory()) { walk(p); continue }
      if (!/\.tsx?$/.test(entry.name)) continue
      const text = readFileSync(p, 'utf8')
      for (const m of text.matchAll(/\bIcon[A-Z][A-Za-z0-9]*/g)) {
        const name = m[0]
        if (skip.has(name)) continue
        counts.set(name, (counts.get(name) || 0) + 1)
      }
    }
  }
  walk(SRC)
  return counts
}

/** Pull the `__iconNode` array out of a Tabler ESM module without evaluating it. */
function extractPaths(pascalName) {
  const file = join(ICONS_DIR, `${pascalName}.mjs`)
  if (!existsSync(file)) return null
  const src = readFileSync(file, 'utf8')
  const m = src.match(/const __iconNode = (\[[\s\S]*?\]);/)
  if (!m) return null
  let node
  try {
    node = JSON.parse(m[1])
  } catch {
    return null
  }
  // Entries are [tag, attrs]. Keep anything with a `d`; note non-path shapes.
  const paths = []
  const unsupported = []
  for (const [tag, attrs] of node) {
    if (attrs && typeof attrs.d === 'string') paths.push(attrs.d)
    else unsupported.push(tag)
  }
  return { paths, unsupported }
}

const svgFor = (paths) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}" ` +
  `fill="none" stroke="currentColor" stroke-width="${STROKE_WIDTH}" stroke-linecap="round" stroke-linejoin="round">` +
  paths.map((d) => `<path d="${d}"/>`).join('') +
  `</svg>`

const tablerVersion = JSON.parse(
  readFileSync(join(CORE, 'node_modules', '@tabler', 'icons-react', 'package.json'), 'utf8'),
).version

const usage = [...countUsage().entries()].sort((a, b) => b[1] - a[1])

const icons = []
const missing = []
for (const [pascal, count] of usage) {
  if (icons.length >= LIMIT) break
  const extracted = extractPaths(pascal)
  if (!extracted) { missing.push(pascal); continue }
  const { paths, unsupported } = extracted
  if (!paths.length) { missing.push(pascal); continue }
  icons.push({
    name: toKebab(pascal),
    component: pascal,
    usageCount: count,
    pathCount: paths.length,
    ...(unsupported.length ? { unsupportedShapes: unsupported } : {}),
    paths,
    svg: svgFor(paths),
  })
}

const sizeTiers = parseSizeTiers()

mkdirSync(OUT_DIR, { recursive: true })
writeFileSync(
  OUT_FILE,
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      tablerVersion,
      viewBox: SIZE,
      sourceStrokeWidth: STROKE_WIDTH,
      sizeTiers,
      iconCount: icons.length,
      icons,
    },
    null,
    2,
  ),
)

const withMulti = icons.filter((i) => i.pathCount > 1).length
console.log(`Wrote ${OUT_FILE}`)
console.log(`  icons:          ${icons.length} (from ${usage.length} referenced in src)`)
console.log(`  tabler version: ${tablerVersion}`)
console.log(`  size tiers:     ${sizeTiers.map((s) => `${s.tier} ${s.px}px/${s.strokeWidth}`).join('  ')}`)
console.log(`  components:     ${icons.length * sizeTiers.length} (${icons.length} sets x ${sizeTiers.length} size variants)`)
console.log(`  multi-path:     ${withMulti} of ${icons.length} — the reason we own these rather than link them`)
if (missing.length) console.log(`  not resolvable: ${missing.slice(0, 10).join(', ')}${missing.length > 10 ? ` (+${missing.length - 10})` : ''}`)
