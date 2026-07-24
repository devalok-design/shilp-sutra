/**
 * Themer URL state — single source for parse/serialize across all themer routes.
 *
 * Encoded into search params so any state is shareable. Examples:
 *   /themer/result?archetype=apple&hue=340&chroma=0.19&density=spacious
 *   /themer/result?archetype=devalok
 *
 * All fields optional. Reading: missing → undefined (callers fall back to archetype defaults).
 * Writing: undefined → param omitted (keeps URLs short).
 */

import {
  type ArchetypeName,
  type DensityName,
  type MotionName,
  type ShapeName,
} from './archetype-presets'

export type FocusRingName = 'standard' | 'halo' | 'crisp' | 'soft'
export type TextureName = 'none' | 'grain' | 'paper' | 'noise'

export interface ThemerState {
  archetype?: ArchetypeName
  density?: DensityName
  shape?: ShapeName
  motion?: MotionName
  /** OKLCH hue 0-360 */
  hue?: number
  /** OKLCH chroma 0-0.37 */
  chroma?: number
  focusRing?: FocusRingName
  texture?: TextureName
  /** Manual corner-radius override in px (0-64), takes precedence over the archetype/shape preset when set. */
  customRadius?: number
}

const ARCHETYPES: ArchetypeName[] = ['linear', 'stripe', 'apple', 'material', 'notion', 'vercel', 'devalok']
const DENSITIES: DensityName[] = ['compact', 'comfortable', 'spacious']
const SHAPES: ShapeName[] = ['sharp', 'slightly-rounded', 'rounded']
const MOTIONS: MotionName[] = ['off', 'calm', 'lively']
const FOCUS_RINGS: FocusRingName[] = ['standard', 'halo', 'crisp', 'soft']
const TEXTURES: TextureName[] = ['none', 'grain', 'paper', 'noise']

function pickEnum<T extends string>(value: string | null, valid: readonly T[]): T | undefined {
  if (!value) return undefined
  return valid.includes(value as T) ? (value as T) : undefined
}

function pickNumber(value: string | null, min: number, max: number): number | undefined {
  if (value == null) return undefined
  const n = Number.parseFloat(value)
  if (!Number.isFinite(n)) return undefined
  if (n < min || n > max) return undefined
  return n
}

/** Parse from a URLSearchParams (or any iterable of [k,v] pairs). */
export function parseThemerParams(params: URLSearchParams | string | undefined | null): ThemerState {
  if (!params) return {}
  const p = typeof params === 'string' ? new URLSearchParams(params) : params
  return {
    archetype: pickEnum(p.get('archetype'), ARCHETYPES),
    density: pickEnum(p.get('density'), DENSITIES),
    shape: pickEnum(p.get('shape'), SHAPES),
    motion: pickEnum(p.get('motion'), MOTIONS),
    hue: pickNumber(p.get('hue'), 0, 360),
    chroma: pickNumber(p.get('chroma'), 0, 0.37),
    focusRing: pickEnum(p.get('focusRing'), FOCUS_RINGS),
    texture: pickEnum(p.get('texture'), TEXTURES),
    customRadius: pickNumber(p.get('radius'), 0, 64),
  }
}

/** Serialize state back to URLSearchParams. Undefined fields are omitted. */
export function serializeThemerState(state: ThemerState): URLSearchParams {
  const params = new URLSearchParams()
  if (state.archetype) params.set('archetype', state.archetype)
  if (state.density) params.set('density', state.density)
  if (state.shape) params.set('shape', state.shape)
  if (state.motion) params.set('motion', state.motion)
  if (state.hue != null) params.set('hue', String(Math.round(state.hue)))
  if (state.chroma != null) params.set('chroma', state.chroma.toFixed(3))
  if (state.focusRing) params.set('focusRing', state.focusRing)
  if (state.texture) params.set('texture', state.texture)
  if (state.customRadius != null) params.set('radius', String(Math.round(state.customRadius)))
  return params
}

/** Build a relative URL with themer state encoded. */
export function buildThemerUrl(path: string, state: ThemerState): string {
  const qs = serializeThemerState(state).toString()
  return qs ? `${path}?${qs}` : path
}

/** Default state when nothing is set — Devalok archetype with brand accent. */
export const DEFAULT_THEMER_STATE: ThemerState = {
  archetype: 'devalok',
  hue: 340,
  chroma: 0.19,
}
