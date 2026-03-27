'use client'

import { motion, AnimatePresence } from 'framer-motion'
import * as React from 'react'

// ── Types ──────────────────────────────────────────────────────────

export type ProcessingSpeed = 'ambient' | 'working' | 'urgent'
export type ProcessingStyleType = 'ants' | 'glow'

export interface ProcessingOverlayProps {
  active: boolean
  speed: ProcessingSpeed
  style: ProcessingStyleType
  /** Resolved color name — maps to CSS token `--color-{name}-9` */
  color: string
}

// ── Color mapping ──────────────────────────────────────────────────

const COLOR_MAP: Record<string, string> = {
  accent:  'var(--color-accent-9)',
  error:   'var(--color-error-9)',
  success: 'var(--color-success-9)',
  warning: 'var(--color-warning-9)',
  neutral: 'var(--color-neutral-9)',
}

// ── Speed → duration ───────────────────────────────────────────────

const SPEED_DURATION: Record<ProcessingSpeed, string> = {
  ambient: '3s',
  working: '2s',
  urgent:  '1s',
}

// ── Component ──────────────────────────────────────────────────────

/**
 * Internal overlay component for button processing state.
 * Renders either a rotating conic-gradient border ("ants") or a breathing
 * box-shadow ("glow"). Not exported from the barrel — used only by Button.
 *
 * Animations are defined in semantic.css as real CSS @keyframes + @property
 * (Tailwind's JS keyframes can't animate registered custom properties).
 */
export function ProcessingOverlay({ active, speed, style, color }: ProcessingOverlayProps) {
  const solidColor = COLOR_MAP[color] ?? COLOR_MAP.accent

  if (style === 'glow') {
    return <GlowOverlay active={active} speed={speed} color={solidColor} />
  }
  return <AntsOverlay active={active} speed={speed} color={solidColor} />
}

// ── Ants (rotating conic-gradient border) ──────────────────────────

function AntsOverlay({
  active,
  speed,
  color,
}: {
  active: boolean
  speed: ProcessingSpeed
  color: string
}) {
  const prefersReduced = useReducedMotion()
  const duration = SPEED_DURATION[speed]

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
          className="absolute inset-0 z-[3] pointer-events-none"
          style={{
            borderRadius: 'inherit',
            // 4 gradient strips — one per edge — creating marching dashes
            backgroundImage: [
              `repeating-linear-gradient(90deg, ${color} 0 4px, transparent 4px 8px)`,   // top
              `repeating-linear-gradient(0deg, ${color} 0 4px, transparent 4px 8px)`,    // right
              `repeating-linear-gradient(90deg, ${color} 0 4px, transparent 4px 8px)`,   // bottom
              `repeating-linear-gradient(0deg, ${color} 0 4px, transparent 4px 8px)`,    // left
            ].join(', '),
            backgroundSize: '8px 1.5px, 1.5px 8px, 8px 1.5px, 1.5px 8px',
            backgroundPosition: '0 0, 100% 0, 100% 100%, 0 100%',
            backgroundRepeat: 'repeat-x, repeat-y, repeat-x, repeat-y',
            animation: prefersReduced ? 'none' : `processing-ants-march ${duration} linear infinite`,
          }}
        />
      )}
    </AnimatePresence>
  )
}

// ── Glow (breathing box-shadow) ────────────────────────────────────

function GlowOverlay({
  active,
  speed,
  color,
}: {
  active: boolean
  speed: ProcessingSpeed
  color: string
}) {
  const prefersReduced = useReducedMotion()
  const duration = SPEED_DURATION[speed]
  const glowColor = `color-mix(in oklch, ${color} 25%, transparent)`

  return (
    <AnimatePresence>
      {active && (
        <motion.span
          key="processing-glow"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: 0.2 } }}
          exit={{ opacity: 0, scale: 1.05, transition: { duration: 0.3 } }}
          aria-hidden="true"
          className="absolute inset-0 z-[3] rounded-[inherit] pointer-events-none"
          style={{
            '--processing-glow-color': glowColor,
            ...(prefersReduced
              ? { boxShadow: `0 0 4px 1px ${glowColor}` }
              : { animation: `processing-glow-pulse ${duration} ease-in-out infinite` }),
          } as unknown as React.CSSProperties}
        />
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
