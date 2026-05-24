'use client'

import * as React from 'react'

import { useAuroraPalette } from '@/lib/aurora-palette'

/**
 * LotusBloom — one SVG lotus flower with explicit petals.
 *
 * ⚠ INTERNAL — Devalok use only.
 *
 * Why SVG petals instead of a masked WebGL mesh:
 * The masked-mesh approach reads as a glowing orb, not as a flower. A real
 * lotus is recognisable by its *petals* — 8 outer, 6 inner, almond-shaped,
 * radiating from a central receptacle, each with a base-light → tip-deep
 * gradient. We model that literally here:
 *
 *   1. Two concentric rings of petals (8 outer · 6 inner, offset by 30°)
 *      built from a single teardrop SVG path rotated around the centre.
 *   2. Each petal carries a linearGradient that runs from a near-white at
 *      its base to the brand's accent-9 at its tip — the gradient the
 *      flower actually shows in nature.
 *   3. Bloom is per-petal: each petal scales 0 → 1 with a slight
 *      easeOutBack overshoot, anchored at its base. Outer ring opens
 *      first; inner ring cascades in 350 ms later. Each petal within a
 *      ring fires 70 ms after the previous, sweeping radially around the
 *      flower so the bloom feels like an opening, not a collective expand.
 *   4. Once open, the whole flower gently breathes (±2.5 % scale, 7 s).
 *
 * Brand reactivity: stop colours plug in live hex from `useAuroraPalette`
 * — switch brand from the header and the flower repaints without
 * re-blooming.
 */

export interface LotusBloomProps {
  /**
   * Diameter in pixels. The flower is a square SVG; this is the width AND
   * the height. Default 240.
   */
  size?: number
  /** Bloom intro delay in milliseconds. Stagger multiple lotuses. Default 0. */
  delay?: number
  /**
   * Base rotation in degrees applied to the whole flower. Use to vary
   * the appearance of multiple lotuses on the same screen. Default 0.
   */
  rotation?: number
  /**
   * Overall opacity of the flower (0-1). Use values < 1 for distant /
   * background lotuses to suggest depth. Default 1.
   */
  opacity?: number
  className?: string
  style?: React.CSSProperties
}

const OUTER_PETALS = 8
const INNER_PETALS = 6
const OUTER_PETAL_STAGGER_MS = 70
const INNER_PETAL_STAGGER_MS = 70
const INNER_RING_DELAY_MS = 350

// Almond / teardrop petal pointing UP (negative Y in SVG). Base at (0, 0),
// tip at (0, -90). Bezier control points give a soft, slightly-pointed
// petal silhouette — closer to a real lotus than a perfect ellipse.
const OUTER_PETAL_PATH =
  'M 0,0 C 12,-18 22,-55 0,-92 C -22,-55 -12,-18 0,0 Z'
// Inner petals are shorter + narrower, offset 30° from outer.
const INNER_PETAL_PATH =
  'M 0,0 C 9,-12 14,-38 0,-62 C -14,-38 -9,-12 0,0 Z'

export function LotusBloom({
  size = 240,
  delay = 0,
  rotation = 0,
  opacity = 1,
  className,
  style,
}: LotusBloomProps) {
  const palette = useAuroraPalette()
  const id = React.useId().replace(/:/g, '')

  // Pick stop colours that read against the current page background.
  // - Light theme: light → mid → deep within the brand ramp.
  // - Dark theme:  mid-bright → bright → light-bright (so the petal
  //   tip is the LIGHTEST point, visible against a dark surface).
  const stops = React.useMemo(() => {
    const c = palette.colors
    if (palette.isDark) {
      return {
        base:  c[3] ?? '#552233',  // mid-deep
        mid:   c[2] ?? '#a23f6a',  // brand anchor (accent-9 in dark)
        tip:   c[4] ?? '#f48cae',  // brightest pink in dark mode
        edge:  c[3] ?? '#a23f6a',
        deep:  c[2] ?? '#552233',
      }
    }
    return {
      base:  c[0] ?? '#ffffff',  // near-white centre
      mid:   c[1] ?? '#fde2ed',  // pale pink
      tip:   c[2] ?? '#f48cae',  // saturated pink
      edge:  c[3] ?? '#a23f6a',  // deep pink at petal tip
      deep:  c[4] ?? '#5b2342',  // deepest pink for receptacle
    }
  }, [palette])

  return (
    <>
      {/* Keyframes scoped per-instance via [data-lotus-instance].
          Single style block — re-mounting many lotuses doesn't bloat the
          DOM with duplicate <style> elements. */}
      <style>{`
        [data-lotus-instance] .lotus-petal {
          transform-origin: 0 0;
          transform: rotate(var(--petal-rot)) scale(0.02);
          animation: shilp-lotus-petal-bloom 1200ms var(--petal-delay, 0ms) cubic-bezier(0.34, 1.35, 0.5, 1) forwards;
        }
        [data-lotus-instance] .lotus-core {
          transform-origin: 0 0;
          transform: scale(0);
          animation: shilp-lotus-core-bloom 600ms var(--core-delay, 0ms) cubic-bezier(0.5, 0, 0.5, 1.05) forwards;
        }
        [data-lotus-instance] {
          animation: shilp-lotus-breathe 7s ease-in-out infinite;
        }
        @keyframes shilp-lotus-petal-bloom {
          0%   { transform: rotate(var(--petal-rot)) scale(0.02); opacity: 0; }
          40%  { opacity: 1; }
          100% { transform: rotate(var(--petal-rot)) scale(1); opacity: 1; }
        }
        @keyframes shilp-lotus-core-bloom {
          0%   { transform: scale(0); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes shilp-lotus-breathe {
          0%, 100% { transform: rotate(var(--lotus-rot, 0deg)) scale(1); }
          50%      { transform: rotate(var(--lotus-rot, 0deg)) scale(1.025); }
        }
        @media (prefers-reduced-motion: reduce) {
          [data-lotus-instance] .lotus-petal,
          [data-lotus-instance] .lotus-core,
          [data-lotus-instance] {
            animation: none !important;
            transform: rotate(var(--petal-rot, 0deg)) scale(1) !important;
          }
        }
      `}</style>

      <div
        aria-hidden="true"
        data-lotus-instance={id}
        className={'pointer-events-none ' + (className ?? '')}
        style={{
          // Both the static base rotation AND the breathing keyframe
          // reference --lotus-rot, so they don't fight each other.
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ...({ '--lotus-rot': `${rotation}deg` } as any),
          width: size,
          height: size,
          opacity,
          ...style,
        }}
      >
        <svg
          viewBox="-100 -100 200 200"
          width={size}
          height={size}
          style={{ display: 'block', overflow: 'visible' }}
        >
          <defs>
            {/* Petal gradient — base at petal's bottom (y=1 in objectBoundingBox),
                tip at top (y=0). objectBoundingBox makes each petal carry its
                own gradient aligned to its own axis, regardless of rotation. */}
            <linearGradient
              id={`lp-outer-${id}`}
              x1="0"
              y1="1"
              x2="0"
              y2="0"
            >
              <stop offset="0" stopColor={stops.base} stopOpacity="0.95" />
              <stop offset="0.35" stopColor={stops.mid} stopOpacity="0.92" />
              <stop offset="0.78" stopColor={stops.tip} stopOpacity="0.9" />
              <stop offset="1" stopColor={stops.edge} stopOpacity="0.85" />
            </linearGradient>
            <linearGradient
              id={`lp-inner-${id}`}
              x1="0"
              y1="1"
              x2="0"
              y2="0"
            >
              <stop offset="0" stopColor={stops.base} stopOpacity="1" />
              <stop offset="0.5" stopColor={stops.mid} stopOpacity="0.95" />
              <stop offset="1" stopColor={stops.tip} stopOpacity="0.95" />
            </linearGradient>
            {/* Soft radial highlight at the very centre — suggests the
                receptacle, in the brand's deepest tone. */}
            <radialGradient id={`lp-core-${id}`} cx="0.5" cy="0.5" r="0.5">
              <stop offset="0" stopColor={stops.deep} stopOpacity="0.75" />
              <stop offset="0.6" stopColor={stops.edge} stopOpacity="0.4" />
              <stop offset="1" stopColor={stops.edge} stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Outer ring — 8 petals, opens first */}
          {Array.from({ length: OUTER_PETALS }).map((_, i) => {
            const rot = (360 / OUTER_PETALS) * i
            return (
              <path
                key={`outer-${i}`}
                className="lotus-petal"
                d={OUTER_PETAL_PATH}
                fill={`url(#lp-outer-${id})`}
                style={{
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  ...({
                    '--petal-rot': `${rot}deg`,
                    '--petal-delay': `${delay + i * OUTER_PETAL_STAGGER_MS}ms`,
                  } as any),
                }}
              />
            )
          })}

          {/* Inner ring — 6 petals, offset 30° from outer, cascades after */}
          {Array.from({ length: INNER_PETALS }).map((_, i) => {
            const rot = (360 / INNER_PETALS) * i + 30
            const localDelay =
              delay +
              INNER_RING_DELAY_MS +
              i * INNER_PETAL_STAGGER_MS
            return (
              <path
                key={`inner-${i}`}
                className="lotus-petal"
                d={INNER_PETAL_PATH}
                fill={`url(#lp-inner-${id})`}
                style={{
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  ...({
                    '--petal-rot': `${rot}deg`,
                    '--petal-delay': `${localDelay}ms`,
                  } as any),
                }}
              />
            )
          })}

          {/* Core — soft brand-tinted receptacle bloom, appears last. */}
          <circle
            className="lotus-core"
            cx="0"
            cy="0"
            r="14"
            fill={`url(#lp-core-${id})`}
            style={{
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              ...({
                '--core-delay': `${delay + INNER_RING_DELAY_MS + INNER_PETALS * INNER_PETAL_STAGGER_MS + 100}ms`,
              } as any),
            }}
          />
        </svg>
      </div>
    </>
  )
}
