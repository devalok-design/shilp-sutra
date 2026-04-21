#!/usr/bin/env node
/**
 * figma-build-foundation.mjs
 *
 * Emits a comprehensive JSON "Foundation Spec" describing the full Phase 1
 * Figma library foundation: collections, modes, variables (with scopes),
 * text styles (with variable bindings), effect styles, and the canonical
 * icon set.
 *
 * This is the INPUT to an agent with `use_figma` MCP access. The agent reads
 * this JSON and executes the Plugin API calls to create everything.
 *
 * Why not execute directly? Because `figma.*` Plugin API only runs inside a
 * Figma plugin context (or via MCP server proxy). This script is the spec
 * producer; the agent is the spec consumer.
 *
 * Sources (source of truth):
 *   packages/core/src/tokens/primitives.css
 *   packages/core/src/tokens/semantic.css
 *   packages/core/src/tokens/typography-semantic.css
 *
 * Output:
 *   packages/core/scripts/.figma/foundation-spec.json
 *
 * Downstream agent prompt: "Read foundation-spec.json and execute the
 * corresponding figma.variables.create* calls via use_figma MCP. Set scopes
 * on every variable as specified. Bind text styles to typography variables.
 * Create effect styles from the shadows array. Import icons from /tmp/icons.json.
 * Report success count + any failures."
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const HERE = dirname(fileURLToPath(import.meta.url))
const TOKENS_DIR = join(HERE, '..', 'src', 'tokens')
const OUT_DIR = join(HERE, '.figma')
const OUT_FILE = join(OUT_DIR, 'foundation-spec.json')

// ───────────────────────────────────────────────────────────────────
// CSS parsing (reused from figma-sync-tokens.mjs)
// ───────────────────────────────────────────────────────────────────

const readCss = (name) => readFileSync(join(TOKENS_DIR, name), 'utf8')

function extractVarsUnderSelector(css, selector) {
  const idx = css.indexOf(selector)
  if (idx === -1) return {}
  const start = css.indexOf('{', idx)
  let depth = 1, i = start + 1
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

function parseOklch(value) {
  const m = value.match(/oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+))?\s*\)/i)
  if (!m) return null
  return { L: parseFloat(m[1]), C: parseFloat(m[2]), H: parseFloat(m[3]), alpha: m[4] ? parseFloat(m[4]) : 1 }
}

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

// ───────────────────────────────────────────────────────────────────
// Scope rules — the centerpiece of this rebuild
// ───────────────────────────────────────────────────────────────────

function colorScopesFor(semanticName) {
  // Primitives get permissive scoping — they're raw values, can appear anywhere
  if (!semanticName) return ['ALL_FILLS', 'TEXT_FILL', 'STROKE_COLOR', 'EFFECT_COLOR']
  // Semantic scoping by role
  if (/\/(fg|fg-muted|fg-subtle|fg-disabled|inverted-fg)$/.test(semanticName)) return ['TEXT_FILL']
  if (/\/(border|border-strong|border-subtle)$/.test(semanticName)) return ['STROKE_COLOR']
  if (/^backdrop$/.test(semanticName)) return ['ALL_FILLS']
  if (/^skeleton\//.test(semanticName)) return ['ALL_FILLS']
  if (/\/fg$/.test(semanticName)) return ['TEXT_FILL']
  if (/\/(11|12)$/.test(semanticName)) return ['TEXT_FILL', 'ALL_FILLS']
  return ['ALL_FILLS']
}

function floatScopesFor(varName) {
  if (varName.startsWith('spacing/')) return ['GAP', 'WIDTH_HEIGHT']
  if (varName.startsWith('size/')) return ['WIDTH_HEIGHT']
  if (varName.startsWith('radius/')) return ['CORNER_RADIUS']
  if (varName.startsWith('font-size/')) return ['FONT_SIZE']
  if (varName.startsWith('line-height/')) return ['LINE_HEIGHT']
  if (varName.startsWith('tracking/')) return ['LETTER_SPACING']
  if (varName.startsWith('font-weight/')) return ['FONT_WEIGHT']
  return []
}

function stringScopesFor(varName) {
  if (varName.startsWith('font-family/')) return ['FONT_FAMILY']
  return []
}

// ───────────────────────────────────────────────────────────────────
// Primitive color scales — pull from CSS
// ───────────────────────────────────────────────────────────────────

const primitives = readCss('primitives.css')
const semantic = readCss('semantic.css')
const typoSem = readCss('typography-semantic.css')

const primLight = extractVarsUnderSelector(primitives, ':root')
const primDark = extractVarsUnderSelector(primitives, '.dark')

function buildPrimitiveColorCollection() {
  const collection = {
    name: 'Primitives / Color',
    modes: ['Light', 'Dark'],
    variables: [],
  }

  // Neutral 0 (pure white) — special case, not OKLCH
  collection.variables.push({
    name: 'neutral/0',
    type: 'COLOR',
    scopes: colorScopesFor(null),
    values: {
      Light: { type: 'hex', hex: '#ffffff' },
      Dark:  { type: 'hex', hex: '#ffffff' },
    },
  })

  // Surface 0 (warm page bg)
  collection.variables.push({
    name: 'surface/0',
    type: 'COLOR',
    scopes: colorScopesFor(null),
    values: {
      Light: { type: 'oklch', L: 0.945, C: 0.008, H: 360, alpha: 1 },
      Dark:  { type: 'oklch', L: 0.07,  C: 0.008, H: 360, alpha: 1 },
    },
  })

  // 15 OKLCH scales × 12 steps
  for (const [k, v] of Object.entries(primLight)) {
    if (k === '--color-surface-0') continue // handled above
    const m = k.match(/^--([a-z-]+)-(\d+)$/)
    if (!m) continue
    const scale = m[1]
    const step  = parseInt(m[2], 10)
    const light = parseOklch(v)
    if (!light) continue
    const darkVal = primDark[k]
    const dark = darkVal ? parseOklch(darkVal) : light
    collection.variables.push({
      name: `${scale}/${step}`,
      type: 'COLOR',
      scopes: colorScopesFor(null),
      values: {
        Light: { type: 'oklch', ...light },
        Dark:  { type: 'oklch', ...(dark || light) },
      },
    })
  }

  return collection
}

// ───────────────────────────────────────────────────────────────────
// Semantic color collection — aliases primitives, 3 modes (Light/Dark/HC)
// ───────────────────────────────────────────────────────────────────

function buildSemanticColorCollection() {
  const collection = {
    name: 'Semantic / Color',
    modes: ['Light', 'Dark', 'forced-colors'],
    variables: [],
  }

  const A = (light, dark, hc) => ({
    Light: { type: 'alias', target: light },
    Dark:  { type: 'alias', target: dark },
    ...(hc ? { 'forced-colors': hc } : {}),
  })
  const HCAlias  = (target) => ({ type: 'alias', target })
  const HCHex    = (hex) => ({ type: 'hex', hex })

  // Constants for forced-colors mode (Windows High Contrast Black theme)
  const HC_CANVAS     = HCHex('#000000')
  const HC_CANVASTEXT = HCHex('#ffffff')
  const HC_HIGHLIGHT  = HCHex('#1f1fff')
  const HC_LINKTEXT   = HCHex('#ffff00')
  const HC_MARK       = HCHex('#ffff00')
  const HC_GRAYTEXT   = HCHex('#808080')
  const HC_VISITED    = HCHex('#ff8080')

  const add = (name, values) => {
    collection.variables.push({
      name,
      type: 'COLOR',
      scopes: colorScopesFor(name),
      values,
    })
  }

  // ── Accent (aliases pink). HC: 1-6 canvas, 7-10 highlight, 11-12 linktext
  for (let i = 1; i <= 12; i++) {
    const hc = i <= 6 ? HC_CANVAS : i <= 10 ? HC_HIGHLIGHT : HC_LINKTEXT
    add(`accent/${i}`, {
      Light: { type: 'alias', target: `pink/${i}` },
      Dark:  { type: 'alias', target: `pink/${i}` },
      'forced-colors': hc,
    })
  }
  add('accent/fg', {
    Light: { type: 'alias', target: 'neutral/1' },
    Dark:  { type: 'alias', target: 'neutral/0' },
    'forced-colors': HCHex('#ffffff'),
  })

  // ── Secondary (aliases purple)
  for (let i = 1; i <= 12; i++) {
    const hc = i <= 6 ? HC_CANVAS : i <= 10 ? HC_HIGHLIGHT : HC_LINKTEXT
    add(`secondary/${i}`, {
      Light: { type: 'alias', target: `purple/${i}` },
      Dark:  { type: 'alias', target: `purple/${i}` },
      'forced-colors': hc,
    })
  }
  add('secondary/fg', {
    Light: { type: 'alias', target: 'neutral/1' },
    Dark:  { type: 'alias', target: 'neutral/0' },
    'forced-colors': HCHex('#ffffff'),
  })

  // ── Surface
  const surface = {
    'surface/base':          { L: 'neutral/2',  D: 'neutral/1',  HC: HC_CANVAS },
    'surface/sunken':        { L: 'surface/0',  D: 'surface/0',  HC: HC_CANVAS },
    'surface/raised':        { L: 'neutral/1',  D: 'neutral/2',  HC: HC_CANVAS },
    'surface/raised-hover':  { L: 'neutral/3',  D: 'neutral/3',  HC: HC_CANVAS },
    'surface/raised-active': { L: 'neutral/4',  D: 'neutral/4',  HC: HC_CANVAS },
    'surface/overlay':       { L: 'neutral/1',  D: 'neutral/1',  HC: HC_CANVAS }, // dark override in plugin step
    'surface/disabled':      { L: 'neutral/2',  D: 'neutral/2',  HC: HC_CANVAS },
    'surface/fg':            { L: 'neutral/12', D: 'neutral/12', HC: HC_CANVASTEXT },
    'surface/fg-muted':      { L: 'neutral/11', D: 'neutral/11', HC: HC_CANVASTEXT },
    'surface/fg-subtle':     { L: 'neutral/9',  D: 'neutral/9',  HC: HC_GRAYTEXT },
    'surface/fg-disabled':   { L: 'neutral/8',  D: 'neutral/8',  HC: HC_GRAYTEXT },
    'surface/inverted':      { L: 'neutral/12', D: 'neutral/12', HC: HC_CANVASTEXT },
    'surface/inverted-fg':   { L: 'neutral/1',  D: 'neutral/1',  HC: HC_CANVAS },
    'surface/border':        { L: 'neutral/6',  D: 'neutral/4',  HC: HC_CANVASTEXT },
    'surface/border-strong': { L: 'neutral/7',  D: 'neutral/5',  HC: HC_CANVASTEXT },
    'surface/border-subtle': { L: 'neutral/5',  D: 'neutral/3',  HC: HC_GRAYTEXT },
  }
  for (const [name, cfg] of Object.entries(surface)) {
    add(name, {
      Light: { type: 'alias', target: cfg.L },
      Dark:  { type: 'alias', target: cfg.D },
      'forced-colors': cfg.HC,
    })
  }

  // ── Backdrop (raw alpha, not aliased)
  collection.variables.push({
    name: 'backdrop',
    type: 'COLOR',
    scopes: colorScopesFor('backdrop'),
    values: {
      Light: { type: 'rgba', r: 0, g: 0, b: 0, a: 0.4 },
      Dark:  { type: 'rgba', r: 0, g: 0, b: 0, a: 0.6 },
      'forced-colors': HC_CANVAS,
    },
  })

  // ── Status roles
  const statusSteps = [2, 3, 4, 5, 7, 9, 10, 11]
  const statusRoles = {
    error:   { primitive: 'red',   hcBgPrefix: HC_CANVAS, hcSolid: HC_MARK },
    success: { primitive: 'green', hcBgPrefix: HC_CANVAS, hcSolid: HC_HIGHLIGHT },
    warning: { primitive: 'amber-bright', hcBgPrefix: HC_CANVAS, hcSolid: HC_HIGHLIGHT },
    info:    { primitive: 'blue',  hcBgPrefix: HC_CANVAS, hcSolid: HC_HIGHLIGHT },
  }
  for (const [role, cfg] of Object.entries(statusRoles)) {
    for (const step of statusSteps) {
      const hc = step <= 5 ? cfg.hcBgPrefix : step === 7 ? HC_CANVASTEXT : step <= 10 ? cfg.hcSolid : HC_CANVASTEXT
      add(`${role}/${step}`, {
        Light: { type: 'alias', target: `${cfg.primitive}/${step}` },
        Dark:  { type: 'alias', target: `${cfg.primitive}/${step}` },
        'forced-colors': hc,
      })
    }
    add(`${role}/fg`, {
      Light: { type: 'alias', target: 'neutral/1' },
      Dark:  { type: 'alias', target: 'neutral/0' },
      'forced-colors': role === 'error' ? HC_CANVASTEXT : HCHex('#ffffff'),
    })
  }

  // ── Link
  add('link/default', { Light: { type: 'alias', target: 'accent/11' }, Dark: { type: 'alias', target: 'accent/11' }, 'forced-colors': HC_LINKTEXT })
  add('link/hover',   { Light: { type: 'alias', target: 'accent/12' }, Dark: { type: 'alias', target: 'accent/12' }, 'forced-colors': HC_LINKTEXT })
  add('link/visited', { Light: { type: 'alias', target: 'purple/11' }, Dark: { type: 'alias', target: 'purple/11' }, 'forced-colors': HC_VISITED })

  // ── Skeleton
  add('skeleton/base',    { Light: { type: 'alias', target: 'neutral/3' }, Dark: { type: 'alias', target: 'neutral/4' }, 'forced-colors': HC_GRAYTEXT })
  add('skeleton/shimmer', { Light: { type: 'alias', target: 'neutral/2' }, Dark: { type: 'alias', target: 'neutral/3' }, 'forced-colors': HC_CANVAS })

  // ── Category (Sapta Varna) — step 3, 7, 9, 11 for each
  for (const c of ['teal', 'amber', 'slate', 'indigo', 'cyan', 'orange', 'emerald']) {
    for (const step of [3, 7, 9, 11]) {
      add(`category/${c}/${step}`, {
        Light: { type: 'alias', target: `${c}/${step}` },
        Dark:  { type: 'alias', target: `${c}/${step}` },
        'forced-colors': step >= 9 ? HC_HIGHLIGHT : HC_CANVAS,
      })
    }
  }

  return collection
}

// ───────────────────────────────────────────────────────────────────
// Primitives/Spacing/Radius/Typography
// ───────────────────────────────────────────────────────────────────

function buildSpacingCollection() {
  const tokens = [
    ['spacing/01', 2], ['spacing/02', 4], ['spacing/02b', 6], ['spacing/03', 8],
    ['spacing/03b', 10], ['spacing/04', 12], ['spacing/05', 16], ['spacing/05b', 20],
    ['spacing/06', 24], ['spacing/06b', 28], ['spacing/07', 32], ['spacing/08', 40],
    ['spacing/09', 48], ['spacing/10', 64], ['spacing/11', 80], ['spacing/12', 96],
    ['spacing/13', 160],
    // Layout spacing (aliases)
    ['spacing/page-x',      'alias:spacing/05'],
    ['spacing/page-y',      'alias:spacing/07'],
    ['spacing/section-gap', 'alias:spacing/08'],
    ['spacing/card-gap',    'alias:spacing/05'],
    ['spacing/stack-gap',   'alias:spacing/06'],
    // Component sizes
    ['size/xs-plus', 28], ['size/sm', 32], ['size/md', 40], ['size/lg', 48],
  ]

  return {
    name: 'Primitives / Spacing',
    modes: ['Default'],
    variables: tokens.map(([name, val]) => ({
      name,
      type: 'FLOAT',
      scopes: floatScopesFor(name),
      values: {
        Default: typeof val === 'string' && val.startsWith('alias:')
          ? { type: 'alias', target: val.slice(6) }
          : { type: 'number', value: val },
      },
    })),
  }
}

function buildRadiusCollection() {
  const tokens = [
    ['radius/base', 4], ['radius/none', 0], ['radius/sm', 2], ['radius/md', 6],
    ['radius/lg', 10], ['radius/xl', 16], ['radius/2xl', 24], ['radius/full', 9999],
  ]
  return {
    name: 'Primitives / Radius',
    modes: ['Default'],
    variables: tokens.map(([name, val]) => ({
      name,
      type: 'FLOAT',
      scopes: floatScopesFor(name),
      values: { Default: { type: 'number', value: val } },
    })),
  }
}

function buildTypographyCollection() {
  const variables = []
  const addF = (name, val) => variables.push({ name, type: 'FLOAT', scopes: floatScopesFor(name), values: { Default: { type: 'number', value: val } } })
  const addS = (name, val) => variables.push({ name, type: 'STRING', scopes: stringScopesFor(name), values: { Default: { type: 'string', value: val } } })

  // Font sizes (px)
  addF('font-size/xs', 10); addF('font-size/sm', 12); addF('font-size/md', 14)
  addF('font-size/base', 16); addF('font-size/lg', 18); addF('font-size/xl', 20)
  addF('font-size/2xl', 24); addF('font-size/3xl', 32); addF('font-size/4xl', 36)
  addF('font-size/5xl', 48); addF('font-size/6xl', 60)

  // Line heights (multipliers — Figma stores as PERCENT but FLOAT holds the raw multiplier, we multiply at bind time)
  addF('line-height/none', 1); addF('line-height/tight', 1.15); addF('line-height/snug', 1.25)
  addF('line-height/normal', 1.4); addF('line-height/relaxed', 1.5); addF('line-height/loose', 1.6)

  // Tracking (as PERCENT value × 100 for Figma)
  addF('tracking/tighter', -5); addF('tracking/tight', -2.5); addF('tracking/normal', 0)
  addF('tracking/wide', 2.5); addF('tracking/wider', 5); addF('tracking/widest', 10)

  // Font weights
  addF('font-weight/light', 300); addF('font-weight/regular', 400); addF('font-weight/medium', 500)
  addF('font-weight/semibold', 600); addF('font-weight/bold', 700)

  // Font families
  addS('font-family/sans', 'Inter'); addS('font-family/display', 'Inter')
  addS('font-family/body', 'Inter'); addS('font-family/accent', 'Ranade')
  addS('font-family/mono', 'Roboto Mono')

  return { name: 'Primitives / Typography', modes: ['Default'], variables }
}

// ───────────────────────────────────────────────────────────────────
// Text Styles — variable-bound (the big 2024 feature)
// ───────────────────────────────────────────────────────────────────

function buildTextStyles() {
  // Each style binds fontSize, lineHeight, letterSpacing, fontWeight to variables
  const styles = [
    { name: 'heading/2xl', size: '6xl', leading: 'tight', tracking: 'tight',   weight: 'regular' },
    { name: 'heading/xl',  size: '5xl', leading: 'tight', tracking: 'tight',   weight: 'regular' },
    { name: 'heading/lg',  size: '4xl', leading: 'tight', tracking: 'tight',   weight: 'regular' },
    { name: 'heading/md',  size: '3xl', leading: 'tight', tracking: 'tight',   weight: 'regular' },
    { name: 'heading/sm',  size: '2xl', leading: 'snug',  tracking: 'tight',   weight: 'regular' },
    { name: 'heading/xs',  size: 'xl',  leading: 'snug',  tracking: 'normal',  weight: 'regular' },
    { name: 'body/lg',     size: 'base', leading: 'relaxed', tracking: 'normal', weight: 'regular' },
    { name: 'body/md',     size: 'md',  leading: 'relaxed', tracking: 'normal', weight: 'regular' },
    { name: 'body/sm',     size: 'sm',  leading: 'relaxed', tracking: 'wide',   weight: 'regular' },
    { name: 'body/xs',     size: 'xs',  leading: 'relaxed', tracking: 'wide',   weight: 'regular' },
    { name: 'label/lg',    size: 'base', leading: 'snug', tracking: 'wider', weight: 'semibold', textCase: 'UPPER' },
    { name: 'label/md',    size: 'md',  leading: 'snug', tracking: 'wider', weight: 'semibold', textCase: 'UPPER' },
    { name: 'label/sm',    size: 'sm',  leading: 'snug', tracking: 'wider', weight: 'semibold', textCase: 'UPPER' },
    { name: 'label/xs',    size: 'xs',  leading: 'snug', tracking: 'wider', weight: 'semibold', textCase: 'UPPER' },
    { name: 'label-plain/lg', size: 'base', leading: 'snug', tracking: 'normal', weight: 'semibold' },
    { name: 'label-plain/md', size: 'md',  leading: 'snug', tracking: 'normal', weight: 'semibold' },
    { name: 'label-plain/sm', size: 'sm',  leading: 'snug', tracking: 'normal', weight: 'semibold' },
    { name: 'caption',        size: 'sm', leading: 'normal', tracking: 'wide',  weight: 'regular' },
    { name: 'overline',       size: 'sm', leading: 'loose',  tracking: 'wider', weight: 'regular', textCase: 'UPPER' },
    { name: 'code',           size: 'sm', leading: 'normal', tracking: 'normal', weight: 'regular', family: 'mono' },
  ]
  return styles.map(s => ({
    name: s.name,
    family: s.family ?? 'sans',
    textCase: s.textCase ?? 'ORIGINAL',
    bindings: {
      fontSize:      `font-size/${s.size}`,
      lineHeight:    `line-height/${s.leading}`,
      letterSpacing: `tracking/${s.tracking}`,
      fontWeight:    `font-weight/${s.weight}`,
      fontFamily:    `font-family/${s.family ?? 'sans'}`,
    },
  }))
}

// ───────────────────────────────────────────────────────────────────
// Effect Styles — shadows
// ───────────────────────────────────────────────────────────────────

function buildEffectStyles() {
  const ds = (x, y, blur, spread, alpha, hex = '#1c2533') => ({
    type: 'DROP_SHADOW', offset: { x, y }, radius: blur, spread, color: { hex, alpha }
  })
  return [
    { name: 'shadow/raised', effects: [
      ds(0, 0, 1, 0, 0.035), ds(0, 0.5, 1, -0.5, 0.045), ds(0, 1.5, 3, -1, 0.04), ds(0, 3, 7, -2, 0.03),
    ]},
    { name: 'shadow/raised-hover', effects: [
      ds(0, 0, 1, 0, 0.035), ds(0, 0.5, 1, -0.5, 0.04), ds(0, 2, 4, -1.5, 0.045),
      ds(0, 6, 12, -3, 0.035), ds(0, 14, 28, -8, 0.025),
    ]},
    { name: 'shadow/floating', effects: [
      ds(0, 0, 1, 0, 0.04), ds(0, 1, 2, -1, 0.05), ds(0, 4, 8, -2, 0.04),
      ds(0, 10, 20, -5, 0.035),
    ]},
    { name: 'shadow/overlay', effects: [
      ds(0, 0, 1, 0, 0.04), ds(0, 1, 2, -1, 0.05), ds(0, 3, 6, -2, 0.045),
      ds(0, 8, 16, -4, 0.04), ds(0, 18, 34, -8, 0.03),
    ]},
    { name: 'shadow/brand',   effects: [ds(0, 2, 8, 0, 0.20, '#c22d6d'), ds(0, 6, 20, 0, 0.15, '#c22d6d')] },
    { name: 'shadow/error',   effects: [ds(0, 2, 8, 0, 0.20, '#c53637'), ds(0, 6, 20, 0, 0.15, '#c53637')] },
    { name: 'shadow/success', effects: [ds(0, 2, 8, 0, 0.20, '#1f7a3e'), ds(0, 6, 20, 0, 0.15, '#1f7a3e')] },
    { name: 'shadow/warning', effects: [ds(0, 2, 8, 0, 0.22, '#fc9f30'), ds(0, 6, 20, 0, 0.15, '#fc9f30')] },
  ]
}

// ───────────────────────────────────────────────────────────────────
// Icon set (reference to pre-fetched Tabler SVG paths)
// ───────────────────────────────────────────────────────────────────

function buildIconSet() {
  // Paths pre-fetched from tabler-icons/main/icons/outline/*.svg
  return [
    { name: 'plus',          paths: '<path d="M12 5l0 14" /> <path d="M5 12l14 0" />' },
    { name: 'x',             paths: '<path d="M18 6l-12 12" /> <path d="M6 6l12 12" />' },
    { name: 'check',         paths: '<path d="M5 12l5 5l10 -10" />' },
    { name: 'arrow-left',    paths: '<path d="M5 12l14 0" /> <path d="M5 12l6 6" /> <path d="M5 12l6 -6" />' },
    { name: 'arrow-right',   paths: '<path d="M5 12l14 0" /> <path d="M13 18l6 -6" /> <path d="M13 6l6 6" />' },
    { name: 'chevron-up',    paths: '<path d="M6 15l6 -6l6 6" />' },
    { name: 'chevron-down',  paths: '<path d="M6 9l6 6l6 -6" />' },
    { name: 'chevron-right', paths: '<path d="M9 6l6 6l-6 6" />' },
    { name: 'search',        paths: '<path d="M3 10a7 7 0 1 0 14 0a7 7 0 1 0 -14 0" /> <path d="M21 21l-6 -6" />' },
    { name: 'edit',          paths: '<path d="M7 7h-1a2 2 0 0 0 -2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2 -2v-1" /> <path d="M20.385 6.585a2.1 2.1 0 0 0 -2.97 -2.97l-8.415 8.385v3h3l8.385 -8.415" /> <path d="M16 5l3 3" />' },
    { name: 'trash',         paths: '<path d="M4 7l16 0" /> <path d="M10 11l0 6" /> <path d="M14 11l0 6" /> <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" /> <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" />' },
    { name: 'copy',          paths: '<path d="M7 9.667a2.667 2.667 0 0 1 2.667 -2.667h8.666a2.667 2.667 0 0 1 2.667 2.667v8.666a2.667 2.667 0 0 1 -2.667 2.667h-8.666a2.667 2.667 0 0 1 -2.667 -2.667l0 -8.666" /> <path d="M4.012 16.737a2.005 2.005 0 0 1 -1.012 -1.737v-10c0 -1.1 .9 -2 2 -2h10c.75 0 1.158 .385 1.5 1" />' },
    { name: 'download',      paths: '<path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2" /> <path d="M7 11l5 5l5 -5" /> <path d="M12 4l0 12" />' },
    { name: 'upload',        paths: '<path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2" /> <path d="M7 9l5 -5l5 5" /> <path d="M12 4l0 12" />' },
    { name: 'external-link', paths: '<path d="M12 6h-6a2 2 0 0 0 -2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-6" /> <path d="M11 13l9 -9" /> <path d="M15 4h5v5" />' },
    { name: 'settings',      paths: '<path d="M10.325 4.317c.426 -1.756 2.924 -1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543 -.94 3.31 .826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756 .426 1.756 2.924 0 3.35a1.724 1.724 0 0 0 -1.066 2.573c.94 1.543 -.826 3.31 -2.37 2.37a1.724 1.724 0 0 0 -2.572 1.065c-.426 1.756 -2.924 1.756 -3.35 0a1.724 1.724 0 0 0 -2.573 -1.066c-1.543 .94 -3.31 -.826 -2.37 -2.37a1.724 1.724 0 0 0 -1.065 -2.572c-1.756 -.426 -1.756 -2.924 0 -3.35a1.724 1.724 0 0 0 1.066 -2.573c-.94 -1.543 .826 -3.31 2.37 -2.37c1 .608 2.296 .07 2.572 -1.065" /> <path d="M9 12a3 3 0 1 0 6 0a3 3 0 0 0 -6 0" />' },
    { name: 'heart',         paths: '<path d="M19.5 12.572l-7.5 7.428l-7.5 -7.428a5 5 0 1 1 7.5 -6.566a5 5 0 1 1 7.5 6.572" />' },
    { name: 'star',          paths: '<path d="M12 17.75l-6.172 3.245l1.179 -6.873l-5 -4.867l6.9 -1l3.086 -6.253l3.086 6.253l6.9 1l-5 4.867l1.179 6.873l-6.158 -3.245" />' },
    { name: 'user',          paths: '<path d="M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0" /> <path d="M6 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2" />' },
  ]
}

// ───────────────────────────────────────────────────────────────────
// Main
// ───────────────────────────────────────────────────────────────────

function main() {
  const spec = {
    generatedAt: new Date().toISOString(),
    sourceFiles: [
      'packages/core/src/tokens/primitives.css',
      'packages/core/src/tokens/semantic.css',
      'packages/core/src/tokens/typography-semantic.css',
    ],
    pages: ['Tokens', 'Components', 'Foundation'],
    collections: [
      buildPrimitiveColorCollection(),
      buildSemanticColorCollection(),
      buildSpacingCollection(),
      buildRadiusCollection(),
      buildTypographyCollection(),
    ],
    textStyles: buildTextStyles(),
    effectStyles: buildEffectStyles(),
    iconSet: {
      strokeBinding: 'surface/fg-muted',
      strokeWidth: 2,
      svgSize: 24,
      icons: buildIconSet(),
    },
    // Hints for the rebuild agent
    executionOrder: [
      'Create pages (Tokens, Components, Foundation) — delete Temp',
      'Build collections in order: Primitives/Color → Semantic/Color → Spacing → Radius → Typography',
      'Set scopes on every variable after creation (use `variable.scopes = [...]`)',
      'Create text styles — bind fontSize/lineHeight/letterSpacing/fontWeight via setBoundVariable',
      'Create effect styles from effectStyles array',
      'Create icon components from iconSet — apply SCALE constraints to all child paths, bind strokes to surface/fg-muted',
      'Build Foundation reference page with swatches + type scale + spacing bars + radius + shadows',
    ],
  }

  mkdirSync(OUT_DIR, { recursive: true })
  writeFileSync(OUT_FILE, JSON.stringify(spec, null, 2))
  const stats = {
    collections: spec.collections.length,
    totalVariables: spec.collections.reduce((n, c) => n + c.variables.length, 0),
    textStyles: spec.textStyles.length,
    effectStyles: spec.effectStyles.length,
    icons: spec.iconSet.icons.length,
  }
  console.log(`Wrote ${OUT_FILE}`)
  console.log(JSON.stringify(stats, null, 2))
}

main()
