'use client'

/**
 * BrahmaBackdrop — the shilp-sutra visual-identity hero background, ported 1:1
 * from Figma "Shilp-Sutra | Visual Identity" (file 1pfBbrI7Zf7Q7l47KLNdOj,
 * frame 83:696; deity silhouette from 56:19691). NOT a flat image: the
 * construction grid + concentric circles are live SVG, the floating specimens
 * are real DS components (Switch / Avatar) + exact-hex token swatches, and the
 * deity (Brahma) is a transparent teal vector silhouette.
 *
 * Paint order (back → front) matches the source: tinted zones → grid → circles
 * → Brahma → component specimens. (The geometry sits BEHIND the deity.)
 *
 * Animation (the design's load-then-draw beat):
 *   1. Brahma FLICKERS on first (neon-tube style, not a fade).
 *   2. The grid lines + concentric circles draw themselves (stroke pathLength).
 *   3. The component specimens pop in, staggered.
 *
 * Accessibility: the entire layer is decorative — aria-hidden + inert (removes
 * it from the a11y tree AND focus order, so the real Switch inside is never a
 * tab target) + pointer-events-none. It honours prefers-reduced-motion: with
 * reduced motion every element renders at its FINAL state with no transition,
 * and nothing is ever gated on an animation firing.
 */

import { useMemo } from 'react'
import { motion, useReducedMotion, type Variants } from 'framer-motion'
import { IconLink } from '@tabler/icons-react'
import { Avatar, AvatarFallback } from '@devalok/shilp-sutra/ui/avatar'
import { Switch } from '@devalok/shilp-sutra/ui/switch'

import { BrahmaArt } from './brahma-art'

// ── Source-frame geometry (px in the 1920×1080 Figma frame) ──────────────────
const FRAME_W = 1920
const FRAME_H = 1080

// Exact identity palette sampled from the Figma frame.
const C = {
  teal: '#33C9BF',
  tealLight: '#9AE3DC',
  tealText: '#0B6B63',
  blue: '#1B77D6',
  lime: '#D5EF72',
  ink: '#100F0F',
  inkFg: '#E3E3E3',
}

const V_LINES = [50.41, 231.54, 308.36, 969.84, 1175.34, 1279.69, 1553.06, 1869.52]
const H_LINES = [85.82, 190.3, 313.17, 733.26, 810.08, 886.33, 1046.22]

// Concentric circles — ALL six share a single origin point O (they are mutually
// internally tangent there, so they radiate/ripple from one spot). Three open
// right, three open left; each cx = O.x ± r, cy = O.y.
const ORIGIN = { x: 1180, y: 558 }
const CIRCLE_RADII = [767.75, 593.86, 463.43]
const CIRCLES = [
  ...CIRCLE_RADII.map((r) => ({ cx: ORIGIN.x + r, cy: ORIGIN.y, r })),
  ...CIRCLE_RADII.map((r) => ({ cx: ORIGIN.x - r, cy: ORIGIN.y, r })),
]

// Faint tinted zones. The tall left zone from the source frame is dropped — it
// sat directly behind the headline and read as a stray panel.
const ZONES = [
  { x: 311.43, y: 886.33, w: 658.41, h: 380.57, fill: 'var(--color-secondary-3)', o: 0.3 },
  { x: 1553.98, y: -7.53, w: 546.57, h: 323.7, fill: 'var(--color-accent-3)', o: 0.4 },
]

// Construction geometry stroke — the theme-aware hairline (var --hero-line:
// #EAEAEA in light, faint white in dark). Set in app/globals.css.
const HAIRLINE = 'var(--hero-line)'

// Strong ease-out (Emil Kowalski's UI curve) — no overshoot/bounce.
const EASE_OUT = [0.23, 1, 0.32, 1] as const

// Percent helpers relative to the source frame.
const px = (n: number) => `${(n / FRAME_W) * 100}%`
const py = (n: number) => `${(n / FRAME_H) * 100}%`

// ── Component specimens: real DS components + exact-hex token swatches ────────
type Chip = { id: string; left: number; top: number; node: React.ReactNode; lg?: boolean }

const swatch = (size: string, color: string, border = false) => (
  <div
    className={`${size} rounded-control shadow-raised`}
    style={{ background: color, ...(border ? { boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.12)' } : null) }}
  />
)

const chips: Chip[] = [
  { id: 'switch', left: 66, top: 93, node: <Switch checked size="lg" /> },
  { id: 'sq-teal', left: 239, top: 48, node: swatch('size-8', C.teal) },
  {
    id: 'avatar',
    left: 1179,
    top: 89,
    node: (
      <Avatar size="lg">
        <AvatarFallback style={{ background: C.tealLight, color: C.tealText }}>KI</AvatarFallback>
      </Avatar>
    ),
  },
  { id: 'sq-blue', left: 982, top: 272, node: swatch('size-8', C.blue) },
  {
    id: 'learn',
    left: 972,
    top: 736,
    lg: true,
    node: (
      <span
        className="inline-flex select-none items-center rounded-control px-ds-04 py-ds-03 text-ds-sm font-medium shadow-raised"
        style={{ background: C.lime, color: C.ink }}
      >
        Learn More
      </span>
    ),
  },
  { id: 'sq-lime', left: 928, top: 821, lg: true, node: swatch('size-8', C.lime) },
  {
    // Nudged into the clear bottom-left corner (below the trust row) — the
    // source position sat under the hero copy, which its empty canvas didn't.
    id: 'link',
    left: 70,
    top: 958,
    lg: true,
    node: (
      <div
        className="flex size-[4.5rem] items-center justify-center rounded-control shadow-raised"
        style={{ background: C.ink, color: C.inkFg }}
      >
        <IconLink size={30} />
      </div>
    ),
  },
  { id: 'sq-black', left: 178, top: 1035, lg: true, node: swatch('size-8', C.ink) },
  // Small stack riding the deity's right arm (source rects 6681–6684).
  { id: 'arm-blue', left: 1831, top: 611, lg: true, node: swatch('size-5', C.blue) },
  { id: 'arm-lime', left: 1831, top: 645, lg: true, node: swatch('size-5', C.lime) },
  { id: 'arm-black', left: 1831, top: 679, lg: true, node: swatch('size-5', C.ink) },
  { id: 'arm-white', left: 1831, top: 712, lg: true, node: swatch('size-5', '#FFFFFF', true) },
]

export function BrahmaBackdrop() {
  const reduce = useReducedMotion()

  // Lines/circles draw themselves on (pathLength), staggered/harmonic. Stroke
  // colour is the theme-aware hairline var (set on the element), so it adapts to
  // dark and to a live theme toggle.
  const drawInitial = reduce ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }
  const drawAnimate = { pathLength: 1, opacity: 1 }
  const drawTransition = (delay: number, dur: number) =>
    reduce
      ? { duration: 0 }
      : {
          pathLength: { duration: dur, delay, ease: EASE_OUT },
          opacity: { duration: 0.25, delay },
        }

  // Per-line timing for the CSS stroke-colour draw (class .hero-line-anim in
  // globals). Custom props survive framer's style merge; the class (not inline
  // animation) survives framer's inline-style writes. Hold the trace a touch
  // past the pathLength draw so it reads dark before settling.
  const strokeVars = (delay: number, dur: number): React.CSSProperties =>
    ({ ['--sdelay' as string]: `${delay}s`, ['--sdur' as string]: `${dur + 0.9}s` }) as React.CSSProperties

  const chipVariants: Variants = {
    hidden: reduce ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.92 },
    shown: { opacity: 1, scale: 1 },
  }

  // Randomised reveal order — the specimens pop in scattered, not left-to-right.
  // Computed once on mount so re-renders don't reshuffle mid-animation.
  const chipDelays = useMemo(
    () => chips.map(() => 2.9 + Math.random() * 1.2),
    [],
  )

  return (
    <div aria-hidden inert className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Construction geometry — grid + concentric circles, behind the deity. */}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox={`0 0 ${FRAME_W} ${FRAME_H}`}
        preserveAspectRatio="xMidYMid slice"
        fill="none"
      >
        {ZONES.map((z, i) => (
          <motion.rect
            key={`zone-${i}`}
            x={z.x}
            y={z.y}
            width={z.w}
            height={z.h}
            rx={44}
            fill={z.fill}
            initial={{ opacity: reduce ? z.o : 0 }}
            animate={{ opacity: z.o }}
            transition={{ duration: reduce ? 0 : 0.8, delay: reduce ? 0 : 0.2 }}
          />
        ))}

        {V_LINES.map((x, i) => {
          const delay = 0.8 + i * 0.11
          const dur = 1.35 + (i % 4) * 0.14
          return (
            <motion.line
              key={`v-${i}`}
              x1={x}
              y1={-50}
              x2={x}
              y2={FRAME_H + 50}
              stroke={HAIRLINE}
              strokeWidth={1.25}
              className="hero-line-anim"
              style={strokeVars(delay, dur)}
              initial={drawInitial}
              animate={drawAnimate}
              transition={drawTransition(delay, dur)}
            />
          )
        })}
        {H_LINES.map((y, i) => {
          const delay = 0.8 + (V_LINES.length + i) * 0.11
          const dur = 1.35 + ((V_LINES.length + i) % 4) * 0.14
          return (
            <motion.line
              key={`h-${i}`}
              x1={-20}
              y1={y}
              x2={FRAME_W + 20}
              y2={y}
              stroke={HAIRLINE}
              strokeWidth={1.25}
              className="hero-line-anim"
              style={strokeVars(delay, dur)}
              initial={drawInitial}
              animate={drawAnimate}
              transition={drawTransition(delay, dur)}
            />
          )
        })}

        {CIRCLES.map((c, i) => {
          const delay = 1.7 + i * 0.2
          const dur = 2.1 + (i % 3) * 0.2
          return (
            <motion.circle
              key={`c-${i}`}
              cx={c.cx}
              cy={c.cy}
              r={c.r}
              stroke={HAIRLINE}
              strokeWidth={1.5}
              className="hero-line-anim"
              style={strokeVars(delay, dur)}
              initial={drawInitial}
              animate={drawAnimate}
              transition={drawTransition(delay, dur)}
            />
          )
        })}
      </svg>

      {/* Brahma — inlined vector; its two duotone fills bind to the brand accent
          tokens, so the deity recolours with the theme AND the brand switcher.
          The per-path fill transition animates the recolour. Flickers on LAST,
          after the geometry + specimens. Bleeds off the bottom-right corner. */}
      <motion.div
        className="absolute bottom-[-6%] right-[-5%] aspect-[1065/1514] h-[70%] select-none sm:h-[82%] lg:bottom-[-8%] lg:right-[-7%] lg:h-[106%] [&_path]:transition-[fill] [&_path]:duration-500 [&_path]:ease-out"
        style={{ transformOrigin: 'bottom right' }}
        initial={{ opacity: reduce ? 0.92 : 0 }}
        animate={{ opacity: reduce ? 0.92 : [0, 0.75, 0.12, 0.92, 0.35, 0.92, 0.6, 0.92] }}
        transition={
          reduce
            ? { duration: 0 }
            : {
                duration: 1.05,
                delay: 3.6,
                times: [0, 0.09, 0.16, 0.28, 0.4, 0.52, 0.7, 1],
                ease: EASE_OUT,
              }
        }
      >
        <BrahmaArt />
      </motion.div>

      {/* Mobile/tablet scrim — softens the busy backdrop so the centred hero
          copy stays legible; disappears at lg where copy moves to a left column
          clear of the deity. */}
      <div className="absolute inset-0 bg-surface-base/70 lg:hidden" />

      {/* Component specimens — in front of the deity. Desktop composition only;
          the source frame's chip placement assumes the wide, sparse canvas. */}
      <div className="absolute inset-0 hidden lg:block">
        {chips.map((chip, i) => (
          <motion.div
            key={chip.id}
            className="absolute"
            style={{ left: px(chip.left), top: py(chip.top) }}
            variants={chipVariants}
            initial="hidden"
            animate="shown"
            transition={{
              duration: reduce ? 0 : 0.24,
              delay: reduce ? 0 : chipDelays[i],
              ease: EASE_OUT,
            }}
          >
            {chip.node}
          </motion.div>
        ))}
      </div>
    </div>
  )
}
