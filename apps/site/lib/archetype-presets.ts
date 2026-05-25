/**
 * Archetype role-token presets for the Themer.
 *
 * Single source of truth for the preview math. When v0.40 ships the
 * archetypes as real DS tokens in `packages/core/src/tokens/semantic.css`,
 * this file becomes a mirror — values must match.
 *
 * Until then, this is the canonical reference both for the playground
 * previews AND for the eventual `[data-archetype]` blocks in semantic.css.
 */

export type ArchetypeName =
  | 'linear'
  | 'stripe'
  | 'apple'
  | 'material'
  | 'notion'
  | 'vercel'
  | 'devalok'

export type DensityName = 'compact' | 'comfortable' | 'spacious'
export type ShapeName = 'sharp' | 'slightly-rounded' | 'rounded'
export type MotionName = 'off' | 'calm' | 'lively'

/**
 * Per-archetype preview values used by `PreviewFrame`.
 * Pixel-accurate match to playgrounds/archetype-gallery.html.
 */
export interface ArchetypeRoleValues {
  /** --radius-surface */
  rs: number
  /** --radius-control */
  rc: number
  /** --space-control-x */
  px: number
  /** --space-control-y */
  py: number
  /** --space-card-pad */
  cp: number
  /** --border-surface-width */
  bw: number
  /** --shadow-raised */
  shad: string
  /** preview-frame background (mostly app background) */
  bg: string
  /** preview-frame border color */
  bc: string
  /** Body/heading display weight */
  fontWeight: number
  /** Body line-height */
  leading: number
  /** Display text size */
  headSize: number
  /** Body text size */
  bodySize: number
}

export const ARCHETYPES: Record<ArchetypeName, ArchetypeRoleValues> = {
  linear: {
    rs: 6, rc: 4, px: 12, py: 6, cp: 18, bw: 0.5,
    shad: 'inset 0 0 0 1px oklch(0.90 0.005 280)',
    bg: 'oklch(0.99 0.003 280)',
    bc: 'oklch(0.92 0.005 280)',
    fontWeight: 600, leading: 1.4, headSize: 15, bodySize: 14,
  },
  stripe: {
    rs: 10, rc: 6, px: 16, py: 8, cp: 22, bw: 1,
    shad: '0 1px 2px oklch(0 0 0 / 0.05)',
    bg: 'oklch(0.985 0.005 280)',
    bc: 'oklch(0.88 0.01 280)',
    fontWeight: 600, leading: 1.5, headSize: 16, bodySize: 14,
  },
  apple: {
    rs: 20, rc: 12, px: 22, py: 12, cp: 30, bw: 0.5,
    shad: '0 8px 24px oklch(0 0 0 / 0.06)',
    bg: 'oklch(0.98 0.003 280)',
    bc: 'oklch(0.90 0.005 280)',
    fontWeight: 500, leading: 1.6, headSize: 18, bodySize: 16,
  },
  material: {
    rs: 16, rc: 12, px: 18, py: 10, cp: 22, bw: 1,
    shad: '0 6px 16px oklch(0 0 0 / 0.12)',
    bg: 'oklch(0.985 0.005 280)',
    bc: 'oklch(0.88 0.01 280)',
    fontWeight: 600, leading: 1.5, headSize: 16, bodySize: 14,
  },
  notion: {
    rs: 4, rc: 4, px: 14, py: 8, cp: 22, bw: 1,
    shad: 'inset 0 0 0 1px oklch(0.92 0.005 280)',
    bg: 'oklch(0.985 0.003 280)',
    bc: 'oklch(0.92 0.005 280)',
    fontWeight: 600, leading: 1.65, headSize: 17, bodySize: 15,
  },
  vercel: {
    rs: 6, rc: 4, px: 12, py: 6, cp: 18, bw: 1,
    shad: 'inset 0 0 0 1px oklch(0.90 0.005 280)',
    bg: 'oklch(0.99 0.002 280)',
    bc: 'oklch(0.90 0.005 280)',
    fontWeight: 700, leading: 1.45, headSize: 15, bodySize: 13,
  },
  devalok: {
    rs: 12, rc: 8, px: 18, py: 10, cp: 22, bw: 1,
    shad: '0 2px 8px oklch(0.55 0.19 340 / 0.10), 0 1px 2px oklch(0 0 0 / 0.04)',
    bg: 'oklch(0.985 0.005 340)',
    bc: 'oklch(0.88 0.015 340)',
    fontWeight: 600, leading: 1.55, headSize: 16, bodySize: 14,
  },
}

/** Density preset overrides — applied AFTER archetype base. */
export const DENSITY_OVERRIDES: Record<DensityName, Partial<ArchetypeRoleValues>> = {
  compact: { px: 10, py: 4, cp: 14 },
  comfortable: {},
  spacious: { px: 24, py: 14, cp: 32 },
}

/** Shape preset overrides — applied AFTER archetype + density. */
export const SHAPE_OVERRIDES: Record<ShapeName, Partial<ArchetypeRoleValues>> = {
  sharp: { rs: 4, rc: 2 },
  'slightly-rounded': { rs: 10, rc: 6 },
  rounded: { rs: 16, rc: 10 },
}

/** Compose base + overrides into final role values. */
export function mergeArchetype(
  archetype: ArchetypeName,
  density?: DensityName | null,
  shape?: ShapeName | null,
): ArchetypeRoleValues {
  return {
    ...ARCHETYPES[archetype],
    ...(density ? DENSITY_OVERRIDES[density] : {}),
    ...(shape ? SHAPE_OVERRIDES[shape] : {}),
  }
}

/** Archetype defaults — used to suppress "override" labelling when consumer didn't change anything. */
export const ARCHETYPE_DEFAULTS: Record<ArchetypeName, {
  density: DensityName
  shape: ShapeName
  motion: MotionName
}> = {
  linear:   { density: 'compact',     shape: 'sharp',             motion: 'calm' },
  stripe:   { density: 'comfortable', shape: 'slightly-rounded',  motion: 'lively' },
  apple:    { density: 'spacious',    shape: 'rounded',           motion: 'calm' },
  material: { density: 'comfortable', shape: 'rounded',           motion: 'lively' },
  notion:   { density: 'spacious',    shape: 'slightly-rounded',  motion: 'calm' },
  vercel:   { density: 'compact',     shape: 'sharp',             motion: 'calm' },
  devalok:  { density: 'comfortable', shape: 'slightly-rounded',  motion: 'lively' },
}

/** Display strings for the result page hero title. */
export const ARCHETYPE_TITLES: Record<ArchetypeName, string> = {
  linear: 'Sharp & focused.',
  stripe: 'Modern & balanced.',
  apple: 'Soft & calm.',
  material: 'Bold & layered.',
  notion: 'Readable & restrained.',
  vercel: 'Minimal & monochrome.',
  devalok: 'Warm & signature.',
}

/** Short description for archetype gallery + result summary. */
export const ARCHETYPE_DESCRIPTIONS: Record<ArchetypeName, string> = {
  linear: 'Sharp + compact + hairline borders + flat surfaces. Optimized for dense screens and fast scanning.',
  stripe: 'Slightly-rounded + comfortable + crisp borders + subtle shadows. Modern SaaS baseline.',
  apple: 'Rounded + spacious + hairline + ambient shadows. Restrained type, soft edges, lots of breathing room.',
  material: 'Rounded + comfortable + crisp + dramatic shadows. Vibrant accents. Familiar to mobile-first teams.',
  notion: 'Slightly-rounded + spacious + flat + editorial type. Optimized for reading and writing.',
  vercel: 'Sharp + compact + monochrome accent. Bold type. Engineering-led minimalism.',
  devalok: 'Devalok signature. Warm-tinted grain on surfaces, halo focus rings, pink accent, balanced rhythm.',
}

/** Suggest an archetype by hue band — used by brand-import page. */
export function suggestArchetypeByHue(hue: number): { name: ArchetypeName; why: string } {
  const h = ((hue % 360) + 360) % 360
  if (h >= 320 || h < 20) return { name: 'devalok', why: 'Pink/red family — pairs naturally with the Devalok archetype: grain texture, halo focus rings, balanced rhythm.' }
  if (h < 60)             return { name: 'apple', why: 'Warm orange/amber — sits well in the Apple archetype: spacious, restrained, hairline borders.' }
  if (h < 130)            return { name: 'material', why: 'Yellow-green band — Material 3 vibrance fits dramatic shadows + comfortable density.' }
  if (h < 200)            return { name: 'notion', why: 'Teal/green family — Notion archetype: editorial type, flat surfaces, spacious reading.' }
  if (h < 270)            return { name: 'stripe', why: 'Blue family — Stripe baseline: balanced, crisp, modern SaaS default.' }
  return                          { name: 'linear', why: 'Purple/indigo — Linear archetype: sharp corners, compact density, hairline borders. Engineering-led.' }
}
