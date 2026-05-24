'use client'

import { MeshGradient } from '@paper-design/shaders-react'
import { useReducedMotion } from 'framer-motion'
import * as React from 'react'

import { resolveVar, useAuroraPalette } from '@/lib/aurora-palette'

/**
 * LotusBloom — staged WebGL composition that mimics the daily bloom cycle of
 * Nelumbo nucifera (the sacred lotus).
 *
 * ⚠ INTERNAL — Devalok use only. Sibling to AuroraBloom; same WebGL primitives
 * (Paper Shaders MeshGradient) but a fundamentally different composition:
 * AuroraBloom drifts continuously; LotusBloom *opens and closes* on a cycle.
 *
 * ── Biology, briefly ────────────────────────────────────────────────────
 *
 * Real lotuses move through five developmental stages (Liu 2019,
 * Lin 2016):
 *
 *   1. BUD          — small, green, closed; petal tips emerging
 *   2. OPENING      — petals unfurl outward, 2–12 cm; centre begins to show
 *   3. FULL BLOOM   — petals horizontal, stigma + yellow stamens fully visible
 *   4. PEAK         — flower at maximum spread (held for a beat)
 *   5. CLOSE        — petals retract; cycle restarts the next dawn
 *
 * Real timing: 3–4 days, opening at dawn and closing at dusk daily. We
 * compress the cycle into ~24 s by default — fast enough to read as an
 * animation, slow enough to feel organic.
 *
 * Petal colour runs from white at the base to pink at the tip; centre is
 * always yellow (receptacle + stamens); leaves below the bud are deep green.
 *
 * ── Mapping to WebGL ────────────────────────────────────────────────────
 *
 * Three stacked mesh layers:
 *   - LEAVES  (back)   — green water/leaves base. Slow swirl, low opacity.
 *   - PETALS  (middle) — the bloom itself. Scale + rotation animate; palette
 *                        cross-fades through bud → pink → white-pink stages.
 *   - STAMENS (front)  — yellow centre. Only visible during BLOOM + PEAK,
 *                        small scale, slight independent rotation.
 *
 * A radial mask anchored at the centre expands from ~5% radius (bud) to
 * 100% (peak) and contracts back — the literal "opening" gesture.
 *
 * Brand reactivity: petal colour tracks `--color-accent-*`, so switching
 * brand turns the lotus indigo or sage too. Leaves stay green (success-9)
 * and stamens stay yellow (warning-9) — those are universal lotus identity.
 */

export type LotusCycle = 'loop' | 'once' | 'paused'

export interface LotusBloomProps {
  /**
   * One full bud→peak→close cycle, in seconds. Default: 24s — fast enough
   * to read as motion, slow enough to feel organic.
   */
  durationSec?: number
  /**
   * Cycling behaviour. Default: `'loop'`.
   *  - `loop`   — animate forever
   *  - `once`   — play once and rest at peak
   *  - `paused` — freeze on the current frame
   */
  cycle?: LotusCycle
  /**
   * Override the petal colour ramp. Default: brand accent (light theme:
   * 1, 3, 7, 9; dark theme: 7, 8, 9, 11).
   */
  petalRamp?: [string, string, string, string]
  /** Override leaf colour. Default: `--color-success-9`. */
  leafColor?: string
  /** Override stamen colour. Default: `--color-warning-9`. */
  stamenColor?: string
  className?: string
}

const STAGE_AT = {
  bud: 0,
  opening: 0.18,
  bloom: 0.45,
  peak: 0.6,
  closing: 0.85,
  closed: 1,
} as const

export function LotusBloom({
  durationSec = 24,
  cycle = 'loop',
  petalRamp,
  leafColor,
  stamenColor,
  className,
}: LotusBloomProps) {
  const prefersReducedMotion = useReducedMotion()
  const brandPalette = useAuroraPalette()

  // Resolve auxiliary lotus colours from semantic tokens. We don't cross-fade
  // these on a tween — they're identity colours, not brand colours.
  const lotusColors = React.useMemo(() => {
    const ground = brandPalette.ground
    const isDark = brandPalette.isDark
    const leaf = leafColor ?? (resolveVar('--color-success-9', '#3aa564') || '#3aa564')
    const stamen = stamenColor ?? (resolveVar('--color-warning-9', '#ecb53b') || '#ecb53b')

    // Petals: white-ish at base, brand-pink at tip. The ramp from brand
    // accent gives us four interpolation stops along that gradient.
    let petals: [string, string, string, string]
    if (petalRamp) {
      petals = petalRamp
    } else if (isDark) {
      // Dark theme: lift indices upward so colours read against the page.
      petals = [
        brandPalette.colors[0] ?? '#222',
        brandPalette.colors[1] ?? '#444',
        brandPalette.colors[2] ?? '#888',
        brandPalette.colors[3] ?? '#ccc',
      ]
    } else {
      petals = [
        brandPalette.colors[0] ?? '#fafafa',
        brandPalette.colors[1] ?? '#fde2ed',
        brandPalette.colors[2] ?? '#f48cae',
        brandPalette.colors[3] ?? '#a23f6a',
      ]
    }

    return { ground, isDark, leaf, stamen, petals }
  }, [brandPalette, leafColor, stamenColor, petalRamp])

  // ── Animation clock ────────────────────────────────────────────────
  // Runs in [0..1] across one cycle. Reduced-motion locks at peak.
  const [progress, setProgress] = React.useState<number>(
    prefersReducedMotion || cycle === 'paused' ? STAGE_AT.peak : 0,
  )
  const startedRef = React.useRef<number>(0)
  const lastStageRef = React.useRef<number>(0)

  React.useEffect(() => {
    if (prefersReducedMotion) {
      setProgress(STAGE_AT.peak)
      return
    }
    if (cycle === 'paused') return

    let raf = 0
    let cancelled = false
    startedRef.current = performance.now()

    const tick = (now: number) => {
      if (cancelled) return
      const elapsed = (now - startedRef.current) / 1000
      const p = elapsed / durationSec
      if (cycle === 'once' && p >= STAGE_AT.peak) {
        setProgress(STAGE_AT.peak)
        return
      }
      setProgress(p % 1)
      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => {
      cancelled = true
      cancelAnimationFrame(raf)
    }
    // lastStageRef silences exhaustive-deps for a state ref.
    void lastStageRef
  }, [cycle, durationSec, prefersReducedMotion])

  // ── Stage-based parameter derivation ────────────────────────────────
  // The bloom is a piecewise lerp between named keyframes. Each keyframe
  // declares (mask radius, mask softness, petal scale, petal rotation
  // offset, stamen opacity, leaf opacity, petal palette index). We
  // interpolate with easeInOutSine for organic feel.
  const stage = derivedStage(progress)

  // Continuous rotation overlay — slow drift independent of stage progress,
  // so even during peak the petals subtly turn.
  const drift = (progress * 360) % 360

  return (
    <div
      aria-hidden="true"
      data-lotus-bloom=""
      className={'pointer-events-none absolute inset-0 z-0 overflow-hidden ' + (className ?? '')}
      style={{
        // Radial mask anchored at the centre. The radius pulses with the
        // bloom — this is the actual "opening" gesture.
        maskImage: `radial-gradient(${stage.maskRadius}% ${stage.maskRadius}% at 50% 50%, black 0%, rgba(0,0,0,${stage.maskHardness}) ${Math.max(40, stage.maskRadius * 0.6)}%, transparent ${stage.maskRadius * 1.05}%)`,
        WebkitMaskImage: `radial-gradient(${stage.maskRadius}% ${stage.maskRadius}% at 50% 50%, black 0%, rgba(0,0,0,${stage.maskHardness}) ${Math.max(40, stage.maskRadius * 0.6)}%, transparent ${stage.maskRadius * 1.05}%)`,
      }}
    >
      {/* Page-coloured ground so layered blend modes have something to
          composite against. Without this the mesh blends transparent. */}
      <div className="absolute inset-0" style={{ background: lotusColors.ground }} />

      {/* ── LEAVES — green base, slowest, sits behind the petals ─── */}
      <MeshGradient
        colors={[
          lotusColors.ground,
          shade(lotusColors.leaf, -0.35),
          lotusColors.leaf,
          shade(lotusColors.leaf, -0.2),
          lotusColors.ground,
        ]}
        distortion={0.65}
        swirl={0.9}
        grainMixer={0.2}
        grainOverlay={0.12}
        speed={0.12}
        scale={1.6}
        rotation={drift * 0.25}
        offsetY={0.05}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          mixBlendMode: lotusColors.isDark ? 'screen' : 'multiply',
          opacity: stage.leafOpacity,
          filter: 'blur(30px)',
        }}
      />

      {/* ── PETALS — the lotus itself. Scale + rotation + palette lerp. */}
      <MeshGradient
        colors={lerpPetalPalette(lotusColors.petals, stage.petalMix)}
        distortion={0.85}
        swirl={0.45}
        grainMixer={0.18}
        grainOverlay={0.14}
        speed={0.22}
        scale={stage.petalScale}
        rotation={drift * 0.55}
        offsetY={0}
        offsetX={0}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          mixBlendMode: lotusColors.isDark ? 'screen' : 'multiply',
          opacity: stage.petalOpacity,
        }}
      />

      {/* ── STAMENS — bright yellow centre, only during bloom + peak. */}
      <MeshGradient
        colors={[
          shade(lotusColors.stamen, -0.35),
          lotusColors.stamen,
          shade(lotusColors.stamen, 0.25),
          lotusColors.stamen,
          shade(lotusColors.stamen, -0.2),
        ]}
        distortion={0.95}
        swirl={0.3}
        grainMixer={0.4}
        grainOverlay={0.3}
        speed={0.35}
        scale={stage.stamenScale}
        rotation={drift * -1.1}
        offsetY={0}
        offsetX={0}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          mixBlendMode: 'screen',
          opacity: stage.stamenOpacity,
          // Stamens are a small radial concentrated at the centre — let the
          // mask isolate them so they don't leak into the petal ring.
          maskImage:
            'radial-gradient(20% 20% at 50% 50%, black 0%, rgba(0,0,0,0.7) 60%, transparent 100%)',
          WebkitMaskImage:
            'radial-gradient(20% 20% at 50% 50%, black 0%, rgba(0,0,0,0.7) 60%, transparent 100%)',
        }}
      />
    </div>
  )
}

/* ── Stage parameter table ────────────────────────────────────────── */

interface StageParams {
  maskRadius: number      // % radius of the mask (0–100)
  maskHardness: number    // alpha at mask softening point (0–1)
  petalScale: number      // mesh scale for the petal layer
  petalOpacity: number    // 0–1
  petalMix: number        // 0 = bud palette, 1 = full-bloom palette
  stamenScale: number     // 0.0–0.6 (small)
  stamenOpacity: number   // 0–1
  leafOpacity: number     // 0–1
}

const KEYFRAMES: Record<keyof typeof STAGE_AT, StageParams> = {
  // BUD — tightly closed, mostly green leaves visible.
  bud:     { maskRadius:  18, maskHardness: 0.95, petalScale: 0.55, petalOpacity: 0.35, petalMix: 0.0,  stamenScale: 0.15, stamenOpacity: 0.0,  leafOpacity: 0.95 },
  // OPENING — petals stretch outward, centre starts to peek.
  opening: { maskRadius:  58, maskHardness: 0.85, petalScale: 0.95, petalOpacity: 0.7,  petalMix: 0.35, stamenScale: 0.3,  stamenOpacity: 0.25, leafOpacity: 0.7 },
  // FULL BLOOM — petals horizontal, stamens released.
  bloom:   { maskRadius:  95, maskHardness: 0.55, petalScale: 1.35, petalOpacity: 0.95, petalMix: 0.85, stamenScale: 0.5,  stamenOpacity: 0.85, leafOpacity: 0.35 },
  // PEAK — held briefly at maximum spread.
  peak:    { maskRadius: 100, maskHardness: 0.45, petalScale: 1.45, petalOpacity: 1.0,  petalMix: 1.0,  stamenScale: 0.55, stamenOpacity: 1.0,  leafOpacity: 0.3 },
  // CLOSING — petals retract; centre fades first.
  closing: { maskRadius:  55, maskHardness: 0.8,  petalScale: 0.9,  petalOpacity: 0.65, petalMix: 0.5,  stamenScale: 0.25, stamenOpacity: 0.2,  leafOpacity: 0.7 },
  // CLOSED — back to bud (same as bud for clean loop).
  closed:  { maskRadius:  18, maskHardness: 0.95, petalScale: 0.55, petalOpacity: 0.35, petalMix: 0.0,  stamenScale: 0.15, stamenOpacity: 0.0,  leafOpacity: 0.95 },
}

function derivedStage(progress: number): StageParams {
  const t = Math.max(0, Math.min(1, progress))
  const segments = Object.entries(STAGE_AT) as Array<[keyof typeof STAGE_AT, number]>

  for (let i = 0; i < segments.length - 1; i++) {
    const [aKey, aT] = segments[i]
    const [bKey, bT] = segments[i + 1]
    if (t >= aT && t <= bT) {
      const span = bT - aT || 1
      const local = (t - aT) / span
      const eased = easeInOutSine(local)
      return lerpStage(KEYFRAMES[aKey], KEYFRAMES[bKey], eased)
    }
  }
  return KEYFRAMES.closed
}

function lerpStage(a: StageParams, b: StageParams, t: number): StageParams {
  return {
    maskRadius:    a.maskRadius    + (b.maskRadius    - a.maskRadius)    * t,
    maskHardness:  a.maskHardness  + (b.maskHardness  - a.maskHardness)  * t,
    petalScale:    a.petalScale    + (b.petalScale    - a.petalScale)    * t,
    petalOpacity:  a.petalOpacity  + (b.petalOpacity  - a.petalOpacity)  * t,
    petalMix:      a.petalMix      + (b.petalMix      - a.petalMix)      * t,
    stamenScale:   a.stamenScale   + (b.stamenScale   - a.stamenScale)   * t,
    stamenOpacity: a.stamenOpacity + (b.stamenOpacity - a.stamenOpacity) * t,
    leafOpacity:   a.leafOpacity   + (b.leafOpacity   - a.leafOpacity)   * t,
  }
}

function easeInOutSine(t: number): number {
  return -(Math.cos(Math.PI * t) - 1) / 2
}

/* ── Petal palette interpolation ──────────────────────────────────── */

/**
 * The petal mesh shows a different blend depending on stage:
 *  - mix=0 → bud (deep-pink heavy, with greens leaking from below)
 *  - mix=1 → full bloom (white-pink gradient with deep accent edge)
 *
 * We achieve this by re-ordering the 4 supplied petal colours along the
 * mesh's 5 stops as `mix` rises. At mix=0 the deep stops front-load; at
 * mix=1 the light stops front-load with the deep at the tip.
 */
function lerpPetalPalette(
  petals: [string, string, string, string],
  mix: number,
): string[] {
  const [p1, p2, p3, p4] = petals
  if (mix < 0.5) {
    // Bud / opening: deeper pinks dominate, white only as a thin centre.
    const t = mix * 2
    return [
      lerpHex(p4, p1, t),
      lerpHex(p3, p2, t),
      p3,
      lerpHex(p2, p4, t),
      p4,
    ]
  }
  // Bloom / peak: classic lotus gradient — white centre, deep-pink edge.
  const t = (mix - 0.5) * 2
  return [
    p1,
    lerpHex(p2, p1, t * 0.4),
    p3,
    lerpHex(p3, p4, t),
    p4,
  ]
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

/**
 * Lighten / darken a hex by a percentage [-1, 1].
 * Negative = darker, positive = lighter. Used for derived leaf + stamen shades.
 */
function shade(hex: string, amount: number): string {
  const [r, g, b] = parseHex(hex)
  if (amount >= 0) {
    return `#${toHex2(Math.round(r + (255 - r) * amount))}${toHex2(Math.round(g + (255 - g) * amount))}${toHex2(Math.round(b + (255 - b) * amount))}`
  }
  const k = 1 + amount
  return `#${toHex2(Math.round(r * k))}${toHex2(Math.round(g * k))}${toHex2(Math.round(b * k))}`
}
