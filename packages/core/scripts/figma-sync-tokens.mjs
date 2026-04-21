#!/usr/bin/env node
/**
 * figma-sync-tokens.mjs
 *
 * Parses the authoritative token CSS files and emits a JSON spec that can
 * drive Figma Variables creation (via the Figma MCP server `use_figma` tool
 * or the Plugin API running inside Figma).
 *
 * Sources (source of truth):
 *   packages/core/src/tokens/primitives.css
 *   packages/core/src/tokens/semantic.css
 *   packages/core/src/tokens/typography-semantic.css
 *
 * Output:
 *   packages/core/scripts/.figma/tokens.json
 *
 * Downstream:
 *   An agent with MCP access reads tokens.json and executes Figma Plugin API
 *   calls to create collections, modes, and variables. See
 *   docs/plans/2026-04-20-figma-port-design.md for the full loop.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const HERE = dirname(fileURLToPath(import.meta.url))
const TOKENS_DIR = join(HERE, '..', 'src', 'tokens')
const OUT_DIR = join(HERE, '.figma')
const OUT_FILE = join(OUT_DIR, 'tokens.json')
const DTCG_FILE = join(OUT_DIR, 'tokens.dtcg.json')

const readCss = (name) => readFileSync(join(TOKENS_DIR, name), 'utf8')

/** Extract every `--name: value;` under a given selector block in a CSS string. */
function extractVarsUnderSelector(css, selector) {
  // Crude: find "<selector> {" and read until matching "}". Token files are well-formed.
  const idx = css.indexOf(selector)
  if (idx === -1) return {}
  const start = css.indexOf('{', idx)
  let depth = 1
  let i = start + 1
  while (i < css.length && depth > 0) {
    if (css[i] === '{') depth++
    else if (css[i] === '}') depth--
    if (depth === 0) break
    i++
  }
  const body = css.slice(start + 1, i)
  const out = {}
  for (const line of body.split('\n')) {
    const m = line.match(/^\s*(--[a-z0-9-]+):\s*([^;]+?);?\s*(?:\/\*.*\*\/)?\s*$/i)
    if (m) out[m[1]] = m[2].trim()
  }
  return out
}

/** Parse an oklch(L C H [ / A]) declaration. Returns { L, C, H, alpha } or null. */
function parseOklch(value) {
  const m = value.match(/oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+))?\s*\)/i)
  if (!m) return null
  return {
    L: parseFloat(m[1]),
    C: parseFloat(m[2]),
    H: parseFloat(m[3]),
    alpha: m[4] ? parseFloat(m[4]) : 1,
  }
}

/** Parse a `var(--x)` alias reference. Returns "--x" or null. */
function parseAlias(value) {
  const m = value.match(/var\((--[a-z0-9-]+)\)/i)
  return m ? m[1] : null
}

function parsePx(value) {
  const m = value.match(/^(-?[\d.]+)px$/)
  return m ? parseFloat(m[1]) : null
}

function parseRem(value) {
  const m = value.match(/^(-?[\d.]+)rem$/)
  return m ? parseFloat(m[1]) * 16 : null
}

function parseNumber(value) {
  if (parsePx(value) != null) return parsePx(value)
  if (parseRem(value) != null) return parseRem(value)
  const f = parseFloat(value)
  return Number.isFinite(f) ? f : null
}

/** Group flat `--name: value` map into scale groups. */
function groupByScale(flat) {
  const scales = {}
  for (const [name, value] of Object.entries(flat)) {
    // e.g. --pink-9, --amber-bright-3, --neutral-0
    const m = name.match(/^--([a-z]+(?:-[a-z]+)*)-(\d+)$/i)
    if (!m) continue
    const [, scale, stepStr] = m
    const step = parseInt(stepStr, 10)
    if (!scales[scale]) scales[scale] = { light: {}, dark: {} }
    scales[scale].light[step] = value
  }
  return scales
}

function main() {
  const primitives = readCss('primitives.css')
  const semantic = readCss('semantic.css')
  const typoSem = readCss('typography-semantic.css')

  // Primitives — :root and .dark blocks
  const primLight = extractVarsUnderSelector(primitives, ':root')
  const primDark = extractVarsUnderSelector(primitives, '.dark')

  const colorLight = {}, colorDark = {}
  for (const [k, v] of Object.entries(primLight)) {
    const o = parseOklch(v)
    if (o) colorLight[k] = o
  }
  for (const [k, v] of Object.entries(primDark)) {
    const o = parseOklch(v)
    if (o) colorDark[k] = o
  }

  // Semantic — @theme block. Skip the comment-block mention of `@theme`
  // that exists at the top of semantic.css for documentation purposes.
  const themeMatch = semantic.match(/^\s*@theme\s*\{/m)
  const themeIdx = themeMatch ? themeMatch.index : -1
  const themeStart = themeIdx >= 0 ? semantic.indexOf('{', themeIdx) : -1
  let depth = 1, j = themeStart + 1
  while (j < semantic.length && depth > 0) {
    if (semantic[j] === '{') depth++
    else if (semantic[j] === '}') depth--
    if (depth === 0) break
    j++
  }
  const themeBody = semantic.slice(themeStart + 1, j)
  const themeVars = {}
  for (const line of themeBody.split('\n')) {
    const m = line.match(/^\s*(--[a-z0-9-]+):\s*([^;]+?);?\s*(?:\/\*.*\*\/)?\s*$/i)
    if (m) themeVars[m[1]] = m[2].trim()
  }
  // Dark overrides — semantic.css .dark block
  const semDark = extractVarsUnderSelector(semantic, '.dark')

  // Semantic tokens by category
  const semantic_tokens = {}
  for (const [k, v] of Object.entries(themeVars)) {
    const alias = parseAlias(v)
    const px = parsePx(v), rem = parseRem(v)
    const entry = {
      raw: v,
      alias, // if it's a var(--...) reference
      pxValue: px ?? (rem != null ? rem : null),
      oklch: parseOklch(v),
    }
    semantic_tokens[k] = entry
  }
  const semantic_dark_overrides = {}
  for (const [k, v] of Object.entries(semDark)) {
    semantic_dark_overrides[k] = { raw: v, alias: parseAlias(v), oklch: parseOklch(v) }
  }

  // Typography semantic — composites
  const typoVars = extractVarsUnderSelector(typoSem, ':root')
  const typography = {}
  for (const [k, v] of Object.entries(typoVars)) {
    if (!k.startsWith('--typo-')) continue
    const m = k.match(/^--typo-(.+)-(size|weight|leading|tracking|font)$/)
    if (!m) continue
    const [, role, field] = m
    typography[role] ??= {}
    typography[role][field] = { raw: v, alias: parseAlias(v), pxValue: parseNumber(v) }
  }

  // Summary
  const out = {
    generatedAt: new Date().toISOString(),
    source: 'packages/core/src/tokens/{primitives,semantic,typography-semantic}.css',
    primitives: {
      colorLight,
      colorDark,
      scalesFound: Object.keys(groupByScale(primLight)).sort(),
    },
    semantic: {
      tokens: semantic_tokens,
      darkOverrides: semantic_dark_overrides,
    },
    typography,
  }

  mkdirSync(OUT_DIR, { recursive: true })
  writeFileSync(OUT_FILE, JSON.stringify(out, null, 2))
  console.log(`Wrote ${OUT_FILE}`)

  // ── DTCG side-channel emit ────────────────────────────────────────
  // Design Tokens Community Group spec — portable format for external tools
  // (Style Dictionary, Token Studio, Figma plugins that consume DTCG).
  // Limitations: DTCG has no canonical mode system; we emit Light as default,
  // Dark as $extensions.mode.dark, forced-colors not emitted (no spec path).
  // OKLCH is also not yet in the DTCG color-module enum — we emit as $extensions.oklch
  // with a computed sRGB hex as the $value for tools that only grok standard colors.
  const dtcg = emitDtcg(colorLight, colorDark, semantic_tokens, semantic_dark_overrides, typography)
  writeFileSync(DTCG_FILE, JSON.stringify(dtcg, null, 2))
  console.log(`Wrote ${DTCG_FILE}`)
  console.log(`  color primitives: ${Object.keys(colorLight).length} (light) / ${Object.keys(colorDark).length} (dark)`)
  console.log(`  semantic tokens:  ${Object.keys(semantic_tokens).length}`)
  console.log(`  typography roles: ${Object.keys(typography).length}`)
  console.log(`\nNext step: hand this JSON to an MCP agent with use_figma access,`)
  console.log(`           or to a REST-API-driven build script, to (re)sync Figma Variables.`)
}

// ────────────────────────────────────────────────────────────────────
// DTCG emit helpers
// ────────────────────────────────────────────────────────────────────

/** Ottosson OKLCH → sRGB hex */
function oklchToHex({ L, C, H, alpha = 1 }) {
  const hr = (H * Math.PI) / 180
  const a = C * Math.cos(hr), b = C * Math.sin(hr)
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b
  const s_ = L - 0.0894841775 * a - 1.291485548  * b
  const lc = l_ ** 3, mc = m_ ** 3, sc = s_ ** 3
  let r  = +4.0767416621 * lc - 3.3077115913 * mc + 0.2309699292 * sc
  let g  = -1.2684380046 * lc + 2.6097574011 * mc - 0.3413193965 * sc
  let bl = -0.0041960863 * lc - 0.7034186147 * mc + 1.707614701  * sc
  const toHex = (c) => {
    c = c <= 0 ? 0 : c >= 1 ? 1 : c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055
    return Math.round(c * 255).toString(16).padStart(2, '0')
  }
  const hex = `#${toHex(r)}${toHex(g)}${toHex(bl)}`
  return alpha < 1 ? hex + Math.round(alpha * 255).toString(16).padStart(2, '0') : hex
}

function emitDtcg(colorLight, colorDark, semanticTokens, semanticDarkOverrides, typography) {
  const root = { $description: 'shilp-sutra tokens in DTCG format. Generated from tokens/*.css. Source of truth stays in CSS.' }

  // Primitive colors — grouped by scale
  const primitives = {}
  for (const [k, o] of Object.entries(colorLight)) {
    const m = k.match(/^--([a-z-]+)-(\d+)$/)
    if (!m) continue
    const scale = m[1], step = m[2]
    primitives[scale] ??= {}
    const darkVal = colorDark[k]
    primitives[scale][step] = {
      $type: 'color',
      $value: oklchToHex(o),
      $extensions: {
        'com.devalok.shilp-sutra': {
          oklch: { L: o.L, C: o.C, H: o.H, alpha: o.alpha },
          ...(darkVal ? { dark: { $value: oklchToHex(darkVal), oklch: darkVal } } : {}),
        },
      },
    }
  }
  root.primitives = { color: primitives }

  // Semantic — aliases emitted as DTCG references
  const semantic = {}
  for (const [k, entry] of Object.entries(semanticTokens)) {
    if (!k.startsWith('--color-')) continue
    const name = k.slice('--color-'.length)
    const parts = name.split('-')
    const [group, ...rest] = parts
    const path = rest.length ? [group, rest.join('-')] : [group]
    let cursor = semantic
    for (let i = 0; i < path.length - 1; i++) {
      cursor[path[i]] ??= {}
      cursor = cursor[path[i]]
    }
    const leaf = path[path.length - 1]
    let token
    if (entry.alias) {
      const am = entry.alias.match(/^--([a-z-]+)-(\d+)$/)
      token = am
        ? { $type: 'color', $value: `{primitives.color.${am[1]}.${am[2]}}` }
        : { $type: 'color', $value: entry.raw }
    } else if (entry.oklch) {
      token = { $type: 'color', $value: oklchToHex(entry.oklch) }
    } else {
      token = { $type: 'color', $value: entry.raw }
    }
    const darkRaw = semanticDarkOverrides[k]
    if (darkRaw?.alias) {
      const am = darkRaw.alias.match(/^--([a-z-]+)-(\d+)$/)
      token.$extensions ??= {}
      token.$extensions['com.devalok.shilp-sutra'] = {
        dark: am
          ? { $value: `{primitives.color.${am[1]}.${am[2]}}` }
          : { $value: darkRaw.raw },
      }
    }
    cursor[leaf] = token
  }
  root.semantic = { color: semantic }

  // Typography composite tokens
  const typo = {}
  for (const [role, fields] of Object.entries(typography)) {
    typo[role] = {
      $type: 'typography',
      $value: {
        fontSize:      fields.size?.pxValue   ? `${fields.size.pxValue}px` : fields.size?.raw,
        fontWeight:    fields.weight?.pxValue ?? fields.weight?.raw,
        lineHeight:    fields.leading?.pxValue ?? fields.leading?.raw,
        letterSpacing: fields.tracking?.raw,
      },
    }
  }
  root.typography = typo

  // Spacing / radius / duration
  const spacing = {}, radius = {}, duration = {}
  for (const [k, entry] of Object.entries(semanticTokens)) {
    if (entry.pxValue == null) continue
    if (k.startsWith('--spacing-ds-')) {
      spacing[k.slice('--spacing-ds-'.length)] = { $type: 'dimension', $value: `${entry.pxValue}px` }
    } else if (k.startsWith('--radius-ds-')) {
      radius[k.slice('--radius-ds-'.length)] = { $type: 'dimension', $value: `${entry.pxValue}px` }
    } else if (k.startsWith('--duration-')) {
      duration[k.slice('--duration-'.length)] = { $type: 'duration', $value: `${entry.pxValue}ms` }
    }
  }
  if (Object.keys(spacing).length)  root.spacing  = spacing
  if (Object.keys(radius).length)   root.radius   = radius
  if (Object.keys(duration).length) root.duration = duration

  return root
}

main()
