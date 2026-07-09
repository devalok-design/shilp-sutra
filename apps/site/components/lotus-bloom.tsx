'use client'

import * as React from 'react'

import { useAuroraPalette } from '@devalok/shilp-sutra-brand/aurora'

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

// Real lotus from above shows ~8 main outer petals + a few inner — when
// you pack more, the gaps between petals close and the flower stops
// reading as petals and starts reading as a wheel. We use 8 outer + 6
// inner here so the spacing between petals stays VISIBLE — the gap is
// where the eye sees "petals", not "sectors".
const OUTER_PETALS = 8
const INNER_PETALS = 6
const OUTER_PETAL_STAGGER_MS = 65
const INNER_PETAL_STAGGER_MS = 70
const INNER_RING_DELAY_MS = 380
// Sparse stamens — too many turn the centre into noise at small sizes.
const STAMEN_COUNT = 10

// Ovate petal — wider belly than a teardrop but NARROWER than a fan
// segment. The 32px-wide × 88px-tall belly leaves ~13° of clear space
// between adjacent outer petals (8 petals × 360°/8 = 45° per petal slot,
// with the petal subtending ~32° at midpoint). Visible gaps are what
// give the flower its silhouette.
const OUTER_PETAL_PATH =
  'M 0,0 C 18,-12 32,-40 22,-72 C 10,-88 -10,-88 -22,-72 C -32,-40 -18,-12 0,0 Z'
const INNER_PETAL_PATH =
  'M 0,0 C 12,-8 22,-26 15,-50 C 7,-60 -7,-60 -15,-50 C -22,-26 -12,-8 0,0 Z'

/**
 * Deterministic pseudo-random in [-1, 1] keyed by an integer seed. Used to
 * apply consistent-but-organic jitter to each petal — same flower always
 * gets the same petal variations across re-renders, but no two flowers
 * (different `flowerSeed`) jitter the same way.
 *
 * The trig-hash isn't cryptographic; it just needs to look random and stay
 * stable.
 */
function pseudoRandom(seed: number): number {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453
  return (x - Math.floor(x)) * 2 - 1
}

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
        /* Per-petal intro bloom. Anchored at the petal's base (0,0). The
           end-state honours --petal-scale and --petal-ty so each petal
           settles into its own jittered final pose. */
        [data-lotus-instance] .lotus-petal {
          transform-origin: 0 0;
          transform: rotate(var(--petal-rot)) translate(0, 0) scale(0.02);
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
          0%   { transform: rotate(var(--petal-rot)) translate(0, 0) scale(0.02); opacity: 0; }
          40%  { opacity: 1; }
          100% {
            transform:
              rotate(var(--petal-rot))
              translate(0, var(--petal-ty, 0px))
              scale(var(--petal-scale, 1));
            opacity: 1;
          }
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
            transform:
              rotate(var(--petal-rot, 0deg))
              translate(0, var(--petal-ty, 0px))
              scale(var(--petal-scale, 1)) !important;
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
              ...({
                '--halo-inset': `${-halo * 100}%`,
                '--lotus-halo-color': stops.halo,
                '--halo-delay': `${delay}ms`,
                '--motion-phase': motionPhase,
              } as React.CSSProperties),
            }}
          />
        )}

        {/* Flower wrapper — continuous spin/float/breathe ride here. */}
        <div
          className="lotus-flower"
          style={{
            ...({
              '--lotus-rot': `${rotation}deg`,
              '--motion-phase': motionPhase,
            } as React.CSSProperties),
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
              {/* Petal gradients — base-light → tip-deep per ring. Inner
                  rings carry slightly lighter base / saturated tip so the
                  three layers read as distinct stages of petal growth. */}
              <linearGradient id={`lp-outer-${id}`} x1="0" y1="1" x2="0" y2="0">
                <stop offset="0"    stopColor={stops.base} stopOpacity="0.95" />
                <stop offset="0.35" stopColor={stops.mid}  stopOpacity="0.92" />
                <stop offset="0.78" stopColor={stops.tip}  stopOpacity="0.92" />
                <stop offset="1"    stopColor={stops.edge} stopOpacity="0.88" />
              </linearGradient>
              <linearGradient id={`lp-inner-${id}`} x1="0" y1="1" x2="0" y2="0">
                <stop offset="0"   stopColor={stops.base} stopOpacity="1" />
                <stop offset="0.5" stopColor={stops.mid}  stopOpacity="0.97" />
                <stop offset="1"   stopColor={stops.edge} stopOpacity="0.95" />
              </linearGradient>
              {/* Receptacle — obconical, brand-deepest at the centre fading
                  to edge tone. */}
              <radialGradient id={`lp-core-${id}`} cx="0.5" cy="0.5" r="0.5">
                <stop offset="0"    stopColor={stops.deep} stopOpacity="0.9" />
                <stop offset="0.55" stopColor={stops.edge} stopOpacity="0.65" />
                <stop offset="1"    stopColor={stops.edge} stopOpacity="0" />
              </radialGradient>

              {/* ── Devalok grain filter ─────────────────────────────────
                  feTurbulence (fractalNoise) generates the same paper-grain
                  noise used in the DevalokGrain component on Buttons etc.
                  It's clipped to the petal silhouette and multiplied onto
                  the petal fill so the texture sits *in* the colour, not
                  over it. baseFrequency 0.85 + numOctaves 2 gives a tight
                  paper-like grain (matches grain.md tuning for solid
                  surfaces). Single filter applied to a group wrapping all
                  petals — one pass, not 32. */}
              <filter
                id={`lp-grain-${id}`}
                x="-2%"
                y="-2%"
                width="104%"
                height="104%"
              >
                <feTurbulence
                  type="fractalNoise"
                  baseFrequency="0.85"
                  numOctaves="2"
                  seed="3"
                  stitchTiles="stitch"
                  result="noise"
                />
                <feColorMatrix
                  in="noise"
                  type="matrix"
                  values="0 0 0 0 0
                          0 0 0 0 0
                          0 0 0 0 0
                          0 0 0 0.22 0"
                  result="grain"
                />
                <feComposite
                  in="grain"
                  in2="SourceGraphic"
                  operator="in"
                  result="clipped"
                />
                <feBlend
                  mode="multiply"
                  in="SourceGraphic"
                  in2="clipped"
                />
              </filter>
            </defs>

            {/* All petals + stamens + core wrapped in a single <g> with
                the Devalok grain filter — one filter pass per flower. */}
            <g filter={`url(#lp-grain-${id})`}>
              {/*
                Petals carry SEEDED JITTER per instance so no two petals
                are identical. We vary three things on each petal:

                  - rotation     (±4° around its angular slot)
                  - scale        (±10 % of nominal size)
                  - tip distance (±3 px translation along the petal axis,
                                  i.e. how far "out" the petal reaches)

                The jitter is keyed by (delay + petalIndex) so each flower
                gets its own personality but every render of the same
                flower jitters identically. This is what stops the field
                reading as a wheel-of-perfect-petals and gives it the
                slightly-off, hand-arranged feel of a real bloom.
              */}

              {/* Outer ring — 8 broad petals, opens first */}
              {Array.from({ length: OUTER_PETALS }).map((_, i) => {
                const baseRot = (360 / OUTER_PETALS) * i
                const rotJitter = pseudoRandom(delay + i) * 4
                const scaleJitter = 1 + pseudoRandom(delay + i + 101) * 0.1
                const tyJitter = pseudoRandom(delay + i + 211) * 3
                return (
                  <path
                    key={`outer-${i}`}
                    className="lotus-petal"
                    d={OUTER_PETAL_PATH}
                    fill={`url(#lp-outer-${id})`}
                    style={{
                      ...({
                        '--petal-rot': `${baseRot + rotJitter}deg`,
                        '--petal-scale': scaleJitter.toFixed(3),
                        '--petal-ty': `${tyJitter.toFixed(2)}px`,
                        '--petal-delay': `${delay + i * OUTER_PETAL_STAGGER_MS}ms`,
                      } as React.CSSProperties),
                    }}
                  />
                )
              })}

              {/* Inner ring — 6 smaller petals, base-rotated 30° (half a
                  60° slot) so they nest in the gaps between outer petals. */}
              {Array.from({ length: INNER_PETALS }).map((_, i) => {
                const baseRot = (360 / INNER_PETALS) * i + 30
                const rotJitter = pseudoRandom(delay + i + 301) * 5
                const scaleJitter = 1 + pseudoRandom(delay + i + 401) * 0.12
                const tyJitter = pseudoRandom(delay + i + 511) * 2
                const localDelay =
                  delay + INNER_RING_DELAY_MS + i * INNER_PETAL_STAGGER_MS
                return (
                  <path
                    key={`inner-${i}`}
                    className="lotus-petal"
                    d={INNER_PETAL_PATH}
                    fill={`url(#lp-inner-${id})`}
                    style={{
                      ...({
                        '--petal-rot': `${baseRot + rotJitter}deg`,
                        '--petal-scale': scaleJitter.toFixed(3),
                        '--petal-ty': `${tyJitter.toFixed(2)}px`,
                        '--petal-delay': `${localDelay}ms`,
                      } as React.CSSProperties),
                    }}
                  />
                )
              })}

              {/* Receptacle — small brand-deep disc, just enough to anchor
                  the eye between the inner petals. */}
              <circle
                className="lotus-core"
                cx="0"
                cy="0"
                r="12"
                fill={`url(#lp-core-${id})`}
                style={{
                  ...({
                    '--core-delay': `${delay + INNER_RING_DELAY_MS + INNER_PETALS * INNER_PETAL_STAGGER_MS + 100}ms`,
                  } as React.CSSProperties),
                }}
              />

              {/* Stamen filaments — short lines + tiny anther dots
                  radiating from the receptacle edge. Real lotus has
                  100-400; 10 reads as density without becoming noise.
                  Each stamen carries its own jitter so they don't read
                  as a clock-face. Painted in the brand's deepest accent
                  (no botanical yellow). */}
              {Array.from({ length: STAMEN_COUNT }).map((_, i) => {
                const baseRot = (360 / STAMEN_COUNT) * i
                const rotJitter = pseudoRandom(delay + i + 601) * 7
                const lenJitter = pseudoRandom(delay + i + 701) * 4
                const localDelay =
                  delay +
                  INNER_RING_DELAY_MS +
                  INNER_PETALS * INNER_PETAL_STAGGER_MS +
                  200 +
                  i * 25
                return (
                  <g
                    key={`stamen-${i}`}
                    className="lotus-petal"
                    style={{
                      ...({
                        '--petal-rot': `${baseRot + rotJitter}deg`,
                        '--petal-scale': 1,
                        '--petal-ty': '0px',
                        '--petal-delay': `${localDelay}ms`,
                      } as React.CSSProperties),
                    }}
                  >
                    <line
                      x1="0"
                      y1="-11"
                      x2="0"
                      y2={`${-22 + lenJitter}`}
                      stroke={stops.deep}
                      strokeWidth="1.2"
                      strokeLinecap="round"
                      opacity="0.7"
                    />
                    <circle
                      cx="0"
                      cy={`${-23 + lenJitter}`}
                      r="1.5"
                      fill={stops.edge}
                      opacity="0.85"
                    />
                  </g>
                )
              })}
            </g>
          </svg>
        </div>
      </div>
    </>
  )
}
