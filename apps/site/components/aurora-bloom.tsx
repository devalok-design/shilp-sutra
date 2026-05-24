'use client'

import { MeshGradient } from '@paper-design/shaders-react'
import { useReducedMotion } from 'framer-motion'
import * as React from 'react'

import {
  readAuroraPalette,
  useAuroraPalette,
  type AuroraPalette,
} from '@/lib/aurora-palette'

export type { AuroraPalette }
export { readAuroraPalette, useAuroraPalette }

/**
 * AuroraBloom — theme-reactive, brand-aware WebGL aurora curtain.
 *
 * ⚠ INTERNAL — Devalok use only.
 *
 * Lives in `apps/site` and is intentionally NOT exported from
 * `@devalok/shilp-sutra`. Consumers outside the Devalok monorepo cannot
 * import this component from npm. If a future Devalok app needs the
 * effect, copy these files into that app (or move both files into a
 * private workspace package) — do not re-export them from the public DS.
 *
 * A composable hero background: drop one inside a `relative isolate` parent
 * and the aurora paints behind whatever sits above it. Pulls its palette
 * live from the design system's accent ramp, so brand switches, theme
 * flips, and `data-brand` mutations all cross-fade automatically.
 *
 * Composition (back-to-front):
 *   1. Solid `surface-base` ground — gives mix-blend-mode something to
 *      blend against. Without it the canvas blends against transparent and
 *      the blend mode is a no-op.
 *   2. BACK MeshGradient (layers >= 2)  — slow drift, large scale, rotated,
 *      blurred. Reads as the soft halo behind the brighter front curtain.
 *   3. FRONT MeshGradient                — primary curtain. Sharper, faster.
 *   4. MICRO MeshGradient (layers >= 3)  — fine detail, tighter scale,
 *      brighter grain. Adds close-up texture under the front curtain.
 *   5. CSS mask-image                    — shape-driven (`curtain`/`ribbon`/
 *      `halo`/`full`) × position-driven (`top`/`bottom`/`center`/`full`).
 *      Optional gentle "breathing" via CSS keyframes.
 *   6. Grain overlay (grain="match")     — Devalok SVG turbulence; locks
 *      visual rhyme with Button/Card grain across the rest of the system.
 *   7. Edge-wash divs                    — fade aurora to surface-base at
 *      the side opposite the bloom anchor, for clean hand-off.
 *
 * Reactivity & performance:
 *   - `data-brand` / `.dark` mutations    → tweened cross-fade (1.2s).
 *   - `prefers-reduced-motion`            → speed=0, breathing off, tween 0ms.
 *   - Off-screen (IntersectionObserver)   → shader RAF pauses.
 *   - Tab hidden                          → shader RAF pauses (Paper-side).
 *
 * @example
 * // Default — drops in behind a hero, brand-coloured curtain at the top.
 * <section className="relative isolate overflow-hidden">
 *   <AuroraBloom />
 *   <div className="relative z-10">…hero copy…</div>
 * </section>
 *
 * @example
 * // Centered halo, three layers, mouse parallax disabled
 * <AuroraBloom shape="halo" position="center" layers={3} parallax="off" />
 *
 * @example
 * // Custom palette override
 * <AuroraBloom palette={{
 *   colors: ['#0d1117', '#1a2b4a', '#2e7df6', '#7ab8ff', '#aeefff'],
 *   ground: '#0d1117',
 *   isDark: true,
 * }} />
 */

export type AuroraIntensity = 'subtle' | 'medium' | 'strong'
export type AuroraShape = 'curtain' | 'ribbon' | 'halo' | 'full'
export type AuroraPosition = 'top' | 'bottom' | 'center' | 'full'
export type AuroraLayers = 1 | 2 | 3
export type AuroraParallax = 'mouse' | 'scroll' | 'off'
export type AuroraGrain = 'match' | 'paper' | 'off'

export interface AuroraBloomProps {
  /**
   * Visual strength. Drives opacity, distortion, and scale across all
   * layers. Default: `'medium'`.
   *  - `subtle` — quiet brand wash for content-dense pages
   *  - `medium` — hero-default; visible without dominating
   *  - `strong` — pure showcase; near-opaque bloom
   */
  intensity?: AuroraIntensity
  /**
   * Mask silhouette. Default: `'curtain'`.
   *  - `curtain` — radial cone anchored at `position`. Hero-default.
   *  - `ribbon`  — horizontal band crossing at `position`.
   *  - `halo`    — small radial bloom centred at `position`.
   *  - `full`    — no mask; aurora fills the container edge-to-edge.
   */
  shape?: AuroraShape
  /**
   * Anchor of the bloom. Default: `'top'`. Affects both the mask and the
   * fade-to-surface direction.
   */
  position?: AuroraPosition
  /**
   * Number of stacked mesh layers. Default: `2`.
   *  - `1` — front only
   *  - `2` — front + back halo
   *  - `3` — front + back + micro detail (heaviest GPU)
   */
  layers?: AuroraLayers
  /**
   * Shader drift speed multiplier. `0` freezes the shader (stops its RAF).
   * Default: `0.35`.
   */
  speed?: number
  /**
   * Palette source. Default: `'brand'` (live token resolver).
   *  - `'brand'` — read accent ramp from CSS variables.
   *  - {@link AuroraPalette} — pass a fully-specified palette object.
   *  - `string[]` — 5 sRGB hex stops; ground + dark inferred from the page.
   */
  palette?: 'brand' | AuroraPalette | string[]
  /**
   * Parallax interaction. Default: `'mouse'`.
   *  - `'mouse'`  — back layer drifts opposite cursor (±20px).
   *  - `'scroll'` — aurora pans up as the page scrolls.
   *  - `'off'`    — static.
   */
  parallax?: AuroraParallax
  /**
   * Grain overlay. Default: `'paper'`.
   *  - `'paper'` — Paper Shaders' built-in noise (matches mesh distortion).
   *  - `'match'` — Devalok SVG turbulence (visual rhyme with Button/Card).
   *  - `'off'`   — no grain.
   */
  grain?: AuroraGrain
  /**
   * Whether the mask gently scales 99%↔101% over 4s for an "alive" feel.
   * Default: `true`. Suppressed by `prefers-reduced-motion`.
   */
  breathing?: boolean
  className?: string
}

/**
 * AURORA_PRESETS — named Devalok configurations of `AuroraBloom`.
 *
 * Each preset is a complete prop set + curatorial metadata. The names are
 * borrowed from the Devalok cultural vocabulary so any future Devalok app
 * can speak the same language ("apply the Bhairav preset" reads
 * unambiguously).
 *
 * Pick a preset by id from the consumer side:
 *
 *   <AuroraBloom {...AURORA_PRESETS.bhairav.props} />
 *
 * All six presets share the live brand ramp via `palette: 'brand'`, so they
 * recolour the moment the user switches brand from the header.
 */
export interface AuroraPreset {
  id: AuroraPresetId
  name: string
  mood: string
  useCase: string
  props: Required<
    Omit<AuroraBloomProps, 'palette' | 'className' | 'breathing'>
  > & {
    palette: AuroraBloomProps['palette']
    breathing: boolean
  }
}

export type AuroraPresetId =
  | 'devalok'
  | 'bhairav'
  | 'saptarishi'
  | 'diya'
  | 'monsoon'
  | 'mandir'

export const AURORA_PRESETS: Record<AuroraPresetId, AuroraPreset> = {
  devalok: {
    id: 'devalok',
    name: 'Devalok',
    mood: 'House voice — warm, present, brand-anchored.',
    useCase: 'Marketing hero, product landing, anything that wants to feel like home.',
    props: {
      intensity: 'medium',
      shape: 'curtain',
      position: 'top',
      layers: 2,
      speed: 0.35,
      parallax: 'mouse',
      grain: 'paper',
      breathing: true,
      // The Devalok preset is the only one that *follows the user's brand*
      // — it inherits whatever accent ramp is active in the header.
      palette: 'brand',
    },
  },
  bhairav: {
    id: 'bhairav',
    name: 'Bhairav',
    mood: 'Pre-dawn raga — held, contemplative, slow to bloom.',
    useCase: 'Meditation pages, story openers, long-read essays.',
    props: {
      intensity: 'strong',
      shape: 'halo',
      position: 'center',
      layers: 3,
      speed: 0.18,
      parallax: 'scroll',
      grain: 'match',
      breathing: true,
      // Deep indigo / pre-dawn sky. Hue ~275 in OKLCH, hand-converted
      // to sRGB hex at the same L/C curve as the brand ramp.
      palette: ['#f5f3ff', '#d4c8fa', '#7d65e0', '#5440c2', '#3a2c8a'],
    },
  },
  saptarishi: {
    id: 'saptarishi',
    name: 'Saptarishi',
    mood: 'Starlight — the quietest aurora. Atmospheric, almost still.',
    useCase: 'Behind data-dense screens, settings pages, dashboards.',
    props: {
      intensity: 'subtle',
      shape: 'full',
      position: 'full',
      layers: 3,
      speed: 0.12,
      parallax: 'off',
      grain: 'paper',
      breathing: false,
      // Cool slate-blue starlight. Hue ~230.
      palette: ['#f1f5fb', '#cfdaee', '#7a98c5', '#4b6fa6', '#2b4670'],
    },
  },
  diya: {
    id: 'diya',
    name: 'Diya',
    mood: 'A small flame from below — warm, anchored, glowing up.',
    useCase: 'CTAs, footer banners, sign-in pages.',
    props: {
      intensity: 'strong',
      shape: 'halo',
      position: 'bottom',
      layers: 2,
      speed: 0.4,
      parallax: 'off',
      grain: 'match',
      breathing: true,
      // Warm amber flame. Hue ~50.
      palette: ['#fff8ed', '#ffd99c', '#f7a83a', '#d97706', '#7c3d09'],
    },
  },
  monsoon: {
    id: 'monsoon',
    name: 'Monsoon',
    mood: 'A band of cloud rolling across — movement, weather.',
    useCase: 'Announcement banners, launch pages, between sections.',
    props: {
      intensity: 'medium',
      shape: 'ribbon',
      position: 'center',
      layers: 2,
      speed: 0.55,
      parallax: 'mouse',
      grain: 'paper',
      breathing: true,
      // Stormy teal. Hue ~200.
      palette: ['#eef9fb', '#bfe3ec', '#5fa9b5', '#2f7d8a', '#1c4d57'],
    },
  },
  mandir: {
    id: 'mandir',
    name: 'Mandir',
    mood: 'Incense rising — a narrow, quiet curtain at the very top.',
    useCase: 'Doc pages, blog headers, careful product screens.',
    props: {
      intensity: 'subtle',
      shape: 'curtain',
      position: 'top',
      layers: 1,
      speed: 0.25,
      parallax: 'off',
      grain: 'match',
      breathing: true,
      // Saffron / sandalwood. Hue ~60.
      palette: ['#fffaeb', '#ffe8a1', '#f0b933', '#c08712', '#704d05'],
    },
  },
}

const FALLBACK_PALETTE: AuroraPalette = {
  colors: ['#fafafa', '#fce8ef', '#e58fb0', '#a23f6a', '#c66b8e'],
  ground: '#fafafa',
  isDark: false,
}

const TWEEN_MS = 1200

const INTENSITY_PARAMS: Record<AuroraIntensity, {
  frontOpacity: { light: number; dark: number }
  backOpacity: number
  microOpacity: number
  distortion: number
  swirl: number
  scale: number
}> = {
  subtle: {
    frontOpacity: { light: 0.7, dark: 0.5 },
    backOpacity: 0.3,
    microOpacity: 0.25,
    distortion: 0.7,
    swirl: 0.45,
    scale: 1.1,
  },
  medium: {
    frontOpacity: { light: 0.95, dark: 0.85 },
    backOpacity: 0.55,
    microOpacity: 0.4,
    distortion: 0.95,
    swirl: 0.65,
    scale: 1.35,
  },
  strong: {
    frontOpacity: { light: 1, dark: 1 },
    backOpacity: 0.7,
    microOpacity: 0.5,
    distortion: 1,
    swirl: 0.85,
    scale: 1.6,
  },
}

export function AuroraBloom({
  intensity = 'medium',
  shape = 'curtain',
  position = 'top',
  layers = 2,
  speed = 0.35,
  palette = 'brand',
  parallax = 'mouse',
  grain = 'paper',
  breathing = true,
  className,
}: AuroraBloomProps) {
  const prefersReducedMotion = useReducedMotion()
  const livePalette = useAuroraPalette()

  // Resolve incoming palette prop to an `AuroraPalette`. Three forms:
  // 'brand' (live hook), `AuroraPalette` object, or `string[]` (5 hex stops).
  const target = React.useMemo<AuroraPalette>(() => {
    if (palette === 'brand') return livePalette
    if (Array.isArray(palette)) {
      return {
        colors: palette.slice(0, 5),
        ground: livePalette.ground,
        isDark: livePalette.isDark,
      }
    }
    return palette
  }, [palette, livePalette])

  // Tween the palette so brand/theme switches cross-fade instead of flip.
  const shown = useTweenedPalette(target, prefersReducedMotion ? 0 : TWEEN_MS)

  // Pause the shader when the aurora scrolls off-screen.
  const rootRef = React.useRef<HTMLDivElement>(null)
  const isVisible = useInViewport(rootRef)

  // Parallax offset (px). Driven by mouse OR scroll depending on `parallax`.
  const parallaxOffset = useParallaxOffset(parallax, prefersReducedMotion)

  // Intensity-driven shader params.
  const ip = INTENSITY_PARAMS[intensity]
  const frontOpacity = shown.isDark ? ip.frontOpacity.dark : ip.frontOpacity.light
  const blendMode: React.CSSProperties['mixBlendMode'] = shown.isDark
    ? 'screen'
    : 'multiply'

  // Effective speed — zero when reduced-motion or off-screen.
  const effectiveSpeed = prefersReducedMotion || !isVisible ? 0 : speed

  // Back-layer palette: same hues, re-ordered so the deepest stops occupy
  // the visual middle. Reads as a softer halo under the front curtain.
  const backColors = React.useMemo(() => {
    const c = shown.colors
    return [c[3] ?? c[0], c[0], c[2], c[4] ?? c[0], c[1]]
  }, [shown.colors])

  // Mask image — driven by `shape` × `position`.
  const maskImage = computeMaskImage(shape, position)

  // Edge-wash gradient direction — opposite the bloom anchor.
  const edgeWash = computeEdgeWash(position, shown.ground)

  const containerStyle: React.CSSProperties = {
    maskImage,
    WebkitMaskImage: maskImage,
    transform: parallaxOffset ? `translate3d(${parallaxOffset.x}px, ${parallaxOffset.y}px, 0)` : undefined,
    transition: 'transform 200ms cubic-bezier(0.2, 0, 0.38, 0.9)',
    animation:
      breathing && !prefersReducedMotion
        ? 'shilp-sutra-aurora-breathing 6s ease-in-out infinite'
        : undefined,
    transformOrigin: '50% 30%',
  }

  return (
    <>
      {/* Keyframes for breathing — scoped via attribute selector. */}
      <style>{`
        @keyframes shilp-sutra-aurora-breathing {
          0%, 100% { transform: var(--aurora-tx, none) scale(1); }
          50%      { transform: var(--aurora-tx, none) scale(1.02); }
        }
      `}</style>

      <div
        ref={rootRef}
        aria-hidden="true"
        data-aurora-bloom=""
        className={
          'pointer-events-none absolute inset-0 z-0 overflow-hidden ' +
          (className ?? '')
        }
        style={containerStyle}
      >
        {/* Inner solid bg — gives mix-blend-mode something to mix against. */}
        <div
          className="absolute inset-0"
          style={{ background: shown.ground }}
        />

        {/* BACK LAYER — soft halo, lower opacity, slower drift, blurred. */}
        {layers >= 2 && (
          <MeshGradient
            colors={backColors}
            distortion={Math.min(1, ip.distortion - 0.3)}
            swirl={Math.min(1, ip.swirl + 0.2)}
            grainMixer={grain === 'paper' ? 0.15 : 0}
            grainOverlay={grain === 'paper' ? 0.1 : 0}
            speed={effectiveSpeed * 0.4}
            scale={ip.scale + 0.85}
            rotation={35}
            offsetX={0.12}
            offsetY={position === 'bottom' ? 0.25 : -0.25}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              mixBlendMode: blendMode,
              opacity: ip.backOpacity,
              filter: 'blur(40px)',
            }}
          />
        )}

        {/* FRONT LAYER — primary curtain. */}
        <MeshGradient
          colors={shown.colors}
          distortion={ip.distortion}
          swirl={ip.swirl}
          grainMixer={grain === 'paper' ? 0.3 : 0}
          grainOverlay={grain === 'paper' ? 0.22 : 0}
          speed={effectiveSpeed}
          scale={ip.scale}
          rotation={0}
          offsetY={
            position === 'bottom' ? 0.08 : position === 'center' || position === 'full' ? 0 : -0.08
          }
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            mixBlendMode: blendMode,
            opacity: frontOpacity,
          }}
        />

        {/* MICRO LAYER — fine detail, tighter scale. */}
        {layers >= 3 && (
          <MeshGradient
            colors={shown.colors}
            distortion={Math.min(1, ip.distortion + 0.05)}
            swirl={Math.min(1, ip.swirl - 0.15)}
            grainMixer={grain === 'paper' ? 0.45 : 0}
            grainOverlay={grain === 'paper' ? 0.35 : 0}
            speed={effectiveSpeed * 1.4}
            scale={Math.max(0.6, ip.scale - 0.6)}
            rotation={-15}
            offsetX={-0.1}
            offsetY={
              position === 'bottom' ? 0.18 : position === 'center' || position === 'full' ? 0.05 : -0.18
            }
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              mixBlendMode: blendMode,
              opacity: ip.microOpacity,
            }}
          />
        )}

        {/* Devalok SVG grain overlay — only when grain === 'match'. */}
        {grain === 'match' && <DevalokGrainOverlay isDark={shown.isDark} />}

        {/* Edge-wash to surface-base — opposite the bloom anchor. */}
        {edgeWash && (
          <div
            className={edgeWash.className}
            style={{ background: edgeWash.gradient }}
          />
        )}
      </div>
    </>
  )
}

/* ─── mask shape × position table ──────────────────────────────────────── */

function computeMaskImage(shape: AuroraShape, position: AuroraPosition): string | undefined {
  if (shape === 'full') return undefined

  const anchor = positionAnchor(position)

  if (shape === 'curtain') {
    // Wide-but-tight cone anchored at `anchor`. The exact tuple was tuned
    // against the Devalok hero — wide horizontally so it reads as sky, but
    // tight vertically so the copy below stays readable.
    return `radial-gradient(120% 75% at ${anchor}, black 0%, rgba(0,0,0,0.85) 35%, rgba(0,0,0,0.35) 65%, transparent 92%)`
  }

  if (shape === 'ribbon') {
    // Horizontal band that fills horizontally and crosses at `anchor.y`.
    // Soft falloff above and below the band.
    const y =
      position === 'top'
        ? '15%'
        : position === 'bottom'
          ? '85%'
          : '50%'
    return `linear-gradient(to bottom, transparent 0%, transparent calc(${y} - 30%), black ${y}, transparent calc(${y} + 30%), transparent 100%)`
  }

  if (shape === 'halo') {
    // Tight radial bloom centred at `anchor`.
    return `radial-gradient(40% 40% at ${anchor}, black 0%, rgba(0,0,0,0.6) 50%, transparent 100%)`
  }

  return undefined
}

function positionAnchor(position: AuroraPosition): string {
  switch (position) {
    case 'top':
      return '50% -10%'
    case 'bottom':
      return '50% 110%'
    case 'center':
      return '50% 50%'
    case 'full':
      return '50% 50%'
  }
}

/* ─── edge wash ────────────────────────────────────────────────────────── */

function computeEdgeWash(
  position: AuroraPosition,
  ground: string,
): { className: string; gradient: string } | null {
  if (position === 'full' || position === 'center') return null

  const groundAlpha = withAlpha(ground, 0.6)

  if (position === 'top') {
    return {
      className: 'absolute inset-x-0 bottom-0 h-1/2',
      gradient: `linear-gradient(to bottom, transparent 0%, ${groundAlpha} 60%, ${ground} 100%)`,
    }
  }

  // bottom-anchored: wash the top edge instead.
  return {
    className: 'absolute inset-x-0 top-0 h-1/2',
    gradient: `linear-gradient(to top, transparent 0%, ${groundAlpha} 60%, ${ground} 100%)`,
  }
}

/* ─── Devalok grain overlay ────────────────────────────────────────────── */

const DEVALOK_NOISE_SVG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.45' numOctaves='3' seed='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)'/%3E%3C/svg%3E")`

function DevalokGrainOverlay({ isDark }: { isDark: boolean }) {
  return (
    <div
      className="absolute inset-0"
      style={{
        backgroundImage: DEVALOK_NOISE_SVG,
        backgroundSize: '160px 160px',
        opacity: isDark ? 0.18 : 0.14,
        mixBlendMode: 'overlay',
        filter: 'contrast(180%) brightness(105%)',
      }}
    />
  )
}

/* ─── tween hook ───────────────────────────────────────────────────────── */

function useTweenedPalette(target: AuroraPalette, durationMs: number): AuroraPalette {
  const [shown, setShown] = React.useState<AuroraPalette>(target)
  const fromRef = React.useRef<AuroraPalette>(target)
  const shownRef = React.useRef<AuroraPalette>(target)
  const rafRef = React.useRef(0)
  const lastTargetKey = React.useRef<string>(paletteKey(target))

  // Keep a ref of `shown` so the effect below can read the current in-flight
  // palette as the new `from` without needing `shown` in its dep array
  // (which would re-fire the effect every frame).
  React.useEffect(() => {
    shownRef.current = shown
  }, [shown])

  React.useEffect(() => {
    const targetKey = paletteKey(target)
    if (targetKey === lastTargetKey.current) return
    lastTargetKey.current = targetKey

    if (durationMs <= 0) {
      setShown(target)
      fromRef.current = target
      return
    }

    fromRef.current = shownRef.current
    const start = performance.now()
    cancelAnimationFrame(rafRef.current)

    const tick = (now: number) => {
      const t = Math.min((now - start) / durationMs, 1)
      const eased = easeInOutCubic(t)
      const colors = fromRef.current.colors.map((from, i) =>
        lerpHex(from, target.colors[i] ?? from, eased),
      )
      const ground = lerpHex(fromRef.current.ground, target.ground, eased)
      setShown({ colors, ground, isDark: target.isDark })
      if (t < 1) rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)

    return () => cancelAnimationFrame(rafRef.current)
  }, [target, durationMs])

  return shown
}

function paletteKey(p: AuroraPalette): string {
  return `${p.isDark ? 'd' : 'l'}|${p.colors.join(',')}|${p.ground}`
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

function lerpHex(a: string, b: string, t: number): string {
  const [ar, ag, ab] = parseHex(a)
  const [br, bg, bb] = parseHex(b)
  const r = Math.round(ar + (br - ar) * t)
  const g = Math.round(ag + (bg - ag) * t)
  const bl = Math.round(ab + (bb - ab) * t)
  return `#${toHex2(r)}${toHex2(g)}${toHex2(bl)}`
}

function parseHex(hex: string): [number, number, number] {
  const m = hex.replace('#', '')
  const r = parseInt(m.slice(0, 2), 16) || 0
  const g = parseInt(m.slice(2, 4), 16) || 0
  const b = parseInt(m.slice(4, 6), 16) || 0
  return [r, g, b]
}

function toHex2(n: number): string {
  return Math.max(0, Math.min(255, n)).toString(16).padStart(2, '0')
}

function withAlpha(hex: string, alpha: number): string {
  const a = Math.max(0, Math.min(1, alpha))
  const aHex = Math.round(a * 255)
    .toString(16)
    .padStart(2, '0')
  return `${hex}${aHex}`
}

/* ─── in-viewport hook ─────────────────────────────────────────────────── */

function useInViewport(ref: React.RefObject<HTMLElement | null>): boolean {
  const [inView, setInView] = React.useState(true)
  React.useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) setInView(entry.isIntersecting)
      },
      { rootMargin: '50px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [ref])
  return inView
}

/* ─── parallax hook ────────────────────────────────────────────────────── */

interface ParallaxOffset {
  x: number
  y: number
}

function useParallaxOffset(
  mode: AuroraParallax,
  prefersReducedMotion: boolean | null,
): ParallaxOffset | null {
  const [offset, setOffset] = React.useState<ParallaxOffset | null>(null)
  const pendingRef = React.useRef<ParallaxOffset | null>(null)
  const rafRef = React.useRef(0)

  React.useEffect(() => {
    if (mode === 'off' || prefersReducedMotion) {
      setOffset(null)
      return
    }
    if (typeof window === 'undefined') return

    const flush = () => {
      rafRef.current = 0
      if (pendingRef.current) setOffset(pendingRef.current)
    }
    const schedule = (next: ParallaxOffset) => {
      pendingRef.current = next
      if (rafRef.current === 0) rafRef.current = requestAnimationFrame(flush)
    }

    if (mode === 'mouse') {
      const onMove = (e: MouseEvent) => {
        // Normalise to [-0.5, 0.5] then scale to ±20px.
        const nx = e.clientX / window.innerWidth - 0.5
        const ny = e.clientY / window.innerHeight - 0.5
        // Inverse direction — the bloom drifts AWAY from the cursor, as if
        // the cursor were a magnet repelling light.
        schedule({ x: -nx * 20, y: -ny * 14 })
      }
      window.addEventListener('mousemove', onMove, { passive: true })
      return () => {
        window.removeEventListener('mousemove', onMove)
        cancelAnimationFrame(rafRef.current)
      }
    }

    if (mode === 'scroll') {
      const onScroll = () => {
        const y = window.scrollY * 0.15
        schedule({ x: 0, y: -y })
      }
      onScroll()
      window.addEventListener('scroll', onScroll, { passive: true })
      return () => {
        window.removeEventListener('scroll', onScroll)
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [mode, prefersReducedMotion])

  return offset
}
