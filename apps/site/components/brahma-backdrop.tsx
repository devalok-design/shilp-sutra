'use client'

/**
 * BrahmaBackdrop — the shilp-sutra visual-identity hero background.
 *
 * The grid is FUNCTIONAL, not decorative: it's a uniform square grid anchored to
 * the hero content container's left edge (measured live), so the headline's left
 * edge sits exactly on a grid line, the concentric-circle origin sits on a grid
 * intersection, and every floating specimen snaps to a cell. Everything shares
 * one coordinate system: gx0 (container-left, px) + CELL (px).
 *
 * Layers, back→front: grid → tinted zones → concentric circles (draw on, from a
 * single grid-point origin) → Brahma (flickers in last) → component specimens.
 *
 * Decorative: aria-hidden + inert + pointer-events-none. Honours reduced motion.
 */

import { useEffect, useMemo, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { motion, useReducedMotion, type Variants } from 'framer-motion'
import { IconLink } from '@tabler/icons-react'
import { Avatar, AvatarFallback } from '@devalok/shilp-sutra/ui/avatar'
import { Switch } from '@devalok/shilp-sutra/ui/switch'

const BrahmaArt = dynamic(() => import('./brahma-art').then((m) => m.BrahmaArt), { ssr: false })

// Grid cell (px). Everything geometric is a multiple of this.
const CELL = 88
// Concentric-circle origin — an integer cell so it lands on a grid INTERSECTION.
const ORIGIN_COL = 10
const ORIGIN_ROW = 5
// Circle radii, in cells. Three circles opening right + three opening left, all
// internally tangent at the origin (they "ripple" from one grid point).
const RADII_CELLS = [3.4, 4.9, 6.6]

const EASE_OUT = [0.23, 1, 0.32, 1] as const
const HAIRLINE = 'var(--hero-line)'

// Exact identity palette (fixed specimens). Accent-bound swatches use tokens.
const C = {
  teal: '#33C9BF',
  tealLight: '#9AE3DC',
  tealText: '#0B6B63',
  blue: '#1B77D6',
  lime: '#D5EF72',
  ink: '#100F0F',
  inkFg: '#E3E3E3',
}

const swatch = (size: string, color: string, border = false) => (
  <div
    className={`${size} rounded-control shadow-raised`}
    style={{
      background: color,
      transition: 'background-color 450ms ease',
      ...(border ? { boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.12)' } : null),
    }}
  />
)

// Specimens, placed at grid intersections (col, row from container-left / top).
type Chip = { id: string; col: number; row: number; node: React.ReactNode; lg?: boolean }
const chips: Chip[] = [
  { id: 'switch', col: 0, row: 0.5, node: <Switch checked size="lg" /> },
  { id: 'sq-teal', col: 2, row: 0, node: swatch('size-8', C.teal) },
  {
    id: 'avatar',
    col: 8,
    row: 0.5,
    node: (
      <Avatar size="lg">
        <AvatarFallback style={{ background: C.tealLight, color: C.tealText }}>KI</AvatarFallback>
      </Avatar>
    ),
  },
  { id: 'sq-blue', col: 6, row: 2, node: swatch('size-8', C.blue) },
  {
    id: 'learn',
    col: 7,
    row: 6,
    lg: true,
    node: (
      <span
        className="inline-flex select-none items-center rounded-control px-ds-04 py-ds-03 text-ds-sm font-medium opacity-45"
        style={{ background: C.lime, color: C.ink }}
      >
        Learn More
      </span>
    ),
  },
  { id: 'sq-lime', col: 6, row: 7, lg: true, node: swatch('size-8', C.lime) },
  {
    id: 'link',
    col: 0,
    row: 8,
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
  { id: 'sq-black', col: 2, row: 9, lg: true, node: swatch('size-8', C.ink) },
  // Right-arm stack — a mini ramp of the ACTIVE accent (recolours with preset).
  { id: 'arm-1', col: 15, row: 5, lg: true, node: swatch('size-5', 'var(--color-accent-11)') },
  { id: 'arm-2', col: 15, row: 5.4, lg: true, node: swatch('size-5', 'var(--color-accent-9)') },
  { id: 'arm-3', col: 15, row: 5.8, lg: true, node: swatch('size-5', 'var(--color-accent-7)') },
  { id: 'arm-4', col: 15, row: 6.2, lg: true, node: swatch('size-5', 'var(--color-accent-5)') },
]

// Faint tinted zones, snapped to cells: { col, row, wCells, hCells, fill, o }.
const ZONES = [
  { col: 1, row: 9, w: 7, h: 4, fill: 'var(--color-secondary-3)', o: 0.3 },
  { col: 16, row: 0, w: 6, h: 3, fill: 'var(--color-accent-3)', o: 0.4 },
]

export function BrahmaBackdrop() {
  const reduce = useReducedMotion()
  const measureRef = useRef<HTMLDivElement>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const [gx0, setGx0] = useState<number | null>(null)
  const [size, setSize] = useState<{ w: number; h: number }>({ w: 0, h: 0 })

  // Measure the content container's left edge → the grid's x-origin, and the
  // backdrop's own size → how many grid lines to draw. Keeps grid, circles and
  // specimens locked to where the copy actually starts.
  useEffect(() => {
    const measure = () => {
      if (measureRef.current) setGx0(measureRef.current.getBoundingClientRect().left)
      if (rootRef.current) {
        const r = rootRef.current.getBoundingClientRect()
        setSize({ w: r.width, h: r.height })
      }
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  const ready = gx0 !== null && size.w > 0

  // Grid line positions (px), aligned to the container-left origin (gx0).
  const vLines: number[] = []
  const hLines: number[] = []
  if (ready) {
    const startX = gx0 - Math.ceil(gx0 / CELL) * CELL
    for (let x = startX; x <= size.w; x += CELL) vLines.push(x)
    for (let y = 0; y <= size.h; y += CELL) hLines.push(y)
  }
  const ox = ready ? gx0 + ORIGIN_COL * CELL : 0
  const oy = ORIGIN_ROW * CELL

  const strokeInitial = reduce ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }
  const chipVariants: Variants = {
    hidden: reduce ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.92 },
    shown: { opacity: 1, scale: 1 },
  }
  const chipDelays = useMemo(() => chips.map(() => 2.9 + Math.random() * 1.2), [])

  // A5 — replay the whole entrance when the theme is toggled on this page.
  // ThemeToggle dispatches 'ss-theme-change'; bumping this key remounts the
  // animated layers so they draw from scratch in the new theme.
  const [replay, setReplay] = useState(0)
  useEffect(() => {
    const onThemeChange = () => setReplay((n) => n + 1)
    window.addEventListener('ss-theme-change', onThemeChange)
    return () => window.removeEventListener('ss-theme-change', onThemeChange)
  }, [])

  const px = (col: number) => (ready ? `${gx0 + col * CELL}px` : '-9999px')
  const py = (row: number) => `${row * CELL}px`

  return (
    <div ref={rootRef} aria-hidden inert className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Invisible probe that mirrors the hero content container, so we can read
          its left edge and anchor the grid to it. */}
      <div className="absolute inset-x-0 top-0 mx-auto max-w-[96rem] px-page-x">
        <div ref={measureRef} className="h-0 w-0" />
      </div>

      {/* Keyed wrapper — remounts on theme toggle to replay the entrance (A5). */}
      <div key={replay} style={{ display: 'contents' }}>
      {/* SVG in raw px (no viewBox) so circles are true circles at grid coords. */}
      {ready && (
        <svg className="absolute inset-0 h-full w-full" fill="none">
          {/* Functional grid — real SVG lines that DRAW themselves (pathLength),
              in dark trace → settle to faint hairline. Staggered outward from the
              circle origin so the grid builds from the centre. */}
          {vLines.map((x, i) => {
            const dist = Math.abs(x - ox)
            const delay = 0.3 + (dist / CELL) * 0.06
            return (
              <motion.line
                key={`v-${i}`}
                x1={x}
                y1={0}
                x2={x}
                y2={size.h}
                stroke={HAIRLINE}
                strokeWidth={1}
                className={reduce ? undefined : 'hero-line-anim'}
                style={reduce ? undefined : ({ ['--sdelay' as string]: `${delay}s`, ['--sdur' as string]: '1.4s' } as React.CSSProperties)}
                initial={strokeInitial}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={reduce ? { duration: 0 } : { pathLength: { duration: 0.7, delay, ease: EASE_OUT }, opacity: { duration: 0.2, delay } }}
              />
            )
          })}
          {hLines.map((y, i) => {
            const dist = Math.abs(y - oy)
            const delay = 0.3 + (dist / CELL) * 0.06
            return (
              <motion.line
                key={`h-${i}`}
                x1={0}
                y1={y}
                x2={size.w}
                y2={y}
                stroke={HAIRLINE}
                strokeWidth={1}
                className={reduce ? undefined : 'hero-line-anim'}
                style={reduce ? undefined : ({ ['--sdelay' as string]: `${delay}s`, ['--sdur' as string]: '1.4s' } as React.CSSProperties)}
                initial={strokeInitial}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={reduce ? { duration: 0 } : { pathLength: { duration: 0.7, delay, ease: EASE_OUT }, opacity: { duration: 0.2, delay } }}
              />
            )
          })}
          {ZONES.map((z, i) => (
            <motion.rect
              key={`zone-${i}`}
              x={gx0 + z.col * CELL}
              y={z.row * CELL}
              width={z.w * CELL}
              height={z.h * CELL}
              rx={24}
              fill={z.fill}
              initial={{ opacity: reduce ? z.o : 0 }}
              animate={{ opacity: z.o }}
              transition={{ duration: reduce ? 0 : 0.8, delay: reduce ? 0 : 0.4 }}
            />
          ))}
          {RADII_CELLS.map((rc, i) => {
            const r = rc * CELL
            const delay = 1.3 + i * 0.22
            const dur = 2.1 + (i % 3) * 0.2
            return (
              <g key={`c-${i}`}>
                {/* opening right (center to the right of origin). The
                    hero-line-anim class draws the stroke in DARK, then settles
                    to the faint hairline (--sdelay/--sdur sync to pathLength). */}
                <motion.circle
                  cx={ox + r}
                  cy={oy}
                  r={r}
                  stroke={HAIRLINE}
                  strokeWidth={1.25}
                  className={reduce ? undefined : 'hero-line-anim'}
                  style={reduce ? undefined : ({ ['--sdelay' as string]: `${delay}s`, ['--sdur' as string]: `${dur + 0.9}s` } as React.CSSProperties)}
                  initial={strokeInitial}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={
                    reduce
                      ? { duration: 0 }
                      : { pathLength: { duration: dur, delay, ease: EASE_OUT }, opacity: { duration: 0.25, delay } }
                  }
                />
                {/* opening left (center to the left of origin) */}
                <motion.circle
                  cx={ox - r}
                  cy={oy}
                  r={r}
                  stroke={HAIRLINE}
                  strokeWidth={1.25}
                  className={reduce ? undefined : 'hero-line-anim'}
                  style={reduce ? undefined : ({ ['--sdelay' as string]: `${delay + 0.1}s`, ['--sdur' as string]: `${dur + 0.9}s` } as React.CSSProperties)}
                  initial={strokeInitial}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={
                    reduce
                      ? { duration: 0 }
                      : { pathLength: { duration: dur, delay: delay + 0.1, ease: EASE_OUT }, opacity: { duration: 0.25, delay: delay + 0.1 } }
                  }
                />
              </g>
            )
          })}
        </svg>
      )}

      {/* Brahma — flickers on LAST, bleeding off the bottom-right corner. */}
      <motion.div
        className="absolute bottom-[-6%] right-[-5%] aspect-[1065/1514] h-[70%] select-none sm:h-[82%] lg:bottom-[-8%] lg:right-[-7%] lg:h-[104%] [&_path]:transition-[fill] [&_path]:duration-500 [&_path]:ease-out"
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

      {/* Mobile/tablet scrim — softens the busy backdrop for centred copy. */}
      <div className="absolute inset-0 bg-surface-base/70 lg:hidden" />

      {/* Specimens — grid-snapped, desktop composition only. */}
      {ready && (
        <div className="absolute inset-0 hidden lg:block">
          {chips.map((chip, i) => (
            <motion.div
              key={chip.id}
              className="absolute"
              style={{ left: px(chip.col), top: py(chip.row) }}
              variants={chipVariants}
              initial="hidden"
              animate="shown"
              transition={{ duration: reduce ? 0 : 0.24, delay: reduce ? 0 : chipDelays[i], ease: EASE_OUT }}
            >
              {chip.node}
            </motion.div>
          ))}
        </div>
      )}
      </div>
    </div>
  )
}
