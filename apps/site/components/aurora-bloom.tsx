'use client'

import { MeshGradient } from '@paper-design/shaders-react'
import { useReducedMotion } from 'framer-motion'
import * as React from 'react'

import { readAuroraPalette, type AuroraPalette } from '@/lib/aurora-palette'

/**
 * AuroraBloom — theme-reactive aurora curtain anchored at the top of the page.
 *
 * Composition (back-to-front):
 *   1. MeshGradient (Paper Shaders, WebGL) — 5 organic color spots that drift
 *      and distort. Stops come from the live brand ramp + the page surface
 *      color, so the curtain blends into the page edges instead of clipping.
 *      Built-in grain mixer + overlay match the Devalok grain DNA.
 *   2. CSS mask-image — fades the curtain to fully transparent at the bottom
 *      and at the sides, locking visual focus to the hero copy.
 *   3. DevalokGrain (added by parent, optional) — the same SVG turbulence the
 *      rest of the system uses; tightens the visual rhyme with buttons/cards.
 *
 * Reactivity:
 *   - `data-brand` on <html> changes  → palette re-read, colors swap.
 *   - `.dark` class toggle on <html>  → palette re-read (different ramp).
 *   - `prefers-reduced-motion`        → speed=0, shader stops the RAF loop.
 *   - Tab hidden                      → shader auto-pauses (handled inside
 *                                       Paper's ShaderMount).
 */

const FALLBACK_PALETTE: AuroraPalette = {
  colors: ['#fafafa', '#fce8ef', '#e58fb0', '#a23f6a', '#c66b8e'],
  ground: '#fafafa',
  isDark: false,
}

interface AuroraBloomProps {
  /** Override the resolved palette (for stories / debugging). */
  palette?: AuroraPalette
  /** Animation speed multiplier. 0 = static. Default 0.35 (slow drift, ~90s loop feel). */
  speed?: number
  className?: string
}

export function AuroraBloom({
  palette: paletteOverride,
  speed = 0.35,
  className,
}: AuroraBloomProps) {
  const prefersReducedMotion = useReducedMotion()
  const [palette, setPalette] = React.useState<AuroraPalette>(
    () => paletteOverride ?? FALLBACK_PALETTE
  )

  // Resolve the real palette once mounted (skips the SSR mismatch path).
  React.useEffect(() => {
    if (paletteOverride) {
      setPalette(paletteOverride)
      return
    }
    setPalette(readAuroraPalette())
  }, [paletteOverride])

  // Re-read on brand or theme change.
  React.useEffect(() => {
    if (paletteOverride) return
    if (typeof window === 'undefined') return

    let pending = 0
    const schedule = () => {
      window.clearTimeout(pending)
      pending = window.setTimeout(() => {
        setPalette(readAuroraPalette())
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

  return (
    <div
      aria-hidden="true"
      className={
        'pointer-events-none absolute inset-0 -z-10 overflow-hidden ' + (className ?? '')
      }
      style={{
        // Lock aurora to the top zone. Soft fade to transparent so the rest of
        // the page reads as `surface-base` and the curtain doesn't clip hard.
        maskImage:
          'radial-gradient(120% 90% at 50% 0%, black 35%, rgba(0,0,0,0.85) 55%, transparent 95%)',
        WebkitMaskImage:
          'radial-gradient(120% 90% at 50% 0%, black 35%, rgba(0,0,0,0.85) 55%, transparent 95%)',
      }}
    >
      <MeshGradient
        // 5 stops: ground + brand-light + brand-core + brand-deep + brand-mid.
        // Order matters — MeshGradient treats stops as orbiting spots, so the
        // mid-list color tends to occupy the visual centre of the bloom.
        colors={palette.colors}
        distortion={0.85}
        swirl={0.55}
        grainMixer={0.25}
        grainOverlay={0.18}
        speed={effectiveSpeed}
        scale={1.15}
        rotation={0}
        offsetY={-0.15}
        style={{ width: '100%', height: '100%' }}
      />
      {/* Soft inner vignette — pulls the eye into the centre of the bloom. */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(60% 50% at 50% 30%, transparent 0%, ${withAlpha(palette.ground, 0.45)} 100%)`,
        }}
      />
      {/* Bottom-edge wash — guarantees a clean seam into the page background. */}
      <div
        className="absolute inset-x-0 bottom-0 h-1/3"
        style={{
          background: `linear-gradient(to bottom, transparent 0%, ${palette.ground} 100%)`,
        }}
      />
    </div>
  )
}

/** Append an alpha to a `#rrggbb` hex without pulling in a color lib. */
function withAlpha(hex: string, alpha: number): string {
  const a = Math.max(0, Math.min(1, alpha))
  const aHex = Math.round(a * 255)
    .toString(16)
    .padStart(2, '0')
  return `${hex}${aHex}`
}
