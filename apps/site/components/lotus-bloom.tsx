'use client'

import { MeshGradient } from '@paper-design/shaders-react'
import { useReducedMotion } from 'framer-motion'
import * as React from 'react'

import { useAuroraPalette } from '@/lib/aurora-palette'

/**
 * LotusBloom — single Devalok-coloured lotus bloom, positioned anywhere on its
 * parent container.
 *
 * ⚠ INTERNAL — Devalok use only. Sibling to AuroraBloom; same WebGL mesh
 * primitives, different choreography. AuroraBloom drifts continuously;
 * LotusBloom *opens once*, then breathes gently in place.
 *
 * Composition
 * -----------
 * A single Paper Shaders MeshGradient masked to a circle. The colour ramp
 * follows the natural lotus gradient — white at the centre, brand-pink at
 * the edge — pulled live from `--color-accent-1..11`. No greens or yellows;
 * this is the lotus *as colour*, not the lotus as botany.
 *
 * Motion
 * ------
 *  1. Intro: mask radius grows 8 % → 100 %, opacity 0 → 1, scale 0.55 → 1
 *     over `introMs` (default 3 200 ms) with an easeOutCubic curve.
 *  2. Breathe: once open, mask radius + scale gently oscillate ±2 % at the
 *     `breatheHz` rate (default 0.12 Hz ≈ 8 s/cycle) so the bloom feels
 *     alive instead of frozen.
 *  3. Reduced-motion: locks at the fully-open frame; no intro, no breathe.
 *
 * Place several of these inside a `relative isolate overflow-hidden`
 * container at different `x` / `y` / `size` / `delay` values to compose a
 * field of lotuses — see `<LotusShowcase>` for the canonical arrangement.
 */

export interface LotusBloomProps {
  /** Horizontal centre of the bloom, normalised to the parent's width (0-1). Default 0.5. */
  x?: number
  /** Vertical centre of the bloom, normalised to the parent's height (0-1). Default 0.5. */
  y?: number
  /**
   * Diameter of the bloom, normalised to the parent's *smaller* dimension
   * (0-1). 0.4 ≈ a medium lotus that fills ~40 % of the shorter side.
   * Default 0.5.
   */
  size?: number
  /** Intro delay in milliseconds. Stagger multiple lotuses with this. Default 0. */
  delay?: number
  /** Duration of the opening animation in milliseconds. Default 3 200. */
  introMs?: number
  /**
   * Rotation in degrees applied to the underlying mesh. Use to vary the
   * appearance of multiple lotuses on the same screen so they don't look
   * cloned. Default 0.
   */
  rotation?: number
  /** Override the natural Devalok ramp with an explicit 5-stop palette. */
  palette?: string[]
  className?: string
}

export function LotusBloom({
  x = 0.5,
  y = 0.5,
  size = 0.5,
  delay = 0,
  introMs = 3200,
  rotation = 0,
  palette,
  className,
}: LotusBloomProps) {
  const prefersReducedMotion = useReducedMotion()
  const brandPalette = useAuroraPalette()

  // Natural lotus ramp: white centre → pink → deep edge. Picked from the
  // live brand ramp so this stays brand-reactive (pink → indigo → sage)
  // without losing the white-centred gradient that reads as "lotus".
  const lotusRamp = React.useMemo<string[]>(() => {
    if (palette && palette.length >= 5) return palette.slice(0, 5)
    // The live brand-resolved palette already gives us 5 ordered stops;
    // re-arrange them so the lightest sits in the centre of the mesh and
    // the deepest at the perimeter.
    const c = brandPalette.colors
    if (brandPalette.isDark) {
      // Dark theme: shift indices up — the "light" stop is still light
      // *relative to the page*, but the page is dark, so it reads as a
      // soft glow rather than pure white.
      return [c[2] ?? c[0], c[0], c[3] ?? c[0], c[1], c[4] ?? c[3] ?? c[0]]
    }
    // Light theme: classic natural lotus order.
    return [c[0], c[1], c[2], c[3], c[4]]
  }, [palette, brandPalette])

  // ── Intro + breathe clock ─────────────────────────────────────────
  // `progress` runs 0 → 1 during the intro. Once at 1 it stays there and a
  // separate sine-driven `breathe` ±1 oscillates in place.
  const [progress, setProgress] = React.useState(prefersReducedMotion ? 1 : 0)
  const [breathe, setBreathe] = React.useState(0)
  const rafRef = React.useRef(0)
  const startRef = React.useRef<number | null>(null)

  React.useEffect(() => {
    if (prefersReducedMotion) {
      setProgress(1)
      setBreathe(0)
      return
    }

    let cancelled = false
    startRef.current = null

    const tick = (now: number) => {
      if (cancelled) return
      if (startRef.current === null) startRef.current = now
      const t = now - startRef.current - delay
      if (t < 0) {
        rafRef.current = requestAnimationFrame(tick)
        return
      }
      const introT = Math.min(t / introMs, 1)
      setProgress(easeOutCubic(introT))
      // Breathe runs continuously, even during intro — the bloom is alive
      // from the first frame.
      const breathePhase = ((t / 1000) * 0.12 * Math.PI * 2) % (Math.PI * 2)
      setBreathe(Math.sin(breathePhase))
      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => {
      cancelled = true
      cancelAnimationFrame(rafRef.current)
    }
  }, [delay, introMs, prefersReducedMotion])

  // ── Geometry ──────────────────────────────────────────────────────
  // Position + size are normalised; converted to CSS via a square wrapper
  // anchored at (x, y). Using the smaller dimension keeps the bloom round
  // regardless of container aspect ratio.
  const sizePct = size * 100
  const xPct = x * 100
  const yPct = y * 100

  // Mask radius: 8 → 100 during intro, then ±1.5 % breath oscillation.
  const maskRadius = 8 + 92 * progress + (progress >= 1 ? breathe * 1.5 : 0)
  // Outer scale: 0.55 → 1.0 during intro, then ±0.015 breath.
  const wrapperScale = 0.55 + 0.45 * progress + (progress >= 1 ? breathe * 0.015 : 0)
  // Opacity ramps over the first 60 % of the intro so the bloom appears
  // *from* the centre rather than fading in across its full footprint.
  const opacity = Math.min(progress / 0.6, 1)

  return (
    <div
      aria-hidden="true"
      data-lotus-bloom=""
      className={'pointer-events-none absolute ' + (className ?? '')}
      style={{
        // The wrapper is a square positioned by its centre. `min(W, H)`
        // would be ideal but CSS can't do that on percentage units — we
        // approximate by setting width AND height to the same vmin-ish
        // value using aspect-ratio:1.
        left: `${xPct}%`,
        top: `${yPct}%`,
        width: `${sizePct}%`,
        aspectRatio: '1 / 1',
        transform: `translate(-50%, -50%) scale(${wrapperScale.toFixed(4)})`,
        transformOrigin: 'center',
        opacity,
        transition: prefersReducedMotion ? undefined : 'opacity 200ms linear',
      }}
    >
      <div
        className="absolute inset-0 overflow-hidden"
        style={{
          // Soft radial mask — black core, gentle alpha falloff, transparent
          // edge. The wide feather is what gives the bloom its "flower in
          // soft focus" feel rather than reading as a hard disc.
          maskImage: `radial-gradient(${maskRadius}% ${maskRadius}% at 50% 50%, black 0%, rgba(0,0,0,0.75) 45%, rgba(0,0,0,0.25) 75%, transparent 100%)`,
          WebkitMaskImage: `radial-gradient(${maskRadius}% ${maskRadius}% at 50% 50%, black 0%, rgba(0,0,0,0.75) 45%, rgba(0,0,0,0.25) 75%, transparent 100%)`,
          mixBlendMode: brandPalette.isDark ? 'screen' : 'multiply',
        }}
      >
        <MeshGradient
          colors={lotusRamp}
          // Higher distortion + lower swirl gives a tighter, flower-like
          // shape rather than the wide aurora drift.
          distortion={0.7}
          swirl={0.35}
          // Grain stays subtle — the lotus is a soft thing.
          grainMixer={0.18}
          grainOverlay={0.12}
          // Slow, almost imperceptible motion — bloomed lotuses are still.
          speed={0.18}
          scale={1.1}
          rotation={rotation}
          style={{ width: '100%', height: '100%' }}
        />
      </div>
    </div>
  )
}

function easeOutCubic(t: number): number {
  const u = 1 - Math.max(0, Math.min(1, t))
  return 1 - u * u * u
}
