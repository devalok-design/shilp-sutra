'use client'

import { MeshGradient } from '@paper-design/shaders-react'
import { useReducedMotion } from 'framer-motion'
import * as React from 'react'

import { readAuroraPalette, type AuroraPalette } from '@/lib/aurora-palette'

/**
 * AuroraBloom — theme-reactive aurora curtain anchored at the top of the page.
 *
 * Composition (back-to-front):
 *   1. Solid `surface-base` ground — gives mix-blend-mode something to blend
 *      against. Without it the canvas blends against transparent and the
 *      blend mode is a no-op.
 *   2. BACK MeshGradient — slower, larger scale, rotated, lower opacity.
 *      Reads like the soft halo of the aurora — sits a layer back and gives
 *      the bloom *depth* by parallaxing under the front curtain.
 *   3. FRONT MeshGradient — primary curtain. Brighter, faster drift, sharper
 *      mesh distortion. The detail layer the eye reads first.
 *   4. CSS mask-image — curtain cone anchored at the top, fading down so the
 *      hero copy sits in the calm zone.
 *   5. Bottom-edge wash — hands the eye off cleanly to surface-base.
 *
 * Reactivity:
 *   - `data-brand` on <html> changes  → palette re-read, TWEENED, not flipped.
 *   - `.dark` class toggle on <html>  → palette re-read, TWEENED.
 *   - `prefers-reduced-motion`        → shader speed=0 (RAF loop stops);
 *                                       color tween also skipped (instant swap).
 *   - Tab hidden                      → shader auto-pauses (Paper internal).
 */

const FALLBACK_PALETTE: AuroraPalette = {
  colors: ['#fafafa', '#fce8ef', '#e58fb0', '#a23f6a', '#c66b8e'],
  ground: '#fafafa',
  isDark: false,
}

/** Duration of the cross-fade when brand or theme changes. */
const TWEEN_MS = 1200

interface AuroraBloomProps {
  /** Override the resolved palette (for stories / debugging). */
  palette?: AuroraPalette
  /** Animation speed multiplier for the FRONT layer. 0 = static. */
  speed?: number
  className?: string
}

export function AuroraBloom({
  palette: paletteOverride,
  speed = 0.35,
  className,
}: AuroraBloomProps) {
  const prefersReducedMotion = useReducedMotion()

  // `target` is the latest palette resolved from the DOM. `shown` is the
  // RAF-tweened palette actually fed to the shaders. They diverge briefly
  // during a brand or theme cross-fade and converge once the tween completes.
  const [target, setTarget] = React.useState<AuroraPalette>(
    () => paletteOverride ?? FALLBACK_PALETTE
  )
  const shown = useTweenedPalette(target, prefersReducedMotion ? 0 : TWEEN_MS)

  // Resolve the real palette once mounted (skips the SSR mismatch path).
  React.useEffect(() => {
    if (paletteOverride) {
      setTarget(paletteOverride)
      return
    }
    setTarget(readAuroraPalette())
  }, [paletteOverride])

  // Re-read on brand or theme change.
  React.useEffect(() => {
    if (paletteOverride) return
    if (typeof window === 'undefined') return

    let pending = 0
    const schedule = () => {
      window.clearTimeout(pending)
      pending = window.setTimeout(() => {
        setTarget(readAuroraPalette())
      }, 50)
    }

    const observer = new MutationObserver(schedule)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'data-brand', 'style'],
    })
    return () => {
      observer.disconnect()
      window.clearTimeout(pending)
    }
  }, [paletteOverride])

  const effectiveSpeed = prefersReducedMotion ? 0 : speed

  // BACK layer palette — same hues, re-ordered so the deepest stops occupy
  // the visual middle. Creates the impression of a softer halo sitting
  // behind the brighter front curtain.
  const backColors = React.useMemo(() => {
    const c = shown.colors
    // Rotate the stop order: deepest first, brightest in the middle.
    return [c[3] ?? c[0], c[0], c[2], c[4] ?? c[0], c[1]]
  }, [shown.colors])

  return (
    <div
      aria-hidden="true"
      className={
        'pointer-events-none absolute inset-0 z-0 overflow-hidden ' + (className ?? '')
      }
      style={{
        // Curtain anchored at the top — wide horizontally (reads like sky,
        // not a spotlight) but tight vertically so the hero copy sits in a
        // calm, low-color zone. Aggressive falloff past ~60% guarantees the
        // body text remains readable.
        maskImage:
          'radial-gradient(120% 75% at 50% -10%, black 0%, rgba(0,0,0,0.85) 35%, rgba(0,0,0,0.35) 65%, transparent 92%)',
        WebkitMaskImage:
          'radial-gradient(120% 75% at 50% -10%, black 0%, rgba(0,0,0,0.85) 35%, rgba(0,0,0,0.35) 65%, transparent 92%)',
      }}
    >
      {/* Inner background — gives mix-blend-mode something to mix against. */}
      <div className="absolute inset-0 bg-surface-base" />

      {/* BACK LAYER — slower drift, larger scale, lower opacity. Provides
          depth via parallax against the front curtain. */}
      <MeshGradient
        colors={backColors}
        distortion={0.6}
        swirl={0.9}
        grainMixer={0.15}
        grainOverlay={0.1}
        speed={effectiveSpeed * 0.4}
        scale={2.2}
        rotation={35}
        offsetX={0.12}
        offsetY={-0.25}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          mixBlendMode: shown.isDark ? 'screen' : 'multiply',
          opacity: shown.isDark ? 0.55 : 0.55,
          // Larger blur on the back layer reinforces the depth cue — like a
          // tilt-shift lens with the back further from the focal plane.
          filter: 'blur(40px)',
        }}
      />

      {/* FRONT LAYER — sharper, faster, the curtain you read first. */}
      <MeshGradient
        // 5 stops drawn from the brand ramp (theme-aware — see aurora-palette).
        // Order matters: MeshGradient treats stops as orbiting spots, so the
        // mid-list color tends to occupy the visual centre of the bloom.
        colors={shown.colors}
        distortion={0.95}
        swirl={0.65}
        grainMixer={0.3}
        grainOverlay={0.22}
        speed={effectiveSpeed}
        scale={1.35}
        rotation={0}
        offsetY={-0.08}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          // Dark mode: additive (screen) so bright accent stops bloom against
          //   the near-black surface instead of being averaged with it.
          // Light mode: multiply so accent stops tint the white surface
          //   instead of overpowering it (Stripe / Linear-style tint).
          mixBlendMode: shown.isDark ? 'screen' : 'multiply',
          opacity: shown.isDark ? 0.85 : 0.95,
        }}
      />

      {/* Bottom-edge wash — taller + softer than a vignette; hands the eye
          off cleanly to surface-base without darkening the bloom. */}
      <div
        className="absolute inset-x-0 bottom-0 h-1/2"
        style={{
          background: `linear-gradient(to bottom, transparent 0%, ${withAlpha(shown.ground, 0.6)} 60%, ${shown.ground} 100%)`,
        }}
      />
    </div>
  )
}

/* ─── tween helpers ────────────────────────────────────────────────────── */

/**
 * Tween from the currently-shown palette to a new target whenever the target
 * changes. Returns the in-flight palette. Skipping animation (durationMs=0)
 * snaps instantly — used when the user prefers reduced motion.
 */
function useTweenedPalette(target: AuroraPalette, durationMs: number): AuroraPalette {
  const [shown, setShown] = React.useState<AuroraPalette>(target)
  const fromRef = React.useRef<AuroraPalette>(target)
  const rafRef = React.useRef(0)
  const lastTargetKey = React.useRef<string>(paletteKey(target))

  React.useEffect(() => {
    const targetKey = paletteKey(target)
    if (targetKey === lastTargetKey.current && shown === target) return
    lastTargetKey.current = targetKey

    if (durationMs <= 0) {
      setShown(target)
      fromRef.current = target
      return
    }

    fromRef.current = shown
    const start = performance.now()
    cancelAnimationFrame(rafRef.current)

    const tick = (now: number) => {
      const t = Math.min((now - start) / durationMs, 1)
      const eased = easeInOutCubic(t)
      const colors = fromRef.current.colors.map((from, i) =>
        lerpHex(from, target.colors[i] ?? from, eased)
      )
      const ground = lerpHex(fromRef.current.ground, target.ground, eased)
      setShown({ colors, ground, isDark: target.isDark })
      if (t < 1) rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)

    return () => cancelAnimationFrame(rafRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, durationMs])

  return shown
}

function paletteKey(p: AuroraPalette): string {
  return `${p.isDark ? 'd' : 'l'}|${p.colors.join(',')}|${p.ground}`
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

/**
 * Linearly interpolate two `#rrggbb` hex strings in sRGB. We deliberately
 * stay in sRGB here (not OKLCH) because the colors are bound for a WebGL
 * shader that mixes in linear-light sRGB anyway — interpolating in OKLCH
 * client-side then converting to sRGB would just round-trip noise.
 */
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

/** Append an alpha to a `#rrggbb` hex without pulling in a color lib. */
function withAlpha(hex: string, alpha: number): string {
  const a = Math.max(0, Math.min(1, alpha))
  const aHex = Math.round(a * 255)
    .toString(16)
    .padStart(2, '0')
  return `${hex}${aHex}`
}
