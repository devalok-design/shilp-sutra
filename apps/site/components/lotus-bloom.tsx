'use client'

import * as React from 'react'

import { useAuroraPalette } from '@/lib/aurora-palette'

/**
 * LotusBloom — one SVG lotus flower with petals, a brand-coloured halo,
 * and continuous gentle motion.
 *
 * ⚠ INTERNAL — Devalok use only.
 *
 * Anatomy
 * -------
 *  - Outer ring: 8 petals, radiating from the centre at 45° intervals.
 *  - Inner ring: 6 petals (offset 30°), shorter + narrower.
 *  - Receptacle: a single brand-tinted circle at the very centre.
 *  - Halo: a CSS radial-gradient backdrop behind the SVG, blurred and
 *    pulsing — gives the flower a "lit-from-within" feel without
 *    adding another WebGL context.
 *
 * Each petal carries a linearGradient pulled live from `--color-accent-*`
 * (via useAuroraPalette). Base-light → tip-deep gradient — the natural
 * lotus colour from below to above.
 *
 * Motion (all simultaneous, composed via CSS individual transforms)
 * ----------------------------------------------------------------
 *  - Per-petal bloom intro: scale 0 → 1 at each petal's base, with a
 *    cubic-bezier(0.34, 1.35, 0.5, 1) overshoot. Outer ring opens
 *    first; inner ring + receptacle cascade in.
 *  - Continuous spin: whole flower rotates 360° over 60 s (the `rotate`
 *    property).
 *  - Continuous float: whole flower drifts in a soft loop ±8 px over
 *    14 s (the `translate` property).
 *  - Continuous breathe: whole flower scales ±4 % over 7 s (the `scale`
 *    property).
 *  - Halo pulse: backdrop glow shifts opacity + scale ±10 % over 6 s,
 *    independently of the flower (it's a pseudo-element with its own
 *    keyframe).
 *
 * All three continuous animations are phase-shifted per instance via
 * `--motion-phase` (0-1, derived from the bloom delay) so a field of
 * lotuses doesn't move in lockstep — each is at a different point in
 * its own cycle.
 *
 * Brand reactivity: stop colours + halo colour both update when
 * useAuroraPalette resolves a new ramp; no re-bloom, just a repaint.
 *
 * `prefers-reduced-motion` freezes everything at the fully-open frame.
 */

export interface LotusBloomProps {
  /** Square diameter in pixels. Default 240. */
  size?: number
  /** Bloom intro delay in ms. Also drives motion-phase. Default 0. */
  delay?: number
  /** Base rotation in degrees. Composes with the continuous spin. Default 0. */
  rotation?: number
  /** Overall opacity (0-1). Lower for distant / depth blooms. Default 1. */
  opacity?: number
  /**
   * Halo size as a fraction of the SVG. 0.4 = halo extends 40 % beyond
   * the flower's edge. Set to 0 to disable the halo. Default 0.35.
   */
  halo?: number
  className?: string
  style?: React.CSSProperties
}

const OUTER_PETALS = 8
const INNER_PETALS = 6
const OUTER_PETAL_STAGGER_MS = 70
const INNER_PETAL_STAGGER_MS = 70
const INNER_RING_DELAY_MS = 350

// Almond / teardrop petal pointing UP (negative Y). Base at (0, 0),
// tip at (0, -92). Bezier control points give a soft, slightly-pointed
// petal silhouette — closer to a real lotus than a perfect ellipse.
const OUTER_PETAL_PATH =
  'M 0,0 C 12,-18 22,-55 0,-92 C -22,-55 -12,-18 0,0 Z'
const INNER_PETAL_PATH =
  'M 0,0 C 9,-12 14,-38 0,-62 C -14,-38 -9,-12 0,0 Z'

export function LotusBloom({
  size = 240,
  delay = 0,
  rotation = 0,
  opacity = 1,
  halo = 0.35,
  className,
  style,
}: LotusBloomProps) {
  const palette = useAuroraPalette()
  const id = React.useId().replace(/:/g, '')

  // Pick stop colours that read against the current page background.
  // - Light theme: light → mid → deep within the brand ramp.
  // - Dark theme:  mid-bright → bright → light-bright so the tip is the
  //   lightest point, visible against the dark surface.
  const stops = React.useMemo(() => {
    const c = palette.colors
    if (palette.isDark) {
      return {
        base: c[3] ?? '#552233',
        mid:  c[2] ?? '#a23f6a',
        tip:  c[4] ?? '#f48cae',
        edge: c[3] ?? '#a23f6a',
        deep: c[2] ?? '#552233',
        halo: c[2] ?? '#a23f6a', // brand anchor for the halo glow
      }
    }
    return {
      base: c[0] ?? '#ffffff',
      mid:  c[1] ?? '#fde2ed',
      tip:  c[2] ?? '#f48cae',
      edge: c[3] ?? '#a23f6a',
      deep: c[4] ?? '#5b2342',
      halo: c[2] ?? '#f48cae',
    }
  }, [palette])

  // Phase-shift continuous animations per instance so 11 lotuses don't
  // spin/float/breathe in lockstep. Derived from the bloom delay so it's
  // deterministic and stable across re-renders.
  const motionPhase = ((delay % 1000) / 1000).toFixed(3)

  return (
    <>
      <style>{`
        /* Per-petal intro bloom (scale from base, overshoot, then settle). */
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

        /* Whole-flower continuous motion. Each animation drives a DIFFERENT
           individual transform property (rotate / translate / scale) so they
           compose without overwriting each other. The CSS shorthand
           "animation" with comma-separated entries lets us run all three
           continuously and phase-shift them per instance. */
        [data-lotus-instance] .lotus-flower {
          rotate: var(--lotus-rot, 0deg);
          translate: 0 0;
          scale: 1;
          animation:
            shilp-lotus-spin     60s linear              infinite,
            shilp-lotus-float    14s ease-in-out         infinite,
            shilp-lotus-breathe  7s  ease-in-out         infinite;
          animation-delay:
            calc(var(--motion-phase, 0) * -60s),
            calc(var(--motion-phase, 0) * -14s),
            calc(var(--motion-phase, 0) * -7s);
        }

        /* Brand-tinted halo glow under the flower. Pulses + scales on its
           own timeline so it feels independent of the flower's spin. */
        [data-lotus-instance] .lotus-halo {
          position: absolute;
          inset: calc(var(--halo-inset, -25%));
          border-radius: 50%;
          background: radial-gradient(
            circle,
            color-mix(in oklch, var(--lotus-halo-color, currentColor) 45%, transparent) 0%,
            color-mix(in oklch, var(--lotus-halo-color, currentColor) 22%, transparent) 35%,
            transparent 72%
          );
          filter: blur(22px);
          z-index: -1;
          opacity: 0;
          animation: shilp-lotus-halo-pulse 6s ease-in-out infinite,
                     shilp-lotus-halo-appear 1200ms var(--halo-delay, 0ms) ease-out forwards;
          animation-delay:
            calc(var(--motion-phase, 0) * -6s),
            var(--halo-delay, 0ms);
        }

        @keyframes shilp-lotus-petal-bloom {
          0%   { transform: rotate(var(--petal-rot)) scale(0.02); opacity: 0; }
          40%  { opacity: 1; }
          100% { transform: rotate(var(--petal-rot)) scale(1);    opacity: 1; }
        }
        @keyframes shilp-lotus-core-bloom {
          0%   { transform: scale(0); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes shilp-lotus-spin {
          to { rotate: calc(var(--lotus-rot, 0deg) + 360deg); }
        }
        @keyframes shilp-lotus-float {
          0%, 100% { translate: 0 0; }
          25%      { translate: 7px -5px; }
          50%      { translate: -3px -9px; }
          75%      { translate: -7px 4px; }
        }
        @keyframes shilp-lotus-breathe {
          0%, 100% { scale: 1; }
          50%      { scale: 1.04; }
        }
        @keyframes shilp-lotus-halo-pulse {
          0%, 100% { transform: scale(0.95); }
          50%      { transform: scale(1.1); }
        }
        @keyframes shilp-lotus-halo-appear {
          from { opacity: 0; }
          to   { opacity: 0.85; }
        }

        @media (prefers-reduced-motion: reduce) {
          [data-lotus-instance] .lotus-petal,
          [data-lotus-instance] .lotus-core,
          [data-lotus-instance] .lotus-flower,
          [data-lotus-instance] .lotus-halo {
            animation: none !important;
            transform: rotate(var(--petal-rot, 0deg)) scale(1) !important;
            rotate: var(--lotus-rot, 0deg) !important;
            translate: 0 0 !important;
            scale: 1 !important;
            opacity: 1 !important;
          }
        }
      `}</style>

      <div
        aria-hidden="true"
        data-lotus-instance={id}
        className={'pointer-events-none relative ' + (className ?? '')}
        style={{
          width: size,
          height: size,
          opacity,
          ...style,
        }}
      >
        {/* Halo backdrop — sits behind the flower at z-index -1. CSS sets
            its inset, radial-gradient colour, and pulse keyframe. */}
        {halo > 0 && (
          <div
            className="lotus-halo"
            style={{
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              ...({
                '--halo-inset': `${-halo * 100}%`,
                '--lotus-halo-color': stops.halo,
                '--halo-delay': `${delay}ms`,
                '--motion-phase': motionPhase,
              } as any),
            }}
          />
        )}

        {/* Flower wrapper — continuous spin/float/breathe ride here. */}
        <div
          className="lotus-flower"
          style={{
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ...({
              '--lotus-rot': `${rotation}deg`,
              '--motion-phase': motionPhase,
            } as any),
            width: '100%',
            height: '100%',
          }}
        >
          <svg
            viewBox="-100 -100 200 200"
            width="100%"
            height="100%"
            style={{ display: 'block', overflow: 'visible' }}
          >
            <defs>
              <linearGradient id={`lp-outer-${id}`} x1="0" y1="1" x2="0" y2="0">
                <stop offset="0"    stopColor={stops.base} stopOpacity="0.95" />
                <stop offset="0.35" stopColor={stops.mid}  stopOpacity="0.92" />
                <stop offset="0.78" stopColor={stops.tip}  stopOpacity="0.9" />
                <stop offset="1"    stopColor={stops.edge} stopOpacity="0.85" />
              </linearGradient>
              <linearGradient id={`lp-inner-${id}`} x1="0" y1="1" x2="0" y2="0">
                <stop offset="0"   stopColor={stops.base} stopOpacity="1" />
                <stop offset="0.5" stopColor={stops.mid}  stopOpacity="0.95" />
                <stop offset="1"   stopColor={stops.tip}  stopOpacity="0.95" />
              </linearGradient>
              <radialGradient id={`lp-core-${id}`} cx="0.5" cy="0.5" r="0.5">
                <stop offset="0"   stopColor={stops.deep} stopOpacity="0.75" />
                <stop offset="0.6" stopColor={stops.edge} stopOpacity="0.4" />
                <stop offset="1"   stopColor={stops.edge} stopOpacity="0" />
              </radialGradient>
            </defs>

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
            {Array.from({ length: INNER_PETALS }).map((_, i) => {
              const rot = (360 / INNER_PETALS) * i + 30
              const localDelay =
                delay + INNER_RING_DELAY_MS + i * INNER_PETAL_STAGGER_MS
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
      </div>
    </>
  )
}
