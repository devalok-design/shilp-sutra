'use client'

import { motion, AnimatePresence } from 'framer-motion'
import * as React from 'react'

// ── Types ──────────────────────────────────────────────────────────

export type ProcessingSpeed = 'ambient' | 'working' | 'urgent'

export interface ProcessingOverlayProps {
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

  // Read the button's dimensions + border-radius, compute dash pattern
  React.useEffect(() => {
    const wrapper = svgRef.current?.closest('span')
    const btnEl = wrapper?.previousElementSibling as HTMLElement | null
    if (!btnEl) return

    const style = getComputedStyle(btnEl)
    const rawR = parseFloat(style.borderRadius) || 8
    const w = btnEl.offsetWidth - 2
    const h = btnEl.offsetHeight - 2
    // Cap radius at half the shorter dimension (pill buttons report 9999px)
    const r = Math.min(rawR, h / 2, w / 2)
    setBorderRadius(r)

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
  }, [active])

  return (
    <AnimatePresence>
      {active && (
        <motion.span
          key="processing-ants"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
        >
          <svg
            className="absolute inset-0 w-full h-full"
            style={{ overflow: 'visible' }}
          >
            <motion.rect
              ref={svgRef}
              x="1"
              y="1"
              width="calc(100% - 2px)"
              height="calc(100% - 2px)"
              rx={borderRadius}
              ry={borderRadius}
              fill="none"
              stroke={solidColor}
              strokeWidth="2"
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
