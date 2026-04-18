'use client'

import { motion, AnimatePresence } from 'framer-motion'
import * as React from 'react'
import { durations } from './lib/motion'

// ── Types ──────────────────────────────────────────────────────────

export type ProcessingSpeed = 'ambient' | 'working' | 'urgent'

interface ProcessingOverlayProps {
  active: boolean
  speed: ProcessingSpeed
  /** Resolved color name — maps to CSS token `--color-{name}-9` */
  color: string
}

// ── Color mapping ──────────────────────────────────────────────────

// Use text-level color tokens (step 11) so ants match the button's text color.
// This ensures visibility on all variants — especially neutral where step-9 is too close to the soft bg.
const COLOR_MAP: Record<string, string> = {
  accent:  'var(--color-accent-11)',
  error:   'var(--color-error-11)',
  success: 'var(--color-success-11)',
  warning: 'var(--color-warning-11)',
  neutral: 'var(--color-surface-fg)',
}

// ── Speed → duration (seconds) ─────────────────────────────────────

const SPEED_SECONDS: Record<ProcessingSpeed, number> = {
  ambient: 3,
  working: 2,
  urgent:  1,
}

// ── Component ──────────────────────────────────────────────────────

/**
 * Internal overlay component for button processing state.
 * Renders marching ants (SVG dashed rect with animated stroke-dashoffset).
 * Not exported from the barrel — used only by Button.
 */
export function ProcessingOverlay({ active, speed, color }: ProcessingOverlayProps) {
  const solidColor = COLOR_MAP[color] ?? COLOR_MAP.accent
  const prefersReduced = useReducedMotion()
  const duration = SPEED_SECONDS[speed]
  const svgRef = React.useRef<SVGRectElement>(null)
  const [borderRadius, setBorderRadius] = React.useState(8)
  const [dashInfo, setDashInfo] = React.useState({ array: '8 6', cycle: 14 })
  // Explicit pixel dimensions of the button — drives BOTH the SVG box and the
  // rect geometry. Relying on CSS `w-full`/`calc(100% - 2px)` made the ants'
  // outline depend on the wrapper's rendered size, which can drift from the
  // button's own size during width transitions — leaving a visible gap
  // between the button edge and the ants.
  const [size, setSize] = React.useState<{ w: number; h: number } | null>(null)

  // Read the button's dimensions + border-radius, compute dash pattern
  React.useEffect(() => {
    const wrapper = svgRef.current?.closest('span')
    const btnEl = wrapper?.previousElementSibling as HTMLElement | null
    if (!btnEl) return

    const measure = () => {
      const style = getComputedStyle(btnEl)
      const rawR = parseFloat(style.borderRadius) || 8
      const btnW = btnEl.offsetWidth
      const btnH = btnEl.offsetHeight
      if (btnW === 0 || btnH === 0) return
      // Inset 1px so the 2px stroke (centered on the edge) lands exactly on
      // the button's visual border instead of outside it.
      const w = btnW - 2
      const h = btnH - 2
      // Cap radius at half the shorter dimension (pill buttons report 9999px)
      const r = Math.min(rawR, h / 2, w / 2)
      setBorderRadius(r)
      setSize({ w: btnW, h: btnH })

      // Perimeter of a rounded rect:
      // 4 straight edges + 4 quarter-circle arcs (= one full circle of radius r)
      const perimeter = 2 * (w - 2 * r) + 2 * (h - 2 * r) + 2 * Math.PI * r

      // Target: 8px dash, 6px gap — adjust gap so dashes fit evenly (no seam)
      const dashPx = 8
      const gapPx = 6
      const approxCycle = dashPx + gapPx
      const count = Math.round(perimeter / approxCycle)
      const adjustedGap = (perimeter - count * dashPx) / count
      const finalGap = Math.max(2, adjustedGap)
      setDashInfo({ array: `${dashPx} ${finalGap.toFixed(1)}`, cycle: dashPx + finalGap })
    }

    measure()
    // Keep the ants glued to the button when it resizes (text change,
    // async-feedback icon swap, layout animation settling).
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null
    ro?.observe(btnEl)
    return () => ro?.disconnect()
  }, [active])

  // Render the overlay even before the first measurement settles — the
  // aria-hidden anchor must exist for discoverability, and the SVG harmlessly
  // renders at 0x0 until measurement lands a real size (one animation frame).
  const w = size?.w ?? 0
  const h = size?.h ?? 0

  return (
    <AnimatePresence>
      {active && (
        <motion.span
          key="processing-ants"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: durations.moderate01b }}
          aria-hidden="true"
          className="absolute top-0 left-0 pointer-events-none"
          style={{ width: w, height: h }}
        >
          <svg
            width={w}
            height={h}
            style={{ overflow: 'visible', display: 'block' }}
          >
            <motion.rect
              ref={svgRef}
              x={1}
              y={1}
              width={Math.max(0, w - 2)}
              height={Math.max(0, h - 2)}
              rx={borderRadius}
              ry={borderRadius}
              fill="none"
              stroke={solidColor}
              strokeWidth={2}
              strokeDasharray={dashInfo.array}
              style={{ transition: 'stroke 0.3s ease' }}
              animate={prefersReduced ? {} : { strokeDashoffset: [0, -dashInfo.cycle] }}
              transition={prefersReduced ? {} : {
                duration,
                ease: 'linear',
                repeat: Infinity,
              }}
            />
          </svg>
        </motion.span>
      )}
    </AnimatePresence>
  )
}

// ── Reduced motion hook ────────────────────────────────────────────

function useReducedMotion(): boolean {
  const [reduced, setReduced] = React.useState(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  })

  React.useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches)
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [])

  return reduced
}
